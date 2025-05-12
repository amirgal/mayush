import React, { useState } from 'react';
import { useAuthContext } from '../../context/utils/authUtils';
import FileUpload from '../ui/FileUpload';
import type { ImageAttachment } from '../../types';

type BookFormPageProps = {
  onSubmit: (content: string, images: ImageAttachment[]) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
};

const BookFormPage: React.FC<BookFormPageProps> = ({ onSubmit, onCancel, isSubmitting }) => {
  const [content, setContent] = useState<string>('');
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const { displayName } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      await onSubmit(content, images);
    }
  };

  return (
    <div className="relative z-[1] flex-1 p-4">
      <h2 className="text-2xl font-bold mb-6 text-book-dark text-center">הוסף ברכה</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1 text-book-dark/80 text-right">שם</label>
          <input
            type="text"
            value={displayName || ''}
            disabled={true}
            className="w-full px-3 py-2 border rounded-md focus:outline-none bg-white border-book-accent/30 focus:border-book-accent text-right"
            readOnly
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-book-dark/80 text-right">הברכה שלך</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="כתוב את הברכה שלך כאן..."
            className="w-full px-3 py-2 border rounded-md focus:outline-none min-h-[120px] resize-y bg-white border-book-accent/30 focus:border-book-accent text-right"
            disabled={isSubmitting}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-book-dark/80 text-right">תמונות (אופציונלי)</label>
          <FileUpload
            onImagesChange={setImages}
            disabled={isSubmitting}
            maxFiles={3}
            maxSizeMB={5}
          />
        </div>
        
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-white border border-book-accent/30 text-book-dark rounded-md hover:bg-book-accent/10 transition-colors"
          >
            ביטול
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-book-accent text-white rounded-md hover:bg-book-dark transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'שולח...' : 'שלח ברכה'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookFormPage;
