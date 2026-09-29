/**
 * Data Source implementation using Fetch API for browser environment
 * Translated from luna/dataSource.h and luna/dataSourceESP8266.cpp
 * 
 * Isomorphic implementation: works in both browser and Node.js
 * For Node.js, requires 'node-fetch' package
 */

// Polyfill fetch for Node.js environment
let fetchImpl;
if (typeof fetch === 'undefined') {
  // Node.js environment - will be set by setFetchImplementation
  fetchImpl = null;
} else {
  // Browser environment
  fetchImpl = fetch;
}

// Polyfill AbortController for Node.js < 15
let AbortControllerImpl;
if (typeof AbortController === 'undefined') {
  // Node.js < 15 - use abort-controller package
  // This will be set by setAbortControllerImplementation in Node.js environment
  AbortControllerImpl = null;
} else {
  // Modern browser or Node.js >= 15
  AbortControllerImpl = AbortController;
}

/**
 * Set fetch implementation for Node.js environment
 * @param {Function} fetchFunction - Fetch implementation (e.g., from node-fetch)
 */
export function setFetchImplementation(fetchFunction) {
  fetchImpl = fetchFunction;
}

/**
 * Set AbortController implementation for Node.js environment
 * @param {Function} abortControllerClass - AbortController implementation
 */
export function setAbortControllerImplementation(abortControllerClass) {
  AbortControllerImpl = abortControllerClass;
}

/**
 * Data error enumeration
 */
export const DataError = {
  DATA_OK: 'DATA_OK',
  DATA_ERR_CONNECTION: 'DATA_ERR_CONNECTION',
  DATA_ERR_INVALID_FORMAT: 'DATA_ERR_INVALID_FORMAT',
  STOCK_ERR_DATA_QUERY: 'STOCK_ERR_DATA_QUERY',
  DATA_ERR_TIMEOUT: 'DATA_ERR_TIMEOUT'
};

function createHttpStatusError(fullUrl, status, context) {
  const error = new Error(`HTTP error ${status} while ${context} ${fullUrl}`);
  error.code = DataError.DATA_ERR_CONNECTION;
  error.httpStatus = status;
  return error;
}

/**
 * CSV Reader interface for processing CSV data
 */
export class CsvReader {
  constructor() {
    this.rows = [];
  }

  /**
   * Feed a CSV row to the reader
   * @param {string} csvRow - CSV row string
   * @returns {boolean} True if successful
   */
  feedRow(csvRow) {
    if (!csvRow || csvRow.trim() === '') return false;
    
    this.rows.push(csvRow.trim());
    return true;
  }

  /**
   * Get all rows
   * @returns {string[]} Array of CSV rows
   */
  getRows() {
    return [...this.rows];
  }

  /**
   * Clear all rows
   */
  clear() {
    this.rows = [];
  }
}

/**
 * Abstract interface for data sources
 */
export class IDataSource {
  /**
   * Factory method to create a data source
   * @param {string} host - Host address
   * @param {number} httpPort - HTTP port
   * @returns {IDataSource} Data source instance
   */
  static open(host, httpPort) {
    return new FetchDataSource(host, httpPort);
  }

}

/**
 * Fetch API based data source implementation
 */
export class FetchDataSource extends IDataSource {
  constructor(host, httpPort) {
    super();
    this.host = host;
    this.httpPort = httpPort;
    this.baseUrl = this.buildBaseUrl();
    this.timeout = 10000; // 10 seconds default timeout
  }

  /**
   * Build base URL from host and port
   * @returns {string} Base URL
   * @private
   */
  buildBaseUrl() {
    // Detect environment (browser vs Node.js)
    const isBrowser = typeof window !== 'undefined';
    
    if (isBrowser) {
      const protocol = window.location.protocol;
      const port = this.httpPort === 80 || this.httpPort === 443 ? '' : `:${this.httpPort}`;
      return `${protocol}//${this.host}${port}`;
    } else {
      // Node.js environment
      const protocol = 'http';
      const port = this.httpPort ? `:${this.httpPort}` : '';
      return `${protocol}://${this.host}${port}`;
    }
  }

  /**
   * Create fetch request with timeout
   * @param {string} url - URL to fetch
   * @param {Object} options - Fetch options
   * @returns {Promise<Response>} Fetch response
   * @private
   */
  async fetchWithTimeout(url, options = {}) {
    const controller = new AbortControllerImpl();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const fetchFn = fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
      if (!fetchFn) {
        throw new Error('Fetch is not available. Install node-fetch for Node.js environment.');
      }
      const response = await fetchFn(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(DataError.DATA_ERR_TIMEOUT);
      }
      throw error;
    }
  }

  /**
   * Perform GET request
   * @param {string} url - URL to request
   * @returns {Promise<Object>} Response data or error
   */
  async get(url) {
    try {
      const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
      
      const response = await this.fetchWithTimeout(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw createHttpStatusError(fullUrl, response.status, 'loading JSON from');
      }

      const data = await response.json();
      
      return { error: DataError.DATA_OK, data: data };

    } catch (error) {
      console.error('GET request failed:', error);
      
      if (error.message === DataError.DATA_ERR_TIMEOUT) {
        return { error: DataError.DATA_ERR_TIMEOUT };
      }

      if (error.httpStatus) {
        throw error;
      }
      
      return { error: DataError.DATA_ERR_CONNECTION };
    }
  }

  /**
   * Perform POST request
   * @param {string} url - URL to request
   * @param {Object} jsonDoc - JSON data to send
   * @returns {Promise<Object>} Response or error
   */
  async post(url, jsonDoc) {
    try {
      const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
      
      console.log(`POST request to: ${fullUrl}`);
      console.log('POST data:', jsonDoc);
      
      const response = await this.fetchWithTimeout(fullUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonDoc)
      });

      if (!response.ok) {
        throw createHttpStatusError(fullUrl, response.status, 'posting to');
      }

      // Try to parse as JSON, fallback to text
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
      
      console.log('POST response received');
      
      return { error: DataError.DATA_OK, data: responseData };

    } catch (error) {
      console.error('POST request failed:', error);
      
      if (error.message === DataError.DATA_ERR_TIMEOUT) {
        return { error: DataError.DATA_ERR_TIMEOUT };
      }

      if (error.httpStatus) {
        throw error;
      }
      
      return { error: DataError.DATA_ERR_CONNECTION };
    }
  }

  /**
   * Get CSV data
   * @param {string} url - URL to request
   * @param {CsvReader} csvReader - CSV reader to feed data to
   * @returns {Promise<string>} Error code
   */
  async getCsv(url, csvReader) {
    try {
      const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
      
      console.log(`CSV request to: ${fullUrl}`);
      
      const response = await this.fetchWithTimeout(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv, text/plain'
        }
      });

      if (!response.ok) {
        const error = createHttpStatusError(fullUrl, response.status, 'loading CSV from');
        error.code = DataError.STOCK_ERR_DATA_QUERY;
        throw error;
      }

      const csvText = await response.text();
      
      // Split into lines and feed to CSV reader
      const lines = csvText.split('\n');
      let processedLines = 0;
      // Remove header line if it exists
      if (lines.length > 0 && lines[0].includes(',')) {
        lines.shift();
      }
      for (const line of lines) {
        if (line.trim() !== '') {
          if (csvReader.feedRow(line)) {
            processedLines++;
          }
        }
      }
      
      console.log(`CSV processed: ${processedLines} lines`);
      
      return DataError.DATA_OK;

    } catch (error) {
      console.error('CSV request failed:', error);
      
      if (error.message === DataError.DATA_ERR_TIMEOUT) {
        return DataError.DATA_ERR_TIMEOUT;
      }

      if (error.code === DataError.STOCK_ERR_DATA_QUERY) {
        throw error;
      }
      
      return DataError.STOCK_ERR_DATA_QUERY;
    }
  }

  /**
   * Set request timeout
   * @param {number} timeoutMs - Timeout in milliseconds
   */
  setTimeout(timeoutMs) {
    this.timeout = timeoutMs;
  }

  /**
   * Get current timeout
   * @returns {number} Timeout in milliseconds
   */
  getTimeout() {
    return this.timeout;
  }
}

/**
 * Mock data source for testing and development
 */
export class MockDataSource extends IDataSource {
  constructor() {
    super();
    this.mockData = new Map();
    this.mockCsvData = new Map();
    this.simulateDelay = true;
    this.delayMs = 100;
  }

  /**
   * Add mock JSON data for a URL
   * @param {string} url - URL pattern
   * @param {Object} data - Mock data to return
   */
  addMockData(url, data) {
    this.mockData.set(url, data);
  }

  /**
   * Add mock CSV data for a URL
   * @param {string} url - URL pattern
   * @param {string} csvData - Mock CSV data to return
   */
  addMockCsvData(url, csvData) {
    this.mockCsvData.set(url, csvData);
  }

  /**
   * Simulate network delay
   * @param {number} ms - Delay in milliseconds
   * @returns {Promise} Promise that resolves after delay
   * @private
   */
  async delay(ms) {
    if (!this.simulateDelay) return;
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Perform GET request (mock)
   * @param {string} url - URL to request
   * @returns {Promise<Object>} Response data or error
   */
  async get(url) {
    await this.delay(this.delayMs);
    
    console.log(`Mock GET request to: ${url}`);
    
    if (this.mockData.has(url)) {
      return { error: DataError.DATA_OK, data: this.mockData.get(url) };
    }
    
    // Generate sample stock data if URL looks like a stock request
    if (url.includes('/api/stocks/') || url.includes('stock')) {
      const sampleData = this.generateSampleStockData();
      return { error: DataError.DATA_OK, data: sampleData };
    }
    
    return { error: DataError.DATA_ERR_CONNECTION };
  }

  /**
   * Perform POST request (mock)
   * @param {string} url - URL to request
   * @param {Object} jsonDoc - JSON data to send
   * @returns {Promise<Object>} Response or error
   */
  async post(url, jsonDoc) {
    await this.delay(this.delayMs);
    
    console.log(`Mock POST request to: ${url}`, jsonDoc);
    
    // Mock response for genetic algorithm endpoints
    if (url.includes('/api/ga/') || url.includes('genetic')) {
      return { 
        error: DataError.DATA_OK, 
        data: { 
          success: true, 
          message: 'Mock GA operation completed',
          data: jsonDoc 
        } 
      };
    }
    
    return { error: DataError.DATA_OK, data: { success: true } };
  }

  /**
   * Get CSV data (mock)
   * @param {string} url - URL to request
   * @param {CsvReader} csvReader - CSV reader to feed data to
   * @returns {Promise<string>} Error code
   */
  async getCsv(url, csvReader) {
    await this.delay(this.delayMs);
    
    console.log(`Mock CSV request to: ${url}`);
    
    let csvData;
    
    if (this.mockCsvData.has(url)) {
      csvData = this.mockCsvData.get(url);
    } else {
      // Generate sample CSV data
      csvData = this.generateSampleCsvData();
    }
    
    // Split into lines and feed to CSV reader
    const lines = csvData.split('\n');
    let processedLines = 0;

    lines.shift();  //discard CSV header line
    for (const line of lines) {
      if (line.trim() !== '') {
        if (csvReader.feedRow(line)) {
          processedLines++;
        }
      }
    }
    
    console.log(`Mock CSV processed: ${processedLines} lines`);
    
    return DataError.DATA_OK;
  }

  /**
   * Generate sample stock data
   * @returns {Object} Sample stock data
   * @private
   */
  generateSampleStockData() {
    const data = [];
    const now = Date.now();
    let price = 100;
    
    for (let i = 0; i < 100; i++) {
      const timestamp = now - (100 - i) * 24 * 60 * 60 * 1000; // Daily data
      const change = (Math.random() - 0.5) * 0.02; // ±1% change
      price *= (1 + change);
      
      const open = price;
      const close = price * (1 + (Math.random() - 0.5) * 0.01);
      const high = Math.max(open, close) * (1 + Math.random() * 0.005);
      const low = Math.min(open, close) * (1 - Math.random() * 0.005);
      const volume = Math.floor(Math.random() * 1000000) + 100000;
      
      data.push({
        timestamp: timestamp,
        open: open,
        high: high,
        low: low,
        close: close,
        volume: volume
      });
    }
    
    return data;
  }

  /**
   * Generate sample CSV data
   * @returns {string} Sample CSV data
   * @private
   */
  generateSampleCsvData() {
    const lines = ['timestamp,open,high,low,close,volume'];
    const now = Date.now();
    let price = 100;
    
    for (let i = 0; i < 100; i++) {
      const timestamp = Math.floor(now - (100 - i) * 24 * 60 * 60 * 1000);
      const change = (Math.random() - 0.5) * 0.02;
      price *= (1 + change);
      
      const open = price;
      const close = price * (1 + (Math.random() - 0.5) * 0.01);
      const high = Math.max(open, close) * (1 + Math.random() * 0.005);
      const low = Math.min(open, close) * (1 - Math.random() * 0.005);
      const volume = Math.floor(Math.random() * 1000000) + 100000;
      
      lines.push(`${timestamp},${open.toFixed(2)},${high.toFixed(2)},${low.toFixed(2)},${close.toFixed(2)},${volume}`);
    }
    
    return lines.join('\n');
  }

  /**
   * Enable or disable delay simulation
   * @param {boolean} enabled - Whether to simulate delay
   * @param {number} ms - Delay in milliseconds
   */
  setDelaySimulation(enabled, ms = 100) {
    this.simulateDelay = enabled;
    this.delayMs = ms;
  }
}

export default {
  DataError,
  CsvReader,
  IDataSource,
  FetchDataSource,
  MockDataSource
};

