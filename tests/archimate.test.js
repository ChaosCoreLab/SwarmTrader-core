import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { checkModel, loadModel, loadVocabulary, parseLayerFile, ROOT } from '../scripts/gen-archimate.mjs';

const ARCH = join(ROOT, 'archimate');

test('the ENI replay model passes every modeling check', () => {
  const model = loadModel('eni-replay');
  const { errors } = checkModel(model, loadVocabulary());
  assert.deepEqual(errors, []);
  assert.deepEqual(model.ignored, []);
  const layers = new Set(model.elements.map((el) => el.layer));
  assert.deepEqual([...layers].sort(), ['application', 'business', 'motivation', 'technology']);
});

test('the ENI replay model has no software-house roles or code helpers (Owner review 2026-10-05)', () => {
  const names = loadModel('eni-replay').elements.map((el) => el.name.toLowerCase());
  for (const banned of ['product owner', 'librarian', 'acceptance criteria', 'fixedgenomega', 'adapt genome', 'validate snapshot']) {
    assert.ok(!names.some((n) => n.includes(banned)), `"${banned}" must not be modeled`);
  }
});

test('layer files ignore the commented editing guide and keep source line numbers', () => {
  const text = '---\nlayer: business\n---\n<!--\n- id: not_an_element\n-->\n## Elements\n\n### Analyst\n- id: bus_a\n- aspect: active-structure\n- type: business-role\n\n## Relations\n\n| from | relation | to | label |\n|---|---|---|---|\n| bus_a | assigned-to | bus_p | |\n';
  const parsed = parseLayerFile(text, 'x/businesslayer.md');
  assert.equal(parsed.elements.length, 1);
  assert.equal(parsed.elements[0].id, 'bus_a');
  assert.equal(parsed.elements[0].line, 9);
  assert.deepEqual(parsed.relations.map((r) => [r.from, r.type, r.to, r.line]), [['bus_a', 'assigned-to', 'bus_p', 18]]);
});

test('a defective model is rejected with messages that name the file, line and fix', () => {
  const dir = mkdtempSync(join(tmpdir(), 'archimate-'));
  copyFileSync(join(ARCH, '_vocabulary.md'), join(dir, '_vocabulary.md'));
  mkdirSync(join(dir, 'broken'));
  writeFileSync(join(dir, 'broken', 'businesslayer.md'), [
    '---', 'layer: business', '---', '## Elements', '',
    '### Analyst', '- id: bus_a', '- aspect: active-structure', '- type: business-role', '',
    '### Lonely', '- id: bus_lonely', '- aspect: behaviour', '- type: business-process', '',
    '### Old data', '- id: bus_old', '- aspect: passive-structure', '- type: business-object', '- tech: public/data/eni-ohlcv.json', '',
    '## Relations', '', '| from | relation | to | label |', '|---|---|---|---|',
    '| bus_a | assigned-to | bus_old | |',
    '| app_x | realizes | bus_old | |',
  ].join('\n'));
  writeFileSync(join(dir, 'broken', 'applicationlayer.md'), [
    '---', 'layer: application', '---', '## Elements', '',
    '### X', '- id: app_x', '- aspect: behaviour', '- type: business-process', '',
    '### Y', '- id: app_y', '- aspect: passive-structure', '- type: data-object', '',
    '## Relations', '', '| from | relation | to | label |', '|---|---|---|---|',
    '| app_x | uses | app_y | |',
  ].join('\n'));

  const { errors, warnings } = checkModel(loadModel('broken', dir), loadVocabulary(dir));
  const all = errors.join('\n');
  assert.match(all, /businesslayer\.md:11 — l'elemento "Lonely" non ha relazioni/);
  assert.match(all, /il percorso "public\/data\/eni-ohlcv\.json" citato in 'tech' di "Old data" non esiste più/);
  assert.match(all, /la relazione app_x → bus_old va scritta in archimate\/broken\/applicationlayer\.md/);
  assert.match(all, /il tipo "business-process" non è ammesso per livello Application, aspetto behaviour/);
  assert.match(all, /relazione "uses" non ammessa/);
  assert.match(warnings.join('\n'), /il data object "Y" non realizza nessun business object/);
});
