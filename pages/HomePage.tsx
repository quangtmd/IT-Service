import React from 'react';
import HomeBannerIts from '../components/home/iqtechnology/HomeBannerIts';
import HomeServicesBenefitsIts from '../components/home/iqtechnology/HomeServicesBenefitsIts';
import HomeAboutIts from '../components/home/iqtechnology/HomeAboutIts';
import HomeWhyChooseUsIts from '../components/home/iqtechnology/HomeWhyChooseUsIts';
import HomeStatsCounterIts from '../components/home/iqtechnology/HomeStatsCounterIts';
import HomeFeaturedProjectsIts from '../components/home/iqtechnology/HomeFeaturedProjectsIts';
import HomeTestimonialsIts from '../components/home/iqtechnology/HomeTestimonialsIts';
import HomeBrandLogosIts from '../components/home/iqtechnology/HomeBrandLogosIts';
import HomeProcessIts from '../components/home/iqtechnology/HomeProcessIts';
import ProductCarouselSection from '../components/shop/ProductCarouselSection';
import HomeBlogPreviewIts from '../components/home/iqtechnology/HomeBlogPreviewIts';
import HomeCallToActionIts from '../components/home/iqtechnology/HomeCallToActionIts';
import HomeContactIts from '../components/home/iqtechnology/HomeContactIts';
import HomePricingPlansIts from '../components/home/iqtechnology/HomePricingPlansIts';
import HomeCategoryShowcase from '../components/home/HomeCategoryShowcase';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col gap-8 md:gap-12">
      {/* 1. Banner slideshow (khuyến mãi, dịch vụ IT, sản phẩm mới) */}
      <HomeBannerIts />

      {/* NEW: Category Tabs Showcase */}
      <HomeCategoryShowcase />

      {/* 2. Giới thiệu nhanh: IQ Technology là ai, dịch vụ chính */}
      <HomeAboutIts />
      
      {/* 3. Product sections by category */}
      <ProductCarouselSection 
        title="Linh Kiện PC Bán Chạy" 
        categoryName="Linh kiện máy tính" 
        viewAllLink="/shop?mainCategory=linh_kien_may_tinh" 
      />
      <ProductCarouselSection 
        title="Laptop Nổi Bật" 
        categoryName="Laptop" 
        viewAllLink="/shop?mainCategory=laptop" 
      />
       <ProductCarouselSection 
        title="PC Gaming Cấu Hình Khủng" 
        categoryName="Máy tính để bàn (PC)" 
        viewAllLink="/shop?mainCategory=may_tinh_de_ban&subCategory=pc_gaming" 
      />
      <ProductCarouselSection 
        title="Thiết Bị Ngoại Vi" 
        categoryName="Thiết bị ngoại vi" 
        viewAllLink="/shop?mainCategory=thiet_bi_ngoai_vi"
      />

      {/* 4. Danh mục dịch vụ IT nổi bật */}
      <HomeServicesBenefitsIts />
      
      {/* Additional: Why Choose Us - Logically follows services */}
      <HomeWhyChooseUsIts />

      {/* New: Pricing Plans Section */}
      <HomePricingPlansIts />
      
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