// Remove any export statements and make Logger global
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
          db.createObjectStore(this.STORE_NAME, { keyPath: 'timestamp' });
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
      const message = args.map(arg => {
        if (typeof arg === 'undefined') return 'undefined';
        if (arg === null) return 'null';
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch (e) {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');

      const tx = db.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.STORE_NAME);

      await store.add({
        timestamp,
        level,
        message,
        source: 'app'
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

// Override console methods
console.log = async (...args) => {
  originalConsole.log(...args);
  // Filter out noise
  if (!args.some(arg => 
    String(arg).includes('DR script') || 
    String(arg).includes('lockdown-install.js') ||
    String(arg).includes('Banner not shown')
  )) {
    try {
      await Logger.log('info', ...args);
    } catch (e) {
      originalConsole.error('Logging failed:', e);
    }
  }
};

console.warn = async (...args) => {
  originalConsole.warn(...args);
  try {
    await Logger.log('warn', ...args);
  } catch (e) {
    originalConsole.error('Logging failed:', e);
  }
};

console.error = async (...args) => {
  originalConsole.error(...args);
  try {
    await Logger.log('error', ...args);
  } catch (e) {
    originalConsole.error('Logging failed:', e);
  }
};

// Initialize the database when the script loads
Logger.initDB().catch(error => originalConsole.error('Failed to initialize Logger:', error));
