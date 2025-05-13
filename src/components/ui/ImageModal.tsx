import { type FC, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';

type ImageModalProps = {
  imageUrl: string;
  altText: string;
  onClose: () => void;
  applyEInkEffect?: boolean;
};

const ImageModal: FC<ImageModalProps> = ({ imageUrl, altText, onClose, applyEInkEffect = false }) => {
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
      className={`fixed inset-0 ${applyEInkEffect ? 'bg-[#f6f6f6]/95' : 'bg-book-light/95'} backdrop-blur-sm flex items-center justify-center z-[9999] animate-fade-in`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Image Viewer"
    >
      <div className="w-screen h-screen flex items-center justify-center p-4" onClick={handleBackdropClick}>
        <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
          <div className={`${applyEInkEffect ? 'bg-[#f6f6f6]' : 'bg-white'} rounded-xl shadow-2xl p-4 relative`}>
            <div className="relative">
              <img
                src={imageUrl}
                alt={altText}
                className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-lg mx-auto"
              />
              {applyEInkEffect && (
                <>
                  {/* Kindle e-ink overlay effects */}
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-200/10 to-gray-300/10 mix-blend-multiply"></div>
                  <div className="absolute inset-0 backdrop-grayscale backdrop-contrast-125 backdrop-brightness-90"></div>
                  <div className="absolute inset-0 bg-[url('/kindle-texture.png')] opacity-5 mix-blend-multiply"></div>
                </>
              )}
            </div>
            <button
              onClick={onClose}
              className={`absolute -top-4 -right-4 p-2 rounded-full ${applyEInkEffect ? 'bg-[#2F2F2F] hover:bg-[#444444]' : 'bg-book-dark hover:bg-book-accent'} text-white transition-colors shadow-lg`}
              aria-label="Close image viewer"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ImageModal;