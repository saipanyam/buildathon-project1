import React, { useCallback, useState, useRef } from 'react';
import { Upload, FolderOpen, Loader2, CheckCircle, AlertCircle, FileImage, Zap, X } from 'lucide-react';
import { uploadScreenshots } from '../api/screenshots';

interface UnifiedUploadProps {
  onUploadComplete: (files: any[]) => void;
  onProcessingStart: () => void;
  onProcessingComplete: () => void;
}

interface FileValidationResult {
  validFiles: File[];
  oversizedFiles: File[];
  invalidFiles: File[];
}

const MAX_FILE_SIZE = 1024 * 1024; // 1MB in bytes
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];

const UnifiedUpload: React.FC<UnifiedUploadProps> = ({ 
  onUploadComplete, 
  onProcessingStart, 
  onProcessingComplete 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error' | 'warning'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: FileList | File[]): FileValidationResult => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const oversizedFiles: File[] = [];
    const invalidFiles: File[] = [];

    fileArray.forEach(file => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        invalidFiles.push(file);
      } else if (file.size > MAX_FILE_SIZE) {
        oversizedFiles.push(file);
      } else {
        validFiles.push(file);
      }
    });

    return { validFiles, oversizedFiles, invalidFiles };
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFiles(files);
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFiles(files);
    }
  }, []);

  const handleFolderSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Get folder path from the first file
      const firstFile = files[0];
      const folderPath = firstFile.webkitRelativePath.split('/')[0];
      setSelectedFolder(folderPath);
      await processFiles(files);
    }
  }, []);

  const processFiles = async (files: FileList) => {
    const validation = validateFiles(files);
    const errors: string[] = [];

    if (validation.invalidFiles.length > 0) {
      errors.push(`${validation.invalidFiles.length} non-image files skipped`);
    }
    
    if (validation.oversizedFiles.length > 0) {
      errors.push(`${validation.oversizedFiles.length} files over 1MB limit skipped`);
    }

    if (validation.validFiles.length === 0) {
      setUploadStatus('error');
      setUploadMessage('No valid images found. Please select images under 1MB.');
      setValidationErrors(errors);
      return;
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      setUploadStatus('warning');
    }

    await handleUpload(validation.validFiles);
  };

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    setUploadStatus('idle');
    setUploadProgress(0);
    onProcessingStart();
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const response = await uploadScreenshots(files);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setUploadStatus('success');
      const folderText = selectedFolder ? ` from folder "${selectedFolder}"` : '';
      setUploadMessage(`Successfully uploaded ${files.length} images${folderText}`);
      onUploadComplete(response.files);
      
      setTimeout(() => {
        onProcessingComplete();
      }, 2000);
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage('Upload failed. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadMessage('');
        setUploadProgress(0);
        setValidationErrors([]);
        setSelectedFolder('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (folderInputRef.current) folderInputRef.current.value = '';
      }, 5000);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const triggerFolderSelect = () => {
    folderInputRef.current?.click();
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileImage className="w-5 h-5 text-red-500" />
        <h3 className="text-lg font-semibold text-white">Add Your Visual Memories</h3>
        <div className="ml-auto text-xs text-gray-400">Max 1MB per image</div>
      </div>
      
      {/* Main Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer group ${
          isDragging 
            ? 'border-red-500 bg-red-500/10' 
            : 'border-gray-600 hover:border-red-500 hover:bg-gray-800/50'
        }`}
      >
        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={folderInputRef}
          type="file"
          multiple
          webkitdirectory=""
          onChange={handleFolderSelect}
          className="hidden"
        />
        
        <div className="space-y-4">
          {isUploading ? (
            <>
              <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto" />
              <p className="text-white font-medium">Processing your images...</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 group-hover:text-red-500 mx-auto transition-colors" />
              <div>
                <p className="text-lg font-medium text-white mb-2">
                  Drop images here or choose what to upload
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  Supported: JPEG, PNG, GIF, WebP, BMP • Max size: 1MB each
                </p>
                
                {/* Action Buttons */}
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={triggerFileSelect}
                    disabled={isUploading}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FileImage className="w-4 h-4" />
                    Select Images
                  </button>
                  
                  <button
                    onClick={triggerFolderSelect}
                    disabled={isUploading}
                    className="px-6 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FolderOpen className="w-4 h-4" />
                    Select Folder
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Selected Folder Display */}
      {selectedFolder && (
        <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-blue-400" />
          <span className="text-blue-300 text-sm">
            Processing folder: <span className="font-medium">{selectedFolder}</span>
          </span>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && uploadProgress > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Uploading images...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mt-4 space-y-2">
          {validationErrors.map((error, index) => (
            <div key={index} className="p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-300 text-sm">{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Status Messages */}
      {uploadStatus !== 'idle' && uploadMessage && (
        <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
          uploadStatus === 'success' 
            ? 'bg-green-900/50 text-green-400 border border-green-700' 
            : uploadStatus === 'warning'
            ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-700'
            : 'bg-red-900/50 text-red-400 border border-red-700'
        }`}>
          {uploadStatus === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{uploadMessage}</span>
        </div>
      )}

      {/* No Images Guidance */}
      {uploadStatus === 'error' && uploadMessage.includes('No valid images') && (
        <div className="mt-4 p-4 bg-gray-800/50 border border-gray-600 rounded-lg">
          <h4 className="text-white font-medium mb-2">Upload Requirements:</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Only image files (JPEG, PNG, GIF, WebP, BMP)</li>
            <li>• Maximum file size: 1MB per image</li>
            <li>• You can select multiple images or an entire folder</li>
            <li>• Drag and drop is also supported</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UnifiedUpload;