import type { FC } from 'react';

type PageNumbersProps = {
  currentPage: number;
  totalPages: number;
  isMobile: boolean;
};

const PageNumbers: FC<PageNumbersProps> = ({ currentPage, totalPages, isMobile }) => (
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
        {Math.min(currentPage * 2 + 2, totalPages)}
      </span>
    )}
  </div>
);

export default PageNumbers;
