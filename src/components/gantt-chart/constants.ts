import { ColumnKey } from "./types";

export const DEFAULT_PROJECT_START_DATE = new Date('2026-01-01T07:00:00');
export const GANTT_DATE_FORMAT = 'MM/dd/yyyy HH:mm';
export const COLUMN_KEYS: ColumnKey[] = ['text', 'start_date', 'duration', 'equipmentList', 'crew'];