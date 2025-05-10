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
  const [isBookOpen, setIsBookOpen] = useState(false);
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
    } else {
      // Close book when on first page
      setIsBookOpen(false);
      setCurrentSpread(0);
    }
  }, [currentSpread]);

  const handleNextPage = useCallback(() => {
    if (currentSpread < totalSpreads - 1) {
      setCurrentSpread(currentSpread + 1);
    }
  }, [currentSpread, totalSpreads]);

  const canGoToPrevPage = currentSpread === 0 || isBookOpen;
  const canGoToNextPage = currentSpread < totalSpreads - 1;

  const firstPageMessage = isMobile ? null : messages[currentSpread * 2];
  const secondPageMessage = isMobile ? messages[currentSpread] : messages[currentSpread * 2 + 1];

  const handleKeyDown = useCallback((callback: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      callback();
    }
  }, []);

  const handlers = useSwipeable({
    onSwipedRight: () => handleNextPage(),
    onSwipedLeft: () => {
      if (currentSpread === 0 && !isMobile) {
        setIsBookOpen(false);
        setCurrentSpread(0);
      } else {
        handlePrevPage();
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  const handleOpenBook = () => {
    setIsBookOpen(true);
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {!isBookOpen ? (
        // Closed Book Cover
        <div
          onClick={handleOpenBook}
          className={`
            cursor-pointer
            mx-auto
            relative
            min-h-[80vh]
            max-w-[600px]
            rounded-lg
            bg-gradient-to-br from-book-dark to-book-accent
            shadow-[0_10px_30px_rgba(0,0,0,0.4)]
            transform 
            transition-all 
            duration-500
            hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)]
            hover:-translate-y-1
            flex
            flex-col
            items-center
            justify-center
            p-8
            text-center
            ${isBookOpen ? 'animate-book-open' : ''}
          `}
        >
          <div className="absolute inset-4 border-2 border-book-gold/30 rounded"></div>
          <h1 className="text-5xl font-bold text-book-light mb-4 font-book-title">ספר ברכות</h1>
          <p className="text-book-light/80 text-lg mb-8">לחץ לפתיחה</p>
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
      ) : (
        // Open Book Content
        <div className="animate-fade-scale">
          <div className="container mx-auto py-8 max-w-5xl" {...handlers}>
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
              ].join(' ') : [
                'bg-gradient-to-l from-book-dark/80 via-book-page to-book-page',
                'shadow-[0_10px_30px_rgba(0,0,0,0.25)]',
                'transform perspective-[2000px]',
                'hover:shadow-[0_15px_40px_rgba(0,0,0,0.35)]',
                'transition-all duration-500',
              ].join(' ')}
            `}>
              {/* First Page */}
              {firstPageMessage && (
                <div
                  key={firstPageMessage._id}
                  className={`
                    ${isMobile ? 'w-full p-6' : 'w-1/2 p-8'}
                    min-h-full 
                    flex-grow 
                    flex 
                    flex-col
                    relative
                    bg-gradient-to-bl from-white to-book-page
                    ${!isMobile && 'border-l border-book-dark/10'}
                  `}
                  id="first-page"
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
                      message={firstPageMessage}
                      isAdmin={isAdmin}
                      viewMode="book"
                    />
                  </div>

                  {/* Page Edge Shadow */}
                  <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/5 to-transparent pointer-events-none"></div>
                </div>
              )}

              {/* Second Page */}
              {(secondPageMessage ? (
                <div
                  key={secondPageMessage._id}
                  className={`
                    ${isMobile ? 'w-full' : 'w-1/2'}
                    p-8
                    min-h-full 
                    flex-grow 
                    flex 
                    flex-col
                    relative
                    bg-gradient-to-br from-book-page to-white
                  `}
                  id="second-page"
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
                      message={secondPageMessage}
                      isAdmin={isAdmin}
                      viewMode="book"
                    />
                  </div>

                  {/* Page Edge Shadow */}
                  <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/5 to-transparent pointer-events-none"></div>
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
                  bg-gradient-to-br from-book-page to-white opacity-95
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
                  <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/5 to-transparent pointer-events-none"></div>
                </div>
              ))}

              {/* Book Spine Shadow */}
              {!isMobile && (
                <div className="absolute inset-y-0 right-1/2 w-[2px] bg-gradient-to-l from-black/10 via-transparent to-black/10 transform translate-x-1/2 pointer-events-none"></div>
              )}

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
                ${isMobile ? 'flex-row-reverse' : ''}
              `}>
                <span className="text-sm drop-shadow-sm">
                  {isMobile ? currentSpread + 1 : currentSpread * 2 + 1}
                </span>
                {!isMobile && (
                  <span className="text-sm drop-shadow-sm">
                    {Math.min(currentSpread * 2 + 2, messages.length + 1)}
                  </span>
                )}
              </div>
            </div>
            {/* Navigation Controls */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={handlePrevPage}
                className={`transform transition-all duration-300 ease-in-out rounded-full p-4 bg-book-dark/5 hover:bg-book-dark/10 ${!canGoToPrevPage ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                onKeyDown={handleKeyDown(handlePrevPage)}
                aria-label="העמוד הקודם"
                tabIndex={0}
                disabled={!canGoToPrevPage}
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
              <div className="text-book-dark/70 font-book-title text-lg">
                {isMobile
                  ? `עמוד ${currentSpread + 1} מתוך ${messages.length}`
                  : `עמודים ${currentSpread * 2 + 1} - ${Math.min(currentSpread * 2 + 2, messages.length)} מתוך ${messages.length}`
                }
              </div>
              <button
                onClick={handleNextPage}
                className={`transform transition-all duration-300 ease-in-out rounded-full p-4 bg-book-dark/5 hover:bg-book-dark/10 ${!canGoToNextPage ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                onKeyDown={handleKeyDown(handleNextPage)}
                aria-label="העמוד הבא"
                tabIndex={0}
                disabled={!canGoToNextPage}
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
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default BookView;
