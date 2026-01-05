import { database } from '../database';
import { apiService } from './api';
import { Q } from '@nozbe/watermelondb';
import BloodPressure from '../database/models/BloodPressure';
import Food from '../database/models/Food';
import Water from '../database/models/Water';

export class SyncService {
  private isSyncing = false;

  async syncAll(): Promise<{ success: boolean; error?: string }> {
    if (this.isSyncing) {
      return { success: false, error: 'Sync already in progress' };
    }

    this.isSyncing = true;

    try {
      // 1. Pull data from server (full sync)
      await this.pullFromServer();

      // 2. Push local unsynced data to server
      await this.pushToServer();

      return { success: true };
    } catch (error) {
      console.error('Sync error:', error);
      return { success: false, error: String(error) };
    } finally {
      this.isSyncing = false;
    }
  }

  private async pullFromServer() {
    // Fetch all data from server and update local DB
    const [bpData, foodData, waterData] = await Promise.all([
      apiService.bloodPressure.getAll(),
      apiService.food.getAll(),
      apiService.water.getAll(),
    ]);

    await database.write(async () => {
      // Update or create blood pressure entries
      for (const bp of bpData) {
        const existing = await database.collections
          .get<BloodPressure>('blood_pressure')
          .query(Q.where('server_id', bp.id))
          .fetch();

        if (existing.length > 0) {
          // Update existing
          await existing[0].update((record) => {
            record.systolic = bp.systolic;
            record.diastolic = bp.diastolic;
            record.pulse = bp.pulse;
            record.note = bp.note;
            record.synced = true;
          });
        } else {
          // Create new
          await database.collections.get<BloodPressure>('blood_pressure').create((record) => {
            record.timestamp = new Date(bp.timestamp).getTime();
            record.systolic = bp.systolic;
            record.diastolic = bp.diastolic;
            record.pulse = bp.pulse;
            record.note = bp.note;
            record.source = bp.source;
            record.serverId = bp.id;
            record.synced = true;
          });
        }
      }

      // Update or create food entries
      for (const food of foodData) {
        const existing = await database.collections
          .get<Food>('food')
          .query(Q.where('server_id', food.id))
          .fetch();

        if (existing.length > 0) {
          // Update existing
          await existing[0].update((record) => {
            record.description = food.description;
            record.calories = food.calories;
            record.synced = true;
          });
        } else {
          // Create new
          await database.collections.get<Food>('food').create((record) => {
            record.timestamp = new Date(food.timestamp).getTime();
            record.description = food.description;
            record.calories = food.calories;
            record.source = food.source;
            record.serverId = food.id;
            record.synced = true;
          });
        }
      }

      // Update or create water entries
      for (const water of waterData) {
        const existing = await database.collections
          .get<Water>('water')
          .query(Q.where('server_id', water.id))
          .fetch();

        if (existing.length > 0) {
          // Update existing
          await existing[0].update((record) => {
            record.amountMl = water.amountMl;
            record.type = water.type;
            record.synced = true;
          });
        } else {
          // Create new
          await database.collections.get<Water>('water').create((record) => {
            record.timestamp = new Date(water.timestamp).getTime();
            record.amountMl = water.amountMl;
            record.type = water.type;
            record.source = water.source;
            record.serverId = water.id;
            record.synced = true;
          });
        }
      }
    });
  }

  private async pushToServer() {
    // Get all unsynced blood pressure entries
    const unsyncedBP = await database.collections
      .get<BloodPressure>('blood_pressure')
      .query(Q.where('synced', false))
      .fetch();

    // Push blood pressure to server
    for (const record of unsyncedBP) {
      try {
        const serverRecord = await apiService.bloodPressure.create({
          timestamp: new Date(record.timestamp).toISOString(),
          systolic: record.systolic,
          diastolic: record.diastolic,
          pulse: record.pulse,
          note: record.note,
          source: record.source as 'manual' | 'android',
        });

        // Mark as synced and save server ID
        await database.write(async () => {
          await record.update((r) => {
            r.serverId = serverRecord.id;
            r.synced = true;
          });
        });
      } catch (error) {
        console.error('Failed to sync blood pressure record:', error);
        // Continue with next record
      }
    }

    // Get all unsynced food entries
    const unsyncedFood = await database.collections
      .get<Food>('food')
      .query(Q.where('synced', false))
      .fetch();

    // Push food to server
    for (const record of unsyncedFood) {
      try {
        const serverRecord = await apiService.food.create({
          timestamp: new Date(record.timestamp).toISOString(),
          description: record.description,
          calories: record.calories,
          source: record.source as 'manual' | 'android',
        });

        // Mark as synced and save server ID
        await database.write(async () => {
          await record.update((r) => {
            r.serverId = serverRecord.id;
            r.synced = true;
          });
        });
      } catch (error) {
        console.error('Failed to sync food record:', error);
      }
    }

    // Get all unsynced water entries
    const unsyncedWater = await database.collections
      .get<Water>('water')
      .query(Q.where('synced', false))
      .fetch();

    // Push water to server
    for (const record of unsyncedWater) {
      try {
        const serverRecord = await apiService.water.create({
          timestamp: new Date(record.timestamp).toISOString(),
          amountMl: record.amountMl,
          type: record.type as 'water' | 'tea' | 'coffee' | 'juice' | 'other',
          source: record.source as 'manual' | 'android',
        });

        // Mark as synced and save server ID
        await database.write(async () => {
          await record.update((r) => {
            r.serverId = serverRecord.id;
            r.synced = true;
          });
        });
      } catch (error) {
        console.error('Failed to sync water record:', error);
      }
    }
  }
}

export const syncService = new SyncService();
