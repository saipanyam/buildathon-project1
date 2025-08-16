import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  ChevronDown, 
  ChevronRight,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { TestResult, TestSuite } from '../types/test';

interface TestResultsProps {
  results: TestResult[];
  isRunning: boolean;
  currentSuite: TestSuite | null;
}

const TestResults: React.FC<TestResultsProps> = ({ results, isRunning, currentSuite }) => {
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');

  const toggleExpanded = (testId: string) => {
    const newExpanded = new Set(expandedTests);
    if (newExpanded.has(testId)) {
      newExpanded.delete(testId);
    } else {
      newExpanded.add(testId);
    }
    setExpandedTests(newExpanded);
  };

  const filteredResults = results.filter(result => {
    if (filter === 'all') return true;
    return result.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'border-green-500/30 bg-green-500/5';
      case 'failed':
        return 'border-red-500/30 bg-red-500/5';
      case 'running':
        return 'border-yellow-500/30 bg-yellow-500/5';
      default:
        return 'border-gray-500/30 bg-gray-500/5';
    }
  };

  const getSuiteColor = (suite: string) => {
    switch (suite) {
      case 'backend':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'frontend':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-red-500" />
          Test Results
        </h2>

        {results.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:border-red-500"
            >
              <option value="all">All Tests</option>
              <option value="passed">Passed Only</option>
              <option value="failed">Failed Only</option>
            </select>
          </div>
        )}
      </div>

      {isRunning && results.length === 0 && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            Running {currentSuite} tests...
          </h3>
          <p className="text-gray-400">
            This may take a few minutes to complete
          </p>
        </div>
      )}

      {!isRunning && results.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            No test results yet
          </h3>
          <p className="text-gray-400">
            Run a test suite to see results here
          </p>
        </div>
      )}

      {filteredResults.length > 0 && (
        <div className="space-y-3">
          {filteredResults.map((result) => (
            <div
              key={result.id}
              className={`border rounded-lg transition-all duration-200 ${getStatusColor(result.status)}`}
            >
              <div
                className="p-4 cursor-pointer hover:bg-white/5"
                onClick={() => toggleExpanded(result.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(result.status)}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white">{result.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded border ${getSuiteColor(result.suite)}`}>
                          {result.suite}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{result.description}</p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-400">
                        {result.duration.toFixed(2)}s
                      </div>
                      <div className="text-xs text-gray-500">
                        {result.file}
                      </div>
                    </div>
                    
                    <div className="ml-2">
                      {expandedTests.has(result.id) ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {expandedTests.has(result.id) && (
                <div className="px-4 pb-4 border-t border-gray-600/30">
                  <div className="mt-3 space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-1">Test Details</h4>
                      <div className="bg-gray-900/50 rounded p-3 text-sm">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Status:</span>
                            <span className={
                              result.status === 'passed' ? 'text-green-400' :
                              result.status === 'failed' ? 'text-red-400' :
                              'text-yellow-400'
                            }>
                              {result.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Duration:</span>
                            <span className="text-white">{result.duration.toFixed(3)}s</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">File:</span>
                            <span className="text-white">{result.file}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {result.error && (
                      <div>
                        <h4 className="text-sm font-medium text-red-400 mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          Error Details
                        </h4>
                        <div className="bg-red-900/20 border border-red-700/30 rounded p-3">
                          <pre className="text-sm text-red-300 whitespace-pre-wrap">
                            {result.error}
                          </pre>
                        </div>
                      </div>
                    )}

                    {result.output && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-1">Output</h4>
                        <div className="bg-gray-900/50 rounded p-3">
                          <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                            {result.output}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {results.length > 0 && filteredResults.length === 0 && (
        <div className="text-center py-8">
          <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-white mb-2">
            No tests match the current filter
          </h3>
          <p className="text-gray-400">
            Try changing the filter to see more results
          </p>
        </div>
      )}
    </div>
  );
};

export default TestResults;