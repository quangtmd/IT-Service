// Fix: Import React to make React.FC and other React types available.
import React from 'react';
import { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom'; // useLocation is fine for v6/v7

const ScrollToTop: React.FC = () => {
  const { pathname } = ReactRouterDOM.useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
