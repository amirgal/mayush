import type { FC } from 'react';
import type { Message } from '../../types';
import MessageCard from './MessageCard';
import LineGuide from './LineGuide';
// import RandomImageBackground from './RandomImageBackground';
// import { calculateActualPageNumber } from '../../utils/pageCalculation';

type BookPageProps = {
  message: Message;
  isAdmin: boolean;
  onEdit: (() => void) | undefined;
  onDelete: (() => void) | undefined;
  position: 'left' | 'right' | 'mobile';
  pageNumber?: number; // Current spread/page number from BookView
};



const BookPage: FC<BookPageProps> = ({ 
  message, 
  isAdmin, 
  onEdit, 
  onDelete,
  position,
  // pageNumber = 0 // Default to 0 if not provided
}) => {
  const isMobile = position === 'mobile';
  
  return (
    <div
      className={`
        ${isMobile ? 'w-full p-6' : 'w-1/2 p-8'}
        min-h-full 
        flex-grow 
        flex 
        flex-col
        relative
        ${position === 'left' 
          ? 'bg-gradient-to-bl from-white to-book-page border-l border-book-dark/10' 
          : 'bg-gradient-to-br from-book-page to-white'}
      `}
      id={isMobile ? 'mobile-page' : `${position}-page`}
      style={{
        // Using CSS variable for styling the background images
        ['--soft-theme-filter' as string]: 'sepia(20%) saturate(20%) brightness(110%)'
      }}
    >
      {/* Random background images */}
      {/* <RandomImageBackground pageNumber={calculateActualPageNumber(pageNumber, position)} /> */}
      
      {/* Original background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.03)_100%)] z-[1]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(0,0,0,0.02)_50%,transparent_100%)] z-[1]"></div>

      <LineGuide />

      {/* Main Content */}
      <div className="relative z-[2] flex-1">
        <MessageCard
          message={message}
          isAdmin={isAdmin}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>

      {/* Page Edge Shadow */}
      <div 
        className={`absolute inset-y-0 ${position === 'left' ? 'left-0' : 'right-0'} w-8 bg-gradient-to-${position === 'left' ? 'r' : 'l'} from-black/5 to-transparent pointer-events-none z-[1]`}
      ></div>
    </div>
  );
};

export default BookPage;
