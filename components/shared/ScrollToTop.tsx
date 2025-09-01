
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // useLocation is fine for v6/v7

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
