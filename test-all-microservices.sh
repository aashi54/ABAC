#!/bin/bash

echo "🚀 Testing Complete RBAC/ABAC Microservices Architecture"
echo "========================================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test API Gateway
echo -e "\n${BLUE}1. Testing API Gateway (Port 3000)${NC}"
echo "----------------------------------------"
curl -s http://localhost:3000/ | jq '.'

# Test Auth Service directly
echo -e "\n${BLUE}2. Testing Auth Service directly (Port 3001)${NC}"
echo "----------------------------------------"
curl -s http://localhost:3001/health | jq '.'

# Test Auth Service through API Gateway
echo -e "\n${BLUE}3. Testing Auth Service through API Gateway${NC}"
echo "----------------------------------------"
curl -s http://localhost:3000/auth/health | jq '.'

# Test User Registration
echo -e "\n${BLUE}4. Testing User Registration${NC}"
echo "----------------------------------------"
curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }' | jq '.'

# Test User Login
echo -e "\n${BLUE}5. Testing User Login${NC}"
echo "----------------------------------------"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }')

echo $LOGIN_RESPONSE | jq '.'

# Extract token for further tests
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')

# Test User Service directly
echo -e "\n${BLUE}6. Testing User Service directly (Port 3002)${NC}"
echo "----------------------------------------"
curl -s http://localhost:3002/health | jq '.'

# Test User Service through API Gateway
echo -e "\n${BLUE}7. Testing User Service through API Gateway${NC}"
echo "----------------------------------------"
curl -s http://localhost:3000/users | jq '.'

# Test Role Service directly
echo -e "\n${BLUE}8. Testing Role Service directly (Port 3003)${NC}"
echo "----------------------------------------"
curl -s http://localhost:3003/health | jq '.'

# Test Role Service through API Gateway
echo -e "\n${BLUE}9. Testing Role Service through API Gateway${NC}"
echo "----------------------------------------"
curl -s http://localhost:3000/roles | jq '.'

# Test Permission Service directly
echo -e "\n${BLUE}10. Testing Permission Service directly (Port 3004)${NC}"
echo "----------------------------------------"
curl -s http://localhost:3004/health | jq '.'

# Test Permission Service through API Gateway
echo -e "\n${BLUE}11. Testing Permission Service through API Gateway${NC}"
echo "----------------------------------------"
curl -s http://localhost:3000/permissions | jq '.'

# Test Access Service directly
echo -e "\n${BLUE}12. Testing Access Service directly (Port 3005)${NC}"
echo "----------------------------------------"
curl -s http://localhost:3005/health | jq '.'

# Test Access Service through API Gateway
echo -e "\n${BLUE}13. Testing Access Service through API Gateway${NC}"
echo "----------------------------------------"
curl -s -X POST http://localhost:3000/access/check \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "resource": "users",
    "action": "read"
  }' | jq '.'

# Test Policy Service directly
echo -e "\n${BLUE}14. Testing Policy Service directly (Port 3006)${NC}"
echo "----------------------------------------"
curl -s http://localhost:3006/health | jq '.'

# Test Policy Service through API Gateway
echo -e "\n${BLUE}15. Testing Policy Service through API Gateway${NC}"
echo "----------------------------------------"
curl -s http://localhost:3000/policy | jq '.'

# Test service health endpoints
echo -e "\n${BLUE}16. Testing All Service Health Endpoints${NC}"
echo "----------------------------------------"

echo -e "\n${GREEN}API Gateway Health:${NC}"
curl -s http://localhost:3000/ | jq '.service, .message'

echo -e "\n${GREEN}Auth Service Health:${NC}"
curl -s http://localhost:3001/health | jq '.service, .status'

echo -e "\n${GREEN}User Service Health:${NC}"
curl -s http://localhost:3002/health | jq '.service, .status'

echo -e "\n${GREEN}Role Service Health:${NC}"
curl -s http://localhost:3003/health | jq '.service, .status'

echo -e "\n${GREEN}Permission Service Health:${NC}"
curl -s http://localhost:3004/health | jq '.service, .status'

echo -e "\n${GREEN}Access Service Health:${NC}"
curl -s http://localhost:3005/health | jq '.service, .status'

echo -e "\n${GREEN}Policy Service Health:${NC}"
curl -s http://localhost:3006/health | jq '.service, .status'

echo -e "\n${BLUE}17. Testing Service Discovery${NC}"
echo "----------------------------------------"
echo "Available services:"
echo "- API Gateway: http://localhost:3000"
echo "- Auth Service: http://localhost:3001"
echo "- User Service: http://localhost:3002"
echo "- Role Service: http://localhost:3003"
echo "- Permission Service: http://localhost:3004"
echo "- Access Service: http://localhost:3005"
echo "- Policy Service: http://localhost:3006"

echo -e "\n${GREEN}✅ Complete microservices test completed!${NC}"
echo -e "\n${BLUE}To run all microservices:${NC}"
echo "1. cd microservices"
echo "2. docker-compose up"
echo "3. Or run each service individually:"
echo "   - cd microservices/api-gateway && npm run dev"
echo "   - cd microservices/auth-service && npm run dev"
echo "   - cd microservices/user-service && npm run dev"
echo "   - cd microservices/role-service && npm run dev"
echo "   - cd microservices/permission-service && npm run dev"
echo "   - cd microservices/access-service && npm run dev"
echo "   - cd microservices/policy-service && npm run dev" 