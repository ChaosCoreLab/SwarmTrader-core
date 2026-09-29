import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createConsiliumGenome, FIXED_GENOME } from '../src/engine/genome.js';
import { CUTOFF_DATE, DATA_PERIOD, DataTrainer, START_DATE, SYMBOL } from '../src/engine/dataTrainer.js';
import { FitnessValidator } from '../src/engine/fitnessValidator.js';
import { SimulationController } from '../src/engine/simulationController.js';
import { Individual } from '../src/vendor/consilium/individual.js';

function makeSnapshot(bars) {
  return {
    schemaVersion: 1,
    symbol: SYMBOL,
    bars,
  };
}

function makeBar(time, open, high, low, close, volume = 1_000) {
  return { time, open, high, low, close, volume };
}

test('genome adapter preserves IIR and converts all percentage fields to fractions', () => {
  const genome = createConsiliumGenome();

  assert.equal(genome.iirCoeff, FIXED_GENOME.iir_price_1);
  assert.equal(genome.iirCoeff2, FIXED_GENOME.iir_price_2);
  assert.equal(genome.iirCoeffV, FIXED_GENOME.iir_volume_1);
  assert.equal(genome.iirCoeffV2, FIXED_GENOME.iir_volume_2);
  assert.equal(genome.buyPercent, FIXED_GENOME.buy_percent / 100);
  assert.equal(genome.marginPercent, FIXED_GENOME.margin_percent_1 / 100);
  assert.equal(genome.marginPercent2, FIXED_GENOME.margin_percent_2 / 100);
  assert.equal(genome.marginVPercent, FIXED_GENOME.margin_volume_percent_1 / 100);
  assert.equal(genome.marginVPercent2, FIXED_GENOME.margin_volume_percent_2 / 100);
  assert.equal(genome.stopLossPercent, FIXED_GENOME.stop_loss_percent / 100);
  assert.equal(genome.takeProfitPercent, FIXED_GENOME.take_profit_percent / 100);
  assert.equal(genome.states.SW.action, 'buy');
  assert.ok(Object.isFrozen(genome.states.SW._S));
  assert.ok(Object.isFrozen(genome));
});

test('genome adapter matches Consilium Individual.fromJSON, the GA worker loader for snake_case genomes', () => {
  const adapted = createConsiliumGenome();
  const upstream = Individual.fromJSON(structuredClone(FIXED_GENOME), 10_000).genoma;

  for (const field of Object.keys(upstream).filter((key) => key !== 'states')) {
    assert.equal(adapted[field], upstream[field], field);
  }
  assert.deepEqual(structuredClone(adapted.states), structuredClone(upstream.states));
});

test('genome adapter rejects missing states and invalid conditions', () => {
  const missingState = structuredClone(FIXED_GENOME);
  delete missingState.states.NW;
  assert.throws(() => createConsiliumGenome(missingState), /Missing genome state NW/);

  const invalidCondition = structuredClone(FIXED_GENOME);
  invalidCondition.states.NW._SW[0] = 14;
  assert.throws(() => createConsiliumGenome(invalidCondition), /Invalid condition ID/);
});

test('DataTrainer maps validated OHLCV into Consilium StockData and respects cutoff', async () => {
  const snapshot = makeSnapshot([
    makeBar(START_DATE, 10, 12, 9, 11),
    makeBar('2026-09-25', 20, 22, 19, 21),
  ]);
  const trainer = new DataTrainer(snapshot);
  const stream = await trainer.read(SYMBOL, DATA_PERIOD);

  assert.equal(stream.getLength(), 2);
  assert.equal(stream.stream[0].open, 10);
  assert.equal(stream.stream[0].max, 12);
  assert.equal(stream.stream[0].min, 9);
  assert.equal(stream.stream[1].close, 21);
  assert.equal(new Date(stream.stream[1].t).toISOString().slice(0, 10), '2026-09-25');
  assert.ok(stream.stream.every((bar) => new Date(bar.t).toISOString().slice(0, 10) <= CUTOFF_DATE));
});

test('DataTrainer rejects duplicate and malformed bars before simulation', () => {
  assert.throws(() => new DataTrainer(makeSnapshot([
    makeBar(START_DATE, 10, 12, 9, 11),
    makeBar(START_DATE, 10, 12, 9, 11),
  ])), /Duplicate market date/);

  assert.throws(() => new DataTrainer(makeSnapshot([
    makeBar(START_DATE, 10, 8, 9, 11),
  ])), /Invalid OHLCV bounds/);
});

test('FitnessValidator accepts a coherent buy/sell lifecycle and rejects an orphan sell', () => {
  const validator = new FitnessValidator();
  const buyFrame = {
    time: '2026-09-24',
    bar: { open: 10, high: 11, low: 9, close: 10, volume: 100 },
    state: 'SW',
    iirPrice1: 10,
    iirPrice2: 10,
    iirVolume1: 100,
    iirVolume2: 100,
    operations: [{ side: 'buy', reason: 'signal', time: '2026-09-24', price: 10, quantity: 5 }],
  };
  const sellFrame = {
    time: '2026-09-25',
    bar: { open: 10, high: 12, low: 9, close: 11, volume: 100 },
    state: 'C',
    iirPrice1: 10,
    iirPrice2: 10,
    iirVolume1: 100,
    iirVolume2: 100,
    operations: [{ side: 'sell', reason: 'take profit', time: '2026-09-25', price: 11.5, quantity: 5 }],
  };

  const result = validator.validate([buyFrame, sellFrame]);
  assert.equal(result.valid, true);
  assert.equal(result.checkedOperations, 2);
  assert.equal(validator.validate([sellFrame]).valid, false);
});

test('FitnessValidator accepts Consilium stop fills across an opening gap', () => {
  const validator = new FitnessValidator();
  const trace = [
    {
      time: '2026-09-24',
      bar: { open: 20, high: 21, low: 19, close: 20, volume: 100 },
      state: 'SW', iirPrice1: 20, iirPrice2: 20, iirVolume1: 100, iirVolume2: 100,
      operations: [{ side: 'buy', reason: 'signal', time: '2026-09-24', price: 20, quantity: 5 }],
    },
    {
      time: '2026-09-25',
      bar: { open: 8, high: 9, low: 7, close: 8, volume: 100 },
      state: 'N', iirPrice1: 19, iirPrice2: 19, iirVolume1: 100, iirVolume2: 100,
      operations: [{ side: 'sell', reason: 'stop loss', time: '2026-09-25', price: 10, quantity: 5 }],
    },
  ];

  assert.equal(validator.validate(trace).valid, true);
});

test('SimulationController replays one market bar per step and validates at EOF', async () => {
  const snapshot = makeSnapshot([
    makeBar(START_DATE, 10, 11, 9, 10),
    makeBar('2016-09-30', 10, 11, 9, 10),
    makeBar('2016-10-03', 10, 11, 9, 10),
  ]);
  const controller = new SimulationController(snapshot);

  await controller.start();
  assert.equal(controller.trace.length, 1);
  await controller.step();
  assert.equal(controller.trace.length, 2);
  await controller.step();
  assert.equal(controller.complete, true);
  assert.equal(controller.validation.valid, true);
  assert.equal(controller.validation.checkedBars, 3);
});

test('SimulationController replays the downloaded ENI snapshot without truncation', async () => {
  const snapshotUrl = new URL('../public/data/eni-ohlcv.json', import.meta.url);
  const snapshot = JSON.parse(await readFile(snapshotUrl, 'utf8'));
  const controller = new SimulationController(snapshot);

  await controller.start();
  await controller.playToEnd();

  assert.equal(controller.trace.length, snapshot.barCount);
  assert.equal(controller.trace[0].time, '2016-09-29');
  assert.equal(controller.trace.at(-1).time, '2026-09-28');
  assert.equal(controller.validation.valid, true);
  assert.equal(controller.validation.checkedBars, 2517);
  const operations = controller.trace.flatMap((frame) => frame.operations);
  assert.ok(operations.some((operation) => operation.side === 'buy'), 'expected at least one buy signal');
  assert.ok(operations.some((operation) => operation.side === 'sell'), 'expected at least one sell or automatic close');
});

test('identical genome and snapshot produce a byte-identical broker/state trace', async () => {
  const snapshotUrl = new URL('../public/data/eni-ohlcv.json', import.meta.url);
  const snapshot = JSON.parse(await readFile(snapshotUrl, 'utf8'));
  const first = new SimulationController(snapshot);
  const second = new SimulationController(snapshot);

  await first.start();
  await first.playToEnd();
  await second.start();
  await second.playToEnd();

  assert.deepEqual(second.trace, first.trace);
  assert.equal(second.validation.valid, true);
});