import React from 'react';
import type { FC, MouseEvent, KeyboardEvent } from 'react';

type AddMessageButtonProps = {
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  isMobile: boolean;
};

const AddMessageButton: FC<AddMessageButtonProps> = ({ onClick, isMobile }) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(e as unknown as MouseEvent<HTMLButtonElement>);
    }
  };

  return isMobile ? (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-book-dark text-white p-4 rounded-full shadow-2xl hover:bg-book-accent transition-colors duration-300 z-50 flex items-center justify-center"
      onKeyDown={handleKeyDown}
      aria-label="הוסף ברכה"
      tabIndex={0}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      <span className="mr-2 hidden md:inline">הוסף ברכה</span>
    </button>
  ) : (
    <div className="w-full flex justify-center mt-8">
      <button
        onClick={onClick}
        className="bg-book-dark text-white p-4 rounded-full shadow-2xl hover:bg-book-accent transition-colors duration-300 flex items-center justify-center"
        onKeyDown={handleKeyDown}
        aria-label="הוסף ברכה"
        tabIndex={0}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="mr-2">הוסף ברכה</span>
      </button>
    </div>
  );
};

export default AddMessageButton;
