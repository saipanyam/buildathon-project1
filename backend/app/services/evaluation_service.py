from typing import Dict, List, Tuple
from dataclasses import dataclass
import re

@dataclass
class EvaluationCriteria:
    name: str
    weight: float
    description: str

@dataclass
class EvaluationResult:
    criteria: str
    score: float
    max_score: float
    reasoning: str
    suggestions: List[str]

class EvaluationService:
    def __init__(self):
        self.rubric = [
            EvaluationCriteria(
                name="Text Completeness",
                weight=0.15,  # Reduced from 0.25
                description="How completely the OCR captures all visible text"
            ),
            EvaluationCriteria(
                name="Text Accuracy",
                weight=0.10,  # Reduced from 0.20
                description="Accuracy of extracted text without errors or gibberish"
            ),
            EvaluationCriteria(
                name="Visual Element Coverage",
                weight=0.30,  # Increased from 0.20
                description="How well visual elements (buttons, icons, UI components) are described"
            ),
            EvaluationCriteria(
                name="Layout Description",
                weight=0.20,  # Increased from 0.15
                description="Quality of spatial relationships and layout description"
            ),
            EvaluationCriteria(
                name="Color and Style Recognition",
                weight=0.15,  # Increased from 0.10
                description="Accuracy in identifying colors, themes, and visual styles"
            ),
            EvaluationCriteria(
                name="Searchability",
                weight=0.10,
                description="How well the extraction enables effective searching"
            )
        ]
    
    def evaluate_extraction(self, ocr_text: str, visual_description: str) -> Dict:
        """Evaluate the quality of OCR and visual extraction"""
        evaluations = []
        total_score = 0
        max_total_score = 0
        
        # Evaluate Text Completeness
        text_completeness = self._evaluate_text_completeness(ocr_text)
        evaluations.append(text_completeness)
        
        # Evaluate Text Accuracy
        text_accuracy = self._evaluate_text_accuracy(ocr_text)
        evaluations.append(text_accuracy)
        
        # Evaluate Visual Element Coverage
        visual_coverage = self._evaluate_visual_coverage(visual_description)
        evaluations.append(visual_coverage)
        
        # Evaluate Layout Description
        layout_quality = self._evaluate_layout_description(visual_description)
        evaluations.append(layout_quality)
        
        # Evaluate Color and Style Recognition
        color_style = self._evaluate_color_style(visual_description)
        evaluations.append(color_style)
        
        # Evaluate Searchability
        searchability = self._evaluate_searchability(ocr_text, visual_description)
        evaluations.append(searchability)
        
        # Calculate weighted scores
        for eval_result, criteria in zip(evaluations, self.rubric):
            if eval_result.max_score > 0:
                # Calculate as ratio (0-1) then weight it
                score_ratio = eval_result.score / eval_result.max_score
                weighted_score = score_ratio * criteria.weight
                total_score += weighted_score
            max_total_score += criteria.weight
        
        # Overall confidence score (as ratio 0-1)
        confidence_score = (total_score / max_total_score) if max_total_score > 0 else 0
        
        # Ensure confidence_score is not NaN
        if confidence_score != confidence_score:  # NaN check
            confidence_score = 0
            
        # Debug evaluation scoring
        print(f"Evaluation debug: total_score={total_score:.3f}, max_total_score={max_total_score:.3f}, confidence_score={confidence_score:.3f} ({confidence_score*100:.1f}%)")
        for i, (eval_result, criteria) in enumerate(zip(evaluations, self.rubric)):
            if eval_result.max_score > 0:
                score_ratio = eval_result.score / eval_result.max_score
                weighted_score = score_ratio * criteria.weight
                percentage = score_ratio * 100
                print(f"  {criteria.name}: {eval_result.score}/{eval_result.max_score} = {percentage:.1f}% (weighted: {weighted_score:.3f}, weight: {criteria.weight*100:.0f}%)")
            else:
                print(f"  {criteria.name}: {eval_result.score}/{eval_result.max_score} = 0% (max_score is 0)")
            print(f"    Reasoning: {eval_result.reasoning}")
        
        # Generate overall suggestions
        all_suggestions = []
        for eval_result in evaluations:
            all_suggestions.extend(eval_result.suggestions)
        
        # Determine overall quality level
        quality_level = self._get_quality_level(confidence_score)
        
        return {
            "confidence_score": round(confidence_score, 3),
            "quality_level": quality_level,
            "total_score": round(total_score, 2),
            "max_score": round(max_total_score, 2),
            "evaluations": [
                {
                    "criteria": eval.criteria,
                    "score": eval.score,
                    "max_score": eval.max_score,
                    "percentage": round((eval.score / eval.max_score) * 100, 1) if eval.max_score > 0 and not (eval.score != eval.score) and eval.score is not None else 0,
                    "reasoning": eval.reasoning,
                    "suggestions": eval.suggestions
                }
                for eval in evaluations
            ],
            "overall_suggestions": list(set(all_suggestions))[:5],  # Top 5 unique suggestions
            "rubric": [
                {
                    "name": criteria.name,
                    "weight": criteria.weight,
                    "description": criteria.description
                }
                for criteria in self.rubric
            ]
        }
    
    def _evaluate_text_completeness(self, ocr_text: str) -> EvaluationResult:
        """Evaluate how completely text is extracted"""
        score = 0
        max_score = 10
        suggestions = []
        
        text_length = len(ocr_text.strip())
        word_count = len(ocr_text.split())
        
        if text_length == 0:
            reasoning = "No text extracted from the screenshot"
            suggestions.append("Ensure the screenshot contains visible text")
            suggestions.append("Check if the image quality is sufficient for OCR")
        elif text_length < 50:
            score = 3
            reasoning = f"Minimal text extracted ({word_count} words)"
            suggestions.append("Verify if all visible text areas are being processed")
        elif text_length < 150:
            score = 6
            reasoning = f"Moderate amount of text extracted ({word_count} words)"
            suggestions.append("Check for text in headers, footers, or sidebars that might be missed")
        elif text_length < 500:
            score = 8
            reasoning = f"Good amount of text extracted ({word_count} words)"
        elif text_length < 1000:
            score = 9
            reasoning = f"Very good amount of text extracted ({word_count} words)"
        else:
            score = 10
            reasoning = f"Excellent amount of text extracted ({word_count} words)"
        
        # Check for common UI text patterns
        ui_patterns = ['button', 'click', 'menu', 'submit', 'cancel', 'save', 'delete']
        ui_matches = sum(1 for pattern in ui_patterns if pattern.lower() in ocr_text.lower())
        if ui_matches > 3:
            score = min(10, score + 1)
            reasoning += ". Good coverage of UI text elements"
        
        # Ensure score is valid
        score = max(0, min(max_score, score if score == score and score is not None else 0))
        
        return EvaluationResult(
            criteria="Text Completeness",
            score=score,
            max_score=max_score,
            reasoning=reasoning,
            suggestions=suggestions
        )
    
    def _evaluate_text_accuracy(self, ocr_text: str) -> EvaluationResult:
        """Evaluate the accuracy of extracted text"""
        score = 8  # Start with good score
        max_score = 10
        suggestions = []
        reasoning = "Text appears to be accurately extracted"
        
        # Check for common OCR errors
        gibberish_pattern = r'[^\w\s]{5,}'  # 5+ consecutive non-alphanumeric chars
        if re.search(gibberish_pattern, ocr_text):
            score -= 3
            reasoning = "Detected potential OCR errors or gibberish text"
            suggestions.append("Improve image quality or resolution for better OCR")
        
        # Check for mixed case issues
        if ocr_text.isupper() or ocr_text.islower():
            score -= 1
            suggestions.append("Check if case sensitivity is being preserved correctly")
        
        # Check for reasonable word boundaries
        very_long_words = [word for word in ocr_text.split() if len(word) > 30]
        if very_long_words:
            score -= 2
            reasoning = "Found unusually long words suggesting OCR errors"
            suggestions.append("Review word segmentation in the OCR process")
        
        # Ensure score is valid
        score = max(0, min(max_score, score if score == score and score is not None else 0))
        
        return EvaluationResult(
            criteria="Text Accuracy",
            score=score,
            max_score=max_score,
            reasoning=reasoning,
            suggestions=suggestions
        )
    
    def _evaluate_visual_coverage(self, visual_description: str) -> EvaluationResult:
        """Evaluate coverage of visual elements"""
        score = 0
        max_score = 10
        suggestions = []
        
        visual_elements = {
            'buttons': ['button', 'btn', 'clickable'],
            'icons': ['icon', 'symbol', 'glyph'],
            'images': ['image', 'photo', 'picture', 'graphic'],
            'forms': ['input', 'field', 'textbox', 'dropdown', 'checkbox'],
            'layout': ['header', 'footer', 'sidebar', 'navigation', 'menu']
        }
        
        elements_found = []
        for category, keywords in visual_elements.items():
            if any(keyword in visual_description.lower() for keyword in keywords):
                score += 2
                elements_found.append(category)
        
        # Also give points for detailed descriptions regardless of keyword matching
        description_length = len(visual_description.strip())
        if description_length > 500:
            score += 2  # Bonus for detailed descriptions
        elif description_length > 200:
            score += 1  # Small bonus for moderate descriptions
            
        if not elements_found:
            if description_length > 200:
                score = max(score, 4)  # Give some credit for detailed description
                reasoning = "Detailed visual description provided, but specific UI elements not clearly identified"
                suggestions.append("Try to identify specific UI components more explicitly")
            else:
                reasoning = "No specific visual elements identified"
                suggestions.append("Enhance visual element detection in the description")
                suggestions.append("Include more specific UI component identification")
        elif len(elements_found) < 2:
            reasoning = f"Some visual elements described: {', '.join(elements_found)}"
            if description_length > 300:
                reasoning += " with good detail"
            suggestions.append("Expand coverage of visual elements")
        else:
            reasoning = f"Good coverage of visual elements: {', '.join(elements_found)}"
            if description_length > 400:
                reasoning += " with excellent detail"
        
        # Ensure score is valid
        score = max(0, min(max_score, score if score == score and score is not None else 0))
        
        return EvaluationResult(
            criteria="Visual Element Coverage",
            score=score,
            max_score=max_score,
            reasoning=reasoning,
            suggestions=suggestions
        )
    
    def _evaluate_layout_description(self, visual_description: str) -> EvaluationResult:
        """Evaluate quality of layout and spatial descriptions"""
        score = 5  # Start with medium score
        max_score = 10
        suggestions = []
        
        spatial_terms = ['top', 'bottom', 'left', 'right', 'center', 'middle', 
                        'above', 'below', 'beside', 'next to', 'corner']
        spatial_count = sum(1 for term in spatial_terms if term in visual_description.lower())
        
        if spatial_count == 0:
            score = 2
            reasoning = "No spatial relationships described"
            suggestions.append("Add spatial and positional descriptions")
        elif spatial_count < 3:
            score = 5
            reasoning = "Basic spatial relationships described"
            suggestions.append("Provide more detailed layout descriptions")
        else:
            score = 8
            reasoning = "Good spatial and layout descriptions"
        
        # Check for structure descriptions
        if any(term in visual_description.lower() for term in ['grid', 'row', 'column', 'panel']):
            score = min(10, score + 2)
            reasoning += ". Includes structural layout information"
        
        # Ensure score is valid
        score = max(0, min(max_score, score if score == score and score is not None else 0))
        
        return EvaluationResult(
            criteria="Layout Description",
            score=score,
            max_score=max_score,
            reasoning=reasoning,
            suggestions=suggestions
        )
    
    def _evaluate_color_style(self, visual_description: str) -> EvaluationResult:
        """Evaluate color and style recognition"""
        score = 0
        max_score = 10
        suggestions = []
        
        colors = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'gray', 
                 'orange', 'purple', 'pink', 'dark', 'light', 'bright']
        color_count = sum(1 for color in colors if color in visual_description.lower())
        
        styles = ['modern', 'minimal', 'flat', 'gradient', 'shadow', 'rounded', 
                 'border', 'transparent', 'bold', 'italic']
        style_count = sum(1 for style in styles if style in visual_description.lower())
        
        score = min(10, (color_count * 2) + (style_count * 2))
        
        if color_count == 0:
            suggestions.append("Include color information in descriptions")
        if style_count == 0:
            suggestions.append("Describe visual styles and design patterns")
        
        if score < 4:
            reasoning = "Minimal color and style information"
        elif score < 7:
            reasoning = "Some color and style details included"
        else:
            reasoning = "Good color and style recognition"
        
        # Ensure score is valid
        score = max(0, min(max_score, score if score == score and score is not None else 0))
        
        return EvaluationResult(
            criteria="Color and Style Recognition",
            score=score,
            max_score=max_score,
            reasoning=reasoning,
            suggestions=suggestions
        )
    
    def _evaluate_searchability(self, ocr_text: str, visual_description: str) -> EvaluationResult:
        """Evaluate how searchable the extracted content is"""
        score = 5
        max_score = 10
        suggestions = []
        
        combined_text = f"{ocr_text} {visual_description}"
        
        # Check for meaningful keywords
        word_count = len(combined_text.split())
        unique_words = len(set(combined_text.lower().split()))
        
        if word_count < 20:
            score = 2
            reasoning = "Insufficient content for effective searching"
            suggestions.append("Extract more detailed information from screenshots")
        elif unique_words / word_count < 0.3:
            score = 4
            reasoning = "Low keyword diversity may limit search effectiveness"
            suggestions.append("Improve variety in descriptions")
        else:
            score = 8
            reasoning = "Good keyword coverage for searching"
        
        # Check for technical terms or specific identifiers
        if re.search(r'\b[A-Z]{2,}\b', combined_text):  # Acronyms
            score = min(10, score + 1)
        if re.search(r'\b\d+\b', combined_text):  # Numbers/IDs
            score = min(10, score + 1)
        
        # Ensure score is valid
        score = max(0, min(max_score, score if score == score and score is not None else 0))
        
        return EvaluationResult(
            criteria="Searchability",
            score=score,
            max_score=max_score,
            reasoning=reasoning,
            suggestions=suggestions
        )
    
    def _get_quality_level(self, confidence_score: float) -> str:
        """Determine quality level based on confidence score (0-1 ratio, adjusted for Claude 3 Opus quality)"""
        if confidence_score >= 0.60:
            return "Excellent"
        elif confidence_score >= 0.45:
            return "Good"
        elif confidence_score >= 0.30:
            return "Fair"
        elif confidence_score >= 0.15:
            return "Poor"
        else:
            return "Very Poor"