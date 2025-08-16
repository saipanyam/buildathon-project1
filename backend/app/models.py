from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any

class SearchQuery(BaseModel):
    query: str
    
class ScreenshotMetadata(BaseModel):
    filename: str
    file_hash: str
    ocr_text: str
    visual_description: str
    processed_at: datetime
    embedding: Optional[List[float]] = None
    evaluation: Optional[Dict[str, Any]] = None
    
class SearchResult(BaseModel):
    filename: str
    file_hash: str
    confidence_score: float
    ocr_text: str
    visual_description: str
    match_type: str  # "text", "visual", or "combined"
    evaluation: Optional[Dict[str, Any]] = None