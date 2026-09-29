/** @see ../../docs/architecture/simulator-overview.md#components */
import { Genoma } from '../vendor/consilium/algorithm.js';

export const GENOME_STATES = ['NW', 'N', 'NE', 'W', 'C', 'E', 'SW', 'S', 'SE'];

function deepFreeze(value) {
  for (const nested of Object.values(value)) {
    if (nested && typeof nested === 'object' && !Object.isFrozen(nested)) deepFreeze(nested);
  }
  return Object.freeze(value);
}

export const FIXED_GENOME = deepFreeze({
  iir_price_1: 0.7306070743683732,
  iir_price_2: 0.9901788903839899,
  iir_volume_1: 0.11764634825165177,
  iir_volume_2: 0.3960880808397206,
  buy_percent: 99.61710547935216,
  margin_percent_1: 0.1,
  margin_percent_2: -1.1038551518437734,
  margin_volume_percent_1: 2.40388026364704,
  margin_volume_percent_2: 11.620405602990479,
  stop_loss_percent: 50,
  take_profit_percent: 5.8,
  states: {
    NW: { _SW: [8, 4, 6, 10], _N: [2, 8, 7, 5, 12, 3], _W: [1], _NE: [8] },
    N: { _S: [8, 7, 3, 1], _NE: [10, 12, 4], _0: [6, 11, 1, 8, 12], _NW: [5, 5] },
    NE: { _SE: [8, 6, 10, 8, 4, 8], _NW: [2, 7, 9, 11], _E: [9, 11, 8], _N: [6, 9, 6, 1, 5, 5] },
    W: { _NW: [3, 3, 11, 4], _0: [9, 11, 2, 8, 10, 5, 8, 5], _SW: [3], _E: [11, 0, 12, 5, 4, 0] },
    C: { _N: [1, 1], _E: [0], _S: [0, 1, 1, 8, 0, 10], _W: [11] },
    E: { _NE: [1, 8, 9, 4], _W: [9, 6, 12], _SE: [10], _0: [4, 8, 9, 3] },
    SW: { _W: [6], _S: [9, 2, 0, 12], _SW: [3, 9, 9, 3, 2, 4], _SE: [10, 4, 4, 5, 12, 5, 6, 7], action: 'buy' },
    S: { _0: [4, 4], _SE: [8, 12, 0, 12, 3], _N: [5, 0, 8, 3, 1], _SW: [3, 10, 11] },
    SE: { _E: [5, 5, 4, 1], _SW: [5, 8, 0, 6, 1, 2], _NE: [11, 1, 2], _S: [5, 5] },
  },
});

const TRANSITION_KEYS = new Set(['_0', '_N', '_NE', '_E', '_SE', '_S', '_SW', '_W', '_NW']);

function assertFinite(value, name) {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be a finite number.`);
}

function toFraction(value, name) {
  assertFinite(value, name);
  return value / 100;
}

function cloneAndValidateStates(states) {
  const result = {};

  for (const stateName of GENOME_STATES) {
    const source = states?.[stateName];
    if (!source || typeof source !== 'object') throw new TypeError(`Missing genome state ${stateName}.`);

    const state = {};
    for (const [key, conditions] of Object.entries(source)) {
      if (key === 'action') {
        if (!['buy', 'sell'].includes(conditions)) throw new TypeError(`Invalid action in state ${stateName}.`);
        state.action = conditions;
        continue;
      }
      if (!TRANSITION_KEYS.has(key) || !Array.isArray(conditions)) {
        throw new TypeError(`Invalid transition ${stateName}.${key}.`);
      }
      if (conditions.some((condition) => !Number.isInteger(condition) || condition < 0 || condition > 13)) {
        throw new TypeError(`Invalid condition ID in state ${stateName}.${key}.`);
      }
      state[key] = [...conditions];
    }

    result[stateName] = state;
  }

  return result;
}

export function createConsiliumGenome(source = FIXED_GENOME) {
  const coefficients = [
    source.iir_price_1,
    source.iir_price_2,
    source.iir_volume_1,
    source.iir_volume_2,
  ];
  coefficients.forEach((value, index) => assertFinite(value, `IIR coefficient ${index + 1}`));
  if (coefficients.some((value) => value <= 0 || value >= 1)) {
    throw new RangeError('IIR coefficients must be greater than 0 and less than 1.');
  }

  const validatedStates = cloneAndValidateStates(source.states);
  const genoma = new Genoma(
    source.iir_price_1,
    source.iir_price_2,
    source.iir_volume_1,
    source.iir_volume_2,
    toFraction(source.buy_percent, 'buy_percent'),
    toFraction(source.margin_percent_1, 'margin_percent_1'),
    toFraction(source.margin_percent_2, 'margin_percent_2'),
    toFraction(source.margin_volume_percent_1, 'margin_volume_percent_1'),
    toFraction(source.margin_volume_percent_2, 'margin_volume_percent_2'),
    toFraction(source.stop_loss_percent, 'stop_loss_percent'),
    toFraction(source.take_profit_percent, 'take_profit_percent'),
    ...GENOME_STATES.map((state) => validatedStates[state]),
  );

  for (const state of Object.values(genoma.states)) {
    for (const conditions of Object.values(state)) {
      if (Array.isArray(conditions)) Object.freeze(conditions);
    }
    Object.freeze(state);
  }
  Object.freeze(genoma.states);
  return Object.freeze(genoma);
}