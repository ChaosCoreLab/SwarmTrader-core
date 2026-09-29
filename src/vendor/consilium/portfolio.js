/**
 * Portfolio management for trading operations
 * Translated from luna/portfolio.h and luna/portfolio.cpp
 */

// Counter for generating unique position IDs
let positionIdCounter = 0;

/**
 * Portfolio position representing a single stock holding
 */
export class Position {
  constructor(stockData, quantity, stopLossPercent, takeProfitPercent) {
    this.stock_data = stockData;
    this.entryTime = stockData.t;
    this.quantity = quantity;

    this.stopLossPrice = this.stock_data.open * (1 - stopLossPercent);
    this.takeProfitPrice = this.stock_data.open * (1 + takeProfitPercent);

    // Position tracking fields for lifecycle management
    this.id = `pos_${Date.now()}_${positionIdCounter++}`;
    this.closeTime = null;
    this.closePrice = null;
    this.closeReason = null;
    this.netGain = null;
  }

  /**
   * Mark this position as closed
   * @param {number} closeTime - Unix timestamp
   * @param {number} closePrice - Exit price
   * @param {string} closeReason - 'sell', 'take profit', or 'stop loss'
   */
  markAsClosed(closeTime, closePrice, closeReason) {
    this.closeTime = closeTime;
    this.closePrice = closePrice;
    this.closeReason = closeReason;
    // netGain will be set by Broker after calculating fees/taxes
  }

  /**
   * Check if position is closed
   * @returns {boolean}
   */
  isClosed() {
    return this.closeTime !== null;
  }

  /**
   * Get initial value of the position
   * @returns {number} Initial value (entry price * quantity)
   */
  getInitialValue() {
    return this.stock_data.open * this.quantity;
  }

  /**
   * Check if stop loss should be triggered
   * @returns {boolean} True if stop loss should be triggered
   */
  shouldStopLoss(current_stock_data) {
    return current_stock_data.min <= this.stopLossPrice;
  }

  /**
   * Check if take profit should be triggered
   * @returns {boolean} True if take profit should be triggered
   */
  shouldTakeProfit(current_stock_data) {
    return current_stock_data.max >= this.takeProfitPrice;
  }

  /**
   * Get holding period in days
   * @returns {number} Holding period in days
   */
  getHoldingPeriodDays(currentTime) {
    return (currentTime - this.entryTime) / (60.0 * 60.0 * 24.0);
  }

  /**
   * Calculate annualized return (CAGR)
   * @returns {number} Compound Annual Growth Rate
   */
  getCAGR(curr_stock_value) {
    const holdingPeriodYears = this.getHoldingPeriodDays(curr_stock_value.t) / 365.25;
    
    const initialValue = this.stock_data.open;
    const currentValue = curr_stock_value.getActualValue();
        
    return Math.pow(currentValue / initialValue, 1.0 / holdingPeriodYears) - 1.0;
  }

  /**
   * Check if this position is equivalent to another position
   * @param {Position} other - Other position to compare
   * @returns {boolean} True if positions are equivalent
   */
  isEquivalent(other) {
    if (!other || !(other instanceof Position)) return false;
    
    return (
      this.quantity === other.quantity &&
      this.entryTime === other.entryTime &&
      this.stopLossPrice === other.stopLossPrice &&
      this.takeProfitPrice === other.takeProfitPrice &&
      this.stock_data?.open === other.stock_data?.open &&
      this.stock_data?.t === other.stock_data?.t
    );
  }

  /**
   * Generate a unique key for this position
   * @returns {string} Unique identifier for the position
   */
  getKey() {
    return `${this.entryTime}_${this.quantity}_${this.stopLossPrice}_${this.takeProfitPrice}_${this.stock_data?.open}`;
  }

  /**
   * Convert position to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      stock_data: this.stock_data,
      quantity: this.quantity,
      stopLossPrice: this.stopLossPrice,
      takeProfitPrice: this.takeProfitPrice,
      closeTime: this.closeTime,
      closePrice: this.closePrice,
      closeReason: this.closeReason,
      netGain: this.netGain
    };
  }

  /**
   * Create position from JSON
   * @param {Object} json - JSON data
   * @returns {Position} New position instance
   */
  static fromJSON(json) {
    // Create a mock stock data object for constructor
    const stockData = {
      getActualValue: () => json.stock_data,
      t: json.stock_data?.t,
      open: json.stock_data?.open
    };

    const position = new Position(stockData, json.quantity, 0, 0);
    position.stopLossPrice = json.stopLossPrice;
    position.takeProfitPrice = json.takeProfitPrice;
    position.id = json.id || position.id;
    position.closeTime = json.closeTime || null;
    position.closePrice = json.closePrice || null;
    position.closeReason = json.closeReason || null;
    position.netGain = json.netGain || null;
    position.currentPrice = json.currentPrice;
    position.currentTime = json.currentTime;

    return position;
  }
}

/**
 * Portfolio class for managing multiple positions
 */
export class Portfolio {
  constructor(tracer = null) {
    this.positions = [];
    this.closedPositions = [];  // History of closed positions
    this.market_value = null; // Placeholder for market value stream
    this.totalInvested = 0;
    this.totalRealized = 0;
    this.tracer = tracer;
  }

  /**
   * Factory method to get portfolio instance
   * @returns {Portfolio} Portfolio instance
   */
  static getPortfolio() {
    return new Portfolio();
  }

  /**
   * Add a new position to the portfolio
   * @param {Object} stockData - Current stock data
   * @param {number} quantity - Number of shares to buy
   * @param {number} stopLossPercent - Stop loss percentage (0.05 = 5%)
   * @param {number} takeProfitPercent - Take profit percentage (0.15 = 15%)
   */
  add(stockData, quantity, stopLossPercent, takeProfitPercent) {
    const position = new Position(stockData, quantity, stopLossPercent, takeProfitPercent);
    this.positions.push(position);
    this.totalInvested += position.getInitialValue();
  }

  /**
   * Remove (sell) all positions from portfolio
   * @param {Object} stockData - Current stock data
   * @param {Object} statistics - Statistics object to update
   * @returns {Object} { grossProceeds, closedPositions }
   */
  remove(stockData, statistics) {
    if (this.positions.length === 0) {
      return { grossProceeds: 0, closedPositions: [] };
    }

    // Ensure current market value is aligned for gain computation/statistics
    this.market_value = stockData;

    const currPrice = stockData.getActualValue();
    const currTime = stockData.t;

    const curr_portfolio_gain = this.positions.reduce(
      (acc, position) => acc + position.quantity * currPrice,
      0.0
    );

    if(this.getCurrentGain() > 0)
      statistics.win();
    else
      statistics.lose();

    // Mark positions as closed and move to closedPositions
    const closedPositions = [];
    for (const position of this.positions) {
      position.markAsClosed(currTime, currPrice, 'sell');
      closedPositions.push(position);
    }

    this.closedPositions.push(...closedPositions);
    this.positions = [];

    return {
      grossProceeds: curr_portfolio_gain,
      closedPositions: closedPositions
    };
  }

  /**
   * Remove all positions (alternative remove method)
   * @returns {number} Total profit/loss from all sales
   */
  removeAll() {
    let totalProfit = this.getCurrentValue();
    this.positions = [];
    
    return totalProfit;
  }

  /**
   * Update portfolio with current market data
   * @param {Object} stockData - Current stock data
   * @param {Object} statistics - Statistics object to update
   * @returns {Object} Result with grossProceeds, closedPositions, etc.
   */
  update(stockData, statistics) {
    this.market_value = stockData; // Update market value stream

    if(this.positions.length === 0) {
      return {
        grossProceeds: 0,
        grossGain: 0,
        takeProfit: { grossProceeds: 0, grossInitial: 0, count: 0, closedPositions: [] },
        stopLoss: { grossProceeds: 0, grossInitial: 0, count: 0, closedPositions: [] }
      };
    }

    const currTime = stockData.t;

    const take_profit_position = this.positions.filter(position => position.shouldTakeProfit(stockData));
    const stop_loss_position = this.positions.filter(position => position.shouldStopLoss(stockData));

    if(take_profit_position.length > 0 || stop_loss_position.length > 0){
      // Create a set of keys for positions that trigger stop loss to avoid double processing
      const stop_loss_keys = new Set(stop_loss_position.map(position => position.getKey()));

      // Filter take profit positions to exclude those that also trigger stop loss
      const filtered_take_profit_position = take_profit_position.filter(position => !stop_loss_keys.has(position.getKey()));

      // Remove triggered positions from active positions
      this.positions = this.positions.filter(position => !position.shouldTakeProfit(stockData) && !position.shouldStopLoss(stockData));

      // Mark take profit positions as closed
      const closedTakeProfitPositions = [];
      for (const position of filtered_take_profit_position) {
        position.markAsClosed(currTime, position.takeProfitPrice, 'take profit');
        closedTakeProfitPositions.push(position);
      }

      // Mark stop loss positions as closed
      const closedStopLossPositions = [];
      for (const position of stop_loss_position) {
        position.markAsClosed(currTime, position.stopLossPrice, 'stop loss');
        closedStopLossPositions.push(position);
      }

      // Add to closedPositions array
      this.closedPositions.push(...closedTakeProfitPositions, ...closedStopLossPositions);

      const total_take_profit_gain = filtered_take_profit_position.reduce((acc, position) => {
        return acc + position.quantity * position.takeProfitPrice;
      }, 0.0);

      const total_take_profit_initial = filtered_take_profit_position.reduce((acc, position) => {
        return acc + position.quantity * position.stock_data.open;
      }, 0.0);

      const total_wins = filtered_take_profit_position.length;
      const total_losses = stop_loss_position.length;
      statistics.update(total_wins, total_losses);

      const total_stop_loss_gain = stop_loss_position.reduce((acc, position) => {
        return acc + position.quantity * position.stopLossPrice;
      }, 0.0);

      const total_stop_loss_initial = stop_loss_position.reduce((acc, position) => {
        return acc + position.quantity * position.stock_data.open;
      }, 0.0);

      const grossProceeds = total_take_profit_gain + total_stop_loss_gain;
      const grossInitial = total_take_profit_initial + total_stop_loss_initial;
      const grossGain = grossProceeds - grossInitial;

      return {
        grossProceeds,
        grossGain,
        takeProfit: {
          grossProceeds: total_take_profit_gain,
          grossInitial: total_take_profit_initial,
          count: total_wins,
          closedPositions: closedTakeProfitPositions
        },
        stopLoss: {
          grossProceeds: total_stop_loss_gain,
          grossInitial: total_stop_loss_initial,
          count: total_losses,
          closedPositions: closedStopLossPositions
        }
      };
    }

    return {
      grossProceeds: 0,
      grossGain: 0,
      takeProfit: { grossProceeds: 0, grossInitial: 0, count: 0, closedPositions: [] },
      stopLoss: { grossProceeds: 0, grossInitial: 0, count: 0, closedPositions: [] }
    };
  }

  /**
   * Get current portfolio value
   * @returns {number} Current value
   */
  getCurrentValue() {
    if (!this.market_value) return 0;
    
    const curr_stock_value = this.market_value.getActualValue();

    const curr_portfolio_value = this.positions.reduce((acc, position) => {
      return acc + position.quantity * curr_stock_value;
    }, 0.0);

    return curr_portfolio_value;
  }

  /**
   * Get current portfolio gain/loss
   * @returns {number} Current gain
   */
  getCurrentGain() {
    if (!this.market_value) return 0;
    
    const curr_stock_value = this.market_value.getActualValue();

    const curr_portfolio_gain = this.positions.reduce((acc, position) => {
      return acc + position.quantity * (curr_stock_value - position.stock_data.open);
    }, 0.0);

    return curr_portfolio_gain;
  }

  /**
   * Get current portfolio CAGR
   * @returns {number} Compound Annual Growth Rate
   */
  getCurrentCAGR() {
    if (this.positions.length === 0 || !this.market_value) return 0;
    
    const total_quantity = this.positions.reduce((acc, position) => acc + position.quantity, 0);
    
    if (total_quantity === 0) return 0;

    const weightedCAGR = this.positions.reduce((acc, position) => {
      return acc + position.getCAGR(this.market_value) * position.quantity / total_quantity;
    }, 0);
    
    return weightedCAGR;
  }

  /**
   * Get full position history (closed + still open)
   * @returns {Position[]} All positions
   */
  getHistory() {
    return [...this.closedPositions, ...this.positions];
  }

  /**
   * Reset portfolio to initial state
   */
  reset() {
    this.positions = [];
    this.closedPositions = [];
    this.totalInvested = 0;
    this.totalRealized = 0;
  }

  /**
   * Get number of positions
   * @returns {number} Number of open positions
   */
  getPositionCount() {
    return this.positions.length;
  }

  /**
   * Check if portfolio has any positions
   * @returns {boolean} True if portfolio has positions
   */
  hasPositions() {
    return this.positions.length > 0;
  }

  /**
   * Get all positions
   * @returns {Position[]} Array of positions
   */
  getPositions() {
    return [...this.positions]; // Return a copy
  }

  /**
   * Get complete position history (closed + open positions)
   * @returns {Position[]} Array of all positions
   */
  getHistory() {
    return [...this.closedPositions, ...this.positions];
  }

  /**
   * Get only closed positions
   * @returns {Position[]} Array of closed positions
   */
  getClosedPositions() {
    return [...this.closedPositions];
  }

  /**
   * Find position by equivalence
   * @param {Position} targetPosition - Position to find
   * @returns {Position|null} Found position or null
   */
  findEquivalentPosition(targetPosition) {
    return this.positions.find(position => position.isEquivalent(targetPosition)) || null;
  }

  /**
   * Remove position by equivalence
   * @param {Position} targetPosition - Position to remove
   * @returns {boolean} True if position was found and removed
   */
  removeEquivalentPosition(targetPosition) {
    const index = this.positions.findIndex(position => position.isEquivalent(targetPosition));
    if (index !== -1) {
      this.positions.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get portfolio summary
   * @returns {Object} Portfolio summary
   */
  getSummary() {
    return {
      positionCount: this.getPositionCount(),
      currentValue: this.getCurrentValue(),
      currentGain: this.getCurrentGain(),
      currentCAGR: this.getCurrentCAGR(),
      totalInvested: this.totalInvested,
      totalRealized: this.totalRealized,
      positions: this.positions.map(p => p.toJSON())
    };
  }

  /**
   * Convert portfolio to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      positions: this.positions.map(p => p.toJSON()),
      closedPositions: this.closedPositions.map(p => p.toJSON()),
      totalInvested: this.totalInvested,
      totalRealized: this.totalRealized
    };
  }

  /**
   * Load portfolio from JSON
   * @param {Object} json - JSON data
   */
  fromJSON(json) {
    this.reset();
    this.totalInvested = json.totalInvested || 0;
    this.totalRealized = json.totalRealized || 0;

    if (json.positions) {
      this.positions = json.positions.map(p => Position.fromJSON(p));
    }

    if (json.closedPositions) {
      this.closedPositions = json.closedPositions.map(p => Position.fromJSON(p));
    }
  }
}

export default {
  Position,
  Portfolio
};

