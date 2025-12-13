import React, { useState, Suspense } from 'react';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants';
import { PricingPlan } from '../../../types';
import HomePricingPlanCard from './HomePricingPlanCard';
import ConsultationRequestModal from '../../shared/ConsultationRequestModal';
import { Canvas } from '@react-three/fiber';
import DigitalGridBackground from '../three/DigitalGridBackground';

const HomePricingPlansIts: React.FC = () => {
  const [titleRef, isTitleVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const [plansRef, arePlansVisible] = useIntersectionObserver({ threshold: 0.05, triggerOnce: true });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans: PricingPlan[] = Constants.MOCK_PRICING_PLANS_DATA;

  if (!plans || plans.length === 0) {
    return null; 
  }
  
  const handleSelectPlan = (planName: string) => {
    setSelectedPlan(planName);
    setIsModalOpen(true);
  };

  return (
    <>
      <section className="home-section relative overflow-hidden bg-[#0B1120] text-white">
        <div className="absolute inset-0 z-0">
            <Canvas>
                <Suspense fallback={null}>
                    <DigitalGridBackground />
                </Suspense>
            </Canvas>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div ref={titleRef} className={`home-section-title-area animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
            <span className="home-section-pretitle bg-white/10 text-primary border border-primary/20">BẢNG GIÁ DỊCH VỤ</span>
            <h2 className="home-section-title text-4xl md:text-5xl font-extrabold text-white">
              Các Gói Dịch Vụ IT Của Chúng Tôi
            </h2>
            <p className="home-section-subtitle text-gray-300">
              Chọn gói dịch vụ phù hợp nhất với nhu cầu và quy mô của doanh nghiệp bạn. Linh hoạt, hiệu quả và minh bạch.
            </p>
          </div>
          
          <div ref={plansRef} className={`flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-stretch overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 scrollbar-hide animate-on-scroll fade-in-up ${arePlansVisible ? 'is-visible' : ''}`}>
            {plans.map((plan, index) => (
              <div key={plan.id} className="w-[85vw] max-w-xs sm:w-auto flex-shrink-0" style={{ animationDelay: `${index * 100}ms` }}>
                <HomePricingPlanCard 
                  plan={plan} 
                  isPopular={plan.isPopular}
                  onSelect={handleSelectPlan}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <ConsultationRequestModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planName={selectedPlan}
      />
    </>
  );
};

export default HomePricingPlansIts;
