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
import HomeBlogPreviewIts from '../components/home/iqtechnology/HomeBlogPreviewIts';
import HomeCallToActionIts from '../components/home/iqtechnology/HomeCallToActionIts';
import HomeContactIts from '../components/home/iqtechnology/HomeContactIts';
import HomePricingPlansIts from '../components/home/iqtechnology/HomePricingPlansIts';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col gap-8 md:gap-12">
      {/* 1. Banner slideshow */}
      <HomeBannerIts />

      {/* 2. Giới thiệu nhanh: IQ Technology là ai, dịch vụ chính */}
      <HomeAboutIts />
      
      {/* 3. Danh mục dịch vụ IT nổi bật */}
      <HomeServicesBenefitsIts />
      
      {/* 4. Tại sao chọn chúng tôi */}
      <HomeWhyChooseUsIts />

      {/* 5. Bảng giá dịch vụ IT */}
      <HomePricingPlansIts />
      
      {/* 6. Dự án đã thực hiện */}
      <HomeFeaturedProjectsIts />
      
      {/* 7. Quy trình làm việc */}
      <HomeProcessIts />
      
      {/* 8. Thống kê */}
      <HomeStatsCounterIts />
      
      {/* 9. Đánh giá khách hàng */}
      <HomeTestimonialsIts />

      {/* 10. Tin tức & Blog */}
      <HomeBlogPreviewIts />
      
      {/* 11. Đối tác */}
      <HomeBrandLogosIts />
      
      {/* 12. Kêu gọi hành động */}
      <HomeCallToActionIts />
      
      {/* 13. Liên hệ */}
      <HomeContactIts />
    </div>
  );
};

export default HomePage;