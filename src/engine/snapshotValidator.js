/**
 * Validates an ENI OHLCV snapshot object (shape, cutoff date, SHA-256 integrity).
 * Extracted from src/main.js so it is unit-testable and reusable.
 * @see ../../docs/operations/development.md#update-local-eni-snapshot
 */

const REQUIRED_CUTOFF_DATE = '2026-09-28';

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates a loaded snapshot object and returns it if all checks pass.
 * @param {object} loaded - the parsed snapshot object
 * @param {{ sha256?: (v: string) => Promise<string> }} [deps] - optional sha256 override (for tests)
 * @returns {Promise<object>} the validated snapshot
 * @throws {Error} if any check fails
 */
export async function validateSnapshot(loaded, deps = {}) {
  const hashFn = deps.sha256 || sha256;
  if (!loaded || !Array.isArray(loaded.bars) || loaded.bars.length === 0) {
    throw new Error('Lo snapshot ENI non contiene barre OHLCV.');
  }
  if (loaded.cutoffDate !== REQUIRED_CUTOFF_DATE) {
    throw new Error(`Cutoff snapshot non valido: è richiesto il ${REQUIRED_CUTOFF_DATE}.`);
  }
  const actualHash = await hashFn(JSON.stringify(loaded.bars));
  if (actualHash !== loaded.dataSha256) {
    throw new Error('Hash snapshot non valido: i dati potrebbero essere incompleti o modificati.');
  }
  return loaded;
}
