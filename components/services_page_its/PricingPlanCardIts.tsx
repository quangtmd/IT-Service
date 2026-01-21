import React from 'react';
import { PricingPlan } from '../../types';
import Button from '../ui/Button';
import * as ReactRouterDOM from 'react-router-dom';

interface PricingPlanCardItsProps {
  plan: PricingPlan;
}

const PricingPlanCardIts: React.FC<PricingPlanCardItsProps> = ({ plan }) => {
  const isPopular = plan.isPopular;

  const buttonColorClass = isPopular 
    ? 'bg-pricing-orange-DEFAULT hover:bg-pricing-orange-dark text-white' 
    : 'bg-pricing-blue-DEFAULT hover:bg-pricing-blue-dark text-white';
  const ribbonColorClass = isPopular ? 'bg-pricing-orange-DEFAULT' : 'bg-pricing-blue-DEFAULT';

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg flex flex-col transition-all duration-300 relative p-6 pt-10 border-2 ${isPopular ? 'border-pricing-orange-DEFAULT' : 'border-transparent'}`}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 z-10">
          <div className={`${ribbonColorClass} pricing-ribbon text-white text-sm font-bold px-4 py-2.5 text-center shadow-md`}>
              {plan.name}
          </div>
      </div>
      
      <div className="text-center mb-6 h-6 flex items-center justify-center">
        {plan.saveText && (
          <div className="flex items-center justify-center space-x-2">
            {plan.originalPrice && <span className="text-gray-400 line-through text-sm"> {plan.originalPrice} </span>}
            <span className="bg-pricing-blue-bg text-pricing-blue-dark font-semibold text-xs px-3 py-1 rounded-full">
              {plan.saveText}
            </span>
          </div>
        )}
      </div>

      <div className="text-center mb-8">
        <span className="text-5xl font-extrabold text-gray-800 tracking-tight">
          {plan.price}
        </span>
        <span className="text-gray-500 font-medium">
          {plan.period}
        </span>
      </div>

      <ul className="space-y-3 text-sm flex-grow mb-8">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-center text-gray-700">
            <i className="fas fa-check text-pricing-blue-light mr-3"></i>
            <span>{feature}</span>
            <i className="fas fa-question-circle text-gray-300 ml-auto cursor-pointer hover:text-pricing-blue-DEFAULT" title="Thông tin chi tiết"></i>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        <ReactRouterDOM.Link to={plan.buttonLink || '/contact'} className="block">
          <Button
            size="lg"
            className={`w-full py-3 font-bold group rounded-lg transition-all duration-300 ${buttonColorClass}`}
          >
            {plan.buttonText || 'Đăng Ký'}
            <i className="fas fa-arrow-right text-xs ml-2 transition-transform group-hover:translate-x-1"></i>
          </Button>
        </ReactRouterDOM.Link>
      </div>
    </div>
  );
};

export default PricingPlanCardIts;