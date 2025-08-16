import React from 'react';
import { BarChart3, TrendingUp, Shield, Clock } from 'lucide-react';
import { TestMetrics as TestMetricsType } from '../types/test';

interface TestMetricsProps {
  metrics: TestMetricsType;
}

const TestMetrics: React.FC<TestMetricsProps> = ({ metrics }) => {
  const successRate = metrics.totalTests > 0 ? (metrics.passedTests / metrics.totalTests) * 100 : 0;
  const avgCoverage = (metrics.coverage.backend + metrics.coverage.frontend) / 2;

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-400';
    if (rate >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 80) return 'text-green-400';
    if (coverage >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-red-500" />
        Test Metrics & Coverage
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Success Rate */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span className={`text-xl font-bold ${getSuccessRateColor(successRate)}`}>
              {successRate.toFixed(1)}%
            </span>
          </div>
          <h4 className="text-sm font-medium text-gray-300">Success Rate</h4>
          <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                successRate >= 90 ? 'bg-green-500' :
                successRate >= 70 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${successRate}%` }}
            />
          </div>
        </div>

        {/* Average Coverage */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span className={`text-xl font-bold ${getCoverageColor(avgCoverage)}`}>
              {avgCoverage.toFixed(1)}%
            </span>
          </div>
          <h4 className="text-sm font-medium text-gray-300">Avg Coverage</h4>
          <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                avgCoverage >= 80 ? 'bg-green-500' :
                avgCoverage >= 60 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${avgCoverage}%` }}
            />
          </div>
        </div>

        {/* Total Tests */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <span className="text-xl font-bold text-white">
              {metrics.totalTests}
            </span>
          </div>
          <h4 className="text-sm font-medium text-gray-300">Total Tests</h4>
          <div className="mt-2 text-xs text-gray-400">
            {metrics.passedTests} passed, {metrics.failedTests} failed
          </div>
        </div>

        {/* Duration */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-orange-400" />
            <span className="text-xl font-bold text-white">
              {metrics.duration.toFixed(1)}s
            </span>
          </div>
          <h4 className="text-sm font-medium text-gray-300">Duration</h4>
          <div className="mt-2 text-xs text-gray-400">
            {metrics.totalTests > 0 ? (metrics.duration / metrics.totalTests).toFixed(2) : '0'}s avg per test
          </div>
        </div>
      </div>

      {/* Coverage Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
          <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            Backend Coverage
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Lines</span>
              <span className={`font-semibold ${getCoverageColor(metrics.coverage.backend)}`}>
                {metrics.coverage.backend}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  metrics.coverage.backend >= 80 ? 'bg-green-500' :
                  metrics.coverage.backend >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${metrics.coverage.backend}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
          <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-400" />
            Frontend Coverage
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Lines</span>
              <span className={`font-semibold ${getCoverageColor(metrics.coverage.frontend)}`}>
                {metrics.coverage.frontend}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  metrics.coverage.frontend >= 80 ? 'bg-green-500' :
                  metrics.coverage.frontend >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${metrics.coverage.frontend}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Test Summary */}
      <div className="mt-6 p-4 bg-gray-900/30 rounded-lg border border-gray-600">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Test Summary</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-400">{metrics.passedTests}</div>
            <div className="text-xs text-gray-400">Passed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">{metrics.failedTests}</div>
            <div className="text-xs text-gray-400">Failed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-400">
              {metrics.totalTests - metrics.passedTests - metrics.failedTests}
            </div>
            <div className="text-xs text-gray-400">Skipped</div>
          </div>
        </div>
      </div>

      {/* Quality Gate */}
      <div className="mt-4 p-3 rounded-lg border border-gray-600 bg-gray-900/30">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300">Quality Gate</span>
          <div className="flex items-center gap-2">
            {successRate >= 90 && avgCoverage >= 80 ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-400 font-medium">PASSED</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-400 font-medium">FAILED</span>
              </>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Requires ≥90% success rate and ≥80% coverage
        </div>
      </div>
    </div>
  );
};

export default TestMetrics;