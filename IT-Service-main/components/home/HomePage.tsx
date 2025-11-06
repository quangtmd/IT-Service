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
import HotProducts from '../components/home/HotProducts';
import HomeBlogPreviewIts from '../components/home/iqtechnology/HomeBlogPreviewIts';
import HomeCallToActionIts from '../components/home/iqtechnology/HomeCallToActionIts';
import HomeContactIts from '../components/home/iqtechnology/HomeContactIts';
import HomePricingPlansIts from '../components/home/iqtechnology/HomePricingPlansIts';
import HeroBanner from '../components/home/HeroBanner';
import FeaturedServices from '../components/home/FeaturedServices';
import WhyChooseUs from '../components/home/WhyChooseUs';
import Testimonials from '../components/home/Testimonials';

const HomePage: React.FC = () => {
  return (
    <div>
      <HeroBanner />
      <FeaturedServices />
      <HotProducts />
      <WhyChooseUs />
      <Testimonials />
    </div>
  );
};

export default HomePage;