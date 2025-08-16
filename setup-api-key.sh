#!/bin/bash

echo "🔑 Visual Memory Search Yantra - API Key Setup"
echo "=============================================="
echo ""

# Check if vms-yantra.env exists
if [ ! -f "vms-yantra.env" ]; then
    echo "📁 Creating vms-yantra.env from example..."
    cp vms-yantra.env.example vms-yantra.env
fi

echo "🔍 Current API key status:"
if grep -q "your_anthropic_api_key_here" vms-yantra.env; then
    echo "❌ Placeholder API key detected in vms-yantra.env"
else
    echo "✅ Real API key appears to be set in vms-yantra.env"
fi

if [ -f "backend/settings.local.json" ]; then
    if grep -q "YOUR_ANTHROPIC_API_KEY_HERE" backend/settings.local.json; then
        echo "❌ Placeholder API key detected in backend/settings.local.json"
    else
        echo "✅ Real API key appears to be set in backend/settings.local.json"
    fi
fi

echo ""
echo "📝 To fix the API key issue, you need to:"
echo "   1. Get your Anthropic API key from: https://console.anthropic.com/"
echo "   2. Replace the placeholder in vms-yantra.env"
echo ""

read -p "🔑 Do you want to enter your Anthropic API key now? (y/N): " SETUP_KEY

if [[ $SETUP_KEY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🔐 Enter your Anthropic API key (it will not be shown):"
    read -s API_KEY
    
    if [[ $API_KEY == sk-ant-* ]]; then
        echo ""
        echo "✅ API key format looks correct"
        
        # Update vms-yantra.env
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/ANTHROPIC_API_KEY=.*/ANTHROPIC_API_KEY=$API_KEY/" vms-yantra.env
        else
            # Linux
            sed -i "s/ANTHROPIC_API_KEY=.*/ANTHROPIC_API_KEY=$API_KEY/" vms-yantra.env
        fi
        
        # Also update settings.local.json for backward compatibility
        cat > backend/settings.local.json << EOF
{
  "ANTHROPIC_API_KEY": "$API_KEY"
}
EOF
        
        echo "✅ API key saved to vms-yantra.env and backend/settings.local.json"
        echo ""
        echo "🔄 Please restart the backend server:"
        echo "   1. Stop the current server (Ctrl+C)"
        echo "   2. Run: cd backend && uvicorn main:app --reload"
        echo "   3. Or use: ./start.sh"
        
    else
        echo ""
        echo "❌ API key format doesn't look correct. Anthropic keys start with 'sk-ant-'"
        echo "   Please check your key and try again."
    fi
else
    echo ""
    echo "📝 Manual setup instructions:"
    echo "   1. Edit vms-yantra.env"
    echo "   2. Replace 'your_anthropic_api_key_here' with your actual key"
    echo "   3. Restart the backend server"
fi

echo ""
echo "🔍 To verify the setup works:"
echo "   1. Upload a screenshot in the web interface"
echo "   2. Check for extraction results"
echo "   3. Look for any authentication errors in the console"