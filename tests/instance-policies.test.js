import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { ROOT } from '../scripts/gen-archimate.mjs';

test('both profiles and agent adapters share the SwarmTrader board-state rule', () => {
  const rule = '.swhouse/policies/board-status.md';
  const paths = ['.swhouse/instance.yaml', '.swhouse/instances/ubuntu-workstation.yaml', 'CLAUDE.md', '.github/copilot-instructions.md'];
  for (const path of paths) {
    assert.ok(readFileSync(join(ROOT, path), 'utf8').includes(rule), `${path} must reference the board rule`);
  }
  const policy = readFileSync(join(ROOT, rule), 'utf8');
  for (const status of ['In progress', 'In review', 'Done', 'Cancelled']) assert.ok(policy.includes(status), `missing ${status}`);
  assert.match(policy, /projects\/1/);
  assert.match(policy, /verifiche umane ancora pendenti/);
});
