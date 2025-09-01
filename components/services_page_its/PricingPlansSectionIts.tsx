import React from 'react';
import { PricingPlan } from '../../types';
import PricingPlanCardIts from './PricingPlanCardIts';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

interface PricingPlansSectionItsProps {
  title: string;
  subtitle?: string;
  plans: PricingPlan[];
}

const PricingPlansSectionIts: React.FC<PricingPlansSectionItsProps> = ({ title, subtitle, plans }) => {
  const [titleRef, isTitleVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const [plansRef, arePlansVisible] = useIntersectionObserver({ threshold: 0.05, triggerOnce: true });

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

  return (
    <section className="py-16 md:py-20 bg-pricing-bg relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div ref={titleRef} className={`text-center mb-4 animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
           <span className="font-semibold text-pricing-blue-dark">Giảm giá 33%</span>
        </div>

        <div ref={titleRef} className={`text-center mb-12 md:mb-16 animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">{title}</h2>
          {subtitle && <p className="text-gray-600 max-w-xl mx-auto">{subtitle}</p>}
        </div>
        
        <div ref={plansRef} className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-center animate-on-scroll fade-in-up ${arePlansVisible ? 'is-visible' : ''}`}>
          {plans.map((plan) => (
            <div key={plan.id} className={`transition-transform duration-300 ${plan.isPopular ? 'lg:scale-105' : ''}`}>
              <PricingPlanCardIts plan={plan} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingPlansSectionIts;
