import React, { ChangeEvent, useMemo } from 'react';
import Card from '../card';
import './index.css';
import { parseDateTimeLocalValue, toDateTimeLocalValue } from './utils';

interface ProjectStartControlProps {
  value: Date;
  defaultValue: Date;
  onChange: (date: Date) => void;
}

const ProjectStartControl: React.FC<ProjectStartControlProps> = ({
  value,
  defaultValue,
  onChange
}) => {
  const inputValue = useMemo(() => toDateTimeLocalValue(value), [value]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value: nextValue } = event.target;
    if (!nextValue) {
      onChange(defaultValue);
      return;
    }

    const parsed = parseDateTimeLocalValue(nextValue, defaultValue);
    if (!parsed) {
      return;
    }

    onChange(parsed);
  };

  return (
    <Card className="project-start-control">
      <label className="project-start-control__label" htmlFor="project-start-date">
        Project start:
      </label>
      <input
        id="project-start-date"
        type="datetime-local"
        value={inputValue}
        onChange={handleChange}
        className="project-start-control__input"
      />
    </Card>
  );
};

export default ProjectStartControl;
