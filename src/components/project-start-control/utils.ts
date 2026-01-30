import { format, parse } from 'date-fns';

export const toDateTimeLocalValue = (date: Date): string => format(date, "yyyy-MM-dd'T'HH:mm");

export const parseDateTimeLocalValue = (value: string, fallback: Date): Date | null => {
  const parsed = parse(value, "yyyy-MM-dd'T'HH:mm", fallback);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};