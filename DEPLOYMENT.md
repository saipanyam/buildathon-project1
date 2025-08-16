# Deployment Guide - Visual Memory Search Yantra

## 🚀 Deploying to Heroku

### Prerequisites
- Heroku CLI installed (`brew install heroku/brew/heroku` on Mac)
- Heroku account created
- Git repository configured

### Method 1: Using Heroku CLI (Recommended)

#### Step 1: Create Heroku App
```bash
# Login to Heroku
heroku login

# Create a new Heroku app
heroku create vms-yantra-app

# Or use existing app
heroku git:remote -a your-app-name
```

#### Step 2: Set Environment Variables via CLI
```bash
# Set individual environment variables
heroku config:set ANTHROPIC_API_KEY="your-actual-api-key-here"
heroku config:set GITHUB_PERSONAL_ACCESS_TOKEN="your-github-pat-here"
heroku config:set APP_ENV="production"
heroku config:set APP_DEBUG="false"
heroku config:set APP_PORT="8000"
heroku config:set APP_HOST="0.0.0.0"

# Or set all at once from your local env file
heroku config:set $(cat vms-yantra.env | grep -v '^#' | xargs)

# Verify configuration
heroku config
```

### Method 2: Using Heroku Dashboard (GUI)

1. **Login to Heroku Dashboard**: https://dashboard.heroku.com
2. **Select your app**
3. **Go to Settings tab**
4. **Click "Reveal Config Vars"**
5. **Add each variable manually**:
   - Key: `ANTHROPIC_API_KEY`, Value: `your-api-key`
   - Key: `GITHUB_PERSONAL_ACCESS_TOKEN`, Value: `your-pat`
   - etc.

### Method 3: Using .env File with Heroku CLI

```bash
# Install heroku-config plugin
heroku plugins:install heroku-config

# Push local .env to Heroku
heroku config:push -f vms-yantra.env

# Or pull Heroku config to local .env
heroku config:pull
```

### Method 4: Using GitHub Actions for CI/CD

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Heroku

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "vms-yantra-app"
          heroku_email: "your-email@example.com"
        env:
          HD_ANTHROPIC_API_KEY: ${{secrets.ANTHROPIC_API_KEY}}
          HD_GITHUB_PERSONAL_ACCESS_TOKEN: ${{secrets.GITHUB_PAT}}
```

Then add secrets in GitHub:
1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add repository secrets:
   - `HEROKU_API_KEY`
   - `ANTHROPIC_API_KEY`
   - `GITHUB_PAT`

## 📦 Required Heroku Files

### 1. Procfile (for Python backend)
```procfile
web: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
```

### 2. runtime.txt (specify Python version)
```
python-3.11.5
```

### 3. requirements.txt (in root for Heroku)
```bash
# Copy backend requirements to root
cp backend/requirements.txt .
```

### 4. package.json (for Node.js frontend)
Add to root `package.json`:
```json
{
  "name": "vms-yantra",
  "scripts": {
    "build": "cd frontend && npm install && npm run build",
    "start": "cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT"
  }
}
```

## 🔒 Security Best Practices

### 1. Never Commit Secrets
- ✅ Use `.gitignore` for env files
- ✅ Use Heroku Config Vars
- ❌ Never hardcode API keys

### 2. Use Different Keys for Production
```bash
# Development (local)
ANTHROPIC_API_KEY=sk-ant-dev-xxx

# Production (Heroku)
ANTHROPIC_API_KEY=sk-ant-prod-xxx
```

### 3. Rotate Keys Regularly
```bash
# Update a config var
heroku config:set ANTHROPIC_API_KEY="new-api-key"

# Remove a config var
heroku config:unset OLD_API_KEY
```

### 4. Use Heroku Private Spaces (Enterprise)
For sensitive applications, use Heroku Private Spaces for network isolation.

## 🔧 Deployment Script

Create `deploy-heroku.sh`:

```bash
#!/bin/bash

echo "🚀 Deploying Visual Memory Search Yantra to Heroku..."

# Check if logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo "❌ Not logged in to Heroku. Running 'heroku login'..."
    heroku login
fi

# Check if app exists
APP_NAME="vms-yantra-app"
if ! heroku apps:info --app $APP_NAME &> /dev/null; then
    echo "📱 Creating Heroku app: $APP_NAME"
    heroku create $APP_NAME
fi

# Set config vars from env file
if [ -f "vms-yantra.env" ]; then
    echo "⚙️  Setting environment variables..."
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        if [[ ! "$key" =~ ^#.*$ ]] && [[ -n "$key" ]]; then
            # Remove quotes from value
            value="${value%\"}"
            value="${value#\"}"
            value="${value%\'}"
            value="${value#\'}"
            heroku config:set "$key=$value" --app $APP_NAME
        fi
    done < vms-yantra.env
else
    echo "⚠️  vms-yantra.env not found. Please configure manually."
fi

# Deploy
echo "📦 Deploying to Heroku..."
git push heroku main

echo "✅ Deployment complete!"
echo "🌐 App URL: https://$APP_NAME.herokuapp.com"
```

## 🐳 Alternative: Docker Deployment

### Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install -r requirements.txt

# Copy application
COPY backend/ ./backend/
COPY frontend/dist/ ./frontend/dist/

# Use environment variables
ENV ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
ENV PORT=${PORT:-8000}

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "$PORT"]
```

### Deploy with Docker to Heroku
```bash
# Login to Heroku Container Registry
heroku container:login

# Build and push Docker image
heroku container:push web --app vms-yantra-app

# Release the image
heroku container:release web --app vms-yantra-app
```

## 📊 Monitoring Environment Variables

### View Current Config
```bash
# List all config vars
heroku config --app vms-yantra-app

# Get specific var
heroku config:get ANTHROPIC_API_KEY --app vms-yantra-app
```

### Config History (with Heroku Add-on)
```bash
# Install config history add-on
heroku addons:create heroku-config-history --app vms-yantra-app

# View config changes
heroku addons:open heroku-config-history
```

## 🆘 Troubleshooting

### Issue: Environment variables not loading
```bash
# Check if vars are set
heroku run printenv --app vms-yantra-app

# Restart dynos to reload config
heroku restart --app vms-yantra-app
```

### Issue: API key not working
```bash
# Verify the key format (no extra quotes or spaces)
heroku config:get ANTHROPIC_API_KEY --app vms-yantra-app

# Test the key
heroku run python -c "import os; print(repr(os.getenv('ANTHROPIC_API_KEY')))" --app vms-yantra-app
```

### Issue: Port binding error
```bash
# Ensure using $PORT environment variable
# Heroku dynamically assigns ports
web: uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
```

## 📝 Summary

**Recommended Approach:**
1. Use Heroku CLI to set config vars
2. Keep `vms-yantra.env` for local development only
3. Use different API keys for dev/staging/production
4. Set up GitHub Actions for automated deployment
5. Monitor config changes with Heroku dashboard

**Security Checklist:**
- [ ] `.env` files in `.gitignore`
- [ ] Config vars set in Heroku
- [ ] No hardcoded secrets in code
- [ ] Different keys for each environment
- [ ] Regular key rotation schedule
- [ ] Access logs monitored

Remember: **Never commit API keys to Git!** Always use environment variables or secret management services.