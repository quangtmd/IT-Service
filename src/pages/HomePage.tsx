
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
import HomeTechArsenal from '../components/home/iqtechnology/HomeTechArsenal';

const HomePage: React.FC = () => {
  return (
    <div className="bg-[#020617] min-h-screen text-gray-100 relative overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      
      {/* 1. 3D Hero Section (Replaces Banner) */}
      <HomeHero3D />

      <div className="relative z-10 space-y-24 pb-20">
        
        {/* 2. Brand Logos */}
        <div className="border-y border-white/5 bg-black/20 backdrop-blur-sm">
             <HomeBrandLogosIts />
        </div>

        {/* 3. Tech Arsenal - Skills & Tech Stack */}
        <HomeTechArsenal />

        {/* 4. Hot Products - The "Cyber Store" look */}
        <HomeHotProductsIts />

        {/* 5. Services - Interactive Neon Cards */}
        <HomeServicesBenefitsIts />
        
        {/* 6. About Us - HUD Style */}
        <HomeAboutIts />

        {/* 7. Stats - Floating Glass Bar */}
        <HomeStatsCounterIts />

        {/* 8. Why Choose Us */}
        <HomeWhyChooseUsIts />

        {/* 9. Featured Projects - Gallery */}
        <HomeFeaturedProjectsIts />
        
        {/* 10. Pricing Plans - Dark Cards */}
        <HomePricingPlansIts />

        {/* 11. Process & Testimonials */}
        <div className="bg-gradient-to-b from-[#020617] to-[#0f172a]">
             <HomeProcessIts />
             <HomeTestimonialsIts />
        </div>

        {/* 12. Blog & CTA */}
        <HomeBlogPreviewIts />
        <HomeCallToActionIts />
        
        {/* 13. Contact */}
        <HomeContactIts />
      </div>
    </div>
  );
};

export default HomePage;
