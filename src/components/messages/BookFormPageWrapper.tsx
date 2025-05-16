import React from 'react';
import type { FC } from 'react';
import type { Message, ImageAttachment } from '../../types';
import BookFormPage from './BookFormPage';
import LineGuide from './LineGuide';

type BookFormPageWrapperProps = {
  position: 'left' | 'right' | 'mobile';
  onSubmit: (author: string, content: string, images: ImageAttachment[]) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  message?: Message | null;
};

const BookFormPageWrapper: FC<BookFormPageWrapperProps> = ({
  position,
  onSubmit,
  onCancel,
  isSubmitting,
  message
}) => {
  const isMobile = position === 'mobile';
  
  return (
    <div
      className={`
        ${isMobile ? 'w-full' : 'w-1/2'}
        p-8
        min-h-full 
        flex-grow 
        flex 
        flex-col
        relative
        ${position === 'left' 
          ? 'bg-gradient-to-bl from-white to-book-page border-l border-book-dark/10' 
          : 'bg-gradient-to-br from-book-page to-white'}
      `}
      id={`form-page-${position}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.03)_100%)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(0,0,0,0.02)_50%,transparent_100%)]"></div>

      <LineGuide />

      <BookFormPage
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        message={message}
      />

      {/* Page Edge Shadow */}
      <div 
        className={`absolute inset-y-0 ${position === 'left' ? 'left-0' : 'right-0'} w-8 bg-gradient-to-${position === 'left' ? 'r' : 'l'} from-black/5 to-transparent pointer-events-none`}
      ></div>
    </div>
  );
};

export default BookFormPageWrapper;
