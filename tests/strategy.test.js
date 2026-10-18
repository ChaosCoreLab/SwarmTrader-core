/** @see ../docs/architecture/simulator-overview.md#strategy-contract */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createFsmFactory, FsmIndividual } from '../src/engine/fsmStrategy.js';
import { FitnessValidator } from '../src/engine/fitnessValidator.js';
import { FIXED_GENOME, GENOME_STATES } from '../src/engine/genome.js';
import { SimulationController } from '../src/engine/simulationController.js';
import { assertStrategy, StrategyIndividual } from '../src/engine/strategy.js';

const snapshot = JSON.parse(await readFile(new URL('../src/data/eni-ohlcv.json', import.meta.url), 'utf8'));

/** Test-only second kind of strategy: buy while the price is above its EMA, sell while below. */
class TrendStub extends StrategyIndividual {
  kind = 'trend-stub';
  labels = ['above', 'below'];

  constructor(initialCapital, alpha = 0.2) {
    super(initialCapital, { buyPercent: 0.5, stopLossPercent: 0.1, takeProfitPercent: 0.08 });
    this.alpha = alpha;
    this.ema = 0;
    this.price = 0;
  }

  initIndicators(stockData) {
    this.price = stockData.getActualValue();
    this.ema = this.price;
  }

  updateIndicators(stockData) {
    this.price = stockData.getActualValue();
    this.ema += (this.price - this.ema) * this.alpha;
  }

  resetIndicators() {
    this.ema = 0;
    this.price = 0;
  }

  decide() {
    return this.price > this.ema ? 'buy' : 'sell';
  }

  describe() {
    return { label: this.price > this.ema ? 'above' : 'below', indicators: { ema: this.ema, price: this.price } };
  }

  serialize() {
    return { kind: this.kind, alpha: this.alpha };
  }
}

async function replay(controller) {
  await controller.start();
  await controller.playToEnd();
  return controller;
}

test('assertStrategy accepts the FSM adapter and a second kind of strategy', () => {
  assert.doesNotThrow(() => assertStrategy(createFsmFactory()(10_000)));
  assert.doesNotThrow(() => assertStrategy(new TrendStub(10_000)));
});

test('assertStrategy names every missing member', () => {
  const incomplete = { kind: 'broken', labels: [], trader: {}, init() {}, feed() {} };
  assert.throws(
    () => assertStrategy(incomplete),
    /Invalid strategy "broken": missing or invalid labels \(non-empty array of strings\), trader, reset\(\), getCAGR\(\), getPerformanceSummary\(\), describe\(\), serialize\(\)\./,
  );
  assert.throws(() => assertStrategy(null), /Strategy must be an object/);
});

test('StrategyIndividual rejects an invalid decision and unimplemented hooks', () => {
  class BadAction extends TrendStub {
    decide() { return 'maybe'; }
  }
  const bad = new BadAction(10_000);
  const bar = { t: Date.UTC(2020, 0, 2), getActualValue: () => 10, open: 10, max: 11, min: 9, close: 10, volume: 1 };
  bad.init(bar);
  assert.throws(() => bad.feed({ ...bar, t: bar.t + 86_400_000 }), /invalid action: maybe/);

  class Empty extends StrategyIndividual { kind = 'empty'; labels = ['x']; }
  assert.throws(() => new Empty(10_000, {}).init(bar), /must implement initIndicators/);
});

test('FSM frames expose the strategy block and keep the flat IIR fields equal to it', async () => {
  const controller = await replay(new SimulationController(snapshot));
  assert.equal(controller.strategy.kind, 'fsm');
  assert.deepEqual(controller.strategy.labels, GENOME_STATES);
  assert.equal(controller.trace.length, 2517);

  for (const frame of controller.trace) {
    assert.equal(frame.strategy.kind, 'fsm');
    assert.equal(frame.strategy.label, frame.state);
    assert.deepEqual(frame.strategy.indicators, {
      iirPrice1: frame.iirPrice1,
      iirPrice2: frame.iirPrice2,
      iirVolume1: frame.iirVolume1,
      iirVolume2: frame.iirVolume2,
    });
  }
  assert.equal(controller.validation.valid, true);
});

test('FSM serialize returns an independent copy of the genome it was built from', () => {
  const individual = createFsmFactory(FIXED_GENOME)(10_000);
  assert.ok(individual instanceof FsmIndividual);
  const serialized = individual.serialize();
  assert.deepEqual(serialized, FIXED_GENOME);
  serialized.buy_percent = 1;
  assert.equal(individual.serialize().buy_percent, FIXED_GENOME.buy_percent);
});

test('a non-FSM strategy replays the ENI snapshot through the unchanged controller and validator', async () => {
  const run = () => replay(new SimulationController(snapshot, undefined, { createIndividual: (capital) => new TrendStub(capital) }));
  const first = await run();
  const second = await run();

  assert.equal(first.strategy.kind, 'trend-stub');
  assert.equal(first.trace.length, 2517);
  assert.equal(first.validation.valid, true);
  assert.deepEqual(second.trace, first.trace);

  const operations = first.trace.flatMap((frame) => frame.operations);
  assert.ok(operations.some((operation) => operation.side === 'buy'), 'the stub must open positions');
  assert.ok(operations.some((operation) => operation.side === 'sell'), 'the stub must close positions');
  for (const frame of first.trace) {
    assert.deepEqual(Object.keys(frame.strategy.indicators), ['ema', 'price']);
    assert.ok(['above', 'below'].includes(frame.state));
    assert.equal('iirPrice1' in frame, false, 'flat IIR fields belong to the FSM kind only');
  }
});

test('the validator checks labels and indicators of a non-FSM frame', () => {
  const validator = new FitnessValidator();
  const frame = (label, indicators) => ({
    time: '2026-09-24',
    bar: { open: 10, high: 11, low: 9, close: 10, volume: 100 },
    state: label,
    strategy: { kind: 'trend-stub', label, indicators },
    operations: [],
  });

  assert.equal(validator.validate([frame('above', { ema: 10 })], { labels: ['above', 'below'] }).valid, true);
  assert.match(validator.validate([frame('sideways', { ema: 10 })], { labels: ['above', 'below'] }).errors.join(' '), /Unknown algorithm state/);
  assert.match(validator.validate([frame('above', { ema: Number.NaN })], { labels: ['above', 'below'] }).errors.join(' '), /Non-finite indicator value/);
  assert.match(validator.validate([frame('above', {})], { labels: ['above', 'below'] }).errors.join(' '), /Non-finite indicator value/);
});

test('the validator accepts a position opened and closed by take profit within the same bar', () => {
  const trace = [{
    time: '2026-09-24',
    bar: { open: 10, high: 12, low: 9, close: 11, volume: 100 },
    state: 'above',
    strategy: { kind: 'trend-stub', label: 'above', indicators: { ema: 10 } },
    operations: [
      { side: 'sell', reason: 'take profit', time: '2026-09-24', price: 10.8, quantity: 5 },
      { side: 'buy', reason: 'signal', time: '2026-09-24', price: 10, quantity: 5 },
    ],
  }];
  assert.equal(new FitnessValidator().validate(trace, { labels: ['above'] }).valid, true);
  assert.equal(new FitnessValidator().validate([{ ...trace[0], operations: [trace[0].operations[0]] }], { labels: ['above'] }).valid, false);
});
