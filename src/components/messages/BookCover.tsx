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
      bg-gradient-to-br from-book-dark to-book-accent
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
      p-8
      text-center
    `}
  >
    <div className="absolute inset-4 border-2 border-book-gold/30 rounded"></div>
    <h1 className="text-5xl font-bold text-book-light mb-4 font-book-title">ספר הברכות של מאיה</h1>
    <p className="text-book-light/80 text-lg mb-8">לחצו לפתיחה</p>
    <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/20 to-transparent"></div>
    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/20 to-transparent"></div>
  </div>
);

export default BookCover;
