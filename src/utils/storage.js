/**
 * Utility for interacting with localStorage.
 * Handles JSON serialization/deserialization and potential errors.
 */

const storage = {
  /**
   * Retrieves an item from localStorage.
   * @param {string} key - The key of the item to retrieve.
   * @returns {any | null} The retrieved item, or null if not found or error occurs.
   */
  get(key) {
    try {
      const serializedItem = localStorage.getItem(key);
      if (serializedItem === null) {
        return null;
      }
      return JSON.parse(serializedItem);
    } catch (error) {
      console.error(`Error getting item "${key}" from localStorage:`, error);
      return null; // Or re-throw, or return a default based on your error handling strategy
    }
  },

  /**
   * Saves an item to localStorage.
   * @param {string} key - The key under which to save the item.
   * @param {any} value - The item to save. Will be JSON.stringified.
   * @returns {boolean} True if successful, false otherwise.
   */
  set(key, value) {
    try {
      const serializedItem = JSON.stringify(value);
      localStorage.setItem(key, serializedItem);
      return true;
    } catch (error) {
      console.error(`Error setting item "${key}" in localStorage:`, error);
      return false;
    }
  },

  /**
   * Removes an item from localStorage.
   * @param {string} key - The key of the item to remove.
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item "${key}" from localStorage:`, error);
    }
  },

  /**
   * Clears all items managed by this application from localStorage.
   * For safety, this could be modified to only clear keys with a specific prefix.
   */
  clearAllAppStorage() {
    // Example: only clear keys starting with 'oj_' from constants.js
    // This requires importing STORAGE_KEY or having a convention.
    console.warn(
      'Clearing all app-related localStorage. Ensure constants define all keys or use a prefix.'
    );
    // For now, this is a placeholder. A more robust implementation would iterate
    // through known keys or keys with a prefix.
    // Example: if (key.startsWith('oj_')) localStorage.removeItem(key);
    // This simple version just logs a warning and does not clear anything by default
    // to prevent accidental data loss of unrelated localStorage items.
    // You should implement a more specific clearing logic based on your STORAGE_KEY constants.
  },
};

export default storage; 