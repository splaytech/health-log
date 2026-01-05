import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class BloodPressure extends Model {
  static table = 'blood_pressure';

  @field('timestamp') timestamp: number;
  @field('systolic') systolic: number;
  @field('diastolic') diastolic: number;
  @field('pulse') pulse?: number;
  @field('note') note?: string;
  @field('source') source: string;
  @field('synced') synced: boolean;
  @field('server_id') serverId?: number;
  @readonly @date('created_at') createdAt: Date;
  @readonly @date('updated_at') updatedAt: Date;
}
