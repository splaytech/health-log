import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Water extends Model {
  static table = 'water';

  @field('timestamp') timestamp: number;
  @field('amount_ml') amountMl: number;
  @field('type') type: string;
  @field('source') source: string;
  @field('synced') synced: boolean;
  @field('server_id') serverId?: number;
  @readonly @date('created_at') createdAt: Date;
  @readonly @date('updated_at') updatedAt: Date;
}
