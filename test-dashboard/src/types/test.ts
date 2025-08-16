export type TestSuite = 'backend' | 'frontend' | 'all';

export type TestStatus = 'passed' | 'failed' | 'running' | 'pending';

export interface TestResult {
  id: string;
  name: string;
  suite: TestSuite;
  status: TestStatus;
  duration: number;
  file: string;
  description: string;
  error?: string;
  output?: string;
}

export interface TestMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  coverage: {
    backend: number;
    frontend: number;
  };
  duration: number;
}