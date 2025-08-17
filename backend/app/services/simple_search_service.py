"""
Lightweight search service for Heroku deployment
Uses simple text matching instead of vector embeddings
"""
from typing import List, Optional
import re
from app.models import SearchResult, ScreenshotMetadata
import difflib


class SimpleSearchService:
    """Simple text-based search service without ML dependencies"""
    
    def __init__(self):
        self.screenshots: List[ScreenshotMetadata] = []
    
    def index_screenshot(self, metadata: ScreenshotMetadata):
        """Add screenshot to search index"""
        # Remove any existing entry with same hash
        self.screenshots = [s for s in self.screenshots if s.file_hash != metadata.file_hash]
        self.screenshots.append(metadata)
    
    def search(self, query: str, top_k: int = 5) -> List[SearchResult]:
        """Simple text-based search"""
        if not query.strip():
            # Return all screenshots when no query provided
            results = []
            for screenshot in self.screenshots:
                # Use evaluation confidence score if available, otherwise use search score
                if screenshot.evaluation and 'confidence_score' in screenshot.evaluation:
                    confidence_score = screenshot.evaluation['confidence_score']  # Already a ratio (0-1)
                else:
                    confidence_score = 1.0  # Give all results max score when no search
                    
                result = SearchResult(
                    filename=screenshot.filename,
                    file_hash=screenshot.file_hash,
                    ocr_text=screenshot.ocr_text,
                    visual_description=screenshot.visual_description,
                    score=confidence_score,
                    confidence_score=confidence_score,
                    processed_at=screenshot.processed_at,
                    evaluation=screenshot.evaluation
                )
                results.append(result)
            # Sort by processed time (newest first)
            results.sort(key=lambda x: x.processed_at, reverse=True)
            return results
        
        query_lower = query.lower().strip()
        results = []
        
        for screenshot in self.screenshots:
            score = self._calculate_simple_score(query_lower, screenshot)
            
            if score > 0:
                # Use evaluation confidence score if available, otherwise use search score
                if screenshot.evaluation and 'confidence_score' in screenshot.evaluation:
                    confidence_score = screenshot.evaluation['confidence_score']  # Already a ratio (0-1)
                else:
                    confidence_score = score  # Use search score as fallback
                    
                result = SearchResult(
                    filename=screenshot.filename,
                    file_hash=screenshot.file_hash,
                    ocr_text=screenshot.ocr_text,
                    visual_description=screenshot.visual_description,
                    score=score,
                    confidence_score=confidence_score,
                    processed_at=screenshot.processed_at,
                    evaluation=screenshot.evaluation
                )
                results.append(result)
        
        # Sort by score descending
        results.sort(key=lambda x: x.score, reverse=True)
        return results[:top_k]
    
    def _calculate_simple_score(self, query: str, screenshot: ScreenshotMetadata) -> float:
        """Calculate simple text matching score"""
        ocr_text = (screenshot.ocr_text or "").lower()
        visual_desc = (screenshot.visual_description or "").lower()
        
        # Exact match bonus
        exact_score = 0
        if query in ocr_text:
            exact_score += 1.0
        if query in visual_desc:
            exact_score += 0.8
        
        # Word match scoring
        query_words = query.split()
        word_score = 0
        
        for word in query_words:
            if len(word) < 3:  # Skip short words
                continue
                
            # OCR text word matches
            if word in ocr_text:
                word_score += 0.6
            elif any(word in text_word for text_word in ocr_text.split()):
                word_score += 0.3
            
            # Visual description word matches  
            if word in visual_desc:
                word_score += 0.4
            elif any(word in desc_word for desc_word in visual_desc.split()):
                word_score += 0.2
        
        # Fuzzy matching for typos
        fuzzy_score = 0
        if len(query) > 3:
            # Use difflib for approximate matching
            ocr_similarity = difflib.SequenceMatcher(None, query, ocr_text).ratio()
            desc_similarity = difflib.SequenceMatcher(None, query, visual_desc).ratio()
            
            if ocr_similarity > 0.6:
                fuzzy_score += ocr_similarity * 0.3
            if desc_similarity > 0.6:
                fuzzy_score += desc_similarity * 0.2
        
        total_score = exact_score + (word_score / max(1, len(query_words))) + fuzzy_score
        return min(1.0, total_score)  # Cap at 1.0
    
    def get_indexed_count(self) -> int:
        """Get number of indexed screenshots"""
        return len(self.screenshots)
    
    def clear_index(self):
        """Clear all indexed screenshots"""
        self.screenshots.clear()