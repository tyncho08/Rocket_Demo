#!/bin/bash

# LendPro Application Stop Script
# This script stops both the .NET Core backend and Next.js frontend

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

# Function to kill processes on specific ports
kill_port() {
    if port_in_use $1; then
        print_status "Stopping services on port $1..."
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        sleep 2
        if port_in_use $1; then
            print_warning "Some processes on port $1 may still be running"
        else
            print_success "Port $1 freed successfully"
        fi
    else
        print_status "No services running on port $1"
    fi
}

print_status "Stopping LendPro Application..."

# Stop backend (port 5003)
print_status "Stopping backend services..."
kill_port 5003

# Stop frontend (port 3000)
print_status "Stopping frontend services..."
kill_port 3000

# Also kill any dotnet processes that might be running the MortgagePlatform.API
pkill -f "MortgagePlatform.API" 2>/dev/null || true

# Kill any node processes running Next.js
pkill -f "next-server" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true

print_success "🛑 LendPro Application stopped!"
print_status "All services have been shut down."