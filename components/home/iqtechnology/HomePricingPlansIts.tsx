
import React, { useState } from 'react';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants';
import { PricingPlan } from '../../../types';
import PricingPlanCard from '../../shared/PricingPlanCard';
import ConsultationRequestModal from '../../shared/ConsultationRequestModal';

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
      <section className="home-section bg-bgBase">
        <div className="container mx-auto px-4">
          <div ref={titleRef} className={`home-section-title-area animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
            <span className="home-section-pretitle">BẢNG GIÁ DỊCH VỤ</span>
            <h2 className="home-section-title text-4xl md:text-5xl font-extrabold">
              Các Gói Dịch Vụ IT Của Chúng Tôi
            </h2>
            <p className="home-section-subtitle">
              Chọn gói dịch vụ phù hợp nhất với nhu cầu và quy mô của doanh nghiệp bạn. Linh hoạt, hiệu quả và minh bạch.
            </p>
          </div>
          
          <div ref={plansRef} className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch animate-on-scroll fade-in-up ${arePlansVisible ? 'is-visible' : ''}`}>
            {plans.map((plan, index) => (
              <div key={plan.id} style={{ animationDelay: `${index * 100}ms` }}>
                <PricingPlanCard 
                  plan={plan} 
                  isPopular={plan.isPopular}
                  showPrice={false}
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
      