const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'permission_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

// Initialize database tables
async function initDatabase() {
  try {
    const client = await pool.connect();
    
    // Create permissions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        resource VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create role_permissions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id SERIAL PRIMARY KEY,
        role_id INTEGER NOT NULL,
        permission_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(role_id, permission_id)
      )
    `);

    // Insert sample permissions if not exists
    await client.query(`
      INSERT INTO permissions (name, resource, action, description)
      VALUES 
        ('read_users', 'users', 'read', 'Read user information'),
        ('write_users', 'users', 'write', 'Create/update user information'),
        ('delete_users', 'users', 'delete', 'Delete users'),
        ('read_roles', 'roles', 'read', 'Read role information'),
        ('write_roles', 'roles', 'write', 'Create/update roles'),
        ('delete_roles', 'roles', 'delete', 'Delete roles'),
        ('read_permissions', 'permissions', 'read', 'Read permission information'),
        ('write_permissions', 'permissions', 'write', 'Create/update permissions'),
        ('delete_permissions', 'permissions', 'delete', 'Delete permissions')
      ON CONFLICT (name) DO NOTHING
    `);

    // Get permission and role IDs for assignments
    const readUsersPerm = await client.query('SELECT id FROM permissions WHERE name = $1', ['read_users']);
    const writeUsersPerm = await client.query('SELECT id FROM permissions WHERE name = $1', ['write_users']);
    const deleteUsersPerm = await client.query('SELECT id FROM permissions WHERE name = $1', ['delete_users']);
    const readRolesPerm = await client.query('SELECT id FROM permissions WHERE name = $1', ['read_roles']);
    const writeRolesPerm = await client.query('SELECT id FROM permissions WHERE name = $1', ['write_roles']);
    const deleteRolesPerm = await client.query('SELECT id FROM permissions WHERE name = $1', ['delete_roles']);

    // Insert sample role-permission assignments if not exists
    await client.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES 
        (1, $1), (1, $2), (1, $3), (1, $4), (1, $5), (1, $6), -- admin gets all permissions
        (2, $1), (2, $4) -- user gets read permissions only
      ON CONFLICT (role_id, permission_id) DO NOTHING
    `, [
      readUsersPerm.rows[0]?.id || 1,
      writeUsersPerm.rows[0]?.id || 2,
      deleteUsersPerm.rows[0]?.id || 3,
      readRolesPerm.rows[0]?.id || 4,
      writeRolesPerm.rows[0]?.id || 5,
      deleteRolesPerm.rows[0]?.id || 6
    ]);

    client.release();
    console.log('Permission database initialized successfully');
  } catch (error) {
    console.error('Error initializing permission database:', error);
    throw error;
  }
}

module.exports = { pool, initDatabase }; 