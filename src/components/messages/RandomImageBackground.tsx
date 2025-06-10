import { useMemo } from 'react';
import type { FC } from 'react';

// Random background image component props
export type RandomImageBackgroundProps = {
  pageNumber: number; // Page number to determine which image to use
};

const RandomImageBackground: FC<RandomImageBackgroundProps> = ({ pageNumber }) => {
  // Define grid configuration
  const rows = 5;
  const columns = 4;
  const totalCells = rows * columns;
  
  // Define all available background image options
  const imageOptions = useMemo(() => [
    '/images/astronaut.png',
    '/images/planet3.png',
    '/images/chocolate2.png',
    '/images/boardgame.png',
    '/images/book2.png',
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
              opacity: 0.06
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default RandomImageBackground;
