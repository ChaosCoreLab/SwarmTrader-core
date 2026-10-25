#!/usr/bin/env node
/** Read-only ArchiMate pre-PR check and downloadable, interactive HTML preview. */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildUseCase, parseLayerFile, ROOT } from './gen-archimate.mjs';

const REPO = 'https://github.com/ChaosCoreLab/SwarmTrader-core';
const EDIT_BASE = `${REPO}/edit/main/`;
const lf = (text) => text.replace(/\r\n/g, '\n');
const esc = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function git(root, ...args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (result.error || result.status !== 0) {
    throw new Error(`git ${args[0]} non riuscito: ${(result.stderr || result.error?.message || '').trim()}`);
  }
  return result.stdout.trimEnd();
}

function gitFile(root, revision, path) {
  return git(root, 'show', `${revision}:${path}`);
}

function modelNames(paths) {
  return [...new Set(paths.map((p) => /^archimate\/([a-z0-9-]+)\/[^/]+layer\.md$/.exec(p)?.[1]).filter(Boolean))].sort();
}

function baseModel(root, revision, useCase, paths) {
  const layerFiles = paths.filter((p) => p.startsWith(`archimate/${useCase}/`) && p.endsWith('layer.md'));
  const elements = [];
  const relations = [];
  for (const path of layerFiles) {
    const file = parseLayerFile(gitFile(root, revision, path), path);
    elements.push(...file.elements.map((el) => ({ ...el, layer: el.layer || file.layer })));
    relations.push(...file.relations);
  }
  return { elements, relations };
}

/** Compare architectural content, not source line numbers or formatting. */
export function compareModels(before, after) {
  const elements = (model) => new Map(model.elements.map((el) => [el.id, {
    name: el.name, layer: el.layer, aspect: el.aspect, type: el.type, role: el.role || '', tech: el.tech || '',
  }]));
  const relations = (model) => new Map(model.relations.map((r) => [
    JSON.stringify([r.from, r.type, r.to]), { from: r.from, type: r.type, to: r.to, label: r.label || '' },
  ]));
  const diff = (left, right) => {
    const added = [], removed = [], changed = [];
    for (const [key, value] of right) {
      if (!left.has(key)) added.push({ id: key, ...value });
      else if (JSON.stringify(value) !== JSON.stringify(left.get(key))) changed.push({ id: key, before: left.get(key), after: value });
    }
    for (const [key, value] of left) if (!right.has(key)) removed.push({ id: key, ...value });
    return { added, removed, changed };
  };
  return { elements: diff(elements(before), elements(after)), relations: diff(relations(before), relations(after)) };
}

function changed(diff) {
  return Object.values(diff).some((category) => Object.values(category).some((items) => items.length > 0));
}

function page(title, fragment, sha) {
  return `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — ArchiMate</title><link rel="stylesheet" href="assets/archimate-browser.css">
<style>body{font:16px system-ui,sans-serif;color:#0f172a;background:#f8fafc;margin:0;padding:1rem}main{max-width:1600px;margin:auto}a{color:#1e40af}p{line-height:1.5}</style></head>
<body><main><p><a href="index.html">← Riepilogo</a></p><h1>${esc(title)}</h1><p>Revisione: <code>${esc(sha)}</code></p>
${fragment}</main><script src="assets/archimate-browser.js" defer></script></body></html>\n`;
}

function summary(cases, base, head, changedFiles) {
  const rows = cases.map(({ name, diff, before, after }) => {
    const label = changed(diff) ? 'Modello modificato' : 'Nessuna differenza nel modello';
    const lines = [];
    for (const [kind, category] of Object.entries(diff)) {
      for (const [action, items] of Object.entries(category)) {
        for (const item of items) {
          const display = kind === 'elements' ? item.after?.name || item.name || item.id : `${item.after?.from || item.from} ${item.after?.type || item.type} ${item.after?.to || item.to}`;
          const details = action === 'changed'
            ? Object.keys(item.after).filter((field) => item.before[field] !== item.after[field]).map((field) => `${field}: ${item.before[field]} → ${item.after[field]}`).join('; ')
            : '';
          lines.push(`<li>${esc(kind)} — ${esc(action)}: ${esc(display)}${details ? ` — ${esc(details)}` : ''}</li>`);
        }
      }
    }
    return `<section><h2>${esc(name)} — ${label}</h2><p>${before ? `<a href="base-${name}.html">Prima</a>` : 'Nuovo modello'} · ${after ? `<a href="head-${name}.html">Dopo</a>` : 'Modello rimosso'}</p>
${lines.length ? `<ul>${lines.join('')}</ul>` : '<p>Nessuna modifica ArchiMate: motivare nella PR se il codice di prodotto cambia.</p>'}</section>`;
  });
  return `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Anteprima ArchiMate — PR</title>
<style>body{font:16px system-ui,sans-serif;line-height:1.5;color:#0f172a;max-width:900px;margin:2rem auto;padding:0 1rem}a{color:#1e40af}code{overflow-wrap:anywhere}section{border-top:1px solid #cbd5e1;margin-top:1.5rem}</style></head>
<body><h1>Anteprima ArchiMate pre-PR</h1><p>Base: <code>${esc(base)}</code><br>Branch: <code>${esc(head)}</code></p>
<p>Questo confronto descrive il modello, non certifica che rappresenti correttamente il prodotto: la revisione del contenuto resta necessaria.</p>
<details><summary>File modificati (${changedFiles.length})</summary><ul>${changedFiles.map((file) => `<li><code>${esc(file)}</code></li>`).join('')}</ul></details>${rows.join('')}</body></html>\n`;
}

/** Validate everything before writing the ignored preview directory. */
export function createPreview({ root = ROOT, baseRef, output }) {
  if (!baseRef || !/^[a-zA-Z0-9_./~^-]+$/.test(baseRef) || baseRef.startsWith('-')) {
    throw new Error('Indicare un riferimento Git valido con --base (es. origin/main).');
  }
  const cache = resolve(root, '.cache');
  if (output) {
    const destination = resolve(root, output);
    if (destination === cache || !destination.startsWith(cache + sep)) throw new Error('La preview deve essere in una sottocartella di .cache/.');
  }
  if (git(root, 'status', '--porcelain', '--untracked-files=all')) throw new Error('Working tree non pulita: creare un commit prima della preview.');
  const head = git(root, 'rev-parse', 'HEAD');
  const base = git(root, 'merge-base', baseRef, 'HEAD');
  const out = resolve(root, output || join(cache, 'archimate-pr-preview', `${head}-${base}`));
  if (out === cache || !out.startsWith(cache + sep)) throw new Error('La preview deve essere in una sottocartella di .cache/.');
  const headPaths = git(root, 'ls-tree', '-r', '--name-only', 'HEAD', '--', 'archimate').split('\n').filter(Boolean);
  const basePaths = git(root, 'ls-tree', '-r', '--name-only', base, '--', 'archimate').split('\n').filter(Boolean);
  const names = [...new Set([...modelNames(headPaths), ...modelNames(basePaths)])].sort();
  if (!names.length) throw new Error('Nessun caso d’uso ArchiMate nei due commit.');

  const files = [];
  const cases = [];
  for (const name of names) {
    const before = modelNames(basePaths).includes(name);
    const after = modelNames(headPaths).includes(name);
    const oldModel = before ? baseModel(root, base, name, basePaths) : { elements: [], relations: [] };
    let newModel = { elements: [], relations: [] };
    if (after) {
      const built = buildUseCase(name, { archDir: join(root, 'archimate'), rootDir: root });
      if (built.errors.length) throw new Error(built.errors.join('\n'));
      const doc = `docs/architecture/use-case-${name}.md`;
      if (!built.outputs.some((o) => o.path === join(root, doc))) throw new Error(`${doc} manca: la preview richiede la pagina del caso d’uso.`);
      const pageSource = readFileSync(join(root, doc), 'utf8');
      if (!pageSource.includes(`archimate_model: ${name}`) || !['archimate:matrix start', 'archimate:matrix end', 'archimate:gen start', 'archimate:gen end'].every((marker) => pageSource.includes(marker))) {
        throw new Error(`${doc} deve dichiarare il modello e includere i marcatori del diagramma e della matrice.`);
      }
      for (const { path, content } of built.outputs) {
        if (!existsSync(path) || lf(readFileSync(path, 'utf8')) !== lf(content)) {
          throw new Error(`${relative(root, path)} non aggiornato: rigenerare ArchiMate prima del commit.`);
        }
      }
      newModel = built.model;
      const fragment = built.outputs.find((o) => o.path === join(root, '_includes', 'use-cases', `${name}.html`)).content;
      files.push([`head-${name}.html`, page(`${name} — branch`, fragment.replaceAll(EDIT_BASE, `${REPO}/blob/${head}/`), head)]);
    }
    if (before) {
      const fragment = gitFile(root, base, `_includes/use-cases/${name}.html`);
      files.push([`base-${name}.html`, page(`${name} — base`, fragment.replaceAll(EDIT_BASE, `${REPO}/blob/${base}/`), base)]);
    }
    cases.push({ name, before, after, diff: compareModels(oldModel, newModel) });
  }
  const changedFiles = git(root, 'diff', '--name-only', base, 'HEAD', '--').split('\n').filter(Boolean);
  const manifest = { version: 1, repository: 'ChaosCoreLab/SwarmTrader-core', base, head, changedFiles, cases: cases.map((c) => ({ name: c.name, before: c.before, after: c.after, changed: changed(c.diff), diff: c.diff })) };
  files.push(['index.html', summary(cases, base, head, changedFiles)]);
  files.push(['manifest.json', JSON.stringify(manifest, null, 2) + '\n']);
  files.push(['assets/archimate-browser.css', readFileSync(join(root, 'assets/css/archimate-browser.css'), 'utf8')]);
  files.push(['assets/archimate-browser.js', readFileSync(join(root, 'assets/js/archimate-browser.js'), 'utf8')]);

  const previous = join(out, 'manifest.json');
  if (existsSync(previous)) {
    const last = JSON.parse(readFileSync(previous, 'utf8'));
    if (last.base !== base || last.head !== head) throw new Error('La cartella contiene una preview di altri commit: scegliere un output diverso.');
  }
  for (const [name, content] of files) {
    const path = join(out, name);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content, 'utf8');
  }
  return { manifest, output: out };
}

function main() {
  const args = process.argv.slice(2);
  let baseRef, output;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--base') baseRef = args[++i];
    else if (args[i] === '--output') output = args[++i];
    else throw new Error(`Opzione sconosciuta: ${args[i]}`);
  }
  const result = createPreview({ baseRef, ...(output ? { output } : {}) });
  console.log(`Anteprima per ${result.manifest.head}: ${relative(ROOT, result.output)}/index.html (${result.manifest.cases.length} casi d'uso).`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (err) { console.error('ERRORE: ' + err.message); process.exitCode = 1; }
}
