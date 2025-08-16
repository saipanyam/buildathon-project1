#!/bin/bash

# Heroku deployment script with lightweight dependencies
echo "🚀 Deploying Visual Memory Search to Heroku (Lightweight Version)"

# Ensure we're in the right directory
if [ ! -f "Procfile" ]; then
    echo "❌ Procfile not found. Please run this script from the project root."
    exit 1
fi

# Check if we're on main branch
if [ "$(git branch --show-current)" != "main" ]; then
    echo "⚠️  Warning: Not on main branch. Consider switching to main branch first."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Backup original requirements and use lightweight version
echo "📦 Using lightweight requirements for Heroku..."
cp requirements.txt requirements-backup.txt
cp backend/requirements-heroku.txt requirements.txt

# Check if changes need to be committed
if ! git diff --quiet; then
    echo "📝 Committing lightweight configuration..."
    git add .
    git commit -m "Deploy: Use lightweight dependencies for Heroku

- Replace runtime.txt with .python-version  
- Use simplified requirements without heavy ML dependencies
- Add fallback simple search service for deployment

🤖 Generated with Claude Code"
fi

# Deploy to Heroku
echo "🌍 Deploying to Heroku..."
git push heroku main

# Check deployment status
if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🔗 Your app should be available at:"
    heroku info --app $(heroku apps:info --json | jq -r .app.name) | grep "Web URL"
    echo ""
    echo "📊 Check logs with: heroku logs --tail"
    echo "🔧 Scale dynos with: heroku ps:scale web=1"
else
    echo "❌ Deployment failed. Check the logs with: heroku logs --tail"
    
    # Restore original requirements
    echo "🔄 Restoring original requirements..."
    cp requirements-backup.txt requirements.txt
    rm requirements-backup.txt
    
    exit 1
fi

# Clean up backup
rm requirements-backup.txt

echo ""
echo "🎉 Deployment complete!"
echo "💡 Note: This deployment uses lightweight dependencies without ML features."
echo "   Full ML features are available in local development."