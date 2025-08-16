import React, { useState } from 'react';
import type { SearchResult } from '../types';
import { FileText, BarChart3, ChevronDown, ChevronUp, Eye, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ExtractionCardProps {
  result: SearchResult;
  index: number;
}

const ExtractionCard: React.FC<ExtractionCardProps> = ({ result, index }) => {
  const [isEvaluationExpanded, setIsEvaluationExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400 bg-green-500/20';
    if (score >= 0.6) return 'text-yellow-400 bg-yellow-500/20';
    if (score >= 0.4) return 'text-orange-400 bg-orange-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    return 'Needs Review';
  };

  const getQualityIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="w-4 h-4" />;
      case 'fair':
        return <AlertTriangle className="w-4 h-4" />;
      case 'poor':
      case 'very poor':
        return <XCircle className="w-4 h-4" />;
      default:
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  // Create a placeholder image URL
  const imageUrl = `http://localhost:8000/uploads/${result.file_hash}.png`;

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden">
      {/* Visual Description as Title */}
      <div className="bg-gray-800/50 p-4 border-b border-gray-700">
        <div className="flex items-start gap-3">
          <Eye className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">Visual Description</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {result.visual_description || 'No visual description available'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">#{index}</div>
            <div className="text-xs text-gray-500">{result.filename}</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-0">
        {/* Image Section */}
        <div className="relative aspect-video bg-gray-800">
          {!imageError ? (
            <img
              src={imageUrl}
              alt={result.filename}
              className="w-full h-full object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">{result.filename}</p>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-4">
          {/* Extracted Text */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-blue-400" />
              <h4 className="text-sm font-semibold text-white">Extracted Text</h4>
            </div>
            {result.ocr_text ? (
              <div className="bg-gray-800/50 rounded-lg p-3 max-h-48 overflow-y-auto">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                  {result.ocr_text}
                </pre>
              </div>
            ) : (
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-sm text-gray-500 italic">No text found in this image</p>
              </div>
            )}
          </div>

          {/* Confidence Score with Context */}
          <div className="bg-gray-800/30 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">Extraction Quality</span>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(result.confidence_score)}`}>
                {getQualityIcon(getConfidenceLabel(result.confidence_score))}
                {getConfidenceLabel(result.confidence_score)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Overall Score</span>
                <span className="text-white font-medium">{(result.confidence_score * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all"
                  style={{ width: `${result.confidence_score * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Based on text completeness, accuracy, visual coverage, and layout description
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluation Results */}
      {result.evaluation && (
        <div className="border-t border-gray-700">
          <button
            onClick={() => setIsEvaluationExpanded(!isEvaluationExpanded)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-white">Detailed Evaluation Results</span>
            </div>
            {isEvaluationExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {isEvaluationExpanded && (
            <div className="px-4 pb-4 space-y-3">
              {result.evaluation.evaluations.map((criteria, idx) => (
                <div key={idx} className="bg-gray-800/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{criteria.criteria}</span>
                      <span className={`text-xs px-2 py-1 rounded ${getConfidenceColor(criteria.percentage / 100)}`}>
                        {criteria.score}/{criteria.max_score}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-white">{criteria.percentage}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-1.5 mb-2">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-red-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${criteria.percentage}%` }}
                    />
                  </div>
                  
                  <p className="text-xs text-gray-400 mb-2">{criteria.reasoning}</p>
                  
                  {criteria.suggestions.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-yellow-400">Suggestions:</p>
                      {criteria.suggestions.map((suggestion, suggIdx) => (
                        <p key={suggIdx} className="text-xs text-gray-400 ml-2">• {suggestion}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Overall Suggestions */}
              {result.evaluation.overall_suggestions.length > 0 && (
                <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3">
                  <p className="text-sm font-medium text-yellow-400 mb-2">Key Improvement Areas:</p>
                  {result.evaluation.overall_suggestions.map((suggestion, idx) => (
                    <p key={idx} className="text-xs text-gray-300 mb-1">• {suggestion}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExtractionCard;