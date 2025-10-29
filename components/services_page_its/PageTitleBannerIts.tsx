import React from 'react';
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
    <div className="page-title-banner-its bg-bgBase text-textBase py-16 md:py-20 text-center relative border-b border-borderDefault">
      <div ref={titleRef} className={`container mx-auto px-4 relative z-10 animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
        <nav aria-label="breadcrumb">
          <ol className="flex justify-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {crumb.path ? (
                  <Link to={crumb.path} className="hover:text-primary transition-colors text-textMuted">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-textSubtle">{crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <span className="mx-2 text-textSubtle">/</span>
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
