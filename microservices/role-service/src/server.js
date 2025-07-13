const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { pool, initDatabase } = require('./database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize database
initDatabase().catch(console.error);

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'role-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Get all roles
app.get('/roles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roles ORDER BY created_at DESC');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch roles',
      error: error.message
    });
  }
});

// Get role by ID
app.get('/roles/:id', async (req, res) => {
  try {
    const roleId = parseInt(req.params.id);
    const result = await pool.query('SELECT * FROM roles WHERE id = $1', [roleId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch role',
      error: error.message
    });
  }
});

// Create role
app.post('/roles', async (req, res) => {
  try {
    const { name, description, parent_role_id } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'name is required'
      });
    }

    // Check if role already exists
    const existingRole = await pool.query('SELECT * FROM roles WHERE name = $1', [name]);
    if (existingRole.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Role already exists'
      });
    }

    // Validate parent role if provided
    if (parent_role_id) {
      const parentRole = await pool.query('SELECT * FROM roles WHERE id = $1', [parent_role_id]);
      if (parentRole.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Parent role not found'
        });
      }
    }

    const result = await pool.query(
      'INSERT INTO roles (name, description, parent_role_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description || '', parent_role_id || null]
    );

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create role',
      error: error.message
    });
  }
});

// Update role
app.put('/roles/:id', async (req, res) => {
  try {
    const roleId = parseInt(req.params.id);
    const { name, description, parent_role_id } = req.body;
    
    // Check if role exists
    const existingRole = await pool.query('SELECT * FROM roles WHERE id = $1', [roleId]);
    if (existingRole.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Check if new name conflicts with existing role
    if (name && name !== existingRole.rows[0].name) {
      const conflictRole = await pool.query('SELECT * FROM roles WHERE name = $1 AND id != $2', [name, roleId]);
      if (conflictRole.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Role name already exists'
        });
      }
    }

    // Validate parent role if provided
    if (parent_role_id && parent_role_id !== existingRole.rows[0].parent_role_id) {
      const parentRole = await pool.query('SELECT * FROM roles WHERE id = $1', [parent_role_id]);
      if (parentRole.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Parent role not found'
        });
      }
    }

    const result = await pool.query(
      'UPDATE roles SET name = COALESCE($1, name), description = COALESCE($2, description), parent_role_id = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name, description, parent_role_id, roleId]
    );

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update role',
      error: error.message
    });
  }
});

// Delete role
app.delete('/roles/:id', async (req, res) => {
  try {
    const roleId = parseInt(req.params.id);
    
    // Check if role is assigned to any users
    const assignedUsers = await pool.query('SELECT * FROM user_roles WHERE role_id = $1', [roleId]);
    if (assignedUsers.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete role that is assigned to users'
      });
    }

    // Check if role is a parent to other roles
    const childRoles = await pool.query('SELECT * FROM roles WHERE parent_role_id = $1', [roleId]);
    if (childRoles.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete role that has child roles'
      });
    }

    const result = await pool.query('DELETE FROM roles WHERE id = $1 RETURNING *', [roleId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.json({
      success: true,
      message: 'Role deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete role',
      error: error.message
    });
  }
});

// Get user roles
app.get('/roles/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const result = await pool.query(`
      SELECT r.* FROM roles r
      INNER JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = $1
    `, [userId]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching user roles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user roles',
      error: error.message
    });
  }
});

// Assign role to user
app.post('/roles/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { role_id } = req.body;
    
    if (!role_id) {
      return res.status(400).json({
        success: false,
        message: 'role_id is required'
      });
    }

    // Check if role exists
    const role = await pool.query('SELECT * FROM roles WHERE id = $1', [role_id]);
    if (role.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Check if already assigned
    const existingAssignment = await pool.query(
      'SELECT * FROM user_roles WHERE user_id = $1 AND role_id = $2',
      [userId, role_id]
    );
    
    if (existingAssignment.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Role already assigned to user'
      });
    }

    const result = await pool.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) RETURNING *',
      [userId, role_id]
    );

    res.status(201).json({
      success: true,
      message: 'Role assigned to user successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error assigning role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign role',
      error: error.message
    });
  }
});

// Get role hierarchy
app.get('/roles/:id/hierarchy', async (req, res) => {
  try {
    const roleId = parseInt(req.params.id);
    const role = await pool.query('SELECT * FROM roles WHERE id = $1', [roleId]);
    
    if (role.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    const roleData = role.rows[0];
    const hierarchy = {
      role: roleData,
      parent: null,
      children: []
    };

    // Find parent role
    if (roleData.parent_role_id) {
      const parentRole = await pool.query('SELECT * FROM roles WHERE id = $1', [roleData.parent_role_id]);
      hierarchy.parent = parentRole.rows[0] || null;
    }

    // Find child roles
    const childRoles = await pool.query('SELECT * FROM roles WHERE parent_role_id = $1', [roleId]);
    hierarchy.children = childRoles.rows;

    res.json({
      success: true,
      data: hierarchy
    });
  } catch (error) {
    console.error('Error fetching role hierarchy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch role hierarchy',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Role Service running on port ${PORT}`);
}); 