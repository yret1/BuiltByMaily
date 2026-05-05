import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from './client.js';

await migrate(db, { migrationsFolder: './drizzle' });
console.log('Migrations complete');
process.exit(0);
