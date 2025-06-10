import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { FC } from 'react';
import type { Message, ImageAttachment } from '../../types';
import { useSwipeable } from 'react-swipeable';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useAuthContext } from '../../context/utils/authUtils';
import { useForm } from '../../context/FormContext';
import { useMutation } from 'convex/react';
import type { Id } from '../../../convex/_generated/dataModel';
import { api } from '../../../convex/_generated/api';
import BookCover from './BookCover';
import BookPage from './BookPage';
import BookFormPageWrapper from './BookFormPageWrapper';
import BookNavigation from './BookNavigation';
import PageNumbers from './PageNumbers';
import LineGuide from './LineGuide';

type BookViewProps = {
  messages: Message[];
  isAdmin: boolean;
};

const BookView: FC<BookViewProps> = ({ messages, isAdmin }) => {
  const isMobile = useDeviceDetect();
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockedFormPosition, setLockedFormPosition] = useState<'left' | 'right' | null>(null);
  const [frozenMessages, setFrozenMessages] = useState<Message[]>([]);
  const [previousSpread, setPreviousSpread] = useState<number>(0);
  
  const { isFormOpen, editingMessage, closeForm } = useForm();
  const { user } = useAuthContext();
  const addMessage = useMutation(api.messages.add);
  const updateMessage = useMutation(api.messages.update);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  
  // Use frozen messages or live messages based on form state
  const activeMessages = isFormOpen ? frozenMessages : messages;

  // Calculate total spreads including form page if needed
  const totalSpreads = useMemo(() => 
    isMobile
      ? activeMessages.length + (isFormOpen ? 1 : 0)
      : Math.ceil((activeMessages.length + (isFormOpen ? 1 : 0)) / 2),
    [activeMessages.length, isFormOpen, isMobile]
  );

  const handlePrevPage = useCallback(() => {
    // Check if we're on the form page
    const isOnFormPage = isFormOpen && currentSpread === totalSpreads - 1;

    if (isOnFormPage) {
      // If we're on the form page, exit form mode before navigating
      closeForm();
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
  }, [currentSpread, isFormOpen, totalSpreads, isMobile, messages.length, closeForm]);

  const handleNextPage = useCallback(() => {
    if (currentSpread < totalSpreads - 1) {
      setCurrentSpread(currentSpread + 1);
    }
  }, [currentSpread, totalSpreads]);

  const canGoToPrevPage = currentSpread > 0 || !isBookOpen;
  const canGoToNextPage = currentSpread < totalSpreads - 1;

  // Check if we're on the form spread (last spread when isFormOpen is true)
  const isFormSpread = isFormOpen && currentSpread === totalSpreads - 1;

  // Determine if form should be in first or second position (based on even/odd message count)
  const isEvenMessageCount = activeMessages.length % 2 === 0;

  // Use locked form position if available, otherwise calculate based on current message count
  const formInFirstPosition = !isMobile && isFormSpread && (lockedFormPosition === 'left' || (lockedFormPosition === null && isEvenMessageCount));
  const formInSecondPosition = isFormSpread && (lockedFormPosition === 'right' || (lockedFormPosition === null && (!isEvenMessageCount || isMobile)));

  // Get messages for current spread, accounting for form page
  const firstPageMessage = useMemo(() => 
    isMobile ? null : (formInFirstPosition ? null : activeMessages[currentSpread * 2]),
    [isMobile, formInFirstPosition, activeMessages, currentSpread]
  );
  
  const secondPageMessage = useMemo(() => 
    isMobile 
      ? (formInSecondPosition ? null : activeMessages[currentSpread])
      : (formInSecondPosition ? null : activeMessages[currentSpread * 2 + 1]),
    [isMobile, formInSecondPosition, activeMessages, currentSpread]
  );

  const handleKeyDown = useCallback((callback: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      callback();
    }
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (isFormOpen) return;
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
      if (isFormOpen) return;
      if (!isBookOpen) {
        handleOpenBook();
      } else {
        handleNextPage();
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  const handleOpenBook = useCallback(() => {
    setIsBookOpen(true);
  }, []);

  const { openForm } = useForm();

  // Effect to handle form state changes
  useEffect(() => {
    if (isFormOpen) {
      // When form is opened, make sure the book is open
      setIsBookOpen(true);
      
      // When form is opened, freeze the current messages
      setFrozenMessages([...messages]);
      setPreviousSpread(currentSpread);
      
      // Determine and lock the form position based on current message count
      if (!isMobile) {
        const shouldBeOnLeft = messages.length % 2 === 0;
        setLockedFormPosition(shouldBeOnLeft ? 'left' : 'right');
      } else {
        setLockedFormPosition('right'); // Mobile always uses full width
      }
      
      // Navigate to the form page
      const newTotalSpreads = isMobile ? messages.length + 1 : Math.ceil((messages.length + 1) / 2);
      setCurrentSpread(newTotalSpreads - 1);
    } else {
      // When form is closed, reset form-related state
      setLockedFormPosition(null);
      setFrozenMessages([]);
      
      // If we were on the form page and editing an existing message, return to the previous spread
      // Only go back to previous page when editing, not when creating a new message
      if (previousSpread !== null && editingMessage) {
        setCurrentSpread(previousSpread);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFormOpen]);

  const handleDeleteMessage = useCallback(async (messageId: Id<'messages'>) => {
    if (!user) {
      console.error('User must be logged in to delete messages');
      return;
    }
    
    try {
      await deleteMessage({ 
        messageId, 
        userId: user._id
      });
      // If we're on the last message and it's deleted, go back one page
      if (currentSpread * 2 >= messages.length - 1) {
        setCurrentSpread(Math.max(0, currentSpread - 1));
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  }, [currentSpread, deleteMessage, messages.length, user]);

  // Handle form submission
  const handleSubmitMessage = useCallback(async (author: string, content: string, images: ImageAttachment[]) => {
    if (!content.trim() || !author.trim() || !user) {
      return;
    }

    setIsSubmitting(true);
    try {
      const trimmedAuthor = author.trim();
      const trimmedContent = content.trim();
      const imageUrls = images.length > 0 
        ? images.map(({ storageId, url }) => ({
            storageId: storageId as Id<"_storage">,
            url
          }))
        : undefined;

      if (editingMessage) {
        // Update existing message
        await updateMessage({
          messageId: editingMessage._id,
          author: trimmedAuthor,
          content: trimmedContent,
          userId: user._id,
          imageUrls,
        });
      } else {
        // Add new message
        await addMessage({
          author: trimmedAuthor,
          content: trimmedContent,
          userId: user._id,
          imageUrls,
        });
      }

      // Close form after successful submission
      closeForm();
      setLockedFormPosition(null);
      setFrozenMessages([]);

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
      console.error('Error saving message:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [editingMessage, user, updateMessage, addMessage, isMobile, messages, closeForm]);

  // Render the closed book cover or the open book content
  return (
    <div className="container mx-auto max-w-5xl">
      {!isBookOpen ? (
        <BookCover onOpen={handleOpenBook} />
      ) : (
        <div className="animate-fade-scale">
          <div className="container mx-auto max-w-5xl" {...handlers}>
            {/* Book Container */}
            <div className={[
              'relative',
              'flex',
              isMobile ? 'flex-col' : 'flex-row',
              'min-h-[80vh]',
              'mx-auto',
              'overflow-hidden',
              'rounded-xl',
              ...(isMobile 
                ? [
                    'bg-book-page',
                    'max-w-[95%] w-[500px]',
                    'shadow-[2px_2px_10px_rgba(0,0,0,0.2)]',
                  ] 
                : [
                    'bg-gradient-to-l from-book-dark/80 via-book-page to-book-page',
                    'shadow-[0_10px_30px_rgba(0,0,0,0.25)]',
                    'transform perspective-[2000px]',
                    'hover:shadow-[0_15px_40px_rgba(0,0,0,0.35)]',
                    'transition-all duration-500',
                  ]
              )
            ].join(' ')}>
              
              {/* First Page */}
              {formInFirstPosition ? (
                <BookFormPageWrapper
                  position={isMobile ? 'mobile' : 'left'}
                  onSubmit={handleSubmitMessage}
                  onCancel={closeForm}
                  isSubmitting={isSubmitting}
                  message={editingMessage}
                />
              ) : firstPageMessage && (
                <BookPage
                  key={firstPageMessage._id}
                  message={firstPageMessage}
                  isAdmin={isAdmin}
                  onEdit={user?._id === firstPageMessage.userId
                    ? () => openForm(firstPageMessage)
                    : undefined}
                  onDelete={(user?._id === firstPageMessage.userId || isAdmin)
                    ? () => handleDeleteMessage(firstPageMessage._id)
                    : undefined}
                  position={isMobile ? 'mobile' : 'left'}
                  pageNumber={currentSpread}
                />
              )}

              {/* Second Page */}
              {secondPageMessage && !isFormOpen ? (
                <BookPage
                  key={secondPageMessage._id}
                  message={secondPageMessage}
                  isAdmin={isAdmin}
                  onEdit={user?._id === secondPageMessage.userId
                    ? () => openForm(secondPageMessage)
                    : undefined}
                  onDelete={(user?._id === secondPageMessage.userId || isAdmin)
                    ? () => handleDeleteMessage(secondPageMessage._id)
                    : undefined}
                  position={isMobile ? 'mobile' : 'right'}
                  pageNumber={currentSpread}
                />
              ) : formInSecondPosition ? (
                <BookFormPageWrapper
                  position={isMobile ? 'mobile' : 'right'}
                  onSubmit={handleSubmitMessage}
                  onCancel={closeForm}
                  isSubmitting={isSubmitting}
                  message={editingMessage}
                />
              ) : (
                // Empty second page when there's no message
                <div className={[
                  isMobile ? 'w-full' : 'w-1/2',
                  'p-8',
                  'min-h-full',
                  'flex-grow',
                  'flex',
                  'flex-col',
                  'relative',
                  'bg-gradient-to-br from-book-page to-white opacity-95'
                ].join(' ')}>
                  <LineGuide />
                  <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/5 to-transparent pointer-events-none"></div>
                </div>
              )}

              {/* Book Spine Shadow */}
              {!isMobile && (
                <div className="absolute inset-y-0 right-1/2 w-[2px] bg-gradient-to-l from-black/10 via-transparent to-black/10 transform translate-x-1/2 pointer-events-none"></div>
              )}

              {/* Page Numbers */}
              <PageNumbers 
                currentPage={currentSpread} 
                totalPages={messages.length} 
                isMobile={isMobile}
                isFormOpen={isFormOpen}
                formInFirstPosition={formInFirstPosition}
                formInSecondPosition={formInSecondPosition}
              />
            </div>

            {/* Navigation Arrows */}
            {!isMobile && (
              <BookNavigation
                onPrev={handlePrevPage}
                onNext={handleNextPage}
                canGoPrev={canGoToPrevPage}
                canGoNext={canGoToNextPage}
                onKeyDown={handleKeyDown}
              />
            )}

            {/* Page Info */}
            <div className="text-book-dark/70 font-book-title text-lg my-4">
              {isMobile
                ? `עמוד ${currentSpread + 1} מתוך ${isFormOpen ? messages.length + 1 : messages.length}`
                : isFormSpread
                  ? formInFirstPosition
                    ? `עמוד ${messages.length + 1} מתוך ${messages.length + 1}` // Only show form page when it's on the left
                    : `עמודים ${Math.min(currentSpread * 2 + 1, messages.length)} - ${messages.length + 1} מתוך ${messages.length + 1}` // Show message page and form page
                  : `עמודים ${currentSpread * 2 + 1} - ${Math.min(currentSpread * 2 + 2, messages.length)} מתוך ${isFormOpen ? messages.length + 1 : messages.length}`
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookView;
