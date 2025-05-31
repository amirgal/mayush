import type { FC } from 'react';

type PageNumbersProps = {
  currentPage: number;
  totalPages: number;
  isMobile: boolean;
};

const PageNumbers: FC<PageNumbersProps> = ({ currentPage, totalPages, isMobile }) => {
  // Check if we're on the last spread with an odd number of total messages
  const isOddTotalPages = totalPages % 2 !== 0;
  const isLastSpread = !isMobile && currentPage === Math.ceil(totalPages / 2) - 1;
  const isEmptyRightPage = isOddTotalPages && isLastSpread;
  
  return (
    <div className={[
      'absolute',
      'bottom-6',
      isMobile ? 'w-full px-8' : 'w-full px-16',
      'flex',
      'justify-between',
      'items-center',
      'font-book-title',
      'text-book-dark/40',
      'italic',
      'select-none',
      isMobile ? 'flex-row-reverse' : ''
    ].join(' ')}>
      <span className="text-sm drop-shadow-sm">
        {isMobile ? currentPage + 1 : currentPage * 2 + 1}
      </span>
      {!isMobile && (
        <span className="text-sm drop-shadow-sm">
          {isEmptyRightPage ? '' : Math.min(currentPage * 2 + 2, totalPages)}
        </span>
      )}
    </div>
  );
};

export default PageNumbers;
