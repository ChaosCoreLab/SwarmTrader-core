/** @see ../../docs/architecture/simulator-overview.md#strategy-contract */
import { Individual } from '../vendor/consilium/individual.js';
import { createConsiliumGenome, FIXED_GENOME, GENOME_STATES } from './genome.js';

/** The Consilium state-machine genome seen through the strategy contract; trading behaviour is the vendor's. */
export class FsmIndividual extends Individual {
  kind = 'fsm';
  labels = GENOME_STATES;

  constructor(initialCapital, genoma, rawGenome) {
    super(initialCapital, genoma);
    this.rawGenome = rawGenome;
  }

  describe() {
    const algo = this.algo;
    return {
      label: algo.getCurrentName(),
      indicators: {
        iirPrice1: algo.ema,
        iirPrice2: algo.ema2,
        iirVolume1: algo.emaV,
        iirVolume2: algo.emaV2,
      },
    };
  }

  serialize() {
    return structuredClone(this.rawGenome);
  }
}

/** Validates the snake_case genome once and returns a factory of independent individuals. */
export function createFsmFactory(rawGenome = FIXED_GENOME) {
  const genoma = createConsiliumGenome(rawGenome);
  const snapshot = structuredClone(rawGenome);
  return (initialCapital) => new FsmIndividual(initialCapital, genoma, snapshot);
}
