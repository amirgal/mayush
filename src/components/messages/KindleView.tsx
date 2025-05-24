import { useState, useCallback, useEffect } from 'react';
import type { FC } from 'react';
import type { Message, ImageAttachment } from '../../types';
import { useSwipeable } from 'react-swipeable';
import ImageModal from '../ui/ImageModal';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useAuthContext } from '../../context/utils/authUtils';
import { useForm } from '../../context/FormContext';
import { useMutation } from 'convex/react';
import type { Id } from '../../../convex/_generated/dataModel';
import { api } from '../../../convex/_generated/api';
import FileUpload from '../ui/FileUpload';

type KindleViewProps = {
  messages: Message[];
};

const KindleView: FC<KindleViewProps> = ({ messages }) => {
  const isMobile = useDeviceDetect();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedImage, setSelectedImage] = useState<{ url: string; altText: string } | null>(null);
  const [formImages, setFormImages] = useState<ImageAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousPage, setPreviousPage] = useState<number>(0);
  const [frozenMessages, setFrozenMessages] = useState<Message[]>([]);
  const [formContent, setFormContent] = useState('');
  const [author, setAuthor] = useState('');
  
  const { user } = useAuthContext();
  const { isFormOpen, editingMessage, closeForm } = useForm();
  const addMessage = useMutation(api.messages.add);
  const updateMessage = useMutation(api.messages.update);
  
  // Use frozen messages or live messages based on form state
  const activeMessages = isFormOpen ? frozenMessages : messages;
  
  // Calculate total pages: 1 for title page + number of messages + 1 for form if open
  const totalPages = activeMessages.length + 1 + (isFormOpen ? 1 : 0);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  // Effect to handle form state changes
  useEffect(() => {
    if (isFormOpen) {
      // When form is opened, freeze the current messages
      setFrozenMessages([...messages]);
      setPreviousPage(currentPage);
      
      // If editing an existing message, pre-fill the form
      if (editingMessage) {
        setAuthor(editingMessage.author);
        setFormContent(editingMessage.content);
        if (editingMessage.imageUrls?.length) {
          setFormImages(editingMessage.imageUrls.map(img => ({
            storageId: img.storageId as Id<"_storage">,
            url: img.url
          })));
        }
      }
      
      // Calculate the form page position (last page)
      const newTotalPages = messages.length + 2; // +1 for title page, +1 for form page
      setCurrentPage(newTotalPages - 1);
    } else {
      // When form is closed, reset form-related state
      setFormContent('');
      setFormImages([]);
      setAuthor('');
      setFrozenMessages([]);
      
      // Return to the previous page if we were on the form
      if (previousPage !== null) {
        setCurrentPage(previousPage);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFormOpen]);

  const handleCancelForm = () => {
    closeForm();
  };


  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !formContent.trim() || !author.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare the message data
      const messageData = {
        author: author.trim(),
        content: formContent.trim(),
        imageUrls: formImages.length > 0 ? formImages.map(({ storageId, url }) => ({
          storageId: storageId as Id<"_storage">,
          url
        })) : [],
        userId: user._id
      };

      if (editingMessage) {
        // Update existing message
        await updateMessage({
          messageId: editingMessage._id,
          author: messageData.author,
          content: messageData.content,
          imageUrls: messageData.imageUrls,
          userId: messageData.userId
        });
      } else {
        // Add new message
        await addMessage(messageData);
      }
      
      // Reset form state
      setFormContent('');
      setFormImages([]);
      setAuthor('');
      
      // Close the form
      closeForm();
      
      // Navigate to the position where the message appears
      if (editingMessage) {
        // For updates, find the message in the list
        const messageIndex = messages.findIndex(m => m._id === editingMessage._id);
        if (messageIndex !== -1) {
          setCurrentPage(messageIndex + 1); // +1 for title page
        }
      } else {
        // For new messages, go to the last page
        setCurrentPage(messages.length + 1); // +1 for title page, +1 for 0-based index
      }
    } catch (err) {
      console.error('Error saving message:', err);
      // Consider showing an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: handlePrevPage, // Reversed for Hebrew reading direction
    onSwipedRight: handleNextPage, // Reversed for Hebrew reading direction
    trackMouse: true, // Enable swiping on desktop
  });

  // Determine what to display on the current page
  const currentPageMessage = currentPage === 0 
    ? null // First page is the title page
    : isFormOpen && currentPage === totalPages - 1 
      ? null // Last page is the form when isFormOpen is true
      : activeMessages[currentPage - 1]; // -1 because first page is title

  return (
    <div {...handlers} className="w-full flex justify-center min-h-screen flex-col items-center">
      <div className={`${isMobile ? 'w-full h-[600px]' : 'w-[90%] max-w-[600px] h-[800px]'} relative cursor-[grab] hover:cursor-[grab]`}>
        {/* Kindle-like dark border with more rounded corners - non-interactive border */}
        <div className="absolute inset-0 border-[25px] border-b-[70px] bg-[#f6f6f6] border-[#2F2F2F] rounded-[30px] pointer-events-none">
          {/* Kindle text at bottom */}
          <div className="absolute -bottom-12 left-0 right-0 flex justify-center">
            <span className="text-[#f6f6f6] text-sm font-medium tracking-wide">Kindle</span>
          </div>
        </div>

        {/* Content Area - this will be scrollable */}
        <div className="absolute inset-[25px] bottom-[70px] overflow-hidden bg-[#f6f6f6] z-10 flex flex-col">
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <div className={`p-5 ${currentPage === 0 ? 'h-full' : ''}`}>
              {currentPage === 0 ? (
                <div className="min-h-full flex flex-col justify-center items-center text-center">
                  <h1 className="text-5xl font-sans font-bold text-gray-800 mb-4">ספר ברכות</h1>
                  <p className="text-gray-600 text-xl">החליקו להתחיל</p>
                </div>
              ) : currentPageMessage ? (

                <div className="min-h-full">
                  <div className="pt-8">
                    <h2 className="text-2xl font-sans mb-8 text-gray-800">{currentPageMessage.author}</h2>
                    <p className="text-gray-800 text-md leading-relaxed font-sans text-right">{currentPageMessage.content}</p>
                    
                    {/* Display images from imageUrls array (new format) with Kindle e-ink effect */}
                    {currentPageMessage.imageUrls && currentPageMessage.imageUrls.length > 0 && (
                      <div className="mt-6 mb-4">
                        <div className="flex flex-wrap gap-4 justify-center max-w-full" style={{ margin: '0 auto' }}>
                          {currentPageMessage.imageUrls.map((image, index) => (
                            <div 
                              key={image.storageId} 
                              className="relative rounded-md overflow-hidden bg-gray-100 cursor-pointer"
                              style={{
                                width: `${isMobile ? 120 : 180}px`,
                                height: `${isMobile ? 120 : 180}px`,
                              }}
                              onClick={() => setSelectedImage({
                                url: image.url,
                                altText: `Image ${index + 1} shared by ${currentPageMessage.author}`
                              })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  setSelectedImage({
                                    url: image.url,
                                    altText: `Image ${index + 1} shared by ${currentPageMessage.author}`
                                  });
                                }
                              }}
                              tabIndex={0}
                              role="button"
                              aria-label={`View enlarged image ${index + 1} shared by ${currentPageMessage.author}`}
                            >
                              <img
                                src={image.url}
                                alt={`Image ${index + 1} shared by ${currentPageMessage.author}`}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                              {/* Kindle e-ink overlay */}
                              <div className="absolute inset-0 bg-gradient-to-b from-gray-200/10 to-gray-300/10 mix-blend-multiply"></div>
                              <div className="absolute inset-0 backdrop-grayscale backdrop-contrast-125 backdrop-brightness-90"></div>
                              <div className="absolute inset-0 bg-[url('/kindle-texture.png')] opacity-5 mix-blend-multiply"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-6 flex flex-col gap-4">
                      {/* <div className="flex flex-wrap gap-2">
                        {currentPageMessage && <ReactionBar message={currentPageMessage} isAdmin={isAdmin} />}
                      </div> */}
                      {/* <div className="text-right text-sm text-gray-500">
                        <span>{new Date(currentPageMessage.createdAt).toLocaleDateString()}</span>
                      </div> */}
                    </div>
                  </div>
                </div>
              ) : isFormOpen ? (
                <div className="min-h-full">
                  <div className="pt-8">
                    <h2 className="text-2xl font-sans mb-8 text-gray-800">
                      {editingMessage ? 'ערוך ברכה' : 'השאר ברכה חדשה'}
                    </h2>
                    
                    <form onSubmit={handleSubmitMessage} className="space-y-6 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">שם</label>
                        <input
                          type="text"
                          onChange={(e) => setAuthor(e.target.value)}
                          value={author || ''}
                          placeholder='שם'
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-[#f6f6f6] text-right"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">הברכה שלך</label>
                        <textarea
                          value={formContent}
                          onChange={(e) => setFormContent(e.target.value)}
                          placeholder="כתוב את הברכה שלך כאן..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-[#f6f6f6] min-h-[120px] resize-y text-right"
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">תמונות (אופציונלי)</label>
                        <FileUpload
                          onImagesChange={setFormImages}
                          disabled={isSubmitting}
                          maxFiles={3}
                          maxSizeMB={5}
                        />
                      </div>
                      
                      <div className="flex justify-between">
                        <button
                          type="button"
                          onClick={handleCancelForm}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                        >
                          ביטול
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'שומר...' : editingMessage ? 'עדכן ברכה' : 'שלח ברכה'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : null}

            </div>
          </div>
          
          {/* Progress indication with Hebrew page number and percentage - fixed at bottom */}
          <div className="absolute bottom-0 w-full p-3 flex justify-between text-xs text-gray-500">
            <span dir="rtl">{currentPage > 0 ? `עמוד ${currentPage}` : ''}</span>
            {currentPage > 0 && <span>{`${Math.round((currentPage / (totalPages - 1)) * 100)}%`}</span>}
          </div>
        </div>

      </div>

      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage.url}
          altText={selectedImage.altText}
          onClose={() => setSelectedImage(null)}
          applyEInkEffect={true}
        />
      )}
    </div>
  );
};

export default KindleView;
