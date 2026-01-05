import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'blood_pressure',
      columns: [
        { name: 'timestamp', type: 'number', isIndexed: true },
        { name: 'systolic', type: 'number' },
        { name: 'diastolic', type: 'number' },
        { name: 'pulse', type: 'number', isOptional: true },
        { name: 'note', type: 'string', isOptional: true },
        { name: 'source', type: 'string' },
        { name: 'synced', type: 'boolean', isIndexed: true },
        { name: 'server_id', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'food',
      columns: [
        { name: 'timestamp', type: 'number', isIndexed: true },
        { name: 'description', type: 'string' },
        { name: 'calories', type: 'number', isOptional: true },
        { name: 'source', type: 'string' },
        { name: 'synced', type: 'boolean', isIndexed: true },
        { name: 'server_id', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'water',
      columns: [
        { name: 'timestamp', type: 'number', isIndexed: true },
        { name: 'amount_ml', type: 'number' },
        { name: 'type', type: 'string' },
        { name: 'source', type: 'string' },
        { name: 'synced', type: 'boolean', isIndexed: true },
        { name: 'server_id', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
