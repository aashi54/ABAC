# RBAC/ABAC Microservices Architecture

A complete microservices implementation of a Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC) system, demonstrating modern distributed system patterns.

## 🎉 Complete Microservices Architecture

### **Services Created:**
1. **API Gateway** (Port 3000) - Centralized routing
2. **Auth Service** (Port 3001) - Authentication & JWT
3. **User Service** (Port 3002) - User management
4. **Role Service** (Port 3003) - Role management
5. **Permission Service** (Port 3004) - Permission management
6. **Access Service** (Port 3005) - Access control decisions
7. **Policy Service** (Port 3006) - ABAC policies

### **Key Features:**
- ✅ **7 Independent Microservices** - Each in its own folder
- ✅ **API Gateway** - Routes requests to appropriate services
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Database Per Service** - PostgreSQL databases for each service
- ✅ **Docker Compose** - Easy deployment and orchestration
- ✅ **Health Checks** - Each service has health endpoints
- ✅ **Comprehensive Testing** - Test scripts for all services
- ✅ **Complete Documentation** - Detailed README with examples

### **How to Use:**

1. **Install Dependencies:**
   ```bash
   ./install-dependencies.sh
   ```

2. **Start All Services:**
   ```bash
   cd microservices
   docker-compose up
   ```

3. **Test Everything:**
   ```bash
   ./test-all-microservices.sh
   ```

### **Individual Service Testing:**
```bash
# Test each service directly
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # User Service
curl http://localhost:3003/health  # Role Service
curl http://localhost:3004/health  # Permission Service
curl http://localhost:3005/health  # Access Service
curl http://localhost:3006/health  # Policy Service

# Test through API Gateway
curl http://localhost:3000/        # Service discovery
curl http://localhost:3000/auth/health
curl http://localhost:3000/users
curl http://localhost:3000/roles
```

### **Authentication Flow:**
```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "password123"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'
```

This microservices architecture demonstrates:
- **Service Decomposition** - Each service has a single responsibility
- **API Gateway Pattern** - Centralized routing and cross-cutting concerns
- **Database Per Service** - Data isolation and independent scaling
- **Inter-Service Communication** - HTTP/REST between services
- **Containerization** - Docker for easy deployment
- **Security** - JWT authentication, password hashing, CORS protection

This is perfect for showcasing microservices knowledge in your resume and interviews! 🚀 