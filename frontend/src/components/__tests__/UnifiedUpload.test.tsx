import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import UnifiedUpload from '../UnifiedUpload';

// Mock the API call
jest.mock('../../api/screenshots', () => ({
  uploadScreenshots: jest.fn()
}));

const mockProps = {
  onUploadComplete: jest.fn(),
  onProcessingStart: jest.fn(),
  onProcessingComplete: jest.fn()
};

// Helper function to create mock files
const createMockFile = (name: string, size: number, type: string): File => {
  const file = new File([''], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('UnifiedUpload Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders upload interface correctly', () => {
    render(<UnifiedUpload {...mockProps} />);
    
    expect(screen.getByText('Add Your Visual Memories')).toBeInTheDocument();
    expect(screen.getByText('Drop images here or choose what to upload')).toBeInTheDocument();
    expect(screen.getByText('Select Images')).toBeInTheDocument();
    expect(screen.getByText('Select Folder')).toBeInTheDocument();
    expect(screen.getByText('Max 1MB per image')).toBeInTheDocument();
  });

  test('shows file size and type restrictions', () => {
    render(<UnifiedUpload {...mockProps} />);
    
    expect(screen.getByText(/Supported: JPEG, PNG, GIF, WebP, BMP/)).toBeInTheDocument();
    expect(screen.getByText(/Max size: 1MB each/)).toBeInTheDocument();
  });

  test('validates file types correctly', async () => {
    const { uploadScreenshots } = require('../../api/screenshots');
    uploadScreenshots.mockResolvedValue({ files: [] });

    render(<UnifiedUpload {...mockProps} />);
    
    const validFile = createMockFile('test.png', 500000, 'image/png');
    const invalidFile = createMockFile('test.txt', 1000, 'text/plain');
    
    const fileInput = screen.getByText('Select Images').closest('div')?.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Mock the files property
    Object.defineProperty(fileInput, 'files', {
      value: [validFile, invalidFile],
      writable: false
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText(/non-image files skipped/)).toBeInTheDocument();
    });
  });

  test('validates file size limits', async () => {
    const { uploadScreenshots } = require('../../api/screenshots');
    uploadScreenshots.mockResolvedValue({ files: [] });

    render(<UnifiedUpload {...mockProps} />);
    
    const oversizedFile = createMockFile('large.png', 2000000, 'image/png'); // 2MB
    const validFile = createMockFile('small.png', 500000, 'image/png'); // 500KB
    
    const fileInput = screen.getByText('Select Images').closest('div')?.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(fileInput, 'files', {
      value: [oversizedFile, validFile],
      writable: false
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText(/files over 1MB limit skipped/)).toBeInTheDocument();
    });
  });

  test('handles successful upload', async () => {
    const { uploadScreenshots } = require('../../api/screenshots');
    uploadScreenshots.mockResolvedValue({ 
      files: [{ filename: 'test.png', hash: 'abc123' }] 
    });

    render(<UnifiedUpload {...mockProps} />);
    
    const validFile = createMockFile('test.png', 500000, 'image/png');
    const fileInput = screen.getByText('Select Images').closest('div')?.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(fileInput, 'files', {
      value: [validFile],
      writable: false
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText(/Successfully uploaded 1 images/)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(mockProps.onUploadComplete).toHaveBeenCalled();
    expect(mockProps.onProcessingStart).toHaveBeenCalled();
  });

  test('handles upload error', async () => {
    const { uploadScreenshots } = require('../../api/screenshots');
    uploadScreenshots.mockRejectedValue(new Error('Upload failed'));

    render(<UnifiedUpload {...mockProps} />);
    
    const validFile = createMockFile('test.png', 500000, 'image/png');
    const fileInput = screen.getByText('Select Images').closest('div')?.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(fileInput, 'files', {
      value: [validFile],
      writable: false
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText('Upload failed. Please try again.')).toBeInTheDocument();
    });
  });

  test('shows no valid images error', async () => {
    render(<UnifiedUpload {...mockProps} />);
    
    const invalidFile = createMockFile('test.txt', 1000, 'text/plain');
    const fileInput = screen.getByText('Select Images').closest('div')?.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(fileInput, 'files', {
      value: [invalidFile],
      writable: false
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText('No valid images found. Please select images under 1MB.')).toBeInTheDocument();
    });
  });

  test('displays upload requirements when error occurs', async () => {
    render(<UnifiedUpload {...mockProps} />);
    
    const invalidFile = createMockFile('test.txt', 1000, 'text/plain');
    const fileInput = screen.getByText('Select Images').closest('div')?.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(fileInput, 'files', {
      value: [invalidFile],
      writable: false
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText('Upload Requirements:')).toBeInTheDocument();
      expect(screen.getByText(/Only image files \(JPEG, PNG, GIF, WebP, BMP\)/)).toBeInTheDocument();
      expect(screen.getByText(/Maximum file size: 1MB per image/)).toBeInTheDocument();
    });
  });

  test('shows progress bar during upload', async () => {
    const { uploadScreenshots } = require('../../api/screenshots');
    // Make the upload take some time
    uploadScreenshots.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ files: [] }), 1000))
    );

    render(<UnifiedUpload {...mockProps} />);
    
    const validFile = createMockFile('test.png', 500000, 'image/png');
    const fileInput = screen.getByText('Select Images').closest('div')?.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(fileInput, 'files', {
      value: [validFile],
      writable: false
    });

    fireEvent.change(fileInput);

    // Should show processing state
    await waitFor(() => {
      expect(screen.getByText('Processing your images...')).toBeInTheDocument();
    });

    // Should show progress
    expect(screen.getByText('Uploading images...')).toBeInTheDocument();
  });

  test('handles drag and drop', async () => {
    const { uploadScreenshots } = require('../../api/screenshots');
    uploadScreenshots.mockResolvedValue({ files: [] });

    render(<UnifiedUpload {...mockProps} />);
    
    const dropZone = screen.getByText('Drop images here or choose what to upload').closest('div');
    const validFile = createMockFile('test.png', 500000, 'image/png');

    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: {
        files: [validFile]
      }
    });

    fireEvent(dropZone!, dropEvent);

    await waitFor(() => {
      expect(mockProps.onProcessingStart).toHaveBeenCalled();
    });
  });

  test('disables buttons during upload', async () => {
    const { uploadScreenshots } = require('../../api/screenshots');
    uploadScreenshots.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ files: [] }), 1000))
    );

    render(<UnifiedUpload {...mockProps} />);
    
    const selectImagesBtn = screen.getByText('Select Images');
    const selectFolderBtn = screen.getByText('Select Folder');
    
    // Initially enabled
    expect(selectImagesBtn).not.toBeDisabled();
    expect(selectFolderBtn).not.toBeDisabled();

    // Start upload
    const validFile = createMockFile('test.png', 500000, 'image/png');
    const fileInput = screen.getByText('Select Images').closest('div')?.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(fileInput, 'files', {
      value: [validFile],
      writable: false
    });

    fireEvent.change(fileInput);

    // Should be disabled during upload
    await waitFor(() => {
      expect(selectImagesBtn).toBeDisabled();
      expect(selectFolderBtn).toBeDisabled();
    });
  });
});