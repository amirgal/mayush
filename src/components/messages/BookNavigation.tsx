import React from 'react';
import type { FC, KeyboardEvent } from 'react';

type BookNavigationProps = {
  onPrev: () => void;
  onNext: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  onKeyDown: (callback: () => void) => (e: KeyboardEvent) => void;
};

const BookNavigation: FC<BookNavigationProps> = ({
  onPrev,
  onNext,
  canGoPrev,
  canGoNext,
  onKeyDown
}) => (
  <>
    <div className="absolute inset-y-0 left-0 flex items-center -ml-16">
      <button
        onClick={onNext}
        className={`transform transition-all duration-300 ease-in-out rounded-full p-3 bg-white/90 hover:bg-white shadow-lg ${!canGoNext ? 'opacity-0 pointer-events-none' : 'opacity-70 hover:scale-110'}`}
        onKeyDown={onKeyDown(onNext)}
        aria-label="העמוד הבא"
        tabIndex={0}
        disabled={!canGoNext}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-book-dark"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>
    <div className="absolute inset-y-0 right-0 flex items-center -mr-16">
      <button
        onClick={onPrev}
        className={`transform transition-all duration-300 ease-in-out rounded-full p-3 bg-white/90 hover:bg-white shadow-lg ${!canGoPrev ? 'opacity-0 pointer-events-none' : 'opacity-70 hover:scale-110'}`}
        onKeyDown={onKeyDown(onPrev)}
        aria-label="העמוד הקודם"
        tabIndex={0}
        disabled={!canGoPrev}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-book-dark"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </>
);

export default BookNavigation;
