import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  isLoading = false,
  className = '',
  ...props
}) => {
  const baseStyles = "font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out inline-flex items-center justify-center";
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // Adjusted for light theme
  const variantStyles = {
    primary: 'bg-primary hover:bg-primary-dark focus:ring-primary text-white',
    secondary: 'bg-secondary hover:bg-secondary-dark focus:ring-secondary text-white', // This is a dark red, might need adjustment for light theme if used as main secondary
    outline: 'border border-primary text-primary hover:bg-primary/10 focus:ring-primary', // Primary outline
    ghost: 'text-primary hover:bg-primary/10 focus:ring-primary', // Ghost for primary actions
    danger: 'bg-danger-bg text-danger-text border border-danger-border hover:bg-red-100 focus:ring-danger-text', // Using Tailwind danger palette
  };
  
  // Specific outline for non-primary colors in light theme
  if (variant === 'outline' && !className.includes('border-primary')) { // Default outline to use textMuted and borderStrong
     variantStyles.outline = `border border-borderStrong text-textMuted hover:bg-bgMuted hover:border-borderStrong focus:ring-primary`;
  }
  if (variant === 'ghost' && !className.includes('text-primary')) { // Default ghost for textMuted
     variantStyles.ghost = `text-textMuted hover:bg-bgMuted focus:ring-primary`;
  }


  const loadingStyles = isLoading ? 'opacity-75 cursor-not-allowed' : '';
  const spinnerColor = (variant === 'primary' || variant === 'secondary') ? 'text-white' : 'text-primary';


  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${loadingStyles} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className={`animate-spin -ml-1 mr-3 h-5 w-5 ${spinnerColor}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {leftIcon && !isLoading && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;