const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'access_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

// Initialize database tables
async function initDatabase() {
  try {
    const client = await pool.connect();
    
    // Create access_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS access_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        resource VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL,
        allowed BOOLEAN NOT NULL,
        reason TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_permissions_cache table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_permissions_cache (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        permission_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      )
    `);

    client.release();
    console.log('Access database initialized successfully');
  } catch (error) {
    console.error('Error initializing access database:', error);
    throw error;
  }
}

module.exports = { pool, initDatabase }; 