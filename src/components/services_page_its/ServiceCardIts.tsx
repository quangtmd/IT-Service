
import React from 'react';
import { Link } from 'react-router-dom';
import { Service } from '../../types';
import Button from '../ui/Button';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';
import TiltCard from '../ui/TiltCard'; // Import TiltCard

interface ServiceCardItsProps {
  service: Service;
  index: number;
}

const ServiceCardIts: React.FC<ServiceCardItsProps> = ({ service, index }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  return (
    <div
      ref={ref}
      className={`animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <TiltCard className="h-full">
        <div className="bg-bgBase rounded-xl shadow-lg overflow-hidden flex flex-col group border border-borderDefault hover:shadow-primary/20 transition-all duration-300 transform h-full">
          <div className="relative aspect-video overflow-hidden">
            <img
              src={service.imageUrl || `https://picsum.photos/seed/${service.id}/500/350`}
              alt={service.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
             
             {/* Floating Icon */}
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-primary p-3 rounded-xl border border-primary/30 shadow-lg group-hover:scale-110 transition-transform">
                <i className={`${service.icon || 'fas fa-concierge-bell'} text-2xl`}></i>
            </div>
          </div>
          
          <div className="p-6 flex flex-col flex-grow relative z-10 bg-gradient-to-b from-bgBase to-bgCanvas">
            <h3 className="text-xl font-bold text-textBase group-hover:text-primary transition-colors mb-3">
              <Link to={`/service/${service.slug || service.id}`} className="line-clamp-2">{service.name}</Link>
            </h3>
            <p className="text-textMuted text-sm mb-5 line-clamp-3 leading-relaxed flex-grow">{service.description}</p>
            <div className="mt-auto pt-4 border-t border-borderDefault/50">
              <Link to={`/service/${service.slug || service.id}`}>
                <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                  Chi tiết dịch vụ <i className="fas fa-arrow-right text-xs ml-2"></i>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </TiltCard>
    </div>
  );
};

export default ServiceCardIts;
