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
        
        self.model = settings.MODEL_NAME  # Use configured model for optimal extraction
        self.prompt_manager = PromptManager()
        print(f"🤖 Claude service initialized with model: {self.model}")
    
    async def analyze_screenshot(self, image_path: str) -> Tuple[str, str]:
        """Analyze a screenshot and extract OCR text and visual description with retry logic"""
        
        # Check if client is available
        if self.client is None:
            print("⚠️  Claude client not available, returning placeholder analysis")
            filename = Path(image_path).name
            return f"Text extracted from {filename}", f"Visual analysis of {filename} - Claude API temporarily unavailable"
        
        try:
            with open(image_path, "rb") as f:
                image_content = f.read()
                image_data = base64.b64encode(image_content).decode()
                print(f"Image processing: path={image_path}, size={len(image_content)} bytes, base64_size={len(image_data)}")
        except Exception as e:
            print(f"Error reading image file {image_path}: {e}")
            return "", f"Failed to read image file: {Path(image_path).name}"
        
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
                print(f"Claude API raw response length: {len(content)}")
                print(f"Claude API raw response preview: {content[:200]}...")
                
                # Try to parse JSON response first
                try:
                    # Clean the content to handle markdown code blocks or extra text
                    cleaned_content = content.strip()
                    
                    # Remove markdown code blocks if present
                    if "```json" in cleaned_content:
                        # Extract JSON from markdown code block
                        start = cleaned_content.find("```json") + 7
                        end = cleaned_content.find("```", start)
                        if end != -1:
                            cleaned_content = cleaned_content[start:end].strip()
                    elif "```" in cleaned_content:
                        # Handle generic code blocks
                        start = cleaned_content.find("```") + 3
                        end = cleaned_content.find("```", start)
                        if end != -1:
                            cleaned_content = cleaned_content[start:end].strip()
                    
                    # Try to find JSON object in the content
                    if not cleaned_content.startswith("{"):
                        # Look for the first { and last }
                        start_pos = cleaned_content.find("{")
                        end_pos = cleaned_content.rfind("}")
                        if start_pos != -1 and end_pos != -1 and end_pos > start_pos:
                            cleaned_content = cleaned_content[start_pos:end_pos+1]
                    
                    json_content = json.loads(cleaned_content)
                    extracted_text = json_content.get("extracted_text", json_content.get("ocr_text", ""))
                    visual_description = json_content.get("visual_description", "")
                    
                    # Ensure we're getting strings, not nested objects
                    if isinstance(visual_description, dict):
                        visual_description = str(visual_description)
                    if isinstance(extracted_text, dict):
                        extracted_text = str(extracted_text)
                    
                    # Clean field names from the beginning of values if they appear
                    if extracted_text.lower().startswith("extracted_text:"):
                        extracted_text = extracted_text[15:].strip()
                    elif extracted_text.lower().startswith("ocr_text:"):
                        extracted_text = extracted_text[9:].strip()
                    elif extracted_text.lower().startswith("text:"):
                        extracted_text = extracted_text[5:].strip()
                    
                    if visual_description.lower().startswith("visual_description:"):
                        visual_description = visual_description[19:].strip()
                    elif visual_description.lower().startswith("description:"):
                        visual_description = visual_description[12:].strip()
                    
                    print(f"JSON parsing successful: OCR={len(extracted_text)}, Visual={len(visual_description)}")
                    return extracted_text, visual_description
                except json.JSONDecodeError as e:
                    print(f"JSON parsing failed: {e}")
                    print(f"Raw content preview: {content[:500]}...")
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
                    
                    # Also handle "extracted_text:" patterns in fallback parsing
                    if "extracted_text:" in content.lower():
                        parts = content.lower().split("extracted_text:")
                        if len(parts) > 1:
                            text_part = parts[1].split("visual_description:")[0] if "visual_description:" in parts[1] else parts[1]
                            extracted_text = text_part.strip()
                    
                    if "visual_description:" in content.lower():
                        parts = content.lower().split("visual_description:")
                        if len(parts) > 1:
                            visual_description = parts[1].strip()
                    
                    # Clean any remaining field prefixes from extracted values
                    if extracted_text.lower().startswith("extracted_text:"):
                        extracted_text = extracted_text[15:].strip()
                    elif extracted_text.lower().startswith("ocr_text:"):
                        extracted_text = extracted_text[9:].strip()
                    elif extracted_text.lower().startswith("text:"):
                        extracted_text = extracted_text[5:].strip()
                    
                    if visual_description.lower().startswith("visual_description:"):
                        visual_description = visual_description[19:].strip()
                    elif visual_description.lower().startswith("description:"):
                        visual_description = visual_description[12:].strip()
                    
                    # If still empty, try more flexible parsing
                    if not extracted_text and not visual_description:
                        print("Fallback parsing also failed, trying flexible approach...")
                        # Look for any substantial text content
                        lines = content.strip().split('\n')
                        substantial_lines = [line.strip() for line in lines if len(line.strip()) > 10]
                        if substantial_lines:
                            # Try to identify which lines are text vs description
                            text_lines = []
                            desc_lines = []
                            
                            for line in substantial_lines:
                                # If line looks like extracted text (short, factual)
                                if any(keyword in line.lower() for keyword in ['text:', 'ocr:', 'extracted:', 'content:']):
                                    cleaned_line = line.split(':', 1)[-1].strip()
                                    text_lines.append(cleaned_line)
                                # If line looks like description (longer, descriptive)
                                elif any(keyword in line.lower() for keyword in ['description:', 'visual:', 'image:', 'shows:', 'displays:']):
                                    cleaned_line = line.split(':', 1)[-1].strip()
                                    desc_lines.append(cleaned_line)
                                # Default: treat as description if longer than 50 chars, otherwise as text
                                elif len(line) > 50:
                                    desc_lines.append(line)
                                else:
                                    text_lines.append(line)
                            
                            extracted_text = ' '.join(text_lines) if text_lines else ""
                            visual_description = ' '.join(desc_lines) if desc_lines else ' '.join(substantial_lines[:2])
                            
                            # Final cleaning of any remaining field prefixes
                            if extracted_text.lower().startswith("extracted_text:"):
                                extracted_text = extracted_text[15:].strip()
                            elif extracted_text.lower().startswith("ocr_text:"):
                                extracted_text = extracted_text[9:].strip()
                            elif extracted_text.lower().startswith("text:"):
                                extracted_text = extracted_text[5:].strip()
                            
                            if visual_description.lower().startswith("visual_description:"):
                                visual_description = visual_description[19:].strip()
                            elif visual_description.lower().startswith("description:"):
                                visual_description = visual_description[12:].strip()
                            print(f"Flexible parsing result: OCR={len(extracted_text)}, Visual={len(visual_description)}")
                    
                    print(f"Fallback parsing result: OCR={len(extracted_text)}, Visual={len(visual_description)}")
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