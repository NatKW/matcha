import app from "../app";
import pool from "../config/db";
import router from "../config/db";

const usersRouter = router();

(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connecté');
    client.release();
  } catch (err) {
    console.error('❌ Erreur de connexion PostgreSQL', err);
  }
})();

async function getUserByName(username) {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE name = $1', 
      [username]
    );
    return result.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}   