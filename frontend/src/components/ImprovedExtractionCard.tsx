import React, { useState } from 'react';
import type { SearchResult } from '../types';
import { FileText, BarChart3, ChevronDown, ChevronUp, Eye, AlertTriangle, CheckCircle, XCircle, ImageIcon, Expand } from 'lucide-react';
import ImagePopup from './ImagePopup';

interface ImprovedExtractionCardProps {
  result: SearchResult;
  index: number;
}

const ImprovedExtractionCard: React.FC<ImprovedExtractionCardProps> = ({ result, index }) => {
  const [isQualityExpanded, setIsQualityExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (score >= 0.6) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    if (score >= 0.4) return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    return 'text-red-400 bg-red-500/20 border-red-500/30';
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

  // Create image URL using the new endpoint
  const imageUrl = `http://localhost:8000/uploads/${result.file_hash}`;

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-all duration-300 shadow-xl">
      {/* Card Header - Visual Description as Title */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-6 border-b border-gray-700">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">#{index}</span>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-bold text-white">Visual Description</h2>
            </div>
            <div className="text-gray-300 text-base leading-relaxed">
              {result.visual_description && result.visual_description.length > 200 ? (
                <>
                  <p className={isDescriptionExpanded ? '' : 'line-clamp-3'}>
                    {result.visual_description}
                  </p>
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="text-red-400 hover:text-red-300 text-sm mt-2 flex items-center gap-1"
                  >
                    {isDescriptionExpanded ? (
                      <>Show less <ChevronUp className="w-3 h-3" /></>
                    ) : (
                      <>Show more <ChevronDown className="w-3 h-3" /></>
                    )}
                  </button>
                </>
              ) : (
                <p>{result.visual_description || 'No visual description available'}</p>
              )}
            </div>
          </div>
          
          <div className="flex-shrink-0 text-right">
            <div className="text-xs text-gray-500 mb-1">{result.filename}</div>
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getConfidenceColor(result.confidence_score)}`}>
              {getQualityIcon(getConfidenceLabel(result.confidence_score))}
              {getConfidenceLabel(result.confidence_score)}
            </div>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="grid lg:grid-cols-2 gap-0">
        {/* Image Section */}
        <div className="relative bg-gray-800 aspect-video lg:aspect-auto lg:min-h-96 group">
          {!imageError ? (
            <>
              <img
                src={imageUrl}
                alt={result.filename}
                className="w-full h-full object-contain cursor-pointer"
                onError={() => setImageError(true)}
                onClick={() => setIsImagePopupOpen(true)}
              />
              {/* Expand overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <Expand className="w-6 h-6 text-white" />
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center p-8">
                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-400 mb-2">{result.filename}</p>
                <p className="text-xs text-gray-500">Image not found</p>
              </div>
            </div>
          )}
          
          {/* Image Overlay with Quality Score */}
          <div className="absolute top-4 right-4">
            <div className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${getConfidenceColor(result.confidence_score)}`}>
              {(result.confidence_score * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col">
          {/* Extracted Text Section */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Extracted Text</h3>
            </div>
            
            {result.ocr_text ? (
              <div className="bg-gray-800/50 rounded-lg border border-gray-600 overflow-hidden">
                <div className="max-h-64 overflow-y-auto p-4 custom-scrollbar">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                    {result.ocr_text}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/50 rounded-lg border border-gray-600 p-6 text-center">
                <FileText className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500 italic">No text found in this image</p>
              </div>
            )}
          </div>

          {/* Quality Metrics - Clickable */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <button
              onClick={() => setIsQualityExpanded(!isQualityExpanded)}
              className="w-full hover:bg-gray-800/30 transition-colors rounded-lg p-2"
            >
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {(result.confidence_score * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-400">Quality Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-400">
                    {result.ocr_text ? result.ocr_text.split(' ').length : 0}
                  </div>
                  <div className="text-xs text-gray-400">Words Extracted</div>
                </div>
              </div>
              <div className="flex items-center justify-center mt-2 text-xs text-gray-400">
                <span>Click for detailed evaluation</span>
                {isQualityExpanded ? (
                  <ChevronUp className="w-3 h-3 ml-1" />
                ) : (
                  <ChevronDown className="w-3 h-3 ml-1" />
                )}
              </div>
            </button>

            {/* Expanded Quality Details */}
            {isQualityExpanded && result.evaluation && (
              <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
                <h4 className="text-sm font-medium text-white mb-3">Evaluation Rubric</h4>
                
                {/* Evaluation Criteria Grid */}
                <div className="grid md:grid-cols-2 gap-3">
                  {result.evaluation.evaluations.map((criteria, idx) => (
                    <div key={idx} className="bg-gray-800/30 rounded-lg p-3 border border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-white">{criteria.criteria}</span>
                        <span className={`text-xs px-2 py-1 rounded ${getConfidenceColor(criteria.percentage / 100)}`}>
                          {criteria.score}/{criteria.max_score}
                        </span>
                      </div>
                      
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Score</span>
                          <span>{criteria.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="bg-gradient-to-r from-red-500 to-red-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${criteria.percentage}%` }}
                          />
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-400">{criteria.reasoning}</p>
                    </div>
                  ))}
                </div>

                {/* Overall Quality Summary */}
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Overall Quality</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(result.confidence_score)}`}>
                      {getConfidenceLabel(result.confidence_score)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Based on text completeness, accuracy, visual coverage, layout description, color & style recognition, and searchability.
                  </div>
                </div>

                {/* Improvement Suggestions */}
                {result.evaluation.overall_suggestions.length > 0 && (
                  <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3">
                    <p className="text-xs font-medium text-yellow-400 mb-2">Key Improvement Areas:</p>
                    <div className="space-y-1">
                      {result.evaluation.overall_suggestions.slice(0, 3).map((suggestion, idx) => (
                        <p key={idx} className="text-xs text-gray-300">• {suggestion}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Popup */}
      <ImagePopup
        isOpen={isImagePopupOpen}
        onClose={() => setIsImagePopupOpen(false)}
        imageUrl={imageUrl}
        filename={result.filename}
      />
    </div>
  );
};

export default ImprovedExtractionCard;