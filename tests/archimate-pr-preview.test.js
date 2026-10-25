import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { buildUseCase, ROOT } from '../scripts/gen-archimate.mjs';
import { compareModels, createPreview } from '../scripts/archimate-pr-preview.mjs';

const tempRoot = join(tmpdir(), 'opencode');
const name = 'example';
function git(root, ...args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function write(root, path, content) {
  const absolute = join(root, path);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, content);
}

function layer(layerName, elements, relations) {
  return `---\nuse_case: ${name}\nlayer: ${layerName}\n---\n\n## Elements\n\n${elements}\n## Relations\n\n| from | relation | to | label |\n|---|---|---|---|\n${relations}\n`;
}

function regenerate(root) {
  const built = buildUseCase(name, { rootDir: root, archDir: join(root, 'archimate') });
  assert.deepEqual(built.errors, []);
  for (const { path, content } of built.outputs) write(root, path.slice(root.length + 1), content);
}

function fixture(t) {
  mkdirSync(tempRoot, { recursive: true });
  const root = mkdtempSync(join(tempRoot, 'archimate-preview-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  write(root, '.gitignore', '.cache/\n');
  mkdirSync(join(root, 'archimate'), { recursive: true });
  copyFileSync(join(ROOT, 'archimate/_vocabulary.md'), join(root, 'archimate/_vocabulary.md'));
  write(root, `archimate/${name}/motivationlayer.md`, layer('motivation', '### Goal\n- id: goal\n- aspect: motivation\n- type: goal\n- role: Initial goal\n', '| goal | association | process | |'));
  write(root, `archimate/${name}/businesslayer.md`, layer('business', '### Business process\n- id: process\n- aspect: behaviour\n- type: business-process\n- role: Initial process\n', '| process | realizes | goal | |'));
  write(root, `archimate/${name}/applicationlayer.md`, layer('application', '### Application\n- id: component\n- aspect: active-structure\n- type: application-component\n- role: Initial component\n\n### Application service\n- id: app_service\n- aspect: behaviour\n- type: application-service\n- role: Initial service\n', '| component | realizes | app_service | |\n| app_service | serves | process | |'));
  write(root, `archimate/${name}/technologylayer.md`, layer('technology', '### Runtime\n- id: node\n- aspect: active-structure\n- type: node\n- role: Initial runtime\n\n### Technology service\n- id: tech_service\n- aspect: behaviour\n- type: technology-service\n- role: Initial hosting\n', '| node | realizes | tech_service | |\n| tech_service | serves | app_service | |'));
  write(root, `docs/architecture/use-case-${name}.md`, `---\narchimate_model: ${name}\n---\n<!-- archimate:matrix start -->\n<!-- archimate:matrix end -->\n<!-- archimate:gen start -->\n<!-- archimate:gen end -->\n`);
  write(root, 'assets/css/archimate-browser.css', readFileSync(join(ROOT, 'assets/css/archimate-browser.css')));
  write(root, 'assets/js/archimate-browser.js', readFileSync(join(ROOT, 'assets/js/archimate-browser.js')));
  regenerate(root);
  git(root, 'init', '-b', 'main');
  git(root, 'config', 'user.name', 'Preview Test');
  git(root, 'config', 'user.email', 'preview@example.invalid');
  git(root, 'add', '.');
  git(root, 'commit', '-m', 'Base model');
  return root;
}

test('model diff ignores source line numbers but reports changed roles, elements and relations', () => {
  const before = { elements: [{ id: 'x', name: 'X', layer: 'business', aspect: 'behaviour', type: 'business-process', role: 'Old' }], relations: [] };
  const after = { elements: [{ ...before.elements[0], line: 500, role: 'New' }, { id: 'y', name: 'Y', layer: 'business', aspect: 'behaviour', type: 'business-process' }], relations: [{ from: 'y', type: 'flows-to', to: 'x' }] };
  const diff = compareModels(before, after);
  assert.equal(diff.elements.changed[0].after.role, 'New');
  assert.equal(diff.elements.added[0].id, 'y');
  assert.equal(diff.relations.added[0].from, 'y');
  assert.equal(diff.elements.removed.length, 0);
});

test('generates a repeatable before/after preview without touching tracked files', (t) => {
  const root = fixture(t);
  const before = git(root, 'rev-parse', 'HEAD');
  const path = join(root, `archimate/${name}/applicationlayer.md`);
  writeFileSync(path, readFileSync(path, 'utf8').replace('Initial component', 'Updated component'));
  regenerate(root);
  git(root, 'add', '.');
  git(root, 'commit', '-m', 'Update architecture');
  const head = git(root, 'rev-parse', 'HEAD');
  const result = createPreview({ root, baseRef: before });
  assert.equal(result.manifest.base, before);
  assert.equal(result.manifest.head, head);
  assert.equal(result.manifest.cases[0].changed, true);
  assert.ok(result.manifest.changedFiles.includes(`archimate/${name}/applicationlayer.md`));
  assert.equal(result.manifest.cases[0].diff.elements.changed[0].after.role, 'Updated component');
  assert.match(readFileSync(join(result.output, 'index.html'), 'utf8'), /Modello modificato/);
  assert.match(readFileSync(join(result.output, `head-${name}.html`), 'utf8'), new RegExp(`blob/${head}/archimate/`));
  assert.match(readFileSync(join(result.output, `base-${name}.html`), 'utf8'), new RegExp(`blob/${before}/archimate/`));
  const first = readFileSync(join(result.output, 'manifest.json'), 'utf8');
  createPreview({ root, baseRef: before });
  assert.equal(readFileSync(join(result.output, 'manifest.json'), 'utf8'), first);
  assert.equal(git(root, 'status', '--porcelain'), '');
});

test('an unchanged model still produces an interactive preview', (t) => {
  const root = fixture(t);
  const base = git(root, 'rev-parse', 'HEAD');
  write(root, 'README.md', 'Only documentation changed.\n');
  git(root, 'add', '.');
  git(root, 'commit', '-m', 'Change only prose');
  const result = createPreview({ root, baseRef: base });
  assert.equal(result.manifest.cases[0].changed, false);
  assert.deepEqual(result.manifest.changedFiles, ['README.md']);
  assert.match(readFileSync(join(result.output, 'index.html'), 'utf8'), /Nessuna differenza nel modello/);
  assert.match(readFileSync(join(result.output, `head-${name}.html`), 'utf8'), /archimate-browser-root/);
});

test('refuses uncommitted changes and stale generated files', (t) => {
  const root = fixture(t);
  const path = join(root, `archimate/${name}/applicationlayer.md`);
  writeFileSync(path, readFileSync(path, 'utf8').replace('Initial component', 'Updated component'));
  assert.throws(() => createPreview({ root, baseRef: 'HEAD' }), /Working tree non pulita/);
  git(root, 'add', '.');
  git(root, 'commit', '-m', 'Unregenerated model');
  assert.throws(() => createPreview({ root, baseRef: 'HEAD~1' }), /non aggiornato/);
});

test('refuses malformed models and refuses to write outside ignored cache', (t) => {
  const root = fixture(t);
  assert.throws(() => createPreview({ root, baseRef: 'HEAD', output: join(root, 'docs/preview') }), /sottocartella di .cache/);
  const path = join(root, `archimate/${name}/technologylayer.md`);
  writeFileSync(path, readFileSync(path, 'utf8').replace('tech_service | serves | app_service', 'tech_service | serves | missing'));
  git(root, 'add', '.');
  git(root, 'commit', '-m', 'Invalid relation');
  assert.throws(() => createPreview({ root, baseRef: 'HEAD~1' }), /non esiste/);
  assert.equal(git(root, 'status', '--porcelain'), '');
});

test('a case without generated blocks in its use-case page is not silently accepted', (t) => {
  const root = fixture(t);
  const doc = join(root, `docs/architecture/use-case-${name}.md`);
  writeFileSync(doc, readFileSync(doc, 'utf8').replace('<!-- archimate:gen start -->', ''));
  git(root, 'add', '.');
  git(root, 'commit', '-m', 'Remove generated block marker');
  assert.throws(() => createPreview({ root, baseRef: 'HEAD~1' }), /marcatori del diagramma/);
});

test('both instance profiles and agent adapters point to the same project PR rule', () => {
  const rule = '.swhouse/policies/archimate-pr-preview.md';
  for (const path of ['.swhouse/instance.yaml', '.swhouse/instances/ubuntu-workstation.yaml', 'CLAUDE.md', '.github/copilot-instructions.md']) {
    assert.ok(readFileSync(join(ROOT, path), 'utf8').includes(rule), `${path} must reference the project rule`);
  }
  const policy = readFileSync(join(ROOT, rule), 'utf8');
  assert.match(policy, /ogni PR/);
  assert.match(policy, /origin\/main/);
  assert.match(policy, /NRC-H02/);
});
