import { useState, useCallback } from 'react';
import type { FC } from 'react';
import type { Message } from '../../types';
import { useSwipeable } from 'react-swipeable';

type KindleViewProps = {
  messages: Message[];
};

const KindleView: FC<KindleViewProps> = ({ messages }) => {
  const [currentPage, setCurrentPage] = useState(0);
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
    <div {...handlers} className="w-full flex justify-center items-center min-h-screen">
      <div className="w-[90%] max-w-[600px] h-[800px] bg-[#f6f6f6] overflow-hidden relative cursor-[grab] hover:cursor-[grab]">
        {/* Kindle-like dark border with more rounded corners */}
        <div className="absolute inset-0 border-[25px] border-b-[70px] border-[#2F2F2F] rounded-[30px] pointer-events-none z-10"></div>
        
        {/* Kindle text at bottom */}
        <div className="absolute bottom-5 left-0 right-0 z-20 flex justify-center">
          <span className="text-[#f6f6f6] text-sm font-medium tracking-wide">Kindle</span>
        </div>
        
        {/* Content Area */}
        <div className="relative z-20 p-10 h-full overflow-y-auto flex flex-col justify-between">
          <div className="flex-1">
            {currentPage === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center">
                <h1 className="text-5xl font-serif font-bold text-gray-800 mb-4">ספר ברכות</h1>
                <p className="text-gray-600 text-xl">Guestbook Kindle Edition</p>
              </div>
            ) : currentPageMessage ? (
              <div className="h-full pt-8">
                <h2 className="text-2xl font-serif mb-8 text-gray-800">{currentPageMessage.author}</h2>
                <p className="text-gray-800 text-md leading-relaxed font-serif">{currentPageMessage.content}</p>
                <div className="mt-10 text-right text-sm text-gray-500">
                  <span>{new Date(currentPageMessage.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ) : null}
          </div>
          
          {/* Progress indication with Hebrew page number and percentage */}
          <div className="flex justify-between pb-8 text-xs text-gray-500">
            <span dir="rtl">{currentPage > 0 ? `עמוד ${currentPage}` : ''}</span>
            <span>{`${Math.round((currentPage / (totalPages - 1)) * 100)}%`}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KindleView;
