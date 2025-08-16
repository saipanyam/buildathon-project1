import React, { useState } from 'react';
import type { Evaluation } from '../types';
import { BarChart3, CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp, Lightbulb, Settings } from 'lucide-react';
import PromptManager from './PromptManager';

interface EvaluationDisplayProps {
  evaluation: Evaluation;
  filename: string;
}

const EvaluationDisplay: React.FC<EvaluationDisplayProps> = ({ evaluation }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPromptManagerOpen, setIsPromptManagerOpen] = useState(false);

  const getQualityColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'excellent':
        return 'text-green-400 bg-green-500/20';
      case 'good':
        return 'text-blue-400 bg-blue-500/20';
      case 'fair':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'poor':
        return 'text-orange-400 bg-orange-500/20';
      case 'very poor':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getQualityIcon = (level: string) => {
    switch (level.toLowerCase()) {
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

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-black/20 rounded-lg border border-white/10 overflow-hidden">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">Extraction Quality Assessment</h3>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${getQualityColor(evaluation.quality_level)}`}>
              {getQualityIcon(evaluation.quality_level)}
              {evaluation.quality_level}
            </div>
            <span className="text-sm text-gray-400">
              {evaluation.confidence_score.toFixed(1)}%
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>

        {!isExpanded && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Overall Score</span>
              <span>{evaluation.total_score.toFixed(1)}/{evaluation.max_score.toFixed(1)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getScoreColor(evaluation.confidence_score)}`}
                style={{ width: `${evaluation.confidence_score}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-white/10">
          {/* Detailed Scores */}
          <div className="p-4 space-y-4">
            <h4 className="text-sm font-semibold text-white mb-3">Detailed Assessment</h4>
            
            {evaluation.evaluations.map((criteria, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">{criteria.criteria}</span>
                  <span className="text-xs text-gray-400">
                    {criteria.score}/{criteria.max_score} ({criteria.percentage}%)
                  </span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getScoreColor(criteria.percentage)}`}
                    style={{ width: `${criteria.percentage}%` }}
                  />
                </div>
                
                <p className="text-xs text-gray-400 italic">{criteria.reasoning}</p>
                
                {criteria.suggestions.length > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="w-3 h-3 text-yellow-400" />
                      <span className="text-xs font-medium text-yellow-400">Suggestions:</span>
                    </div>
                    <ul className="text-xs text-gray-400 list-disc list-inside space-y-1">
                      {criteria.suggestions.map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Overall Suggestions */}
          {evaluation.overall_suggestions.length > 0 && (
            <div className="border-t border-white/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                <h4 className="text-sm font-semibold text-yellow-400">Key Improvement Areas</h4>
              </div>
              
              <div className="space-y-2">
                {evaluation.overall_suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t border-white/10 p-4">
            <div className="flex gap-2">
              <button 
                onClick={() => setIsPromptManagerOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm text-white transition-colors"
              >
                <Settings className="w-4 h-4" />
                Improve Prompts
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors">
                <BarChart3 className="w-4 h-4" />
                View Rubric
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Prompt Manager Modal */}
      <PromptManager
        isOpen={isPromptManagerOpen}
        onClose={() => setIsPromptManagerOpen(false)}
        evaluationScores={{
          text_completeness: evaluation.evaluations.find(e => e.criteria === 'Text Completeness')?.percentage || 0,
          text_accuracy: evaluation.evaluations.find(e => e.criteria === 'Text Accuracy')?.percentage || 0,
          visual_coverage: evaluation.evaluations.find(e => e.criteria === 'Visual Element Coverage')?.percentage || 0,
          layout_description: evaluation.evaluations.find(e => e.criteria === 'Layout Description')?.percentage || 0,
          color_style: evaluation.evaluations.find(e => e.criteria === 'Color and Style Recognition')?.percentage || 0,
          searchability: evaluation.evaluations.find(e => e.criteria === 'Searchability')?.percentage || 0
        }}
      />
    </div>
  );
};

export default EvaluationDisplay;