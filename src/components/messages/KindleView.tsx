import { useState, useCallback, useEffect } from 'react';
import type { FC } from 'react';
import type { Message } from '../../types';
import { useSwipeable } from 'react-swipeable';
import ImageModal from '../ui/ImageModal';

// Custom hook for window size
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 768,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

type KindleViewProps = {
  messages: Message[];
};

const KindleView: FC<KindleViewProps> = ({ messages }) => {
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedImage, setSelectedImage] = useState<{ url: string; altText: string } | null>(null);
  const totalPages = messages.length + 1; // +1 for first Kindle page

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

  const handlers = useSwipeable({
    onSwipedLeft: handlePrevPage, // Reversed for Hebrew reading direction
    onSwipedRight: handleNextPage, // Reversed for Hebrew reading direction
    trackMouse: true, // Enable swiping on desktop
  });

  const currentPageMessage = currentPage === 0 ? null : messages[currentPage - 1];

  return (
    <div {...handlers} className="w-full flex justify-center min-h-screen">
      <div className={`${isMobile ? 'w-full' : 'w-[90%] max-w-[600px]'} h-[800px] relative cursor-[grab] hover:cursor-[grab]`}>
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
            <div className="p-5">
              {currentPage === 0 ? (
                <div className="min-h-full flex flex-col justify-center items-center text-center">
                  <h1 className="text-5xl font-sans font-bold text-gray-800 mb-4">ספר ברכות</h1>
                  <p className="text-gray-600 text-xl">Guestbook Kindle Edition</p>
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
