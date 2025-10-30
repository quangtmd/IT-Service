import React from 'react';
import { PricingPlan } from '../../types';
import Button from '../ui/Button';
// FIX: Using wildcard import for react-router-dom to handle potential module resolution issues.
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
            {plan.originalPrice && <span className="text-gray-400 line