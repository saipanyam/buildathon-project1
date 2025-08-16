#!/bin/bash

echo "Starting Visual Memory Search Yantra..."

# Check for environment file
if [ ! -f "vms-yantra.env" ]; then
    echo "⚠️  Warning: vms-yantra.env file not found!"
    echo "   Creating from example file..."
    if [ -f "vms-yantra.env.example" ]; then
        cp vms-yantra.env.example vms-yantra.env
        echo "   ✅ Created vms-yantra.env from example"
        echo "   ⚠️  Please edit vms-yantra.env and add your ANTHROPIC_API_KEY"
        echo ""
        read -p "Press Enter to continue (the app will run but won't work without API key)..."
    fi
fi

# Start backend
echo "Starting backend server..."
cd backend
python -m venv venv 2>/dev/null || true
source venv/bin/activate
pip install -r requirements.txt --quiet
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start frontend
echo "Starting frontend..."
cd ../frontend
npm install --silent
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✨ Application started successfully!"
echo "📷 Frontend: http://localhost:5173"
echo "🚀 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait