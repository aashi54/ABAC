const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { pool, initDatabase } = require('./database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize database
initDatabase().catch(console.error);

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'permission-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Get all permissions
app.get('/permissions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM permissions ORDER BY created_at DESC');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch permissions',
      error: error.message
    });
  }
});

// Get permission by ID
app.get('/permissions/:id', async (req, res) => {
  try {
    const permissionId = parseInt(req.params.id);
    const result = await pool.query('SELECT * FROM permissions WHERE id = $1', [permissionId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching permission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch permission',
      error: error.message
    });
  }
});

// Create permission
app.post('/permissions', async (req, res) => {
  try {
    const { name, resource, action, description } = req.body;
    
    if (!name || !resource || !action) {
      return res.status(400).json({
        success: false,
        message: 'name, resource, and action are required'
      });
    }

    // Check if permission already exists
    const existingPermission = await pool.query(
      'SELECT * FROM permissions WHERE name = $1 OR (resource = $2 AND action = $3)',
      [name, resource, action]
    );
    
    if (existingPermission.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Permission already exists'
      });
    }

    const result = await pool.query(
      'INSERT INTO permissions (name, resource, action, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, resource, action, description || '']
    );

    res.status(201).json({
      success: true,
      message: 'Permission created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating permission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create permission',
      error: error.message
    });
  }
});

// Get permissions by resource
app.get('/permissions/resource/:resource', async (req, res) => {
  try {
    const { resource } = req.params;
    const result = await pool.query('SELECT * FROM permissions WHERE resource = $1', [resource]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching resource permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resource permissions',
      error: error.message
    });
  }
});

// Get permissions by action
app.get('/permissions/action/:action', async (req, res) => {
  try {
    const { action } = req.params;
    const result = await pool.query('SELECT * FROM permissions WHERE action = $1', [action]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching action permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch action permissions',
      error: error.message
    });
  }
});

// Get role permissions
app.get('/permissions/role/:roleId', async (req, res) => {
  try {
    const roleId = parseInt(req.params.roleId);
    const result = await pool.query(`
      SELECT p.* FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = $1
    `, [roleId]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch role permissions',
      error: error.message
    });
  }
});

// Assign permission to role
app.post('/permissions/role/:roleId', async (req, res) => {
  try {
    const roleId = parseInt(req.params.roleId);
    const { permission_id } = req.body;
    
    if (!permission_id) {
      return res.status(400).json({
        success: false,
        message: 'permission_id is required'
      });
    }

    // Check if permission exists
    const permission = await pool.query('SELECT * FROM permissions WHERE id = $1', [permission_id]);
    if (permission.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    // Check if already assigned
    const existingAssignment = await pool.query(
      'SELECT * FROM role_permissions WHERE role_id = $1 AND permission_id = $2',
      [roleId, permission_id]
    );
    
    if (existingAssignment.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Permission already assigned to role'
      });
    }

    const result = await pool.query(
      'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) RETURNING *',
      [roleId, permission_id]
    );

    res.status(201).json({
      success: true,
      message: 'Permission assigned to role successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error assigning permission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign permission',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Permission Service running on port ${PORT}`);
}); 