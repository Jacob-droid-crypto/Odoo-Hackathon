import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-surface border border-border rounded-md ${
        hoverable ? 'hover:border-[#D0CEC7] transition-all duration-150 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
