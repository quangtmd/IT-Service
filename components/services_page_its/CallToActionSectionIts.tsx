
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Button from '../ui/Button';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

interface CallToActionSectionItsProps {
  title: string;
  subtitle?: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

const CallToActionSectionIts: React.FC<CallToActionSectionItsProps> = ({
  title,
  subtitle,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
}) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.3, triggerOnce: true });

  return (
    <section
      ref={ref}
      className={`py-16 md:py-20 bg-gradient-to-r from-neutral-800 to-neutral-900 text-white animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-center text-center lg:text-left gap-8">
          <div className="lg:w-2/3">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{title}</h2>
            {subtitle && <p className="text-neutral-300 text-lg max-w-2xl mx-auto lg:mx-0">{subtitle}</p>}
          </div>
          <div className="flex-shrink-0 space-y-3 sm:space-y-0 sm:flex sm:flex-col md:flex-row md:space-x-4">
            <ReactRouterDOM.Link to={primaryButtonLink} className="block md:inline-block">
              <Button variant="primary" size="lg" className="w-full md:w-auto px-8 py-3 shadow-lg hover:shadow-primary/40 transition-shadow">
                {primaryButtonText} <i className="fas fa-arrow-right ml-2 text-sm"></i>
              </Button>
            </ReactRouterDOM.Link>
            {secondaryButtonLink && secondaryButtonText && (
              <ReactRouterDOM.Link to={secondaryButtonLink} className="block md:inline-block">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full md:w-auto border-neutral-400 text-neutral-200 hover:bg-neutral-700 hover:text-white hover:border-neutral-700 px-8 py-3"
                >
                  {secondaryButtonText}
                </Button>
              </ReactRouterDOM.Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSectionIts;