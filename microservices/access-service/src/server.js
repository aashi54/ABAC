const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { pool, initDatabase } = require('./database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'access-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Check access permission
app.post('/access/check', async (req, res) => {
  try {
    const { user_id, resource, action } = req.body;
    
    if (!user_id || !resource || !action) {
      return res.status(400).json({
        success: false,
        message: 'user_id, resource, and action are required'
      });
    }

    // Get user permissions from cache or fetch from other services
    const userPermissions = await getUserPermissions(user_id);
    
    // Check if user has the required permission
    const hasPermission = userPermissions.some(permission => 
      permission.resource === resource && permission.action === action
    );

    // Log the access attempt
    await logAccessAttempt(user_id, resource, action, hasPermission);

    res.json({
      success: true,
      data: {
        user_id,
        resource,
        action,
        allowed: hasPermission,
        reason: hasPermission ? 'Permission granted' : 'Permission denied'
      }
    });
  } catch (error) {
    console.error('Error checking access:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check access',
      error: error.message
    });
  }
});

// Get user permissions
app.get('/access/user/:id/permissions', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const permissions = await getUserPermissions(userId);
    
    res.json({
      success: true,
      data: permissions
    });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user permissions',
      error: error.message
    });
  }
});

// Get access logs
app.get('/access/logs', async (req, res) => {
  try {
    const { user_id, resource, action, limit = 100 } = req.query;
    
    let query = 'SELECT * FROM access_logs';
    const params = [];
    let paramCount = 0;

    if (user_id || resource || action) {
      query += ' WHERE';
      if (user_id) {
        paramCount++;
        query += ` user_id = $${paramCount}`;
        params.push(parseInt(user_id));
      }
      if (resource) {
        paramCount++;
        query += paramCount === 1 ? '' : ' AND';
        query += ` resource = $${paramCount}`;
        params.push(resource);
      }
      if (action) {
        paramCount++;
        query += paramCount === 1 ? '' : ' AND';
        query += ` action = $${paramCount}`;
        params.push(action);
      }
    }

    query += ' ORDER BY timestamp DESC LIMIT $' + (paramCount + 1);
    params.push(parseInt(limit));

    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching access logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch access logs',
      error: error.message
    });
  }
});

// Helper function to get user permissions
async function getUserPermissions(userId) {
  try {
    // Check cache first
    const cachedPermissions = await pool.query(
      'SELECT permission_data FROM user_permissions_cache WHERE user_id = $1',
      [userId]
    );

    if (cachedPermissions.rows.length > 0) {
      return cachedPermissions.rows[0].permission_data;
    }

    // If not in cache, fetch from other services (simplified for demo)
    // In a real implementation, you would make HTTP calls to role and permission services
    const mockPermissions = [
      { resource: 'users', action: 'read' },
      { resource: 'roles', action: 'read' }
    ];

    // Cache the permissions
    await pool.query(
      'INSERT INTO user_permissions_cache (user_id, permission_data) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET permission_data = $2, updated_at = CURRENT_TIMESTAMP',
      [userId, mockPermissions]
    );

    return mockPermissions;
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

// Helper function to log access attempts
async function logAccessAttempt(userId, resource, action, allowed) {
  try {
    await pool.query(
      'INSERT INTO access_logs (user_id, resource, action, allowed, reason) VALUES ($1, $2, $3, $4, $5)',
      [userId, resource, action, allowed, allowed ? 'Permission granted' : 'Permission denied']
    );
  } catch (error) {
    console.error('Error logging access attempt:', error);
  }
}

// Clear user permissions cache
app.delete('/access/cache/user/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    await pool.query('DELETE FROM user_permissions_cache WHERE user_id = $1', [userId]);
    
    res.json({
      success: true,
      message: 'User permissions cache cleared'
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error.message
    });
  }
});

// Get access statistics
app.get('/access/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_attempts,
        COUNT(CASE WHEN allowed = true THEN 1 END) as allowed_attempts,
        COUNT(CASE WHEN allowed = false THEN 1 END) as denied_attempts,
        resource,
        action
      FROM access_logs 
      GROUP BY resource, action
      ORDER BY total_attempts DESC
    `);
    
    res.json({
      success: true,
      data: stats.rows
    });
  } catch (error) {
    console.error('Error fetching access stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch access stats',
      error: error.message
    });
  }
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('Initializing access database...');
    await initDatabase();
    console.log('Access database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`Access Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start access service:', error);
    process.exit(1);
  }
}

startServer(); 