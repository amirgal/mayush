import { type FC, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';

type ImageModalProps = {
  imageUrl: string;
  altText: string;
  onClose: () => void;
};

const ImageModal: FC<ImageModalProps> = ({ imageUrl, altText, onClose }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999]"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Image Viewer"
    >
      {/* Close button on the backdrop */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        aria-label="Close image viewer"
      >
        <XMarkIcon className="h-8 w-8" />
      </button>

      <div className="w-screen h-screen flex items-center justify-center p-4" onClick={handleBackdropClick}>
        {/* Image container that prevents clicks from bubbling up */}
        <div className="relative" onClick={e => e.stopPropagation()}>
          <img
            src={imageUrl}
            alt={altText}
            className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ImageModal;