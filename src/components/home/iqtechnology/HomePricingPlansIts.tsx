
import React, { useState } from 'react';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants';
import { PricingPlan } from '../../../types';
import ConsultationRequestModal from '../../shared/ConsultationRequestModal';
import Button from '../../ui/Button';

// Internal component for Dark Theme Card
const DarkPricingCard: React.FC<{ plan: PricingPlan; isPopular?: boolean; onSelect: (name: string) => void }> = ({ plan, isPopular, onSelect }) => {
    return (
        <div className={`relative p-8 rounded-2xl flex flex-col h-full border transition-all duration-300 group ${isPopular ? 'bg-gray-800/80 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.15)] scale-105 z-10' : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'}`}>
            {isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                    PHỔ BIẾN NHẤT
                </div>
            )}
            
            <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-sm text-gray-500 ml-2">{plan.period}</span>
                </div>
                {plan.saveText && <p className="text-xs text-green-400 mt-2">{plan.saveText}</p>}
            </div>
            
            <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm text-gray-400">
                        <i className={`fas fa-check mr-3 mt-1 ${isPopular ? 'text-cyan-400' : 'text-gray-600'}`}></i>
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            
            <Button 
                onClick={() => onSelect(plan.name)}
                className={`w-full py-3 rounded-lg font-bold transition-all ${isPopular ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/50' : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'}`}
            >
                {plan.buttonText || 'Chọn Gói Này'}
            </Button>
        </div>
    );
};

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
      <section className="home-section relative z-10">
        <div className="container mx-auto px-4">
          <div ref={titleRef} className={`text-center mb-16 animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
            <span className="text-cyan-500 font-mono text-sm tracking-widest uppercase mb-2 block">Dịch Vụ IT</span>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              Bảng Giá Tham Khảo
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Linh hoạt, minh bạch và tối ưu chi phí cho doanh nghiệp của bạn.
            </p>
          </div>
          
          <div ref={plansRef} className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start animate-on-scroll fade-in-up ${arePlansVisible ? 'is-visible' : ''}`}>
            {plans.map((plan, index) => (
                <DarkPricingCard 
                  key={plan.id}
                  plan={plan} 
                  isPopular={plan.isPopular}
                  onSelect={handleSelectPlan}
                />
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
