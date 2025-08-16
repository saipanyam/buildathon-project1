from pydantic_settings import BaseSettings
from typing import Optional
import os
from pathlib import Path

class Settings(BaseSettings):
    ANTHROPIC_API_KEY: str = ""
    MODEL_NAME: str = "claude-3-5-sonnet-20241022"
    UPLOAD_DIR: str = "uploads"
    PROCESSED_DIR: str = "processed"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
        settings_path = Path("settings.local.json")
        if not settings_path.exists():
            settings_path = Path("settings.json")
            
        if settings_path.exists():
            import json
            with open(settings_path) as f:
                config = json.load(f)
                if "ANTHROPIC_API_KEY" in config:
                    self.ANTHROPIC_API_KEY = config["ANTHROPIC_API_KEY"]

settings = Settings()