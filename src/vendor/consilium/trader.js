/**
 * Trader class for managing trading operations and capital
 * Translated from luna/trader.h and luna/trader.cpp
 */

import { Stats } from './stats.js';
import { Portfolio } from './portfolio.js';

/**
 * Trading states
 */
export const TradingState = {
  IDLE: 'IDLE',
  BUYING: 'BUYING',
  HOPING: 'HOPING',
  SELLING: 'SELLING'
};

class Broker {
  constructor() {
    this.brokerCommissionRate = 0.19 /100.0;
    this.tobinTaxRate         = 0.1  /100.0;
    this.capitalGainTaxRate   = 26.0 /100.0;

    this.portfolio = new Portfolio();

    // Associative array: timestamp -> array of operations
    this.operationsByTimestamp = {};
  }

  _getTimestamp(stockData) {
    const ts = stockData?.t;
    const parsed = Number(ts);
    return Number.isFinite(parsed) ? parsed : Date.now();
  }

  _appendOperation(timestamp, operation) {
    const key = String(timestamp);
    if (!Array.isArray(this.operationsByTimestamp[key])) {
      this.operationsByTimestamp[key] = [];
    }
    this.operationsByTimestamp[key].push(operation);
  }

  _formatTimestamp(timestamp) {
    const ts = Number(timestamp);
    if (!Number.isFinite(ts)) return String(timestamp);
    const ms = ts > 1e12 ? ts : ts * 1000;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return String(timestamp);
    return d.toISOString();
  }

  getPortfolioValue() {
    return this.portfolio.getCurrentValue();
  }

  hasPositions() {
    return this.portfolio.hasPositions();
  }

  reset() {
    this.portfolio.reset();
    //this.operationsByTimestamp = {};
  }

  toJSON() {
    return {
      brokerCommissionRate: this.brokerCommissionRate,
      tobinTaxRate: this.tobinTaxRate,
      capitalGainTaxRate: this.capitalGainTaxRate,
      portfolio: this.portfolio.toJSON(),
      operationsByTimestamp: this.operationsByTimestamp
    };
  }

  fromJSON(json) {
    this.brokerCommissionRate = json?.brokerCommissionRate ?? 0;
    this.tobinTaxRate = json?.tobinTaxRate ?? 0;
    this.capitalGainTaxRate = json?.capitalGainTaxRate ?? 0;
    if (json?.portfolio) {
      this.portfolio.fromJSON(json.portfolio);
    }

    this.operationsByTimestamp = json?.operationsByTimestamp ?? {};
  }

  additionalCost(grossTradeValue){
    let tobinTax = grossTradeValue * this.tobinTaxRate;
    let brokerCommission = Math.min(19.0, Math.max(2.95, grossTradeValue * this.brokerCommissionRate));
    let totalCost = tobinTax + brokerCommission;
    return totalCost;
  }

  // Buy: quantity reduced because part of budget goes to Tobin tax and broker commissions
  buy(stockData, grossBudget, stopLossPercent, takeProfitPercent, stockName = 'UNKNOWN') {
    const stockPrice = stockData.open;
    let quantity = Math.floor(grossBudget / stockPrice);

    if (quantity <= 0) {
      return {
        quantity: 0,
        grossTradeValue: 0,
        totalCost: 0
      };
    }

    let grossTradeValue;
    let totalCost;
    do {
      grossTradeValue = quantity * stockPrice;
      totalCost = grossTradeValue + this.additionalCost(grossTradeValue);
    } while (quantity-- > 0 && totalCost > grossBudget);
    
    quantity++; // last valid quantity
    if (quantity <= 0) {
      return {
        quantity: 0,
        grossTradeValue: 0,
        totalCost: 0
      };
    }

    this.portfolio.add(stockData, quantity, stopLossPercent, takeProfitPercent);

    this._appendOperation(this._getTimestamp(stockData), {
      stockName,
      action: 'buy',
      quantity,
      price: stockData.open,
      takeProfit: stockData.open * (1 + takeProfitPercent),
      stopLoss: stockData.open * (1 - stopLossPercent)
    });

    return {
      quantity,
      grossTradeValue,
      totalCost
    };
  }

  // Sell: proceeds reduced by Tobin tax + capital gain tax + broker commissions
  sell(stockData, statistics, stockName = 'UNKNOWN') {
    if (!this.portfolio.hasPositions()) {
      return {
        grossProceeds: 0,
        grossGain: 0,
        capitalGainTax: 0,
        netProceeds: 0
      };
    }

    const currPrice = stockData.getActualValue();
    const positions = this.portfolio.getPositions();
    const totalQuantity = positions.reduce((acc, position) => acc + (position?.quantity ?? 0), 0);
    const grossGain = positions.reduce((acc, position) => {
      return acc + position.quantity * (currPrice - position.stock_data.open);
    }, 0.0);

    // Portfolio.remove() now returns { grossProceeds, closedPositions }
    const removeResult = this.portfolio.remove(stockData, statistics);
    const grossProceeds = removeResult.grossProceeds;
    const closedPositions = removeResult.closedPositions;

    const totalCost = this.additionalCost(grossProceeds);
    const capitalGainTax = Math.max(0, grossGain) * this.capitalGainTaxRate;
    const netProceeds = grossProceeds - totalCost - capitalGainTax;
    const totalNetGain = grossGain - totalCost - capitalGainTax;

    // Distribute netGain to closed positions
    const totalInvested = closedPositions.reduce((acc, pos) => acc + pos.quantity * pos.stock_data.open, 0);

    for (const position of closedPositions) {
      const positionInvested = position.quantity * position.stock_data.open;
      const positionNetGain = totalInvested > 0
        ? (positionInvested / totalInvested) * totalNetGain
        : 0;
      position.netGain = positionNetGain;
    }

    this._appendOperation(this._getTimestamp(stockData), {
      stockName,
      action: 'sell',
      quantity: totalQuantity,
      price: currPrice,
      netGain: totalNetGain
    });

    return {
      grossProceeds,
      grossGain,
      capitalGainTax,
      netProceeds
    };
  }

  // Update: handle auto-sells (take profit / stop loss) and apply fees/taxes to proceeds
  update(stockData, statistics, stockName = 'UNKNOWN') {
    const result = this.portfolio.update(stockData, statistics);

    const grossProceeds = typeof result === 'number' ? result : (result?.grossProceeds ?? 0);
    const grossGain = typeof result === 'number' ? 0 : (result?.grossGain ?? 0);

    if (grossProceeds <= 0) {
      return {
        grossProceeds: 0,
        grossGain: 0,
        tobinTax: 0,
        capitalGainTax: 0,
        brokerCommission: 0,
        netProceeds: 0
      };
    }

    const additionalCosts = this.additionalCost(grossProceeds);
    const capitalGainTax = Math.max(0, grossGain) * this.capitalGainTaxRate;
    const netProceeds = grossProceeds - additionalCosts - capitalGainTax;

    // Log auto-sells (stop loss / take profit) when grossProceeds != 0
    if (result && typeof result === 'object') {
      const groups = [
        {
          action: 'take profit',
          grossProceeds: result?.takeProfit?.grossProceeds,
          grossInitial: result?.takeProfit?.grossInitial,
          closedPositions: result?.takeProfit?.closedPositions || []
        },
        {
          action: 'stop loss',
          grossProceeds: result?.stopLoss?.grossProceeds,
          grossInitial: result?.stopLoss?.grossInitial,
          closedPositions: result?.stopLoss?.closedPositions || []
        }
      ].filter(g => Number(g.grossProceeds) > 0);

      if (groups.length > 0) {
        const totalPositiveGrossGain = groups.reduce((acc, g) => {
          const gp = Number(g.grossProceeds) || 0;
          const gi = Number(g.grossInitial) || 0;
          const gg = gp - gi;
          return acc + Math.max(0, gg);
        }, 0);

        const timestamp = this._getTimestamp(stockData);

        for (const g of groups) {
          const groupGrossProceeds = Number(g.grossProceeds) || 0;
          const groupGrossInitial = Number(g.grossInitial) || 0;
          const groupGrossGain = groupGrossProceeds - groupGrossInitial;

          const groupAdditionalCosts = grossProceeds > 0
            ? (additionalCosts * (groupGrossProceeds / grossProceeds))
            : 0;
          const groupCapitalGainTax = totalPositiveGrossGain > 0
            ? (capitalGainTax * (Math.max(0, groupGrossGain) / totalPositiveGrossGain))
            : 0;

          const groupNetProceeds = groupGrossProceeds - groupAdditionalCosts - groupCapitalGainTax;
          const groupNetGain = groupNetProceeds - groupGrossInitial;

          // Distribute netGain to this group's closed positions
          const groupTotalInvested = g.closedPositions.reduce((acc, pos) =>
            acc + pos.quantity * pos.stock_data.open, 0);

          for (const position of g.closedPositions) {
            const positionInvested = position.quantity * position.stock_data.open;
            const positionNetGain = groupTotalInvested > 0
              ? (positionInvested / groupTotalInvested) * groupNetGain
              : 0;
            position.netGain = positionNetGain;
          }

          this._appendOperation(timestamp, {
            stockName,
            action: g.action,
            netGain: groupNetGain
          });
        }
      }
    }

    return {
      grossProceeds,
      grossGain,
      netProceeds
    };
  }

  /**
   * Print the whole operations log in chronological order (oldest -> newest)
   */
  printOperationsLog() {
    const keys = Object.keys(this.operationsByTimestamp)
      .map(k => Number(k))
      .filter(k => Number.isFinite(k))
      .sort((a, b) => a - b);

    console.log('===== Broker operationsByTimestamp (chronological) =====');
    for (const ts of keys) {
      const ops = this.operationsByTimestamp[String(ts)] || [];
      console.log(`${this._formatTimestamp(ts)} (${ts})`);
      for (const op of ops) {
        console.log(`  - ${JSON.stringify(op)}`);
      }
    }
    console.log('===== End Broker operationsByTimestamp =====');
  }
}

/**
 * Trader class for executing trading strategies
 */
export class Trader {
  /**
   * Create a new trader
   * @param {number} initialCapital - Starting capital amount
   * @param {number} investmentCapitalQuota - Percentage of capital to invest per trade (0.1 = 10%)
   * @param {number} stopLossPercent - Stop loss percentage (0.05 = 5%)
   * @param {number} takeProfitPercent - Take profit percentage (0.15 = 15%)
   */
  constructor(
    initialCapital,
    investmentCapitalQuota,
    stopLossPercent,
    takeProfitPercent,
    brokerCommissionRate = 0,
    tobinTaxRate = 0,
    capitalGainTaxRate = 0
  ) {
    this.initialCapital = initialCapital;
    this.capital = initialCapital;
    this.investmentQuota = investmentCapitalQuota;
    this.stopLossPercent = stopLossPercent;
    this.takeProfitPercent = takeProfitPercent;
    this.broker = new Broker();
    
    this.statistics = new Stats();
    this.positionState = TradingState.IDLE;
    
    this.firstTradingDay = null;
    this.lastTradingDay = null;

    this.currentStockName = 'UNKNOWN';
  }

  setStockName(stockName) {
    if (typeof stockName === 'string' && stockName.trim().length > 0) {
      this.currentStockName = stockName.trim();
    }
  }

  /**
   * Initialize trader with first trading day and capital
   * @param {number} firstDay - Unix timestamp of first trading day
   * @param {number} capital - Optional capital override
   */
  init(firstDay, capital = null) {
    this.firstTradingDay = firstDay;
    this.lastTradingDay = firstDay;
    
    if (capital !== null) {
      this.capital = capital;
    }
    
    this.reset();
  }

  /**
   * Execute a buy order
   * @param {Object} stockData - Current stock data (optional, for context)
   */
  buyOperation(stockData = null) {
    const investmentAmount = this.capital * this.investmentQuota;
    const stockPrice = stockData.open;

    const stockName = this.currentStockName;

    const buyResult = this.broker.buy(
      stockData,
      investmentAmount,
      this.stopLossPercent,
      this.takeProfitPercent,
      stockName
    );

    const quantity = buyResult.quantity;
    if (quantity <= 0) return;

    if (buyResult.totalCost > this.capital) {
      console.warn('Cannot buy: insufficient capital');
      return;
    }

    // Execute the buy order (includes fees)
    this.capital -= buyResult.totalCost;
    this.positionState = TradingState.HOPING;
  }

  buy() {
    this.positionState = TradingState.BUYING;
  }

  sell(){
    this.positionState = TradingState.SELLING;
  }

  /**
   * Execute a sell order
   * @param {Object} stockData - Current stock data (optional, for context)
   */
  sellOperation(stockData = null) {
    if (!this.broker.hasPositions()) {
      console.warn('Cannot sell: no positions in portfolio');
      this.positionState = TradingState.IDLE;
      return;
    }

    // Sell the position
    const stockName = this.currentStockName;
    const sellResult = this.broker.sell(stockData, this.statistics, stockName);
    this.capital += sellResult.netProceeds;

    const stockPrice = stockData.getActualValue();
  }

  /**
   * Update trader with new market data
   * @param {Object} stockData - Current stock data
   */
  update(stockData) {
    this.lastTradingDay = stockData.t;

    switch (this.positionState) {
      case TradingState.BUYING:
        if (this.capital > 0)
          this.buyOperation(stockData);
        break;

      case TradingState.SELLING:
        if (this.broker.hasPositions()) 
          this.sellOperation(stockData);
        break;
    }

    // Update portfolio with current market data (auto-sells via stop loss / take profit)
    const updateResult = this.broker.update(stockData, this.statistics, this.currentStockName);
    this.capital += updateResult.netProceeds;
  }

  printBrokerOperationsLog() {
    this.broker.printOperationsLog();
  }

  /**
   * Get absolute performance (total return)
   * @returns {number} Absolute performance
   */
  getAbsPerformance() {
    const currentTotalValue = this.capital + this.broker.getPortfolioValue();
    return currentTotalValue - this.initialCapital;
  }

  /**
   * Get yearly performance (annualized return)
   * @returns {number} Yearly performance as percentage
   */
  getYearlyPerformance() {
    if (!this.firstTradingDay || !this.lastTradingDay) return 0;
    
    const tradingPeriodYears = (this.lastTradingDay - this.firstTradingDay) / (60 * 60 * 24 * 365.25);
    
    if (tradingPeriodYears <= 0) return 0;
    
    const currentTotalValue = this.capital + this.broker.getPortfolioValue();
    const totalReturn = currentTotalValue / this.initialCapital;
    
    if (totalReturn <= 0) return -100;
    
    const annualizedReturn = Math.pow(totalReturn, 1 / tradingPeriodYears) - 1;
    return annualizedReturn * 100;
  }

  /**
   * Get success rate from statistics
   * @returns {number} Success rate as percentage
   */
  getSuccessRate() {
    return this.statistics.getSuccessRate();
  }

  /**
   * Get success ratio as string
   * @returns {string} Success ratio (e.g., "75/100")
   */
  getSuccessRatio() {
    return this.statistics.getSuccessRatio();
  }

  /**
   * Get current capital (cash only)
   * @returns {number} Current capital
   */
  getCapital() {
    return this.capital;
  }

  /**
   * Get total value (capital + portfolio value)
   * @returns {number} Total value
   */
  getTotalValue() {
    return this.capital + this.broker.getPortfolioValue();
  }

  /**
   * Get current portfolio value
   * @returns {number} Portfolio value
   */
  getPortfolioValue() {
    return this.broker.getPortfolioValue();
  }

  /**
   * Get current trading state
   * @returns {string} Current state
   */
  getState() {
    return this.positionState;
  }

  /**
   * Check if trader is currently holding positions
   * @returns {boolean} True if holding positions
   */
  isHolding() {
    return this.positionState === TradingState.HOPING && this.broker.hasPositions();
  }

  /**
   * Reset trader to initial state
   */
  reset() {
    this.capital = this.initialCapital;
    //this.statistics.reset();
    this.broker.reset();
    this.positionState = TradingState.IDLE;
    this.currentStockName = 'UNKNOWN';
  }

  /**
   * Get comprehensive trader summary
   * @returns {Object} Trader summary
   */
  getSummary() {
    return {
      capital: this.capital,
      portfolioValue: this.getPortfolioValue(),
      totalValue: this.getTotalValue(),
      absPerformance: this.getAbsPerformance(),
      yearlyPerformance: this.getYearlyPerformance(),
      successRate: this.getSuccessRate(),
      successRatio: this.getSuccessRatio(),
      state: this.positionState,
      isHolding: this.isHolding(),
      statistics: this.statistics.getSummary(),
      broker: this.broker.toJSON(),
      portfolio: this.broker.portfolio.getSummary(),
      tradingPeriod: {
        start: this.firstTradingDay,
        end: this.lastTradingDay,
        days: this.lastTradingDay && this.firstTradingDay ? 
          (this.lastTradingDay - this.firstTradingDay) / (60 * 60 * 24) : 0
      }
    };
  }

  /**
   * Convert trader to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      initialCapital: this.initialCapital,
      capital: this.capital,
      investmentQuota: this.investmentQuota,
      stopLossPercent: this.stopLossPercent,
      takeProfitPercent: this.takeProfitPercent,
      positionState: this.positionState,
      firstTradingDay: this.firstTradingDay,
      lastTradingDay: this.lastTradingDay,
      statistics: this.statistics.toJSON(),
      broker: this.broker.toJSON()
    };
  }

  /**
   * Load trader from JSON
   * @param {Object} json - JSON data
   */
  fromJSON(json) {
    this.initialCapital = json.initialCapital;
    this.capital = json.capital;
    this.investmentQuota = json.investmentQuota;
    this.stopLossPercent = json.stopLossPercent;
    this.takeProfitPercent = json.takeProfitPercent;
    this.positionState = json.positionState || TradingState.IDLE;
    this.firstTradingDay = json.firstTradingDay;
    this.lastTradingDay = json.lastTradingDay;
    
    if (json.statistics) {
      this.statistics.fromJSON(json.statistics);
    }
    
    if (json.broker) {
      this.broker.fromJSON(json.broker);
    }
  }
}

export default {
  TradingState,
  Trader
};

