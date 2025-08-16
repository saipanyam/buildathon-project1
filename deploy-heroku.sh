#!/bin/bash

echo "🚀 Deploying Visual Memory Search Yantra to Heroku..."

# Check if logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo "❌ Not logged in to Heroku. Running 'heroku login'..."
    heroku login
fi

# Get app name from user or use default
read -p "Enter Heroku app name (or press Enter for 'vms-yantra-app'): " APP_NAME
APP_NAME=${APP_NAME:-vms-yantra-app}

# Check if app exists
if ! heroku apps:info --app $APP_NAME &> /dev/null; then
    echo "📱 Creating Heroku app: $APP_NAME"
    heroku create $APP_NAME
fi

# Set git remote
heroku git:remote -a $APP_NAME

# Set config vars from env file
if [ -f "vms-yantra.env" ]; then
    echo "⚙️  Setting environment variables from vms-yantra.env..."
    
    # Read and set each variable
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        if [[ ! "$key" =~ ^#.*$ ]] && [[ -n "$key" ]] && [[ -n "$value" ]]; then
            # Remove quotes from value
            value="${value%\"}"
            value="${value#\"}"
            value="${value%\'}"
            value="${value#\'}"
            
            # Skip placeholder values
            if [[ "$value" != *"your_"* ]] && [[ "$value" != *"_here"* ]]; then
                echo "  Setting $key..."
                heroku config:set "$key=$value" --app $APP_NAME
            else
                echo "  ⚠️  Skipping $key (placeholder value detected)"
            fi
        fi
    done < vms-yantra.env
    
    # Set production-specific overrides
    echo "  Setting production overrides..."
    heroku config:set APP_ENV="production" --app $APP_NAME
    heroku config:set APP_DEBUG="false" --app $APP_NAME
    
else
    echo "⚠️  vms-yantra.env not found."
    echo "   Please create it from vms-yantra.env.example and configure your API keys."
    echo "   Or set variables manually: heroku config:set ANTHROPIC_API_KEY=your-key"
    exit 1
fi

# Show current config (without revealing values)
echo ""
echo "📋 Current config vars:"
heroku config --app $APP_NAME

# Confirm deployment
echo ""
read -p "Deploy to Heroku now? (y/N): " CONFIRM
if [[ $CONFIRM =~ ^[Yy]$ ]]; then
    echo "📦 Deploying to Heroku..."
    git push heroku main
    
    echo ""
    echo "✅ Deployment complete!"
    echo "🌐 App URL: https://$APP_NAME.herokuapp.com"
    echo "📊 Logs: heroku logs --tail --app $APP_NAME"
    echo "⚙️  Config: heroku config --app $APP_NAME"
else
    echo "❌ Deployment cancelled."
    echo "   To deploy later, run: git push heroku main"
fi