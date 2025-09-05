#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Rocket-LendPro Complete Platform Launcher${NC}"
echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}Backend: .NET 8 LTS with GraphQL API${NC}"
echo -e "${BLUE}Frontend: Next.js 15 with Apollo Client${NC}"

# Function to clean up ports
cleanup_ports() {
    echo -e "${CYAN}🧹 Cleaning up ports...${NC}"
    
    # Kill processes on port 3000 (Next.js)
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    
    # Kill processes on port 5001 (.NET API)  
    lsof -ti:5001 | xargs kill -9 2>/dev/null || true
    
    # Kill any remaining dotnet or next processes
    pkill -f "dotnet.*5001" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    
    echo -e "${GREEN}✅ Ports cleaned up${NC}"
    sleep 2
}

# Function to check prerequisites
check_prerequisites() {
    echo -e "${CYAN}🔍 Checking prerequisites...${NC}"
    
    # Check for .NET 8
    if ! command -v dotnet &> /dev/null; then
        echo -e "${RED}❌ .NET SDK not found. Please install .NET 8 SDK from https://dotnet.microsoft.com${NC}"
        exit 1
    fi
    
    DOTNET_VERSION=$(dotnet --version | cut -d. -f1)
    if [ "$DOTNET_VERSION" -lt 8 ]; then
        echo -e "${RED}❌ .NET 8+ required. Current version: $(dotnet --version)${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ .NET SDK $(dotnet --version)${NC}"
    
    # Check for Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org${NC}"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d. -f1 | sed 's/v//')
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${RED}❌ Node.js 18+ required. Current version: $(node --version)${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Node.js $(node --version)${NC}"
    
    # Check for npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm not found${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ npm $(npm --version)${NC}"
}

# Function to build and start backend
start_backend() {
    echo -e "${CYAN}🔧 Starting .NET 8 backend with GraphQL...${NC}"
    cd backend-net8/MortgagePlatform.API
    
    # Clean and restore packages
    echo -e "${YELLOW}📦 Restoring packages...${NC}"
    dotnet clean > /dev/null 2>&1
    dotnet restore > /dev/null 2>&1
    
    # Build the project
    echo -e "${YELLOW}🔨 Building project...${NC}"
    if dotnet build > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend build successful${NC}"
        
        # Start the API in background
        echo -e "${YELLOW}🌐 Starting backend API...${NC}"
        export ASPNETCORE_ENVIRONMENT=Development
        export ASPNETCORE_URLS=http://localhost:5001
        nohup dotnet run > ../../logs/backend.log 2>&1 &
        BACKEND_PID=$!
        echo $BACKEND_PID > ../../logs/.backend.pid
        
        echo -e "${GREEN}🔗 GraphQL: http://localhost:5001/graphql${NC}"
        echo -e "${GREEN}📚 Swagger: http://localhost:5001/swagger${NC}"
    else
        echo -e "${RED}❌ Backend build failed. Check logs/backend.log for details${NC}"
        exit 1
    fi
    
    cd ../..
}

# Function to start frontend
start_frontend() {
    echo -e "${CYAN}🎨 Starting Next.js frontend...${NC}"
    cd frontend-next
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
        npm install --cache /tmp/.npm > ../logs/frontend-install.log 2>&1
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Failed to install frontend dependencies. Check logs/frontend-install.log${NC}"
            exit 1
        fi
    fi
    
    # Start Next.js development server
    echo -e "${YELLOW}🚀 Starting Next.js development server...${NC}"
    nohup npm run dev > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../logs/.frontend.pid
    
    cd ..
}

# Function to wait for services
wait_for_services() {
    echo -e "${CYAN}⏳ Waiting for services to start...${NC}"
    
    # Wait for backend
    echo -e "${YELLOW}🔄 Waiting for backend API...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost:5001/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend API is ready!${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${RED}❌ Backend failed to start. Check logs/backend.log${NC}"
            cleanup_and_exit
        fi
        sleep 2
    done
    
    # Wait for frontend
    echo -e "${YELLOW}🔄 Waiting for frontend...${NC}"
    for i in {1..45}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Frontend is ready!${NC}"
            break
        fi
        if [ $i -eq 45 ]; then
            echo -e "${RED}❌ Frontend failed to start. Check logs/frontend.log${NC}"
            cleanup_and_exit
        fi
        sleep 2
    done
}

# Function to cleanup and exit
cleanup_and_exit() {
    echo -e "${YELLOW}🛑 Stopping services...${NC}"
    if [ -f "logs/.backend.pid" ]; then
        kill $(cat logs/.backend.pid) 2>/dev/null || true
        rm logs/.backend.pid
    fi
    if [ -f "logs/.frontend.pid" ]; then
        kill $(cat logs/.frontend.pid) 2>/dev/null || true  
        rm logs/.frontend.pid
    fi
    cleanup_ports
    exit 1
}

# Trap Ctrl+C to cleanup
trap cleanup_and_exit INT

# Main execution
echo -e "${BLUE}Starting complete application setup...${NC}"
echo ""

# Step 1: Check prerequisites
check_prerequisites
echo ""

# Step 2: Clean up any existing processes
cleanup_ports
echo ""

# Step 3: Start backend
start_backend
echo ""

# Step 4: Start frontend  
start_frontend
echo ""

# Step 5: Wait for services to be ready
wait_for_services
echo ""

# Step 6: Final status
echo -e "${BLUE}🎉 Rocket-LendPro Platform Ready!${NC}"
echo -e "${BLUE}=================================${NC}"
echo ""
echo -e "${GREEN}🎨 Frontend (Next.js):${NC} http://localhost:3000"
echo -e "${GREEN}🔗 GraphQL Playground:${NC} http://localhost:5001/graphql"
echo -e "${GREEN}📚 Swagger Docs:${NC} http://localhost:5001/swagger"
echo -e "${GREEN}🏥 Health Check:${NC} http://localhost:5001/health"
echo ""
echo -e "${BLUE}📊 Technologies:${NC}"
echo -e "• Backend: .NET 8 LTS with HotChocolate GraphQL"
echo -e "• Frontend: Next.js 15 with Apollo Client"
echo -e "• Database: PostgreSQL with EF Core 8"
echo ""
echo -e "${BLUE}🔑 Test Accounts:${NC}"
echo -e "• User: ${YELLOW}john.doe@email.com${NC} / ${YELLOW}user123${NC}"
echo -e "• Admin: ${YELLOW}admin@mortgageplatform.com${NC} / ${YELLOW}admin123${NC}"
echo ""
echo -e "${BLUE}📋 Log Files:${NC}"
echo -e "Backend: ${YELLOW}logs/backend.log${NC}"
echo -e "Frontend: ${YELLOW}logs/frontend.log${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Wait for user interruption
wait