import React from 'react';
import { MOCK_TESTIMONIALS } from '../../data/mockData';
import Card from '../ui/Card';

const Testimonials: React.FC = () => {
  return (
    <section className="py-16 bg-bgMuted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-textBase mb-4">Khách Hàng Nói Gì Về Chúng Tôi</h2>
        <p className="text-center text-textMuted mb-12 max-w-xl mx-auto">
          Sự hài lòng của bạn là động lực phát triển của chúng tôi.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_TESTIMONIALS.map(testimonial => (
            <Card key={testimonial.id} className="p-6 flex flex-col items-center text-center border border-borderDefault hover:shadow-xl">
              <img 
                src={testimonial.avatarUrl} 
                alt={testimonial.name} 
                className="w-20 h-20 rounded-full mb-4 shadow-md"
              />
              <p className="text-textMuted italic mb-4 flex-grow">"{testimonial.quote}"</p>
              <h4 className="font-semibold text-textBase">{testimonial.name}</h4>
              {testimonial.role && <p className="text-sm text-primary">{testimonial.role}</p>}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;