/**
 * Logger utility for capturing and storing application logs in IndexedDB
 * - Overrides console methods (log, warn, error) to store logs in IndexedDB
 * - Provides methods to retrieve and clear logs
 * - Stores up to MAX_LOGS entries before auto-cleanup
 * - Access logs via Logger.getLogs() or the logs modal in UI
 */
class Logger {
  static DB_NAME = 'LoggerDB';
  static STORE_NAME = 'logs';
  static MAX_LOGS = 1000;
  static _db = null;

  static async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);
      
      request.onerror = (event) => {
        console.error('Database error:', event.target.error);
        reject(event.target.error);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'timestamp' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this._db = event.target.result;
        resolve(this._db);
      };
    });
  }

  static async getDB() {
    if (!this._db) {
      await this.initDB();
    }
    return this._db;
  }

  static async log(level, ...args) {
    try {
      const db = await this.getDB();
      const timestamp = Date.now();
      
      // Get the last argument if it's a source object, otherwise use default
      let source = 'app';
      let messages = args;
      if (args.length > 0 && typeof args[args.length - 1] === 'object' && args[args.length - 1].__source) {
        source = args[args.length - 1].__source;
        messages = args.slice(0, -1); // Remove source object from messages
      }

      const processValue = (arg) => {
        if (arg === undefined) return '"undefined"';
        if (arg === null) return '"null"';
        if (arg === '') return '""';  // Handle empty string
        if (arg === 0) return '0';    // Explicitly handle zero
        if (typeof arg === 'object') {
          try {
            // Handle empty objects/arrays
            return Object.keys(arg).length === 0 ? 
                   (Array.isArray(arg) ? '[]' : '{}') : 
                   JSON.stringify(arg, null, 2);
          } catch (e) {
            return String(arg);
          }
        }
        return String(arg);
      };

      const processedMessages = messages.map(processValue);

      const tx = db.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.STORE_NAME);

      await store.add({
        timestamp,
        level,
        message: processedMessages,
        source  // Use the extracted source directly
      });

      // Cleanup old logs
      const count = await store.count();
      if (count > this.MAX_LOGS) {
        const oldest = await store.openCursor();
        if (oldest) {
          oldest.delete();
        }
      }
    } catch (error) {
      originalConsole.error('Failed to log:', error);
    }
  }

  static async getLogs() {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.STORE_NAME, 'readonly');
      const store = tx.objectStore(this.STORE_NAME);
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      originalConsole.error('Failed to get logs:', error);
      return [];
    }
  }

  static async clearLogs() {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.STORE_NAME);
      await store.clear();
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }
}

// Store original console methods
const originalConsole = {
  log: console.log.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console)
};

// Shared processing function
const processValue = (arg) => {
  if (arg === undefined) return '"undefined"';
  if (arg === null) return '"null"';
  if (arg === '') return '""';  // Handle empty string
  if (arg === 0) return '0';    // Explicitly handle zero
  if (typeof arg === 'object') {
    try {
      // Handle empty objects/arrays
      return Object.keys(arg).length === 0 ? 
             (Array.isArray(arg) ? '[]' : '{}') : 
             JSON.stringify(arg, null, 2);
    } catch (e) {
      return String(arg);
    }
  }
  return String(arg);
};

// Helper to get current script source
const getCurrentSource = () => {
  // Check if we're in a service worker context more safely
  try {
    if (typeof self !== 'undefined' && 
        typeof ServiceWorkerGlobalScope !== 'undefined' && 
        self instanceof ServiceWorkerGlobalScope) {
      return 'service-worker.js';
    }
  } catch (e) {
    // Ignore error - not in service worker context
  }

  // Try to detect source from URL if available
  try {
    const currentScript = document.currentScript;
    if (currentScript && currentScript.src) {
      const scriptName = currentScript.src.split('/').pop();
      return scriptName;
    }
  } catch (e) {
    // Ignore error - can't get script source
  }

  // Default fallback
  return 'app.js';
};

// Override console methods
console.log = async (...args) => {
  originalConsole.log(...args);
  if (!args.some(arg => 
    String(arg).includes('DR script') || 
    String(arg).includes('lockdown-install.js') ||
    String(arg).includes('Banner not shown') ||
    String(arg).includes('favicon.ico')
  )) {
    try {
      const processedArgs = args.map(processValue);
      const source = { __source: getCurrentSource() };
      await Logger.log('info', ...processedArgs, source);
    } catch (e) {
      originalConsole.error('Logging failed:', e);
    }
  }
};

console.warn = async (...args) => {
  originalConsole.warn(...args);
  try {
    const processedArgs = args.map(processValue);
    await Logger.log('warn', ...processedArgs);
  } catch (e) {
    originalConsole.error('Logging failed:', e);
  }
};

console.error = async (...args) => {
  originalConsole.error(...args);
  try {
    const processedArgs = args.map(processValue);
    await Logger.log('error', ...processedArgs);
  } catch (e) {
    originalConsole.error('Logging failed:', e);
  }
};

// Initialize the database when the script loads
Logger.initDB().catch(error => originalConsole.error('Failed to initialize Logger:', error));
