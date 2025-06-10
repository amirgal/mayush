/**
 * Calculate the actual page number based on the spread index and page position
 * 
 * @param spreadNumber - The current spread/page index
 * @param position - Whether this is a left page, right page, or mobile page
 * @returns The calculated page number
 */
export const calculateActualPageNumber = (
  spreadNumber: number, 
  position: 'left' | 'right' | 'mobile'
): number => {
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
