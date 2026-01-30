import React from 'react';
import './index.css';
import Card from '../card';

interface LegendItem {
  key: string;
  label: string;
}

interface TimeLegendProps {
  items?: LegendItem[];
}

const DEFAULT_ITEMS: LegendItem[] = [
  { key: 'past', label: 'Past' },
  { key: 'current', label: 'Current' },
  { key: 'future', label: 'Future' }
];

const TimeLegend: React.FC<TimeLegendProps> = ({ items = DEFAULT_ITEMS }) => {
  return (
    <Card className="time-legend">
      <span className="legend-label">Legend:</span>
      {items.map(item => (
        <div key={item.key} className={`legend-item ${item.key}`}>
          {item.label}
        </div>
      ))}
    </Card>
  );
};

export default TimeLegend;
