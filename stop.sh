#!/bin/bash

# Visual Memory Search Yantra - Stop Script
# Stops all running services

set -e

echo "🛑 Stopping Visual Memory Search Yantra services..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to stop a service by PID file
stop_service() {
    local service_name=$1
    local pid_file=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            print_status "Stopping $service_name (PID: $pid)..."
            kill "$pid"
            rm "$pid_file"
            print_success "$service_name stopped"
        else
            print_warning "$service_name was not running"
            rm "$pid_file"
        fi
    else
        print_warning "No PID file found for $service_name"
    fi
}

# Stop services using PID files
stop_service "Backend" ".backend.pid"
stop_service "Frontend" ".frontend.pid"
stop_service "Test Dashboard" ".dashboard.pid"

# Also try to stop by port (backup method)
print_status "Checking for any remaining processes..."

# Kill processes on specific ports
for port in 8000 3000 3001; do
    local pid=$(lsof -ti:$port 2>/dev/null || true)
    if [ -n "$pid" ]; then
        print_status "Stopping process on port $port (PID: $pid)..."
        kill $pid 2>/dev/null || true
    fi
done

print_success "All services stopped! 🛑"