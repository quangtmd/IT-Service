

import React from 'react';
import { Link } from 'react-router-dom';
import { Service } from '../../types';
import Button from '../ui/Button';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

interface ServiceCardItsProps {
  service: Service;
  index: number;
}

const ServiceCardIts: React.FC<ServiceCardItsProps> = ({ service, index }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  return (
    <div
      ref={ref}
      className={`service-card-its bg-bgBase rounded-xl shadow-lg overflow-hidden flex flex-col group animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''} border border-borderDefault hover:shadow-primary/20 transition-all duration-300 transform hover:-translate-y-1`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative aspect-video overflow-hidden"> {/* Added overflow-hidden */}
        <img
          src={service.imageUrl || `https://picsum.photos/seed/${service.id}/500/350`}
          alt={service.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-6 flex flex-col flex-grow relative z-10"> {/* Ensure content is above pseudo-element */}
        <div className="flex items-center mb-4">
          <div className="bg-primary/10 text-primary p-3 rounded-full mr-4 shadow-sm">
            <i className={`${service.icon || 'fas fa-concierge-bell'} text-2xl w-6 h-6 text-center`}></i>
          </div>
          <h3 className="text-xl font-semibold text-textBase group-hover:text-primary transition-colors">
            <Link to={`/service/${service.slug || service.id}`} className="line-clamp-1">{service.name}</Link>
          </h3>
        </div>
        <p className="text-textMuted text-sm mb-5 line-clamp-3 leading-relaxed flex-grow h-20">{service.description}</p>
        <div className="mt-auto">
          <Link to={`/service/${service.slug || service.id}`}>
            <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
              Tìm hiểu thêm <i className="fas fa-arrow-right text-xs ml-2"></i>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceCardIts;