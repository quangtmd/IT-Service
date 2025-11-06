import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  const clickableStyles = onClick ? 'cursor-pointer hover:shadow-xl transition-shadow duration-300' : '';
  // Light theme: white background, standard shadow
  return (
    <div
      className={`bg-bgBase rounded-lg shadow-lg overflow-hidden ${clickableStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;