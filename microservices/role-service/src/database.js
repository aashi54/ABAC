const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'role_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

// Initialize database tables
async function initDatabase() {
  try {
    const client = await pool.connect();
    
    // Create roles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        parent_role_id INTEGER REFERENCES roles(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_roles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert sample roles if not exists
    await client.query(`
      INSERT INTO roles (name, description, parent_role_id)
      VALUES 
        ('admin', 'Administrator with full access', NULL),
        ('user', 'Regular user with limited access', NULL),
        ('moderator', 'Moderator with elevated permissions', NULL)
      ON CONFLICT (name) DO NOTHING
    `);

    // Get role IDs for user assignments
    const adminRole = await client.query('SELECT id FROM roles WHERE name = $1', ['admin']);
    const userRole = await client.query('SELECT id FROM roles WHERE name = $1', ['user']);
    const moderatorRole = await client.query('SELECT id FROM roles WHERE name = $1', ['moderator']);

    // Update moderator to have user as parent
    if (moderatorRole.rows.length > 0 && userRole.rows.length > 0) {
      await client.query(
        'UPDATE roles SET parent_role_id = $1 WHERE name = $2',
        [userRole.rows[0].id, 'moderator']
      );
    }

    // Insert sample user role assignments if not exists
    await client.query(`
      INSERT INTO user_roles (user_id, role_id)
      VALUES 
        (1, $1),
        (2, $2),
        (3, $3)
      ON CONFLICT DO NOTHING
    `, [
      adminRole.rows[0]?.id || 1,
      userRole.rows[0]?.id || 2,
      moderatorRole.rows[0]?.id || 3
    ]);

    client.release();
    console.log('Role database initialized successfully');
  } catch (error) {
    console.error('Error initializing role database:', error);
    throw error;
  }
}

module.exports = { pool, initDatabase }; 