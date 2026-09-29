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
 *
 * Usage:
 *   node scripts/gen-archimate.mjs <use-case>                 # write block into docs
 *   node scripts/gen-archimate.mjs <use-case> --check         # exit non-zero if committed block differs
 *   node scripts/gen-archimate.mjs <use-case> --emit stdout   # print PlantUML to stdout
 *   node scripts/gen-archimate.mjs <use-case> --emit matrix   # print the Markdown matrix to stdout
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
      declared.set(el.id, { type: el.type, layer, aspect, name: el.name });
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

// ─── doc injection (idempotent between markers) ───

const START = '<!-- archimate:gen start -->';
const END = '<!-- archimate:gen end -->';

function injectBlock(docPath, block, matrix) {
  let text = readFileSync(docPath, 'utf8');
  const re = new RegExp(START + '[\\s\\S]*?' + END);
  const replacement = START + '\n```plantuml\n' + block + '\n```\n' + END;
  if (re.test(text)) text = text.replace(re, replacement);
  const MSTART = '<!-- archimate:matrix start -->';
  const MEND = '<!-- archimate:matrix end -->';
  const mre = new RegExp(MSTART + '[\\s\\S]*?' + MEND);
  const mrep = MSTART + '\n' + matrix + '\n' + MEND;
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
