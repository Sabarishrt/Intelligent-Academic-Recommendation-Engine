import React from 'react';
import './ChartCard.css';

const ChartCard = ({ title, children, className = '' }) => {
  return (
    <div className={`chart-card ${className}`}>
      <h3 className="chart-card-title">{title}</h3>
      <div className="chart-card-content">{children}</div>
    </div>
  );
};

export default ChartCard;
