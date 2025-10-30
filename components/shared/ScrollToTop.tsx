


// Fix: Import React to make React.FC and other React types available.
import React from 'react';
import { useEffect } from 'react';
// FIX: Using wildcard import for react-router-dom to handle potential module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';

const ScrollToTop: React.FC = () => {
  const { pathname } = ReactRouterDOM.useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;