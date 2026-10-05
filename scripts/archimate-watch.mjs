#!/usr/bin/env node
/**
 * Live preview of an ArchiMate use-case model while it is being edited.
 *
 *   npm run archimate:watch            (use case eni-replay, http://127.0.0.1:5180/)
 *   node scripts/archimate-watch.mjs <use-case> [port]
 *
 * On every save of archimate/<use-case>/*layer.md the model is checked; if it is
 * valid the docs block and the Jekyll fragment are regenerated and the open
 * preview page reloads by itself. If it is not valid, the errors are shown in the
 * terminal and on the page, and the last valid preview stays visible.
 */
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, watch } from 'node:fs';
import { join } from 'node:path';
import { buildUseCase, printReport, ROOT } from './gen-archimate.mjs';

const useCase = process.argv[2] || 'eni-replay';
const port = Number(process.argv[3] || 5180);
const css = () => readFileSync(join(ROOT, 'assets', 'css', 'archimate-browser.css'), 'utf8');
const js = () => readFileSync(join(ROOT, 'assets', 'js', 'archimate-browser.js'), 'utf8');

let version = 0;
let fragment = '<p>Nessuna anteprima valida.</p>';
let problems = [];

function rebuild() {
  let built;
  try {
    built = buildUseCase(useCase);
  } catch (err) {
    problems = [String(err.message || err)];
    version += 1;
    console.error('ERRORE: ' + problems[0]);
    return;
  }
  printReport(built);
  problems = built.errors.concat(built.warnings.map((w) => 'Attenzione: ' + w));
  if (!built.errors.length) {
    for (const o of built.outputs) writeFileSync(o.path, o.content, 'utf8');
    fragment = built.outputs[0].content;
    console.log(`${new Date().toLocaleTimeString('it-IT')} — modello valido: ${built.model.elements.length} elementi, ${built.model.relations.length} relazioni.`);
  }
  version += 1;
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function page() {
  const list = problems.length
    ? `<ul class="problems">${problems.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>`
    : '<p class="ok">Modello valido.</p>';
  return `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Anteprima ArchiMate — ${useCase}</title>
<style>body{margin:0;padding:16px;background:#f1f5f9;font-family:system-ui,sans-serif}
.bar{font-size:.85rem;margin-bottom:12px}.ok{color:#166534}.problems{color:#b91c1c;font-size:.85rem}
${css()}</style></head><body>
<div class="bar"><strong>Anteprima ${useCase}</strong> — si aggiorna a ogni salvataggio dei file in archimate/${useCase}/. ${list}</div>
${fragment}
<script>${js()}</script>
<script>let v=${version};setInterval(async()=>{try{const r=await fetch('/version');const n=Number(await r.text());if(n!==v)location.reload();}catch(e){}},1000);</script>
</body></html>`;
}

rebuild();
let timer = null;
watch(join(ROOT, 'archimate', useCase), () => {
  clearTimeout(timer);
  timer = setTimeout(rebuild, 150);
});

createServer((req, res) => {
  if (req.url === '/version') { res.end(String(version)); return; }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(page());
}).listen(port, '127.0.0.1', () => {
  console.log(`Anteprima: http://127.0.0.1:${port}/  (Ctrl+C per uscire)`);
});
