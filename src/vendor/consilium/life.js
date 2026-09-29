/**
 * Life state machine implementation for browser environment
 * Translated from luna/life.h and luna/life.cpp
 */

import { Individual } from './individual.js';
import { IStockStreamProvider } from './stockStream.js';
import { IDataSource } from './dataSource.js';
import { GA } from './ga.js';
import { DataExporter } from './dataExporter.js';

/**
 * Life state machine states
 */
export const LifeState = {
  REQUESTING_INDIVIDUAL: 'REQUESTING_INDIVIDUAL',
  REQUESTING_DATA: 'REQUESTING_DATA',
  FEEDING_DATA: 'FEEDING_DATA',
  PUBLISHING_RESULT: 'PUBLISHING_RESULT',
  DIE: 'DIE'
};

/**
 * Stock symbols with live data currently available for Nostradamus.
 * Verified against /simulation/data/:ticker/1y/csv.
 * Total: 191 stocks
 */
const DEFAULT_STOCK_SYMBOLS = [
  { name: "A2A", ticker: "A2A.MTA" },
  { name: "ABP", ticker: "ABP.AIM" },
  { name: "ABT", ticker: "ABT.MTA" },
  { name: "ACE", ticker: "ACE.MTA" },
  { name: "AC5", ticker: "AC5.MTA" },
  { name: "AEDES", ticker: "AEDES.MTA" },
  { name: "AEF", ticker: "AEF.MTA" },
  { name: "ADB", ticker: "ADB.MTA" },
  { name: "ARN", ticker: "ARN.MTA" },
  { name: "AGP", ticker: "AGP.MTA" },
  { name: "AMP", ticker: "AMP.MTA" },
  { name: "ANIM", ticker: "ANIM.MTA" },
  { name: "ASC", ticker: "ASC.MTA" },
  { name: "AUTME", ticker: "AUTME.MTA" },
  { name: "AVIO", ticker: "AVIO.MTA" },
  { name: "AZM", ticker: "AZM.MTA" },
  { name: "B", ticker: "B.MTA" },
  { name: "BAMI", ticker: "BAMI.MTA" },
  { name: "BAN", ticker: "BAN.MTA" },
  { name: "BC", ticker: "BC.MTA" },
  { name: "BDB", ticker: "BDB.MTA" },
  { name: "BEC", ticker: "BEC.MTA" },
  { name: "BES", ticker: "BES.MTA" },
  { name: "BFF", ticker: "BFF.MTA" },
  { name: "BFG", ticker: "BFG.MTA" },
  { name: "BGN", ticker: "BGN.MTA" },
  { name: "BMED", ticker: "BMED.MTA" },
  { name: "BMPS", ticker: "BMPS.MTA" },
  { name: "BO", ticker: "BO.MTA" },
  { name: "BPE", ticker: "BPE.MTA" },
  { name: "BRI", ticker: "BRI.MTA" },
  { name: "BSS", ticker: "BSS.MTA" },
  { name: "BST", ticker: "BST.MTA" },
  { name: "BWZ", ticker: "BWZ.MTA" },
  { name: "BZU", ticker: "BZU.MTA" },
  { name: "CAI", ticker: "CAI.MTA" },
  { name: "CALT", ticker: "CALT.MTA" },
  { name: "CE", ticker: "CE.MTA" },
  { name: "CED", ticker: "CED.MTA" },
  { name: "CELL", ticker: "CELL.MTA" },
  { name: "CIR", ticker: "CIR.MTA" },
  { name: "CLE", ticker: "CLE.MTA" },
  { name: "CLF", ticker: "CLF.MTA" },
  { name: "CLI", ticker: "CLI.MTA" },
  { name: "CMB", ticker: "CMB.MTA" },
  { name: "COM", ticker: "COM.MTA" },
  { name: "CRL", ticker: "CRL.MTA" },
  { name: "CSP", ticker: "CSP.MTA" },
  { name: "CY4", ticker: "CY4.MTA" },
  { name: "DAL", ticker: "DAL.MTA" },
  { name: "DAN", ticker: "DAN.MTA" },
  { name: "DANR", ticker: "DANR.MTA" },
  { name: "DEX", ticker: "DEX.MTA" },
  { name: "DGV", ticker: "DGV.MTA" },
  { name: "DIA", ticker: "DIA.MTA" },
  { name: "DIB", ticker: "DIB.MTA" },
  { name: "DLG", ticker: "DLG.MTA" },
  { name: "DNR", ticker: "DNR.MTA" },
  { name: "DOV", ticker: "DOV.MTA" },
  { name: "ECNL", ticker: "ECNL.MTA" },
  { name: "EDNR", ticker: "EDNR.MTA" },
  { name: "EGLA", ticker: "EGLA.MTA" },
  { name: "ELC", ticker: "ELC.MTA" },
  { name: "ELN", ticker: "ELN.MTA" },
  { name: "EM", ticker: "EM.MTA" },
  { name: "ENAV", ticker: "ENAV.MTA" },
  { name: "ENEL", ticker: "ENEL.MTA" },
  { name: "ENI", ticker: "ENI.MTA" },
  { name: "ENV", ticker: "ENV.MTA" },
  { name: "EPH", ticker: "EPH.MTA" },
  { name: "EQUI", ticker: "EQUI.MTA" },
  { name: "ERG", ticker: "ERG.MTA" },
  { name: "ETH", ticker: "ETH.MTA" },
  { name: "EUK", ticker: "EUK.MTA" },
  { name: "FBK", ticker: "FBK.MTA" },
  { name: "FCT", ticker: "FCT.MTA" },
  { name: "FDA", ticker: "FDA.MTA" },
  { name: "FF", ticker: "FF.MTA" },
  { name: "FILA", ticker: "FILA.MTA" },
  { name: "FM", ticker: "FM.MTA" },
  { name: "FNM", ticker: "FNM.MTA" },
  { name: "G", ticker: "G.MTA" },
  { name: "GAB", ticker: "GAB.MTA" },
  { name: "GE", ticker: "GE.MTA" },
  { name: "GEO", ticker: "GEO.MTA" },
  { name: "GF", ticker: "GF.MTA" },
  { name: "GHC", ticker: "GHC.MTA" },
  { name: "GPI", ticker: "GPI.MTA" },
  { name: "GSP", ticker: "GSP.MTA" },
  { name: "GVS", ticker: "GVS.MTA" },
  { name: "HER", ticker: "HER.MTA" },
  { name: "ICOS", ticker: "ICOS.MTA" },
  { name: "IEG", ticker: "IEG.MTA" },
  { name: "IF", ticker: "IF.MTA" },
  { name: "IG", ticker: "IG.MTA" },
  { name: "IGD", ticker: "IGD.MTA" },
  { name: "IGV", ticker: "IGV.MTA" },
  { name: "IMS", ticker: "IMS.MTA" },
  { name: "INDB", ticker: "INDB.MTA" },
  { name: "INW", ticker: "INW.MTA" },
  { name: "IOT", ticker: "IOT.MTA" },
  { name: "IP", ticker: "IP.MTA" },
  { name: "IRC", ticker: "IRC.MTA" },
  { name: "IRE", ticker: "IRE.MTA" },
  { name: "ISP", ticker: "ISP.MTA" },
  { name: "ITM", ticker: "ITM.MTA" },
  { name: "ITW", ticker: "ITW.MTA" },
  { name: "JUVE", ticker: "JUVE.MTA" },
  { name: "KME", ticker: "KME.MTA" },
  { name: "KMER", ticker: "KMER.MTA" },
  { name: "LDO", ticker: "LDO.MTA" },
  { name: "LNDR", ticker: "LNDR.MTA" },
  { name: "LTMC", ticker: "LTMC.MTA" },
  { name: "LUVE", ticker: "LUVE.MTA" },
  { name: "MAIRE", ticker: "MAIRE.MTA" },
  { name: "MARR", ticker: "MARR.MTA" },
  { name: "MB", ticker: "MB.MTA" },
  { name: "MET", ticker: "MET.MTA" },
  { name: "MN", ticker: "MN.MTA" },
  { name: "MOL", ticker: "MOL.MTA" },
  { name: "MONC", ticker: "MONC.MTA" },
  { name: "MTV", ticker: "MTV.MTA" },
  { name: "NDT", ticker: "NDT.MTA" },
  { name: "NEXI", ticker: "NEXI.MTA" },
  { name: "NR", ticker: "NR.MTA" },
  { name: "NWL", ticker: "NWL.MTA" },
  { name: "OEC", ticker: "OEC.MTA" },
  { name: "OLI", ticker: "OLI.MTA" },
  { name: "OPR", ticker: "OPR.MTA" },
  { name: "OPS", ticker: "OPS.MTA" },
  { name: "ORS", ticker: "ORS.MTA" },
  { name: "OVS", ticker: "OVS.MTA" },
  { name: "PHIL", ticker: "PHIL.MTA" },
  { name: "PHN", ticker: "PHN.MTA" },
  { name: "PIA", ticker: "PIA.MTA" },
  { name: "PINF", ticker: "PINF.MTA" },
  { name: "PIRC", ticker: "PIRC.MTA" },
  { name: "PLC", ticker: "PLC.MTA" },
  { name: "PQ", ticker: "PQ.MTA" },
  { name: "PRO", ticker: "PRO.MTA" },
  { name: "PRT", ticker: "PRT.MTA" },
  { name: "PRY", ticker: "PRY.MTA" },
  { name: "PST", ticker: "PST.MTA" },
  { name: "RAT", ticker: "RAT.MTA" },
  { name: "RCS", ticker: "RCS.MTA" },
  { name: "REC", ticker: "REC.MTA" },
  { name: "REVO", ticker: "REVO.MTA" },
  { name: "REY", ticker: "REY.MTA" },
  { name: "RN", ticker: "RN.MTA" },
  { name: "RWAY", ticker: "RWAY.MTA" },
  { name: "SAB", ticker: "SAB.MTA" },
  { name: "SERI", ticker: "SERI.MTA" },
  { name: "SES", ticker: "SES.MTA" },
  { name: "SFER", ticker: "SFER.MTA" },
  { name: "SFL", ticker: "SFL.MTA" },
  { name: "SFT", ticker: "SFT.MTA" },
  { name: "SGF", ticker: "SGF.MTA" },
  { name: "SIT", ticker: "SIT.MTA" },
  { name: "SL", ticker: "SL.MTA" },
  { name: "SOL", ticker: "SOL.MTA" },
  { name: "SOM", ticker: "SOM.MTA" },
  { name: "SPM", ticker: "SPM.MTA" },
  { name: "SRG", ticker: "SRG.MTA" },
  { name: "SSL", ticker: "SSL.MTA" },
  { name: "SYS", ticker: "SYS.MTA" },
  { name: "TB", ticker: "TB.MTA" },
  { name: "TES", ticker: "TES.MTA" },
  { name: "TFIN", ticker: "TFIN.MTA" },
  { name: "TGYM", ticker: "TGYM.MTA" },
  { name: "TIP", ticker: "TIP.MTA" },
  { name: "TISG", ticker: "TISG.MTA" },
  { name: "TIT", ticker: "TIT.MTA" },
  { name: "TITR", ticker: "TITR.MTA" },
  { name: "TNXT", ticker: "TNXT.MTA" },
  { name: "TPRO", ticker: "TPRO.MTA" },
  { name: "TRN", ticker: "TRN.MTA" },
  { name: "TSL", ticker: "TSL.MTA" },
  { name: "TXT", ticker: "TXT.MTA" },
  { name: "TYA", ticker: "TYA.MTA" },
  { name: "UCG", ticker: "UCG.MTA" },
  { name: "UD", ticker: "UD.MTA" },
  { name: "UNI", ticker: "UNI.MTA" },
  { name: "VLS", ticker: "VLS.MTA" },
  { name: "WBD", ticker: "WBD.MTA" },
  { name: "WBDR", ticker: "WBDR.MTA" },
  { name: "WFCT26", ticker: "WFCT26.MTA" },
  { name: "WGEO26", ticker: "WGEO26.MTA" },
  { name: "WIIT", ticker: "WIIT.MTA" },
  { name: "YACHT", ticker: "YACHT.MTA" },
  { name: "ZEST", ticker: "ZEST.MTA" },
  { name: "ZUC", ticker: "ZUC.MTA" },
  { name: "ZV", ticker: "ZV.MTA" }
];

/**
 * Subset of STOCK_SYMBOLS with predictable/reliable behaviour.
 * Source: public/src/list_of_companies_predictable.txt
 */
const _PREDICTABLE_TICKERS = new Set([
  "BPE.MTA", "BAMI.MTA", "PRY.MTA", "UNI.MTA", "REVO.MTA", "UCG.MTA",
  "LUVE.MTA", "LDO.MTA", "SPM.MTA", "LTMC.MTA", "GF.MTA", "TIT.MTA",
  "WIIT.MTA", "CALT.MTA", "PST.MTA", "FBK.MTA", "COM.MTA", "EQUI.MTA",
  "TPRO.MTA", "KMER.MTA", "TITR.MTA", "CMB.MTA", "PHN.MTA", "DAN.MTA",
  "TGYM.MTA", "NWL.MTA", "G.MTA", "BGN.MTA", "AZM.MTA", "BZU.MTA",
  "SOL.MTA", "BMED.MTA", "MB.MTA", "ENI.MTA", "IG.MTA", "BDB.MTA",
  "CRL.MTA", "DANR.MTA", "AGP.MTA", "KME.MTA", "DGV.MTA", "SL.MTA",
  "PIRC.MTA", "ISP.MTA", "ACE.MTA", "YACHT.MTA", "MAIRE.MTA", "CE.MTA",
  "EDNR.MTA", "A2A.MTA", "TYA.MTA", "BFG.MTA", "MONC.MTA", "SRG.MTA",
  "TRN.MTA", "ENV.MTA", "MN.MTA", "MOL.MTA", "ARN.MTA", "ENAV.MTA",
  "TXT.MTA", "PQ.MTA", "TIP.MTA", "AVIO.MTA"
]);

function isNodeEnvironment() {
  return typeof window === 'undefined';
}

function normalizeStockSymbols(stocks) {
  return stocks
    .filter(stock => stock && typeof stock.ticker === 'string')
    .map(stock => ({
      name: stock.name,
      ticker: stock.ticker
    }));
}

async function readLowCapProfile() {
  console.log('Low-cap profile disabled: using the default stock universe.');
  return null;
}

async function resolveActiveStockUniverse() {
  const profile = await readLowCapProfile();

  if (profile && Array.isArray(profile.stocks) && profile.stocks.length > 0) {
    const stockSymbols = normalizeStockSymbols(profile.stocks);
    // When a curated profile is active, treat all its stocks as "predictable"
    // (they are hand-selected, so none are filtered out by the large-cap list).
    const predictableStockSymbols = stockSymbols.filter(stock => _PREDICTABLE_TICKERS.has(stock.ticker));
    const activePredictable = predictableStockSymbols.length > 0 ? predictableStockSymbols : stockSymbols;

    if (stockSymbols.length > 0) {
      return {
        stockSymbols,
        predictableStockSymbols: activePredictable,
        metadata: {
          profile: profile.profile || 'lowestcap30_2025',
          source: profile.source || 'file-trigger',
          targetDate: profile.targetDate || null,
          generatedAt: profile.generatedAt || null,
          count: stockSymbols.length
        }
      };
    }
  }

  return {
    stockSymbols: DEFAULT_STOCK_SYMBOLS,
    predictableStockSymbols: DEFAULT_STOCK_SYMBOLS.filter(stock => _PREDICTABLE_TICKERS.has(stock.ticker)),
    metadata: {
      profile: 'all',
      source: 'default',
      count: DEFAULT_STOCK_SYMBOLS.length
    }
  };
}

const ACTIVE_STOCK_UNIVERSE = await resolveActiveStockUniverse();

export const STOCK_SYMBOLS = ACTIVE_STOCK_UNIVERSE.stockSymbols;
export const PREDICTABLE_STOCK_SYMBOLS = ACTIVE_STOCK_UNIVERSE.predictableStockSymbols;

export const STOCK_UNIVERSE = ACTIVE_STOCK_UNIVERSE;

/**
 * Time periods for stock data
 */
export const TIME_PERIODS = ["1y"]; // Can be extended: ["5y", "1y", "3y", "10y"]

/**
 * Life class - main state machine for genetic algorithm evolution
 */
export class Life {
  constructor(geneticAlgorithm, stockStreamProvider, customStockSymbols = null, customTimePeriods = null) {
    // Initialize state
    this.state = LifeState.REQUESTING_INDIVIDUAL;

    this.stockStreamProvider = stockStreamProvider;
    this.geneticAlgorithm = geneticAlgorithm;

    // Stock symbols and time periods (use custom if provided)
    this.stockSymbols = customStockSymbols || STOCK_SYMBOLS;
    this.timePeriods = customTimePeriods || TIME_PERIODS;

    console.log(`Life initialized with ${this.stockSymbols.length} stocks and ${this.timePeriods.length} time periods`);

    // Common initialization
    this.symbolIndex = 0;
    this.periodIndex = 0;
    this.cagrResults = [];

    // Configuration
    this.rotate = true;
    this.isRunning = false;
    this.delayMs = 10; // Default delay between cycles

    // Data export system
    this.dataExporter = new DataExporter();
    this.dataExportEnabled = false;
    this.currentDataIndex = 0;

    // Event callbacks
    this.onStateChange = null;
    this.onIndividualComplete = null;
    this.onStreamComplete = null;
    this.onError = null;
  }

  /**
   * Set event callbacks
   * @param {Object} callbacks - Callback functions
   */
  setCallbacks(callbacks) {
    if (callbacks.onStateChange) this.onStateChange = callbacks.onStateChange;
    if (callbacks.onIndividualComplete) this.onIndividualComplete = callbacks.onIndividualComplete;
    if (callbacks.onStreamComplete) this.onStreamComplete = callbacks.onStreamComplete;
    if (callbacks.onError) this.onError = callbacks.onError;

    console.log('Life callbacks set successfully');
  }

  /**
   * Enable data export for Excel analysis
   * @param {boolean} enabled - Whether to enable data export
   */
  setDataExport(enabled) {
    this.dataExportEnabled = enabled;
    this.dataExporter.setEnabled(enabled);
    console.log(`Data export ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get the data exporter instance
   * @returns {DataExporter} The data exporter
   */
  getDataExporter() {
    return this.dataExporter;
  }

  /**
   * Export collected data to CSV
   * @param {string} filename - Output filename (optional)
   * @returns {string} CSV data
   */
  exportDataToCSV(filename = null) {
    const csvData = this.dataExporter.exportToCSV();
    if (filename) {
      this.dataExporter.saveToFile(filename, 'csv');
    }
    return csvData;
  }

  /**
   * Export summary data optimized for Excel analysis
   * @param {string} filename - Output filename (optional)
   * @returns {string} CSV summary data
   */
  exportSummaryToExcel(filename = null) {
    const csvData = this.dataExporter.exportSummaryBycycle();
    if (filename) {
      this.dataExporter.saveToFile(filename, 'csv');
    }
    return csvData;
  }

  /**
   * Export detailed position data to CSV
   * @param {string} filename - Output filename (optional)
   * @returns {string} CSV position data
   */
  exportPositionsToCSV(filename = null) {
    const csvData = this.dataExporter.exportPositionsToCSV();
    if (filename) {
      const positionFilename = filename.replace('.csv', '_positions.csv');
      this.dataExporter.downloadData(csvData, positionFilename, 'csv');
    }
    return csvData;
  }

  /**
   * Get position data summary
   * @returns {Object} Position summary statistics
   */
  getPositionSummary() {
    return this.dataExporter.getPositionSummary();
  }

  /**
   * Start the life cycle
   */
  start() {
    this.isRunning = true;
    console.log('Life cycle started');
  }

  /**
   * Stop the life cycle
   */
  stop() {
    this.isRunning = false;
    console.log('Life cycle stopped');
  }

  /**
   * Reset the life cycle to initial state
   */
  reset() {
    this.stop();
    this.state = LifeState.REQUESTING_INDIVIDUAL;
    this.symbolIndex = 0;
    this.periodIndex = 0;
    this.cagrResults = [];

    if (this.child) {
      this.child = null;
    }

    if (this.stream) {
      this.stream = null;
    }

    console.log('Life cycle reset');
  }

  /**
   * Execute one cycle of the state machine
   * @returns {Promise<boolean>} True if cycle completed successfully
   */
  async cycle() {
    if (!this.isRunning) return false;

    try {
      switch (this.state) {
        case LifeState.REQUESTING_INDIVIDUAL:
          await this.birth();
          if (this.child) {
            this.setState(LifeState.REQUESTING_DATA);
          }
          break;

        case LifeState.REQUESTING_DATA:
          try {
            await this.grows(
              this.stockSymbols[this.symbolIndex].ticker,
              this.timePeriods[this.periodIndex]
            );
            if (this.stream) {
              this.setState(LifeState.FEEDING_DATA);
            }
          } catch (error) {
            if (this.shouldSkipDataError(error)) {
              const skippedTicker = this.stockSymbols[this.symbolIndex]?.ticker;
              const skippedPeriod = this.timePeriods[this.periodIndex];
              console.warn(`Skipping ${skippedTicker}/${skippedPeriod} after HTTP 404`);
              this.stream = null;

              if (!this.advanceToNextTarget()) {
                this.setState(LifeState.DIE);
              }
              break;
            }

            throw error;
          }
          break;

        case LifeState.FEEDING_DATA:
          while (await this.feed());

          this.setState(LifeState.PUBLISHING_RESULT);
          this.stream = null;
          break;

        case LifeState.PUBLISHING_RESULT:
          this.cagrResults.push(this.child.getCAGR());
          this.publishPartialResult();

          if (this.rotate) {
            this.setState(LifeState.REQUESTING_DATA);

            this.symbolIndex++;
            if (this.symbolIndex >= this.stockSymbols.length) {
              this.symbolIndex = 0;
              this.periodIndex++;

              if (this.periodIndex >= this.timePeriods.length) {
                this.periodIndex = 0;

                this.setState(LifeState.DIE);
              }
            }
          }
          else
            this.setState(LifeState.DIE);
          break;

        case LifeState.DIE:
          await this.die();
          this.setState(LifeState.REQUESTING_INDIVIDUAL);
          this.cagrResults = [];

          return false;
      }

      return true;

    } catch (error) {
      console.error('Error in life cycle:', error);
      if (this.onError) {
        this.onError(error);
      }
      return false;
    }
  }

  /**
   * Set new state and trigger callback
   * @param {string} newState - New state
   * @private
   */
  setState(newState) {
    const oldState = this.state;
    this.state = newState;

    if (this.onStateChange) {
      this.onStateChange(newState, oldState);
    }
  }

  /**
   * Determine whether a data load error should skip the current target.
   * @param {Error} error - Data load error
   * @returns {boolean} True when the current stock should be skipped
   * @private
   */
  shouldSkipDataError(error) {
    return error?.httpStatus === 404;
  }

  /**
   * Advance to the next stock/time target.
   * @returns {boolean} True when another target is available
   * @private
   */
  advanceToNextTarget() {
    this.symbolIndex++;
    if (this.symbolIndex < this.stockSymbols.length) {
      return true;
    }

    this.symbolIndex = 0;
    this.periodIndex++;
    if (this.periodIndex < this.timePeriods.length) {
      return true;
    }

    this.periodIndex = 0;
    return false;
  }

  /**
 * Birth phase - create new individual from genetic algorithm or use existing
 * @private
   */
  async birth() {
    try {
      this.child = await this.geneticAlgorithm.createNewChild();
    } catch (error) {
      console.error('Birth: Error creating individual from GA:', error);
      this.child = null;
    }
  }

  /**
   * Grows phase - load stock data for the individual or use existing stream
   * @param {string} symbol - Stock symbol
   * @param {string} period - Time period
   * @private
   */
  async grows(symbol, period) {
    try {
      console.log(`📊 Grows: Loading ${symbol} (${period})...`);
      this.stream = await this.stockStreamProvider.read(symbol, period);

      const stockData = this.stream.getNext();
      this.child.init(stockData, symbol);

      console.log(`✅ Grows: Loaded ${symbol}, stream ready`);

      // Initialize data export for this cycle
      if (this.dataExportEnabled) {
        this.dataExporter.startCycle();
        this.currentDataIndex = 0;
      }
    } catch (error) {
      console.error(`❌ Grows: Error loading data for ${symbol}:`, error);
      this.stream = null;
      throw error;
    }
  }

  /**
   * Feed phase - feed next data point to individual
   * @returns {Promise<boolean>} True if more data available, false if complete
   * @private
   */
  async feed() {
    try {
      const stockData = this.stream.getNext();

      if (stockData !== null) { // STOCK_OK
        const symbol = this.stream?.stockName ?? this.stockSymbols?.[this.symbolIndex]?.ticker;
        this.child.feed(stockData, symbol);
        
        // Collect data for export if enabled
        if (this.dataExportEnabled && this.child) {
          this.dataExporter.collectData([this.child], stockData, this.currentDataIndex);
          this.currentDataIndex++;
        }
        
        return true; // More data available
      } else {
        return false; // No more data
      }

    } catch (error) {
      console.error('Feed: Error feeding data:', error);
      return false;
    }
  }

  async publishPartialResult(){
    // Trigger callback for partial result
    if (this.onStreamComplete) {
      const cagr = this.child.getCAGR();
      console.log(`📈 Publishing partial result: CAGR ${cagr.toFixed(2)}%`);
      this.onStreamComplete({
        cagr: cagr,
      });
    }
  }

  async publishIndividual(){
          // Calculate statistics
      const cagrAvg = this.cagrResults.length > 0 ?
        this.cagrResults.reduce((sum, cagr) => sum + cagr, 0) / this.cagrResults.length : 0;

      const cagrVariance = this.cagrResults.length > 1 ?
        this.cagrResults.reduce((sum, cagr) => sum + Math.pow(cagr - cagrAvg, 2), 0) / this.cagrResults.length : 0;

      const cagrStandardDeviation = Math.sqrt(cagrVariance);

      console.log(`🎯 Publishing individual: ${this.cagrResults.length} results, Avg CAGR: ${cagrAvg.toFixed(2)}%`);

      // Send individual to genetic algorithm for census
      await this.geneticAlgorithm.censusIndividual(this.child, cagrAvg, cagrStandardDeviation, this.cagrResults);

      // Trigger callback
      if (this.onIndividualComplete) {
        console.log(`✅ Individual complete callback triggered`);
        this.onIndividualComplete({
          individual: this.child,
          cagrAvg: cagrAvg,
          cagrStandardDeviation: cagrStandardDeviation,
          results: [...this.cagrResults]
        });
      } else {
        console.warn(`⚠️ No onIndividualComplete callback registered!`);
      }
  }

  /**
   * Die phase - complete individual evaluation and send to GA
   * @private
   */
  async die() {
    if (!this.child) {
      console.warn('Die: No individual to process');
      return;
    }

    try {
      await this.publishIndividual();

      // Clean up
      this.child = null;
      this.stream = null;

    } catch (error) {
      console.error('Die: Error processing individual:', error);
    }
  }

  /**
   * Run the life cycle infinitely
   * @param {number} delayMs - Delay between cycles in milliseconds
   */
  async run(delayMs = 10) {
    // Store configuration
    this.delayMs = delayMs;

    this.start();

    const startTime = Date.now();
    let cycleCount = 0;

    console.log(`Starting infinite life cycle run (delay: ${this.delayMs}ms)`);

    while (this.isRunning) {
      try {
        cycleCount++;

        // Log progress every 50 cycles
        if (cycleCount % 50 === 0) {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          console.log(`Life cycle ${cycleCount} (${elapsed}s elapsed): ${this.state} - ${this.symbolIndex}/${this.stockSymbols.length} stocks, ${this.periodIndex}/${this.timePeriods.length} periods`);
        }

        await this.cycle();

        // Add delay between cycles if specified
        if (this.delayMs > 0 && this.isRunning) {
          await new Promise(resolve => setTimeout(resolve, this.delayMs));
        }
      } catch (error) {
        // Log error but continue execution (resilient mode)
        console.error(`❌ Error in life cycle ${cycleCount}:`, error.message);
        console.error(`   State: ${this.state}, Symbol: ${this.symbolIndex}/${this.stockSymbols.length}, Period: ${this.periodIndex}/${this.timePeriods.length}`);

        if (this.onError) {
          this.onError(error);
        }

        // Wait a bit before retrying to avoid tight error loops
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    console.log(`Life run stopped after ${cycleCount} cycles (${Date.now() - startTime}ms)`);
  }

  /**
   * Get current state information
   * @returns {Object} Current state info
   */
  getStateInfo() {
    return {
      state: this.state,
      isRunning: this.isRunning,
      currentSymbol: this.stockSymbols[this.symbolIndex],
      currentPeriod: this.timePeriods[this.periodIndex],
      symbolIndex: this.symbolIndex,
      periodIndex: this.periodIndex,
      cagrResultsCount: this.cagrResults.length,
      hasChild: !!this.child,
      hasStream: !!this.stream
    };
  }

  /**
   * Get comprehensive status
   * @returns {Object} Complete status information
   */
  getStatus() {
    return {
      ...this.getStateInfo(),
      cagrResults: [...this.cagrResults],
      childSummary: this.child ? this.child.getPerformanceSummary() : null,
      gaStatus: this.geneticAlgorithm ? this.geneticAlgorithm.getStatus() : null
    };
  }

  /**
   * Configure rotation settings
   * @param {boolean} rotate - Whether to rotate through symbols/periods
   */
  setRotation(rotate) {
    this.rotate = rotate;
  }

  /**
   * Set current symbol and period indices
   * @param {number} symbolIndex - Symbol index
   * @param {number} periodIndex - Period index
   */
  setIndices(symbolIndex, periodIndex) {
    this.symbolIndex = Math.max(0, Math.min(symbolIndex, this.stockSymbols.length - 1));
    this.periodIndex = Math.max(0, Math.min(periodIndex, this.timePeriods.length - 1));
  }

  /**
   * Set delay between cycles
   * @param {number} delayMs - Delay between cycles in milliseconds
   */
  setDelay(delayMs = 10) {
    this.delayMs = delayMs;
  }

  /**
   * Get delay configuration
   * @returns {number} Delay in milliseconds
   */
  getDelay() {
    return this.delayMs;
  }
}

export default {
  Life,
  LifeState,
  STOCK_SYMBOLS,
  DEFAULT_STOCK_SYMBOLS,
  TIME_PERIODS
};
