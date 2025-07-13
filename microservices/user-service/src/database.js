const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'user_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

// Initialize database tables
async function initDatabase() {
  try {
    const client = await pool.connect();
    
    // Create user_profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        email VARCHAR(100) UNIQUE NOT NULL,
        department VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert sample users if not exists
    await client.query(`
      INSERT INTO user_profiles (user_id, username, first_name, last_name, email, department)
      VALUES 
        (1, 'admin', 'Admin', 'User', 'admin@example.com', 'IT'),
        (2, 'john_doe', 'John', 'Doe', 'john@example.com', 'HR'),
        (3, 'jane_smith', 'Jane', 'Smith', 'jane@example.com', 'Finance')
      ON CONFLICT (email) DO NOTHING
    `);

    client.release();
    console.log('User database initialized successfully');
  } catch (error) {
    console.error('Error initializing user database:', error);
    throw error;
  }
}

module.exports = { pool, initDatabase }; 