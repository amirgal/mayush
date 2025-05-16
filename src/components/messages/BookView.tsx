import React, { useState, useCallback } from 'react';
import type { FC } from 'react';
import type { Message, ImageAttachment } from '../../types';
import MessageCard from './MessageCard';
import { useSwipeable } from 'react-swipeable';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useAuthContext } from '../../context/utils/authUtils';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import BookFormPage from './BookFormPage';

type BookViewProps = {
  messages: Message[];
  isAdmin: boolean;
};

const BookView: FC<BookViewProps> = ({ messages, isAdmin }) => {
  const isMobile = useDeviceDetect();
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isFormPage, setIsFormPage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockedFormPosition, setLockedFormPosition] = useState<'left' | 'right' | null>(null);
  const [frozenMessages, setFrozenMessages] = useState<Message[]>([]);
  const [previousSpread, setPreviousSpread] = useState<number>(0);
  const { user } = useAuthContext();
  const addMessage = useMutation(api.messages.add);
  const updateMessage = useMutation(api.messages.update);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  // Use frozen messages or live messages based on form state
  const activeMessages = isFormPage ? frozenMessages : messages;

  // Calculate total spreads including form page if needed
  const totalSpreads = isMobile
    ? activeMessages.length + (isFormPage ? 1 : 0)
    : Math.ceil((activeMessages.length + (isFormPage ? 1 : 0)) / 2);

  const handlePrevPage = useCallback(() => {
    // Check if we're on the form page
    const isOnFormPage = isFormPage && currentSpread === totalSpreads - 1;

    if (isOnFormPage) {
      // If we're on the form page, exit form mode before navigating
      setIsFormPage(false);
      setLockedFormPosition(null); // Reset locked position
      setFrozenMessages([]); // Clear frozen messages

      // Navigate to the last message spread
      const lastMessageSpread = isMobile ? messages.length - 1 : Math.ceil(messages.length / 2) - 1;
      setCurrentSpread(Math.max(0, lastMessageSpread));
    } else if (currentSpread > 0) {
      // Normal navigation to previous spread
      setCurrentSpread(currentSpread - 1);
    } else {
      // Close book when on first page
      setIsBookOpen(false);
      setCurrentSpread(0);
    }
  }, [currentSpread, isFormPage, totalSpreads, isMobile, messages.length]);

  const handleNextPage = useCallback(() => {
    if (currentSpread < totalSpreads - 1) {
      setCurrentSpread(currentSpread + 1);
    }
  }, [currentSpread, totalSpreads]);

  const canGoToPrevPage = currentSpread > 0 || !isBookOpen;
  const canGoToNextPage = currentSpread < totalSpreads - 1;

  // Check if we're on the form spread (last spread when isFormPage is true)
  const isFormSpread = isFormPage && currentSpread === totalSpreads - 1;

  // Determine if form should be in first or second position (based on even/odd message count)
  const isEvenMessageCount = activeMessages.length % 2 === 0;

  // Use locked form position if available, otherwise calculate based on current message count
  const formInFirstPosition = !isMobile && isFormSpread && (lockedFormPosition === 'left' || (lockedFormPosition === null && isEvenMessageCount));
  const formInSecondPosition = isFormSpread && (lockedFormPosition === 'right' || (lockedFormPosition === null && (!isEvenMessageCount || isMobile)));

  // Get messages for current spread, accounting for form page
  const firstPageMessage = isMobile ? null : (formInFirstPosition ? null : activeMessages[currentSpread * 2]);
  const secondPageMessage = isMobile ? (formInSecondPosition ? null : activeMessages[currentSpread]) : (formInSecondPosition ? null : activeMessages[currentSpread * 2 + 1]);

  const handleKeyDown = useCallback((callback: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      callback();
    }
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (!isBookOpen) {
        handleOpenBook();
      } else if (currentSpread === 0 && !isMobile) {
        setIsBookOpen(false);
        setCurrentSpread(0);
      } else {
        handlePrevPage();
      }
    },
    onSwipedRight: () => {
      if (!isBookOpen) {
        handleOpenBook();
      } else {
        handleNextPage();
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  const handleOpenBook = () => {
    setIsBookOpen(true);
  };

  const handleShowForm = (message?: Message) => {
    if (message) {
      setEditingMessage(message);
    } else {
      setEditingMessage(null);
    }

    // Save the current spread to return to later
    setPreviousSpread(currentSpread);

    // Freeze the current messages
    setFrozenMessages([...messages]);

    // Determine and lock the form position based on current message count
    if (!isMobile) {
      const shouldBeOnLeft = messages.length % 2 === 0;
      setLockedFormPosition(shouldBeOnLeft ? 'left' : 'right');
    } else {
      setLockedFormPosition('right'); // Mobile always uses full width
    }

    setIsFormPage(true);
    const newTotalSpreads = isMobile ? messages.length + 1 : Math.ceil((messages.length + 1) / 2);
    setCurrentSpread(newTotalSpreads - 1);
  };

  const handleCancelForm = () => {
    setIsFormPage(false);
    setLockedFormPosition(null); // Reset locked position
    setFrozenMessages([]); // Clear frozen messages
    setEditingMessage(null); // Reset editing state
    // Return to the spread the user was on before opening the form
    setCurrentSpread(previousSpread);
  };

  const handleSubmitMessage = async (author: string, content: string, images: ImageAttachment[]) => {
    if (!content.trim() || !author.trim() || !user) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingMessage) {
        // Update existing message
        await updateMessage({
          messageId: editingMessage._id,
          author: author.trim(),
          content: content.trim(),
          userId: user._id,
          imageUrls: images.length > 0 ? images.map(({ storageId, url }) => ({ storageId, url })) : undefined,
        });
      } else {
        // Add new message
        await addMessage({
          author: author.trim(),
          content: content.trim(),
          imageUrls: images.length > 0 ? images.map(({ storageId, url }) => ({ storageId, url })) : undefined,
          userId: user._id
        });
      }

      // Reset form after successful submission
      setIsFormPage(false);
      setLockedFormPosition(null); // Reset locked position
      setFrozenMessages([]); // Clear frozen messages
      setEditingMessage(null);

      // Navigate to the position where the new/updated message will appear
      const messagePosition = editingMessage 
        ? messages.findIndex(m => m._id === editingMessage._id)
        : messages.length;
        
      const newMessageSpread = isMobile
        ? messagePosition // In mobile, each message is its own spread
        : Math.floor(messagePosition / 2); // In desktop, two messages per spread

      // Set the current spread to show the message
      setCurrentSpread(Math.max(0, newMessageSpread));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="container mx-auto max-w-5xl" {...handlers}>
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
              {formInFirstPosition ? (
                // Form in first page position
                <div
                  className={`
                    w-1/2 p-8
                    min-h-full 
                    flex-grow 
                    flex 
                    flex-col
                    relative
                    bg-gradient-to-bl from-white to-book-page
                    border-l border-book-dark/10
                  `}
                  id="form-page-left"
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

                  <BookFormPage
                    onSubmit={handleSubmitMessage}
                    onCancel={handleCancelForm}
                    isSubmitting={isSubmitting}
                    message={editingMessage}
                  />

                  {/* Page Edge Shadow */}
                  <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/5 to-transparent pointer-events-none"></div>
                </div>
              ) : firstPageMessage && (
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
                      onEdit={user?._id === firstPageMessage.userId ? () => handleShowForm(firstPageMessage) : undefined}
                    />
                  </div>

                  {/* Page Edge Shadow */}
                  <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/5 to-transparent pointer-events-none"></div>
                </div>
              )}

              {/* Second Page */}
              {(secondPageMessage && !isFormPage) ? (
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
                      onEdit={user?._id === secondPageMessage.userId ? () => handleShowForm(secondPageMessage) : undefined}
                    />
                  </div>

                  {/* Page Edge Shadow */}
                  <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/5 to-transparent pointer-events-none"></div>
                </div>
              ) : formInSecondPosition ? (
                // Form in second page position
                <div
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
                  id="form-page-right"
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

                  <BookFormPage
                    onSubmit={handleSubmitMessage}
                    onCancel={handleCancelForm}
                    isSubmitting={isSubmitting}
                    message={editingMessage}
                  />

                  {/* Page Edge Shadow */}
                  <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/5 to-transparent pointer-events-none"></div>
                </div>
              ) : (
                // Empty second page when there's no message
                <div
                  className={`
                    ${isMobile ? 'w-full' : 'w-1/2'}
                    p-8
                    min-h-full 
                    flex-grow 
                    flex 
                    flex-col
                    relative
                    bg-gradient-to-br from-book-page to-white opacity-95
                  `}
                >
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
              )}

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
            {/* Navigation Arrows on Book Sides */}
            {!isMobile && (
              <>
                <div className="absolute inset-y-0 left-0 flex items-center -ml-16">
                  <button
                    onClick={handleNextPage}
                    className={`transform transition-all duration-300 ease-in-out rounded-full p-3 bg-white/90 hover:bg-white shadow-lg ${!canGoToNextPage ? 'opacity-0 pointer-events-none' : 'opacity-70 hover:scale-110'}`}
                    onKeyDown={handleKeyDown(handleNextPage)}
                    aria-label="העמוד הבא"
                    tabIndex={0}
                    disabled={!canGoToNextPage}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-book-dark"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center -mr-16">
                  <button
                    onClick={handlePrevPage}
                    className={`transform transition-all duration-300 ease-in-out rounded-full p-3 bg-white/90 hover:bg-white shadow-lg ${!canGoToPrevPage ? 'opacity-0 pointer-events-none' : 'opacity-70 hover:scale-110'}`}
                    onKeyDown={handleKeyDown(handlePrevPage)}
                    aria-label="העמוד הקודם"
                    tabIndex={0}
                    disabled={!canGoToPrevPage}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-book-dark"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </>
            )}
            {/* Page Info */}
            <div className="text-book-dark/70 font-book-title text-lg mt-4">
              {isMobile
                ? `עמוד ${currentSpread + 1} מתוך ${messages.length}`
                : `עמודים ${currentSpread * 2 + 1} - ${Math.min(currentSpread * 2 + 2, messages.length)} מתוך ${messages.length}`
              }
            </div>
            
            {/* Add Message Button */}
            {isMobile ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShowForm();
                }}
                className="fixed bottom-6 right-6 bg-book-dark text-white p-4 rounded-full shadow-2xl hover:bg-book-accent transition-colors duration-300 z-50 flex items-center justify-center"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleShowForm();
                  }
                }}
                aria-label="הוסף ברכה"
                tabIndex={0}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="mr-2 hidden md:inline">הוסף ברכה</span>
              </button>
            ) : (
              <div className="w-full flex justify-center mt-8">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowForm();
                  }}
                  className="bg-book-dark text-white p-4 rounded-full shadow-2xl hover:bg-book-accent transition-colors duration-300 flex items-center justify-center"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleShowForm();
                    }
                  }}
                  aria-label="הוסף ברכה"
                  tabIndex={0}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="mr-2 hidden md:inline">הוסף ברכה</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookView;
