import React from 'react';
import type { SearchResult } from '../types';
import { FileText, Image, Layers, TrendingUp } from 'lucide-react';
import EvaluationDisplay from './EvaluationDisplay';

interface SearchResultsProps {
  results: SearchResult[];
}

const SearchResults: React.FC<SearchResultsProps> = ({ results }) => {
  const getMatchIcon = (matchType: string) => {
    switch (matchType) {
      case 'text':
        return <FileText className="w-5 h-5 text-blue-400" />;
      case 'visual':
        return <Image className="w-5 h-5 text-green-400" />;
      case 'combined':
        return <Layers className="w-5 h-5 text-purple-400" />;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Search Results</h2>
        <span className="text-sm text-gray-400">
          Top {results.length} matches found
        </span>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={result.file_hash}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg text-white font-bold">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{result.filename}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getMatchIcon(result.match_type)}
                    <span className="text-sm text-gray-400">{getMatchTypeLabel(result.match_type)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className={`font-bold ${getConfidenceColor(result.confidence_score)}`}>
                  {(result.confidence_score * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {result.ocr_text && (
                <div className="bg-black/20 rounded-lg p-3">
                  <p className="text-xs font-semibold text-blue-400 mb-1">OCR Text:</p>
                  <p className="text-sm text-gray-300 line-clamp-2">{result.ocr_text}</p>
                </div>
              )}
              
              {result.visual_description && (
                <div className="bg-black/20 rounded-lg p-3">
                  <p className="text-xs font-semibold text-green-400 mb-1">Visual Description:</p>
                  <p className="text-sm text-gray-300 line-clamp-2">{result.visual_description}</p>
                </div>
              )}
            </div>

            {/* Evaluation Display */}
            {result.evaluation && (
              <div className="mt-4">
                <EvaluationDisplay evaluation={result.evaluation} filename={result.filename} />
              </div>
            )}

            <div className="mt-4 flex items-center gap-2">
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-all">
                View Screenshot
              </button>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-all">
                Copy Path
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;