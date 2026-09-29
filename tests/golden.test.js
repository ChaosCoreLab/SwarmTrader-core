/** @see ../docs/operations/development.md#golden-reference-trace */
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { FIXED_GENOME } from '../src/engine/genome.js';
import { INITIAL_CAPITAL } from '../src/engine/fixedGenomeGA.js';
import { SimulationController } from '../src/engine/simulationController.js';

const GOLDEN = new URL('./golden/eni-fixed-genome.golden.json', import.meta.url);
const SNAPSHOT = new URL('../public/data/eni-ohlcv.json', import.meta.url);
const missing = existsSync(GOLDEN) ? false : 'golden trace missing: run `npm run golden` (see docs/operations/development.md)';

test('step-by-step replay matches the upstream Consilium Life.cycle golden trace (AC-04)', { skip: missing }, async () => {
  const golden = JSON.parse(await readFile(GOLDEN, 'utf8'));
  const snapshot = JSON.parse(await readFile(SNAPSHOT, 'utf8'));

  assert.equal(golden.snapshot.dataSha256, snapshot.dataSha256, 'golden was produced from a different snapshot');
  assert.deepEqual(FIXED_GENOME, golden.genome, 'FIXED_GENOME differs from the PO requirement genome');
  assert.equal(golden.initialCapital, INITIAL_CAPITAL);

  const controller = new SimulationController(snapshot);
  await controller.start();
  await controller.playToEnd();

  assert.equal(controller.trace.length, golden.frames.length);
  controller.trace.forEach((frame, index) => {
    const actual = [frame.time, frame.state, frame.iirPrice1, frame.iirPrice2, frame.iirVolume1, frame.iirVolume2];
    assert.deepEqual(actual, golden.frames[index], `frame ${index}`);
  });

  const broker = controller.life.child.trader.broker;
  const operations = Object.keys(broker.operationsByTimestamp)
    .sort((a, b) => Number(a) - Number(b))
    .flatMap((ts) => broker.operationsByTimestamp[ts].map((operation) => ({
      time: new Date(Number(ts)).toISOString().slice(0, 10),
      action: operation.action,
      price: operation.price,
      quantity: operation.quantity,
    })));
  assert.deepEqual(operations, golden.operations);

  const closed = controller.trace.flatMap((frame) => frame.operations.filter((operation) => operation.side === 'sell'));
  assert.deepEqual(
    closed.map(({ time, price, reason, quantity }) => ({ closeTime: time, closePrice: price, closeReason: reason, quantity })),
    golden.closedPositions.map(({ closeTime, closePrice, closeReason, quantity }) => ({ closeTime, closePrice, closeReason, quantity })),
  );

  const last = controller.currentFrame;
  assert.deepEqual(
    { capital: last.capital, portfolioValue: last.portfolioValue, totalValue: last.totalValue, holding: last.holding },
    golden.final,
  );
});
