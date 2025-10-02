import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  children: React.ReactNode;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'default', children, className, ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none transform active:scale-95";
  
  const variantClasses = {
    primary: "bg-accent text-background font-semibold hover:bg-accent-hover shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/30 hover:scale-[1.03]",
    secondary: "bg-secondary text-primary-text hover:bg-secondary-hover",
    outline: "border border-panel-border bg-transparent hover:bg-secondary hover:text-accent hover:border-accent/70",
    ghost: "hover:bg-secondary hover:text-primary-text",
  };

  const sizeClasses = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;