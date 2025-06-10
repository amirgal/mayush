import { useMemo } from 'react';
import type { FC } from 'react';
import type { Message } from '../../types';
import MessageCard from './MessageCard';
import LineGuide from './LineGuide';

type BookPageProps = {
  message: Message;
  isAdmin: boolean;
  onEdit: (() => void) | undefined;
  onDelete: (() => void) | undefined;
  position: 'left' | 'right' | 'mobile';
  pageNumber?: number; // Current spread/page number from BookView
};

// Random background image component
type RandomImageBackgroundProps = {
  pageNumber: number; // Page number to determine which image to use
};

const RandomImageBackground: FC<RandomImageBackgroundProps> = ({ pageNumber }) => {
  // Define grid configuration
  const rows = 6;
  const columns = 4;
  const totalCells = rows * columns;
  
  // Define all available background image options
  const imageOptions = useMemo(() => [
    '/images/astronaut.png',
    '/images/planet3.png',
    '/images/chocolate.png'
  ], []);
  
  // Select image based on page number (cycling through available images)
  const selectedImage = useMemo(() => {
    // Use modulo to cycle through the available images
    const imageIndex = pageNumber % imageOptions.length;
    return imageOptions[imageIndex];
  }, [imageOptions, pageNumber]);

  // Generate an array of image cells all with the same image
  const imageCells = useMemo(() => {
    const cells = [];
    
    for (let i = 0; i < totalCells; i++) {
      // Random rotation between -30 and 30 degrees
      const rotation = Math.floor(Math.random() * 60) - 30;
      
      cells.push({
        src: selectedImage,
        rotation
      });
    }
    
    return cells;
  }, [selectedImage, totalCells]);

  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none" 
      style={{
        display: 'grid',
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        padding: '5px',
        gap: '10px'
      }}
    >
      {imageCells.map((cell, index) => (
        <div 
          key={index}
          className="flex items-center justify-center p-1 overflow-hidden"
        >
          <img 
            src={cell.src} 
            alt="" 
            className="w-full h-auto object-contain"
            style={{
              filter: 'grayscale(100%) var(--soft-theme-filter)',
              transform: `rotate(${cell.rotation}deg)`,
              opacity: 1
            }}
          />
        </div>
      ))}
    </div>
  );
};

// Calculate the actual page number based on the spread index and page position
const calculateActualPageNumber = (spreadNumber: number, position: 'left' | 'right' | 'mobile'): number => {
  if (position === 'mobile') {
    // For mobile, we use a different distribution approach
    // Multiply by a prime number to get better distribution when using modulo
    return (spreadNumber + 1) * 3;
  } else if (position === 'left') {
    // Left page is odd-numbered
    return spreadNumber * 2 + 1;
  } else { // position === 'right'
    // Right page is even-numbered
    return spreadNumber * 2 + 2;
  }
};

const BookPage: FC<BookPageProps> = ({ 
  message, 
  isAdmin, 
  onEdit, 
  onDelete,
  position,
  pageNumber = 0 // Default to 0 if not provided
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
      <RandomImageBackground pageNumber={calculateActualPageNumber(pageNumber, position)} />
      
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
