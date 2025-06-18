import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { motion } from 'framer-motion';

type BookCoverProps = {
  onOpen: () => void;
  isMobile: boolean;
};

const BookCover: FC<BookCoverProps> = ({ onOpen, isMobile }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.src = '/images/book-cover.webp';
    
    // If the image is already cached, it might load immediately
    if (img.complete) {
      setImageLoaded(true);
    }
  }, []);
  
  if (!imageLoaded) {
    return null;
  }
  
  return (
    <motion.div
      onClick={onOpen}
      className={`
        cursor-pointer
        mx-auto
        relative
        min-h-[80vh]
        max-w-[600px]
        rounded-lg
        shadow-[0_10px_30px_rgba(0,0,0,0.4)]
        hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)]
        hover:-translate-y-1
        flex
        flex-col
        items-center
        justify-center
        overflow-hidden
      `}
      style={{
        backgroundImage: 'url("/images/book-cover.webp")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20, 
        duration: 0.5 
      }}
    >
    {/* Semi-transparent overlay to ensure text readability */}
    <div className="absolute inset-0 bg-book-dark/40 z-0"></div>
    
    {/* Gold border */}
    <div className="absolute inset-4 border-2 border-book-gold/50 rounded z-10"></div>
    
    {/* Content */}
    <div className="relative z-20 p-8 text-center">
      <div className="mb-6 flex flex-col items-center space-y-1 sm:space-y-2">
        <h1 className="text-5xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-book-gold book-title tracking-wide" 
            style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              letterSpacing: '0.05em',
            }}>
          ספר הברכות
        </h1>
        <div className="text-2xl sm:text-2xl md:text-3xl font-medium text-book-gold/90 book-title"
             style={{
               textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
             }}>
          של
        </div>
        <div className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-book-gold book-title"
             style={{
               textShadow: '1px 1px 3px rgba(0,0,0,0.4)',
             }}>
          מאיה
        </div>
      </div>
      <p className="text-base sm:text-lg mb-6 sm:mb-8 tracking-wider text-book-light/90"
         style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
        {isMobile ? 'לחצו/החליקו לפתיחה' : 'לחצו לפתיחה'}
      </p>
    </div>
    
    {/* Edge shadows */}
    <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/20 to-transparent z-10"></div>
    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
  </motion.div>
  );
};

export default BookCover;
