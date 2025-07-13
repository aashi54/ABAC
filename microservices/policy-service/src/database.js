const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'policy_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

// Initialize database tables
async function initDatabase() {
  try {
    const client = await pool.connect();
    
    // Create policies table
    await client.query(`
      CREATE TABLE IF NOT EXISTS policies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        resource VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL,
        conditions JSONB NOT NULL,
        effect VARCHAR(10) NOT NULL CHECK (effect IN ('allow', 'deny')),
        priority INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create policy_evaluations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS policy_evaluations (
        id SERIAL PRIMARY KEY,
        policy_id INTEGER REFERENCES policies(id),
        user_id INTEGER NOT NULL,
        resource VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL,
        context JSONB NOT NULL,
        result BOOLEAN NOT NULL,
        reason TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert sample policies if not exists
    await client.query(`
      INSERT INTO policies (name, description, resource, action, conditions, effect, priority)
      VALUES 
        ('admin_full_access', 'Administrators have full access to all resources', 'all', 'all', '{"user.role": "admin"}', 'allow', 100),
        ('user_read_only', 'Regular users can only read resources', 'users', 'read', '{"user.role": "user"}', 'allow', 50),
        ('time_based_access', 'Access only during business hours', 'sensitive', 'write', '{"time.hour": {"$gte": 9, "$lte": 17}}', 'allow', 75),
        ('department_access', 'Users can only access their department data', 'data', 'read', '{"user.department": "$resource.department"}', 'allow', 60)
      ON CONFLICT (name) DO NOTHING
    `);

    client.release();
    console.log('Policy database initialized successfully');
  } catch (error) {
    console.error('Error initializing policy database:', error);
    throw error;
  }
}

module.exports = { pool, initDatabase }; 