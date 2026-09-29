/** @see ../../docs/architecture/simulator-overview.md#replay-lifecycle */
import { Life } from '../vendor/consilium/life.js';
import { CUTOFF_DATE, DATA_PERIOD, DataTrainer, START_DATE, SYMBOL } from './dataTrainer.js';
import { createConsiliumGenome, FIXED_GENOME } from './genome.js';
import { FixedGenomeGA } from './fixedGenomeGA.js';
import { FitnessValidator } from './fitnessValidator.js';

export class SimulationController {
  constructor(snapshot, rawGenome = FIXED_GENOME) {
    this.snapshot = snapshot;
    this.genome = createConsiliumGenome(rawGenome);
    this.dataTrainer = new DataTrainer(snapshot);
    this.fitnessValidator = new FitnessValidator();
    this.life = null;
    this.trace = [];
    this.complete = false;
    this.validation = null;
    this.closedPositionCursor = 0;
  }

  async start() {
    this.life = new Life(
      new FixedGenomeGA(this.genome),
      this.dataTrainer,
      [{ name: 'ENI', ticker: SYMBOL }],
      [DATA_PERIOD],
    );

    await this.life.birth();
    if (!this.life.child) throw new Error('Consilium Life could not create the fixed-genome Individual.');
    await this.life.grows(SYMBOL, DATA_PERIOD);
    if (!this.life.stream || this.life.stream.getLength() === 0) throw new Error('DataTrainer returned an empty stream.');

    this.closedPositionCursor = 0;
    this.trace = [this.captureFrame(this.life.stream.stream[0])];
    this.complete = this.life.stream.getLength() === 1;
    if (this.complete) this.validateTrace();
    return this.currentFrame;
  }

  get currentFrame() {
    return this.trace.at(-1) ?? null;
  }

  get totalBars() {
    return this.life?.stream?.getLength() ?? 0;
  }

  async step() {
    if (!this.life) throw new Error('Simulation has not started.');
    if (this.complete) return this.currentFrame;

    const stream = this.life.stream;
    const indexBefore = stream.currentIndex;
    const moreData = await this.life.feed();
    const advanced = stream.currentIndex === indexBefore + 1;

    if (!advanced) {
      if (indexBefore >= stream.getLength() && !moreData) {
        this.complete = true;
        this.validateTrace();
        return this.currentFrame;
      }
      throw new Error(`Consilium Life.feed did not consume bar ${indexBefore}; replay stopped.`);
    }
    if (!moreData) throw new Error(`Consilium Life.feed failed while processing bar ${indexBefore}.`);

    const bar = stream.stream[indexBefore];
    this.trace.push(this.captureFrame(bar));
    if (stream.currentIndex >= stream.getLength()) {
      this.complete = true;
      this.validateTrace();
    }
    return this.currentFrame;
  }

  async playToEnd(onFrame = () => {}) {
    while (!this.complete) onFrame(await this.step());
    return this.validation;
  }

  validateTrace() {
    this.validation = this.fitnessValidator.validate(this.trace);
    if (!this.validation.valid) {
      throw new Error(`Fitness validation failed: ${this.validation.errors.join(' ')}`);
    }
    return this.validation;
  }

  captureFrame(stockData) {
    const individual = this.life.child;
    const algo = individual.algo;
    const portfolio = individual.trader.broker.portfolio;
    const timestamp = String(stockData.t);
    const brokerEvents = individual.trader.broker.operationsByTimestamp[timestamp] ?? [];
    const buyEvents = brokerEvents
      .filter((event) => event.action === 'buy')
      .map((event) => ({
        side: 'buy',
        reason: 'signal',
        time: new Date(stockData.t).toISOString().slice(0, 10),
        price: event.price,
        quantity: event.quantity,
      }));
    const closeEvents = portfolio.closedPositions
      .slice(this.closedPositionCursor)
      .map((position) => ({
        side: 'sell',
        reason: position.closeReason,
        time: new Date(position.closeTime).toISOString().slice(0, 10),
        price: position.closePrice,
        quantity: position.quantity,
      }));
    this.closedPositionCursor = portfolio.closedPositions.length;

    return {
      time: new Date(stockData.t).toISOString().slice(0, 10),
      bar: {
        open: stockData.open,
        high: stockData.max,
        low: stockData.min,
        close: stockData.close,
        volume: stockData.volume,
      },
      state: algo.getCurrentName(),
      iirPrice1: algo.ema,
      iirPrice2: algo.ema2,
      iirVolume1: algo.emaV,
      iirVolume2: algo.emaV2,
      operations: [...closeEvents, ...buyEvents],
      capital: individual.trader.getCapital(),
      portfolioValue: individual.trader.getPortfolioValue(),
      totalValue: individual.trader.getTotalValue(),
      // isHolding() is a trader-state flag (HOPING only); positionOpen reports shares actually held.
      holding: individual.trader.isHolding(),
      positionOpen: individual.trader.broker.hasPositions(),
    };
  }
}

export const SIMULATION_RANGE = Object.freeze({ from: START_DATE, to: CUTOFF_DATE });