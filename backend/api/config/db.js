import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Remove conflicting PG env vars injected by Vercel integrations to ensure it uses the connectionString
delete process.env.PGHOST;
delete process.env.PGUSER;
delete process.env.PGPASSWORD;
delete process.env.PGDATABASE;
delete process.env.PGPORT;

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:%237619365978.Mh@db.cuvpqoelhdmrifchyfcs.supabase.co:5432/postgres';

export const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('render.com') || connectionString.includes('supabase') 
    ? { rejectUnauthorized: false } 
    : false
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});
