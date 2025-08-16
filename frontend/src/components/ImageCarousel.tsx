import React, { useState } from 'react';
import type { SearchResult } from '../types';
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';
import ImageCard from './ImageCard';

interface ImageCarouselProps {
  results: SearchResult[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ results }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(results.length / itemsPerPage);

  const nextPage = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };


  if (results.length === 0) return null;

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="text-center mb-8">
        <div className="relative inline-block">
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-20 animate-pulse" />
          <div className="relative flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Search Results
            </h2>
            <Sparkles className="w-6 h-6 text-pink-400 animate-pulse" />
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-lg font-medium text-gray-300">
              {results.length} matches found
            </span>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 px-3 py-1 bg-white/10 rounded-full">
                Page {currentIndex + 1} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={prevPage}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextPage}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Carousel Container */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/20 p-6">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-4 left-4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-4 right-4 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl animate-pulse animation-delay-1000" />
        </div>
        
        <div 
          className="relative flex transition-transform duration-700 ease-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            width: `${totalPages * 100}%`
          }}
        >
          {Array.from({ length: totalPages }).map((_, pageIndex) => (
            <div
              key={pageIndex}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
              style={{ width: `${100 / totalPages}%` }}
            >
              {results
                .slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage)
                .map((result, index) => (
                  <div 
                    key={result.file_hash} 
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <ImageCard
                      result={result}
                      index={pageIndex * itemsPerPage + index + 1}
                    />
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Navigation Dots */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-8">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg'
                  : 'w-3 h-3 bg-white/30 hover:bg-white/50 rounded-full transform hover:scale-125'
              }`}
            >
              {index === currentIndex && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur animate-pulse" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Modern Navigation */}
      {totalPages > 1 && (
        <>
          <button
            onClick={prevPage}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-all backdrop-blur-sm border border-white/20"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextPage}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-all backdrop-blur-sm border border-white/20"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  );
};

export default ImageCarousel;