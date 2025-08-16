import anthropic
import base64
import json
from pathlib import Path
from typing import Tuple
from .prompt_manager import PromptManager

class ClaudeService:
    def __init__(self, api_key: str):
        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = "claude-3-5-sonnet-20241022"
        self.prompt_manager = PromptManager()
    
    async def analyze_screenshot(self, image_path: str) -> Tuple[str, str]:
        """Analyze a screenshot and extract OCR text and visual description"""
        
        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode()
        
        prompt = self.prompt_manager.get_current_prompt("ocr_and_visual")

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=2000,
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
            
        except Exception as e:
            print(f"Error analyzing screenshot: {str(e)}")
            print(f"Image path: {image_path}")
            # Return fallback content when API fails
            return "", f"Failed to analyze image: {Path(image_path).name}. Error: {str(e)}"
    
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