import React from 'react';
import { Play, RefreshCw, Code, Monitor, Zap } from 'lucide-react';
import { TestSuite } from '../types/test';

interface TestRunnerProps {
  onRunTests: (suite: TestSuite) => void;
  isRunning: boolean;
  currentSuite: TestSuite | null;
}

const TestRunner: React.FC<TestRunnerProps> = ({ onRunTests, isRunning, currentSuite }) => {
  const testSuites = [
    {
      id: 'backend' as TestSuite,
      name: 'Backend Tests',
      description: 'API endpoints, services, and database tests',
      icon: Code,
      color: 'blue'
    },
    {
      id: 'frontend' as TestSuite,
      name: 'Frontend Tests',
      description: 'Component, integration, and E2E tests',
      icon: Monitor,
      color: 'green'
    },
    {
      id: 'all' as TestSuite,
      name: 'All Tests',
      description: 'Complete test suite execution',
      icon: Zap,
      color: 'red'
    }
  ];

  const getButtonColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-600 hover:bg-blue-700 border-blue-500';
      case 'green':
        return 'bg-green-600 hover:bg-green-700 border-green-500';
      case 'red':
        return 'bg-red-600 hover:bg-red-700 border-red-500';
      default:
        return 'bg-gray-600 hover:bg-gray-700 border-gray-500';
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Play className="w-6 h-6 text-red-500" />
        Test Runner
      </h2>

      <div className="space-y-4">
        {testSuites.map((suite) => {
          const Icon = suite.icon;
          const isCurrentlyRunning = isRunning && currentSuite === suite.id;
          
          return (
            <button
              key={suite.id}
              onClick={() => onRunTests(suite.id)}
              disabled={isRunning}
              className={`w-full p-4 rounded-lg border transition-all duration-200 ${
                isCurrentlyRunning
                  ? 'border-yellow-500 bg-yellow-500/10'
                  : isRunning
                  ? 'border-gray-600 bg-gray-700/50 opacity-50 cursor-not-allowed'
                  : `${getButtonColor(suite.color)} hover:scale-105`
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  {isCurrentlyRunning ? (
                    <RefreshCw className="w-6 h-6 text-yellow-400 animate-spin" />
                  ) : (
                    <Icon className={`w-6 h-6 ${
                      suite.color === 'blue' ? 'text-blue-400' :
                      suite.color === 'green' ? 'text-green-400' :
                      'text-red-400'
                    }`} />
                  )}
                </div>
                
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-white">{suite.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{suite.description}</p>
                  
                  {isCurrentlyRunning && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 text-yellow-400 text-sm">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                        Running tests...
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center">
                  {isRunning && currentSuite !== suite.id ? (
                    <div className="w-3 h-3 bg-gray-500 rounded-full" />
                  ) : isCurrentlyRunning ? (
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                  ) : (
                    <Play className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {isRunning && (
        <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">
              Running {currentSuite} tests...
            </span>
          </div>
          <p className="text-xs text-yellow-300 mt-1">
            Please wait while tests are being executed
          </p>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-600">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Test Environment</h4>
        <div className="space-y-1 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>Backend:</span>
            <span>localhost:8000</span>
          </div>
          <div className="flex justify-between">
            <span>Frontend:</span>
            <span>localhost:3000</span>
          </div>
          <div className="flex justify-between">
            <span>Dashboard:</span>
            <span>localhost:3001</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestRunner;