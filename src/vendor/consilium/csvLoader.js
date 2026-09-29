/**
 * CSV data loader for browser environment
 */

import { CSV_DATA } from './mock/mockCsv.js';

class CsvLoader {
    constructor() {
        this.csvData = new Map();
        // Initialize with mock data
        Object.entries(CSV_DATA).forEach(([key, data]) => {
            this.csvData.set(key, data);
        });
    }

    /**
     * Load CSV data (in browser environment, returns mock data)
     * @param {string} key - The key to store the data under (e.g., 'eni_1y')
     * @returns {Promise<string>} - The CSV content
     */
    async loadCsv(key) {
        const csvContent = this.csvData.get(key);
        if (csvContent) {
            return csvContent;
        }
        throw new Error(`No mock CSV data available for key: ${key}`);
    }

    /**
     * Get CSV data by key
     * @param {string} key - The key of the CSV data
     * @returns {string|null} - The CSV content or null if not found
     */
    getCsvData(key) {
        return this.csvData.get(key) || null;
    }

    /**
     * Check if CSV data is loaded
     * @param {string} key - The key to check
     * @returns {boolean} - True if data is loaded
     */
    isLoaded(key) {
        return this.csvData.has(key);
    }
}

// Singleton instance
const csvLoader = new CsvLoader();

export default csvLoader;