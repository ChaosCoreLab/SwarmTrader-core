#!/usr/bin/env node
/**
 * ArchiMate generator (per-layer source pattern).
 *
 * Reads archimate/<use-case>/{motivation,business,application,technology}layer.md,
 * checks the model against archimate/_vocabulary.md and the modeling rules in
 * software-house-ai/protocols/archimate-modeling.md, and emits:
 *   - the PlantUML block and the Layer x Aspect matrix, injected between markers
 *     into docs/architecture/use-case-<use-case>.md;
 *   - the ArchiMate browser fragment _includes/use-cases/<use-case>.html
 *     (grid + KB/RELS JSON), rendered by assets/js/archimate-browser.js.
 *
 * Usage:
 *   node scripts/gen-archimate.mjs <use-case>                # check, then write doc block + HTML fragment
 *   node scripts/gen-archimate.mjs <use-case> --check        # check, and fail if committed outputs are stale
 *   node scripts/gen-archimate.mjs <use-case> --emit stdout  # print PlantUML
 *   node scripts/gen-archimate.mjs <use-case> --emit matrix  # print the matrix
 *
 * Messages for the human editor are in Italian. Zero external dependencies.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ARCH = join(ROOT, 'archimate');
const REPO_EDIT_BASE = process.env.ARCHIMATE_EDIT_BASE || 'https://github.com/ChaosCoreLab/SwarmTrader-core/edit/main/';

const LAYER_ORDER = ['motivation', 'business', 'application', 'technology', 'physical'];
// Rank used for "every layer is linked to the one above" (physical sits with technology).
const LAYER_RANK = { motivation: 0, business: 1, application: 2, technology: 3, physical: 3 };
const LAYER_IT = { motivation: 'Motivation', business: 'Business', application: 'Application', technology: 'Technology', physical: 'Physical' };

// ─── parsing ───

function parseFrontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  const out = {};
  if (!m) return out;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line);
    if (kv) out[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

// Blank out HTML comments but keep their newlines, so line numbers stay correct.
function stripComments(text) {
  return text.replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, ''));
}

/** Parses one layer file: "### Name" + "- field: value" elements, and a Relations table. */
export function parseLayerFile(text, file) {
  const fm = parseFrontmatter(text);
  const lines = stripComments(text).split(/\r?\n/);
  const elements = [];
  const relations = [];
  let section = null;
  let current = null;
  let inFrontmatter = false;
  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    if (i === 0 && line === '---') { inFrontmatter = true; return; }
    if (inFrontmatter) { if (line === '---') inFrontmatter = false; return; }
    const h2 = /^##\s+(.+)$/.exec(line);
    if (h2) {
      const title = h2[1].trim().toLowerCase();
      section = title.startsWith('element') ? 'elements' : title.startsWith('relation') ? 'relations' : null;
      current = null;
      return;
    }
    if (section === 'elements') {
      const h3 = /^###\s+(.+)$/.exec(line);
      if (h3) {
        current = { name: h3[1].trim(), file, line: i + 1 };
        elements.push(current);
        return;
      }
      const field = /^\s*-\s+([a-z_]+)\s*:\s*(.*)$/.exec(line);
      if (field && current) current[field[1]] = field[2].trim();
      return;
    }
    if (section === 'relations') {
      if (!line.startsWith('|')) return;
      const cols = line.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
      if (cols[0].toLowerCase() === 'from' || /^:?-+:?$/.test(cols[0])) return;
      relations.push({ from: cols[0], type: cols[1] || '', to: cols[2] || '', label: cols[3] || '', file, line: i + 1 });
    }
  });
  return { layer: fm.layer, useCase: fm.use_case, file, elements, relations };
}

/** Loads all layer files of a use case. Element layer = file layer unless the element sets `layer:`. */
export function loadModel(useCase, archDir = ARCH) {
  const dir = join(archDir, useCase);
  if (!existsSync(dir)) throw new Error(`cartella del caso d'uso non trovata: ${dir}`);
  const files = readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
  const layerFiles = [];
  const ignored = [];
  for (const f of files) {
    if (!/layer\.md$/.test(f)) { ignored.push(f); continue; }
    const rel = `archimate/${useCase}/${f}`;
    layerFiles.push(parseLayerFile(readFileSync(join(dir, f), 'utf8'), rel));
  }
  const elements = [];
  const relations = [];
  for (const lf of layerFiles) {
    for (const el of lf.elements) elements.push({ ...el, layer: el.layer || lf.layer, fileLayer: lf.layer });
    for (const r of lf.relations) relations.push({ ...r, fileLayer: lf.layer });
  }
  return { useCase, layerFiles, elements, relations, ignored };
}

/** Parses archimate/_vocabulary.md into allowed element types per layer/aspect and relation types. */
export function loadVocabulary(archDir = ARCH) {
  const text = readFileSync(join(archDir, '_vocabulary.md'), 'utf8');
  const elStart = text.indexOf('## Element types');
  const relStart = text.indexOf('## Relationship types');
  const elSection = text.slice(elStart, relStart);
  const relSection = text.slice(relStart);
  const vocab = { elements: {}, relationships: new Set() };
  let layer = null;
  for (const line of elSection.split(/\r?\n/)) {
    const h3 = /^###\s+(\w+)/.exec(line);
    if (h3) { layer = h3[1].toLowerCase(); continue; }
    if (!layer || !/`[\w-]+`/.test(line)) continue;
    const types = line.match(/`[\w-]+`/g).map((t) => t.slice(1, -1));
    if (layer === 'motivation') {
      vocab.elements['motivation/motivation'] = (vocab.elements['motivation/motivation'] || []).concat(types);
    } else if (line.startsWith('|')) {
      const aspect = line.split('|')[1].trim();
      vocab.elements[`${layer}/${aspect}`] = types;
    }
  }
  for (const line of relSection.split(/\r?\n/)) {
    const m = /^\|\s*`([\w-]+)`/.exec(line);
    if (m) vocab.relationships.add(m[1]);
  }
  return vocab;
}

// ─── checks (Italian messages for the human editor) ───

const PATH_RE = /(?:^|[\s(`'"])((?:src|scripts|docs|tests|archimate|assets|_includes|_layouts|_data|human-interaction|software-house-ai|\.github|public)\/[A-Za-z0-9_./-]*[A-Za-z0-9_/-])/g;

export function checkModel(model, vocab, rootDir = ROOT) {
  const errors = [];
  const warnings = [];
  const at = (x) => `${x.file}:${x.line}`;
  const byId = new Map();

  for (const f of model.ignored) warnings.push(`archimate/${model.useCase}/${f}: file ignorato (i file del modello si chiamano <livello>layer.md).`);

  for (const el of model.elements) {
    for (const field of ['id', 'aspect', 'type']) {
      if (!el[field]) errors.push(`${at(el)} — l'elemento "${el.name}" non ha il campo '${field}'.`);
    }
    if (!el.id) continue;
    if (!/^[a-z0-9_]+$/.test(el.id)) errors.push(`${at(el)} — id "${el.id}" non valido: usa solo lettere minuscole, cifre e "_".`);
    if (byId.has(el.id)) errors.push(`${at(el)} — id "${el.id}" già usato in ${at(byId.get(el.id))}.`);
    byId.set(el.id, el);
    if (el.layer === 'motivation' && el.aspect !== 'motivation') {
      errors.push(`${at(el)} — gli elementi del livello Motivation usano aspect: motivation.`);
    }
    const allowed = vocab.elements[`${el.layer}/${el.aspect}`];
    if (el.type && el.aspect && (!allowed || !allowed.includes(el.type))) {
      errors.push(`${at(el)} — il tipo "${el.type}" non è ammesso per livello ${LAYER_IT[el.layer] || el.layer}, aspetto ${el.aspect} (vedi archimate/_vocabulary.md).`);
    }
    for (const [field, value] of [['tech', el.tech], ['name', el.name]]) {
      if (!value) continue;
      for (const m of value.matchAll(PATH_RE)) {
        const p = m[1].replace(/#.*$/, '');
        if (!existsSync(join(rootDir, p))) {
          errors.push(`${at(el)} — il percorso "${p}" citato in '${field}' di "${el.name}" non esiste più: aggiorna il testo.`);
        }
      }
    }
  }

  const degree = new Map([...byId.keys()].map((id) => [id, 0]));
  for (const r of model.relations) {
    const label = `${r.from} → ${r.to}`;
    if (!vocab.relationships.has(r.type)) {
      errors.push(`${at(r)} — relazione "${r.type}" non ammessa (${label}); tipi validi in archimate/_vocabulary.md.`);
    }
    const from = byId.get(r.from);
    const to = byId.get(r.to);
    if (!from) errors.push(`${at(r)} — la relazione ${label} cita l'id "${r.from}", che non esiste.`);
    if (!to) errors.push(`${at(r)} — la relazione ${label} cita l'id "${r.to}", che non esiste.`);
    if (from && from.file !== r.file) {
      errors.push(`${at(r)} — la relazione ${label} va scritta in ${from.file} (il file del livello dell'elemento "from").`);
    }
    if (from && to) { degree.set(r.from, degree.get(r.from) + 1); degree.set(r.to, degree.get(r.to) + 1); }
  }

  for (const [id, d] of degree) {
    if (d === 0) {
      const el = byId.get(id);
      errors.push(`${at(el)} — l'elemento "${el.name}" non ha relazioni: collegalo, oppure rimuovilo se non è significativo.`);
    }
  }

  const ranks = new Set([...byId.values()].map((el) => LAYER_RANK[el.layer]));
  for (const rank of [...ranks].filter((k) => k > 0).sort()) {
    if (!ranks.has(rank - 1)) continue;
    const linked = model.relations.some((r) => {
      const a = byId.get(r.from); const b = byId.get(r.to);
      if (!a || !b) return false;
      const ra = LAYER_RANK[a.layer]; const rb = LAYER_RANK[b.layer];
      return (ra === rank && rb === rank - 1) || (ra === rank - 1 && rb === rank);
    });
    if (!linked) {
      const lower = LAYER_ORDER.find((l) => LAYER_RANK[l] === rank);
      const upper = LAYER_ORDER.find((l) => LAYER_RANK[l] === rank - 1);
      errors.push(`nessuna relazione collega il livello ${LAYER_IT[lower]} al livello ${LAYER_IT[upper]}.`);
    }
  }

  for (const el of byId.values()) {
    if (el.type !== 'data-object') continue;
    const realizesBusiness = model.relations.some((r) => r.from === el.id && r.type === 'realizes' && byId.get(r.to)?.type === 'business-object');
    if (!realizesBusiness) warnings.push(`${at(el)} — il data object "${el.name}" non realizza nessun business object.`);
  }

  return { errors, warnings };
}

// Groups the model into (layer, aspect) cells for the emitters; relations go with their `from` element.
function toCells(model) {
  const cells = new Map();
  const cellOf = new Map();
  for (const el of model.elements) {
    const key = `${el.layer}/${el.aspect}`;
    if (!cells.has(key)) cells.set(key, { layer: el.layer, aspect: el.aspect, elements: [], relationships: [] });
    cells.get(key).elements.push(el);
    cellOf.set(el.id, key);
  }
  for (const r of model.relations) {
    const key = cellOf.get(r.from);
    if (key) cells.get(key).relationships.push(r);
  }
  return [...cells.values()];
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
  'device': 'node',
  'system-software': 'node',
  'technology-service': 'hexagon',
  'artifact': 'artifact',
  'equipment': 'node',
  'facility': 'node',
  'distribution-network': 'rectangle',
  'material': 'folder',
  'stakeholder': 'usecase',
  'driver': 'usecase',
  'assessment': 'usecase',
  'goal': 'usecase',
  'outcome': 'usecase',
  'requirement': 'usecase',
  'principle': 'usecase',
  'constraint': 'usecase',
  'meaning': 'note',
  'value': 'usecase',
};

const REL_ARROW = {
  'realizes': '..>',
  'serves': '-->',
  'assigned-to': '-->',
  'accesses': '..>',
  'flows-to': '-->',
  'triggers': '-->',
  'composes': '*--',
  'aggregates': 'o--',
  'influences': '..>',
  'specializes': '--|>',
  'association': '--',
};

function emitPlantUml(model) {
  const lines = ['@startuml', 'archimate', 'skinparam linetype ortho', ''];
  for (const layer of LAYER_ORDER) {
    const els = model.elements.filter((el) => el.layer === layer);
    if (!els.length) continue;
    lines.push(`package "${layer}" {`);
    for (const el of els) lines.push(`  ${PLANT_SHAPE[el.type] || 'rectangle'} "${el.name || el.id}" as ${el.id}`);
    lines.push('}', '');
  }
  for (const r of model.relations) {
    const label = r.label ? ` : ${r.label}` : ` : ${r.type}`;
    lines.push(`${r.from} ${REL_ARROW[r.type] || '-->'} ${r.to}${label}`);
  }
  lines.push('@enduml');
  return lines.join('\n');
}

// ─── matrix emission (same rows and columns as the browser grid) ───

const ASPECT_COLS = ['active-structure', 'behaviour', 'passive-structure', 'motivation'];
const ASPECT_LABEL = { 'active-structure': 'Active structure', behaviour: 'Behaviour', 'passive-structure': 'Passive structure', motivation: 'Motivation' };

function emitMatrix(model) {
  const rows = ['| Layer | ' + ASPECT_COLS.map((a) => ASPECT_LABEL[a]).join(' | ') + ' |', '|---|---|---|---|---|'];
  for (const layer of LAYER_ORDER) {
    const els = model.elements.filter((el) => el.layer === layer);
    if (!els.length) continue;
    const cells = ASPECT_COLS.map((a) => {
      const names = els.filter((el) => el.aspect === a).map((el) => el.name);
      return names.length ? names.join(', ') : '—';
    });
    rows.push(`| ${LAYER_IT[layer]} | ${cells.join(' | ')} |`);
  }
  return rows.join('\n');
}

// ─── HTML fragment emission (ArchiMate browser grid) ───

// Kebab element types → Pascal_Underscore used by the renderer icons.
const TYPE_PASCAL = {
  'stakeholder': 'Motivation_Stakeholder',
  'driver': 'Motivation_Driver',
  'assessment': 'Motivation_Assessment',
  'goal': 'Motivation_Goal',
  'outcome': 'Motivation_Outcome',
  'requirement': 'Motivation_Requirement',
  'principle': 'Motivation_Principle',
  'constraint': 'Motivation_Constraint',
  'meaning': 'Motivation_Meaning',
  'value': 'Motivation_Value',
  'business-actor': 'Business_Actor',
  'business-role': 'Business_Role',
  'business-process': 'Business_Process',
  'business-service': 'Business_Service',
  'business-function': 'Business_Function',
  'business-object': 'Business_Object',
  'representation': 'Business_Representation',
  'application-component': 'Application_Component',
  'application-service': 'Application_Service',
  'application-function': 'Application_Function',
  'data-object': 'Application_DataObject',
  'node': 'Technology_Node',
  'device': 'Technology_Device',
  'system-software': 'Technology_SystemSoftware',
  'technology-service': 'Technology_Service',
  'artifact': 'Technology_Artifact',
  'equipment': 'Technology_Device',
  'facility': 'Technology_Node',
  'distribution-network': 'Technology_CommunicationNetwork',
  'material': 'Technology_Artifact',
};

const LAYER_PASCAL = { motivation: 'Motivation', business: 'Business', application: 'Application', technology: 'Technology', physical: 'Technology' };
const ASPECT_PASCAL = { 'active-structure': 'Active Structure', behaviour: 'Behaviour', 'passive-structure': 'Passive Structure', motivation: 'Motivation' };

const REL_PASCAL = {
  'realizes': 'Realization',
  'serves': 'Serving',
  'assigned-to': 'Assignment',
  'accesses': 'Access',
  'flows-to': 'Flow',
  'triggers': 'Triggering',
  'composes': 'Composition',
  'aggregates': 'Aggregation',
  'influences': 'Influence',
  'specializes': 'Specialization',
  'association': 'Association',
};

const TYPE_DESC = {
  'Motivation_Stakeholder': 'ArchiMate Stakeholder — someone with interests in the outcome.',
  'Motivation_Driver': 'ArchiMate Driver — a condition that motivates change.',
  'Motivation_Assessment': 'ArchiMate Assessment — the result of analysing a driver.',
  'Motivation_Goal': 'ArchiMate Goal — a desired end-state.',
  'Motivation_Outcome': 'ArchiMate Outcome — an end result.',
  'Motivation_Requirement': 'ArchiMate Requirement — a needed property.',
  'Motivation_Principle': 'ArchiMate Principle — a fundamental guideline.',
  'Motivation_Constraint': 'ArchiMate Constraint — a restriction.',
  'Motivation_Meaning': 'ArchiMate Meaning — the interpretation of a concept.',
  'Motivation_Value': 'ArchiMate Value — the worth or importance of a concept.',
  'Business_Actor': 'ArchiMate Business Actor — an organizational entity.',
  'Business_Role': 'ArchiMate Business Role — a responsibility.',
  'Business_Process': 'ArchiMate Business Process — a sequence of behaviors.',
  'Business_Service': 'ArchiMate Business Service — exposed business behavior.',
  'Business_Function': 'ArchiMate Business Function — a grouping of behavior.',
  'Business_Object': 'ArchiMate Business Object — a passive business concept.',
  'Business_Representation': 'ArchiMate Representation — a perceptible form of information.',
  'Application_Component': 'ArchiMate Application Component — a modular unit of software.',
  'Application_Service': 'ArchiMate Application Service — exposed application behavior.',
  'Application_Function': 'ArchiMate Application Function — application behavior.',
  'Application_DataObject': 'ArchiMate Data Object — passive application data.',
  'Technology_Node': 'ArchiMate Node — a computational or physical resource.',
  'Technology_Device': 'ArchiMate Device — a physical IT resource.',
  'Technology_SystemSoftware': 'ArchiMate System Software — a software platform.',
  'Technology_Service': 'ArchiMate Technology Service — exposed technology behavior.',
  'Technology_Artifact': 'ArchiMate Artifact — a piece of data used or produced.',
  'Technology_CommunicationNetwork': 'ArchiMate Communication Network — a network.',
};

const pascalType = (t) => TYPE_PASCAL[t] || t.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('_');

function relationsText(id, model, byId) {
  const name = (x) => byId.get(x)?.name || x;
  return model.relations
    .filter((r) => r.from === id || r.to === id)
    .map((r) => {
      const verb = REL_PASCAL[r.type] || r.type;
      const text = r.from === id ? `${verb} → ${name(r.to)}` : `${verb} ← ${name(r.from)}`;
      return r.label ? `${text} (${r.label})` : text;
    })
    .join('. ');
}

function emitHtml(model) {
  const byId = new Map(model.elements.map((el) => [el.id, el]));
  const escAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeJson = (obj) => JSON.stringify(obj).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const rowKeys = [];
  for (const l of LAYER_ORDER) {
    const rk = LAYER_PASCAL[l];
    if (model.elements.some((el) => LAYER_PASCAL[el.layer] === rk) && !rowKeys.includes(rk)) rowKeys.push(rk);
  }

  const kb = {};
  for (const el of model.elements) {
    const pt = pascalType(el.type);
    kb[el.id] = {
      title: el.name || el.id,
      type: pt,
      layer: LAYER_PASCAL[el.layer],
      aspect: ASPECT_PASCAL[el.aspect] || el.aspect,
      type_desc: TYPE_DESC[pt] || `ArchiMate ${pt.replace(/_/g, ' ')}.`,
      role: el.role || '',
      tech: el.tech || '',
      relations: relationsText(el.id, model, byId),
      source: `${el.file}:${el.line}`,
      edit_url: REPO_EDIT_BASE + el.file,
    };
  }
  const rels = model.relations.map((r) => ({ from: r.from, to: r.to, type: REL_PASCAL[r.type] || r.type, label: r.label || '' }));

  const layerColor = { Motivation: '#7c3aed', Business: '#b45309', Application: '#1e40af', Technology: '#166534' };
  const layerSwatches = rowKeys.map((rk) => `<div class="legend-item"><span class="l-box" style="background:${layerColor[rk]};border:1px solid ${layerColor[rk]};"></span>${rk}</div>`).join('');

  const relStyle = {
    Realization: { kind: 'dash', color: '#3b82f6' },
    Composition: { kind: 'line', color: '#374151', glyph: '◆' },
    Aggregation: { kind: 'line', color: '#374151', glyph: '◇' },
    Serving: { kind: 'line', color: '#7c3aed' },
    Assignment: { kind: 'line', color: '#374151', glyph: '●' },
    Flow: { kind: 'line', color: '#f59e0b' },
    Access: { kind: 'dash', color: '#10b981' },
    Influence: { kind: 'dash', color: '#9ca3af' },
    Association: { kind: 'line', color: '#6b7280' },
    Triggering: { kind: 'line', color: '#ef4444' },
    Specialization: { kind: 'line', color: '#64748b' },
  };
  const present = new Set(rels.map((r) => r.type));
  const relSwatches = Object.keys(relStyle).filter((t) => present.has(t)).map((t) => {
    const st = relStyle[t];
    const swatch = st.kind === 'dash'
      ? `<span class="l-dash" style="border-top:2px dashed ${st.color};"></span>`
      : `<span class="l-line" style="background:${st.color};"></span>`;
    return `<div class="legend-item">${swatch}${t}${st.glyph ? ' ' + st.glyph : ''}</div>`;
  }).join('');

  const rowsHtml = rowKeys.map((rk) => {
    const cellsHtml = ASPECT_COLS.map((a) => {
      const boxes = model.elements
        .filter((el) => LAYER_PASCAL[el.layer] === rk && el.aspect === a)
        .map((el) => `    <div class="arch-box" id="${escAttr(el.id)}" data-layer="${rk}" data-type="${pascalType(el.type)}" title="${escAttr(el.name)}" onclick="showModal('${escAttr(el.id)}')">${escAttr(el.name)}</div>`)
        .join('\n');
      return `  <td class="grid-cell">\n${boxes}\n  </td>`;
    }).join('\n');
    return `<tr>\n  <td class="layer-label layer-${rk}">${rk}<br>Layer</td>\n${cellsHtml}\n</tr>`;
  }).join('\n');

  return [
    '<!-- ArchiMate browser fragment — generated by scripts/gen-archimate.mjs from archimate/' + model.useCase + '/*layer.md. Do not edit by hand. -->',
    '<div class="archimate-browser" id="archimate-browser-root">',
    '  <div class="legend">',
    '    <span class="legend-label">Layers</span>',
    '    ' + layerSwatches,
    relSwatches ? '    <span class="legend-label" style="margin-left:10px;">Relations</span>\n    ' + relSwatches : '',
    '  </div>',
    '  <div class="diagram-wrapper" id="diagram-wrapper">',
    '    <svg id="rel-svg" width="0" height="0" aria-hidden="true"></svg>',
    '    <table class="arch-grid">',
    '      <thead>',
    '        <tr>',
    '          <th style="width:82px;border:none;background:transparent;"></th>',
    ...ASPECT_COLS.map((a) => `          <th>${ASPECT_PASCAL[a]}</th>`),
    '        </tr>',
    '      </thead>',
    '      <tbody>',
    rowsHtml,
    '      </tbody>',
    '    </table>',
    '  </div>',
    '  <div id="overlay" onclick="closeModal()"></div>',
    '  <div id="modal">',
    '    <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px;">',
    '      <h3 id="m-title" style="font-size:1rem;font-weight:800;color:#0f172a;padding-right:12px;line-height:1.3;"></h3>',
    '      <button type="button" onclick="closeModal()" style="font-size:1.3rem;color:#94a3b8;cursor:pointer;background:none;border:none;flex-shrink:0;line-height:1;" aria-label="Close">✕</button>',
    '    </div>',
    '    <div style="margin-bottom:10px;">',
    '      <span id="m-layer-badge" class="badge"></span>',
    '      <span id="m-aspect" class="badge" style="background:#f1f5f9;color:#475569;"></span>',
    '      <code id="m-type" style="font-size:.68rem;background:#f8fafc;color:#64748b;padding:2px 6px;border-radius:4px;margin-left:4px;border:1px solid #e2e8f0;"></code>',
    '    </div>',
    '    <p id="m-type-desc" style="font-size:.73rem;color:#94a3b8;font-style:italic;margin-bottom:14px;"></p>',
    '    <div class="m-field"><div class="m-label">Role in ENI replay</div><div class="m-value" id="m-role"></div></div>',
    '    <div class="m-field" id="m-tech-block"><div class="m-label">Technology</div><div class="m-value m-mono" id="m-tech"></div></div>',
    '    <div class="m-field" id="m-rel-block"><div class="m-label">Relationships</div><div class="m-value" id="m-relations"></div></div>',
    '    <div class="m-field m-edit" id="m-edit-block"><a id="m-edit" href="#" target="_blank" rel="noopener">✎ Edit this element</a> <code id="m-source"></code></div>',
    '  </div>',
    '  <script type="application/json" id="archimate-kb">' + safeJson(kb) + '</script>',
    '  <script type="application/json" id="archimate-rels">' + safeJson(rels) + '</script>',
    '</div>',
  ].filter((line) => line !== '').join('\n') + '\n';
}

// ─── doc injection (idempotent between markers) ───

const START = '<!-- archimate:gen start -->';
const END = '<!-- archimate:gen end -->';
const MSTART = '<!-- archimate:matrix start -->';
const MEND = '<!-- archimate:matrix end -->';

function injectBlock(text, block, matrix) {
  // Keep the file's line endings so the check is stable across CRLF and LF checkouts.
  const nl = text.includes('\r\n') ? '\r\n' : '\n';
  const toNl = (s) => s.replace(/\r?\n/g, nl);
  return text
    .replace(new RegExp(START + '[\\s\\S]*?' + END), START + nl + '```plantuml' + nl + toNl(block) + nl + '```' + nl + END)
    .replace(new RegExp(MSTART + '[\\s\\S]*?' + MEND), MSTART + nl + toNl(matrix) + nl + MEND);
}

/** Builds every output of a use case. Returns the check result and the expected file contents. */
export function buildUseCase(useCase, { archDir = ARCH, rootDir = ROOT } = {}) {
  const vocab = loadVocabulary(archDir);
  const model = loadModel(useCase, archDir);
  const result = checkModel(model, vocab, rootDir);
  if (result.errors.length) return { ...result, model, outputs: [] };
  const docPath = join(rootDir, 'docs', 'architecture', `use-case-${useCase}.md`);
  const htmlPath = join(rootDir, '_includes', 'use-cases', `${useCase}.html`);
  const outputs = [{ path: htmlPath, content: emitHtml(model) }];
  if (existsSync(docPath)) outputs.push({ path: docPath, content: injectBlock(readFileSync(docPath, 'utf8'), emitPlantUml(model), emitMatrix(model)) });
  return { ...result, model, outputs };
}

export function printReport({ errors, warnings }) {
  for (const w of warnings) console.error('ATTENZIONE: ' + w);
  for (const e of errors) console.error('ERRORE: ' + e);
  if (errors.length) console.error(`archimate: ${errors.length} errore/i nel modello — nessun file generato.`);
}

// ─── main ───

function main() {
  const [, , useCase, flag, arg] = process.argv;
  if (!useCase) { console.error('uso: gen-archimate.mjs <use-case> [--check | --emit stdout|matrix]'); process.exit(2); }

  if (flag === '--emit') {
    const model = loadModel(useCase);
    console.log(arg === 'matrix' ? emitMatrix(model) : emitPlantUml(model));
    return;
  }

  const built = buildUseCase(useCase);
  printReport(built);
  if (built.errors.length) process.exit(1);

  if (flag === '--check') {
    // Compare ignoring CRLF/LF, which git may rewrite on checkout (core.autocrlf).
    const lf = (s) => s.replace(/\r\n/g, '\n');
    const stale = built.outputs.filter((o) => !existsSync(o.path) || lf(readFileSync(o.path, 'utf8')) !== lf(o.content));
    if (stale.length) {
      for (const o of stale) console.error(`ERRORE: ${o.path} non è aggiornato: esegui npm run archimate:gen.`);
      process.exit(1);
    }
    console.log(`archimate: modello "${useCase}" valido (${built.model.elements.length} elementi, ${built.model.relations.length} relazioni); file generati aggiornati.`);
    return;
  }

  for (const o of built.outputs) writeFileSync(o.path, o.content, 'utf8');
  console.log(`archimate: modello "${useCase}" valido; scritti ${built.outputs.map((o) => o.path).join(', ')}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
