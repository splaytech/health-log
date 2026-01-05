import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import { Platform } from 'react-native';
import { schema } from './schema';
import BloodPressure from './models/BloodPressure';
import Food from './models/Food';
import Water from './models/Water';

// Create adapter based on platform
function createAdapter() {
  if (Platform.OS === 'web') {
    // Web: Use LokiJS adapter with IndexedDB
    return new LokiJSAdapter({
      schema,
      useWebWorker: false,
      useIncrementalIndexedDB: true,
      dbName: 'health_log',
    });
  } else {
    // Native: Use SQLite adapter (imported dynamically to avoid bundling for web)
    const SQLiteAdapter = require('@nozbe/watermelondb/adapters/sqlite').default;
    return new SQLiteAdapter({
      schema,
      dbName: 'health_log',
    });
  }
}

export const database = new Database({
  adapter: createAdapter(),
  modelClasses: [BloodPressure, Food, Water],
});
