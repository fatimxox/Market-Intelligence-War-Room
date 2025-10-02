import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-gradient-to-b from-panel to-panel/80 border border-panel-border rounded-lg shadow-lg transition-all duration-300 hover:shadow-accent/10 hover:border-accent/30 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;