/** @see ../../docs/architecture/simulator-overview.md#components */
import { IStockStreamProvider, StockData, StockStream } from '../vendor/consilium/stockStream.js';

export const SYMBOL = 'ENI.MTA';
export const START_DATE = '2016-09-29';
export const CUTOFF_DATE = '2026-09-28';
export const DATA_PERIOD = `${START_DATE}_${CUTOFF_DATE}`;

function isIsoDate(value) {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;
}

export function validateSnapshot(snapshot) {
  if (snapshot?.schemaVersion !== 1) throw new Error('Unsupported ENI snapshot schema.');
  if (snapshot.symbol !== SYMBOL) throw new Error(`Expected ${SYMBOL} snapshot.`);
  if (!Array.isArray(snapshot.bars) || snapshot.bars.length === 0) throw new Error('Snapshot contains no OHLCV bars.');

  const seen = new Set();
  let previous = '';

  for (const bar of snapshot.bars) {
    if (!isIsoDate(bar?.time)) throw new Error('Every bar must have a UTC YYYY-MM-DD date.');
    if (seen.has(bar.time)) throw new Error(`Duplicate market date ${bar.time}.`);
    if (previous && bar.time <= previous) throw new Error(`Bars are not strictly ordered at ${bar.time}.`);
    previous = bar.time;
    seen.add(bar.time);

    const values = [bar.open, bar.high, bar.low, bar.close, bar.volume];
    if (values.some((value) => typeof value !== 'number' || !Number.isFinite(value))) {
      throw new Error(`Invalid OHLCV number on ${bar.time}.`);
    }
    if (bar.low <= 0 || bar.high < Math.max(bar.open, bar.close) || bar.low > Math.min(bar.open, bar.close) || bar.volume < 0) {
      throw new Error(`Invalid OHLCV bounds on ${bar.time}.`);
    }
  }

  if (snapshot.bars[0].time < START_DATE || snapshot.bars.at(-1).time > CUTOFF_DATE) {
    throw new Error(`Snapshot must stay within ${START_DATE}–${CUTOFF_DATE}.`);
  }

  return snapshot.bars;
}

export class DataTrainer extends IStockStreamProvider {
  constructor(snapshot) {
    super();
    this.snapshot = snapshot;
    this.bars = validateSnapshot(snapshot).filter((bar) => bar.time >= START_DATE && bar.time <= CUTOFF_DATE);
  }

  async read(symbol, period) {
    if (symbol !== SYMBOL) throw new Error(`DataTrainer only supports ${SYMBOL}.`);
    const key = `${symbol}_${period}`;
    const cached = this.getStreamByKey(key);
    if (cached) {
      cached.reset();
      return cached;
    }

    const stream = new StockStream();
    stream.stockName = symbol;
    stream.timeFrame = period;
    stream.stream = this.bars.map((bar) => new StockData(
      Date.parse(`${bar.time}T00:00:00.000Z`),
      bar.open,
      bar.low,
      bar.high,
      bar.close,
      bar.volume,
    ));

    this.setStreamByKey(key, stream);
    return stream;
  }
}