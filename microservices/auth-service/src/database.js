const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'auth_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

// Initialize database tables
async function initDatabase() {
  try {
    const client = await pool.connect();
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default admin user if not exists
    const bcrypt = require('bcryptjs');
    const adminPasswordHash = bcrypt.hashSync('admin123', 10);
    
    await client.query(`
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO NOTHING
    `, ['admin', 'admin@example.com', adminPasswordHash]);

    client.release();
    console.log('Auth database initialized successfully');
  } catch (error) {
    console.error('Error initializing auth database:', error);
    throw error;
  }
}

module.exports = { pool, initDatabase }; 