import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Food extends Model {
  static table = 'food';

  @field('timestamp') timestamp: number;
  @field('description') description: string;
  @field('calories') calories?: number;
  @field('source') source: string;
  @field('synced') synced: boolean;
  @field('server_id') serverId?: number;
  @readonly @date('created_at') createdAt: Date;
  @readonly @date('updated_at') updatedAt: Date;
}
