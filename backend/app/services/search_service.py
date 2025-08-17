from typing import List, Dict, Any
import json
from pathlib import Path
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from app.models import ScreenshotMetadata, SearchResult

class SearchService:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.screenshots: List[ScreenshotMetadata] = []
        self.embeddings: List[np.ndarray] = []
        self._load_existing_index()
    
    def _load_existing_index(self):
        """Load existing processed screenshots"""
        processed_dir = Path("processed")
        if processed_dir.exists():
            for json_file in processed_dir.glob("*.json"):
                try:
                    with open(json_file) as f:
                        data = json.load(f)
                        screenshot = ScreenshotMetadata(**data)
                        self.index_screenshot(screenshot)
                except Exception as e:
                    print(f"Error loading {json_file}: {e}")
    
    def index_screenshot(self, screenshot: ScreenshotMetadata):
        """Add a screenshot to the search index"""
        combined_text = f"{screenshot.ocr_text} {screenshot.visual_description}"
        embedding = self.model.encode(combined_text)
        
        screenshot.embedding = embedding.tolist()
        self.screenshots.append(screenshot)
        self.embeddings.append(embedding)
    
    def search(self, query: str, top_k: int = 50) -> List[SearchResult]:
        """Search for screenshots matching the query"""
        if not self.screenshots:
            return []
        
        query_embedding = self.model.encode(query)
        
        similarities = cosine_similarity([query_embedding], self.embeddings)[0]
        
        text_scores = self._calculate_text_match_scores(query)
        visual_scores = self._calculate_visual_match_scores(query)
        
        combined_scores = similarities * 0.5 + text_scores * 0.25 + visual_scores * 0.25
        
        top_indices = np.argsort(combined_scores)[-top_k:][::-1]
        
        results = []
        for idx in top_indices:
            if combined_scores[idx] > 0.1:
                screenshot = self.screenshots[idx]
                
                match_type = "combined"
                if text_scores[idx] > visual_scores[idx] * 1.5:
                    match_type = "text"
                elif visual_scores[idx] > text_scores[idx] * 1.5:
                    match_type = "visual"
                
                # Use evaluation confidence score if available, otherwise use search score
                if screenshot.evaluation and 'confidence_score' in screenshot.evaluation:
                    confidence_score = screenshot.evaluation['confidence_score']  # Already a ratio (0-1)
                else:
                    confidence_score = float(combined_scores[idx])  # Fallback to search score
                
                results.append(SearchResult(
                    filename=screenshot.filename,
                    file_hash=screenshot.file_hash,
                    score=confidence_score,
                    confidence_score=confidence_score,  # Set both fields
                    ocr_text=screenshot.ocr_text,  # Return full text
                    visual_description=screenshot.visual_description,  # Return full description
                    processed_at=screenshot.processed_at,
                    match_type=match_type,
                    evaluation=screenshot.evaluation
                ))
        
        return results
    
    def _calculate_text_match_scores(self, query: str) -> np.ndarray:
        """Calculate text-based matching scores"""
        query_lower = query.lower()
        scores = []
        
        for screenshot in self.screenshots:
            ocr_lower = screenshot.ocr_text.lower()
            score = 0.0
            
            if query_lower in ocr_lower:
                score = 1.0
            else:
                query_words = query_lower.split()
                matches = sum(1 for word in query_words if word in ocr_lower)
                if query_words:
                    score = matches / len(query_words)
            
            scores.append(score)
        
        return np.array(scores)
    
    def _calculate_visual_match_scores(self, query: str) -> np.ndarray:
        """Calculate visual description matching scores"""
        query_lower = query.lower()
        scores = []
        
        visual_keywords = ['button', 'color', 'blue', 'red', 'green', 'icon', 'image', 
                          'screenshot', 'window', 'dialog', 'menu', 'toolbar', 'sidebar']
        
        has_visual_intent = any(keyword in query_lower for keyword in visual_keywords)
        
        for screenshot in self.screenshots:
            desc_lower = screenshot.visual_description.lower()
            score = 0.0
            
            if has_visual_intent:
                if query_lower in desc_lower:
                    score = 1.0
                else:
                    query_words = query_lower.split()
                    matches = sum(1 for word in query_words if word in desc_lower)
                    if query_words:
                        score = matches / len(query_words)
            
            scores.append(score)
        
        return np.array(scores)
    
    def get_indexed_count(self) -> int:
        """Get the number of indexed screenshots"""
        return len(self.screenshots)
    
    def clear_index(self):
        """Clear all indexed screenshots and embeddings"""
        self.screenshots.clear()
        self.embeddings.clear()