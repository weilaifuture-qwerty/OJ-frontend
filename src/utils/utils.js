// Placeholder for utility functions

export default {
  /**
   * Filters out null, undefined, or empty string properties from an object.
   * @param {object} obj The object to filter.
   * @returns {object} A new object with only non-empty properties.
   */
  filterEmptyValue(obj) {
    const result = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (value !== null && value !== undefined && value !== '') {
          result[key] = value;
        }
      }
    }
    return result;
  },

  /**
   * Calculates AC rate.
   * @param {number} ACCount Accepted count.
   * @param {number} TotalCount Total submission count.
   * @returns {string} AC rate as a percentage string (e.g., "50.00%").
   */
  getACRate(ACCount, TotalCount) {
    if (TotalCount === 0) {
      return '0.00%';
    }
    return ((ACCount / TotalCount) * 100).toFixed(2) + '%';
  }

  // Add other utility functions as needed
  // For example, functions for date formatting, local storage interaction, etc.
}; 