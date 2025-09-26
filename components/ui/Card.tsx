import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-panel border border-panel-border rounded-lg shadow-lg transition-shadow hover:shadow-accent/20 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
