import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

type ConfirmationDialogProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'מחק',
  cancelText = 'ביטול',
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Handle keyboard navigation and focus management
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Tab') {
        // Keep focus within the dialog
        const focusableElements = dialogRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>;

        if (!focusableElements) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Focus the confirm button when the dialog opens
    if (confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-dialog-title"
      dir="rtl"
      onClick={(e) => {
        // Close dialog when clicking on the backdrop
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div 
        ref={dialogRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 
          id="confirmation-dialog-title"
          className="text-xl font-bold text-book-dark mb-4"
        >
          {title}
        </h2>
        <p className="text-book-dark/80 mb-6">{message}</p>
        <div className="flex justify-start gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            tabIndex={0}
            ref={confirmButtonRef}
            autoFocus
          >
            {confirmText}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-book-dark/70 hover:text-book-dark transition-colors"
            tabIndex={0}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmationDialog;
