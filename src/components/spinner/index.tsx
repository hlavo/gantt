import React from 'react';
import './index.css';

interface SpinnerProps {
  className?: string
}

const Spinner: React.FC<SpinnerProps> = ({className = ''}) => {
  return (
    <div className={`spinner ${className}`} role="status" aria-live="polite" aria-label="Loading"/>
  )
}

export default Spinner;
