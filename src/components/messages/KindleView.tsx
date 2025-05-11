import { useState, useCallback } from 'react';
import type { FC } from 'react';
import type { Message, ImageAttachment } from '../../types';
import { useSwipeable } from 'react-swipeable';
import ImageModal from '../ui/ImageModal';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useAuthContext } from '../../context/utils/authUtils';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import FileUpload from '../ui/FileUpload';

type KindleViewProps = {
  messages: Message[];
};

const KindleView: FC<KindleViewProps> = ({ messages }) => {
  const isMobile = useDeviceDetect();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedImage, setSelectedImage] = useState<{ url: string; altText: string } | null>(null);
  const [isFormPage, setIsFormPage] = useState(false);
  const [formContent, setFormContent] = useState('');
  const [formImages, setFormImages] = useState<ImageAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { displayName, user } = useAuthContext();
  const addMessage = useMutation(api.messages.add);
  const totalPages = messages.length + 1 + (isFormPage ? 1 : 0); // +1 for first Kindle page, +1 for form page if visible

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

  const handleShowForm = () => {
    // First set the form page flag to true
    setIsFormPage(true);
    // Then calculate the new total pages which now includes the form page
    const newTotalPages = messages.length + 1 + 1; // +1 for title page, +1 for form page
    // Navigate directly to the form page (last page)
    setCurrentPage(newTotalPages - 1);
  };

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName || !formContent.trim() || !user) {
      alert('Please log in and fill in your message');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addMessage({
        author: displayName,
        content: formContent.trim(),
        imageUrls: formImages.length > 0 ? formImages.map(({ storageId, url }) => ({ storageId, url })) : undefined,
        userId: user._id
      });
      
      // Reset form after successful submission
      setFormContent('');
      setFormImages([]);
      setIsFormPage(false);
      // Go to first page
      setCurrentPage(0);
    } catch (err) {
      console.error(err);
      alert('Failed to add message. Please try again.');
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
  const isFirstPage = currentPage === 0;
  const isMessagePage = !isFirstPage && currentPage <= messages.length;
  const currentPageMessage = isMessagePage ? messages[currentPage - 1] : null;

  return (
    <div {...handlers} className="w-full flex justify-center min-h-screen">
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
            <div className={`p-5 ${isFirstPage ? 'h-full' : ''}`}>
              {isFirstPage ? (
                <div className="min-h-full flex flex-col justify-center items-center text-center">
                  <h1 className="text-5xl font-sans font-bold text-gray-800 mb-4">ספר ברכות</h1>
                  <p className="text-gray-600 text-xl">החליקו להתחיל</p>
                </div>
              ) : isMessagePage && currentPageMessage ? (

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
              ) : isFormPage ? (
                <div className="min-h-full">
                  <div className="pt-8">
                    <h2 className="text-2xl font-sans mb-8 text-gray-800">השאר ברכה חדשה</h2>
                    
                    <form onSubmit={handleSubmitMessage} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">שם</label>
                        <input
                          type="text"
                          value={displayName || ''}
                          disabled={true}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-[#f6f6f6] text-right"
                          readOnly
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
                      
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'שולח...' : 'שלח ברכה'}
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

      {/* Add Message Button */}
      <button 
        onClick={handleShowForm}
        className="fixed bottom-6 right-6 bg-book-dark text-white p-4 rounded-full shadow-2xl hover:bg-book-accent transition-colors duration-300 z-50 flex items-center justify-center"
        aria-label="הוסף ברכה"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="mr-2 hidden md:inline">הוסף ברכה</span>
      </button>

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
