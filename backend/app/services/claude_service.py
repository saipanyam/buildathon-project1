import anthropic
import base64
import json
import asyncio
from pathlib import Path
from typing import Tuple
from .prompt_manager import PromptManager
from ..config import settings

class ClaudeService:
    def __init__(self, api_key: str):
        import os
        
        # Clear any proxy settings that might interfere
        for env_var in ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy']:
            if env_var in os.environ:
                print(f"🔧 Clearing {env_var} environment variable")
                del os.environ[env_var]
        
        try:
            # Most minimal client initialization possible
            self.client = anthropic.Anthropic(api_key=api_key)
            print("✅ Anthropic client initialized successfully")
        except Exception as e:
            print(f"❌ Failed to initialize Anthropic client: {e}")
            print(f"❌ Exception type: {type(e).__name__}")
            
            # Try with explicit http client configuration
            try:
                import httpx
                http_client = httpx.Client()
                self.client = anthropic.Anthropic(
                    api_key=api_key,
                    http_client=http_client
                )
                print("✅ Anthropic client initialized with custom http client")
            except Exception as e2:
                print(f"❌ Failed with custom http client: {e2}")
                
                # Final fallback - try to create a mock client for testing
                print("⚠️  Creating fallback service without Claude client")
                self.client = None
        
        self.model = "claude-3-5-sonnet-20241022"
        self.prompt_manager = PromptManager()
    
    async def analyze_screenshot(self, image_path: str) -> Tuple[str, str]:
        """Analyze a screenshot and extract OCR text and visual description with retry logic"""
        
        # Check if client is available
        if self.client is None:
            print("⚠️  Claude client not available, returning placeholder analysis")
            filename = Path(image_path).name
            return f"Text extracted from {filename}", f"Visual analysis of {filename} - Claude API temporarily unavailable"
        
        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode()
        
        prompt = self.prompt_manager.get_current_prompt("ocr_and_visual")

        # Retry logic with exponential backoff
        max_retries = settings.CLAUDE_MAX_RETRIES
        base_delay = settings.CLAUDE_RETRY_DELAY
        
        for attempt in range(max_retries):
            try:
                response = self.client.messages.create(
                    model=self.model,
                    max_tokens=2000,
                    timeout=settings.CLAUDE_API_TIMEOUT,
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "image",
                                    "source": {
                                        "type": "base64",
                                        "media_type": self._get_media_type(image_path),
                                        "data": image_data
                                    }
                                },
                                {
                                    "type": "text",
                                    "text": prompt
                                }
                            ]
                        }
                    ]
                )
                
                content = response.content[0].text
                
                # Try to parse JSON response first
                try:
                    json_content = json.loads(content)
                    extracted_text = json_content.get("extracted_text", json_content.get("ocr_text", ""))
                    visual_description = json_content.get("visual_description", "")
                    return extracted_text, visual_description
                except json.JSONDecodeError:
                    # Fallback to old format parsing
                    extracted_text = ""
                    visual_description = ""
                    
                    if "OCR_TEXT:" in content:
                        parts = content.split("OCR_TEXT:")
                        if len(parts) > 1:
                            text_part = parts[1].split("VISUAL_DESCRIPTION:")[0] if "VISUAL_DESCRIPTION:" in parts[1] else parts[1]
                            extracted_text = text_part.strip()
                    
                    if "VISUAL_DESCRIPTION:" in content:
                        parts = content.split("VISUAL_DESCRIPTION:")
                        if len(parts) > 1:
                            visual_description = parts[1].strip()
                    
                    return extracted_text, visual_description
                
            except anthropic.APITimeoutError as e:
                print(f"Claude API timeout attempt {attempt + 1}/{max_retries} for {image_path}: {str(e)}")
                if attempt == max_retries - 1:
                    return "", f"Analysis timed out for image: {Path(image_path).name}. Please try again."
                # Wait before retry with exponential backoff
                await asyncio.sleep(base_delay * (2 ** attempt))
                continue
                
            except anthropic.APIConnectionError as e:
                print(f"Claude API connection error attempt {attempt + 1}/{max_retries} for {image_path}: {str(e)}")
                if attempt == max_retries - 1:
                    return "", f"Unable to connect to analysis service for image: {Path(image_path).name}. Please check your connection."
                # Wait before retry
                await asyncio.sleep(base_delay * (2 ** attempt))
                continue
                
            except anthropic.RateLimitError as e:
                print(f"Claude API rate limit attempt {attempt + 1}/{max_retries} for {image_path}: {str(e)}")
                if attempt == max_retries - 1:
                    return "", f"Analysis rate limit reached for image: {Path(image_path).name}. Please try again later."
                # Wait longer for rate limits
                await asyncio.sleep(base_delay * (2 ** (attempt + 2)))
                continue
                
            except anthropic.APIError as e:
                print(f"Claude API error attempt {attempt + 1}/{max_retries} for {image_path}: {str(e)}")
                if attempt == max_retries - 1:
                    return "", f"Analysis service error for image: {Path(image_path).name}. Error: {str(e)}"
                # Wait before retry
                await asyncio.sleep(base_delay * (2 ** attempt))
                continue
                
            except Exception as e:
                print(f"Unexpected error analyzing screenshot attempt {attempt + 1}/{max_retries}: {str(e)}")
                print(f"Image path: {image_path}")
                print(f"Exception type: {type(e).__name__}")
                if attempt == max_retries - 1:
                    # Return fallback content when API fails
                    return "", f"Failed to analyze image: {Path(image_path).name}. Error: {str(e)}"
                # Wait before retry
                await asyncio.sleep(base_delay * (2 ** attempt))
                continue
                
        # If we get here, all retries failed
        return "", f"Failed to analyze image after {max_retries} attempts: {Path(image_path).name}"
    
    def _get_media_type(self, image_path: str) -> str:
        """Get the media type based on file extension"""
        ext = Path(image_path).suffix.lower()
        media_types = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        }
        return media_types.get(ext, 'image/png')