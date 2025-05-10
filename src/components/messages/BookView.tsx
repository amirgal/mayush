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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" {...handlers}>
      {/* Navigation Controls - Improved styling */}
      <div className="flex justify-between items-center mb-8 px-4">
        <button 
          onClick={handlePrevPage} 
          disabled={currentSpread === 0}
          className={`transform transition-all duration-300 ease-in-out rounded-full p-4 bg-book-dark/5 hover:bg-book-dark/10 ${
            currentSpread === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
          }`}
          onKeyDown={handleKeyDown(handlePrevPage)}
          aria-label="Previous page"
          tabIndex={0}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-book-dark" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="text-book-dark/70 font-book-title text-lg">
          {isMobile 
            ? `Page ${currentSpread + 1} of ${messages.length}` 
            : `Pages ${currentSpread * 2 + 1} - ${Math.min(currentSpread * 2 + 2, messages.length)} of ${messages.length}`
          }
        </div>
        
        <button 
          onClick={handleNextPage} 
          disabled={currentSpread === totalSpreads - 1}
          className={`transform transition-all duration-300 ease-in-out rounded-full p-4 bg-book-dark/5 hover:bg-book-dark/10 ${
            currentSpread === totalSpreads - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
          }`}
          onKeyDown={handleKeyDown(handleNextPage)}
          aria-label="Next page"
          tabIndex={0}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-book-dark" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Book Container */}
      <div className={`
        relative
        flex 
        ${isMobile ? 'flex-col' : 'flex-row'}
        min-h-[80vh] 
        mx-auto
        overflow-hidden
        rounded-xl
        ${isMobile ? [
          'bg-book-page',
          'max-w-[95%] w-[500px]',
          'shadow-[2px_2px_10px_rgba(0,0,0,0.2)]',
          'border-[16px] border-book-dark/90',
        ].join(' ') : [
          'bg-gradient-to-r from-book-dark/90 via-book-page to-book-page',
          'shadow-[5px_5px_20px_rgba(0,0,0,0.3)]',
          'transform perspective-[2000px]',
          'hover:shadow-[8px_8px_30px_rgba(0,0,0,0.4)]',
          'transition-all duration-500',
          'border-[24px] border-book-dark',
        ].join(' ')}
      `}>
        {/* Left Page */}
        {leftPageMessage && (
          <div 
            key={leftPageMessage._id} 
            className={`
              ${isMobile ? 'w-full p-6' : 'w-1/2 p-8'}
              min-h-full 
              flex-grow 
              flex 
              flex-col
              relative
              bg-gradient-to-br from-book-page to-white
              ${!isMobile && 'border-r border-book-dark/10'}
            `}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.03)_100%)]"></div>
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(0,0,0,0.02)_50%,transparent_100%)]"></div>
            
            {/* Line Guide Background */}
            <div 
              className="absolute inset-0" 
              style={{
                backgroundImage: `repeating-linear-gradient(transparent, transparent 23px, rgba(0,0,0,0.05) 24px)`,
                backgroundPosition: '0 1px'
              }}
            ></div>
            
            {/* Main Content */}
            <div className="relative z-[1] flex-1">
              <MessageCard 
                message={leftPageMessage} 
                isAdmin={isAdmin} 
                viewMode="book" 
              />
            </div>

            {/* Page Edge Shadow */}
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/5 to-transparent pointer-events-none"></div>
          </div>
        )}
        
        {/* Right Page */}
        {!isMobile && (rightPageMessage ? (
          <div 
            key={rightPageMessage._id} 
            className={`
              w-1/2 
              p-8
              min-h-full 
              flex-grow 
              flex 
              flex-col
              relative
              bg-gradient-to-bl from-white to-book-page
            `}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.03)_100%)]"></div>
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(0,0,0,0.02)_50%,transparent_100%)]"></div>
            
            {/* Line Guide Background */}
            <div 
              className="absolute inset-0" 
              style={{
                backgroundImage: `repeating-linear-gradient(transparent, transparent 23px, rgba(0,0,0,0.05) 24px)`,
                backgroundPosition: '0 1px'
              }}
            ></div>
            
            {/* Main Content */}
            <div className="relative z-[1] flex-1">
              <MessageCard 
                message={rightPageMessage} 
                isAdmin={isAdmin} 
                viewMode="book" 
              />
            </div>

            {/* Page Edge Shadow */}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/5 to-transparent pointer-events-none"></div>
          </div>
        ) : (
          <div className={`
            w-1/2 
            p-8
            min-h-full 
            flex-grow 
            flex 
            flex-col
            relative
            bg-gradient-to-bl from-white to-book-page opacity-95
          `}>
            {/* Line Guide Background */}
            <div 
              className="absolute inset-0" 
              style={{
                backgroundImage: `repeating-linear-gradient(transparent, transparent 23px, rgba(0,0,0,0.05) 24px)`,
                backgroundPosition: '0 1px'
              }}
            ></div>
            
            {/* Page Edge Shadow */}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/5 to-transparent pointer-events-none"></div>
          </div>
        ))}
        
        {/* Book Spine Shadow */}
        <div className="absolute inset-y-0 left-1/2 w-[2px] bg-gradient-to-r from-black/10 via-transparent to-black/10 transform -translate-x-1/2 pointer-events-none"></div>
        
        {/* Page Numbers */}
        <div className={`
          absolute 
          bottom-6 
          ${isMobile ? 'w-full px-8' : 'w-full px-16'}
          flex 
          justify-between 
          items-center
          font-book-title 
          text-book-dark/40 
          italic
          select-none
        `}>
          <span className="text-sm drop-shadow-sm">
            {isMobile ? currentSpread + 1 : currentSpread * 2 + 1}
          </span>
          {!isMobile && (
            <span className="text-sm drop-shadow-sm">
              {Math.min(currentSpread * 2 + 2, messages.length)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookView;
