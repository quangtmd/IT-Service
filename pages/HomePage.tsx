
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
import HotProducts from '../components/home/HotProducts';
import HomeBlogPreviewIts from '../components/home/iqtechnology/HomeBlogPreviewIts';
import HomeCallToActionIts from '../components/home/iqtechnology/HomeCallToActionIts';
import HomeContactIts from '../components/home/iqtechnology/HomeContactIts';
import HomePricingPlansIts from '../components/home/iqtechnology/HomePricingPlansIts';

const HomePage: React.FC = () => {
  return (
    <div>
      {/* 1. 3D Hero Section (Thay thế Banner cũ) */}
      <HomeHero3D />

      {/* 2. Giới thiệu nhanh: IQ Technology là ai, dịch vụ chính */}
      <HomeAboutIts />

      {/* 4. Danh mục dịch vụ IT nổi bật */}
      <HomeServicesBenefitsIts />
      
      {/* Additional: Why Choose Us - Logically follows services */}
      <HomeWhyChooseUsIts />

      {/* New: Pricing Plans Section */}
      <HomePricingPlansIts />

      {/* 3. Danh mục sản phẩm nổi bật */}
      <HotProducts />

      {/* 5. Dự án đã thực hiện (gắn link chi tiết) */}
      <HomeFeaturedProjectsIts />
      
      {/* Additional: Process - How we work */}
      <HomeProcessIts />
      
      {/* Additional: Stats Counter - Showcases scale/achievements */}
      <HomeStatsCounterIts />
      
      {/* 7. Đánh giá khách hàng */}
      <HomeTestimonialsIts />

      {/* 6. Tin tức & Blog */}
      <HomeBlogPreviewIts />
      
      {/* Additional: Brand Logos - Social proof */}
      <HomeBrandLogosIts />
      
      {/* Additional: Call To Action - Engage user before contact */}
      <HomeCallToActionIts />
      
      {/* 8. Liên hệ nhanh + Chatbot AI hỗ trợ (Chatbot is in App.tsx) */}
      <HomeContactIts />
    </div>
  );
};

export default HomePage;
