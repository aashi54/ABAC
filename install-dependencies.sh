#!/bin/bash

echo "📦 Installing Dependencies for All Microservices"
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to install dependencies for a service
install_service_deps() {
    local service_name=$1
    local service_path=$2
    
    echo -e "\n${BLUE}Installing dependencies for ${service_name}...${NC}"
    cd "$service_path"
    
    if [ -f "package.json" ]; then
        npm install
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ ${service_name} dependencies installed successfully${NC}"
        else
            echo -e "${RED}❌ Failed to install ${service_name} dependencies${NC}"
        fi
    else
        echo -e "${RED}❌ package.json not found in ${service_name}${NC}"
    fi
    
    cd - > /dev/null
}

# Install dependencies for each service
install_service_deps "API Gateway" "microservices/api-gateway"
install_service_deps "Auth Service" "microservices/auth-service"
install_service_deps "User Service" "microservices/user-service"
install_service_deps "Role Service" "microservices/role-service"
install_service_deps "Permission Service" "microservices/permission-service"
install_service_deps "Access Service" "microservices/access-service"
install_service_deps "Policy Service" "microservices/policy-service"

echo -e "\n${GREEN}🎉 All dependencies installation completed!${NC}"
echo -e "\n${BLUE}Next steps:${NC}"
echo "1. Start all services: cd microservices && docker-compose up"
echo "2. Or start individually:"
echo "   - cd microservices/api-gateway && npm run dev"
echo "   - cd microservices/auth-service && npm run dev"
echo "   - etc..."
echo "3. Test the services: ./test-all-microservices.sh" 