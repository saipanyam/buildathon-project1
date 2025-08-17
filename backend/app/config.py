from pydantic_settings import BaseSettings
from typing import Optional
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from multiple possible locations
env_paths = [
    Path(__file__).parent.parent.parent / "vms-yantra.env",  # Root of project
    Path(__file__).parent.parent / "vms-yantra.env",        # Backend directory  
    Path.cwd() / "vms-yantra.env",                         # Current working directory
    Path.cwd() / "../vms-yantra.env",                      # Parent of current directory
]

env_loaded = False
for env_path in env_paths:
    if env_path.exists():
        load_dotenv(env_path, override=True)
        env_loaded = True
        break

if not env_loaded:
    # Try loading from standard .env if vms-yantra.env doesn't exist
    load_dotenv()

class Settings(BaseSettings):
    # API Keys
    ANTHROPIC_API_KEY: str = ""
    GITHUB_PERSONAL_ACCESS_TOKEN: Optional[str] = None
    
    # Model Settings - Use Claude 3.5 Sonnet for faster processing in production  
    MODEL_NAME: str = "claude-3-5-sonnet-20241022"  # Faster than Opus, still excellent quality
    
    # Environment-specific model selection
    def get_model_name(self) -> str:
        """Get model name based on environment - faster models for production"""
        if os.environ.get('HEROKU_APP_NAME') or self.APP_ENV == 'production':
            return "claude-3-5-sonnet-20241022"  # Fastest for production
        return self.MODEL_NAME
    
    # Application Settings
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_PORT: int = 8000
    APP_HOST: str = "0.0.0.0"
    
    # Heroku compatibility
    PORT: Optional[int] = None  # Heroku sets this
    
    # Directory Settings
    UPLOAD_DIR: str = "uploads"
    PROCESSED_DIR: str = "processed"
    
    # Upload Settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    MAX_UPLOAD_SIZE_MB: int = 10
    ALLOWED_EXTENSIONS: str = "png,jpg,jpeg,gif,webp,bmp"
    
    # Search Settings
    SEARCH_MIN_SCORE: float = 0.3
    SEARCH_MAX_RESULTS: int = 50
    
    # API Timeout Settings - Reduced for Heroku H12 timeout prevention
    CLAUDE_API_TIMEOUT: float = 20.0  # Reduced from 45s to avoid Heroku timeouts
    CLAUDE_CLIENT_TIMEOUT: float = 25.0  # Reduced from 60s
    CLAUDE_MAX_RETRIES: int = 3
    CLAUDE_RETRY_DELAY: float = 1.0
    
    class Config:
        env_file = "vms-yantra.env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
        # Debug environment variable access
        print(f"🔍 Environment variables check:")
        print(f"   - ANTHROPIC_API_KEY in os.environ: {'ANTHROPIC_API_KEY' in os.environ}")
        print(f"   - ANTHROPIC_API_KEY value: {os.environ.get('ANTHROPIC_API_KEY', 'NOT_SET')[:20]}...")
        print(f"   - Current self.ANTHROPIC_API_KEY: {self.ANTHROPIC_API_KEY[:20] if self.ANTHROPIC_API_KEY else 'EMPTY'}...")
        
        # Explicitly check environment variable first (Heroku Config Vars)
        env_api_key = os.environ.get('ANTHROPIC_API_KEY')
        if env_api_key and not self.ANTHROPIC_API_KEY:
            self.ANTHROPIC_API_KEY = env_api_key
            print(f"✅ Loaded API key from environment variable")
        
        # Handle Heroku PORT environment variable
        if not self.PORT and os.environ.get('PORT'):
            self.PORT = int(os.environ.get('PORT'))
        
        # Fallback to settings.local.json for backwards compatibility
        if not self.ANTHROPIC_API_KEY:
            settings_path = Path("settings.local.json")
            if not settings_path.exists():
                settings_path = Path("settings.json")
                
            if settings_path.exists():
                import json
                try:
                    with open(settings_path) as f:
                        config = json.load(f)
                        if "ANTHROPIC_API_KEY" in config and config["ANTHROPIC_API_KEY"]:
                            self.ANTHROPIC_API_KEY = config["ANTHROPIC_API_KEY"]
                            print(f"✅ Loaded API key from {settings_path}")
                except Exception as e:
                    print(f"Warning: Could not load settings from {settings_path}: {e}")
        
        # Validate required settings (but allow empty API key for basic startup)
        if not self.ANTHROPIC_API_KEY or self.ANTHROPIC_API_KEY == "your_anthropic_api_key_here":
            print("⚠️  Warning: ANTHROPIC_API_KEY not configured!")
            print("   Some features may not work without a valid API key")
        else:
            print(f"✅ API key configured successfully (length: {len(self.ANTHROPIC_API_KEY)})")

settings = Settings()