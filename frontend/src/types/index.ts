export interface EvaluationCriteria {
  criteria: string;
  score: number;
  max_score: number;
  percentage: number;
  reasoning: string;
  suggestions: string[];
}

export interface Evaluation {
  confidence_score: number;
  quality_level: string;
  total_score: number;
  max_score: number;
  evaluations: EvaluationCriteria[];
  overall_suggestions: string[];
  rubric: Array<{
    name: string;
    weight: number;
    description: string;
  }>;
}

export interface SearchResult {
  filename: string;
  file_hash: string;
  confidence_score: number;
  ocr_text: string;
  visual_description: string;
  match_type: 'text' | 'visual' | 'combined';
  evaluation?: Evaluation;
}

export interface UploadResponse {
  message: string;
  files: {
    filename: string;
    saved_as: string;
    hash: string;
  }[];
}