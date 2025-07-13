# RBAC/ABAC Microservices Architecture

## Overview
Converting the monolithic RBAC/ABAC system into microservices to demonstrate:
- Service decomposition
- Inter-service communication
- API Gateway pattern
- Distributed data management

## Microservices Breakdown

### 1. **User Service** (`user-service`)
**Port: 3002**
- User CRUD operations
- User profile management
- User search and filtering

### 2. **Role Service** (`role-service`)
**Port: 3003**
- Role CRUD operations
- Role hierarchy management
- Role assignment to users

### 3. **Permission Service** (`permission-service`)
**Port: 3004**
- Permission CRUD operations
- Permission assignment to roles
- Permission inheritance logic

### 4. **Access Control Service** (`access-service`)
**Port: 3005**
- RBAC/ABAC policy evaluation
- Permission checking logic
- Access decision engine

### 5. **Policy Service** (`policy-service`)
**Port: 3006**
- ABAC policy management
- Policy evaluation rules
- Dynamic policy updates

### 6. **API Gateway** (`api-gateway`)
**Port: 3000**
- Route requests to appropriate services
- Authentication middleware
- Rate limiting
- Request/response transformation

## Service Communication Patterns

### **Synchronous Communication (HTTP/REST)**
```javascript
// Service-to-service calls
const userService = axios.create({ baseURL: 'http://user-service:3002' });
const roleService = axios.create({ baseURL: 'http://role-service:3003' });
```

## Database Per Service Pattern

### 1. **User Service DB**
```sql
-- user_db
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  department VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. **Role Service DB**
```sql
-- role_db
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  parent_role_id INTEGER REFERENCES roles(id)
);

CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  role_id INTEGER REFERENCES roles(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. **Permission Service DB**
```sql
-- permission_db
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT
);

CREATE TABLE role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL,
  permission_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. **Policy Service DB**
```sql
-- policy_db
CREATE TABLE abac_policies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  conditions JSONB NOT NULL,
  effect VARCHAR(10) NOT NULL,
  priority INTEGER DEFAULT 0
);
```

## Implementation Steps

### Step 1: Create Service Structure
```
microservices/
├── api-gateway/
├── user-service/
├── role-service/
├── permission-service/
├── access-service/
├── policy-service/
└── docker-compose.yml
```

### Step 2: Implement API Gateway
```javascript
// api-gateway/src/app.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Route requests to services
app.use('/users', createProxyMiddleware({ 
  target: 'http://user-service:3002',
  changeOrigin: true 
}));

app.use('/roles', createProxyMiddleware({ 
  target: 'http://role-service:3003',
  changeOrigin: true 
}));

// ... other routes
```

### Step 3: Docker Compose Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "3000:3000"
    depends_on:
      - user-service
      - role-service

  user-service:
    build: ./user-service
    ports:
      - "3002:3002"
    environment:
      - DB_HOST=postgres-user

  role-service:
    build: ./role-service
    ports:
      - "3003:3003"
    environment:
      - DB_HOST=postgres-role

  # ... other services

  postgres-user:
    image: postgres:13
    environment:
      POSTGRES_DB: user_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password

  postgres-role:
    image: postgres:13
    environment:
      POSTGRES_DB: role_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password

  # ... other databases
```

## Key Microservices Concepts Demonstrated

### 1. **Service Independence**
- Each service has its own database
- Services can be deployed independently
- Technology stack can vary per service

### 2. **API Gateway Pattern**
- Centralized routing
- Authentication/authorization
- Rate limiting and monitoring

### 3. **Database Per Service**
- Data isolation
- Independent scaling
- Technology flexibility

### 4. **Distributed Data Management**
- Eventual consistency
- Saga pattern for transactions
- CQRS (Command Query Responsibility Segregation)

## Interview Talking Points

### **Architecture Decisions:**
- **"I decomposed the monolithic RBAC system into 6 focused microservices, each with its own database and responsibility."**
- **"Used API Gateway pattern to centralize routing and cross-cutting concerns."**
- **"Implemented database-per-service pattern to ensure data isolation and independent scaling."**

### **Technical Implementation:**
- **"Each service is containerized with Docker and can be deployed independently."**
- **"Used synchronous HTTP calls for service-to-service communication."**
- **"Implemented proper service discovery and load balancing through the API Gateway."**

### **Scalability & Benefits:**
- **"Services can be scaled independently based on load - user service scales more than policy service."**
- **"Technology flexibility - can use different databases (PostgreSQL, MongoDB) per service based on data requirements."**
- **"Fault isolation - if one service fails, others continue to function."**

## Future Enhancements

### 1. **Service Mesh (Istio)**
- Service-to-service communication
- Load balancing and routing
- Security and observability

### 2. **Message Queue (Kafka/RabbitMQ)**
- Asynchronous communication
- Message persistence
- Guaranteed delivery

### 3. **Distributed Tracing (Jaeger)**
- Request tracing across services
- Performance monitoring
- Debugging capabilities

### 4. **Circuit Breaker Pattern**
- Fault tolerance
- Service resilience
- Graceful degradation

This microservices architecture demonstrates advanced system design skills and shows you understand modern distributed systems patterns! 