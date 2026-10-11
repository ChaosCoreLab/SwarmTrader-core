/** @see ../../docs/architecture/simulator-overview.md#strategy-contract */
import { Trader } from '../vendor/consilium/trader.js';

const ACTIONS = new Set(['buy', 'sell', 'hold']);
const REQUIRED_METHODS = ['init', 'feed', 'reset', 'getCAGR', 'getPerformanceSummary', 'describe', 'serialize'];

/**
 * Checks that an object is a strategy the replay engine can run: what Consilium's `Life` calls on a child
 * (`init`, `feed`, `getCAGR`, `getPerformanceSummary`) plus what the controller reads for each frame
 * (`kind`, `labels`, `describe()`). Returns the candidate or throws naming every missing member.
 */
export function assertStrategy(candidate) {
  if (!candidate || typeof candidate !== 'object') throw new TypeError('Strategy must be an object.');

  const problems = [];
  if (typeof candidate.kind !== 'string' || candidate.kind === '') problems.push('kind (non-empty string)');
  if (!Array.isArray(candidate.labels) || candidate.labels.length === 0 || candidate.labels.some((label) => typeof label !== 'string')) {
    problems.push('labels (non-empty array of strings)');
  }
  if (!candidate.trader || typeof candidate.trader.getTotalValue !== 'function') problems.push('trader');
  for (const method of REQUIRED_METHODS) {
    if (typeof candidate[method] !== 'function') problems.push(`${method}()`);
  }
  if (problems.length > 0) {
    throw new TypeError(`Invalid strategy "${candidate.kind ?? 'unknown'}": missing or invalid ${problems.join(', ')}.`);
  }
  return candidate;
}

/**
 * Base class for strategies that do not come from Consilium's `Algorithm`. It owns the Trader and runs the same
 * per-bar order as `Algorithm.feed`: update indicators, let the Trader execute the order set on the previous bar,
 * then decide the order for the next bar. Subclasses define `kind`, `labels` and the hooks below.
 */
export class StrategyIndividual {
  constructor(initialCapital, { buyPercent, stopLossPercent, takeProfitPercent }) {
    this.trader = new Trader(initialCapital, buyPercent, stopLossPercent, takeProfitPercent);
  }

  init(stockData, stockName = null) {
    if (stockName) this.trader.setStockName(stockName);
    this.initIndicators(stockData);
    this.trader.init(stockData.t);
  }

  feed(stockData, stockName = null) {
    if (stockName) this.trader.setStockName(stockName);
    this.updateIndicators(stockData);
    this.trader.update(stockData);

    const action = this.decide();
    if (!ACTIONS.has(action)) throw new TypeError(`Strategy "${this.kind}" returned an invalid action: ${String(action)}.`);
    if (action === 'buy') this.trader.buy();
    else if (action === 'sell') this.trader.sell();
  }

  reset() {
    this.resetIndicators();
    this.trader.reset();
  }

  getCAGR() {
    return this.trader.getYearlyPerformance();
  }

  getSuccessRatio() {
    return this.trader.getSuccessRatio();
  }

  getPerformanceSummary() {
    return {
      cagr: this.getCAGR(),
      successRatio: this.getSuccessRatio(),
      totalReturn: this.trader.getAbsPerformance(),
      successRate: this.trader.getSuccessRate(),
      totalTrades: this.trader.statistics.totalTrades,
      currentCapital: this.trader.getTotalValue(),
      maxDrawdown: this.trader.statistics.getMaxDrawdownPercent(),
    };
  }

  initIndicators() { throw new Error(`${this.constructor.name} must implement initIndicators(stockData).`); }
  updateIndicators() { throw new Error(`${this.constructor.name} must implement updateIndicators(stockData).`); }
  resetIndicators() { throw new Error(`${this.constructor.name} must implement resetIndicators().`); }
  decide() { throw new Error(`${this.constructor.name} must implement decide(): 'buy' | 'sell' | 'hold'.`); }
  describe() { throw new Error(`${this.constructor.name} must implement describe(): { label, indicators }.`); }
  serialize() { throw new Error(`${this.constructor.name} must implement serialize().`); }
}
