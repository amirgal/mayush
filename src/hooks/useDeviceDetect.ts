import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768; // Common breakpoint for mobile devices

/**
 * Custom React hook to detect if the current device is mobile based on window width.
 * @returns {boolean} isMobile - True if the window width is less than or equal to MOBILE_BREAKPOINT, false otherwise.
 */
const useDeviceDetect = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    // Check if window is defined (for SSR/Node.js environments)
    if (typeof window === 'undefined') {
      return false; 
    }
    return window.innerWidth <= MOBILE_BREAKPOINT;
  });

  useEffect(() => {
    // Guard against non-browser environments
    if (typeof window === 'undefined') {
      return; 
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };

    // Set the initial state correctly after component mounts in the browser
    handleResize();

    window.addEventListener('resize', handleResize);
    
    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array ensures this effect runs only on mount and unmount

  return isMobile;
};

export default useDeviceDetect;