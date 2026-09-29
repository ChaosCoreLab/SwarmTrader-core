/**
 * Stock Stream implementation for browser environment
 * Translated from luna/istockstream.h and luna/stockstream.cpp
 * 
 * Dependencies:
 * - csvLoader.js: For CSV data loading
 */

// Stock error enumeration
export const StockError = {
  STOCK_OK: 0,
  STOCK_NOT_AVAILABLE: 1
};

/**
 * Stock data structure representing OHLCV data
 */
export class StockData {
  constructor(timestamp = 0, open = 0, min = 0, max = 0, close = 0, volume = 0) {
    this.t = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;        // Unix timestamp
    this.open = open;          // Opening price
    this.min = min;            // Minimum price
    this.max = max;            // Maximum price
    this.close = close;        // Closing price
    this.volume = volume;      // Trading volume
  }

  /**
   * Calculate the actual value as average of OHLC
   * @returns {number} Average of open, high, low, close
   */
  getActualValue() {
    return (this.close + this.max + this.min + this.open) / 4;
  }

  /**
   * Create StockData from CSV row
   * @param {string} csvRow - CSV row string
   * @returns {StockData|null} New StockData instance or null if invalid
   */
  static fromCSV(csvRow) {
    if (!csvRow) return null;

    const parts = csvRow.split(',');
    if (parts.length < 6) return null;

    try {
      return new StockData(
        parseInt(parts[0]),      // timestamp
        parseFloat(parts[1]),    // open
        parseFloat(parts[3]),    // min
        parseFloat(parts[2]),    // max
        parseFloat(parts[4]),    // close
        parseInt(parts[5])       // volume
      );
    } catch (error) {
      console.error('Error parsing CSV row:', error);
      return null;
    }
  }

  /**
   * Create StockData from JSON object
   * @param {Object} json - JSON object with stock data
   * @returns {StockData} New StockData instance
   */
  static fromJSON(json) {
    return new StockData(
      json.ts || json.timestamp,
      json.open || json.o,
      json.min || json.low || json.l,
      json.max || json.high || json.h,
      json.close || json.c,
      json.volume || json.v
    );
  }

  /**
   * Convert to JSON object
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      t: this.t,
      open: this.open,
      min: this.min,
      max: this.max,
      close: this.close,
      volume: this.volume
    };
  }

  /**
   * Create a copy of this stock data
   * @returns {StockData} New StockData instance
   */
  clone() {
    return new StockData(this.t, this.open, this.min, this.max, this.close, this.volume);
  }
}


/**
 * Abstract interface for stock data streams
 */
export class StockStream {
  constructor() {
    this.stream = [];
    this.currentIndex = 0;
  }

  /**
   * Get the first stock data point
   * @param {StockData} out - Output parameter (will be modified)
   * @returns {number} Error code
   */
  getFirst(out) {
    this.currentIndex = 0;
    if (this.stream.length === 0) {
      return StockError.STOCK_NOT_AVAILABLE;
    }

    const data = this.stream[0];
    Object.assign(out, data);
    return StockError.STOCK_OK;
  }


  getNext() {
    if (this.currentIndex >= this.stream.length) {
      return null;
    }

    const data = this.stream[this.currentIndex];
    this.currentIndex++;
    return data;
  }

  /**
   * Get the entire stream
   * @returns {StockStreamContainer} Stream container
   */
  getStream() {
    return this.stream;
  }

  /**
   * Feed CSV row to the stream
   * @param {string} csvRow - CSV row string
   * @returns {boolean} True if successful
   */
  feedRow(csvRow) {
    const stockData = StockData.fromCSV(csvRow);
    if (stockData) {
      this.stream.push(stockData);
      return true;
    }
    return false;
  }

  /**
   * Reset stream position
   */
  reset() {
    this.currentIndex = 0;
  }

  /**
   * Get total number of data points in the stream
   * @returns {number}
   */
  getLength() {
    return this.stream.length;
  }
}


/**
 * Stock stream provider interface
 */
export class IStockStreamProvider {
  constructor() {
    if (new.target === IStockStreamProvider) {
      throw new TypeError('Cannot instantiate abstract class IStockStreamProvider directly');
    }
    this.streams = new Map();
  }


  /**
   * Get a StockStream by key
   * @param {string} key - <stock name>_<data period>
   * @returns {StockStream|null}
   */
  getStreamByKey(key) {
    return this.streams.get(key) || null;
  }

  /**
   * Set a StockStream by key
   * @param {string} key - <stock name>_<data period>
   * @param {StockStream} stream
   */
  setStreamByKey(key, stream) {
    this.streams.set(key, stream);
  }
}

/**
 * HTTP-based stock stream provider
 */
export class HttpStockStreamProvider extends IStockStreamProvider {
  constructor(dataSource, tracer = null) {
    super();
    this.dataSource = dataSource;
    this.tracer = tracer;
  }

  /**
   * Read stock data stream
   * @param {string} stockName - Stock symbol
   * @param {string} timeFrame - Time frame
   * @returns {Promise<StockStream>} HTTP stock stream instance
   */
  async read(stockName, timeFrame) {
    const key = `${stockName}_${timeFrame}`;
    let stream = this.getStreamByKey(key);
    if (stream) {
      stream.reset();
      return stream;
    }
    stream = new StockStream();
    stream.stockName = stockName;
    stream.timeFrame = timeFrame;
    
    // Load data from HTTP via dataSource
    const url = `/simulation/data/${stockName}/${timeFrame}/csv`;
    try {
      const result = await this.dataSource.getCsv(url, stream);
      if (Array.isArray(result)) {
        result.forEach(row => {
          stream.feedRow(row);
        });
      } else if (result !== undefined && result !== null && result !== 'DATA_OK') {
        throw new Error(`Failed to load stock data for ${stockName}/${timeFrame}: ${result}`);
      }

      if (stream.getLength() === 0) {
        throw new Error(`No stock data available for ${stockName}/${timeFrame}`);
      }

      this.setStreamByKey(key, stream);
      return stream;
    } catch (error) {
      console.error('Failed to load stock data:', error);
      throw error;
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.streams.clear();
  }
}

export default {
  StockData,
  StockStream,
  IStockStreamProvider,
  HttpStockStreamProvider
};

