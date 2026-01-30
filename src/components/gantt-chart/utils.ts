import { Task, ColumnConfig, ColumnDefinition, ColumnKey, GanttData, GanttLink, GanttTask } from './types';
import { DEFAULT_PROJECT_START_DATE, GANTT_DATE_FORMAT, COLUMN_KEYS } from './constants';
import { addHours, format, parse, isValid, isDate } from 'date-fns';
import escape from 'lodash/fp/escape';

export const formatDate = (date: Date): string => format(date, GANTT_DATE_FORMAT);

export const hoursToDate = (
  hours: number,
  projectStartDate: Date = DEFAULT_PROJECT_START_DATE
): Date => {
  return addHours(projectStartDate, hours);
};

export const transformToGanttData = (
  tasks: Task[],
  projectStartDate: Date = DEFAULT_PROJECT_START_DATE
): GanttData => {
  const labelsByTask = new Map<string, string>();
  const dependentsByTask = new Map<string, string[]>();

  const createLabel = (task: Task): string =>
    task.label?.trim() || `${task.operationName} - ${task.elementName}`;

  tasks.forEach(task => {
    const label = createLabel(task);
    labelsByTask.set(task.taskCode, label);

    task.dependencies.forEach(depId => {
      const dependents = dependentsByTask.get(depId);
      if (dependents) {
        dependents.push(task.taskCode);
      } else {
        dependentsByTask.set(depId, [task.taskCode]);
      }
    });
  });

  const resolveLabel = (taskId: string): string => labelsByTask.get(taskId) ?? taskId;
  const resolveDependents = (taskId: string): string[] => dependentsByTask.get(taskId) ?? [];

  const ganttTasks: GanttTask[] = tasks
    .map(task => {
      const dependencyIds = [...task.dependencies];
      const dependentIds = resolveDependents(task.taskCode);

      return {
        id: task.taskCode,
        text: resolveLabel(task.taskCode),
        start_date: hoursToDate(task.startHours, projectStartDate),
        end_date: hoursToDate(task.endHours, projectStartDate),
        duration: task.duration,
        progress: 0,
        open: true,
        operationName: task.operationName,
        elementName: task.elementName,
        crewName: task.crew?.name || 'None',
        crewAssignment: task.crew?.assignment || 0,
        equipmentList: task.equipment.map(e => `${e.name} (${e.quantity})`).join(', ') || 'None',
        equipmentDetails: task.equipment,
        crewDetails: task.crew,
        dependencyIds,
        dependencyTexts: dependencyIds.map(resolveLabel),
        dependentIds,
        dependentTexts: dependentIds.map(resolveLabel)
      };
    })
    .sort((a, b) => a.start_date.getTime() - b.start_date.getTime());

  let linkId = 1;
  const ganttLinks: GanttLink[] = tasks.flatMap(task =>
    task.dependencies.map(depId => ({
      id: String(linkId++),
      source: depId,
      target: task.taskCode,
      type: '0'
    }))
  );

  return { data: ganttTasks, links: ganttLinks };
};

export const COLUMNS: ColumnDefinition[] = [
  { key: 'text', label: 'Task Name', required: true },
  { key: 'start_date', label: 'Start Date' },
  { key: 'duration', label: 'Duration' },
  { key: 'equipmentList', label: 'Equipment' },
  { key: 'crew', label: 'Crew' }
];

export const DISABLED_COLUMNS: ColumnKey[] = ['text'];

const startDateTemplate = (task: GanttTask): string => {
  if (task.start_date) {
    return formatDate(new Date(task.start_date));
  }
  return '';
};

const durationTemplate = (task: GanttTask): string => `${task.duration}h`;

const crewTemplate = (task: GanttTask): string =>
  task.crewName !== 'None' ? `${task.crewName} (${task.crewAssignment})` : 'None';

export const COLUMN_CONFIGS: Record<ColumnKey, ColumnConfig> = {
  text: { name: 'text', label: 'Task Name', tree: true, width: 350 },
  start_date: {
    name: 'start_date',
    label: 'Start Date',
    align: 'center',
    width: 150,
    template: startDateTemplate
  },
  duration: {
    name: 'duration',
    label: 'Duration (h)',
    align: 'center',
    width: 100,
    template: durationTemplate
  },
  equipmentList: {
    name: 'equipmentList',
    label: 'Equipment',
    width: 150
  },
  crew: {
    name: 'crew',
    label: 'Crew',
    width: 180,
    template: crewTemplate
  }
};

const DEFAULT_COLUMN_WIDTH = 150;

export const DEFAULT_VISIBLE_COLUMNS: ColumnKey[] = [...COLUMN_KEYS];

export const buildColumns = (keys: ColumnKey[]): ColumnConfig[] =>
  keys.map((key) => ({ ...COLUMN_CONFIGS[key] }));

export const isColumnKey = (value: string): value is ColumnKey =>
  (COLUMN_KEYS as readonly string[]).includes(value);

const DEFAULT_EMPTY_LIST = '<em>None</em>';

const formatEquipmentDetails = (task: GanttTask): string => {
  if (!task.equipmentDetails || task.equipmentDetails.length === 0) {
    return DEFAULT_EMPTY_LIST;
  }

  return (
    '<ul class="tooltip-list">' +
    task.equipmentDetails
      .map((equipment) => `<li>${escape(equipment.name)} (${escape(String(equipment.quantity))})</li>`)
      .join('') +
    '</ul>'
  );
};

const formatCrewDetails = (task: GanttTask): string => {
  if (!task.crewDetails) {
    return DEFAULT_EMPTY_LIST;
  }

  return `${escape(task.crewDetails.name)}: ${escape(String(task.crewDetails.assignment))}`;
};

const formatRelationshipDetails = (items: string[]): string => {
  if (!items || items.length === 0) {
    return DEFAULT_EMPTY_LIST;
  }

  return (
    '<ul class="tooltip-list">' +
    items.map(item => `<li>${escape(item)}</li>`).join('') +
    '</ul>'
  );
};

export const buildTooltip = (
  start: Date,
  end: Date,
  task: GanttTask,
  dependencies?: string[],
  dependents?: string[]
): string => `
  <div class="gantt-tooltip">
    <div class="tooltip-title">${escape(task.text)}</div>
    <div class="tooltip-row"><strong>Start:</strong> ${escape(formatDate(start))}</div>
    <div class="tooltip-row"><strong>End:</strong> ${escape(formatDate(end))}</div>
    <div class="tooltip-row"><strong>Duration:</strong> ${escape(String(task.duration))} hours</div>
    <div class="tooltip-section">
      <strong>Equipment:</strong>
      ${formatEquipmentDetails(task)}
    </div>
    <div class="tooltip-section">
      <strong>Crew:</strong>
      ${formatCrewDetails(task)}
    </div>
    <div class="tooltip-section">
      <strong>Depends on:</strong>
      ${formatRelationshipDetails(dependencies ?? task.dependencyTexts)}
    </div>
    <div class="tooltip-section">
      <strong>Unlocks:</strong>
      ${formatRelationshipDetails(dependents ?? task.dependentTexts)}
    </div>
  </div>
`;

export const ensureGanttDate = (value: Date | string): Date => {
  if (isDate(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = parse(value, GANTT_DATE_FORMAT, new Date());
    if (isValid(parsed)) {
      return parsed;
    }
    const fallback = new Date(value);
    if (isValid(fallback)) {
      return fallback;
    }
  }

  return new Date(value);
};

export const taskClassTemplate = (now: Date) => (start: Date, end: Date): string => {
  if (end < now) {
    return 'task-past';
  }

  if (start <= now && end >= now) {
    return 'task-current';
  }

  return 'task-future';
};

export const calculateGridWidth = (columns: ColumnConfig[]): number => {
  if (columns.length === 0) {
    return 0;
  }

  return columns.reduce((sum, column) => sum + (column.width ?? DEFAULT_COLUMN_WIDTH), 0);
};
