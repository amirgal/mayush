import React, { useState, useCallback, useEffect } from 'react';
import type { FC } from 'react';
import type { Message } from '../../types';
import MessageCard from './MessageCard';
import { useSwipeable } from 'react-swipeable';

type BookViewProps = {
  messages: Message[];
  isAdmin: boolean;
};

const BookView: FC<BookViewProps> = ({ messages, isAdmin }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [currentSpread, setCurrentSpread] = useState(0);
  const totalSpreads = isMobile ? messages.length : Math.ceil(messages.length / 2);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePrevPage = useCallback(() => {
    if (currentSpread > 0) {
      setCurrentSpread(currentSpread - 1);
    }
  }, [currentSpread]);

  const handleNextPage = useCallback(() => {
    if (currentSpread < totalSpreads - 1) {
      setCurrentSpread(currentSpread + 1);
    }
  }, [currentSpread, totalSpreads]);

  const leftPageMessage = isMobile ? messages[currentSpread] : messages[currentSpread * 2];
  const rightPageMessage = isMobile ? null : messages[currentSpread * 2 + 1];

  const handleKeyDown = useCallback((callback: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      callback();
    }
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: () => handleNextPage(),
    onSwipedRight: () => handlePrevPage(),
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  // Removed mobile-specific logic

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" {...handlers}>
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={handlePrevPage} 
          disabled={currentSpread === 0}
          className={`btn-primary ${currentSpread === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          onKeyDown={handleKeyDown(handlePrevPage)}
          aria-label="Previous page"
          tabIndex={0}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 19l-7-7 7-7" 
            />
          </svg>
        </button>
        
        <div className="text-book-dark font-book-title">
          {isMobile 
            ? `Page ${currentSpread + 1} of ${messages.length}` 
            : `Page ${currentSpread * 2 + 1} - ${currentSpread * 2 + 2} of ${messages.length}`
          }
        </div>
        
        <button 
          onClick={handleNextPage} 
          disabled={currentSpread === totalSpreads - 1 || (isMobile && currentSpread === messages.length - 1)}
          className={`btn-primary ${(currentSpread === totalSpreads - 1 || (isMobile && currentSpread === messages.length - 1)) ? 'opacity-50 cursor-not-allowed' : ''}`}
          onKeyDown={handleKeyDown(handleNextPage)}
          aria-label="Next page"
          tabIndex={0}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
        </button>
      </div>
      
      <div className={`
        relative
        flex 
        ${isMobile ? 'flex-col bg-book-page rounded-xl' : 'flex-row bg-gradient-to-r from-book-accent/5 via-book-page to-book-accent/5'}
        min-h-[80vh] 
        mx-auto
        overflow-hidden
        shadow-2xl
        ${!isMobile ? 'before:content-[""] before:absolute before:top-0 before:bottom-0 before:left-1/2 before:w-[3px] before:bg-book-dark/20 before:z-10 before:shadow-[0_0_10px_rgba(0,0,0,0.2)]' : ''}
        ${!isMobile ? 'after:content-[""] after:absolute after:w-full after:h-full after:top-0 after:left-0 after:pointer-events-none after:shadow-[inset_0_0_30px_rgba(0,0,0,0.2)]' : ''}
        border border-book-dark/20
        book-spine
        `}
      >
        {/* Left Page */}
        {leftPageMessage && (
          <div 
            key={leftPageMessage._id} 
            className={`${isMobile ? 'w-full' : 'w-1/2'} min-h-full flex-grow flex items-stretch justify-center p-8 ${!isMobile ? 'pr-12 border-r border-book-dark/10' : ''} handwritten-bg`}
          >
            <MessageCard 
              message={leftPageMessage} 
              isAdmin={isAdmin} 
              viewMode="book" 
            />
          </div>
        )}
        
        {/* Right Page */}
        {!isMobile && rightPageMessage && (
          <div 
            key={rightPageMessage._id} 
            className={`${isMobile ? 'w-full' : 'w-1/2'} min-h-full flex-grow flex items-stretch justify-center p-8 pl-12 handwritten-bg`}
          >
            <MessageCard 
              message={rightPageMessage} 
              isAdmin={isAdmin} 
              viewMode="book" 
            />
          </div>
        )}
        
        {/* Page number */}
        <div className={`absolute bottom-4 ${isMobile ? 'right-4' : 'right-1/4'} text-book-dark/40 text-sm italic transform -translate-x-1/2`}>
          {isMobile ? currentSpread + 1 : currentSpread * 2 + 1}
        </div>
        
        {!isMobile && (
          <div className="absolute bottom-4 right-4 text-book-dark/40 text-sm italic">
            {currentSpread * 2 + 2}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookView;
