/**
 * Statistics tracking for trading performance
 * Translated from luna/stats.h
 */

export class Stats {
  constructor() {
    this.reset();
  }

  /**
   * Reset all statistics
   */
  reset() {
    this.nSuccess = 0;
    this.nFailure = 0;
    this.totalTrades = 0;
    this.totalProfit = 0;
    this.totalLoss = 0;
    this.maxDrawdown = 0;
    this.maxProfit = 0;
    this.currentDrawdown = 0;
    this.peakCapital = 0;
    this.trades = [];
  }

  /**
   * Update statistics with success and failure counts
   * @param {number} nSuccess - Number of successful trades to add
   * @param {number} nFailure - Number of failed trades to add
   */
  update(nSuccess, nFailure) {
    this.nSuccess += nSuccess;
    this.nFailure += nFailure;
    this.totalTrades = this.nSuccess + this.nFailure;
  }

  /**
   * Get number of successful trades
   * @returns {number} Number of successful trades
   */
  getSuccess() {
    return this.nSuccess;
  }

  /**
   * Get number of failed trades
   * @returns {number} Number of failed trades
   */
  getFailure() {
    return this.nFailure;
  }

  /**
   * Record a winning trade
   */
  win() {
    this.nSuccess++;
    this.totalTrades++;
  }

  /**
   * Record a losing trade
   */
  lose() {
    this.nFailure++;
    this.totalTrades++;
  }

  /**
   * Record a completed trade with detailed information
   * @param {number} profit - Profit/loss from the trade (positive for profit, negative for loss)
   * @param {number} currentCapital - Current total capital after trade
   */
  recordTrade(profit, currentCapital) {
    this.totalTrades++;
    
    const trade = {
      profit: profit,
      timestamp: Date.now(),
      capital: currentCapital
    };
    
    this.trades.push(trade);

    if (profit > 0) {
      this.nSuccess++;
      this.totalProfit += profit;
      this.maxProfit = Math.max(this.maxProfit, profit);
      
      // Reset drawdown on profitable trade
      this.currentDrawdown = 0;
      this.peakCapital = Math.max(this.peakCapital, currentCapital);
    } else {
      this.nFailure++;
      this.totalLoss += Math.abs(profit);
      
      // Update drawdown
      if (this.peakCapital > 0) {
        this.currentDrawdown = (this.peakCapital - currentCapital) / this.peakCapital;
        this.maxDrawdown = Math.max(this.maxDrawdown, this.currentDrawdown);
      }
    }
  }

  /**
   * Get success rate as percentage
   * @returns {number} Success rate (0-100)
   */
  getSuccessRate() {
    if (this.totalTrades === 0) return 0;
    return (this.nSuccess / this.totalTrades) * 100;
  }


  getSuccessRatio() {
    return `${this.nSuccess}:${this.totalTrades}`;
  }

  /**
   * Get average profit per trade
   * @returns {number} Average profit
   */
  getAverageProfit() {
    if (this.nSuccess === 0) return 0;
    return this.totalProfit / this.nSuccess;
  }

  /**
   * Get average loss per trade
   * @returns {number} Average loss
   */
  getAverageLoss() {
    if (this.nFailure === 0) return 0;
    return this.totalLoss / this.nFailure;
  }

  /**
   * Get profit factor (total profit / total loss)
   * @returns {number} Profit factor
   */
  getProfitFactor() {
    if (this.totalLoss === 0) return this.totalProfit > 0 ? Infinity : 0;
    return this.totalProfit / this.totalLoss;
  }

  /**
   * Get net profit (total profit - total loss)
   * @returns {number} Net profit
   */
  getNetProfit() {
    return this.totalProfit - this.totalLoss;
  }

  /**
   * Get maximum drawdown as percentage
   * @returns {number} Maximum drawdown (0-100)
   */
  getMaxDrawdownPercent() {
    return this.maxDrawdown * 100;
  }

  /**
   * Get current drawdown as percentage
   * @returns {number} Current drawdown (0-100)
   */
  getCurrentDrawdownPercent() {
    return this.currentDrawdown * 100;
  }

  /**
   * Get Sharpe ratio (simplified calculation)
   * @param {number} riskFreeRate - Risk-free rate (default 0.02 for 2%)
   * @returns {number} Sharpe ratio
   */
  getSharpeRatio(riskFreeRate = 0.02) {
    if (this.trades.length < 2) return 0;

    // Calculate returns
    const returns = [];
    for (let i = 1; i < this.trades.length; i++) {
      const prevCapital = this.trades[i - 1].capital;
      const currentCapital = this.trades[i].capital;
      if (prevCapital > 0) {
        returns.push((currentCapital - prevCapital) / prevCapital);
      }
    }

    if (returns.length === 0) return 0;

    // Calculate average return
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;

    // Calculate standard deviation
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return 0;

    // Annualize (assuming daily returns)
    const annualizedReturn = avgReturn * 252; // 252 trading days per year
    const annualizedStdDev = stdDev * Math.sqrt(252);

    return (annualizedReturn - riskFreeRate) / annualizedStdDev;
  }

  /**
   * Get comprehensive statistics summary
   * @returns {Object} Statistics summary
   */
  getSummary() {
    return {
      totalTrades: this.totalTrades,
      successfulTrades: this.nSuccess,
      failedTrades: this.nFailure,
      successRate: this.getSuccessRate(),
      successRatio: this.getSuccessRatio(),
      totalProfit: this.totalProfit,
      totalLoss: this.totalLoss,
      netProfit: this.getNetProfit(),
      averageProfit: this.getAverageProfit(),
      averageLoss: this.getAverageLoss(),
      profitFactor: this.getProfitFactor(),
      maxProfit: this.maxProfit,
      maxDrawdown: this.getMaxDrawdownPercent(),
      currentDrawdown: this.getCurrentDrawdownPercent(),
      sharpeRatio: this.getSharpeRatio()
    };
  }

  /**
   * Export statistics to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      nSuccess: this.nSuccess,
      nFailure: this.nFailure,
      totalTrades: this.totalTrades,
      totalProfit: this.totalProfit,
      totalLoss: this.totalLoss,
      maxDrawdown: this.maxDrawdown,
      maxProfit: this.maxProfit,
      currentDrawdown: this.currentDrawdown,
      peakCapital: this.peakCapital,
      trades: this.trades,
      summary: this.getSummary()
    };
  }

  /**
   * Import statistics from JSON
   * @param {Object} json - JSON data
   */
  fromJSON(json) {
    this.nSuccess = json.nSuccess || 0;
    this.nFailure = json.nFailure || 0;
    this.totalTrades = json.totalTrades || 0;
    this.totalProfit = json.totalProfit || 0;
    this.totalLoss = json.totalLoss || 0;
    this.maxDrawdown = json.maxDrawdown || 0;
    this.maxProfit = json.maxProfit || 0;
    this.currentDrawdown = json.currentDrawdown || 0;
    this.peakCapital = json.peakCapital || 0;
    this.trades = json.trades || [];
  }
}

export default Stats;

