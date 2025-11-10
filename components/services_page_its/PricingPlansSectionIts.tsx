import React, { useState } from 'react';
import { PricingPlan } from '../../types';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';
import PricingPlanCard from '../shared/PricingPlanCard';
import ConsultationRequestModal from '../shared/ConsultationRequestModal';
import * as Constants from '../../constants';


interface PricingPlansSectionItsProps {
  title: string;
  subtitle?: string;
  plans: PricingPlan[];
}

const PricingPlansSectionIts: React.FC<PricingPlansSectionItsProps> = ({ title, subtitle, plans }) => {
  const [titleRef, isTitleVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const [plansRef, arePlansVisible] = useIntersectionObserver({ threshold: 0.05, triggerOnce: true });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  if (!plans || plans.length === 0) {
    return (
      <section className="py-16 md:py-20 bg-bgMuted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-textBase mb-3">{title}</h2>
          {subtitle && <p className="text-textMuted max-w-xl mx-auto mb-10">{subtitle}</p>}
          <p className="text-textMuted">Hiện chưa có gói dịch vụ nào. Vui lòng quay lại sau.</p>
        </div>
      </section>
    );
  }

  const handleSelectPlan = (planName: string) => {
    setSelectedPlan(planName);
    setIsModalOpen(true);
  };

  return (
    <>
      <section className="py-16 md:py-20 bg-pricing-bg relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div ref={titleRef} className={`text-center mb-4 animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
            <span className="font-semibold text-pricing-blue-dark">Giảm giá 33%</span>
          </div>

          <div ref={titleRef} className={`text-center mb-12 md:mb-16 animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">{title}</h2>
            {subtitle && <p className="text-gray-600 max-w-xl mx-auto">{subtitle}</p>}
          </div>
          
          <div ref={plansRef} className={`flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 items-stretch overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide animate-on-scroll fade-in-up ${arePlansVisible ? 'is-visible' : ''}`}>
            {plans.map((plan) => (
              <div key={plan.id} className={`w-[85vw] max-w-sm md:w-auto flex-shrink-0 transition-transform duration-300 ${plan.isPopular ? 'lg:scale-105' : ''}`}>
                <PricingPlanCard 
                  plan={plan} 
                  isPopular={plan.isPopular}
                  showPrice={true}
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

export default PricingPlansSectionIts;
