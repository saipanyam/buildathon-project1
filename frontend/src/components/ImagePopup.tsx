import React, { useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Download, Maximize2 } from 'lucide-react';

interface ImagePopupProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  filename: string;
}

const ImagePopup: React.FC<ImagePopupProps> = ({ isOpen, onClose, imageUrl, filename }) => {
  const [isZoomed, setIsZoomed] = React.useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 max-w-7xl max-h-[90vh] w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 bg-gray-900/90 backdrop-blur-sm rounded-t-lg p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Maximize2 className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-white truncate">{filename}</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white"
              title={isZoomed ? "Fit to screen" : "Zoom to original size"}
            >
              {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
            </button>
            
            <button
              onClick={handleDownload}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white"
              title="Download image"
            >
              <Download className="w-4 h-4" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Image Container */}
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-b-lg border border-gray-700 overflow-hidden">
          <div 
            className={`overflow-auto max-h-[70vh] ${isZoomed ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
            onClick={() => !isZoomed && setIsZoomed(true)}
          >
            <img
              src={imageUrl}
              alt={filename}
              className={`transition-all duration-300 ${
                isZoomed 
                  ? 'max-w-none h-auto' 
                  : 'max-w-full max-h-[70vh] w-auto h-auto mx-auto block object-contain'
              }`}
              draggable={false}
            />
          </div>
        </div>
        
        {/* Footer with instructions */}
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-400">
            {isZoomed ? 'Scroll to pan • ' : 'Click image to zoom • '}
            Press <kbd className="px-1 bg-gray-700 rounded">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImagePopup;