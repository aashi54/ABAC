const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3006;

// In-memory policy storage (simplified for demo)
const policies = [
  {
    id: 1,
    name: 'admin_full_access',
    resource: '*',
    action: '*',
    conditions: {
      role: 'admin',
      department: '*'
    },
    effect: 'allow',
    priority: 100,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'user_read_access',
    resource: 'users',
    action: 'read',
    conditions: {
      role: 'user',
      department: '*'
    },
    effect: 'allow',
    priority: 50,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'hr_department_access',
    resource: 'users',
    action: 'write',
    conditions: {
      role: 'user',
      department: 'hr'
    },
    effect: 'allow',
    priority: 75,
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    name: 'time_based_access',
    resource: 'sensitive_data',
    action: 'read',
    conditions: {
      role: 'user',
      time: {
        start: '09:00',
        end: '17:00'
      }
    },
    effect: 'allow',
    priority: 60,
    created_at: new Date().toISOString()
  }
];

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'policy-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Get all policies
app.get('/policy', (req, res) => {
  res.json({
    success: true,
    data: policies
  });
});

// Get policy by ID
app.get('/policy/:id', (req, res) => {
  const policyId = parseInt(req.params.id);
  const policy = policies.find(p => p.id === policyId);
  
  if (!policy) {
    return res.status(404).json({
      success: false,
      message: 'Policy not found'
    });
  }
  
  res.json({
    success: true,
    data: policy
  });
});

// Create policy
app.post('/policy', (req, res) => {
  try {
    const { name, resource, action, conditions, effect, priority } = req.body;
    
    if (!name || !resource || !action || !conditions || !effect) {
      return res.status(400).json({
        success: false,
        message: 'name, resource, action, conditions, and effect are required'
      });
    }

    // Validate effect
    if (!['allow', 'deny'].includes(effect)) {
      return res.status(400).json({
        success: false,
        message: 'effect must be either "allow" or "deny"'
      });
    }

    // Check if policy already exists
    const existingPolicy = policies.find(p => p.name === name);
    if (existingPolicy) {
      return res.status(400).json({
        success: false,
        message: 'Policy with this name already exists'
      });
    }

    const newPolicy = {
      id: policies.length + 1,
      name,
      resource,
      action,
      conditions,
      effect,
      priority: priority || 50,
      created_at: new Date().toISOString()
    };

    policies.push(newPolicy);

    res.status(201).json({
      success: true,
      message: 'Policy created successfully',
      data: newPolicy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create policy',
      error: error.message
    });
  }
});

// Update policy
app.put('/policy/:id', (req, res) => {
  try {
    const policyId = parseInt(req.params.id);
    const { name, resource, action, conditions, effect, priority } = req.body;
    
    const policyIndex = policies.findIndex(p => p.id === policyId);
    if (policyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Validate effect if provided
    if (effect && !['allow', 'deny'].includes(effect)) {
      return res.status(400).json({
        success: false,
        message: 'effect must be either "allow" or "deny"'
      });
    }

    // Check if new name conflicts with existing policy
    if (name && name !== policies[policyIndex].name) {
      const existingPolicy = policies.find(p => p.name === name);
      if (existingPolicy) {
        return res.status(400).json({
          success: false,
          message: 'Policy name already exists'
        });
      }
    }

    policies[policyIndex] = {
      ...policies[policyIndex],
      name: name || policies[policyIndex].name,
      resource: resource || policies[policyIndex].resource,
      action: action || policies[policyIndex].action,
      conditions: conditions || policies[policyIndex].conditions,
      effect: effect || policies[policyIndex].effect,
      priority: priority !== undefined ? priority : policies[policyIndex].priority
    };

    res.json({
      success: true,
      message: 'Policy updated successfully',
      data: policies[policyIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update policy',
      error: error.message
    });
  }
});

// Delete policy
app.delete('/policy/:id', (req, res) => {
  try {
    const policyId = parseInt(req.params.id);
    const policyIndex = policies.findIndex(p => p.id === policyId);
    
    if (policyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    const deletedPolicy = policies.splice(policyIndex, 1)[0];

    res.json({
      success: true,
      message: 'Policy deleted successfully',
      data: deletedPolicy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete policy',
      error: error.message
    });
  }
});

// Evaluate policy
app.post('/policy/evaluate', (req, res) => {
  try {
    const { user, resource, action, context } = req.body;
    
    if (!user || !resource || !action) {
      return res.status(400).json({
        success: false,
        message: 'user, resource, and action are required'
      });
    }

    const result = evaluatePolicies(user, resource, action, context);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Policy evaluation failed',
      error: error.message
    });
  }
});

// Get policies by resource
app.get('/policy/resource/:resource', (req, res) => {
  const { resource } = req.params;
  const resourcePolicies = policies.filter(p => 
    p.resource === resource || p.resource === '*'
  );
  
  res.json({
    success: true,
    data: resourcePolicies
  });
});

// Get policies by effect
app.get('/policy/effect/:effect', (req, res) => {
  const { effect } = req.params;
  
  if (!['allow', 'deny'].includes(effect)) {
    return res.status(400).json({
      success: false,
      message: 'effect must be either "allow" or "deny"'
    });
  }
  
  const effectPolicies = policies.filter(p => p.effect === effect);
  
  res.json({
    success: true,
    data: effectPolicies
  });
});

// Policy evaluation function
function evaluatePolicies(user, resource, action, context = {}) {
  // Sort policies by priority (highest first)
  const sortedPolicies = [...policies].sort((a, b) => b.priority - a.priority);
  
  for (const policy of sortedPolicies) {
    // Check if policy applies to this resource and action
    if ((policy.resource === resource || policy.resource === '*') &&
        (policy.action === action || policy.action === '*')) {
      
      // Check if conditions are met
      if (evaluateConditions(policy.conditions, user, context)) {
        return {
          allowed: policy.effect === 'allow',
          policy: policy.name,
          effect: policy.effect,
          priority: policy.priority,
          conditions: policy.conditions
        };
      }
    }
  }
  
  // Default deny if no policy matches
  return {
    allowed: false,
    policy: 'default_deny',
    effect: 'deny',
    priority: 0,
    conditions: {}
  };
}

// Condition evaluation function
function evaluateConditions(conditions, user, context) {
  for (const [key, value] of Object.entries(conditions)) {
    switch (key) {
      case 'role':
        if (value !== '*' && user.role !== value) {
          return false;
        }
        break;
      case 'department':
        if (value !== '*' && user.department !== value) {
          return false;
        }
        break;
      case 'time':
        if (value.start && value.end) {
          const now = new Date();
          const currentTime = now.getHours() * 100 + now.getMinutes();
          const startTime = parseInt(value.start.replace(':', ''));
          const endTime = parseInt(value.end.replace(':', ''));
          
          if (currentTime < startTime || currentTime > endTime) {
            return false;
          }
        }
        break;
      default:
        // For other conditions, check if user has the attribute
        if (user[key] !== value && value !== '*') {
          return false;
        }
    }
  }
  
  return true;
}

app.listen(PORT, () => {
  console.log(`Policy Service running on port ${PORT}`);
}); 