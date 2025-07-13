const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { pool, initDatabase } = require('./database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize database
initDatabase().catch(console.error);

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'user-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Get all users
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM user_profiles ORDER BY created_at DESC');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Get user by ID
app.get('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const result = await pool.query('SELECT * FROM user_profiles WHERE id = $1', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// Create user
app.post('/users', async (req, res) => {
  try {
    const { user_id, username, first_name, last_name, email, department } = req.body;
    
    if (!user_id || !username || !email) {
      return res.status(400).json({
        success: false,
        message: 'user_id, username, and email are required'
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM user_profiles WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    const result = await pool.query(
      'INSERT INTO user_profiles (user_id, username, first_name, last_name, email, department) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user_id, username, first_name, last_name, email, department]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
});

// Update user
app.put('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { username, first_name, last_name, email, department } = req.body;
    
    // Check if user exists
    const existingUser = await pool.query('SELECT * FROM user_profiles WHERE id = $1', [userId]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if new email/username conflicts with existing users
    if (email || username) {
      const conflictQuery = await pool.query(
        'SELECT * FROM user_profiles WHERE (email = $1 OR username = $2) AND id != $3',
        [email || existingUser.rows[0].email, username || existingUser.rows[0].username, userId]
      );
      
      if (conflictQuery.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email or username already exists'
        });
      }
    }

    const result = await pool.query(
      'UPDATE user_profiles SET username = COALESCE($1, username), first_name = COALESCE($2, first_name), last_name = COALESCE($3, last_name), email = COALESCE($4, email), department = COALESCE($5, department), updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [username, first_name, last_name, email, department, userId]
    );

    res.json({
      success: true,
      message: 'User updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
});

// Delete user
app.delete('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    const result = await pool.query('DELETE FROM user_profiles WHERE id = $1 RETURNING *', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// Search users
app.get('/users/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const result = await pool.query(
      'SELECT * FROM user_profiles WHERE username ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1 OR department ILIKE $1',
      [`%${query}%`]
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
}); 