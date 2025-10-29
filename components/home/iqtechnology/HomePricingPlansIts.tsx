import React, { useState } from 'react';
import * as Constants from '../../../constants';
import { PricingPlan } from '../../../types';
import HomePricingPlanCard from './HomePricingPlanCard';
import ConsultationRequestModal from '../../shared/ConsultationRequestModal';

const HomePricingPlansIts: React.FC = () => {
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
      <section className="bg-bgBase">
        <div className="container mx-auto px-4">
          <div className="home-section-title-area">
            <span className="home-section-pretitle">BẢNG GIÁ DỊCH VỤ</span>
            <h2 className="home-section-title text-4xl md:text-5xl font-extrabold">
              Các Gói Dịch Vụ IT Của Chúng Tôi
            </h2>
            <p className="home-section-subtitle">
              Chọn gói dịch vụ phù hợp nhất với nhu cầu và quy mô của doanh nghiệp bạn. Linh hoạt, hiệu quả và minh bạch.
            </p>
          </div>
          
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-stretch overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 scrollbar-hide">
            {plans.map((plan, index) => (
              <div key={plan.id} className="w-[85vw] max-w-xs sm:w-auto flex-shrink-0">
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