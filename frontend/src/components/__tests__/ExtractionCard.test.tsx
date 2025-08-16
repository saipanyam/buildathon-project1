import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExtractionCard from '../ExtractionCard';
import type { SearchResult } from '../../types';

const mockResult: SearchResult = {
  filename: 'test-image.png',
  file_hash: 'abc123def456',
  confidence_score: 0.85,
  ocr_text: 'Sample extracted text from the image',
  visual_description: 'A screenshot showing a login form with username and password fields',
  match_type: 'combined',
  evaluation: {
    confidence_score: 0.85,
    quality_level: 'Good',
    total_score: 85,
    max_score: 100,
    evaluations: [
      {
        criteria: 'Text Completeness',
        score: 9,
        max_score: 10,
        percentage: 90,
        reasoning: 'Most text extracted successfully',
        suggestions: []
      },
      {
        criteria: 'Visual Element Coverage',
        score: 7,
        max_score: 10,
        percentage: 70,
        reasoning: 'Good visual element description',
        suggestions: ['Add more detail about UI components']
      }
    ],
    overall_suggestions: ['Improve visual element detection'],
    rubric: []
  }
};

const mockResultWithoutText: SearchResult = {
  ...mockResult,
  ocr_text: '',
  visual_description: 'An image with no visible text'
};

describe('ExtractionCard Component', () => {
  test('renders basic card information correctly', () => {
    render(<ExtractionCard result={mockResult} index={1} />);
    
    expect(screen.getByText('Visual Description')).toBeInTheDocument();
    expect(screen.getByText(mockResult.visual_description)).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText(mockResult.filename)).toBeInTheDocument();
  });

  test('displays extracted text correctly', () => {
    render(<ExtractionCard result={mockResult} index={1} />);
    
    expect(screen.getByText('Extracted Text')).toBeInTheDocument();
    expect(screen.getByText(mockResult.ocr_text)).toBeInTheDocument();
  });

  test('handles missing text gracefully', () => {
    render(<ExtractionCard result={mockResultWithoutText} index={1} />);
    
    expect(screen.getByText('No text found in this image')).toBeInTheDocument();
  });

  test('displays confidence score with correct styling', () => {
    render(<ExtractionCard result={mockResult} index={1} />);
    
    expect(screen.getByText('Extraction Quality')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.getByText('85.0%')).toBeInTheDocument();
  });

  test('shows confidence score context', () => {
    render(<ExtractionCard result={mockResult} index={1} />);
    
    expect(screen.getByText(/Based on text completeness, accuracy, visual coverage/)).toBeInTheDocument();
  });

  test('evaluation section is expandable', () => {
    render(<ExtractionCard result={mockResult} index={1} />);
    
    const evaluationButton = screen.getByText('Detailed Evaluation Results');
    expect(evaluationButton).toBeInTheDocument();
    
    // Initially collapsed
    expect(screen.queryByText('Text Completeness')).not.toBeInTheDocument();
    
    // Click to expand
    fireEvent.click(evaluationButton);
    
    // Should show evaluation details
    expect(screen.getByText('Text Completeness')).toBeInTheDocument();
    expect(screen.getByText('Visual Element Coverage')).toBeInTheDocument();
  });

  test('displays evaluation criteria correctly when expanded', () => {
    render(<ExtractionCard result={mockResult} index={1} />);
    
    const evaluationButton = screen.getByText('Detailed Evaluation Results');
    fireEvent.click(evaluationButton);
    
    // Check individual criteria
    expect(screen.getByText('Text Completeness')).toBeInTheDocument();
    expect(screen.getByText('9/10')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('Most text extracted successfully')).toBeInTheDocument();
    
    expect(screen.getByText('Visual Element Coverage')).toBeInTheDocument();
    expect(screen.getByText('7/10')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  test('shows overall suggestions when available', () => {
    render(<ExtractionCard result={mockResult} index={1} />);
    
    const evaluationButton = screen.getByText('Detailed Evaluation Results');
    fireEvent.click(evaluationButton);
    
    expect(screen.getByText('Key Improvement Areas:')).toBeInTheDocument();
    expect(screen.getByText('Improve visual element detection')).toBeInTheDocument();
  });

  test('shows individual criteria suggestions', () => {
    render(<ExtractionCard result={mockResult} index={1} />);
    
    const evaluationButton = screen.getByText('Detailed Evaluation Results');
    fireEvent.click(evaluationButton);
    
    expect(screen.getByText('Suggestions:')).toBeInTheDocument();
    expect(screen.getByText('Add more detail about UI components')).toBeInTheDocument();
  });

  test('handles image loading error', () => {
    render(<ExtractionCard result={mockResult} index={1} />);
    
    const image = screen.getByRole('img');
    
    // Simulate image load error
    fireEvent.error(image);
    
    // Should show fallback content
    expect(screen.getByText(mockResult.filename)).toBeInTheDocument();
  });

  test('applies correct confidence score colors', () => {
    // Test excellent score (>= 0.8)
    const excellentResult = { ...mockResult, confidence_score: 0.9 };
    const { rerender } = render(<ExtractionCard result={excellentResult} index={1} />);
    expect(screen.getByText('Excellent')).toBeInTheDocument();
    
    // Test good score (>= 0.6)
    const goodResult = { ...mockResult, confidence_score: 0.7 };
    rerender(<ExtractionCard result={goodResult} index={1} />);
    expect(screen.getByText('Good')).toBeInTheDocument();
    
    // Test fair score (>= 0.4)
    const fairResult = { ...mockResult, confidence_score: 0.5 };
    rerender(<ExtractionCard result={fairResult} index={1} />);
    expect(screen.getByText('Fair')).toBeInTheDocument();
    
    // Test needs review score (< 0.4)
    const poorResult = { ...mockResult, confidence_score: 0.3 };
    rerender(<ExtractionCard result={poorResult} index={1} />);
    expect(screen.getByText('Needs Review')).toBeInTheDocument();
  });

  test('handles result without evaluation', () => {
    const resultWithoutEvaluation = { ...mockResult, evaluation: undefined };
    render(<ExtractionCard result={resultWithoutEvaluation} index={1} />);
    
    // Should not show evaluation section
    expect(screen.queryByText('Detailed Evaluation Results')).not.toBeInTheDocument();
  });

  test('shows correct image URL', () => {
    render(<ExtractionCard result={mockResult} index={1} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', `http://localhost:8000/uploads/${mockResult.file_hash}.png`);
    expect(image).toHaveAttribute('alt', mockResult.filename);
  });

  test('maintains accessibility standards', () => {
    render(<ExtractionCard result={mockResult} index={1} />);
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Visual Description');
    expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Extracted Text');
    
    // Check for button accessibility
    const evaluationButton = screen.getByRole('button', { name: /detailed evaluation results/i });
    expect(evaluationButton).toBeInTheDocument();
    
    // Check image alt text
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt', mockResult.filename);
  });
});