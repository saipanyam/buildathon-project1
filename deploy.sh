#!/bin/bash

# Visual Memory Search Yantra - Deployment Script
# Only deploys if all tests pass

set -e  # Exit on any error

echo "🚀 Starting deployment process for Visual Memory Search Yantra..."
echo "=================================================================="

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

# Function to check if a service is running
check_service() {
    local port=$1
    local service_name=$2
    
    if curl -s -f "http://localhost:$port" > /dev/null 2>&1; then
        print_success "$service_name is running on port $port"
        return 0
    else
        print_error "$service_name is not running on port $port"
        return 1
    fi
}

# Function to run tests and check results
run_tests() {
    local test_type=$1
    local test_dir=$2
    local test_command=$3
    
    print_status "Running $test_type tests..."
    
    cd "$test_dir"
    
    # Run tests and capture exit code
    if eval "$test_command"; then
        print_success "$test_type tests passed!"
        cd - > /dev/null
        return 0
    else
        print_error "$test_type tests failed!"
        cd - > /dev/null
        return 1
    fi
}

# Function to install dependencies
install_dependencies() {
    local dir=$1
    local package_manager=$2
    
    print_status "Installing dependencies in $dir..."
    cd "$dir"
    
    if [ "$package_manager" = "npm" ]; then
        npm install
    elif [ "$package_manager" = "pip" ]; then
        pip install -r requirements.txt
        if [ -f "test_requirements.txt" ]; then
            pip install -r test_requirements.txt
        fi
    fi
    
    cd - > /dev/null
}

# Check if we're in the project root
if [ ! -f "CLAUDE.md" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Project root confirmed"

# Check prerequisites
print_status "Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    print_error "Python is not installed"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

print_success "Prerequisites check passed"

# Install dependencies
print_status "Installing dependencies..."

# Backend dependencies
if [ -d "backend" ]; then
    install_dependencies "backend" "pip"
fi

# Frontend dependencies
if [ -d "frontend" ]; then
    install_dependencies "frontend" "npm"
fi

# Test dashboard dependencies
if [ -d "test-dashboard" ]; then
    install_dependencies "test-dashboard" "npm"
fi

print_success "Dependencies installed"

# Start services for testing
print_status "Starting services for testing..."

# Start backend
print_status "Starting backend service..."
cd backend
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
fi

# Start backend in background
python -m uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd - > /dev/null

# Wait for backend to start
sleep 5

# Check if backend started successfully
if ! check_service 8000 "Backend API"; then
    print_error "Failed to start backend service"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Run backend tests
print_status "Running backend tests..."
if ! run_tests "Backend" "backend" "python -m pytest test_main.py -v --tb=short"; then
    print_error "Backend tests failed - deployment aborted"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Build and test frontend
print_status "Building and testing frontend..."
cd frontend

# Run frontend tests
if ! npm test -- --watchAll=false --coverage; then
    print_error "Frontend tests failed - deployment aborted"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Build frontend
if ! npm run build; then
    print_error "Frontend build failed - deployment aborted"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

cd - > /dev/null

print_success "All tests passed! ✅"

# Build test dashboard
print_status "Building test dashboard..."
cd test-dashboard
if ! npm run build; then
    print_warning "Test dashboard build failed, but continuing with deployment"
fi
cd - > /dev/null

# Stop test services
print_status "Stopping test services..."
kill $BACKEND_PID 2>/dev/null || true

# Wait a moment for services to stop
sleep 2

# Production deployment
print_status "Starting production deployment..."

# Start backend in production mode
print_status "Starting backend in production mode..."
cd backend
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
fi

# Start backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd - > /dev/null

# Start frontend
print_status "Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd - > /dev/null

# Start test dashboard
print_status "Starting test dashboard..."
cd test-dashboard
npm run dev &
DASHBOARD_PID=$!
cd - > /dev/null

# Wait for services to start
sleep 10

# Verify all services are running
print_status "Verifying services..."

SERVICES_OK=true

if ! check_service 8000 "Backend API"; then
    SERVICES_OK=false
fi

if ! check_service 3000 "Frontend"; then
    SERVICES_OK=false
fi

if ! check_service 3001 "Test Dashboard"; then
    SERVICES_OK=false
fi

if [ "$SERVICES_OK" = true ]; then
    print_success "🎉 Deployment successful!"
    echo ""
    echo "Services are running:"
    echo "  📊 Main App:       http://localhost:3000"
    echo "  🔧 Backend API:    http://localhost:8000"
    echo "  📈 Test Dashboard: http://localhost:3001"
    echo ""
    echo "To stop all services, run: ./stop.sh"
    echo ""
    
    # Save PIDs for stopping later
    echo $BACKEND_PID > .backend.pid
    echo $FRONTEND_PID > .frontend.pid  
    echo $DASHBOARD_PID > .dashboard.pid
    
    print_success "Deployment completed successfully! 🚀"
else
    print_error "Some services failed to start properly"
    
    # Cleanup on failure
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    kill $DASHBOARD_PID 2>/dev/null || true
    
    exit 1
fi