import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from '../../scripts/gen-archimate.mjs';

/** Files that must receive the same rules: both instance profiles and both agent adapters. */
export const INSTANCE_PATHS = ['.swhouse/instance.yaml', '.swhouse/instances/ubuntu-workstation.yaml', 'CLAUDE.md', '.github/copilot-instructions.md'];

/** Asserts that every profile and adapter references the given rule file. */
export function assertRuleReferenced(rule) {
  for (const path of INSTANCE_PATHS) {
    assert.ok(readFileSync(join(ROOT, path), 'utf8').includes(rule), `${path} must reference ${rule}`);
  }
}
