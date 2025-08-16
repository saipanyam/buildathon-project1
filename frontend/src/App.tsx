import { useState, useCallback, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Search, Image, FileText, Loader2, Zap, BarChart3, Grid3x3, List } from 'lucide-react';
import UnifiedUpload from './components/UnifiedUpload';
import ExtractionResults from './components/ExtractionResults';
import ImageCarouselWithFlip from './components/ImageCarouselWithFlip';
import CompactSearchInterface from './components/CompactSearchInterface';
import type { SearchResult } from './types';
import { searchScreenshots } from './api/screenshots';

const queryClient = new QueryClient();

function AppContent() {
  const [allResults, setAllResults] = useState<SearchResult[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [hasUploadedFiles, setHasUploadedFiles] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [viewMode, setViewMode] = useState<'carousel' | 'list'>('carousel');
  const [showingSearchResults, setShowingSearchResults] = useState(false);
  const [showFeatureBoxes, setShowFeatureBoxes] = useState(true);


  const handleUploadComplete = useCallback((files: any[]) => {
    // Clear any previous results to start a new session
    setAllResults([]);
    setSearchResults([]);
    setShowingSearchResults(false);
    setCurrentQuery('');
    setHasUploadedFiles(true);
    // Keep feature boxes visible during upload/processing
  }, []);

  const handleProcessingStart = useCallback(() => {
    // Clear previous results when starting new processing
    setAllResults([]);
    setIsProcessing(true);
    setExtractionProgress(0);
  }, []);

  const handleProcessingComplete = useCallback(async () => {
    // Simulate extraction progress
    const progressInterval = setInterval(() => {
      setExtractionProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    // Wait a bit then load all results
    setTimeout(async () => {
      try {
        const results = await searchScreenshots(''); // Get all results
        setAllResults(results);
        setIsProcessing(false);
        setExtractionProgress(0);
        // Hide feature boxes only when we have actual results
        if (results.length > 0) {
          setShowFeatureBoxes(false);
        }
      } catch (error) {
        console.error('Failed to load results:', error);
        setIsProcessing(false);
      }
    }, 3000);
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    setIsSearching(true);
    setCurrentQuery(query);
    
    try {
      const results = await searchScreenshots(query);
      setSearchResults(results);
      setShowingSearchResults(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchResults([]);
    setShowingSearchResults(false);
    setCurrentQuery('');
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'carousel' ? 'list' : 'carousel');
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Netflix-style Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-800/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-16 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-12 relative">
          <div className="absolute top-4 right-4">
            <button
              onClick={() => window.open('http://localhost:3001', '_blank')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 hover:border-gray-500 rounded-lg transition-all text-gray-300 hover:text-white"
              title="Open Test Dashboard"
            >
              <BarChart3 className="w-4 h-4" />
              Test Dashboard
            </button>
          </div>
          
          <div className="relative inline-block">
            <div className="absolute -inset-4 bg-gradient-to-r from-red-600 to-red-500 rounded-xl blur-xl opacity-20 animate-pulse"></div>
            <div className="relative flex items-center justify-center gap-4 mb-6">
              <div className="animate-spin-slow">
                <Search className="w-12 h-12 text-red-500 drop-shadow-lg" />
              </div>
              <h1 className="text-5xl font-black text-white">
                Visual Memory Search <span className="text-red-500">Yantra</span>
              </h1>
              <div className="animate-spin-slow animation-delay-1000">
                <Search className="w-12 h-12 text-red-500 drop-shadow-lg" />
              </div>
            </div>
          </div>
          <div className="relative">
            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              An AI-powered machine that instantly analyzes and searches through your visual memories
            </p>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-red-500 rounded-full"></div>
          </div>
        </header>

        {/* Upload Section */}
        <div className="mb-8">
          <UnifiedUpload 
            onUploadComplete={handleUploadComplete}
            onProcessingStart={handleProcessingStart}
            onProcessingComplete={handleProcessingComplete}
          />
        </div>

        {/* Extraction Progress */}
        {isProcessing && (
          <div className="mb-8 bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
              <h3 className="text-lg font-semibold text-white">AI Extraction in Progress</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Analyzing visual memories...</span>
                <span>{extractionProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${extractionProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Search functionality removed - show only extraction results */}

        {/* Features - Show until we have actual extraction results */}
        {console.log('Feature boxes debug:', { showFeatureBoxes, allResultsLength: allResults.length, isProcessing })}
        {showFeatureBoxes && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Text Extraction Feature Card */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-500 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition duration-500" />
              <div className="relative bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-red-500/50 transition-all transform hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-red-500 rounded-full blur opacity-30 animate-pulse" />
                    <div className="relative bg-gradient-to-br from-red-600 to-red-500 p-2 rounded-full">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white">Text Extraction</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Instantly extracts all readable text from your visual memories using AI
                </p>
                <div className="mt-3 flex items-center gap-2 text-red-400 text-xs font-semibold">
                  <Zap className="w-3 h-3" />
                  AI Powered
                </div>
              </div>
            </div>

            {/* Visual Analysis Feature Card */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-gray-600 to-gray-500 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition duration-500" />
              <div className="relative bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-gray-500/50 transition-all transform hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gray-500 rounded-full blur opacity-30 animate-pulse animation-delay-500" />
                    <div className="relative bg-gradient-to-br from-gray-600 to-gray-500 p-2 rounded-full">
                      <Image className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white">Visual Analysis</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Describes what the image shows - content, purpose, and context rather than styling
                </p>
                <div className="mt-3 flex items-center gap-2 text-gray-400 text-xs font-semibold">
                  <Zap className="w-3 h-3" />
                  Computer Vision
                </div>
              </div>
            </div>

            {/* Smart Search Feature Card */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-500 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition duration-500" />
              <div className="relative bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-red-500/50 transition-all transform hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-red-500 rounded-full blur opacity-30 animate-pulse animation-delay-1000" />
                    <div className="relative bg-gradient-to-br from-red-600 to-red-500 p-2 rounded-full">
                      <Search className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white">Smart Search</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Natural language queries find content across text, visuals, and meaning
                </p>
                <div className="mt-3 flex items-center gap-2 text-red-400 text-xs font-semibold">
                  <Zap className="w-3 h-3" />
                  Semantic Search
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compact Search Interface - Show after extraction is complete */}
        {allResults.length > 0 && !isProcessing && (
          <div className="mb-8">
            <CompactSearchInterface
              onSearch={handleSearch}
              onClear={handleClearSearch}
              isSearching={isSearching}
              hasResults={showingSearchResults}
              totalResults={showingSearchResults ? searchResults.length : allResults.length}
            />
          </div>
        )}

        {/* Results Display */}
        {(allResults.length > 0 || searchResults.length > 0) && !isProcessing && (
          <div>
            {/* Results Header with View Toggle */}
            <div className="flex items-center justify-between mb-8">
              <div className="text-center flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {showingSearchResults ? `Search Results for "${currentQuery}"` : 'Extraction Complete'}
                </h2>
                <p className="text-gray-400">
                  {showingSearchResults 
                    ? `Found ${searchResults.length} matching visual ${searchResults.length === 1 ? 'memory' : 'memories'}`
                    : `AI has analyzed ${allResults.length} visual ${allResults.length === 1 ? 'memory' : 'memories'}`
                  }
                </p>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-1 border border-gray-700">
                <button
                  onClick={() => setViewMode('carousel')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'carousel' 
                      ? 'bg-red-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                  title="Carousel View"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'list' 
                      ? 'bg-red-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Results Toggle Buttons */}
            {showingSearchResults && allResults.length > 0 && (
              <div className="flex justify-center mb-6">
                <div className="bg-gray-800/50 rounded-lg p-1 border border-gray-700">
                  <button
                    onClick={() => setShowingSearchResults(false)}
                    className={`px-4 py-2 rounded transition-all ${
                      !showingSearchResults 
                        ? 'bg-red-600 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    All Results ({allResults.length})
                  </button>
                  <button
                    onClick={() => setShowingSearchResults(true)}
                    className={`px-4 py-2 rounded transition-all ${
                      showingSearchResults 
                        ? 'bg-red-600 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    Search Results ({searchResults.length})
                  </button>
                </div>
              </div>
            )}

            {/* Display Results */}
            {viewMode === 'carousel' ? (
              <ImageCarouselWithFlip
                results={showingSearchResults ? searchResults : allResults}
                title={showingSearchResults ? `Search: "${currentQuery}"` : 'Your Visual Memories'}
              />
            ) : (
              <ExtractionResults results={showingSearchResults ? searchResults : allResults} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;