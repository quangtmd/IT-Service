
import React from 'react';
import HomeHero3D from '../components/home/iqtechnology/HomeHero3D';
import HomeServicesBenefitsIts from '../components/home/iqtechnology/HomeServicesBenefitsIts';
import HomeAboutIts from '../components/home/iqtechnology/HomeAboutIts';
import HomeWhyChooseUsIts from '../components/home/iqtechnology/HomeWhyChooseUsIts';
import HomeStatsCounterIts from '../components/home/iqtechnology/HomeStatsCounterIts';
import HomeFeaturedProjectsIts from '../components/home/iqtechnology/HomeFeaturedProjectsIts';
import HomeTestimonialsIts from '../components/home/iqtechnology/HomeTestimonialsIts';
import HomeBrandLogosIts from '../components/home/iqtechnology/HomeBrandLogosIts';
import HomeProcessIts from '../components/home/iqtechnology/HomeProcessIts';
import HomeHotProductsIts from '../components/home/iqtechnology/HomeHotProductsIts';
import HomeBlogPreviewIts from '../components/home/iqtechnology/HomeBlogPreviewIts';
import HomeCallToActionIts from '../components/home/iqtechnology/HomeCallToActionIts';
import HomeContactIts from '../components/home/iqtechnology/HomeContactIts';
import HomePricingPlansIts from '../components/home/iqtechnology/HomePricingPlansIts';

const HomePage: React.FC = () => {
  return (
    <div className="bg-[#020617] min-h-screen"> {/* Ensure dark theme base */}
      {/* 1. 3D Hero Section */}
      <HomeHero3D />
      
      {/* 2. Intro Text (Refracting Ideas...) */}
      <HomeAboutIts />

      {/* 3. Feature Cards (Neural Network style) - Was Services */}
      <HomeServicesBenefitsIts />
      
      {/* 4. Performance Metrics (Glass stats) - Was Stats Counter */}
      <HomeStatsCounterIts />

      {/* 5. Technical Arsenal (Tech Chips) - Was Brand Logos */}
      <HomeBrandLogosIts />
      
      {/* 6. Featured Projects */}
      <HomeFeaturedProjectsIts />

      {/* 7. Why Choose Us */}
      <HomeWhyChooseUsIts />

      {/* 8. Pricing Plans */}
      <HomePricingPlansIts />

      {/* 9. Hot Products (Updated with 3D background) */}
      <HomeHotProductsIts />
      
      {/* 10. Process */}
      <HomeProcessIts />
      
      {/* 11. Testimonials */}
      <HomeTestimonialsIts />

      {/* 12. Blog Preview */}
      <HomeBlogPreviewIts />
      
      {/* 13. Call To Action */}
      <HomeCallToActionIts />
      
      {/* 14. Contact */}
      <HomeContactIts />
    </div>
  );
};

export default HomePage;
