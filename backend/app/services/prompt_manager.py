import json
from pathlib import Path
from typing import Dict, Any
from datetime import datetime

class PromptManager:
    def __init__(self):
        self.prompts_file = Path("prompts.json")
        self.default_prompts = {
            "ocr_and_visual": {
                "prompt": """Analyze this screenshot and provide a JSON response with the following structure:

{
  "extracted_text": "Extract ALL visible text from the image, preserving the exact wording",
  "visual_description": "Describe what this image shows - the content, purpose, and context. Focus on what the user would see and understand from this image, not the styling or colors."
}

For the visual description, focus on:
- What type of content/interface this is (document, website, app, etc.)
- What the main content or purpose appears to be
- Key information or data being displayed
- What actions or interactions are available
- Overall context and meaning

Be thorough and accurate. Return only valid JSON.""",
                "version": "1.0",
                "created_at": datetime.now().isoformat(),
                "quality_scores": []
            }
        }
        self._load_prompts()
    
    def _load_prompts(self):
        """Load prompts from file or create default"""
        if self.prompts_file.exists():
            try:
                with open(self.prompts_file, 'r') as f:
                    self.prompts = json.load(f)
            except Exception as e:
                print(f"Error loading prompts: {e}")
                self.prompts = self.default_prompts
        else:
            self.prompts = self.default_prompts
            self._save_prompts()
    
    def _save_prompts(self):
        """Save prompts to file"""
        with open(self.prompts_file, 'w') as f:
            json.dump(self.prompts, f, indent=2, default=str)
    
    def get_current_prompt(self, prompt_type: str = "ocr_and_visual") -> str:
        """Get the current prompt for a given type"""
        return self.prompts.get(prompt_type, {}).get("prompt", self.default_prompts[prompt_type]["prompt"])
    
    def update_prompt(self, prompt_type: str, new_prompt: str, quality_score: float = None) -> Dict[str, Any]:
        """Update a prompt and track its performance"""
        old_prompt = self.get_current_prompt(prompt_type)
        
        # Create new version
        new_version = len(self.prompts.get(prompt_type, {}).get("versions", [])) + 1
        
        if prompt_type not in self.prompts:
            self.prompts[prompt_type] = {
                "prompt": new_prompt,
                "version": f"{new_version}.0",
                "created_at": datetime.now().isoformat(),
                "quality_scores": [],
                "versions": []
            }
        else:
            # Archive current version
            current_data = self.prompts[prompt_type].copy()
            if "versions" not in self.prompts[prompt_type]:
                self.prompts[prompt_type]["versions"] = []
            
            self.prompts[prompt_type]["versions"].append({
                "version": current_data.get("version", "1.0"),
                "prompt": current_data.get("prompt", ""),
                "created_at": current_data.get("created_at", ""),
                "quality_scores": current_data.get("quality_scores", []),
                "archived_at": datetime.now().isoformat()
            })
            
            # Update current
            self.prompts[prompt_type].update({
                "prompt": new_prompt,
                "version": f"{new_version}.0",
                "created_at": datetime.now().isoformat(),
                "quality_scores": [quality_score] if quality_score else []
            })
        
        self._save_prompts()
        
        return {
            "old_prompt": old_prompt,
            "new_prompt": new_prompt,
            "version": self.prompts[prompt_type]["version"],
            "success": True
        }
    
    def add_quality_score(self, prompt_type: str, score: float, metadata: Dict[str, Any] = None):
        """Add a quality score for the current prompt version"""
        if prompt_type in self.prompts:
            score_entry = {
                "score": score,
                "timestamp": datetime.now().isoformat(),
                "metadata": metadata or {}
            }
            
            if "quality_scores" not in self.prompts[prompt_type]:
                self.prompts[prompt_type]["quality_scores"] = []
            
            self.prompts[prompt_type]["quality_scores"].append(score_entry)
            self._save_prompts()
    
    def get_prompt_performance(self, prompt_type: str = "ocr_and_visual") -> Dict[str, Any]:
        """Get performance statistics for a prompt"""
        if prompt_type not in self.prompts:
            return {"error": "Prompt type not found"}
        
        prompt_data = self.prompts[prompt_type]
        scores = [entry["score"] for entry in prompt_data.get("quality_scores", [])]
        
        if not scores:
            return {
                "version": prompt_data.get("version", "1.0"),
                "total_uses": 0,
                "average_score": 0,
                "min_score": 0,
                "max_score": 0,
                "trend": "no_data"
            }
        
        avg_score = sum(scores) / len(scores)
        
        # Calculate trend (last 5 vs previous 5)
        trend = "stable"
        if len(scores) >= 10:
            recent_avg = sum(scores[-5:]) / 5
            previous_avg = sum(scores[-10:-5]) / 5
            if recent_avg > previous_avg + 5:
                trend = "improving"
            elif recent_avg < previous_avg - 5:
                trend = "declining"
        
        return {
            "version": prompt_data.get("version", "1.0"),
            "total_uses": len(scores),
            "average_score": round(avg_score, 2),
            "min_score": min(scores),
            "max_score": max(scores),
            "trend": trend,
            "recent_scores": scores[-10:] if len(scores) >= 10 else scores
        }
    
    def get_prompt_suggestions(self, current_scores: Dict[str, float]) -> list:
        """Generate suggestions for prompt improvements based on evaluation scores"""
        suggestions = []
        
        # Text completeness suggestions
        if current_scores.get("text_completeness", 0) < 60:
            suggestions.append({
                "category": "Text Extraction",
                "issue": "Low text completeness score",
                "suggestion": "Add instruction to scan all areas of the image systematically",
                "prompt_addition": "Please scan the entire image systematically from top to bottom, left to right, including headers, footers, sidebars, and any overlay text."
            })
        
        # Visual coverage suggestions  
        if current_scores.get("visual_coverage", 0) < 60:
            suggestions.append({
                "category": "Visual Description",
                "issue": "Limited visual element coverage",
                "suggestion": "Enhance visual element identification instructions",
                "prompt_addition": "Identify and describe all UI elements including buttons, icons, input fields, dropdowns, navigation menus, images, and their positions."
            })
        
        # Layout description suggestions
        if current_scores.get("layout_description", 0) < 60:
            suggestions.append({
                "category": "Layout Analysis", 
                "issue": "Poor spatial relationship description",
                "suggestion": "Add specific layout analysis instructions",
                "prompt_addition": "Describe the spatial layout including the arrangement of elements (top, bottom, left, right, center), grid structures, columns, and visual hierarchy."
            })
        
        # Color and style suggestions
        if current_scores.get("color_style", 0) < 60:
            suggestions.append({
                "category": "Visual Style",
                "issue": "Limited color and style recognition",
                "suggestion": "Include detailed style analysis",
                "prompt_addition": "Note the color scheme, design style (modern, minimal, etc.), visual effects (shadows, gradients), and overall aesthetic."
            })
        
        return suggestions
    
    def generate_improved_prompt(self, base_prompt: str, suggestions: list) -> str:
        """Generate an improved prompt based on suggestions"""
        improved_sections = []
        
        for suggestion in suggestions:
            if suggestion.get("prompt_addition"):
                improved_sections.append(suggestion["prompt_addition"])
        
        if not improved_sections:
            return base_prompt
        
        # Insert improvements into the base prompt
        improved_prompt = base_prompt
        
        if "VISUAL DESCRIPTION:" in improved_prompt:
            visual_section = improved_prompt.split("VISUAL_DESCRIPTION:")[1]
            enhanced_visual = f"VISUAL DESCRIPTION:\nDescribe the visual elements, layout, colors, UI components, buttons, icons, and overall appearance.\n\nAdditional Analysis:\n" + "\n".join([f"- {section}" for section in improved_sections]) + f"\n{visual_section}"
            improved_prompt = improved_prompt.split("VISUAL_DESCRIPTION:")[0] + enhanced_visual
        else:
            improved_prompt += f"\n\nAdditional Instructions:\n" + "\n".join([f"- {section}" for section in improved_sections])
        
        return improved_prompt