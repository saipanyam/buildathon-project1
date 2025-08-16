import React, { useCallback, useState } from 'react';
import { Upload, FolderOpen, Loader2, CheckCircle, AlertCircle, Sparkles, Zap } from 'lucide-react';
import { uploadScreenshots, processFolder } from '../api/screenshots';

interface UploadSectionProps {
  onUploadComplete: () => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onUploadComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [folderPath, setFolderPath] = useState('');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    console.log('Files dropped');
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    console.log('Dropped files after filtering:', files);

    if (files.length > 0) {
      await handleUpload(files);
    } else {
      console.log('No valid image files in drop');
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed');
    const files = e.target.files ? Array.from(e.target.files) : [];
    console.log('Selected files:', files);
    if (files.length > 0) {
      await handleUpload(files);
    } else {
      console.log('No files selected');
    }
  }, []);

  const handleUpload = async (files: File[]) => {
    console.log('Starting upload with files:', files);
    setIsUploading(true);
    setUploadStatus('idle');
    
    try {
      console.log('Calling uploadScreenshots API...');
      const response = await uploadScreenshots(files);
      console.log('Upload response:', response);
      setUploadStatus('success');
      setUploadMessage(response.message);
      setTimeout(() => {
        onUploadComplete();
      }, 2000);
    } catch (error) {
      console.error('Upload error details:', error);
      setUploadStatus('error');
      if (error.response?.data?.detail) {
        setUploadMessage(`Upload failed: ${error.response.data.detail}`);
      } else {
        setUploadMessage('Upload failed. Please try again.');
      }
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadMessage('');
      }, 5000);
    }
  };

  const handleFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderPath.trim()) return;

    setIsUploading(true);
    setUploadStatus('idle');
    
    try {
      const response = await processFolder(folderPath);
      setUploadStatus('success');
      setUploadMessage(response.message);
      setFolderPath('');
      setTimeout(() => {
        onUploadComplete();
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
    <div className="space-y-6">
      {/* Drag and Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all group overflow-hidden ${
          isDragging 
            ? 'border-purple-400 bg-purple-500/10 scale-105 shadow-2xl shadow-purple-500/20' 
            : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/10'
        }`}
      >
        {/* Animated Background Elements - positioned to not block interaction */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-4 left-4 w-4 h-4 bg-purple-400 rounded-full animate-ping" />
          <div className="absolute top-8 right-8 w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
          <div className="absolute bottom-6 left-8 w-3 h-3 bg-blue-400 rounded-full animate-bounce" />
          <div className="absolute bottom-4 right-4 w-4 h-4 bg-yellow-400 rounded-full animate-ping animation-delay-1000" />
        </div>
        
        {/* Gradient overlay - non-blocking */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-pink-600/5 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all pointer-events-none" />
        <input
          type="file"
          id="file-upload"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />
        
        <div className="relative z-10 w-full h-full min-h-[200px] flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              {isUploading ? (
                <div className="relative">
                  <Loader2 className="w-16 h-16 text-purple-400 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-pink-400 animate-pulse" />
                  </div>
                </div>
              ) : (
                <div className="relative group-hover:scale-110 transition-transform duration-300">
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-30 group-hover:opacity-60 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-full">
                    <Upload className="w-12 h-12 text-white drop-shadow-lg" />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <Zap className="w-6 h-6 text-yellow-400 animate-bounce" />
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {isUploading ? 'AI Processing Magic in Progress...' : 'Upload Screenshots for AI Analysis'}
              </p>
              <p className="text-base text-gray-300 mb-2">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Supports PNG, JPG, GIF, and other image formats
                <Sparkles className="w-4 h-4" />
              </p>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {uploadStatus !== 'idle' && (
          <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
            uploadStatus === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {uploadStatus === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{uploadMessage}</span>
          </div>
        )}
      </div>

      {/* Folder Path Input */}
      <div className="relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-yellow-400/50 transition-all group">
        {/* Animated decorative elements */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <form onSubmit={handleFolderSubmit} className="space-y-4 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg blur opacity-30" />
              <div className="relative bg-gradient-to-br from-yellow-500 to-orange-500 p-2 rounded-lg">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Bulk Process Folder</h3>
              <p className="text-sm text-gray-400">Process entire directories at once</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={folderPath}
                onChange={(e) => setFolderPath(e.target.value)}
                placeholder="Enter folder path (e.g., /Users/username/Screenshots)"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
                disabled={isUploading}
              />
              {folderPath && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={isUploading || !folderPath.trim()}
              className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-bold hover:from-yellow-600 hover:to-orange-600 focus:ring-2 focus:ring-yellow-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-yellow-500/25"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Process
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadSection;