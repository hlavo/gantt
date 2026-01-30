export type ColumnKey = 'text' | 'start_date' | 'duration' | 'equipmentList' | 'crew';


export interface Equipment {
  name: string;
  quantity: number;
}

export interface Crew {
  name: string;
  assignment: number;
}

export interface Task {
  taskCode: string;
  operationName: string;
  elementName: string;
  duration: number;
  startHours: number;
  endHours: number;
  crew?: Crew;
  equipment: Equipment[];
  dependencies: string[];
  label?: string;
}
export interface ColumnDefinition {
  key: ColumnKey;
  label: string;
  required?: boolean;
}

export interface ColumnConfig {
  name: ColumnKey;
  label: string;
  tree?: boolean;
  width?: number;
  align?: 'left' | 'center' | 'right';
  template?: (task: GanttTask) => string;
}

export interface GanttTask {
  id: string;
  text: string;
  start_date: Date;
  end_date: Date;
  duration: number;
  progress: number;
  open: boolean;
  operationName: string;
  elementName: string;
  crewName: string;
  crewAssignment: number;
  equipmentList: string;
  equipmentDetails: Equipment[];
  crewDetails?: Crew;
  dependencyIds: string[];
  dependencyTexts: string[];
  dependentIds: string[];
  dependentTexts: string[];
}

export interface GanttData {
  data: GanttTask[];
  links: GanttLink[];
}

export interface GanttLink {
  id: string;
  source: string;
  target: string;
  type: string;
}

export type LinkDirection = 'incoming' | 'outgoing';

export interface LinkEndpoints {
  source: string | number;
  target: string | number;
}
