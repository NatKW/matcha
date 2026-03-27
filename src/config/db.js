import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// 🔹 Test immédiat de connexion
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connecté');
    client.release();
  } catch (err) {
    console.error('❌ Erreur de connexion PostgreSQL', err);
  }
})();

export default pool;