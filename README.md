# RBAC/ABAC Microservices Security System

A comprehensive Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC) system built with microservices architecture using Node.js, Express, PostgreSQL, and Docker.

## 🏗️ Architecture

The system consists of 6 microservices:

- **Auth Service** (Port 3001) - User authentication and JWT token management
- **User Service** (Port 3002) - User profile management
- **Role Service** (Port 3003) - Role management and hierarchy
- **Permission Service** (Port 3004) - Permission management and role-permission mapping
- **Access Service** (Port 3005) - Access control and permission validation
- **Policy Service** (Port 3006) - ABAC policy management
- **API Gateway** (Port 3000) - Centralized routing and load balancing

## 🚀 Features

### **🔐 Authentication & Authorization**
- **JWT Token Management**: Secure token-based authentication with configurable expiration
- **Password Hashing**: bcrypt encryption for secure password storage
- **Role-Based Access Control (RBAC)**: User-role-permission hierarchy
- **Attribute-Based Access Control (ABAC)**: Dynamic policy evaluation based on user attributes
- **Session Management**: Token validation and refresh mechanisms
- **Multi-Factor Authentication Ready**: Extensible architecture for 2FA implementation

### **👥 User Management**
- **User Registration & Login**: Complete user lifecycle management
- **Profile Management**: User profile creation, updates, and deletion
- **User Search & Filtering**: Advanced user discovery capabilities
- **Account Status Management**: Active, inactive, and suspended states
- **Password Reset Functionality**: Secure password recovery process

### **🎭 Role Management**
- **Role Hierarchy**: Parent-child role relationships with inheritance
- **Role Assignment**: Dynamic role assignment and removal
- **Role Templates**: Predefined role templates for common use cases
- **Role Validation**: Automatic role hierarchy validation
- **Bulk Role Operations**: Efficient role management for large user bases

### **🔑 Permission Management**
- **Granular Permissions**: Resource and action-based permission system
- **Permission Inheritance**: Automatic permission inheritance through role hierarchy
- **Permission Templates**: Reusable permission sets for common scenarios
- **Permission Validation**: Real-time permission checking and validation
- **Permission Auditing**: Complete audit trail of permission changes

### **🛡️ Access Control**
- **Real-time Access Decisions**: Instant permission evaluation
- **Access Logging**: Comprehensive audit trail of all access attempts
- **Access Statistics**: Analytics and reporting on access patterns
- **Policy Evaluation Engine**: Advanced ABAC policy processing
- **Access Denial Handling**: Graceful handling of access denials

### **📊 Policy Management**
- **Dynamic Policy Creation**: Runtime policy definition and modification
- **Policy Templates**: Reusable policy templates for common scenarios
- **Policy Validation**: Automatic policy syntax and logic validation
- **Policy Versioning**: Version control for policy changes
- **Policy Testing**: Built-in policy testing and simulation tools

### **🌐 API Gateway Features**
- **Request Routing**: Intelligent routing to appropriate microservices
- **Load Balancing**: Basic load balancing capabilities
- **Request/Response Transformation**: Data format conversion and validation
- **CORS Handling**: Cross-origin resource sharing configuration
- **Security Headers**: Automatic security header injection
- **Rate Limiting**: Built-in rate limiting to prevent abuse

### **🗄️ Database Features**
- **Database Per Service**: Independent PostgreSQL databases for each service
- **Data Isolation**: Complete data separation between services
- **Connection Pooling**: Optimized database connection management
- **Automatic Schema Migration**: Database schema initialization and updates
- **Data Backup Ready**: Structured for easy backup and recovery

### **🐳 Containerization & DevOps**
- **Docker Containerization**: Complete containerization of all services
- **Docker Compose Orchestration**: Multi-service deployment and management
- **Health Checks**: Built-in health monitoring for all services
- **Environment Configuration**: Flexible environment-based configuration
- **Service Discovery**: Automatic service discovery and registration

### **📈 Monitoring & Observability**
- **Health Endpoints**: `/health` endpoints for all services
- **Service Status Monitoring**: Real-time service status tracking
- **Log Aggregation**: Centralized logging across all services
- **Error Tracking**: Comprehensive error logging and tracking
- **Performance Metrics**: Built-in performance monitoring capabilities

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Containerization**: Docker, Docker Compose
- **Authentication**: JWT (JSON Web Tokens)
- **API**: RESTful APIs
- **Architecture**: Microservices with API Gateway
- **Security**: bcrypt, Helmet, CORS
- **Validation**: Joi schema validation

## 📋 Prerequisites

- Docker and Docker Compose
- Git
- At least 4GB RAM (for running all services)
- 10GB free disk space

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Asmita54/ABAC.git
   cd ABAC/microservices
   ```

### **2. Start All Services**
```bash
docker-compose up --build
```

### **3. Verify Deployment**
```bash
# Check all services are running
docker-compose ps

# Test API Gateway
curl http://localhost:3000/health

# Test individual services
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # User Service
curl http://localhost:3003/health  # Role Service
curl http://localhost:3004/health  # Permission Service
curl http://localhost:3005/health  # Access Service
curl http://localhost:3006/health  # Policy Service
```

## 📚 Usage Guide

### **🔐 Authentication Flow**

#### **1. User Registration**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### **2. User Login**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### **3. Using JWT Token**
```bash
# Include token in subsequent requests
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/users/profile
```

### **👥 User Management**

#### **Get All Users**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/users
```

#### **Get User by ID**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/users/1
```

#### **Update User Profile**
```bash
curl -X PUT http://localhost:3000/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John Updated",
    "lastName": "Doe Updated",
    "email": "john.updated@example.com"
  }'
```

### **🎭 Role Management**

#### **Create a New Role**
```bash
curl -X POST http://localhost:3000/roles \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "admin",
    "description": "Administrator role with full access",
    "permissions": ["read:all", "write:all", "delete:all"]
  }'
```

#### **Assign Role to User**
```bash
curl -X POST http://localhost:3000/roles/user/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleId": 1
  }'
```

#### **Get User Roles**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/roles/user/1
```

### **🔑 Permission Management**

#### **Create Permission**
```bash
curl -X POST http://localhost:3000/permissions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "read:users",
    "description": "Permission to read user data",
    "resource": "users",
    "action": "read"
  }'
```

#### **Assign Permission to Role**
```bash
curl -X POST http://localhost:3000/permissions/role/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissionId": 1
  }'
```

#### **Get Role Permissions**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/permissions/role/1
```

### **🛡️ Access Control**

#### **Check Access Permission**
```bash
curl -X POST http://localhost:3000/access/check \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "resource": "users",
    "action": "read",
    "attributes": {
      "time": "2024-01-15T10:00:00Z",
      "location": "office"
    }
  }'
```

#### **Get User Permissions**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/access/user/1/permissions
```

#### **Get Access Logs**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/access/logs
```

### **📊 Policy Management**

#### **Create ABAC Policy**
```bash
curl -X POST http://localhost:3000/policy \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "office_hours_policy",
    "description": "Allow access only during office hours",
    "conditions": {
      "time": {
        "operator": "between",
        "value": ["09:00", "17:00"]
      },
      "location": {
        "operator": "equals",
        "value": "office"
      }
    },
    "effect": "allow"
  }'
```

#### **Evaluate Policy**
```bash
curl -X POST http://localhost:3000/policy/evaluate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "policyId": 1,
    "attributes": {
      "time": "14:30",
      "location": "office",
      "userRole": "admin"
    }
  }'
```

## 🧪 Testing

### **Run All Tests**
```bash
# Test all services
./test-all-services.sh

# Test individual services
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
curl http://localhost:3005/health
curl http://localhost:3006/health
```

### **Test Authentication Flow**
```bash
# 1. Register a new user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "firstName": "Test",
    "lastName": "User"
  }'

# 2. Login to get JWT token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'

# 3. Use the token for authenticated requests
TOKEN="YOUR_JWT_TOKEN_HERE"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/users
```

## 🔧 Development

### **Running Services Individually**
```bash
# Install dependencies
cd microservices/auth-service
npm install

# Start service
npm start

# Run in development mode
npm run dev
```

### **Environment Variables**
Create `.env` files in each service directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=service_db
DB_USER=postgres
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Service Configuration
NODE_ENV=development
PORT=3001
```

### **Database Management**
```bash
# Connect to PostgreSQL
docker exec -it abac-microservices_auth-db_1 psql -U postgres -d auth_db

# View tables
\dt

# Run queries
SELECT * FROM users;
```

## 📊 Monitoring

### **Health Checks**
All services provide health endpoints:
```bash
curl http://localhost:3000/health  # API Gateway
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # User Service
# ... etc
```

### **Service Logs**
```bash
# View all service logs
docker-compose logs

# View specific service logs
docker-compose logs auth-service
docker-compose logs user-service

# Follow logs in real-time
docker-compose logs -f
```

### **Container Status**
```bash
# Check running containers
docker-compose ps

# Check resource usage
docker stats
```

## 🚀 Deployment Options

### **Local Development**
```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
docker-compose down
```

### **Production Deployment**
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

## 🔐 Security Best Practices

### **JWT Security**
- Use strong, unique JWT secrets
- Set appropriate token expiration times
- Implement token refresh mechanisms
- Validate token signatures

### **Database Security**
- Use strong database passwords
- Enable SSL connections
- Regular database backups
- Implement connection pooling

### **API Security**
- Rate limiting on all endpoints
- Input validation and sanitization
- CORS configuration
- Security headers (Helmet)

### **Container Security**
- Use non-root users in containers
- Regular security updates
- Image vulnerability scanning
- Resource limits

## 📈 Performance Optimization

### **Database Optimization**
- Connection pooling
- Query optimization
- Index creation
- Regular maintenance

### **API Optimization**
- Response caching
- Request compression
- Pagination for large datasets
- Efficient error handling

### **Container Optimization**
- Multi-stage Docker builds
- Image size optimization
- Resource limits
- Health check optimization

## 🆘 Troubleshooting

### **Common Issues**

#### **Service Won't Start**
```bash
# Check logs
docker-compose logs service-name

# Check port conflicts
netstat -tulpn | grep :3000

# Restart service
docker-compose restart service-name
```

#### **Database Connection Issues**
```bash
# Check database status
docker-compose ps | grep db

# Restart database
docker-compose restart auth-db

# Check database logs
docker-compose logs auth-db
```

#### **JWT Token Issues**
```bash
# Verify JWT secret is set
echo $JWT_SECRET

# Check token expiration
# Decode token at jwt.io
```

### **Debug Mode**
```bash
# Enable debug logging
NODE_ENV=development docker-compose up

# View detailed logs
docker-compose logs -f --tail=100
```


---
