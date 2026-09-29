/**
 * Individual class for genetic algorithm
 * Translated from luna/individual.h
 */

import { Trader } from './trader.js';
import { Algorithm } from './algorithm.js';
import { Genoma } from './algorithm.js';


/**
 * Individual representing a trading strategy in the genetic algorithm
 */
export class Individual {
  /**
   * Create a new individual
   * @param {number} initialCapital - Starting capital
   * @param {Object} genoma - Algorithm genoma (parameters and configuration)
   */
  constructor(initialCapital, genoma, tracer = null) {
    this.genoma = genoma;
    this.tracer = tracer;
    this.trader = new Trader(
      initialCapital,
      genoma.buyPercent,
      genoma.stopLossPercent,
      genoma.takeProfitPercent
    );
    this.algo = new Algorithm(genoma, this.trader, tracer);
    this.fitness = 0;
    this.evaluated = false;
  }

  /**
   * Reset the individual to initial state
   */
  reset() {
    this.algo.reset();
    this.trader.reset();
    this.fitness = 0;
    this.evaluated = false;
  }

  getCapital(){
    return this.trader.getCapital();
  }

  /**
   * Initialize with first stock data point
   * @param {Object} stockData - Initial stock data
   */
  init(stockData, stockName = null) {
    if (this.tracer) this.tracer.trackCall('Individual', 'Algorithm', 'init', [stockData]);
    if (stockName) this.trader.setStockName(stockName);
    this.algo.init(stockData);
    if (this.tracer) this.tracer.trackReturn('Algorithm', 'Individual');
  }

  /**
   * Feed new stock data to the algorithm
   * @param {Object} stockData - New stock data
   */
  feed(stockData, stockName = null) {
    if (this.tracer) this.tracer.trackCall('Individual', 'Algorithm', 'feed', [stockData]);
    if (stockName) this.trader.setStockName(stockName);
    this.algo.feed(stockData);
    if (this.tracer) this.tracer.trackReturn('Algorithm', 'Individual');
  }

  /**
   * Get the Compound Annual Growth Rate (CAGR)
   * @returns {number} CAGR percentage
   */
  getCAGR() {
    return this.trader.getYearlyPerformance();
  }

  /**
   * Get success ratio as string
   * @returns {string} Success ratio (e.g., "75/100")
   */
  getSuccessRatio() {
    return this.trader.getSuccessRatio();
  }

  /**
   * Get genoma as JSON string
   * @returns {string} JSON representation of genoma
   */
  getGenoma() {
    return this.algo.codifyGenoma();
  }

  /**
   * Get trader performance summary
   * @returns {Object} Performance summary
   */
  getPerformanceSummary() {
    return {
      cagr: this.getCAGR(),
      successRatio: this.getSuccessRatio(),
      totalReturn: this.trader.getAbsPerformance(),
      successRate: this.trader.getSuccessRate(),
      totalTrades: this.trader.statistics.totalTrades,
      currentCapital: this.trader.getTotalValue(),
      maxDrawdown: this.trader.statistics.getMaxDrawdownPercent()
    };
  }

  /**
   * Evaluate fitness of this individual using stock data
   * @param {Array} stockData - Historical stock data for backtesting
   * @returns {Promise<number>} Fitness score
   */
  async evaluate(stockData) {
    if (this.evaluated) {
      return this.fitness;
    }

    try {
      // Reset before evaluation
      this.reset();

      // Run backtest
      if (stockData.length > 0) {
        this.init(stockData[0]);

        for (let i = 1; i < stockData.length; i++) {
          this.feed(stockData[i]);
        }
      }

      // Calculate fitness based on multiple factors
      const performance = this.getPerformanceSummary();
      
      // Fitness function: balance return, success rate, and risk
      // Higher CAGR is better, higher success rate is better, lower drawdown is better
      this.fitness = (
        performance.cagr * 0.5 +                           // 50% weight on returns
        performance.successRate * 0.3 +                    // 30% weight on success rate
        Math.max(0, 20 - performance.maxDrawdown) * 0.2    // 20% weight on risk (inverse of drawdown)
      );

      // Penalty for very low number of trades (strategy might be too conservative)
      if (performance.totalTrades < 5) {
        this.fitness *= 0.5;
      }

      // Penalty for negative returns
      if (performance.cagr < 0) {
        this.fitness = Math.min(this.fitness, -Math.abs(performance.cagr));
      }

      this.evaluated = true;
      return this.fitness;

    } catch (error) {
      console.error('Error evaluating individual:', error);
      this.fitness = -1000; // Heavy penalty for invalid individuals
      this.evaluated = true;
      return this.fitness;
    }
  }

  /**
   * Create a copy of this individual
   * @returns {Individual} New individual copy
   */
  clone() {
    const clonedGenoma = this.cloneGenoma();
    const individual = new Individual(this.trader.initialCapital, clonedGenoma);
    individual.fitness = this.fitness;
    individual.evaluated = this.evaluated;
    return individual;
  }

  /**
   * Clone the genoma
   * @returns {Object} Cloned genoma
   * @private
   */
  cloneGenoma() {
    // Deep clone the genoma object
    return JSON.parse(JSON.stringify(this.genoma));
  }

  /**
   * Mutate this individual
   * @param {number} mutationRate - Probability of mutation (0-1)
   */
  mutate(mutationRate = 0.1) {
    let mutated = false;

    // Mutate numerical parameters
    if (Math.random() < mutationRate) {
      this.genoma.iirCoeff = this.mutateFloat(this.genoma.iirCoeff, 0.001, 0.5);
      mutated = true;
    }
    if (Math.random() < mutationRate) {
      this.genoma.iirCoeff2 = this.mutateFloat(this.genoma.iirCoeff2, 0.001, 0.5);
      mutated = true;
    }
    if (Math.random() < mutationRate) {
      this.genoma.iirCoeffV = this.mutateFloat(this.genoma.iirCoeffV, 0.001, 0.5);
      mutated = true;
    }
    if (Math.random() < mutationRate) {
      this.genoma.iirCoeffV2 = this.mutateFloat(this.genoma.iirCoeffV2, 0.001, 0.5);
      mutated = true;
    }
    if (Math.random() < mutationRate) {
      this.genoma.buyPercent = this.mutateFloat(this.genoma.buyPercent, 0.01, 0.5);
      mutated = true;
    }
    if (Math.random() < mutationRate) {
      this.genoma.marginPercent = this.mutateFloat(this.genoma.marginPercent, 0.001, 0.1);
      mutated = true;
    }
    if (Math.random() < mutationRate) {
      this.genoma.marginPercent2 = this.mutateFloat(this.genoma.marginPercent2, 0.001, 0.1);
      mutated = true;
    }
    if (Math.random() < mutationRate) {
      this.genoma.marginVPercent = this.mutateFloat(this.genoma.marginVPercent, 0.001, 0.1);
      mutated = true;
    }
    if (Math.random() < mutationRate) {
      this.genoma.marginVPercent2 = this.mutateFloat(this.genoma.marginVPercent2, 0.001, 0.1);
      mutated = true;
    }
    if (Math.random() < mutationRate) {
      this.genoma.stopLossPercent = this.mutateFloat(this.genoma.stopLossPercent, 0.01, 0.2);
      mutated = true;
    }
    if (Math.random() < mutationRate) {
      this.genoma.takeProfitPercent = this.mutateFloat(this.genoma.takeProfitPercent, 0.01, 0.5);
      mutated = true;
    }

    // Mutate state parameters (genoma.states.NW etc., non genoma.stateNW)
    const stateKeys = ['NW', 'N', 'NE', 'W', 'C', 'E', 'SW', 'S', 'SE'];
    stateKeys.forEach(key => {
      const stateData = this.genoma.states && this.genoma.states[key];
      if (stateData && Math.random() < mutationRate) {
        // Raw DB format ({_N:[], _E:[], ...}); StateParams uses nArr/eArr
        if (Array.isArray(stateData.nArr)) {
          this.mutateStateParams(stateData);
        } else {
          this.mutateRawState(stateData);
        }
        mutated = true;
      }
    });

    if (mutated) {
      this.evaluated = false; // Mark for re-evaluation
      
      // Recreate algorithm with mutated genoma
      this.algo = new Algorithm(this.genoma, this.trader);
    }
  }

  /**
   * Mutate a float value within bounds
   * @param {number} value - Current value
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Mutated value
   * @private
   */
  mutateFloat(value, min, max) {
    const range = max - min;
    const mutation = (Math.random() - 0.5) * range * 0.1; // 10% of range
    return Math.max(min, Math.min(max, value + mutation));
  }

  /**
   * Mutate state parameters
   * @param {Object} stateParams - State parameters to mutate
   * @private
   */
  mutateStateParams(stateParams) {
    // Mutate condition arrays
    ['nArr', 'eArr', 'sArr', 'wArr'].forEach(arrName => {
      const lenName = arrName.replace('Arr', 'Len');
      
      if (Math.random() < 0.3) { // 30% chance to mutate each direction
        const currentLen = stateParams[lenName];
        
        if (Math.random() < 0.5 && currentLen > 0) {
          // Remove a condition
          const removeIndex = Math.floor(Math.random() * currentLen);
          stateParams[arrName].splice(removeIndex, 1);
          stateParams[lenName]--;
        } else if (currentLen < 6) {
          // Add a condition
          const newCondition = Math.floor(Math.random() * 14); // 0-13
          stateParams[arrName][currentLen] = newCondition;
          stateParams[lenName]++;
        } else if (currentLen > 0) {
          // Modify existing condition
          const modifyIndex = Math.floor(Math.random() * currentLen);
          stateParams[arrName][modifyIndex] = Math.floor(Math.random() * 14);
        }
      }
    });

    // Mutate buy/sell flags
    if (Math.random() < 0.1) { // 10% chance
      stateParams.buyInit = Math.random() < 0.1; // 10% chance to be true
    }
    if (Math.random() < 0.1) { // 10% chance
      stateParams.sellInit = Math.random() < 0.1; // 10% chance to be true
    }
  }

  /**
   * Mutate a raw state object ({_N:[], _E:[], _S:[], _W:[], action?})
   * as stored in genoma.states when created via fromJSON from DB format.
   * @param {Object} stateData - Raw state data
   * @private
   */
  mutateRawState(stateData) {
    ['_N', '_E', '_S', '_W'].forEach(dir => {
      if (!Array.isArray(stateData[dir])) stateData[dir] = [];
      if (Math.random() < 0.3) {
        const arr = stateData[dir];
        if (Math.random() < 0.5 && arr.length > 0) {
          arr.splice(Math.floor(Math.random() * arr.length), 1);
        } else if (arr.length < 6) {
          arr.push(Math.floor(Math.random() * 14));
        } else {
          arr[Math.floor(Math.random() * arr.length)] = Math.floor(Math.random() * 14);
        }
      }
    });
    if (Math.random() < 0.1) {
      const pick = Math.random();
      if (pick < 0.33) stateData.action = 'buy';
      else if (pick < 0.66) stateData.action = 'sell';
      else delete stateData.action;
    }
  }

  /**
   * Crossover with another individual to create offspring
   * @param {Individual} other - Other parent individual
   * @returns {Individual} Offspring individual
   */
  crossover(other) {
    // Create offspring with this individual's genoma as base
    const offspring = this.clone();
    
    // Uniform crossover for numerical parameters
    if (Math.random() < 0.5) offspring.genoma.iirCoeff = other.genoma.iirCoeff;
    if (Math.random() < 0.5) offspring.genoma.iirCoeff2 = other.genoma.iirCoeff2;
    if (Math.random() < 0.5) offspring.genoma.iirCoeffV = other.genoma.iirCoeffV;
    if (Math.random() < 0.5) offspring.genoma.iirCoeffV2 = other.genoma.iirCoeffV2;
    if (Math.random() < 0.5) offspring.genoma.buyPercent = other.genoma.buyPercent;
    if (Math.random() < 0.5) offspring.genoma.marginPercent = other.genoma.marginPercent;
    if (Math.random() < 0.5) offspring.genoma.marginPercent2 = other.genoma.marginPercent2;
    if (Math.random() < 0.5) offspring.genoma.marginVPercent = other.genoma.marginVPercent;
    if (Math.random() < 0.5) offspring.genoma.marginVPercent2 = other.genoma.marginVPercent2;
    if (Math.random() < 0.5) offspring.genoma.stopLossPercent = other.genoma.stopLossPercent;
    if (Math.random() < 0.5) offspring.genoma.takeProfitPercent = other.genoma.takeProfitPercent;

    // Crossover state parameters (genoma.states.NW etc., non genoma.stateNW)
    const stateKeys = ['NW', 'N', 'NE', 'W', 'C', 'E', 'SW', 'S', 'SE'];
    stateKeys.forEach(key => {
      if (Math.random() < 0.5 && other.genoma.states && other.genoma.states[key] !== undefined) {
        offspring.genoma.states[key] = JSON.parse(JSON.stringify(other.genoma.states[key]));
      }
    });

    offspring.evaluated = false;
    
    // Recreate algorithm with crossed genoma
    offspring.algo = new Algorithm(offspring.genoma, offspring.trader);
    
    return offspring;
  }

  /**
   * Convert individual to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      iir_price_1: this.genoma.iirCoeff,
      iir_price_2: this.genoma.iirCoeff2,
      iir_volume_1: this.genoma.iirCoeffV,
      iir_volume_2: this.genoma.iirCoeffV2,
      buy_percent: this.genoma.buyPercent * 100, // Convert to percentage
      margin_percent_1: this.genoma.marginPercent * 100,
      margin_percent_2: this.genoma.marginPercent2 * 100,
      margin_volume_percent_1: this.genoma.marginVPercent * 100,
      margin_volume_percent_2: this.genoma.marginVPercent2 * 100,
      stop_loss_percent: this.genoma.stopLossPercent * 100,
      take_profit_percent: this.genoma.takeProfitPercent * 100,
      states: {
        NW: this.genoma.states.NW,
        N: this.genoma.states.N,
        NE: this.genoma.states.NE,
        W: this.genoma.states.W,
        C: this.genoma.states.C,
        E: this.genoma.states.E,
        SW: this.genoma.states.SW,
        S: this.genoma.states.S,
        SE: this.genoma.states.SE
      },
      fitness: this.fitness,
      evaluated: this.evaluated
    };
  }

  /**
   * Create individual from JSON
   * @param {Object} json - JSON data
   * @param {number} initialCapital - Initial capital
   * @returns {Individual} New individual instance
   */
  static fromJSON(json, initialCapital, tracer = null) {
        const iirCoeff = json.iir_price_1;
        const iirCoeff2 = json.iir_price_2;
        const iirCoeffV = json.iir_volume_1;
        const iirCoeffV2 = json.iir_volume_2;
        const buyPercent = json.buy_percent / 100; // Convert to decimal
        const marginPercent = json.margin_percent_1 / 100;
        const marginPercent2 = json.margin_percent_2 / 100;
        const marginVPercent = json.margin_volume_percent_1 / 100;
        const marginVPercent2 = json.margin_volume_percent_2 / 100;
        const stopLossPercent = json.stop_loss_percent / 100;
        const takeProfitPercent = json.take_profit_percent / 100;

        // Parse states - handle both '0' and 'C' center state formats
        const states = json.states;
        const centerState = states.C || states['0'] || {};

        const genoma = new Genoma(
          iirCoeff, iirCoeff2, iirCoeffV, iirCoeffV2,
          buyPercent, marginPercent, marginPercent2, marginVPercent, marginVPercent2,
          stopLossPercent, takeProfitPercent,
          states.NW || {}, states.N || {}, states.NE || {},
          states.W || {}, centerState, states.E || {},
          states.SW || {}, states.S || {}, states.SE || {}
        );

    const individual = new Individual(initialCapital, genoma, tracer);
    individual.fitness = json.fitness || 0;
    individual.evaluated = json.evaluated || false;
    return individual;
  }
}

export default Individual;

