import React from 'react';
import './index.css';
import Checkbox from '../checkbox';
import Card from '../card';

interface Column {
  key: string;
  label: string;
  required?: boolean;
}

interface ColumnTogglesProps {
  columns: Column[];
  visibleColumns: string[];
  onToggle: (columnKey: string, isVisible: boolean) => void;
  disabledColumns?: string[];
}

const ColumnToggles: React.FC<ColumnTogglesProps> = ({
  columns,
  visibleColumns,
  onToggle,
  disabledColumns = []
}) => {
  return (
    <Card className="column-toggles">
      <span className="toggle-label">Columns:</span>
      {columns.map(column => (
        <Checkbox
          key={column.key}
          checked={visibleColumns.includes(column.key)}
          onChange={(checked) => onToggle(column.key, checked)}
          disabled={disabledColumns.includes(column.key)}
          label={column.label}
          className="column-toggle"
        />
      ))}
    </Card>
  );
};

export default ColumnToggles;
