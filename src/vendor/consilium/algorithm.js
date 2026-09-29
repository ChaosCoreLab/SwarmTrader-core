/**
 * Algorithm implementation for trading strategy
 * Translated from luna/algorithm.h and luna/algorithm.cpp
 */

import { Trader } from './trader.js';

/**
 * Maximum number of conditions
 */
export const MAX_CONDITIONS = 14;
export const MATRIX_ROWS = 3;
export const MATRIX_COLS = 3;
export const MAX_CONDITIONS_IN_STATE = 6;

/**
 * Condition functions for algorithm evaluation
 * These correspond to the C++ condition functions
 */
export const ConditionFunctions = [
  // 0: Always false
  (inputState) => false,
  
  // 1: Always true
  (inputState) => true,
  
  // 2: avg_today > avg_price_IIR + margin_abs
  (inputState) => inputState.avgToday > inputState.avgPriceIIR + inputState.marginAbs,
  
  // 3: avg_today < avg_price_IIR + margin_abs
  (inputState) => inputState.avgToday < inputState.avgPriceIIR + inputState.marginAbs,
  
  // 4: avg_today > avg_price_IIR_2 + margin_abs_2
  (inputState) => inputState.avgToday > inputState.avgPriceIIR2 + inputState.marginAbs2,
  
  // 5: avg_today < avg_price_IIR_2 + margin_abs_2
  (inputState) => inputState.avgToday < inputState.avgPriceIIR2 + inputState.marginAbs2,
  
  // 6: avg_price_IIR > avg_price_IIR_2 + margin_abs_2
  (inputState) => inputState.avgPriceIIR > inputState.avgPriceIIR2 + inputState.marginAbs2,
  
  // 7: avg_price_IIR < avg_price_IIR_2 + margin_abs_2
  (inputState) => inputState.avgPriceIIR < inputState.avgPriceIIR2 + inputState.marginAbs2,
  
  // 8: volume > volume_IIR + margin_v_abs
  (inputState) => inputState.volume > inputState.volumeIIR + inputState.marginVAbs,
  
  // 9: volume < volume_IIR + margin_v_abs
  (inputState) => inputState.volume < inputState.volumeIIR + inputState.marginVAbs,
  
  // 10: volume > volume_IIR_2 + margin_v_abs_2
  (inputState) => inputState.volume > inputState.volumeIIR2 + inputState.marginVAbs2,
  
  // 11: volume < volume_IIR_2 + margin_v_abs_2
  (inputState) => inputState.volume < inputState.volumeIIR2 + inputState.marginVAbs2,
  
  // 12: volume_IIR > volume_IIR_2 + margin_v_abs_2
  (inputState) => inputState.volumeIIR > inputState.volumeIIR2 + inputState.marginVAbs2,
  
  // 13: volume_IIR < volume_IIR_2 + margin_v_abs_2
  (inputState) => inputState.volumeIIR < inputState.volumeIIR2 + inputState.marginVAbs2
];

/**
 * State parameters for algorithm state machine
 */
export class StateParams {
  constructor(name, nArr = [], nLen = 0, eArr = [], eLen = 0, sArr = [], sLen = 0, wArr = [], wLen = 0, buyInit = false, sellInit = false) {
    this.name = name;
    this.nArr = [...nArr];
    this.nLen = nLen;
    this.eArr = [...eArr];
    this.eLen = eLen;
    this.sArr = [...sArr];
    this.sLen = sLen;
    this.wArr = [...wArr];
    this.wLen = wLen;
    this.buyInit = buyInit;
    this.sellInit = sellInit;
  }

  /**
   * Convert condition array to JSON string
   * @param {number[]} condArr - Condition array
   * @param {number} len - Array length
   * @returns {string} JSON string
   */
  arrayToJson(condArr, len) {
    return JSON.stringify(condArr.slice(0, len));
  }

  /**
   * Convert state parameters to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      name: this.name,
      nArr: this.nArr.slice(0, this.nLen),
      eArr: this.eArr.slice(0, this.eLen),
      sArr: this.sArr.slice(0, this.sLen),
      wArr: this.wArr.slice(0, this.wLen),
      buyInit: this.buyInit,
      sellInit: this.sellInit
    };
  }
}

/**
 * Algorithm state representing a position in the 3x3 state matrix
 */
export class AlgorithmState {
  constructor(stateobj, name, nArr, eArr, sArr, wArr) {
    this.name = name;
    this.conditionNArr = stateobj[name][nArr];
    this.conditionEArr = stateobj[name][eArr];
    this.conditionSArr = stateobj[name][sArr];
    this.conditionWArr = stateobj[name][wArr];
    this.buy = stateobj[name].action === "buy";
    this.sell = stateobj[name].action === "sell";
    
    // Neighboring states (set by algorithm)
    this.N = null;
    this.E = null;
    this.S = null;
    this.W = null;
  }

  /**
   * Evaluate conditions for a direction
   * @param {Object} inputState - Current input state
   * @param {string} direction - Direction ('N', 'E', 'S', 'W')
   * @returns {boolean} True if all conditions are met
   */
  evaluateConditions(inputState, direction) {
    let condArr, condLen;
    
    switch (direction) {
      case 'N':
        condArr = this.conditionNArr;
        condLen = this.conditionNArr.length;
        break;
      case 'E':
        condArr = this.conditionEArr;
        condLen = this.conditionEArr.length;
        break;
      case 'S':
        condArr = this.conditionSArr;
        condLen = this.conditionSArr.length;
        break;
      case 'W':
        condArr = this.conditionWArr;
        condLen = this.conditionWArr.length;
        break;
      default:
        return false;
    }
    
    // All conditions must be true (AND logic)
    for (let i = 0; i < condLen; i++) {
      const conditionIndex = condArr[i];
      if (conditionIndex >= 0 && conditionIndex < ConditionFunctions.length) {
        if (!ConditionFunctions[conditionIndex](inputState)) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Get next state based on input conditions
   * @param {Object} inputState - Current input state
   * @returns {AlgorithmState|null} Next state or null if no transition
   */
  getNextState(inputState) {
    // Check each direction in order: N, E, S, W
    if (this.N && this.evaluateConditions(inputState, 'N')) {
      return this.N;
    }
    if (this.E && this.evaluateConditions(inputState, 'E')) {
      return this.E;
    }
    if (this.S && this.evaluateConditions(inputState, 'S')) {
      return this.S;
    }
    if (this.W && this.evaluateConditions(inputState, 'W')) {
      return this.W;
    }
    
    return null; // No transition
  }
}

/**
 * Genoma structure containing all algorithm parameters
 */
export class Genoma {
  constructor(
    iirCoeff, iirCoeff2, iirCoeffV, iirCoeffV2,
    buyPercent, marginPercent, marginPercent2, marginVPercent, marginVPercent2,
    stopLossPercent, takeProfitPercent,
    NW, N, NE, W, C, E, SW, S, SE
  ) {
    this.iirCoeff = iirCoeff;
    this.iirCoeff2 = iirCoeff2;
    this.iirCoeffV = iirCoeffV;
    this.iirCoeffV2 = iirCoeffV2;
    this.buyPercent = buyPercent;
    this.marginPercent = marginPercent;
    this.marginPercent2 = marginPercent2;
    this.marginVPercent = marginVPercent;
    this.marginVPercent2 = marginVPercent2;
    this.stopLossPercent = stopLossPercent;
    this.takeProfitPercent = takeProfitPercent;
    
    // State parameters
    this.states = {};
    this.states.NW = NW;
    this.states.N = N;
    this.states.NE = NE;
    this.states.W = W;
    this.states.C = C;
    this.states.E = E;
    this.states.SW = SW;
    this.states.S = S;
    this.states.SE = SE;
  }
}

/**
 * Main Algorithm class implementing the trading strategy
 */
export class Algorithm {
  constructor(genoma, trader = null, tracer = null) {
    this.genoma = genoma;
    this.trader = trader;
    this.tracer = tracer;
    
    // IIR filter coefficients
    this.IIR_COEFF = genoma.iirCoeff;
    this.IIR_COEFF_2 = genoma.iirCoeff2;
    this.IIR_COEFF_V = genoma.iirCoeffV;
    this.IIR_COEFF_V_2 = genoma.iirCoeffV2;
    
    // EMA values
    this.ema = 0;
    this.ema2 = 0;
    this.emaV = 0;
    this.emaV2 = 0;
    
    // Input state
    this.inputState = {
      avgToday: 0,
      volume: 0,
      avgPriceIIR: 0,
      avgPriceIIR2: 0,
      volumeIIR: 0,
      volumeIIR2: 0,
      marginAbs: 0,
      marginAbs2: 0,
      marginVAbs: 0,
      marginVAbs2: 0
    };
    
    // Initialize state matrix
    this.initializeStateMatrix();
    
    // Current state (start at center)
    this.currentState = this.stateMatrix[1][1];
  }

  /**
   * Initialize the 3x3 state matrix
   * @private
   */
  initializeStateMatrix() {
    // Create state matrix
    this.stateMatrix = [];
    for (let i = 0; i < MATRIX_ROWS; i++) {
      this.stateMatrix[i] = [];
      for (let j = 0; j < MATRIX_COLS; j++) {
        this.stateMatrix[i][j] = null;
      }
    }
    
    // Create states from genoma
    const stateParams = [
      [this.genoma.states.NW, this.genoma.states.N, this.genoma.states.NE],
      [this.genoma.states.W, this.genoma.states.C, this.genoma.states.E],
      [this.genoma.states.SW, this.genoma.states.S, this.genoma.states.SE]
    ];
  
    this.stateMatrix[0][0] = new AlgorithmState(this.genoma.states, "NW", "_SW", "_N", "_W", "_NE"),
    this.stateMatrix[0][1] = new AlgorithmState(this.genoma.states, "N", "_S", "_NE", "_0", "_NW"),
    this.stateMatrix[0][2] = new AlgorithmState(this.genoma.states, "NE", "_SE", "_NW", "_E", "_N"),
    this.stateMatrix[1][0] = new AlgorithmState(this.genoma.states, "W", "_NW", "_0", "_SW", "_E"),
    this.stateMatrix[1][1] = new AlgorithmState(this.genoma.states, "C", "_N", "_E", "_S", "_W"),
    this.stateMatrix[1][2] = new AlgorithmState(this.genoma.states, "E", "_NE", "_W", "_SE", "_0"),
    this.stateMatrix[2][0] = new AlgorithmState(this.genoma.states, "SW", "_W", "_S", "_SW", "_SE"),
    this.stateMatrix[2][1] = new AlgorithmState(this.genoma.states, "S", "_0", "_SE", "_N", "_SW"),
    this.stateMatrix[2][2] = new AlgorithmState(this.genoma.states, "SE", "_E", "_SW", "_NE", "_S");

    // Set neighboring states
    for (let i = 0; i < MATRIX_ROWS; i++) {
      for (let j = 0; j < MATRIX_COLS; j++) {
        const state = this.stateMatrix[i][j];
        
        // North neighbor
        if (i == 0)
          state.N = this.stateMatrix[MATRIX_ROWS - 1][j];
        else
          state.N = this.stateMatrix[i - 1][j];
        
        // South neighbor
        if (i == MATRIX_ROWS - 1)
          state.S = this.stateMatrix[0][j];
        else
          state.S = this.stateMatrix[i + 1][j];
        
        
        // West neighbor
        if (j == 0) 
          state.W = this.stateMatrix[i][MATRIX_COLS - 1];
        else
          state.W = this.stateMatrix[i][j - 1];
        
        // East neighbor
        if (j == MATRIX_COLS - 1)
          state.E = this.stateMatrix[i][0];
        else
          state.E = this.stateMatrix[i][j + 1];
      }
    }
  }

  /**
   * Initialize algorithm with first stock data
   * @param {Object} stockData - Initial stock data
   */
  init(stockData) {
    const actualValue = stockData.getActualValue();
    
    this.ema = actualValue;
    this.ema2 = actualValue;
    this.emaV = stockData.volume;
    this.emaV2 = stockData.volume;
    
    // Initialize trader if provided
    if (this.trader) {
      if (this.tracer) this.tracer.trackCall('Algorithm', 'Trader', 'init', [stockData.t]);
      this.trader.init(stockData.t);
      if (this.tracer) this.tracer.trackReturn('Trader', 'Algorithm');
    }
    
    // Reset to center state
    this.currentState = this.stateMatrix[1][1];
  }

  /**
   * Feed new stock data to the algorithm
   * @param {Object} stockData - New stock data
   */
  feed(stockData) {
    const actualValue = stockData.getActualValue();
    
    // Update EMAs
    this.ema = this.ema * (1 - this.IIR_COEFF) + actualValue * this.IIR_COEFF;
    this.ema2 = this.ema2 * (1 - this.IIR_COEFF_2) + actualValue * this.IIR_COEFF_2;
    this.emaV = this.emaV * (1 - this.IIR_COEFF_V) + stockData.volume * this.IIR_COEFF_V;
    this.emaV2 = this.emaV2 * (1 - this.IIR_COEFF_V_2) + stockData.volume * this.IIR_COEFF_V_2;
    
    // Update input state
    this.inputState.avgToday = actualValue;
    this.inputState.volume = stockData.volume;
    this.inputState.avgPriceIIR = this.ema;
    this.inputState.avgPriceIIR2 = this.ema2;
    this.inputState.volumeIIR = this.emaV;
    this.inputState.volumeIIR2 = this.emaV2;
    this.inputState.marginAbs = this.ema * this.genoma.marginPercent;
    this.inputState.marginAbs2 = this.ema2 * this.genoma.marginPercent2;
    this.inputState.marginVAbs = this.emaV * this.genoma.marginVPercent;
    this.inputState.marginVAbs2 = this.emaV2 * this.genoma.marginVPercent2;
    
    // Call chart callback if set
    if (this.onChartData) {
      this.onChartData(stockData, this.inputState);
    }
    
    // Update trader
    if (this.trader) {
      if (this.tracer) this.tracer.trackCall('Algorithm', 'Trader', 'update', [stockData]);
      this.trader.update(stockData);
      if (this.tracer) this.tracer.trackReturn('Trader', 'Algorithm');
    }
    
    // Check for state transition
    const nextState = this.currentState.getNextState(this.inputState);
    if (nextState && nextState !== this.currentState) {
      //console.log(`State transition: ${this.currentState.name} -> ${nextState.name}`);
      this.currentState = nextState;
    }
    
    // Execute trading actions based on current state
    if (this.trader) {
      if (this.currentState.buy) {
        if (this.tracer) this.tracer.trackCall('Algorithm', 'Trader', 'buy', [stockData]);
        this.trader.buy(stockData);
        if (this.tracer) this.tracer.trackReturn('Trader', 'Algorithm');
      } else if (this.currentState.sell) {
        if (this.tracer) this.tracer.trackCall('Algorithm', 'Trader', 'sell', [stockData]);
        this.trader.sell(stockData);
        if (this.tracer) this.tracer.trackReturn('Trader', 'Algorithm');
      }
    }
  }

  /**
   * Reset algorithm to initial state
   */
  reset() {
    this.ema = 0;
    this.ema2 = 0;
    this.emaV = 0;
    this.emaV2 = 0;
    
    this.inputState = {
      avgToday: 0,
      volume: 0,
      avgPriceIIR: 0,
      avgPriceIIR2: 0,
      volumeIIR: 0,
      volumeIIR2: 0,
      marginAbs: 0,
      marginAbs2: 0,
      marginVAbs: 0,
      marginVAbs2: 0
    };
    
    this.currentState = this.stateMatrix[1][1];
    
    if (this.trader) {
      this.trader.reset();
    }
  }

  /**
   * Get current state name
   * @returns {string} Current state name
   */
  getCurrentName() {
    return this.currentState ? this.currentState.name : 'Unknown';
  }

  /**
   * Codify genoma to JSON string
   * @returns {string} JSON representation of genoma
   */
  codifyGenoma() {
    const genomaData = {
      parameters: {
        iirCoeff: this.genoma.iirCoeff,
        iirCoeff2: this.genoma.iirCoeff2,
        iirCoeffV: this.genoma.iirCoeffV,
        iirCoeffV2: this.genoma.iirCoeffV2,
        buyPercent: this.genoma.buyPercent,
        marginPercent: this.genoma.marginPercent,
        marginPercent2: this.genoma.marginPercent2,
        marginVPercent: this.genoma.marginVPercent,
        marginVPercent2: this.genoma.marginVPercent2,
        stopLossPercent: this.genoma.stopLossPercent,
        takeProfitPercent: this.genoma.takeProfitPercent
      },
      states: {
        NW: this.genoma.NW.toJSON(),
        N: this.genoma.N.toJSON(),
        NE: this.genoma.NE.toJSON(),
        W: this.genoma.W.toJSON(),
        C: this.genoma['0'].toJSON(),
        E: this.genoma.E.toJSON(),
        SW: this.genoma.SW.toJSON(),
        S: this.genoma.S.toJSON(),
        SE: this.genoma.SE.toJSON()
      }
    };
    
    return JSON.stringify(genomaData, null, 2);
  }

  /**
   * Get algorithm summary
   * @returns {Object} Algorithm summary
   */
  getSummary() {
    return {
      currentState: this.getCurrentName(),
      parameters: {
        iirCoeff: this.IIR_COEFF,
        iirCoeff2: this.IIR_COEFF_2,
        iirCoeffV: this.IIR_COEFF_V,
        iirCoeffV2: this.IIR_COEFF_V_2
      },
      emas: {
        price: this.ema,
        price2: this.ema2,
        volume: this.emaV,
        volume2: this.emaV2
      },
      inputState: { ...this.inputState },
      trader: this.trader ? this.trader.getSummary() : null
    };
  }
}

/**
 * Utility functions for creating sample genomas
 */
export class Utils {
  /**
   * Create a sample genoma for testing
   * @returns {Genoma} Sample genoma
   */
  static createSampleGenoma() {
    // Create sample state parameters
    const createSampleState = (name, buy = false, sell = false) => {
      return new StateParams(
        name,
        [1, 2], 2,  // N conditions
        [3, 4], 2,  // E conditions  
        [5, 6], 2,  // S conditions
        [7, 8], 2,  // W conditions
        buy, sell
      );
    };

    return new Genoma(
      0.1,   // iirCoeff
      0.05,  // iirCoeff2
      0.1,   // iirCoeffV
      0.05,  // iirCoeffV2
      0.1,   // buyPercent
      0.02,  // marginPercent
      0.01,  // marginPercent2
      0.05,  // marginVPercent
      0.02,  // marginVPercent2
      0.05,  // stopLossPercent
      0.15,  // takeProfitPercent
      createSampleState('NW'),
      createSampleState('N'),
      createSampleState('NE'),
      createSampleState('W'),
      createSampleState('C', true, false),  // Center state can buy
      createSampleState('E'),
      createSampleState('SW'),
      createSampleState('S', false, true), // South state can sell
      createSampleState('SE')
    );
  }

  /**
   * Create a random genoma
   * @returns {Genoma} Random genoma
   */
  static createRandomGenoma_old() {
    return {
        "iir_price_1": 0.8109909965203357,
        "iir_price_2": 0.567397066442554,
        "iir_volume_1": 0.4736356919709921,
        "iir_volume_2": 0.4602251787764138,
        "buy_percent": 11.044812986656183,
        "margin_percent_1": 1.8628937033630433,
        "margin_percent_2": 0.3173393278980975,
        "margin_volume_percent_1": 0.36018803807994326,
        "margin_volume_percent_2": 0.05520260260530676,
        "stop_loss_percent": 12.449718171236945,
        "take_profit_percent": 144.64347192356587,
        "states": {
          "0": {
            "_N": [2, 0],
            "_E": [0],
            "_S": [12],
            "_W": [12]
          },
          "NW": {
            "_SW": [4],
            "_N": [2, 5, 10],
            "_W": [5],
            "_NE": [8],
            "action": "buy"
          },
          "N": {
            "_S": [3],
            "_NE": [12],
            "_0": [4],
            "_NW": [8]
          },
          "NE": {
            "_SE": [4],
            "_NW": [7],
            "_E": [10],
            "_N": [5],
            "action": "sell"
          },
          "W": {
            "_NW": [0],
            "_0": [11, 10],
            "_SW": [0],
            "_E": [0]
          },
          "E": {
            "_NE": [8],
            "_W": [4],
            "_SE": [2],
            "_0": [10]
          },
          "SW": {
            "_W": [9],
            "_S": [4, 3, 6],
            "_SW": [12, 6, 2],
            "_SE": [12]
          },
          "S": {
            "_0": [0],
            "_SE": [3],
            "_N": [8],
            "_SW": [10]
          },
          "SE": {
            "_E": [11],
            "_SW": [7],
            "_NE": [7],
            "_S": [2, 5]
          }
        }
      };
    }

  static createRandomGenoma() {
        return {
        "iir_price_1": 0.7858790987581437,
        "iir_price_2": 0.633721095770688,
        "iir_volume_1": 0.42680716809966746,
        "iir_volume_2": 0.10703692776966767,
        "buy_percent": 2.5432519919351027,
        "margin_percent_1": 0.000545644642545185,
        "margin_percent_2": 0.04601002312858883,
        "margin_volume_percent_1": -2.6251967633838498,
        "margin_volume_percent_2": 1.0116157929398475,
        "stop_loss_percent": 91.74014486914905,
        "take_profit_percent": 240.94174249029376,
        "states": {
            "0": {
                "_N": [
                    8,
                    9
                ],
                "_E": [
                    3,
                    12
                ],
                "_S": [
                    8
                ],
                "_W": [
                    6
                ]
            },
            "NW": {
                "_SW": [
                    1
                ],
                "_N": [
                    12
                ],
                "_W": [
                    9
                ],
                "_NE": [
                    5
                ]
            },
            "N": {
                "_S": [
                    11
                ],
                "_NE": [
                    0
                ],
                "_0": [
                    11
                ],
                "_NW": [
                    11
                ],
                "action": "buy"
            },
            "NE": {
                "_SE": [
                    7
                ],
                "_NW": [
                    9
                ],
                "_E": [
                    7
                ],
                "_N": [
                    11,
                    3
                ],
                "action": "sell"
            },
            "W": {
                "_NW": [
                    9,
                    4,
                    12
                ],
                "_0": [
                    9
                ],
                "_SW": [
                    10
                ],
                "_E": [
                    4
                ]
            },
            "E": {
                "_NE": [
                    10
                ],
                "_W": [
                    3
                ],
                "_SE": [
                    12
                ],
                "_0": [
                    10
                ]
            },
            "SW": {
                "_W": [
                    2
                ],
                "_S": [
                    10
                ],
                "_SW": [
                    1
                ],
                "_SE": [
                    5
                ]
            },
            "S": {
                "_0": [
                    5
                ],
                "_SE": [
                    2
                ],
                "_N": [
                    6,
                    7
                ],
                "_SW": [
                    5
                ]
            },
            "SE": {
                "_E": [
                    7
                ],
                "_SW": [
                    7
                ],
                "_NE": [
                    2,
                    3
                ],
                "_S": [
                    2
                ]
            }
        }
    };
 }
}

export default {
  MAX_CONDITIONS,
  MATRIX_ROWS,
  MATRIX_COLS,
  MAX_CONDITIONS_IN_STATE,
  ConditionFunctions,
  StateParams,
  AlgorithmState,
  Genoma,
  Algorithm,
  Utils
};

