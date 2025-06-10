import React from 'react';
import type { FC } from 'react';

type BookCoverProps = {
  onOpen: () => void;
};

const BookCover: FC<BookCoverProps> = ({ onOpen }) => (
  <div
    onClick={onOpen}
    className={`
      cursor-pointer
      mx-auto
      relative
      min-h-[80vh]
      max-w-[600px]
      rounded-lg
      shadow-[0_10px_30px_rgba(0,0,0,0.4)]
      transform 
      transition-all 
      duration-500
      hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)]
      hover:-translate-y-1
      flex
      flex-col
      items-center
      justify-center
      overflow-hidden
    `}
    style={{
      backgroundImage: 'url("/images/book-cover.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  >
    {/* Semi-transparent overlay to ensure text readability */}
    <div className="absolute inset-0 bg-book-dark/40 z-0"></div>
    
    {/* Gold border */}
    <div className="absolute inset-4 border-2 border-book-gold/50 rounded z-10"></div>
    
    {/* Content */}
    <div className="relative z-20 p-8 text-center">
      <h1 className="text-5xl font-bold text-book-light mb-4 book-title">ספר הברכות של מאיה</h1>
      <p className="text-book-light/90 text-lg mb-8">לחצו לפתיחה</p>
    </div>
    
    {/* Edge shadows */}
    <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/20 to-transparent z-10"></div>
    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
  </div>
);

export default BookCover;
