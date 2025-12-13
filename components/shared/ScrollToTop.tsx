// Fix: Import React to make React.FC and other React types available.
import React from 'react';
import { useEffect } from 'react';
// Fix: Use named import for useLocation
import { useLocation } from 'react-router-dom';

const ScrollToTop: React.FC = () => {
  // Fix: Use useLocation directly
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
