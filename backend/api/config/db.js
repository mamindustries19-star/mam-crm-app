import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:%237619365978.Mh@db.cuvpqoelhdmrifchyfcs.supabase.co:5432/postgres';

// Parse database URL explicitly to bypass conflicting environment variables (like PGHOST) injected by Vercel
const dbUrl = new URL(connectionString);

export const pool = new Pool({
  user: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password),
  host: dbUrl.hostname,
  port: dbUrl.port ? parseInt(dbUrl.port) : 5432,
  database: dbUrl.pathname.substring(1),
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
