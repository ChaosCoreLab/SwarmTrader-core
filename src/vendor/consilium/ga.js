/**
 * Genetic Algorithm implementation for trading strategy optimization
 * Translated from luna/ga.h and luna/ga.cpp
 */

import { Individual } from './individual.js';
import { Utils } from './algorithm.js';

/**
 * Abstract GA interface
 */
export class GA {
  /**
   * Factory method to create GA instance
   * @param {Object} dataSource - Data source for communication
   * @returns {GA} GA instance
   */
  static instance(dataSource) {
    return new LocalGA(dataSource);
  }

  /**
   * Create a new child individual
   * @returns {Promise<Individual>} New individual
   */
  async createNewChild() {
    throw new Error('createNewChild must be implemented by subclass');
  }

  /**
   * Get the best child individual
   * @returns {Promise<Individual>} Best individual
   */
  async getBestChild() {
    throw new Error('getBestChild must be implemented by subclass');
  }

  /**
   * Census (evaluate) an individual
   * @param {Individual} individual - Individual to evaluate
   * @param {number} cagrAvg - Average CAGR
   * @param {number} cagrStandardDeviation - CAGR standard deviation
   * @param {Array<number>} cagrArray - Array of all CAGR values
   * @returns {Promise<void>}
   */
  async censusIndividual(individual, cagrAvg, cagrStandardDeviation, cagrArray = []) {
    throw new Error('censusIndividual must be implemented by subclass');
  }

  /**
   * Show results for an individual
   * @param {Individual} individual - Individual to show results for
   */
  showResults(individual) {
    throw new Error('showResults must be implemented by subclass');
  }
}

/**
 * Local genetic algorithm implementation
 */
export class LocalGA extends GA {
  constructor(dataSource, populationSize = 50) {
    super();
    this.dataSource = dataSource;
    this.populationSize = populationSize;
    this.population = [];
    this.generation = 0;
    this.bestIndividual = null;
    this.bestFitness = -Infinity;
    this.eliteSize = Math.floor(populationSize * 0.2); // Top 20%
    this.mutationRate = 0.1;
    this.crossoverRate = 0.8;
    this.evaluationHistory = [];
    
    // Initialize population
    this.initializePopulation();
    
    ///TODO: 
    // 1. read all the individuals from dataSource if available
    // 2. evolve the population in the browser. 
    // 3. periodically save the best individuals to dataSource
  }

  /**
   * Initialize the population with random individuals
   */
  initializePopulation() {
    console.log(`Initializing GA population with ${this.populationSize} individuals`);
    
    this.population = [];
    for (let i = 0; i < this.populationSize; i++) {
      const genoma = Utils.createRandomGenoma();
      const individual = new Individual(10000, genoma); // $10,000 initial capital
      this.population.push(individual);
    }
    
    console.log('GA population initialized');
  }

  /**
   * Create a new child individual
   * @returns {Promise<Individual>} New individual
   */
  async createNewChild() {
    if (this.population.length === 0) {
      // Create random individual if no population
      const genoma = Utils.createRandomGenoma();
      return new Individual(10000, genoma);
    }
    
    // Select parents using tournament selection
    const parent1 = this.tournamentSelection();
    const parent2 = this.tournamentSelection();
    
    // Create offspring through crossover
    let child;
    if (Math.random() < this.crossoverRate) {
      child = parent1.crossover(parent2);
    } else {
      child = parent1.clone();
    }
    
    // Apply mutation
    child.mutate(this.mutationRate);
    
    return child;
  }

  /**
   * Get the best child individual
   * @returns {Promise<Individual>} Best individual
   */
  async getBestChild() {
    return this.bestIndividual ? this.bestIndividual.clone() : null;
  }

  /**
   * Census (evaluate) an individual
   * @param {Individual} individual - Individual to evaluate
   * @param {number} cagrAvg - Average CAGR
   * @param {number} cagrStandardDeviation - CAGR standard deviation
   * @param {Array<number>} cagrArray - Array of all CAGR values
   * @returns {Promise<void>}
   */
  async censusIndividual(individual, cagrAvg, cagrStandardDeviation, cagrArray = []) {
    // Calculate fitness based on CAGR and risk (now includes cagrArray for improved fitness)
    const fitness = this.calculateFitness(cagrAvg, cagrStandardDeviation, cagrArray);
    individual.fitness = fitness;
    individual.evaluated = true;
    
    // Record evaluation with CAGR array
    this.evaluationHistory.push({
      generation: this.generation,
      cagrAvg: cagrAvg,
      cagrStandardDeviation: cagrStandardDeviation,
      cagrArray: [...cagrArray], // Store copy of CAGR array
      fitness: fitness,
      timestamp: Date.now()
    });
    
    // Update best individual
    if (fitness > this.bestFitness) {
      this.bestFitness = fitness;
      this.bestIndividual = individual.clone();
      console.log(`New best individual found! Fitness: ${fitness.toFixed(2)}, CAGR: ${cagrAvg.toFixed(2)}%`);
    }
    
    // Add to population if there's space or replace worst
    if (this.population.length < this.populationSize) {
      this.population.push(individual.clone());
    } else {
      // Replace worst individual
      const worstIndex = this.findWorstIndividualIndex();
      if (fitness > this.population[worstIndex].fitness) {
        this.population[worstIndex] = individual.clone();
      }
    }
    
    console.log(`Individual evaluated - Fitness: ${fitness.toFixed(2)}, CAGR: ${cagrAvg.toFixed(2)}%, StdDev: ${cagrStandardDeviation.toFixed(2)}%`);
  }

  /**
   * Calculate fitness from CAGR and standard deviation
   * Improved version: penalizes failures, rewards consistency
   * @param {number} cagrAvg - Average CAGR
   * @param {number} cagrStandardDeviation - CAGR standard deviation
   * @param {Array<number>} cagrArray - Array of all CAGR values
   * @returns {number} Fitness score
   * @private
   */
  calculateFitness(cagrAvg, cagrStandardDeviation, cagrArray = []) {
    // If cagrArray not provided, use old fitness function
    if (cagrArray.length === 0) {
      const returnScore = cagrAvg;
      const riskPenalty = cagrStandardDeviation * 0.5;
      let fitness = returnScore - riskPenalty;
      if (cagrAvg > 0) fitness += cagrAvg * 0.1;
      if (cagrAvg < 0) fitness += cagrAvg * 2;
      return fitness;
    }

    // --- IMPROVED FITNESS FUNCTION ---
    
    // 1. Success Rate Component (40 points max)
    const successCount = cagrArray.filter(cagr => cagr > 0).length;
    const successRate = successCount / cagrArray.length;
    const successScore = successRate * 40;
    
    // 2. Average Return Component (only successful streams)
    const successfulCAGRs = cagrArray.filter(cagr => cagr > 0);
    const avgSuccessCAGR = successfulCAGRs.length > 0 ?
      successfulCAGRs.reduce((a, b) => a + b, 0) / successfulCAGRs.length : 0;
    const returnScore = avgSuccessCAGR * 0.5;
    
    // 3. Worst-Case Penalty (penalize severe failures)
    const minCAGR = Math.min(...cagrArray);
    const worstCasePenalty = minCAGR < 0 ? Math.abs(minCAGR) * 2 : 0;
    
    // 4. Risk Penalty (standard deviation)
    const riskPenalty = cagrStandardDeviation * 0.3;
    
    // 5. Consistency Bonus (if most stocks are positive)
    const consistencyBonus = successRate > 0.75 ? avgSuccessCAGR * 0.2 : 0;
    
    // 6. Failure Penalty (average of failed streams)
    const failedCAGRs = cagrArray.filter(cagr => cagr < 0);
    const avgFailCAGR = failedCAGRs.length > 0 ?
      failedCAGRs.reduce((a, b) => a + b, 0) / failedCAGRs.length : 0;
    const failurePenalty = Math.abs(avgFailCAGR) * 1.5;
    
    // Combined Fitness
    const fitness = successScore + returnScore - worstCasePenalty - riskPenalty + consistencyBonus - failurePenalty;
    
    // Debug logging (can be removed in production)
    if (Math.random() < 0.1) { // Log 10% of evaluations
      console.log(`📊 Fitness Breakdown:`);
      console.log(`  Success Rate: ${(successRate * 100).toFixed(1)}% → ${successScore.toFixed(2)} points`);
      console.log(`  Avg Success CAGR: ${avgSuccessCAGR.toFixed(2)}% → ${returnScore.toFixed(2)} points`);
      console.log(`  Worst Case: ${minCAGR.toFixed(2)}% → -${worstCasePenalty.toFixed(2)} points`);
      console.log(`  Risk (StdDev): ${cagrStandardDeviation.toFixed(2)}% → -${riskPenalty.toFixed(2)} points`);
      console.log(`  Consistency Bonus: ${consistencyBonus.toFixed(2)} points`);
      console.log(`  Failure Penalty: -${failurePenalty.toFixed(2)} points`);
      console.log(`  🎯 Total Fitness: ${fitness.toFixed(2)}`);
    }
    
    return fitness;
  }

  /**
   * Tournament selection for parent selection
   * @param {number} tournamentSize - Size of tournament
   * @returns {Individual} Selected individual
   * @private
   */
  tournamentSelection(tournamentSize = 3) {
    const evaluatedPopulation = this.population.filter(ind => ind.evaluated);
    
    if (evaluatedPopulation.length === 0) {
      // Return random individual if none evaluated
      return this.population[Math.floor(Math.random() * this.population.length)];
    }
    
    let best = null;
    let bestFitness = -Infinity;
    
    for (let i = 0; i < tournamentSize; i++) {
      const candidate = evaluatedPopulation[Math.floor(Math.random() * evaluatedPopulation.length)];
      if (candidate.fitness > bestFitness) {
        best = candidate;
        bestFitness = candidate.fitness;
      }
    }
    
    return best || evaluatedPopulation[0];
  }

  /**
   * Find index of worst individual in population
   * @returns {number} Index of worst individual
   * @private
   */
  findWorstIndividualIndex() {
    let worstIndex = 0;
    let worstFitness = Infinity;
    
    for (let i = 0; i < this.population.length; i++) {
      const individual = this.population[i];
      if (individual.evaluated && individual.fitness < worstFitness) {
        worstFitness = individual.fitness;
        worstIndex = i;
      }
    }
    
    return worstIndex;
  }

  /**
   * Evolve the population for one generation
   * @param {Array} trainingData - Training data for evaluation
   * @returns {Promise<Object>} Evolution results
   */
  async evolve(trainingData) {
    console.log(`Evolving generation ${this.generation + 1}`);
    
    // Evaluate all individuals if not already evaluated
    const evaluationPromises = this.population
      .filter(ind => !ind.evaluated)
      .map(async (individual) => {
        const fitness = await individual.evaluate(trainingData);
        return { individual, fitness };
      });
    
    const evaluationResults = await Promise.all(evaluationPromises);
    
    // Update fitness values
    evaluationResults.forEach(result => {
      result.individual.fitness = result.fitness;
      result.individual.evaluated = true;
    });
    
    // Sort population by fitness
    this.population.sort((a, b) => b.fitness - a.fitness);
    
    // Update best individual
    if (this.population.length > 0 && this.population[0].fitness > this.bestFitness) {
      this.bestFitness = this.population[0].fitness;
      this.bestIndividual = this.population[0].clone();
    }
    
    // Create next generation
    const newPopulation = [];
    
    // Keep elite individuals
    for (let i = 0; i < this.eliteSize && i < this.population.length; i++) {
      newPopulation.push(this.population[i].clone());
    }
    
    // Generate offspring to fill the rest
    while (newPopulation.length < this.populationSize) {
      const parent1 = this.tournamentSelection();
      const parent2 = this.tournamentSelection();
      
      let child;
      if (Math.random() < this.crossoverRate) {
        child = parent1.crossover(parent2);
      } else {
        child = parent1.clone();
      }
      
      child.mutate(this.mutationRate);
      newPopulation.push(child);
    }
    
    this.population = newPopulation;
    this.generation++;
    
    const avgFitness = this.population.reduce((sum, ind) => sum + (ind.fitness || 0), 0) / this.population.length;
    const maxFitness = Math.max(...this.population.map(ind => ind.fitness || -Infinity));
    
    console.log(`Generation ${this.generation} complete - Avg fitness: ${avgFitness.toFixed(2)}, Max fitness: ${maxFitness.toFixed(2)}`);
    
    return {
      generation: this.generation,
      avgFitness: avgFitness,
      maxFitness: maxFitness,
      bestIndividual: this.bestIndividual ? this.bestIndividual.clone() : null
    };
  }

  /**
   * Show results for an individual
   * @param {Individual} individual - Individual to show results for
   */
  showResults(individual) {
    const performance = individual.getPerformanceSummary();
    
    console.log('=== Individual Results ===');
    console.log(`CAGR: ${performance.cagr.toFixed(2)}%`);
    console.log(`Success Ratio: ${performance.successRatio}`);
    console.log(`Total Return: $${performance.totalReturn.toFixed(2)}`);
    console.log(`Success Rate: ${performance.successRate.toFixed(2)}%`);
    console.log(`Total Trades: ${performance.totalTrades}`);
    console.log(`Current Capital: $${performance.currentCapital.toFixed(2)}`);
    console.log(`Max Drawdown: ${performance.maxDrawdown.toFixed(2)}%`);
    console.log(`Fitness: ${individual.fitness.toFixed(2)}`);
    console.log('========================');
  }

  /**
   * Get GA status and statistics
   * @returns {Object} GA status
   */
  getStatus() {
    const evaluatedCount = this.population.filter(ind => ind.evaluated).length;
    
    return {
      generation: this.generation,
      populationSize: this.populationSize,
      evaluatedCount: evaluatedCount,
      bestFitness: this.bestFitness,
      bestIndividual: this.bestIndividual ? this.bestIndividual.getPerformanceSummary() : null,
      evaluationHistory: this.evaluationHistory.slice(-10), // Last 10 evaluations
      parameters: {
        eliteSize: this.eliteSize,
        mutationRate: this.mutationRate,
        crossoverRate: this.crossoverRate
      }
    };
  }

  /**
   * Set GA parameters
   * @param {Object} params - Parameters to set
   */
  setParameters(params) {
    if (params.mutationRate !== undefined) this.mutationRate = params.mutationRate;
    if (params.crossoverRate !== undefined) this.crossoverRate = params.crossoverRate;
    if (params.eliteSize !== undefined) this.eliteSize = params.eliteSize;
    
    console.log('GA parameters updated:', params);
  }

  /**
   * Reset GA to initial state
   */
  reset() {
    this.generation = 0;
    this.bestIndividual = null;
    this.bestFitness = -Infinity;
    this.evaluationHistory = [];
    this.initializePopulation();
    
    console.log('GA reset to initial state');
  }

  /**
   * Export GA state to JSON
   * @returns {Object} GA state
   */
  toJSON() {
    return {
      generation: this.generation,
      populationSize: this.populationSize,
      bestFitness: this.bestFitness,
      bestIndividual: this.bestIndividual ? this.bestIndividual.toJSON() : null,
      evaluationHistory: this.evaluationHistory,
      parameters: {
        eliteSize: this.eliteSize,
        mutationRate: this.mutationRate,
        crossoverRate: this.crossoverRate
      }
    };
  }

  /**
   * Import GA state from JSON
   * @param {Object} json - GA state data
   */
  fromJSON(json) {
    this.generation = json.generation || 0;
    this.populationSize = json.populationSize || 50;
    this.bestFitness = json.bestFitness || -Infinity;
    this.evaluationHistory = json.evaluationHistory || [];
    
    if (json.bestIndividual) {
      this.bestIndividual = Individual.fromJSON(json.bestIndividual, 10000);
    }
    
    if (json.parameters) {
      this.setParameters(json.parameters);
    }
    
    // Reinitialize population
    this.initializePopulation();
    
    console.log('GA state loaded from JSON');
  }
}

/**
 * Remote GA implementation (for server communication)
 */
export class RemoteGA extends GA {
  constructor(dataSource, options = {}, tracer = null) {
    super();
    this.dataSource = dataSource;
    this.serverUrl = '/ga';
    this.tracer = tracer;
    this.cagrThreshold = options.cagrThreshold || 0; // Default to 0 if not provided
    this.partition = options.partition || 'P10'; // Partition support (P1-P10)
  }

  /**
   * Create a new child individual from server
   * @returns {Promise<Individual>} New individual
   */
  async createNewChild() {
    try {
      const response = await this.dataSource.get(`${this.serverUrl}/create?partition=${this.partition}`, {});

      if (response.error === 'DATA_OK' && response.data) {
        return Individual.fromJSON(response.data, 10000, this.tracer);
      } else {
        throw new Error('Failed to create child from server');
      }
    } catch (error) {
      console.error('Error creating child from server:', error);
      // Fallback to local creation
      const genoma = Utils.createRandomGenoma();
      return Individual.fromJSON(genoma, 10000, this.tracer);
    }
  } 

  /**
   * Get the best child individual from server
   * @returns {Promise<Individual>} Best individual
   */
  async getBestChild() {
    try {
      const response = await this.dataSource.get(`${this.serverUrl}/best-child`);
      
      if (response.error === 'DATA_OK' && response.data) {
        return Individual.fromJSON(response.data, 10000);
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting best child from server:', error);
      return null;
    }
  }

  /**
   * Census (evaluate) an individual on server
   * @param {Individual} individual - Individual to evaluate
   * @param {number} cagrAvg - Average CAGR
   * @param {number} cagrStandardDeviation - CAGR standard deviation
   * @param {Array<number>} cagrArray - Array of all CAGR values
   * @returns {Promise<void>}
   */
  async censusIndividual(individual, cagrAvg, cagrStandardDeviation, cagrArray = []) {
    if(cagrAvg < this.cagrThreshold) return;

    try {
      const data = {
        genoma: JSON.stringify(individual.toJSON()),
        cagr: cagrAvg,
        cagr_st_dev: cagrStandardDeviation,
        cagrArray: cagrArray, // Include CAGR array in server request
        success_rate: individual.getSuccessRatio(),
        partition: this.partition // Include partition
      };

      const response = await this.dataSource.post(`${this.serverUrl}/save`, data);

      if (response.error !== 'DATA_OK') {
        console.warn('Server census failed, using local fallback');
      }

      console.log(`Individual sent to server - CAGR: ${cagrAvg.toFixed(2)}%, StdDev: ${cagrStandardDeviation.toFixed(2)}%, Partition: ${this.partition}, Array length: ${cagrArray.length}`);

    } catch (error) {
      console.error('Error sending individual to server:', error);
    }
  }

  /**
   * Show results for an individual
   * @param {Individual} individual - Individual to show results for
   */
  showResults(individual) {
    const performance = individual.getPerformanceSummary();
    
    console.log('=== Remote GA Individual Results ===');
    console.log(`CAGR: ${performance.cagr.toFixed(2)}%`);
    console.log(`Success Ratio: ${performance.successRatio}`);
    console.log(`Total Return: $${performance.totalReturn.toFixed(2)}`);
    console.log(`Fitness: ${individual.fitness.toFixed(2)}`);
    console.log('===================================');
  }
}

export default {
  GA,
  LocalGA,
  RemoteGA
};

