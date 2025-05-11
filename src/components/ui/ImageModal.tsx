import { type FC, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';

type ImageModalProps = {
  imageUrl: string;
  altText: string;
  onClose: () => void;
  applyEInkEffect?: boolean;
};

const ImageModal: FC<ImageModalProps> = ({ imageUrl, altText, onClose, applyEInkEffect }) => {
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
            className={`max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg ${applyEInkEffect ? 'opacity-80' : ''}`}
          />
          {applyEInkEffect && (
            <>
              {/* Kindle e-ink overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-gray-200/10 to-gray-300/10 mix-blend-multiply rounded-lg"></div>
              <div className="absolute inset-0 backdrop-grayscale backdrop-contrast-125 backdrop-brightness-90 rounded-lg"></div>
              <div className="absolute inset-0 bg-[url(\'/kindle-texture.png\')] opacity-5 mix-blend-multiply rounded-lg"></div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ImageModal;