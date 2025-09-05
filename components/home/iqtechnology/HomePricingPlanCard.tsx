import React from 'react';
import { PricingPlan } from '../../../types';
import { Link } from 'react-router-dom';
import Button from '../../ui/Button';

interface HomePricingPlanCardProps {
  plan: PricingPlan;
  isPopular?: boolean;
}

const HomePricingPlanCard: React.FC<HomePricingPlanCardProps> = ({ plan, isPopular }) => {
  return (
    <div className={`modern-card p-6 flex flex-col h-full relative overflow-hidden border-2 ${isPopular ? 'border-primary' : 'border-borderDefault'}`}>
      {isPopular && (
        <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-4 py-1 rounded-bl-lg shadow-md">Phổ biến</div>
      )}
      <h3 className="text-xl font-bold font-condensed text-center text-textBase mb-4 pt-4">{plan.name}</h3>
      <ul className="space-y-2 text-sm flex-grow mb-6">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start text-textMuted">
            <i className="fas fa-check-circle text-primary/70 mr-2 mt-1 flex-shrink-0"></i>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        <Link to="/services" className="block">
          <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
            Xem chi tiết
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HomePricingPlanCard;