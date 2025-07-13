#!/bin/bash

echo "🚀 Testing RBAC/ABAC Microservices via API Gateway"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local data=$3
    local description=$4
    
    echo -e "\n${BLUE}Testing: $description${NC}"
    echo "URL: $method $url"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$url" -H "Content-Type: application/json" -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$url")
    fi
    
    # Split response and status code
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ Success (HTTP $http_code)${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}❌ Failed (HTTP $http_code)${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
}

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Test API Gateway health
test_endpoint "GET" "http://localhost:3000/health" "" "API Gateway Health Check"

# Test Auth Service
test_endpoint "GET" "http://localhost:3000/auth/health" "" "Auth Service Health Check"
test_endpoint "POST" "http://localhost:3000/auth/register" '{"username":"testuser","email":"test@example.com","password":"testpass"}' "User Registration"
test_endpoint "POST" "http://localhost:3000/auth/login" '{"email":"test@example.com","password":"testpass"}' "User Login"

# Test User Service
test_endpoint "GET" "http://localhost:3000/users/health" "" "User Service Health Check"
test_endpoint "GET" "http://localhost:3000/users" "" "Get All Users"
test_endpoint "GET" "http://localhost:3000/users/1" "" "Get User by ID"

# Test Role Service
test_endpoint "GET" "http://localhost:3000/roles/health" "" "Role Service Health Check"
test_endpoint "GET" "http://localhost:3000/roles" "" "Get All Roles"
test_endpoint "GET" "http://localhost:3000/roles/1" "" "Get Role by ID"

# Test Permission Service
test_endpoint "GET" "http://localhost:3000/permissions/health" "" "Permission Service Health Check"
test_endpoint "GET" "http://localhost:3000/permissions" "" "Get All Permissions"
test_endpoint "GET" "http://localhost:3000/permissions/1" "" "Get Permission by ID"

# Test Access Service
test_endpoint "GET" "http://localhost:3000/access/health" "" "Access Service Health Check"
test_endpoint "POST" "http://localhost:3000/access/check" '{"user_id":1,"resource":"users","action":"read"}' "Check Access Permission"
test_endpoint "GET" "http://localhost:3000/access/user/1/permissions" "" "Get User Permissions"

# Test Policy Service
test_endpoint "GET" "http://localhost:3000/policy/health" "" "Policy Service Health Check"

echo -e "\n${GREEN}🎉 All tests completed!${NC}"
echo "==================================================" 