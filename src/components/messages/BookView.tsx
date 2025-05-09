import { useState } from 'react';
import type { FC } from 'react';
import type { Message } from '../../types';
import MessageCard from './MessageCard';

type BookViewProps = {
  messages: Message[];
  isAdmin: boolean;
};

const BookView: FC<BookViewProps> = ({ messages, isAdmin }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const messagesPerPage = 2;
  const totalPages = Math.ceil(messages.length / messagesPerPage);
  
  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handleKeyDown = (callback: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      callback();
    }
  };
  
  const startIdx = currentPage * messagesPerPage;
  const visibleMessages = messages.slice(startIdx, startIdx + messagesPerPage);

  return (
    <div className="book-view">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={handlePrevPage} 
          disabled={currentPage === 0}
          className={`btn-primary ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
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
        
        <div className="text-book-dark">
          Page {currentPage + 1} of {totalPages}
        </div>
        
        <button 
          onClick={handleNextPage} 
          disabled={currentPage === totalPages - 1}
          className={`btn-primary ${currentPage === totalPages - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
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
      
      <div className="flex bg-book-page border-2 border-book-dark rounded-lg overflow-hidden shadow-xl">
        {/* Left page */}
        <div className="w-1/2 p-6 border-r border-book-dark/20 relative">
          {visibleMessages[0] ? (
            <div className="transform transition-transform hover:scale-105">
              <MessageCard 
                message={visibleMessages[0]} 
                isAdmin={isAdmin} 
                viewMode="book" 
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-book-dark/50 handwritten text-xl">Empty page</p>
            </div>
          )}
          <div className="absolute bottom-2 right-4 text-book-dark/40 text-sm">{currentPage * 2 + 1}</div>
        </div>
        
        {/* Right page */}
        <div className="w-1/2 p-6 relative">
          {visibleMessages[1] ? (
            <div className="transform transition-transform hover:scale-105">
              <MessageCard 
                message={visibleMessages[1]} 
                isAdmin={isAdmin} 
                viewMode="book" 
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-book-dark/50 handwritten text-xl">Empty page</p>
            </div>
          )}
          <div className="absolute bottom-2 left-4 text-book-dark/40 text-sm">{currentPage * 2 + 2}</div>
        </div>
      </div>
    </div>
  );
};

export default BookView;
