
import React from 'react';

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  icon?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({ 
  children, 
  variant = 'primary', 
  icon, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "font-bold py-2.5 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";
  
  const variants = {
    primary: "bg-primary text-white shadow-md active:scale-95 transition-transform",
    outline: "bg-primary/10 text-primary border border-primary active:bg-primary/20 transition-colors"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <i className={`${icon} ${children ? 'mr-2' : ''}`}></i>}
      {children}
    </button>
  );
};

export default CustomButton;
