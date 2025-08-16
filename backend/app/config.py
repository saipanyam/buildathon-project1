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
    
    # Model Settings
    MODEL_NAME: str = "claude-3-5-sonnet-20241022"
    
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
    
    # API Timeout Settings
    CLAUDE_API_TIMEOUT: float = 45.0
    CLAUDE_CLIENT_TIMEOUT: float = 60.0
    CLAUDE_MAX_RETRIES: int = 3
    CLAUDE_RETRY_DELAY: float = 1.0
    
    class Config:
        env_file = "vms-yantra.env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
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
                except Exception as e:
                    print(f"Warning: Could not load settings from {settings_path}: {e}")
        
        # Validate required settings
        if not self.ANTHROPIC_API_KEY or self.ANTHROPIC_API_KEY == "your_anthropic_api_key_here":
            print("⚠️  Warning: ANTHROPIC_API_KEY not configured!")
            print("   Please set your API key in vms-yantra.env file")

settings = Settings()