import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL!,
  ssl: true
});

// Configure WebSocket for Neon
if (typeof WebSocket === 'undefined') {
  (global as any).WebSocket = ws;
}

export const db = drizzle(pool);
