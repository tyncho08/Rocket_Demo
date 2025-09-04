#!/bin/bash

# LendPro Application Status Script
# This script checks the status of both backend and frontend services

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

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to check HTTP endpoint
check_http() {
    curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$1" 2>/dev/null
}

echo "======================================"
print_status "🔍 LendPro Application Status"
echo "======================================"
echo

# Check Backend Status
print_status "Checking Backend (Port 5003)..."
if port_in_use 5003; then
    print_success "✅ Backend service is running on port 5003"
    
    # Try to reach the API endpoint
    HTTP_CODE=$(check_http "http://localhost:5003/api")
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
        print_success "✅ Backend API is responding (HTTP $HTTP_CODE)"
    else
        print_warning "⚠️  Backend service is running but API may not be ready"
    fi
else
    print_error "❌ Backend service is not running"
fi

echo

# Check Frontend Status
print_status "Checking Frontend (Port 3000)..."
if port_in_use 3000; then
    print_success "✅ Frontend service is running on port 3000"
    
    # Try to reach the frontend
    HTTP_CODE=$(check_http "http://localhost:3000")
    if [ "$HTTP_CODE" = "200" ]; then
        print_success "✅ Frontend application is responding (HTTP $HTTP_CODE)"
    else
        print_warning "⚠️  Frontend service is running but may not be ready"
    fi
else
    print_error "❌ Frontend service is not running"
fi

echo

# Check Database Connection (if psql is available)
if command -v psql >/dev/null 2>&1; then
    print_status "Checking Database Connection..."
    # This is a simple check - you might need to adjust connection parameters
    if pg_isready -h localhost >/dev/null 2>&1; then
        print_success "✅ PostgreSQL is running and accepting connections"
    else
        print_warning "⚠️  PostgreSQL connection check failed"
    fi
else
    print_warning "⚠️  PostgreSQL client not available for connection check"
fi

echo

# Summary
print_status "Service URLs:"
if port_in_use 5003; then
    echo "  🔧 Backend API:  http://localhost:5003"
else
    echo "  ❌ Backend API:  OFFLINE"
fi

if port_in_use 3000; then
    echo "  🌐 Frontend App: http://localhost:3000"
else
    echo "  ❌ Frontend App: OFFLINE"
fi

echo
print_status "To start services: ./start-app.sh"
print_status "To stop services:  ./stop-app.sh"
echo "======================================"