import React from 'react';
import { PricingPlan } from '../../../types';
import Button from '../../ui/Button';
import TiltCard from '../../ui/TiltCard';

interface HomePricingPlanCardProps {
  plan: PricingPlan;
  isPopular?: boolean;
  onSelect: (planName: string) => void;
}

const HomePricingPlanCard: React.FC<HomePricingPlanCardProps> = ({ plan, isPopular, onSelect }) => {
  return (
    <TiltCard className="h-full">
        <div className={`p-6 flex flex-col h-full relative overflow-hidden rounded-2xl border-2 transition-all duration-300
            bg-slate-800/40 backdrop-blur-lg shadow-2xl
            ${isPopular ? 'border-primary shadow-primary/20' : 'border-white/10'}`}>
        
        {isPopular && (
            <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-4 py-1 rounded-bl-lg shadow-md z-10">Phổ biến</div>
        )}

        <h3 className="text-xl font-bold font-condensed text-center text-white mb-4 pt-4">{plan.name}</h3>
        
        <ul className="space-y-3 text-sm flex-grow mb-6">
            {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start text-gray-300">
                <i className="fas fa-check-circle text-primary/70 mr-3 mt-1 flex-shrink-0"></i>
                <span>{feature}</span>
            </li>
            ))}
        </ul>

        <div className="mt-auto">
            <Button 
                variant="outline" 
                size="sm" 
                className={`w-full group transition-all duration-300 border-white/20 text-white
                            hover:bg-primary hover:text-white hover:border-primary
                            ${isPopular && 'bg-primary border-primary hover:bg-primary-dark hover:border-primary-dark'}`}
                onClick={() => onSelect(plan.name)}
            >
                Xem chi tiết
            </Button>
        </div>
        </div>
    </TiltCard>
  );
};

export default HomePricingPlanCard;
