const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'api-gateway',
    status: 'healthy',
    message: 'RBAC/ABAC Microservices API Gateway',
    timestamp: new Date().toISOString(),
    services: {
      auth: 'http://localhost:3001',
      users: 'http://localhost:3002',
      roles: 'http://localhost:3003',
      permissions: 'http://localhost:3004',
      access: 'http://localhost:3005',
      policy: 'http://localhost:3006'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'api-gateway',
    message: 'RBAC/ABAC Microservices API Gateway',
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /health',
      'GET /auth/*',
      'GET /users/*', 
      'GET /roles/*',
      'GET /permissions/*',
      'GET /access/*',
      'GET /policy/*'
    ],
    services: {
      auth: 'http://localhost:3001',
      users: 'http://localhost:3002',
      roles: 'http://localhost:3003',
      permissions: 'http://localhost:3004',
      access: 'http://localhost:3005',
      policy: 'http://localhost:3006'
    }
  });
});

// Route requests to microservices
app.use('/auth', createProxyMiddleware({ 
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/auth': '/auth'
  }
}));

app.use('/users', createProxyMiddleware({ 
  target: 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: {
    '^/users': '/users'
  }
}));

app.use('/roles', createProxyMiddleware({ 
  target: 'http://localhost:3003',
  changeOrigin: true,
  pathRewrite: {
    '^/roles': '/roles'
  }
}));

app.use('/permissions', createProxyMiddleware({ 
  target: 'http://localhost:3004',
  changeOrigin: true,
  pathRewrite: {
    '^/permissions': '/permissions'
  }
}));

app.use('/access', createProxyMiddleware({ 
  target: 'http://localhost:3005',
  changeOrigin: true,
  pathRewrite: {
    '^/access': '/access'
  }
}));

app.use('/policy', createProxyMiddleware({ 
  target: 'http://localhost:3006',
  changeOrigin: true,
  pathRewrite: {
    '^/policy': '/policy'
  }
}));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Service not found',
    availableServices: ['/auth', '/users', '/roles', '/permissions', '/access', '/policy'],
    availableEndpoints: ['GET /health', 'GET /']
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on http://localhost:${PORT}`);
  console.log('Routing to microservices:');
  console.log('- Auth Service: http://localhost:3001');
  console.log('- User Service: http://localhost:3002');
  console.log('- Role Service: http://localhost:3003');
  console.log('- Permission Service: http://localhost:3004');
  console.log('- Access Service: http://localhost:3005');
  console.log('- Policy Service: http://localhost:3006');
}); 