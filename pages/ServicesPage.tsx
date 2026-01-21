

import React from 'react';
import { MOCK_SERVICES } from '../data/mockData';
import * as Constants from '../constants'; 
import PageTitleBannerIts from '../components/services_page_its/PageTitleBannerIts';
import ServiceCardIts from '../components/services_page_its/ServiceCardIts';
import CallToActionSectionIts from '../components/services_page_its/CallToActionSectionIts';
import PricingPlansSectionIts from '../components/services_page_its/PricingPlansSectionIts';
import ServiceFaqIts from '../components/services_page_its/ServiceFaqIts'; 
import HomeBlogPreviewIts from '../components/home/iqtechnology/HomeBlogPreviewIts';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import { SiteSettings } from '../types';

const ServicesPage: React.FC = () => {
  const breadcrumbs = [
    { label: "Trang chủ", path: "/home" },
    { label: "Dịch vụ" }
  ];

  const [servicesRef, areServicesVisible] = useIntersectionObserver({ threshold: 0.05, triggerOnce: true });
  const [blogTitleRef, isBlogTitleVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  const [siteSettings, setSiteSettings] = React.useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  React.useEffect(() => {
    const storedSettingsRaw = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
    if (storedSettingsRaw) {
      setSiteSettings(JSON.parse(storedSettingsRaw));
    }
  }, []);


  return (
    <div>
      <PageTitleBannerIts title="Dịch Vụ IT Của Chúng Tôi" breadcrumbs={breadcrumbs} />

      <section ref={servicesRef} className="py-16 md:py-20 bg-bgCanvas">
        <div className="container mx-auto px-4">
          {MOCK_SERVICES.length > 0 ? (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-on-scroll fade-in-up ${areServicesVisible ? 'is-visible' : ''}`}>
              {MOCK_SERVICES.map((service, index) => (
                <ServiceCardIts key={service.id} service={service} index={index} />
              ))}
            </div>
          ) : (
            <p className="text-center text-textMuted text-lg">Hiện tại chưa có dịch vụ nào được cập nhật. Vui lòng quay lại sau.</p>
          )}
        </div>
      </section>

      <CallToActionSectionIts
        title="Cần Tư Vấn Giải Pháp IT Cho Doanh Nghiệp Bạn?"
        subtitle="Đội ngũ chuyên gia của chúng tôi sẵn sàng lắng nghe và đưa ra giải pháp tối ưu nhất, giúp doanh nghiệp bạn phát triển mạnh mẽ hơn."
        primaryButtonText="Liên Hệ Ngay"
        primaryButtonLink="/contact"
        secondaryButtonText="Xem Các Dự Án"
        secondaryButtonLink="/projects"
      />
      
      <PricingPlansSectionIts
        title="Gói Dịch Vụ IT Của Chúng Tôi"
        subtitle="Chọn gói dịch vụ phù hợp nhất với nhu cầu và ngân sách của doanh nghiệp bạn. Linh hoạt, hiệu quả và minh bạch."
        plans={Constants.MOCK_PRICING_PLANS_DATA}
      />

      <div ref={blogTitleRef} className={`text-center pt-16 md:pt-20 bg-bgCanvas animate-on-scroll fade-in-up ${isBlogTitleVisible ? 'is-visible' : ''}`}>
        <span className="inline-flex items-center text-sm font-semibold text-primary mb-3">
            <img src={siteSettings.siteLogoUrl || ''} onError={(e) => (e.currentTarget.style.display = 'none')} alt={`${siteSettings.companyName} logo`} className="inline h-6 mr-2 object-contain" /> 
            TIN TỨC & KIẾN THỨC
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-textBase leading-tight mb-12 md:mb-16">
            Bài Viết Liên Quan Dịch Vụ IT
        </h2>
      </div>
      <HomeBlogPreviewIts categoryFilter="Dịch vụ IT" maxArticles={4} /> 

      <ServiceFaqIts /> 
    </div>
  );
};

export default ServicesPage;
