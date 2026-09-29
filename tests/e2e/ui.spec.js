/** @see ../../docs/operations/development.md#browser-smoke-check */
import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { SimulationController } from '../../src/engine/simulationController.js';

const integer = new Intl.NumberFormat('it-IT');
const money = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
const formatDate = (date) => new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
  .format(new Date(`${date}T00:00:00.000Z`));

let snapshot;
let trace;
let firstTradeIndex;

test.beforeAll(async () => {
  snapshot = JSON.parse(await readFile(new URL('../../public/data/eni-ohlcv.json', import.meta.url), 'utf8'));
  const controller = new SimulationController(snapshot);
  await controller.start();
  await controller.playToEnd();
  trace = controller.trace;
  firstTradeIndex = trace.findIndex((frame) => frame.operations.length > 0);
});

// Console errors or uncaught exceptions fail every test: a UI that "looks right" while throwing is not a valid run.
test.beforeEach(async ({ page }) => {
  const problems = [];
  page.on('console', (message) => { if (message.type() === 'error') problems.push(message.text()); });
  page.on('pageerror', (error) => problems.push(error.message));
  page.problems = problems;
});

test.afterEach(async ({ page }) => {
  expect(page.problems, 'console errors / page errors').toEqual([]);
});

const frameIndexText = (count) => `${integer.format(count)} / ${integer.format(snapshot.bars.length)}`;

async function expectFrame(page, count) {
  const frame = trace[count - 1];
  await expect(page.locator('#frame-index')).toHaveText(frameIndexText(count));
  await expect(page.locator('#state-chip')).toHaveText(frame.state);
  await expect(page.locator('#active-date')).toHaveText(formatDate(frame.time));
  await expect(page.locator('#iir-price-1')).toHaveText(money.format(frame.iirPrice1));
  await expect(page.locator('#iir-price-2')).toHaveText(money.format(frame.iirPrice2));
  await expect(page.locator('#total-value')).toHaveText(money.format(frame.totalValue));
}

test('loads the versioned snapshot and reports its coverage and hash', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#run-state')).toHaveAttribute('data-state', 'ready');
  await expect(page.locator('#bar-count')).toHaveText(integer.format(snapshot.barCount));
  await expect(page.locator('#last-date')).toHaveText(formatDate(snapshot.lastBarDate));
  await expect(page.locator('#snapshot-meta')).toContainText(snapshot.dataSha256.slice(0, 12));
  await expect(page.locator('#price-chart canvas').first()).toBeVisible();
  await expect(page.locator('#error-banner')).toBeHidden();
});

test('step shows exactly the engine frame, and reset returns to the first bar', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#run-state')).toHaveAttribute('data-state', 'ready');

  for (let count = 2; count <= 4; count += 1) {
    await page.locator('#step-button').click();
    await expectFrame(page, count);
  }

  await page.locator('#reset-button').click();
  await expectFrame(page, 1);
  await expect(page.locator('#play-button')).toHaveText('Avvia replay');
  await expect(page.locator('#trade-count')).toHaveText('0 EVENTI');
});

test('replay reaches the first trade and the ledger shows the broker fill', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await expect(page.locator('#run-state')).toHaveAttribute('data-state', 'ready');
  await page.locator('#speed-select').selectOption('60');
  await page.locator('#play-button').click();

  const framesShown = async () => Number((await page.locator('#frame-index').textContent()).split(' / ')[0].replace(/\D/g, ''));
  await expect(async () => {
    await page.clock.runFor(60 * 50);
    expect(await framesShown()).toBeGreaterThan(firstTradeIndex);
  }).toPass({ timeout: 60_000 });
  await page.locator('#play-button').click();
  await expect(page.locator('#run-state b')).toHaveText('In pausa');

  // Wherever playback paused, the ledger must list exactly the engine operations up to that bar, newest first.
  const shown = await framesShown();
  await expectFrame(page, shown);
  const expected = trace.slice(0, shown).flatMap((frame) => frame.operations);
  await expect(page.locator('#trade-count')).toHaveText(`${integer.format(expected.length)} ${expected.length === 1 ? 'EVENTO' : 'EVENTI'}`);
  const rows = page.locator('#trade-rows tr');
  await expect(rows).toHaveCount(expected.length);
  for (const [index, operation] of [...expected].reverse().entries()) {
    const cells = rows.nth(index).locator('td');
    await expect(cells.nth(0)).toHaveText(formatDate(operation.time));
    await expect(cells.nth(1)).toHaveText(operation.side === 'buy' ? 'BUY' : 'SELL');
    await expect(cells.nth(3)).toHaveText(money.format(operation.price));
    await expect(cells.nth(4)).toHaveText(integer.format(operation.quantity));
  }
  expect(expected[0]).toMatchObject({ side: 'buy', time: trace[firstTradeIndex].time });
  await expect(page.locator('#holding-state')).toHaveText(trace[shown - 1].holding ? 'Aperta' : 'Nessuna');
});

test('IIR and state overlays toggle without changing the simulation', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#run-state')).toHaveAttribute('data-state', 'ready');
  await page.locator('#step-button').click();
  await page.locator('#step-button').click();
  await expectFrame(page, 3);

  await page.locator('label:has(#state-toggle)').click();
  await expect(page.locator('#state-toggle')).toBeChecked();
  await page.locator('label:has(#iir-toggle)').click();
  await expect(page.locator('#iir-toggle')).not.toBeChecked();
  await expectFrame(page, 3);
});

test('layout has no horizontal overflow', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#run-state')).toHaveAttribute('data-state', 'ready');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('a tampered snapshot is rejected with a visible error', async ({ page }) => {
  const tampered = structuredClone(snapshot);
  tampered.bars[10].close += 0.01;
  await page.route('**/data/eni-ohlcv.json', (route) => route.fulfill({ json: tampered }));

  await page.goto('/');
  await expect(page.locator('#run-state')).toHaveAttribute('data-state', 'error');
  await expect(page.locator('#error-banner')).toContainText('Hash snapshot non valido');
  await expect(page.locator('#play-button')).toBeDisabled();
  await expect(page.locator('#step-button')).toBeDisabled();
});
