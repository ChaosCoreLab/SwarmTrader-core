/**
 * Data Exporter for Algorithm Analysis
 * Exports data during Life cycles for Excel analysis
 */

export class DataExporter {
  constructor() {
    this.data = [];
    this.currentCycle = 0;
    this.isEnabled = true;
  }

  /**
   * Enable or disable data collection
   * @param {boolean} enabled - Whether to collect data
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  /**
   * Start a new cycle
   * @param {number} cycleNumber - The cycle number
   */
  startCycle(cycleNumber) {
    this.currentCycle = cycleNumber;
  }

  /**
   * Collect data from all individuals at a specific data point
   * @param {Array<Individual>} individuals - Array of individuals
   * @param {Object} stockData - Current stock data
   * @param {number} dataIndex - Index in the stock data series
   */
  collectData(individuals, stockData, dataIndex) {
    if (!this.isEnabled || !individuals || individuals.length === 0) {
      return;
    }

    const timestamp = stockData.t;// || new Date().toISOString();
    
    individuals.forEach((individual, individualIndex) => {
      if (!individual.algo || !individual.trader) {
        return;
      }

      const algorithm = individual.algo;
      const trader = individual.trader;
      const portfolio = trader.broker?.portfolio;

      if (!portfolio) {
        return;
      }

      // Collect Algorithm data - separate internal data from CSV export data
      const algorithmData = {
        // Internal tracking (not exported to CSV)
        _cycle: this.currentCycle,
        _individual: individualIndex,
        _dataPoint: dataIndex,
        
        // CSV Export data
        timestamp: timestamp,
        // Stock Data
        stockData_open: stockData.open,
        stockData_high: stockData.max,
        stockData_low: stockData.min,
        stockData_close: stockData.close,
        stockData_volume: stockData.volume,
        // Algorithm Input State
        inputState_volume: algorithm.inputState.volume,
        inputState_marginAbs: algorithm.inputState.marginAbs,
        inputState_marginAbs2: algorithm.inputState.marginAbs2,
        inputState_marginVAbs: algorithm.inputState.marginVAbs,
        inputState_marginVAbs2: algorithm.inputState.marginVAbs2,
        
        // EMAs
        ema_price: algorithm.ema,
        ema_price2: algorithm.ema2,
        ema_volume: algorithm.emaV,
        ema_volume2: algorithm.emaV2,
        
        // Current State
        currentState: algorithm.getCurrentName(),
        
        // Trader data
        trader_capital: trader.getCapital(),
        trader_totalValue: trader.getTotalValue(),
        trader_initialCapital: trader.initialCapital,
        //trader_performance: trader.getAbsPerformance(),
        //trader_yearlyPerformance: trader.getYearlyPerformance(),
        trader_successRate: trader.getSuccessRatio(),
        
        // Portfolio data
        portfolio_positionsCount: 0,
        portfolio_totalQuantity: 0,
        portfolio_totalValue: 0,
        portfolio_currentValue: 0,
        portfolio_currentGain: 0,
        //portfolio_currentCAGR: 0
      };

      // Calculate portfolio metrics and collect position data
      if (portfolio) {
        // Get portfolio summary
        try {
          algorithmData.portfolio_currentValue = portfolio.getCurrentValue() || 0;
          algorithmData.portfolio_currentGain = portfolio.getCurrentGain() || 0;
          //algorithmData.portfolio_currentCAGR = portfolio.getCurrentCAGR() || 0;
        } catch (e) {
          // Fallback if methods don't exist
          algorithmData.portfolio_currentValue = 0;
          algorithmData.portfolio_currentGain = 0;
          //algorithmData.portfolio_currentCAGR = 0;
        }

        // Handle different portfolio data structures
        let positions = [];
        if (portfolio.positions && Array.isArray(portfolio.positions)) {
          positions = portfolio.positions;
        } else if (portfolio.positions && typeof portfolio.positions === 'object') {
          positions = Object.values(portfolio.positions);
        } else if (portfolio.getPositions && typeof portfolio.getPositions === 'function') {
          positions = portfolio.getPositions();
        }

        algorithmData.portfolio_positionsCount = positions.length > 0 
                ? positions.map(p => `(${p.takeProfitPrice || 0}, ${p.stopLossPrice || 0})`).join('; ')
                : '0';
          
        // Collect detailed position data
        positions.forEach((position, positionIndex) => {
          if (position) {
            // Add position-specific data to the main record
            const posPrefix = `position_${positionIndex}_`;
            
            // Basic position data
            algorithmData[`${posPrefix}quantity`] = position.quantity || 0;
            algorithmData[`${posPrefix}entryTime`] = position.entryTime || null;
            algorithmData[`${posPrefix}stopLossPrice`] = position.stopLossPrice || 0;
            algorithmData[`${posPrefix}takeProfitPrice`] = position.takeProfitPrice || 0;
            
            // Stock data at entry
            if (position.stock_data) {
              algorithmData[`${posPrefix}entry_open`] = position.stock_data.open || 0;
              algorithmData[`${posPrefix}entry_high`] = position.stock_data.high || 0;
              algorithmData[`${posPrefix}entry_low`] = position.stock_data.low || 0;
              algorithmData[`${posPrefix}entry_close`] = position.stock_data.close || 0;
              algorithmData[`${posPrefix}entry_volume`] = position.stock_data.volume || 0;
            }
            
            // Calculated position metrics
            try {
              algorithmData[`${posPrefix}initialValue`] = position.getInitialValue ? position.getInitialValue() : 0;
              if (position.getHoldingPeriodDays) {
                algorithmData[`${posPrefix}holdingPeriodDays`] = position.getHoldingPeriodDays(stockData.t || Date.now());
              }
              if (position.getCAGR && stockData) {
                algorithmData[`${posPrefix}CAGR`] = position.getCAGR(stockData);
              }
            } catch (e) {
              // Fallback if methods don't exist
              algorithmData[`${posPrefix}initialValue`] = (position.quantity || 0) * (position.stock_data?.open || 0);
              algorithmData[`${posPrefix}holdingPeriodDays`] = 0;
              algorithmData[`${posPrefix}CAGR`] = 0;
            }

            // Portfolio totals
            algorithmData.portfolio_totalQuantity += position.quantity || 0;
            algorithmData.portfolio_totalValue += algorithmData[`${posPrefix}initialValue`];
          }
        });
      }

      this.data.push(algorithmData);
    });
  }

  /**
   * Export data to CSV format
   * @returns {string} CSV formatted data
   */
  exportToCSV() {
    if (this.data.length === 0) {
      return 'No data collected';
    }

    // Get all keys from the data, excluding internal fields (starting with _)
    const allHeaders = Object.keys(this.data[0]);
    const headers = allHeaders.filter(header => !header.startsWith('_'));
    
    // Create CSV header
    let csv = headers.join('\t') + '\n';
    
    // Add data rows
    this.data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value !== null && value !== undefined ? value : '';
      });
      csv += values.join('\t') + '\n';
    });

    // Convert decimal points to commas for Italian Excel
    csv = csv.replace(/(\d)\.(\d)/g, '$1,$2');
    
    return csv;
  }

  /**
   * Export data to JSON format
   * @returns {string} JSON formatted data
   */
  exportToJSON() {
    return JSON.stringify(this.data, null, 2);
  }

  /**
   * Save data to file (works in Node.js environment)
   * @param {string} filename - Output filename
   * @param {string} format - 'csv' or 'json'
   */
  saveToFile(filename, format = 'csv') {
    const data = format === 'json' ? this.exportToJSON() : this.exportToCSV();
    
    // For browser environment, trigger download
    if (typeof window !== 'undefined') {
      this.downloadData(data, filename, format);
    } else {
      // For Node.js environment
      const fs = require('fs');
      fs.writeFileSync(filename, data, 'utf8');
      console.log(`Data exported to ${filename}`);
    }
  }

  /**
   * Download data in browser environment
   * @param {string} data - Data content
   * @param {string} filename - Output filename
   * @param {string} format - File format
   * @private
   */
  downloadData(data, filename, format) {
    const mimeType = format === 'json' ? 'application/json' : 'text/csv';
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Get summary statistics of collected data
   * @returns {Object} Summary statistics
   */
  getSummary() {
    if (this.data.length === 0) {
      return { message: 'No data collected' };
    }

    const cycles = new Set(this.data.map(d => d._cycle));
    const individuals = new Set(this.data.map(d => d._individual));
    const dataPoints = new Set(this.data.map(d => d._dataPoint));

    return {
      totalRecords: this.data.length,
      cycles: cycles.size,
      individuals: individuals.size,
      dataPointsPerCycle: dataPoints.size,
      cycleRange: {
        min: Math.min(...cycles),
        max: Math.max(...cycles)
      },
      timeRange: {
        start: this.data[0]?.timestamp,
        end: this.data[this.data.length - 1]?.timestamp
      }
    };
  }

  /**
   * Clear all collected data
   */
  clear() {
    this.data = [];
    this.currentCycle = 0;
  }

  /**
   * Get data for specific cycle
   * @param {number} cycleNumber - Cycle to filter
   * @returns {Array} Data for the specified cycle
   */
  getDataForCycle(cycleNumber) {
    return this.data.filter(d => d._cycle === cycleNumber);
  }

  /**
   * Get data for specific individual
   * @param {number} individualIndex - Individual to filter
   * @returns {Array} Data for the specified individual
   */
  getDataForIndividual(individualIndex) {
    return this.data.filter(d => d._individual === individualIndex);
  }

  /**
   * Generate Excel-friendly summary by cycle
   * @returns {string} CSV format optimized for Excel pivot tables
   */
  exportSummaryBycycle() {
    if (this.data.length === 0) {
      return 'No data collected';
    }

    // Group data by cycle and individual
    const summary = {};
    
    this.data.forEach(record => {
      const key = `${record._cycle}_${record._individual}`;
      if (!summary[key]) {
        summary[key] = {
          cycle: record._cycle,
          individual: record._individual,
          dataPoints: 0,
          avgCapital: 0,
          finalCapital: 0,
          avgPerformance: 0,
          finalPerformance: 0,
          avgEmaPrice: 0,
          avgEmaVolume: 0,
          stateTransitions: {},
          totalPositions: 0
        };
      }
      
      const sum = summary[key];
      sum.dataPoints++;
      sum.avgCapital += record.trader_capital || 0;
      sum.avgPerformance += record.trader_performance || 0;
      sum.avgEmaPrice += record.ema_price || 0;
      sum.avgEmaVolume += record.ema_volume || 0;
      sum.totalPositions += record.portfolio_positionsCount || 0;
      
      // Portfolio metrics
      if (!sum.avgPortfolioValue) sum.avgPortfolioValue = 0;
      if (!sum.avgPortfolioGain) sum.avgPortfolioGain = 0;
      if (!sum.avgPortfolioCAGR) sum.avgPortfolioCAGR = 0;
      
      sum.avgPortfolioValue += record.portfolio_currentValue || 0;
      sum.avgPortfolioGain += record.portfolio_currentGain || 0;
      sum.avgPortfolioCAGR += record.portfolio_currentCAGR || 0;
      
      // Track final values
      sum.finalCapital = record.trader_capital || 0;
      sum.finalPerformance = record.trader_performance || 0;
      sum.finalPortfolioValue = record.portfolio_currentValue || 0;
      sum.finalPortfolioGain = record.portfolio_currentGain || 0;
      
      // Count state transitions
      if (!sum.stateTransitions[record.currentState]) {
        sum.stateTransitions[record.currentState] = 0;
      }
      sum.stateTransitions[record.currentState]++;
    });

    // Calculate averages
    Object.values(summary).forEach(sum => {
      sum.avgCapital /= sum.dataPoints;
      sum.avgPerformance /= sum.dataPoints;
      sum.avgEmaPrice /= sum.dataPoints;
      sum.avgPortfolioValue /= sum.dataPoints;
      sum.avgPortfolioGain /= sum.dataPoints;
      sum.avgPortfolioCAGR /= sum.dataPoints;
      sum.avgEmaVolume /= sum.dataPoints;
      sum.avgPositions = sum.totalPositions / sum.dataPoints;
      sum.mostUsedState = Object.keys(sum.stateTransitions).reduce((a, b) => 
        sum.stateTransitions[a] > sum.stateTransitions[b] ? a : b
      );
    });

    // Convert to CSV
    const headers = [
      'cycle', 'individual', 'dataPoints', 'avgCapital', 'finalCapital',
      'avgPerformance', 'finalPerformance', 'avgEmaPrice', 'avgEmaVolume',
      'avgPositions', 'mostUsedState', 'avgPortfolioValue', 'finalPortfolioValue',
      'avgPortfolioGain', 'finalPortfolioGain', 'avgPortfolioCAGR'
    ];
    
    let csv = headers.join(',') + '\n';
    
    Object.values(summary).forEach(sum => {
      const values = headers.map(header => sum[header] || '');
      csv += values.join(',') + '\n';
    });
    
    return csv;
  }

  /**
   * Export detailed position data to CSV format
   * This creates a separate file with all individual position details
   * @returns {string} CSV formatted position data
   */
  exportPositionsToCSV() {
    if (this.data.length === 0) {
      return 'No data collected';
    }

    const positionData = [];
    
    this.data.forEach(record => {
      // Find all position fields in this record
      const positionFields = {};
      Object.keys(record).forEach(key => {
        if (key.startsWith('position_')) {
          const parts = key.split('_');
          const positionIndex = parts[1];
          const fieldName = parts.slice(2).join('_');
          
          if (!positionFields[positionIndex]) {
            positionFields[positionIndex] = {
              cycle: record._cycle,
              individual: record._individual,
              dataPoint: record._dataPoint,
              timestamp: record.timestamp,
              positionIndex: positionIndex
            };
          }
          
          positionFields[positionIndex][fieldName] = record[key];
        }
      });
      
      // Add each position as a separate record
      Object.values(positionFields).forEach(position => {
        positionData.push(position);
      });
    });

    if (positionData.length === 0) {
      return 'No position data found';
    }

    // Get headers from the first position record
    const headers = Object.keys(positionData[0]);
    
    // Create CSV
    let csv = headers.join('\t') + '\n';
    
    positionData.forEach(position => {
      const values = headers.map(header => {
        const value = position[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value !== null && value !== undefined ? value : '';
      });
      csv += values.join('\t') + '\n';
    });

    // Convert decimal points to commas for Italian Excel
    csv = csv.replace(/(\d)\.(\d)/g, '$1,$2');
    
    return csv;
  }

  /**
   * Get summary of position data
   * @returns {Object} Position data summary
   */
  getPositionSummary() {
    if (this.data.length === 0) {
      return { message: 'No data collected' };
    }

    let totalPositions = 0;
    let totalPositionValue = 0;
    const positionsByType = {};

    this.data.forEach(record => {
      totalPositions += record.portfolio_positionsCount || 0;
      totalPositionValue += record.portfolio_totalValue || 0;
      
      // Count position fields
      Object.keys(record).forEach(key => {
        if (key.startsWith('position_')) {
          const parts = key.split('_');
          const fieldName = parts.slice(2).join('_');
          
          if (!positionsByType[fieldName]) {
            positionsByType[fieldName] = 0;
          }
          positionsByType[fieldName]++;
        }
      });
    });

    return {
      totalPositionRecords: totalPositions,
      avgPositionsPerRecord: totalPositions / this.data.length,
      totalPositionValue: totalPositionValue,
      avgPositionValue: totalPositionValue / Math.max(totalPositions, 1),
      positionFields: Object.keys(positionsByType),
      positionFieldCounts: positionsByType
    };
  }
}

export default DataExporter;