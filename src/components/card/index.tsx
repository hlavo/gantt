import React from 'react';
import './index.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`card ${className}`}>
    {children}
  </div>
);

export default Card;
