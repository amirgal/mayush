import type { FC } from 'react';

type PageNumbersProps = {
  currentPage: number;
  totalPages: number;
  isMobile: boolean;
  isFormOpen?: boolean;
  formInFirstPosition?: boolean;
  formInSecondPosition?: boolean;
};

const PageNumbers: FC<PageNumbersProps> = ({ 
  currentPage, 
  totalPages, 
  isMobile, 
  isFormOpen = false, 
  formInFirstPosition = false, 
  formInSecondPosition = false 
}) => {
  // Check if we're on the last spread with an odd number of total messages
  const isOddTotalPages = totalPages % 2 !== 0;
  const isLastSpread = !isMobile && currentPage === Math.ceil(totalPages / 2) - 1;
  const isEmptyRightPage = isOddTotalPages && isLastSpread && !isFormOpen;
  
  // Handle form page numbering
  let leftPageNumber: number | null = isMobile ? currentPage + 1 : currentPage * 2 + 1;
  let rightPageNumber: number | null = isMobile ? null : Math.min(currentPage * 2 + 2, totalPages);
  
  // Adjust page numbers when form is open
  if (isFormOpen && !isMobile) {
    if (formInFirstPosition) {
      // Form is on the left page, show form page number (totalPages + 1)
      leftPageNumber = totalPages + 1;
      // Right page is empty, don't show a number
      rightPageNumber = null;
    } else if (formInSecondPosition) {
      // Form is on the right page, show form page number (totalPages + 1)
      rightPageNumber = totalPages + 1;
      // If there's an even number of messages, left page is empty
      if (totalPages % 2 === 0) {
        leftPageNumber = null;
      }
    }
  }
  
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
      {leftPageNumber !== null && (
        <span className="text-sm drop-shadow-sm">
          {leftPageNumber}
        </span>
      )}
      {!isMobile && rightPageNumber !== null && (
        <span className="text-sm drop-shadow-sm">
          {isEmptyRightPage ? '' : rightPageNumber}
        </span>
      )}
    </div>
  );
};

export default PageNumbers;
