

import React from 'react';
// Fix: Use named import for Link
import { Link } from 'react-router-dom';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageTitleBannerItsProps {
  title: string;
  breadcrumbs: BreadcrumbItem[];
}

const PageTitleBannerIts: React.FC<PageTitleBannerItsProps> = ({ title, breadcrumbs }) => {
  const [titleRef, isTitleVisible] = useIntersectionObserver({ threshold: 0.2, triggerOnce: true });

  return (
    <div className="page-title-banner-its bg-gradient-to-br from-neutral-900 via-neutral-800 to-gray-900 text-white py-20 md:py-28 text-center relative">
      <div className="animation-bubble">
        {[...Array(7)].map((_, i) => (
          <div key={i} className={`bubble bubble-${i + 1}`} style={{ animationDelay: `${i * 0.7}s`, bottom: `${Math.random() * 80 + 10}%`, left: `${Math.random() * 90}%` }}></div>
        ))}
      </div>
      <div ref={titleRef} className={`container mx-auto px-4 relative z-10 animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
        <nav aria-label="breadcrumb">
          <ol className="flex justify-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {crumb.path ? (
                  // Fix: Use Link directly
                  <Link to={crumb.path} className="hover:text-primary transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-neutral-400">{crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <span className="mx-2 text-neutral-500">/</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default PageTitleBannerIts;
