

import React from 'react';
import * as ReactRouterDOM from 'react-router-dom'; // Link is compatible with v6/v7
import { MOCK_SERVICES } from '../../data/mockData';
import { Service } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import useIntersectionObserver from '../../hooks/useIntersectionObserver'; 

const ServiceCard: React.FC<{ service: Service, index: number }> = ({ service, index }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const animationDelay = `${index * 100}ms`; 

  return (
    <div ref={ref} className={`animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''}`} style={{ animationDelay }}>
      <Card
        className="text-center p-6 flex flex-col items-center group card-hover-lift border-t-4 border-transparent hover:border-primary transition-all duration-300 h-full"
      >
        {service.icon && (
          <div className="service-card-icon-wrapper p-3 bg-primary/10 text-primary rounded-full mb-4 group-hover:bg-primary/20 transition-colors duration-300">
            <i className={`${service.icon} text-3xl service-card-icon`}></i>
          </div>
        )}
        <h3 className="text-xl font-semibold text-textBase mb-2">{service.name}</h3>
        <p className="text-textMuted text-sm mb-4 flex-grow">{service.description}</p>
        <ReactRouterDOM.Link to={`/services#${service.slug || service.id}`} className="mt-auto w-full"> 
          <Button
            variant="outline"
            size="sm"
            className="w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300"
          >
            Xem chi tiết
          </Button>
        </ReactRouterDOM.Link>
      </Card>
    </div>
  );
};


const FeaturedServices: React.FC = () => {
  return (
    <section className="py-16 bg-bgCanvas">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-textBase mb-4">Dịch Vụ Nổi Bật</h2>
        <p className="text-center text-textMuted mb-12 max-w-xl mx-auto">
          Chúng tôi cung cấp các giải pháp IT toàn diện, từ sửa chữa, nâng cấp đến bảo trì hệ thống chuyên nghiệp.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> 
          {MOCK_SERVICES.map((service: Service, index: number) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedServices;
