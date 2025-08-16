import React, { useState, useEffect } from 'react';
import { Settings, TrendingUp, Lightbulb, Save, RotateCcw, BarChart3 } from 'lucide-react';

interface PromptPerformance {
  version: string;
  total_uses: number;
  average_score: number;
  min_score: number;
  max_score: number;
  trend: string;
  recent_scores?: number[];
}

interface PromptData {
  prompt: string;
  performance: PromptPerformance;
}

interface Suggestion {
  category: string;
  issue: string;
  suggestion: string;
  prompt_addition: string;
}

interface PromptManagerProps {
  isOpen: boolean;
  onClose: () => void;
  evaluationScores?: Record<string, number>;
}

const PromptManager: React.FC<PromptManagerProps> = ({ isOpen, onClose, evaluationScores }) => {
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [editedPrompt, setEditedPrompt] = useState('');
  const [performance, setPerformance] = useState<PromptPerformance | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [improvedPrompt, setImprovedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('current');

  useEffect(() => {
    if (isOpen) {
      fetchCurrentPrompt();
      if (evaluationScores) {
        fetchSuggestions();
      }
    }
  }, [isOpen, evaluationScores]);

  const fetchCurrentPrompt = async () => {
    try {
      const response = await fetch('http://localhost:8000/prompts/current');
      const data: PromptData = await response.json();
      setCurrentPrompt(data.prompt);
      setEditedPrompt(data.prompt);
      setPerformance(data.performance);
    } catch (error) {
      console.error('Error fetching prompt:', error);
    }
  };

  const fetchSuggestions = async () => {
    if (!evaluationScores) return;
    
    try {
      const response = await fetch('http://localhost:8000/prompts/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evaluationScores)
      });
      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setImprovedPrompt(data.improved_prompt || '');
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const updatePrompt = async (newPrompt: string) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('new_prompt', newPrompt);
      
      const response = await fetch('http://localhost:8000/prompts/update', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        await fetchCurrentPrompt();
        setActiveTab('current');
      }
    } catch (error) {
      console.error('Error updating prompt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-400';
      case 'declining': return 'text-red-400';
      case 'stable': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '📊';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 rounded-xl border border-white/20 max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Prompt Management</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            ×
          </button>
        </div>

        {/* Performance Stats */}
        {performance && (
          <div className="p-6 border-b border-white/20 bg-black/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{performance.average_score.toFixed(1)}%</div>
                <div className="text-sm text-gray-400">Average Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{performance.total_uses}</div>
                <div className="text-sm text-gray-400">Total Uses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{performance.max_score}%</div>
                <div className="text-sm text-gray-400">Best Score</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getTrendColor(performance.trend)}`}>
                  {getTrendIcon(performance.trend)}
                </div>
                <div className="text-sm text-gray-400 capitalize">{performance.trend}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-white/20">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'current'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Current Prompt
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'suggestions'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Suggestions ({suggestions.length})
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'performance'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Performance
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'current' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Current Extraction Prompt (v{performance?.version || '1.0'})
                </label>
                <textarea
                  value={editedPrompt}
                  onChange={(e) => setEditedPrompt(e.target.value)}
                  className="w-full h-64 p-4 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 resize-none"
                  placeholder="Enter your prompt here..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => updatePrompt(editedPrompt)}
                  disabled={isLoading || editedPrompt === currentPrompt}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setEditedPrompt(currentPrompt)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
          )}

          {activeTab === 'suggestions' && (
            <div className="space-y-6">
              {suggestions.length === 0 ? (
                <div className="text-center py-8">
                  <Lightbulb className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <p className="text-gray-400">No suggestions available. Process more screenshots to get improvement recommendations.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="bg-black/20 rounded-lg p-4 border border-white/10">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">{suggestion.category}</h4>
                            <p className="text-sm text-gray-400 mt-1">{suggestion.issue}</p>
                            <p className="text-sm text-gray-300 mt-2">{suggestion.suggestion}</p>
                            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-300">
                              <strong>Suggested addition:</strong> {suggestion.prompt_addition}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {improvedPrompt && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Improved Prompt</h3>
                      <textarea
                        value={improvedPrompt}
                        readOnly
                        className="w-full h-48 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-white resize-none"
                      />
                      <button
                        onClick={() => updatePrompt(improvedPrompt)}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-white font-medium transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        {isLoading ? 'Applying...' : 'Apply Improved Prompt'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'performance' && performance && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black/20 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Score Distribution
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Average:</span>
                      <span className="text-white font-medium">{performance.average_score.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Range:</span>
                      <span className="text-white font-medium">{performance.min_score}% - {performance.max_score}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Evaluations:</span>
                      <span className="text-white font-medium">{performance.total_uses}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-black/20 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Recent Trend
                  </h4>
                  <div className={`text-2xl font-bold mb-2 ${getTrendColor(performance.trend)}`}>
                    {getTrendIcon(performance.trend)} {performance.trend.charAt(0).toUpperCase() + performance.trend.slice(1)}
                  </div>
                  {performance.recent_scores && (
                    <div className="text-xs text-gray-400">
                      Recent scores: {performance.recent_scores.slice(-5).join(', ')}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptManager;