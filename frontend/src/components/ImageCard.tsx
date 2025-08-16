import React, { useState } from 'react';
import type { SearchResult } from '../types';
import { FileText, Image, Layers, TrendingUp, BarChart3, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { getImageUrl } from '../utils/api';

interface ImageCardProps {
  result: SearchResult;
  index: number;
}

const ImageCard: React.FC<ImageCardProps> = ({ result, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getMatchIcon = (matchType: string) => {
    switch (matchType) {
      case 'text':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'visual':
        return <Image className="w-4 h-4 text-green-400" />;
      case 'combined':
        return <Layers className="w-4 h-4 text-purple-400" />;
      default:
        return null;
    }
  };

  const getMatchTypeLabel = (matchType: string) => {
    switch (matchType) {
      case 'text':
        return 'Text Match';
      case 'visual':
        return 'Visual Match';
      case 'combined':
        return 'Combined Match';
      default:
        return 'Match';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.5) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getQualityColor = (level: string) => {
    switch (level?.toLowerCase()) {
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
    switch (level?.toLowerCase()) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="w-3 h-3" />;
      case 'fair':
        return <AlertTriangle className="w-3 h-3" />;
      case 'poor':
      case 'very poor':
        return <XCircle className="w-3 h-3" />;
      default:
        return <BarChart3 className="w-3 h-3" />;
    }
  };

  // Create a placeholder image URL for demonstration
  const imageUrl = getImageUrl(result.file_hash);

  return (
    <div className="relative group">
      <div
        className={`relative w-full h-64 cursor-pointer transition-transform duration-700 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
      >
        {/* Front Side - Image */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20">
          {/* Rank Badge */}
          <div className="absolute top-3 left-3 z-10 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {index}
          </div>

          {/* Quality Badge */}
          {result.evaluation && (
            <div className={`absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getQualityColor(result.evaluation.quality_level)}`}>
              {getQualityIcon(result.evaluation.quality_level)}
              {result.evaluation.quality_level}
            </div>
          )}

          {/* Image */}
          <div className="relative w-full h-full">
            {!imageError ? (
              <img
                src={imageUrl}
                alt={result.filename}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                <div className="text-center">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">{result.filename}</p>
                </div>
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getMatchIcon(result.match_type)}
                <span className="text-xs text-gray-300">{getMatchTypeLabel(result.match_type)}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-gray-400" />
                <span className={`text-xs font-medium ${getConfidenceColor(result.confidence_score)}`}>
                  {(result.confidence_score * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-white truncate">{result.filename}</h3>
          </div>
        </div>

        {/* Back Side - Details */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 to-purple-900/50 border border-white/20">
          <div className="p-4 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white truncate">{result.filename}</h3>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-gray-400" />
                <span className={`text-xs font-medium ${getConfidenceColor(result.confidence_score)}`}>
                  {(result.confidence_score * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {/* Extracted Text */}
              {result.ocr_text && (
                <div className="bg-black/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-3 h-3 text-blue-400" />
                    <span className="text-xs font-medium text-blue-400">Extracted Text</span>
                    {result.evaluation && (
                      <span className="text-xs text-gray-400">
                        ({result.evaluation.evaluations.find(e => e.criteria === 'Text Completeness')?.percentage || 0}%)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-300 line-clamp-3">{result.ocr_text}</p>
                </div>
              )}

              {/* Visual Description */}
              {result.visual_description && (
                <div className="bg-black/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Image className="w-3 h-3 text-green-400" />
                    <span className="text-xs font-medium text-green-400">Visual</span>
                    {result.evaluation && (
                      <span className="text-xs text-gray-400">
                        ({result.evaluation.evaluations.find(e => e.criteria === 'Visual Element Coverage')?.percentage || 0}%)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-300 line-clamp-3">{result.visual_description}</p>
                </div>
              )}

              {/* Evaluation Summary */}
              {result.evaluation && (
                <div className="bg-black/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-3 h-3 text-purple-400" />
                    <span className="text-xs font-medium text-purple-400">Quality Score</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Overall</span>
                      <span className="text-white font-medium">{result.evaluation.confidence_score.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full transition-all"
                        style={{ width: `${result.evaluation.confidence_score}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Match Type Badge */}
            <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-white/10">
              {getMatchIcon(result.match_type)}
              <span className="text-xs text-gray-300">{getMatchTypeLabel(result.match_type)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default ImageCard;