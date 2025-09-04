#!/bin/bash

# LendPro Application Startup Script
# This script starts both the .NET Core backend and Next.js frontend

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to kill processes on specific ports
kill_port() {
    if port_in_use $1; then
        print_warning "Port $1 is in use, attempting to free it..."
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Cleanup function to kill background processes on script exit
cleanup() {
    print_status "Shutting down services..."
    if [[ ! -z "$BACKEND_PID" ]]; then
        kill $BACKEND_PID 2>/dev/null || true
        print_status "Backend stopped"
    fi
    if [[ ! -z "$FRONTEND_PID" ]]; then
        kill $FRONTEND_PID 2>/dev/null || true
        print_status "Frontend stopped"
    fi
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

print_status "Starting LendPro Application..."
print_status "Project root: $PROJECT_ROOT"

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists "dotnet"; then
    print_error ".NET Core SDK is not installed. Please install .NET Core 3.1 or later."
    exit 1
fi

if ! command_exists "node"; then
    print_error "Node.js is not installed. Please install Node.js 18 or later."
    exit 1
fi

if ! command_exists "npm"; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

print_success "All prerequisites found!"

# Check if PostgreSQL is running
if ! command_exists "psql"; then
    print_warning "PostgreSQL client (psql) not found. Make sure PostgreSQL is installed and running."
else
    print_success "PostgreSQL client found!"
fi

# Kill any existing processes on our target ports
kill_port 5003  # Backend port
kill_port 3000  # Frontend port

# Start Backend (.NET Core API)
print_status "Starting .NET Core Backend..."
cd "$PROJECT_ROOT/backend/MortgagePlatform.API"

if [ ! -f "MortgagePlatform.API.csproj" ]; then
    print_error "Backend project file not found. Please make sure the backend directory exists."
    exit 1
fi

# Check if packages are restored
if [ ! -d "bin" ] || [ ! -d "obj" ]; then
    print_status "Restoring .NET packages..."
    dotnet restore
    if [ $? -ne 0 ]; then
        print_error "Failed to restore .NET packages"
        exit 1
    fi
fi

# Start backend in background
print_status "Starting backend server on http://localhost:5003..."
dotnet run --urls="http://localhost:5003" > "$PROJECT_ROOT/backend.log" 2>&1 &
BACKEND_PID=$!

# Wait for backend to start with better feedback
print_status "Waiting for backend to start..."
for i in {1..30}; do
    if port_in_use 5003; then
        # Additional check - try to reach the API
        if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 "http://localhost:5003/api" >/dev/null 2>&1; then
            break
        fi
    fi
    sleep 2
    if [ $i -eq 30 ]; then
        print_error "Backend failed to start on port 5003"
        print_error "Backend log content:"
        echo "===================="
        tail -20 "$PROJECT_ROOT/backend.log"
        echo "===================="
        print_error "Full backend log: $PROJECT_ROOT/backend.log"
        exit 1
    fi
    echo -n "."
done

print_success "Backend started successfully on http://localhost:5003"

# Start Frontend (Next.js)
print_status "Starting Next.js Frontend..."
cd "$PROJECT_ROOT/frontend"

if [ ! -f "package.json" ]; then
    print_error "Frontend package.json not found. Please make sure the frontend directory exists."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_warning "Environment file .env.local not found. Creating default configuration..."
    cat > .env.local << EOF
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
NEXT_PUBLIC_API_URL=http://localhost:5003/api
EOF
    print_success "Created .env.local with default configuration"
fi

# Start frontend in background
print_status "Starting frontend server on http://localhost:3000..."
npm run dev > "$PROJECT_ROOT/frontend.log" 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
print_status "Waiting for frontend to start..."
for i in {1..30}; do
    if port_in_use 3000; then
        break
    fi
    sleep 2
    if [ $i -eq 30 ]; then
        print_error "Frontend failed to start on port 3000"
        print_error "Check the frontend log: $PROJECT_ROOT/frontend.log"
        exit 1
    fi
done

print_success "Frontend started successfully on http://localhost:3000"

# Display startup information
echo
echo "======================================"
print_success "🚀 LendPro Application Started!"
echo "======================================"
echo
print_status "Backend API:  http://localhost:5003"
print_status "Frontend App: http://localhost:3000"
echo
print_status "Demo Accounts:"
echo "  👤 Regular User:"
echo "     Email: john.doe@email.com"
echo "     Password: user123"
echo
echo "  🔧 Admin User:"
echo "     Email: admin@mortgageplatform.com"
echo "     Password: admin123"
echo
print_status "Available Features:"
echo "  📊 Mortgage Calculator Suite"
echo "  📋 Loan Application System"
echo "  🏠 Property Search"
echo "  📈 Market Trends Dashboard"
echo "  👥 User Management (Admin)"
echo
print_status "Logs:"
echo "  Backend:  $PROJECT_ROOT/backend.log"
echo "  Frontend: $PROJECT_ROOT/frontend.log"
echo
print_warning "Press Ctrl+C to stop all services"
echo "======================================"
echo

# Keep the script running and monitor the processes
while true; do
    # Check if backend process is still running
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        print_error "Backend process has stopped unexpectedly"
        break
    fi
    
    # Check if frontend process is still running
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        print_error "Frontend process has stopped unexpectedly"
        break
    fi
    
    sleep 5
done

# If we get here, one of the processes has died
print_error "One or more services have stopped. Check the log files for details."
exit 1