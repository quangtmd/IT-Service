import React from 'react';
import { PricingPlan } from '../../types';
import Button from '../ui/Button';

interface PricingPlanCardProps {
  plan: PricingPlan;
  isPopular?: boolean;
  showPrice: boolean;
  onSelect: (planName: string) => void;
}

const PricingPlanCard: React.FC<PricingPlanCardProps> = ({ plan, isPopular, showPrice, onSelect }) => {
  const isContactPlan = plan.price.toLowerCase() === 'liên hệ';

  const cardClasses = `bg-white rounded-xl shadow-lg flex flex-col transition-all duration-300 p-6 h-full relative overflow-hidden border-2 ${
    isPopular ? 'border-primary' : 'border-borderDefault'
  }`;

  const ribbonClasses = `absolute top-4 -right-10 transform rotate-45 bg-primary text-white text-xs font-bold px-8 py-1 shadow-md`;

  const buttonClasses = `w-full py-3 font-bold group rounded-lg transition-all duration-300 text-white ${
    isPopular ? 'bg-primary hover:bg-primary-dark' : 'bg-gray-800 hover:bg-gray-900'
  }`;

  return (
    <div className={cardClasses}>
      {isPopular && <div className={ribbonClasses}>Phổ biến</div>}
      
      <h3 className="text-xl font-bold font-condensed text-center text-textBase mb-4 pt-4">{plan.name}</h3>

      {showPrice && (
        <div className="text-center mb-8">
          <span className="text-5xl font-extrabold text-gray-800 tracking-tight">
            {plan.price}
          </span>
          <span className="text-gray-500 font-medium">
            {plan.period}
          </span>
        </div>
      )}

      <ul className="space-y-3 text-sm flex-grow mb-8">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start text-gray-700">
            <i className="fas fa-check-circle text-primary/70 mr-3 mt-1 flex-shrink-0"></i>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        <Button
          size="lg"
          className={buttonClasses}
          onClick={() => onSelect(plan.name)}
        >
          {isContactPlan ? 'Yêu cầu tư vấn' : (showPrice ? 'Chọn Gói Này' : 'Xem chi tiết')}
          <i className="fas fa-arrow-right text-xs ml-2 transition-transform group-hover:translate-x-1"></i>
        </Button>
      </div>
    </div>
  );
};

export default PricingPlanCard;
