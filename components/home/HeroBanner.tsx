

import React from 'react';
// FIX: Using wildcard import for react-router-dom to handle potential module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import Button from '../ui/Button';
import * as Constants from '../../constants.tsx';

const HeroBanner: React.FC = () => {
  const heroBgImageUrl = "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1400&q=80";

  return (
    <div
      className="relative text-white py-20 px-4 md:py-32 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('${heroBgImageUrl}')` }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      <div className="container mx-auto text-center relative z-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-in-up opacity-0" style={{animationDelay: '0.2s'}}>
          {Constants.COMPANY_SLOGAN}
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto animate-fade-in-up opacity-0" style={{animationDelay: '0.4s'}}>
          Linh kiện PC chính hãng, dịch vụ IT chuyên nghiệp, hỗ trợ tận tâm. Khám phá ngay!
        </p>
        <div className="space-x-0 space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in-up opacity-0" style={{animationDelay: '0.6s'}}>
          <ReactRouterDOM.Link to="/services">
            <Button size="lg" variant="primary" className="w-full sm:w-auto">
              <i className="fas fa-headset mr-2"></i> Yêu Cầu Hỗ Trợ
            </Button>
          </ReactRouterDOM.Link>
          <ReactRouterDOM.Link to="/shop">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary"
            >
              <i className="fas fa-microchip mr-2"></i> Xem Linh Kiện
            </Button>
          </ReactRouterDOM.Link>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;