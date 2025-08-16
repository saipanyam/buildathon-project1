import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock the API calls
jest.mock('../api/screenshots', () => ({
  searchScreenshots: jest.fn(),
  uploadScreenshots: jest.fn()
}));

// Mock the components
jest.mock('../components/UnifiedUpload', () => {
  return function MockUnifiedUpload({ onUploadComplete, onProcessingStart, onProcessingComplete }: any) {
    return (
      <div data-testid="unified-upload">
        <button onClick={() => onUploadComplete([{ filename: 'test.png' }])}>
          Mock Upload Complete
        </button>
        <button onClick={onProcessingStart}>Mock Processing Start</button>
        <button onClick={onProcessingComplete}>Mock Processing Complete</button>
      </div>
    );
  };
});

jest.mock('../components/ExtractionResults', () => {
  return function MockExtractionResults({ results }: any) {
    return (
      <div data-testid="extraction-results">
        Results: {results.length}
      </div>
    );
  };
});

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders main title and description', () => {
    render(<App />);
    
    expect(screen.getByText(/Visual Memory Search/)).toBeInTheDocument();
    expect(screen.getByText(/Yantra/)).toBeInTheDocument();
    expect(screen.getByText(/AI-powered machine that instantly analyzes/)).toBeInTheDocument();
  });

  test('shows feature cards initially', () => {
    render(<App />);
    
    expect(screen.getByText('Text Extraction')).toBeInTheDocument();
    expect(screen.getByText('Visual Analysis')).toBeInTheDocument();
    expect(screen.getByText('Smart Search')).toBeInTheDocument();
    
    // Check updated descriptions
    expect(screen.getByText(/Instantly extracts all readable text.*using AI/)).toBeInTheDocument();
    expect(screen.getByText(/Describes what the image shows.*content, purpose, and context/)).toBeInTheDocument();
  });

  test('renders upload component', () => {
    render(<App />);
    
    expect(screen.getByTestId('unified-upload')).toBeInTheDocument();
  });

  test('handles upload completion', async () => {
    const { searchScreenshots } = require('../api/screenshots');
    searchScreenshots.mockResolvedValue([
      {
        filename: 'test.png',
        file_hash: 'abc123',
        confidence_score: 0.8,
        ocr_text: 'Test text',
        visual_description: 'Test description',
        match_type: 'combined'
      }
    ]);

    render(<App />);
    
    // Initially should show feature cards
    expect(screen.getByText('Text Extraction')).toBeInTheDocument();
    
    // Trigger upload completion
    fireEvent.click(screen.getByText('Mock Upload Complete'));
    
    // Feature cards should be hidden after upload
    expect(screen.queryByText('Text Extraction')).not.toBeInTheDocument();
  });

  test('shows processing state', () => {
    render(<App />);
    
    // Start processing
    fireEvent.click(screen.getByText('Mock Processing Start'));
    
    expect(screen.getByText('AI Extraction in Progress')).toBeInTheDocument();
    expect(screen.getByText(/Analyzing visual memories with.*AI/)).toBeInTheDocument();
  });

  test('displays extraction results after processing', async () => {
    const { searchScreenshots } = require('../api/screenshots');
    searchScreenshots.mockResolvedValue([
      {
        filename: 'test.png',
        file_hash: 'abc123',
        confidence_score: 0.8,
        ocr_text: 'Test text',
        visual_description: 'Test description',
        match_type: 'combined'
      }
    ]);

    render(<App />);
    
    // Trigger upload completion and processing
    fireEvent.click(screen.getByText('Mock Upload Complete'));
    fireEvent.click(screen.getByText('Mock Processing Start'));
    fireEvent.click(screen.getByText('Mock Processing Complete'));
    
    await waitFor(() => {
      expect(screen.getByText('Extraction Complete')).toBeInTheDocument();
      expect(screen.getByTestId('extraction-results')).toBeInTheDocument();
    });
  });

  test('shows correct visual memory count', async () => {
    const { searchScreenshots } = require('../api/screenshots');
    searchScreenshots.mockResolvedValue([
      { filename: 'test1.png', file_hash: 'abc123' },
      { filename: 'test2.png', file_hash: 'def456' }
    ]);

    render(<App />);
    
    fireEvent.click(screen.getByText('Mock Upload Complete'));
    fireEvent.click(screen.getByText('Mock Processing Complete'));
    
    await waitFor(() => {
      expect(screen.getByText(/AI has analyzed 2 visual memories/)).toBeInTheDocument();
    });
  });

  test('handles single visual memory count correctly', async () => {
    const { searchScreenshots } = require('../api/screenshots');
    searchScreenshots.mockResolvedValue([
      { filename: 'test.png', file_hash: 'abc123' }
    ]);

    render(<App />);
    
    fireEvent.click(screen.getByText('Mock Upload Complete'));
    fireEvent.click(screen.getByText('Mock Processing Complete'));
    
    await waitFor(() => {
      expect(screen.getByText(/AI has analyzed 1 visual memory/)).toBeInTheDocument();
    });
  });

  test('clears results on new upload', () => {
    render(<App />);
    
    // First upload
    fireEvent.click(screen.getByText('Mock Upload Complete'));
    
    // Second upload should clear previous results
    fireEvent.click(screen.getByText('Mock Upload Complete'));
    
    // Should trigger the clear functionality
    expect(screen.queryByText('Extraction Complete')).not.toBeInTheDocument();
  });

  test('handles processing errors gracefully', async () => {
    const { searchScreenshots } = require('../api/screenshots');
    searchScreenshots.mockRejectedValue(new Error('Processing failed'));

    render(<App />);
    
    fireEvent.click(screen.getByText('Mock Upload Complete'));
    fireEvent.click(screen.getByText('Mock Processing Complete'));
    
    // Should handle error without crashing
    await waitFor(() => {
      expect(screen.queryByText('Extraction Complete')).not.toBeInTheDocument();
    });
  });

  test('shows progress bar with correct percentage', async () => {
    render(<App />);
    
    fireEvent.click(screen.getByText('Mock Processing Start'));
    
    // Should show progress bar
    expect(screen.getByText(/Analyzing visual memories/)).toBeInTheDocument();
    
    // Progress should start at 0
    const progressText = screen.getByText(/0%/);
    expect(progressText).toBeInTheDocument();
  });

  test('maintains Netflix-style design elements', () => {
    render(<App />);
    
    // Check for Netflix-style background and styling
    const mainContainer = screen.getByText(/Visual Memory Search/).closest('div');
    expect(mainContainer).toHaveClass('bg-black');
    
    // Check for red accent color in title
    expect(screen.getByText('Yantra')).toHaveClass('text-red-500');
  });

  test('shows loading animation during processing', () => {
    render(<App />);
    
    fireEvent.click(screen.getByText('Mock Processing Start'));
    
    // Should show loading spinner
    const loadingElement = document.querySelector('.animate-spin');
    expect(loadingElement).toBeInTheDocument();
  });

  test('feature cards have proper icons and animations', () => {
    render(<App />);
    
    // Check for feature card animations and styling
    const textExtractionCard = screen.getByText('Text Extraction').closest('div');
    expect(textExtractionCard).toHaveClass('group');
    
    const visualAnalysisCard = screen.getByText('Visual Analysis').closest('div');
    expect(visualAnalysisCard).toHaveClass('group');
    
    const smartSearchCard = screen.getByText('Smart Search').closest('div');
    expect(smartSearchCard).toHaveClass('group');
  });

  test('maintains accessibility standards', () => {
    render(<App />);
    
    // Check for proper heading hierarchy
    expect(screen.getByRole('banner')).toBeInTheDocument();
    
    // Check for proper semantic structure
    const mainTitle = screen.getByText(/Visual Memory Search/);
    expect(mainTitle.tagName).toBe('H1');
    
    // Check for proper alt text would be tested in component-specific tests
    // but we can verify overall structure
    expect(document.querySelector('main, [role="main"]')).toBeInTheDocument();
  });
});