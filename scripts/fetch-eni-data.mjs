/** @see ../docs/operations/development.md#update-local-eni-snapshot */
import { createHash } from 'node:crypto';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ENDPOINT = 'https://charts.borsaitaliana.it/charts/services/ChartWService.asmx/GetPricesWithVolume';
const START_DATE = '2016-09-29';
const CUTOFF_DATE = '2026-09-28';
const MAX_RESPONSE_BYTES = 5_000_000;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(ROOT, 'public', 'data', 'eni-ohlcv.json');

function normalizeRows(rows) {
  if (!Array.isArray(rows)) {
    throw new Error('Borsa Italiana response does not contain a row array.');
  }

  const bars = [];
  let previousDate = '';
  const dates = new Set();

  for (const row of rows) {
    if (!Array.isArray(row) || row.length < 7) {
      throw new Error('Borsa Italiana returned a malformed OHLCV row.');
    }

    const timestamp = Number(row[0]);
    const time = Number.isFinite(timestamp)
      ? new Date(timestamp).toISOString().slice(0, 10)
      : '';
    const values = row.slice(2, 7).map(Number);
    const [open, high, low, close, volume] = values;

    if (!time || values.some((value) => !Number.isFinite(value))) {
      throw new Error(`Invalid numeric value in Borsa row for ${time || 'unknown date'}.`);
    }
    if (previousDate && time <= previousDate) {
      throw new Error(`Borsa rows are not strictly increasing at ${time}.`);
    }
    previousDate = time;

    if (time < START_DATE || time > CUTOFF_DATE) continue;
    if (dates.has(time)) throw new Error(`Duplicate market date ${time}.`);
    if (low <= 0 || high < Math.max(open, close) || low > Math.min(open, close) || volume < 0) {
      throw new Error(`Invalid OHLCV bounds for ${time}.`);
    }

    dates.add(time);
    bars.push({ time, open, high, low, close, volume });
  }

  if (bars.length === 0 || bars[0].time !== START_DATE) {
    throw new Error(`No complete ENI history starting on ${START_DATE} was returned.`);
  }

  return bars;
}

const requestBody = {
  request: {
    SampleTime: '1d',
    TimeFrame: '10y',
    RequestedDataSetType: 'ohlc',
    ChartPriceType: 'price',
    Key: 'ENI.MTA',
    OffSet: 0,
    FromDate: null,
    ToDate: null,
    UseDelay: false,
    KeyType: 'Topic',
    KeyType2: 'Topic',
    Language: 'it-IT',
  },
};

const abortController = new AbortController();
const timeout = setTimeout(() => abortController.abort(), 30_000);

try {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(requestBody),
    signal: abortController.signal,
  });

  if (!response.ok) throw new Error(`Borsa Italiana returned HTTP ${response.status}.`);
  const responseText = await response.text();
  if (Buffer.byteLength(responseText, 'utf8') > MAX_RESPONSE_BYTES) {
    throw new Error(`Borsa response exceeds ${MAX_RESPONSE_BYTES} bytes.`);
  }

  const payload = JSON.parse(responseText);
  const bars = normalizeRows(payload?.d);
  const dataSha256 = createHash('sha256').update(JSON.stringify(bars)).digest('hex');
  const snapshot = {
    schemaVersion: 1,
    symbol: 'ENI.MTA',
    interval: '1d',
    requestedFrom: START_DATE,
    cutoffDate: CUTOFF_DATE,
    firstBarDate: bars[0].time,
    lastBarDate: bars.at(-1).time,
    barCount: bars.length,
    retrievedAt: new Date().toISOString(),
    source: {
      name: 'Borsa Italiana',
      endpoint: ENDPOINT,
      request: requestBody.request,
    },
    dataSha256,
    bars,
  };

  await mkdir(path.dirname(OUTPUT), { recursive: true });
  const temporaryOutput = `${OUTPUT}.tmp`;
  await writeFile(temporaryOutput, `${JSON.stringify(snapshot)}\n`, 'utf8');
  await rename(temporaryOutput, OUTPUT);

  console.log(JSON.stringify({
    output: path.relative(ROOT, OUTPUT),
    barCount: snapshot.barCount,
    firstBarDate: snapshot.firstBarDate,
    lastBarDate: snapshot.lastBarDate,
    cutoffDate: snapshot.cutoffDate,
    dataSha256,
  }, null, 2));
} finally {
  clearTimeout(timeout);
}