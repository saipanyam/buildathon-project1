import React, { useState } from 'react';
import { Upload } from 'lucide-react';

interface SimpleUploadProps {
  onUploadComplete: () => void;
}

const SimpleUpload: React.FC<SimpleUploadProps> = ({ onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input triggered!');
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.type);
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      console.log('Uploading file:', selectedFile.name);
      // Simple test - just show success message
      alert(`File selected: ${selectedFile.name}`);
      onUploadComplete();
    }
  };

  return (
    <div className="p-8 border-2 border-dashed border-purple-400 rounded-lg bg-purple-50">
      <div className="text-center">
        <Upload className="w-12 h-12 text-purple-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Test Upload</h3>
        
        <input
          type="file"
          id="simple-upload"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-4"
        />
        
        {selectedFile && (
          <div className="mb-4">
            <p className="text-green-600">Selected: {selectedFile.name}</p>
            <button
              onClick={handleUpload}
              className="mt-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Upload
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleUpload;