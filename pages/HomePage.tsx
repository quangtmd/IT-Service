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
import HotProducts from '../components/home/HotProducts'; // Reverted to HotProducts
import HomeBlogPreviewIts from '../components/home/iqtechnology/HomeBlogPreviewIts';
import HomeCallToActionIts from '../components/home/iqtechnology/HomeCallToActionIts';
import HomeContactIts from '../components/home/iqtechnology/HomeContactIts';
import HomePricingPlansIts from '../components/home/iqtechnology/HomePricingPlansIts';

const HomePage: React.FC = () => {
  return (
    <div>
      <HomeBannerIts />
      <HomeAboutIts />
      <HomeServicesBenefitsIts />
      <HomeWhyChooseUsIts />
      <HomePricingPlansIts />

      {/* Reverted back to the original HotProducts component */}
      <HotProducts />
      
      <HomeFeaturedProjectsIts />
      <HomeProcessIts />
      <HomeStatsCounterIts />
      <HomeTestimonialsIts />
      <HomeBlogPreviewIts />
      <HomeBrandLogosIts />
      <HomeCallToActionIts />
      <HomeContactIts />
    </div>
  );
};

export default HomePage;