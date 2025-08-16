import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Eye, FileText, BarChart3, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { SearchResult } from '../types';

interface ImageCarouselWithFlipProps {
  results: SearchResult[];
  title: string;
}

const ImageCarouselWithFlip: React.FC<ImageCarouselWithFlipProps> = ({ results, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [hoveredCards, setHoveredCards] = useState<Set<string>>(new Set());
  const [clickedCards, setClickedCards] = useState<Set<string>>(new Set());
  const [expandedEvaluations, setExpandedEvaluations] = useState<Set<string>>(new Set());
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleCardClick = (cardId: string) => {
    const newClicked = new Set(clickedCards);
    const newFlipped = new Set(flippedCards);
    
    if (clickedCards.has(cardId)) {
      // Unclick and unflip
      newClicked.delete(cardId);
      newFlipped.delete(cardId);
    } else {
      // Click and flip
      newClicked.add(cardId);
      newFlipped.add(cardId);
    }
    
    setClickedCards(newClicked);
    setFlippedCards(newFlipped);
  };

  const handleCardHover = (cardId: string, isHovering: boolean) => {
    const newHovered = new Set(hoveredCards);
    const newFlipped = new Set(flippedCards);
    
    if (isHovering) {
      // Only flip on hover if not clicked
      if (!clickedCards.has(cardId)) {
        newHovered.add(cardId);
        newFlipped.add(cardId);
      }
    } else {
      // Only unflip on hover out if not clicked
      if (!clickedCards.has(cardId)) {
        newHovered.delete(cardId);
        newFlipped.delete(cardId);
      }
    }
    
    setHoveredCards(newHovered);
    setFlippedCards(newFlipped);
  };

  const nextSlide = () => {
    if (results.length <= 3) return; // No navigation needed for 3 or fewer items
    const maxIndex = results.length - 3; // Last possible starting index to show 3 items
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    if (results.length <= 3) return; // No navigation needed for 3 or fewer items
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  // Calculate navigation states
  const canGoNext = results.length > 3 && currentIndex < results.length - 3;
  const canGoPrev = results.length > 3 && currentIndex > 0;

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    if (score >= 0.4) return 'text-orange-400';
    return 'text-red-400';
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

  const toggleEvaluation = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip when clicking evaluation
    const newExpanded = new Set(expandedEvaluations);
    if (expandedEvaluations.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedEvaluations(newExpanded);
  };

  if (results.length === 0) {
    return null;
  }

  // Calculate visible slides (3 cards at a time, but don't duplicate if fewer results)
  const visibleResults = results.length <= 3 
    ? results // Show all results if 3 or fewer, no duplication
    : results.slice(currentIndex, currentIndex + 3); // Simple slice, no wrapping needed

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <div className="text-sm text-gray-400">
          {results.length} visual {results.length === 1 ? 'memory' : 'memories'}
        </div>
      </div>

      <div className="relative">
        {/* Navigation Buttons */}
        {results.length > 3 && (
          <>
            <button
              onClick={prevSlide}
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 border rounded-full p-2 transition-all ${
                canGoPrev 
                  ? 'bg-black/50 hover:bg-black/70 border-gray-600 hover:border-gray-500' 
                  : 'bg-gray-800/30 border-gray-700 cursor-not-allowed opacity-50'
              }`}
              disabled={!canGoPrev}
            >
              <ChevronLeft className={`w-5 h-5 ${canGoPrev ? 'text-white' : 'text-gray-500'}`} />
            </button>
            
            <button
              onClick={nextSlide}
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 border rounded-full p-2 transition-all ${
                canGoNext 
                  ? 'bg-black/50 hover:bg-black/70 border-gray-600 hover:border-gray-500' 
                  : 'bg-gray-800/30 border-gray-700 cursor-not-allowed opacity-50'
              }`}
              disabled={!canGoNext}
            >
              <ChevronRight className={`w-5 h-5 ${canGoNext ? 'text-white' : 'text-gray-500'}`} />
            </button>
          </>
        )}

        {/* Carousel Container */}
        <div className="overflow-hidden px-8">
          <div 
            ref={carouselRef}
            className="flex gap-6 transition-transform duration-500 ease-in-out"
          >
            {visibleResults.map((result, index) => {
              const actualIndex = results.length <= 3 
                ? index // Use direct index when 3 or fewer results
                : currentIndex + index; // Use current position + offset for larger sets
              const cardId = `${result.file_hash}-${actualIndex}`;
              const isFlipped = flippedCards.has(cardId);
              const imageUrl = `http://localhost:8000/uploads/${result.file_hash}`;

              return (
                <div key={cardId} className="flex-shrink-0 w-80 h-96">
                  <div 
                    className="relative w-full h-full cursor-pointer group perspective-1000"
                    onClick={() => handleCardClick(cardId)}
                    onMouseEnter={() => handleCardHover(cardId, true)}
                    onMouseLeave={() => handleCardHover(cardId, false)}
                  >
                    {/* Flip Card Container */}
                    <div 
                      className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
                        isFlipped ? 'rotate-y-180' : ''
                      }`}
                    >
                      {/* Front of Card - Image */}
                      <div className="absolute inset-0 backface-hidden rounded-lg overflow-hidden border border-gray-600 bg-gray-800">
                        <div className="relative w-full h-full">
                          <img
                            src={imageUrl}
                            alt={result.filename}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          
                          {/* Fallback when image fails to load */}
                          <div 
                            className="hidden absolute inset-0 bg-gray-800 items-center justify-center flex-col"
                          >
                            <FileText className="w-12 h-12 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-400 text-center px-4">{result.filename}</p>
                          </div>
                          
                          {/* Overlay with filename and flip hint */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-4 left-4 right-4">
                              <p className="text-white text-sm font-medium truncate">{result.filename}</p>
                              <div className="flex items-center justify-between mt-2">
                                <div className={`text-xs px-2 py-1 rounded ${getConfidenceColor(result.confidence_score)} bg-black/50`}>
                                  {getConfidenceLabel(result.confidence_score)}
                                </div>
                                <div className="text-xs text-gray-300 flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  Click to view details
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Back of Card - Details */}
                      <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-lg border border-gray-600 bg-gray-800 overflow-hidden">
                        <div className="h-full flex flex-col">
                          {/* Header */}
                          <div className="p-4 border-b border-gray-700 bg-gray-900/50">
                            <div className="flex items-center gap-2 mb-2">
                              <Eye className="w-4 h-4 text-red-500" />
                              <h3 className="text-sm font-semibold text-white">Visual Description</h3>
                            </div>
                            <div className="max-h-20 overflow-y-auto custom-scrollbar">
                              <p className="text-xs text-gray-300 leading-relaxed">
                                {result.visual_description || 'No visual description available'}
                              </p>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 p-4 overflow-hidden">
                            <div className="flex items-center gap-2 mb-3">
                              <FileText className="w-4 h-4 text-blue-400" />
                              <h4 className="text-sm font-semibold text-white">Extracted Text</h4>
                            </div>
                            
                            {result.ocr_text ? (
                              <div className="bg-gray-900/50 rounded p-3 h-32 overflow-y-auto custom-scrollbar">
                                <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                                  {result.ocr_text}
                                </pre>
                              </div>
                            ) : (
                              <div className="bg-gray-900/50 rounded p-3 h-32 flex items-center justify-center">
                                <p className="text-xs text-gray-500 italic">No text found in this image</p>
                              </div>
                            )}
                          </div>

                          {/* Footer - Clickable Quality Section */}
                          <div className="border-t border-gray-700 bg-gray-900/50">
                            <button
                              onClick={(e) => toggleEvaluation(cardId, e)}
                              className="w-full p-3 hover:bg-gray-800/50 transition-all duration-200 border border-transparent hover:border-red-500/30 rounded-b-lg group"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded border border-gray-600 group-hover:border-red-500/50 transition-colors">
                                    <BarChart3 className="w-3 h-3 text-red-500" />
                                    <span className="text-xs font-medium text-white">Quality</span>
                                  </div>
                                  <div className={`px-2 py-1 rounded text-xs font-bold border ${getConfidenceColor(result.confidence_score)} bg-black/30`}>
                                    {(result.confidence_score * 100).toFixed(0)}%
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {getQualityIcon(getConfidenceLabel(result.confidence_score))}
                                    <span className={`text-xs font-medium ${getConfidenceColor(result.confidence_score)}`}>
                                      {getConfidenceLabel(result.confidence_score)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
                                    {result.evaluation ? 'Evaluation' : 'Analysis'}
                                  </span>
                                  <div className="bg-red-600/20 border border-red-500/30 rounded p-1 group-hover:bg-red-600/40 transition-colors">
                                    {expandedEvaluations.has(cardId) ? (
                                      <ChevronUp className="w-3 h-3 text-red-400" />
                                    ) : (
                                      <ChevronDown className="w-3 h-3 text-red-400" />
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-gray-500 truncate text-left">
                                📁 {result.filename}
                              </div>
                            </button>

                            {/* Expanded Evaluation Details */}
                            {expandedEvaluations.has(cardId) && result.evaluation && (
                              <div className="px-4 pb-4 max-h-40 overflow-y-auto custom-scrollbar">
                                <div className="space-y-2">
                                  <h5 className="text-xs font-medium text-white mb-2">Evaluation Breakdown</h5>
                                  
                                  {/* Evaluation Criteria */}
                                  <div className="space-y-2">
                                    {result.evaluation.evaluations.slice(0, 3).map((criteria, idx) => (
                                      <div key={idx} className="bg-gray-800/50 rounded p-2 border border-gray-600">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-xs font-medium text-white truncate">{criteria.criteria}</span>
                                          <span className={`text-xs px-1 py-0.5 rounded ${getConfidenceColor(criteria.percentage / 100)}`}>
                                            {criteria.score}/{criteria.max_score}
                                          </span>
                                        </div>
                                        
                                        <div className="mb-1">
                                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                                            <span>Score</span>
                                            <span>{criteria.percentage}%</span>
                                          </div>
                                          <div className="w-full bg-gray-700 rounded-full h-1">
                                            <div 
                                              className="bg-gradient-to-r from-red-500 to-red-600 h-1 rounded-full transition-all"
                                              style={{ width: `${criteria.percentage}%` }}
                                            />
                                          </div>
                                        </div>
                                        
                                        <p className="text-xs text-gray-400 line-clamp-2">{criteria.reasoning}</p>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Show more criteria indicator */}
                                  {result.evaluation.evaluations.length > 3 && (
                                    <div className="text-center">
                                      <span className="text-xs text-gray-500">
                                        +{result.evaluation.evaluations.length - 3} more criteria (view in list mode for full details)
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagination Dots */}
        {results.length > 3 && (
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: Math.max(1, results.length - 2) }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentIndex === index
                    ? 'bg-red-500 w-6'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCarouselWithFlip;