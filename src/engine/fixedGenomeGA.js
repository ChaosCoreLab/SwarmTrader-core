/** @see ../../docs/architecture/simulator-overview.md#components */
import { GA } from '../vendor/consilium/ga.js';
import { Individual } from '../vendor/consilium/individual.js';

export const INITIAL_CAPITAL = 10_000;

export class FixedGenomeGA extends GA {
  constructor(genome, initialCapital = INITIAL_CAPITAL, createIndividual = null) {
    super();
    this.genome = genome;
    this.initialCapital = initialCapital;
    this.createIndividual = createIndividual;
    this.lastEvaluation = null;
  }

  async createNewChild() {
    if (this.createIndividual) return this.createIndividual(this.initialCapital);
    return new Individual(this.initialCapital, this.genome);
  }

  async getBestChild() {
    return null;
  }

  async censusIndividual(individual, cagrAvg, cagrStandardDeviation, cagrArray = []) {
    this.lastEvaluation = { individual, cagrAvg, cagrStandardDeviation, cagrArray: [...cagrArray] };
  }

  showResults() {}
}