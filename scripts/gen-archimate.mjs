#!/usr/bin/env node
/**
 * ArchiMate generator (cell-based source pattern).
 *
 * Reads the cell files under archimate/<use-case>/, validates every element and
 * relationship against archimate/_vocabulary.md, and emits:
 *   - a PlantUML ArchiMate block (diagram-as-code) between markers in the use
 *     case doc, or to stdout with --emit stdout;
 *   - a Markdown 4x4 Service Layer x Aspect matrix with populated cells and "—"
 *     for empty cells (the derived matrix view).
 *   - a self-contained HTML fragment (Jekyll include) with an ArchiMate grid,
 *     KB/RELS JSON and inline element boxes, rendered by assets/js/archimate-browser.js.
 *
 * Usage:
 *   node scripts/gen-archimate.mjs <use-case>                 # write block into docs
 *   node scripts/gen-archimate.mjs <use-case> --check         # exit non-zero if committed block differs
 *   node scripts/gen-archimate.mjs <use-case> --emit stdout   # print PlantUML to stdout
 *   node scripts/gen-archimate.mjs <use-case> --emit matrix   # print the Markdown matrix to stdout
 *   node scripts/gen-archimate.mjs <use-case> --emit html     # write HTML fragment to _includes/use-cases/<use-case>.html
 *
 * Zero external dependencies: frontmatter YAML is parsed by a minimal inline parser.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ARCH = join(ROOT, 'archimate');

// ─── minimal YAML frontmatter parser (subset: scalars, inline lists, block lists) ───

function parseFrontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!m) throw new Error('no frontmatter found');
  return parseYamlBlock(m[1]);
}

function parseYamlBlock(src) {
  const obj = {};
  let i = 0;
  const lines = src.split(/\r?\n/);
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const kv = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line);
    if (!kv) { i++; continue; }
    const key = kv[1];
    const rest = kv[2].trim();
    if (rest === '') {
      // block list or nested map; we only support block list of inline maps here
      const items = [];
      i++;
      while (i < lines.length && /^\s+-\s/.test(lines[i])) {
        const itemLine = lines[i].replace(/^\s+-\s/, '').trim();
        if (itemLine.startsWith('{') && itemLine.endsWith('}')) {
          items.push(parseInlineMap(itemLine));
        } else {
          // could be "key: value" start of a block map item
          const sub = {};
          if (/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.test(itemLine)) {
            const sm = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(itemLine);
            sub[sm[1]] = scalar(sm[2].trim());
            i++;
            while (i < lines.length && /^\s{4,}\S/.test(lines[i])) {
              const sm2 = /^\s+([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(lines[i]);
              if (sm2) sub[sm2[1]] = scalar(sm2[2].trim());
              i++;
            }
            items.push(sub);
          } else {
            items.push(scalar(itemLine));
            i++;
          }
        }
      }
      obj[key] = items;
      // i already points to the next non-list line; do not advance again
      continue;
    } else {
      obj[key] = scalar(rest);
    }
    i++;
  }
  return obj;
}

function scalar(v) {
  if (v.startsWith('[') && v.endsWith(']')) {
    return v.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  }
  return v.replace(/^["']|["']$/g, '');
}

function parseInlineMap(s) {
  // { id: x, type: y, name: z }
  const body = s.replace(/^\{|\}$/g, '');
  const out = {};
  for (const part of body.split(',')) {
    const mm = /^\s*([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(part);
    if (mm) out[mm[1]] = scalar(mm[2].trim());
  }
  return out;
}

// ─── vocabulary ───

function loadVocabulary() {
  const text = readFileSync(join(ARCH, '_vocabulary.md'), 'utf8');
  // parse the "Element types by (layer, aspect)" tables and the relationship table
  const vocab = { elements: {}, relationships: new Set() };
  const relTable = /## Relationship types[\s\S]*?(?=\n## )/.exec(text)[0];
  for (const line of relTable.split(/\r?\n/)) {
    const m = /^\|\s*`([\w-]+)`/.exec(line);
    if (m) vocab.relationships.add(m[1]);
  }
  // element types: gather from all tables under ### Motivation / ### <Layer>
  const section = /## Element types by[\s\S]*?(?=\n## )/.exec(text)[0];
  let currentLayer = null;
  let currentAspect = null;
  for (const line of section.split(/\r?\n/)) {
    const lm = /^### (\w+)/.exec(line);
    if (lm) {
      currentLayer = lm[1] === 'Motivation' ? 'motivation' : lm[1].toLowerCase();
      currentAspect = lm[1] === 'Motivation' ? 'motivation' : null;
      continue;
    }
    const am = /^\| (active-structure|behaviour|passive-structure|Motivation) \|/.exec(line);
    if (am) { currentAspect = am[1]; continue; }
    // inline code-fence list line (e.g. "`goal`, `outcome`, ...") under Motivation
    if (currentLayer === 'motivation' && /`[\w-]+`/.test(line) && !line.startsWith('|')) {
      const types = line.match(/`[\w-]+`/g).map((t) => t.replace(/`/g, ''));
      const key = 'motivation/motivation';
      vocab.elements[key] = vocab.elements[key] || [];
      vocab.elements[key].push(...types);
      continue;
    }
    // table data row: "| <aspect> | `type1`, `type2` |" — types are in the 2nd column
    if (line.startsWith('|') && currentLayer && currentAspect && /`[\w-]+`/.test(line)) {
      const types = line.match(/`[\w-]+`/g).map((t) => t.replace(/`/g, ''));
      const key = currentLayer + '/' + currentAspect;
      vocab.elements[key] = vocab.elements[key] || [];
      vocab.elements[key].push(...types);
    }
  }
  // motivation applies to every layer
  const motivationTypes = vocab.elements['motivation/motivation'] || [];
  for (const layer of ['business', 'application', 'technology', 'physical']) {
    vocab.elements[layer + '/motivation'] = motivationTypes;
  }
  return vocab;
}

// ─── cell loading ───

function loadUseCase(name) {
  const dir = join(ARCH, name);
  if (!existsSync(dir)) throw new Error(`use case directory not found: ${dir}`);
  const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
  const cells = [];
  for (const f of files) {
    const text = readFileSync(join(dir, f), 'utf8');
    const fm = parseFrontmatter(text);
    cells.push({ file: f, fm, text });
  }
  return cells;
}

function validate(cells, vocab) {
  const errors = [];
  const warnings = [];
  const declared = new Map(); // id -> { type, layer, aspect }
  for (const c of cells) {
    const { layer, aspect, elements, relationships } = c.fm;
    if (!layer || !aspect) { errors.push(`${c.file}: missing layer or aspect`); continue; }
    const allowed = vocab.elements[layer + '/' + aspect];
    for (const el of elements || []) {
      if (!el.id || !el.type) { errors.push(`${c.file}: element missing id or type`); continue; }
      if (allowed && !allowed.includes(el.type)) {
        warnings.push(`${c.file}: element "${el.id}" type "${el.type}" not in vocabulary for ${layer}/${aspect}`);
      }
      declared.set(el.id, { type: el.type, layer, aspect, name: el.name, role: el.role, tech: el.tech });
    }
  }
  for (const c of cells) {
    const { relationships } = c.fm;
    for (const r of relationships || []) {
      if (!r.from || !r.to || !r.type) { errors.push(`${c.file}: relationship missing from/to/type`); continue; }
      if (!vocab.relationships.has(r.type)) { errors.push(`${c.file}: relationship type "${r.type}" not in vocabulary`); }
      if (!declared.has(r.from)) errors.push(`${c.file}: relationship references undeclared element "${r.from}"`);
      if (!declared.has(r.to)) errors.push(`${c.file}: relationship references undeclared element "${r.to}"`);
    }
  }
  return { errors, warnings, declared };
}

// ─── PlantUML emission ───

const PLANT_SHAPE = {
  'business-actor': 'rectangle',
  'business-role': 'rectangle',
  'business-process': 'rectangle',
  'business-service': 'hexagon',
  'business-function': 'rectangle',
  'business-object': 'folder',
  'representation': 'node',
  'application-component': 'component',
  'application-service': 'hexagon',
  'application-function': 'rectangle',
  'data-object': 'folder',
  'node': 'node',
  'system-software': 'node',
  'technology-service': 'hexagon',
  'artifact': 'artifact',
  'equipment': 'node',
  'facility': 'node',
  'distribution-network': 'rectangle',
  'material': 'folder',
  'goal': 'usecase',
  'outcome': 'usecase',
  'requirement': 'usecase',
  'principle': 'usecase',
  'constraint': 'usecase',
  'meaning': 'note',
  'value': 'usecase',
};

const LAYER_ORDER = ['business', 'application', 'technology', 'physical', 'motivation'];
const REL_ARROW = {
  'used-by': '-->',
  'realizes': '..>',
  'assigned-to': '-->',
  'flows-to': '-->',
  'composes': '*--',
  'specializes': '<|--',
  'triggers': '-->',
  'accesses': '-->',
};

function emitPlantUml(cells, declared) {
  const byLayer = new Map();
  for (const [id, meta] of declared) {
    const l = meta.layer;
    if (!byLayer.has(l)) byLayer.set(l, []);
    byLayer.get(l).push({ id, ...meta });
  }
  const lines = ['@startuml', 'archimate', 'skinparam linetype ortho', ''];
  for (const layer of LAYER_ORDER) {
    const els = byLayer.get(layer);
    if (!els || els.length === 0) continue;
    lines.push(`package "${layer}" {`);
    for (const el of els) {
      const shape = PLANT_SHAPE[el.type] || 'rectangle';
      lines.push(`  ${shape} "${el.name || el.id}" as ${el.id}`);
    }
    lines.push('}', '');
  }
  for (const c of cells) {
    for (const r of c.fm.relationships || []) {
      const arr = REL_ARROW[r.type] || '-->';
      const label = r.label ? ` : ${r.label}` : '';
      lines.push(`${r.from} ${arr} ${r.to}${label}`);
    }
  }
  lines.push('@enduml');
  return lines.join('\n');
}

// ─── SVG emission (direct from YAML, zero dependencies) ───

const LAYER_COLOR = {
  business: '#c8e6c9',
  application: '#bbdefb',
  technology: '#ffe0b2',
  physical: '#d7ccc8',
  motivation: '#f8bbd0',
};
const LAYER_LABEL = {
  business: 'Business',
  application: 'Application',
  technology: 'Technology',
  physical: 'Physical',
  motivation: 'Motivation',
};
// shape per type: { shape: rect|hex|folder|ellipse, label }
const SVG_SHAPE = {
  'business-actor': 'rect',
  'business-role': 'rect',
  'business-process': 'rect',
  'business-service': 'hex',
  'business-function': 'rect',
  'business-object': 'folder',
  'representation': 'rect',
  'application-component': 'rect',
  'application-service': 'hex',
  'application-function': 'rect',
  'data-object': 'folder',
  'node': 'rect',
  'system-software': 'rect',
  'technology-service': 'hex',
  'artifact': 'folder',
  'equipment': 'rect',
  'facility': 'rect',
  'distribution-network': 'rect',
  'material': 'folder',
  'goal': 'ellipse',
  'outcome': 'ellipse',
  'requirement': 'ellipse',
  'principle': 'ellipse',
  'constraint': 'ellipse',
  'meaning': 'note',
  'value': 'ellipse',
};
const REL_LABEL = {
  'used-by': 'used-by',
  'realizes': 'realizes',
  'assigned-to': 'assigned-to',
  'flows-to': 'flows-to',
  'composes': 'composes',
  'specializes': 'specializes',
  'triggers': 'triggers',
  'accesses': 'accesses',
};

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function emitSvg(cells, declared) {
  const COL_W = 220;
  const GAP_X = 40;
  const BOX_W = 180;
  const BOX_H = 44;
  const BOX_GAP_Y = 14;
  const PAD = 24;
  const HEADER_H = 28;

  const byLayer = new Map();
  for (const [id, meta] of declared) {
    const l = meta.layer;
    if (!byLayer.has(l)) byLayer.set(l, []);
    byLayer.get(l).push({ id, ...meta });
  }
  const presentLayers = LAYER_ORDER.filter((l) => byLayer.has(l) && byLayer.get(l).length);
  const colCount = presentLayers.length;
  const maxRows = Math.max(...presentLayers.map((l) => byLayer.get(l).length), 1);
  const width = COL_W * colCount + GAP_X * (colCount - 1) + PAD * 2;
  const height = PAD * 2 + HEADER_H + maxRows * (BOX_H + BOX_GAP_Y) + 60;

  const pos = new Map(); // id -> {x,y,cx,cy}
  presentLayers.forEach((layer, ci) => {
    const els = byLayer.get(layer);
    const colX = PAD + ci * (COL_W + GAP_X);
    els.forEach((el, ri) => {
      const x = colX + (COL_W - BOX_W) / 2;
      const y = PAD + HEADER_H + ri * (BOX_H + BOX_GAP_Y);
      pos.set(el.id, { x, y, cx: x + BOX_W / 2, cy: y + BOX_H / 2 });
    });
  });

  // Build a lookup from element id -> its cell file (without extension) for click-to-cell.
  const elCell = new Map();
  for (const c of cells) {
    const cellSlug = c.file.replace(/\.md$/, '').replace(/--/g, '-');
    for (const el of c.fm.elements || []) elCell.set(el.id, cellSlug);
  }

  const parts = [];
  parts.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  // Responsive: width/height 100%, viewBox preserved, scales to container.
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" font-family="system-ui, sans-serif" font-size="12" role="img" aria-labelledby="archimate-title archimate-desc">`);
  parts.push(`<title id="archimate-title">ArchiMate view</title>`);
  parts.push(`<desc id="archimate-desc">Layered ArchiMate diagram derived from archimate/ cell sources.</desc>`);
  parts.push(`<style> .ell{stroke:#37474f;stroke-width:1.4;cursor:pointer;transition:filter .15s} .ell:hover{filter:drop-shadow(0 1px 3px rgba(0,0,0,.25))} .lbl{fill:#263238;pointer-events:none} .hdr{font-weight:700;fill:#37474f;font-size:13px;pointer-events:none} .rel{stroke:#546e7a;stroke-width:1.2;fill:none} .relLbl{fill:#607d8b;font-size:10px;pointer-events:none} .layer-col{transition:opacity .2s} .archimate-svg.is-filtered .layer-col:not(.is-active){opacity:.18} @media (prefers-reduced-motion:reduce){.ell,.layer-col{transition:none}} </style>`);

  // layer columns (grouped for layer-tab filtering)
  presentLayers.forEach((layer, ci) => {
    const colX = PAD + ci * (COL_W + GAP_X);
    const fill = LAYER_COLOR[layer] || '#eeeeee';
    parts.push(`<g class="layer-col" data-layer="${layer}">`);
    parts.push(`<rect x="${colX}" y="${PAD}" width="${COL_W}" height="${height - PAD * 2}" rx="8" fill="${fill}" fill-opacity="0.25" stroke="#b0bec5" stroke-dasharray="4 3"/>`);
    parts.push(`<text x="${colX + COL_W / 2}" y="${PAD + 18}" text-anchor="middle" class="hdr">${esc(LAYER_LABEL[layer] || layer)}</text>`);
    parts.push(`</g>`);
  });

  // elements (each in a group with data attributes for interactivity)
  for (const [id, p] of pos) {
    const meta = declared.get(id);
    const shape = SVG_SHAPE[meta.type] || 'rect';
    const label = esc(meta.name || id);
    const cell = elCell.get(id) || '';
    const gOpen = `<g class="ell" data-layer="${meta.layer}" data-type="${esc(meta.type)}" data-id="${esc(id)}" data-cell="${esc(cell)}">`;
    const gClose = `</g>`;
    const titleDesc = `<title>${esc(meta.name || id)} — ${esc(meta.type)}</title><desc>${esc(meta.layer)} / ${esc(meta.type)}</desc>`;
    let body = '';
    if (shape === 'hex') {
      const hx = [p.x, p.x + 14, p.x + BOX_W - 14, p.x + BOX_W, p.x + BOX_W - 14, p.x + 14];
      const hy = [p.cy, p.y, p.y, p.cy, p.y + BOX_H, p.y + BOX_H];
      const pts = hx.map((x, i) => `${x},${hy[i]}`).join(' ');
      body = `<polygon points="${pts}" fill="#fff"/>` + `<text x="${p.cx}" y="${p.cy + 4}" text-anchor="middle" class="lbl">${label}</text>`;
    } else if (shape === 'ellipse') {
      body = `<ellipse cx="${p.cx}" cy="${p.cy}" rx="${BOX_W / 2}" ry="${BOX_H / 2}" fill="#fff"/>` + `<text x="${p.cx}" y="${p.cy + 4}" text-anchor="middle" class="lbl">${label}</text>`;
    } else if (shape === 'folder') {
      body = `<path d="M${p.x} ${p.y} h30 v-6 h40 v6 h${BOX_W - 70} v${BOX_H} h${-BOX_W} z" fill="#fff"/>` + `<text x="${p.cx}" y="${p.cy + 6}" text-anchor="middle" class="lbl">${label}</text>`;
    } else {
      body = `<rect x="${p.x}" y="${p.y}" width="${BOX_W}" height="${BOX_H}" rx="4" fill="#fff"/>` + `<text x="${p.cx}" y="${p.cy + 4}" text-anchor="middle" class="lbl">${label}</text>`;
    }
    parts.push(gOpen + titleDesc + body + gClose);
  }

  // relationships
  let relIdx = 0;
  for (const c of cells) {
    for (const r of c.fm.relationships || []) {
      const a = pos.get(r.from);
      const b = pos.get(r.to);
      if (!a || !b) continue;
      const dy = (relIdx % 3) * 10 - 10;
      relIdx++;
      parts.push(`<path class="rel" d="M${a.cx} ${a.y + BOX_H} C ${a.cx} ${a.cy + 80 + dy}, ${b.cx} ${b.cy + 80 + dy}, ${b.cx} ${b.y}" marker-end="url(#arrow)"/>`);
      const mx = (a.cx + b.cx) / 2;
      const my = (a.y + BOX_H + b.y) / 2 + dy;
      parts.push(`<text x="${mx}" y="${my}" text-anchor="middle" class="relLbl">${esc(REL_LABEL[r.type] || r.type)}</text>`);
    }
  }
  parts.push(`<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#546e7a"/></marker></defs>`);
  parts.push(`</svg>`);
  return parts.join('\n');
}

// ─── matrix emission ───

const LAYERS = ['business', 'application', 'technology', 'physical'];
const ASPECTS = ['motivation', 'active-structure', 'behaviour', 'passive-structure'];

function emitMatrix(cells) {
  const grid = {};
  for (const l of LAYERS) { grid[l] = {}; for (const a of ASPECTS) grid[l][a] = []; }
  for (const c of cells) {
    const { layer, aspect, elements } = c.fm;
    if (grid[layer] && grid[layer][aspect] !== undefined) {
      grid[layer][aspect] = (elements || []).map((e) => e.name || e.id);
    }
  }
  const header = '| Service Layer | Motivation | Active structure | Behaviour | Passive structure |';
  const sep = '|---------------|------------|-----------------|-----------|-------------------|';
  const rows = [header, sep];
  for (const l of LAYERS) {
    rows.push('| ' + l.charAt(0).toUpperCase() + l.slice(1) + ' | ' + ASPECTS.map((a) => grid[l][a].length ? grid[l][a].join(', ') : '—').join(' | ') + ' |');
  }
  return rows.join('\n');
}

// ─── HTML fragment emission (ArchiMate browser grid) ───

// Map kebab element types → Pascal_Underscore used by the renderer/icons.
const TYPE_PASCAL = {
  // Motivation (cross-layer)
  'goal': 'Motivation_Goal',
  'outcome': 'Motivation_Outcome',
  'requirement': 'Motivation_Requirement',
  'principle': 'Motivation_Principle',
  'constraint': 'Motivation_Constraint',
  'meaning': 'Motivation_Assessment',
  'value': 'Motivation_Outcome',
  // Business
  'business-actor': 'Business_Actor',
  'business-role': 'Business_Role',
  'business-process': 'Business_Process',
  'business-service': 'Business_Service',
  'business-function': 'Business_Function',
  'business-object': 'Business_Object',
  'representation': 'Business_Representation',
  // Application
  'application-component': 'Application_Component',
  'application-service': 'Application_Service',
  'application-function': 'Application_Function',
  'data-object': 'Application_DataObject',
  // Technology
  'node': 'Technology_Node',
  'system-software': 'Technology_SystemSoftware',
  'technology-service': 'Technology_Service',
  'artifact': 'Technology_Artifact',
  // Physical
  'equipment': 'Technology_Device',
  'facility': 'Technology_Node',
  'distribution-network': 'Technology_CommunicationNetwork',
  'material': 'Business_Object',
};

// Map kebab layer → Pascal layer label used by the renderer.
const LAYER_PASCAL = {
  business: 'Business',
  application: 'Application',
  technology: 'Technology',
  physical: 'Technology',
  motivation: 'Motivation',
};

// Map kebab aspect → Pascal aspect label.
const ASPECT_PASCAL = {
  'active-structure': 'Active Structure',
  'behaviour': 'Behaviour',
  'passive-structure': 'Passive Structure',
  'motivation': 'Motivation',
};

// Map kebab relation type → Pascal relation used by the renderer.
const REL_PASCAL = {
  'used-by': 'Serving',
  'realizes': 'Realization',
  'assigned-to': 'Assignment',
  'flows-to': 'Flow',
  'composes': 'Composition',
  'specializes': 'Specialization',
  'triggers': 'Triggering',
  'accesses': 'Access',
};

// Short human type descriptions.
const TYPE_DESC = {
  'Motivation_Goal': 'ArchiMate Goal — a desired end-state.',
  'Motivation_Outcome': 'ArchiMate Outcome — an end result.',
  'Motivation_Requirement': 'ArchiMate Requirement — a needed property.',
  'Motivation_Principle': 'ArchiMate Principle — a fundamental guideline.',
  'Motivation_Constraint': 'ArchiMate Constraint — a restriction.',
  'Motivation_Assessment': 'ArchiMate Assessment — an evaluation.',
  'Business_Actor': 'ArchiMate Business Actor — an organizational entity.',
  'Business_Role': 'ArchiMate Business Role — a responsibility.',
  'Business_Process': 'ArchiMate Business Process — a sequence of behaviors.',
  'Business_Service': 'ArchiMate Business Service — exposed business behavior.',
  'Business_Function': 'ArchiMate Business Function — a grouping of behavior.',
  'Business_Object': 'ArchiMate Business Object — a passive data concept.',
  'Business_Representation': 'ArchiMate Business Representation — a data view.',
  'Application_Component': 'ArchiMate Application Component — a modular unit.',
  'Application_Service': 'ArchiMate Application Service — exposed app behavior.',
  'Application_Function': 'ArchiMate Application Function — app behavior.',
  'Application_DataObject': 'ArchiMate Data Object — passive application data.',
  'Technology_Node': 'ArchiMate Technology Node — a compute resource.',
  'Technology_Device': 'ArchiMate Technology Device — a hardware resource.',
  'Technology_SystemSoftware': 'ArchiMate System Software — a platform resource.',
  'Technology_Service': 'ArchiMate Technology Service — exposed tech behavior.',
  'Technology_Artifact': 'ArchiMate Artifact — a passive technology piece.',
  'Technology_CommunicationNetwork': 'ArchiMate Communication Network — a network.',
};

// Grid column order (aspect columns). Motivation is last to match reference.
const ASPECT_COLS = ['active-structure', 'behaviour', 'passive-structure', 'motivation'];
// Row order: Motivation first, then Business, Application, Technology (Physical folds into Technology).
const GRID_ROW_ORDER = ['motivation', 'business', 'application', 'technology', 'physical'];

function pascalType(t) {
  return TYPE_PASCAL[t] || t.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('_');
}
function pascalLayer(l) { return LAYER_PASCAL[l] || l.charAt(0).toUpperCase() + l.slice(1); }
function pascalAspect(a) { return ASPECT_PASCAL[a] || a; }
function pascalRel(r) { return REL_PASCAL[r] || r; }

// Build a human relations string for an element from the relationships touching it.
function buildRelationsString(id, relationships) {
  const lines = [];
  for (const r of relationships) {
    if (r.from === id || r.to === id) {
      const verb = REL_PASCAL[r.type] || r.type;
      const other = r.from === id ? r.to : r.from;
      const dir = r.from === id ? '→' : '←';
      const label = r.label ? ` (${r.label})` : '';
      lines.push(`${verb} ${dir} ${other}${label}`);
    }
  }
  return lines.join('. ');
}

function emitHtml(cells, declared) {
  // Gather all relationships across cells (dedup by from+to+type+label).
  const allRels = [];
  const seen = new Set();
  for (const c of cells) {
    for (const r of c.fm.relationships || []) {
      const key = `${r.from}|${r.to}|${r.type}|${r.label || ''}`;
      if (!seen.has(key)) { seen.add(key); allRels.push(r); }
    }
  }

  // Group elements by (layer → aspect), folding physical into technology row.
  // Motivation-aspect elements get their own "Motivation" row (cross-layer),
  // matching the reference page where motivation is a separate row with only
  // the Motivation column populated.
  const rowAspect = new Map(); // rowKey(Pascal) → aspect(kebab) → [{id, meta}]
  const elLayer = new Map(); // id → Pascal layer (for data-layer attr)
  const elAspect = new Map(); // id → Pascal aspect
  for (const [id, meta] of declared) {
    const aspect = meta.aspect;
    // Motivation-aspect elements live in a Motivation row; their data-layer
    // stays "Motivation" so the box tints match the reference.
    const rowKey = aspect === 'motivation' ? 'Motivation' : pascalLayer(meta.layer);
    const dataLayer = aspect === 'motivation' ? 'Motivation' : pascalLayer(meta.layer);
    if (!rowAspect.has(rowKey)) rowAspect.set(rowKey, new Map());
    const am = rowAspect.get(rowKey);
    if (!am.has(aspect)) am.set(aspect, []);
    am.get(aspect).push({ id, ...meta });
    elLayer.set(id, dataLayer);
    elAspect.set(id, pascalAspect(aspect));
  }

  // Determine present rows in GRID_ROW_ORDER, dedup by Pascal key.
  const presentRowKeys = [];
  const seenRow = new Set();
  for (const l of GRID_ROW_ORDER) {
    const rk = pascalLayer(l);
    if (rowAspect.has(rk) && !seenRow.has(rk)) { seenRow.add(rk); presentRowKeys.push(rk); }
  }

  // Build KB object.
  const kb = {};
  for (const [id, meta] of declared) {
    const pt = pascalType(meta.type);
    kb[id] = {
      title: meta.name || id,
      type: pt,
      layer: elLayer.get(id),
      aspect: elAspect.get(id),
      type_desc: TYPE_DESC[pt] || `ArchiMate ${pt.replace(/_/g, ' ')}.`,
      role: meta.role || '',
      tech: meta.tech || '',
      relations: buildRelationsString(id, allRels),
    };
  }

  // Build RELS array. ArchiMate Serving points server->consumer; the source
  // vocabulary uses `used-by` as consumer->provider, so reverse from/to for it.
  const rels = allRels.map((r) => {
    const pascal = pascalRel(r.type);
    if (pascal === 'Serving') {
      return { from: r.to, to: r.from, type: pascal, label: r.label || '' };
    }
    return { from: r.from, to: r.to, type: pascal, label: r.label || '' };
  });

  // Escape for HTML text/attribute.
  const escAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // Box label: allow <br> in names with " · " or " / "? Keep name verbatim; replace newlines.
  const boxLabel = (name, id) => escAttr(name || id).replace(/\\n/g, '<br>');

  // Build legend: only layers present + relations present.
  const layerSwatches = presentRowKeys.map((rk) => {
    const colors = {
      Motivation: '#7c3aed',
      Business: '#b45309',
      Application: '#1e40af',
      Technology: '#166534',
    };
    const c = colors[rk] || '#64748b';
    return `<div class="legend-item"><span class="l-box" style="background:${c};border:1px solid ${c};"></span>${rk}</div>`;
  }).join('');

  const relColors = {
    Realization: { kind: 'dash', color: '#3b82f6' },
    Composition: { kind: 'line', color: '#374151', glyph: '◆' },
    Serving: { kind: 'line', color: '#7c3aed' },
    Assignment: { kind: 'line', color: '#374151', glyph: '●' },
    Flow: { kind: 'line', color: '#f59e0b' },
    Access: { kind: 'dash', color: '#10b981' },
    Influence: { kind: 'dash', color: '#9ca3af' },
    Association: { kind: 'line', color: '#6b7280' },
    Triggering: { kind: 'line', color: '#ef4444' },
    Specialization: { kind: 'line', color: '#64748b' },
  };
  // Canonical order matching the reference; only show relations present in the data.
  const CANONICAL_REL_ORDER = ['Realization', 'Composition', 'Serving', 'Assignment', 'Flow', 'Access', 'Influence', 'Association', 'Triggering', 'Specialization'];
  const presentRelTypes = [...new Set(rels.map((r) => r.type))];
  const orderedRels = CANONICAL_REL_ORDER.filter((t) => presentRelTypes.includes(t));
  const relSwatches = orderedRels.map((t) => {
    const st = relColors[t] || { kind: 'line', color: '#6b7280' };
    const swatch = st.kind === 'dash'
      ? `<span class="l-dash" style="border-top:2px dashed ${st.color};"></span>`
      : `<span class="l-line" style="background:${st.color};"></span>`;
    const glyph = st.glyph ? ` ${st.glyph}` : '';
    return `<div class="legend-item">${swatch}${t}${glyph}</div>`;
  }).join('');

  // Build the grid table rows.
  const rowsHtml = presentRowKeys.map((rk) => {
    const am = rowAspect.get(rk);
    const cellsHtml = ASPECT_COLS.map((a) => {
      const els = (am.get(a) || []);
      const boxes = els.map((el) => {
        const pt = pascalType(el.type);
        return `    <div class="arch-box" id="${escAttr(el.id)}" data-layer="${rk}" data-type="${pt}" title="${escAttr(el.name || el.id)}" onclick="showModal('${escAttr(el.id)}')">${boxLabel(el.name, el.id)}</div>`;
      }).join('\n');
      return `  <td class="grid-cell">\n${boxes}\n  </td>`;
    }).join('\n');
    return `<tr>\n  <td class="layer-label layer-${rk}">${rk}<br>Layer</td>\n${cellsHtml}\n</tr>`;
  }).join('\n');

  // JSON must not contain Liquid tags. Our data is controlled; still guard {{ }}.
  const safeJson = (obj) => JSON.stringify(obj).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const parts = [];
  parts.push('<!-- ArchiMate browser fragment — generated by scripts/gen-archimate.mjs --emit html. Do not edit by hand. -->');
  parts.push('<div class="archimate-browser" id="archimate-browser-root">');
  parts.push('  <div class="legend">');
  parts.push('    <span class="legend-label">Layers</span>');
  parts.push('    ' + layerSwatches);
  if (relSwatches) {
    parts.push('    <span class="legend-label" style="margin-left:10px;">Relations</span>');
    parts.push('    ' + relSwatches);
  }
  parts.push('  </div>');
  parts.push('  <div class="diagram-wrapper" id="diagram-wrapper">');
  parts.push('    <svg id="rel-svg" width="0" height="0" aria-hidden="true"></svg>');
  parts.push('    <table class="arch-grid">');
  parts.push('      <thead>');
  parts.push('        <tr>');
  parts.push('          <th style="width:82px;border:none;background:transparent;"></th>');
  parts.push('          <th>Active Structure</th>');
  parts.push('          <th>Behaviour</th>');
  parts.push('          <th>Passive Structure</th>');
  parts.push('          <th>Motivation</th>');
  parts.push('        </tr>');
  parts.push('      </thead>');
  parts.push('      <tbody>');
  parts.push(rowsHtml);
  parts.push('      </tbody>');
  parts.push('    </table>');
  parts.push('  </div>');
  parts.push('  <div id="overlay" onclick="closeModal()"></div>');
  parts.push('  <div id="modal">');
  parts.push('    <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px;">');
  parts.push('      <h3 id="m-title" style="font-size:1rem;font-weight:800;color:#0f172a;padding-right:12px;line-height:1.3;"></h3>');
  parts.push('      <button type="button" onclick="closeModal()" style="font-size:1.3rem;color:#94a3b8;cursor:pointer;background:none;border:none;flex-shrink:0;line-height:1;" aria-label="Close">✕</button>');
  parts.push('    </div>');
  parts.push('    <div style="margin-bottom:10px;">');
  parts.push('      <span id="m-layer-badge" class="badge"></span>');
  parts.push('      <span id="m-aspect" class="badge" style="background:#f1f5f9;color:#475569;"></span>');
  parts.push('      <code id="m-type" style="font-size:.68rem;background:#f8fafc;color:#64748b;padding:2px 6px;border-radius:4px;margin-left:4px;border:1px solid #e2e8f0;"></code>');
  parts.push('    </div>');
  parts.push('    <p id="m-type-desc" style="font-size:.73rem;color:#94a3b8;font-style:italic;margin-bottom:14px;"></p>');
  parts.push('    <div class="m-field"><div class="m-label">Role</div><div class="m-value" id="m-role"></div></div>');
  parts.push('    <div class="m-field" id="m-tech-block"><div class="m-label">Technology</div><div class="m-value m-mono" id="m-tech"></div></div>');
  parts.push('    <div class="m-field" id="m-rel-block"><div class="m-label">Relationships</div><div class="m-value" id="m-relations"></div></div>');
  parts.push('  </div>');
  parts.push('  <script type="application/json" id="archimate-kb">' + safeJson(kb) + '</script>');
  parts.push('  <script type="application/json" id="archimate-rels">' + safeJson(rels) + '</script>');
  parts.push('</div>');
  return parts.join('\n');
}

// ─── doc injection (idempotent between markers) ───

const START = '<!-- archimate:gen start -->';
const END = '<!-- archimate:gen end -->';

function injectBlock(docPath, block, matrix) {
  let text = readFileSync(docPath, 'utf8');
  // Detect the file's dominant line ending and use it in replacements so the
  // check is stable across CRLF (Windows autocrlf) and LF checkouts.
  const nl = text.includes('\r\n') ? '\r\n' : '\n';
  const blockNl = block.replace(/\r?\n/g, nl);
  const matrixNl = matrix.replace(/\r?\n/g, nl);
  const re = new RegExp(START + '[\\s\\S]*?' + END);
  const replacement = START + nl + '```plantuml' + nl + blockNl + nl + '```' + nl + END;
  if (re.test(text)) text = text.replace(re, replacement);
  const MSTART = '<!-- archimate:matrix start -->';
  const MEND = '<!-- archimate:matrix end -->';
  const mre = new RegExp(MSTART + '[\\s\\S]*?' + MEND);
  const mrep = MSTART + nl + matrixNl + nl + MEND;
  if (mre.test(text)) text = text.replace(mre, mrep);
  return text;
}

// ─── main ───

function main() {
  const [, , useCase, ...rest] = process.argv;
  if (!useCase) { console.error('usage: gen-archimate.mjs <use-case> [--check|--emit stdout|matrix]'); process.exit(2); }
  const flag = rest[0] || '';
  const vocab = loadVocabulary();
  const cells = loadUseCase(useCase);
  const { errors, warnings, declared } = validate(cells, vocab);
  for (const w of warnings) console.error('WARN: ' + w);
  if (errors.length) { for (const e of errors) console.error('ERROR: ' + e); process.exit(1); }

  const plant = emitPlantUml(cells, declared);

  if (flag === '--emit' && rest[1] === 'stdout') { console.log(plant); return; }
  if (flag === '--emit' && rest[1] === 'matrix') { console.log(emitMatrix(cells)); return; }
  if (flag === '--emit' && rest[1] === 'svg') { console.log(emitSvg(cells, declared)); return; }
  if (flag === '--emit' && rest[1] === 'html') {
    const htmlPath = rest[2] || join(ROOT, '_includes', 'use-cases', `${useCase}.html`);
    writeFileSync(htmlPath, emitHtml(cells, declared), 'utf8');
    console.log(`archimate: wrote HTML fragment to ${htmlPath}`);
    return;
  }
  if (flag === '--write-svg') {
    const svgPath = rest[1] || join(ROOT, '_includes', 'use-cases', `${useCase}.svg`);
    writeFileSync(svgPath, emitSvg(cells, declared), 'utf8');
    console.log(`archimate: wrote SVG to ${svgPath}`);
    return;
  }

  const docPath = join(ROOT, 'docs', 'architecture', `use-case-${useCase}.md`);
  const block = plant;
  const matrix = emitMatrix(cells);
  const next = injectBlock(docPath, block, matrix);

  if (flag === '--check') {
    const cur = readFileSync(docPath, 'utf8');
    if (cur !== next) { console.error('archimate: generated block differs from committed (run gen to update)'); process.exit(1); }
    console.log('archimate: check ok');
    return;
  }
  writeFileSync(docPath, next, 'utf8');
  console.log(`archimate: wrote diagram into ${docPath}`);
}

main();
