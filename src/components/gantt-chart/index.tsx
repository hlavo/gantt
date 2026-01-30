import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import './index.css';
import { Task, ColumnKey, GanttTask } from './types';
import ColumnToggles from '../column-toggles';
import TimeLegend from '../time-legend';
import ProjectStartControl from '../project-start-control';
import {
  COLUMNS,
  DISABLED_COLUMNS,
  DEFAULT_VISIBLE_COLUMNS,
  buildColumns,
  calculateGridWidth,
  isColumnKey,
  buildTooltip,
  taskClassTemplate,
  transformToGanttData,
  ensureGanttDate,
} from './utils';
import { DEFAULT_PROJECT_START_DATE } from './constants';

interface GanttChartProps {
  tasks: Task[];
  projectStartDate: Date;
  onProjectStartChange: (date: Date) => void;
}

const GanttChart: React.FC<GanttChartProps> = ({
  tasks,
  projectStartDate,
  onProjectStartChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const visibleColumnsRef = useRef<ColumnKey[]>(DEFAULT_VISIBLE_COLUMNS);
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(DEFAULT_VISIBLE_COLUMNS);

  const updateColumns = useCallback(() => {
    const columns = buildColumns(visibleColumns);
    gantt.config.columns = columns;
    gantt.config.grid_width = calculateGridWidth(columns);
    gantt.render();
  }, [visibleColumns]);

  const handleColumnToggle = (columnKey: string, isVisible: boolean) => {
    if (!isColumnKey(columnKey)) {
      return;
    }
    setVisibleColumns(prev => {
      let next: ColumnKey[];
      if (isVisible) {
        next = prev.includes(columnKey) ? prev : [...prev, columnKey];
      } else {
        next = prev.filter(key => key !== columnKey);
      }
      visibleColumnsRef.current = next;
      return next;
    });
  };

  useEffect(() => {
    if (!containerRef.current) return;

    gantt.plugins({
      tooltip: true
    });

    gantt.config.readonly = true;
    gantt.config.date_format = '%m/%d/%Y %H:%i';
    gantt.config.scale_unit = 'day';
    gantt.config.duration_unit = 'hour';
    gantt.config.duration_step = 1;
    gantt.config.row_height = 35;
    gantt.config.bar_height = 25;
    
    gantt.config.scales = [
      { unit: 'day', step: 1, format: '%m/%d/%Y' },
      { unit: 'hour', step: 4, format: '%H:%i' }
    ];

    const initialColumns = buildColumns(visibleColumnsRef.current);
    gantt.config.columns = initialColumns;
    gantt.config.grid_width = calculateGridWidth(initialColumns);

    const now = new Date();
    gantt.templates.task_class = taskClassTemplate(now);
    gantt.templates.tooltip_text = (
      start: Date | string,
      end: Date | string,
      task: GanttTask
    ) => buildTooltip(ensureGanttDate(start), ensureGanttDate(end), task);

    gantt.init(containerRef.current);

    const ganttData = transformToGanttData(tasks, projectStartDate);
    gantt.clearAll();
    gantt.parse(ganttData);

    return () => {
      gantt.clearAll();
    };
  }, [tasks, projectStartDate]);

  useEffect(() => {
    updateColumns();
  }, [visibleColumns, updateColumns]);

  return (
    <div className="gantt-wrapper">
      <div className="gantt-controls">
        <ProjectStartControl
          value={projectStartDate}
          defaultValue={DEFAULT_PROJECT_START_DATE}
          onChange={onProjectStartChange}
        />
        <ColumnToggles
          columns={COLUMNS}
          visibleColumns={visibleColumns}
          onToggle={handleColumnToggle}
          disabledColumns={DISABLED_COLUMNS}
        />
        <TimeLegend />
      </div>
      <div ref={containerRef} className="gantt-container" />
    </div>
  );
};

export default GanttChart;
