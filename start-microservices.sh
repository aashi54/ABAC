#!/bin/bash

echo "🚀 Starting RBAC/ABAC Microservices"
echo "==================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to start a service
start_service() {
    local service_name=$1
    local service_path=$2
    local port=$3
    
    echo -e "\n${BLUE}Starting ${service_name} on port ${port}...${NC}"
    cd "$service_path"
    
    # Check if port is already in use
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}Port ${port} is already in use. Skipping ${service_name}${NC}"
        cd - > /dev/null
        return
    fi
    
    # Start service in background
    npm run dev > /dev/null 2>&1 &
    local pid=$!
    
    # Wait a moment for service to start
    sleep 2
    
    # Check if service is running
    if curl -s http://localhost:$port/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ ${service_name} started successfully on port ${port}${NC}"
    else
        echo -e "${RED}❌ Failed to start ${service_name}${NC}"
    fi
    
    cd - > /dev/null
}

# Kill any existing processes on our ports
echo -e "\n${BLUE}Cleaning up existing processes...${NC}"
pkill -f "node.*300[0-6]" 2>/dev/null || true
sleep 2

# Start services in order
start_service "API Gateway" "microservices/api-gateway" 3000
start_service "Auth Service" "microservices/auth-service" 3001
start_service "User Service" "microservices/user-service" 3002
start_service "Role Service" "microservices/role-service" 3003
start_service "Permission Service" "microservices/permission-service" 3004
start_service "Access Service" "microservices/access-service" 3005
start_service "Policy Service" "microservices/policy-service" 3006

echo -e "\n${GREEN}🎉 All microservices started!${NC}"
echo -e "\n${BLUE}Service URLs:${NC}"
echo "- API Gateway: http://localhost:3000"
echo "- Auth Service: http://localhost:3001"
echo "- User Service: http://localhost:3002"
echo "- Role Service: http://localhost:3003"
echo "- Permission Service: http://localhost:3004"
echo "- Access Service: http://localhost:3005"
echo "- Policy Service: http://localhost:3006"

echo -e "\n${BLUE}Test the services:${NC}"
echo "curl http://localhost:3000/"
echo "curl http://localhost:3001/health"
echo "curl http://localhost:3002/health"
echo "etc..."

echo -e "\n${BLUE}Or run the full test:${NC}"
echo "./test-all-microservices.sh" 