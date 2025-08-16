import React, { useCallback, useState } from 'react';
import { Upload, FolderOpen, Loader2, CheckCircle, AlertCircle, FileImage, Zap } from 'lucide-react';
import { uploadScreenshots, processFolder } from '../api/screenshots';

interface CompactUploadProps {
  onUploadComplete: (files: any[]) => void;
  onProcessingStart: () => void;
  onProcessingComplete: () => void;
}

const CompactUpload: React.FC<CompactUploadProps> = ({ 
  onUploadComplete, 
  onProcessingStart, 
  onProcessingComplete 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [folderPath, setFolderPath] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

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
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    if (files.length > 0) {
      await handleUpload(files);
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      await handleUpload(files);
    }
  }, []);

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
      setUploadMessage(`Uploaded ${files.length} images successfully`);
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
      }, 3000);
    }
  };

  const handleFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderPath.trim()) return;

    setIsUploading(true);
    setUploadStatus('idle');
    onProcessingStart();
    
    try {
      const response = await processFolder(folderPath);
      setUploadStatus('success');
      setUploadMessage(response.message);
      setFolderPath('');
      onUploadComplete([]);
      setTimeout(() => {
        onProcessingComplete();
      }, 2000);
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage('Failed to process folder. Please check the path.');
      console.error('Folder processing error:', error);
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadMessage('');
      }, 5000);
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileImage className="w-5 h-5 text-red-500" />
        <h3 className="text-lg font-semibold text-white">Add Your Visual Memories</h3>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* File Upload */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer group ${
            isDragging 
              ? 'border-red-500 bg-red-500/10' 
              : 'border-gray-600 hover:border-red-500 hover:bg-gray-800/50'
          }`}
        >
          <input
            type="file"
            id="file-upload"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          
          <div className="relative z-0 pointer-events-none">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto mb-2" />
            ) : (
              <Upload className="w-8 h-8 text-gray-400 group-hover:text-red-500 mx-auto mb-2 transition-colors" />
            )}
            <p className="text-sm font-medium text-white mb-1">Upload Images</p>
            <p className="text-xs text-gray-400">Click or drag & drop</p>
          </div>
        </div>

        {/* Folder Processing */}
        <form onSubmit={handleFolderSubmit} className="space-y-2">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-red-500" />
            <label className="text-sm font-medium text-white">Process Folder</label>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={folderPath}
              onChange={(e) => setFolderPath(e.target.value)}
              placeholder="Folder path..."
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:border-red-500"
              disabled={isUploading}
            />
            <button
              type="submit"
              disabled={isUploading || !folderPath.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              Process
            </button>
          </div>
        </form>
      </div>

      {/* Upload Progress */}
      {isUploading && uploadProgress > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Uploading...</span>
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

      {/* Status Messages */}
      {uploadStatus !== 'idle' && (
        <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
          uploadStatus === 'success' ? 'bg-green-900/50 text-green-400 border border-green-700' : 'bg-red-900/50 text-red-400 border border-red-700'
        }`}>
          {uploadStatus === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{uploadMessage}</span>
        </div>
      )}
    </div>
  );
};

export default CompactUpload;