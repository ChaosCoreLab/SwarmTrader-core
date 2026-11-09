import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { ROOT } from '../scripts/gen-archimate.mjs';
import { assertRuleReferenced } from './lib/instance-paths.mjs';

test('both profiles and agent adapters share the SwarmTrader board-state rule', () => {
  const rule = '.swhouse/policies/board-status.md';
  assertRuleReferenced(rule);
  const policy = readFileSync(join(ROOT, rule), 'utf8');
  for (const status of ['In progress', 'In review', 'Done', 'Cancelled']) assert.ok(policy.includes(status), `missing ${status}`);
  assert.match(policy, /projects\/1/);
  assert.match(policy, /verifiche umane ancora pendenti/);
});
