import {
  hoursToDate,
  transformToGanttData,
  ensureGanttDate,
} from './utils';
import { Task } from './types';

describe('transformToGanttData', () => {
  const mockTask: Task = {
    taskCode: 'TASK-001',
    operationName: 'Foundation',
    elementName: 'Block A',
    duration: 8,
    startHours: 0,
    endHours: 8,
    equipment: [
      { name: 'Excavator', quantity: 2 },
      { name: 'Crane', quantity: 1 }
    ],
    crew: { name: 'Team Alpha', assignment: 5 },
    dependencies: []
  };

  it('should transform empty array', () => {
    const result = transformToGanttData([]);
    expect(result.data).toEqual([]);
    expect(result.links).toEqual([]);
  });

  it('should transform single task correctly', () => {
    const result = transformToGanttData([mockTask]);
    
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('TASK-001');
    expect(result.data[0].text).toBe('Foundation - Block A');
    expect(result.data[0].duration).toBe(8);
    expect(result.data[0].progress).toBe(0);
    expect(result.data[0].open).toBe(true);
  });

  it('should transform crew data correctly', () => {
    const result = transformToGanttData([mockTask]);
    
    expect(result.data[0].crewName).toBe('Team Alpha');
    expect(result.data[0].crewAssignment).toBe(5);
    expect(result.data[0].crewDetails).toEqual({ name: 'Team Alpha', assignment: 5 });
  });

  it('should handle task without crew', () => {
    const taskWithoutCrew: Task = {
      ...mockTask,
      crew: undefined
    };
    const result = transformToGanttData([taskWithoutCrew]);
    
    expect(result.data[0].crewName).toBe('None');
    expect(result.data[0].crewAssignment).toBe(0);
    expect(result.data[0].crewDetails).toBeUndefined();
  });

  it('should transform equipment list correctly', () => {
    const result = transformToGanttData([mockTask]);
    
    expect(result.data[0].equipmentList).toBe('Excavator (2), Crane (1)');
    expect(result.data[0].equipmentDetails).toEqual([
      { name: 'Excavator', quantity: 2 },
      { name: 'Crane', quantity: 1 }
    ]);
  });

  it('should handle empty equipment array', () => {
    const taskNoEquipment: Task = {
      ...mockTask,
      equipment: []
    };
    const result = transformToGanttData([taskNoEquipment]);
    
    expect(result.data[0].equipmentList).toBe('None');
  });

  it('should create links from dependencies', () => {
    const task1: Task = { ...mockTask, taskCode: 'TASK-001', dependencies: [] };
    const task2: Task = { ...mockTask, taskCode: 'TASK-002', dependencies: ['TASK-001'] };
    const task3: Task = { ...mockTask, taskCode: 'TASK-003', dependencies: ['TASK-001', 'TASK-002'] };

    const result = transformToGanttData([task1, task2, task3]);

    expect(result.links).toHaveLength(3);
    expect(result.links[0]).toEqual({ id: '1', source: 'TASK-001', target: 'TASK-002', type: '0' });
    expect(result.links[1]).toEqual({ id: '2', source: 'TASK-001', target: 'TASK-003', type: '0' });
    expect(result.links[2]).toEqual({ id: '3', source: 'TASK-002', target: 'TASK-003', type: '0' });
  });

  it('should populate dependency metadata for tooltips', () => {
    const tasks: Task[] = [
      { ...mockTask, taskCode: 'TASK-100', operationName: 'Excavation', elementName: 'Zone 1', dependencies: [] },
      { ...mockTask, taskCode: 'TASK-200', operationName: 'Foundation', elementName: 'Zone 1', dependencies: ['TASK-100'] },
      { ...mockTask, taskCode: 'TASK-300', operationName: 'Framing', elementName: 'Zone 1', dependencies: ['TASK-200'] }
    ];

    const result = transformToGanttData(tasks);
    const getTask = (id: string) => result.data.find(task => task.id === id)!;

    const excavation = getTask('TASK-100');
    expect(excavation.dependencyIds).toEqual([]);
    expect(excavation.dependencyTexts).toEqual([]);
    expect(excavation.dependentIds).toEqual(['TASK-200']);
    expect(excavation.dependentTexts).toEqual(['Foundation - Zone 1']);

    const foundation = getTask('TASK-200');
    expect(foundation.dependencyIds).toEqual(['TASK-100']);
    expect(foundation.dependencyTexts).toEqual(['Excavation - Zone 1']);
    expect(foundation.dependentIds).toEqual(['TASK-300']);
    expect(foundation.dependentTexts).toEqual(['Framing - Zone 1']);

    const framing = getTask('TASK-300');
    expect(framing.dependencyIds).toEqual(['TASK-200']);
    expect(framing.dependencyTexts).toEqual(['Foundation - Zone 1']);
    expect(framing.dependentIds).toEqual([]);
    expect(framing.dependentTexts).toEqual([]);
  });

  it('should calculate dates correctly', () => {
    const result = transformToGanttData([mockTask]);
    
    expect(result.data[0].start_date).toEqual(hoursToDate(0));
    expect(result.data[0].end_date).toEqual(hoursToDate(8));
  });

  it('should handle multiple tasks', () => {
    const tasks: Task[] = [
      { ...mockTask, taskCode: 'TASK-001' },
      { ...mockTask, taskCode: 'TASK-002', operationName: 'Framing' },
      { ...mockTask, taskCode: 'TASK-003', elementName: 'Block B' }
    ];

    const result = transformToGanttData(tasks);
    
    expect(result.data).toHaveLength(3);
    expect(result.data[0].id).toBe('TASK-001');
    expect(result.data[1].id).toBe('TASK-002');
    expect(result.data[2].id).toBe('TASK-003');
  });

  it('should prefer custom labels when provided', () => {
    const customTask: Task = {
      ...mockTask,
      taskCode: 'TASK-CUSTOM',
      label: 'Custom Label'
    };
    const result = transformToGanttData([customTask]);
    expect(result.data[0].text).toBe('Custom Label');
  });
});

describe('ensureGanttDate', () => {
  it('returns the same instance when provided a Date', () => {
    const date = new Date(2025, 0, 1, 10, 15);
    expect(ensureGanttDate(date)).toBe(date);
  });

  it('parses gantt formatted strings', () => {
    const result = ensureGanttDate('01/02/2025 03:30');
    expect(result).toEqual(new Date(2025, 0, 2, 3, 30));
  });

  it('falls back to Date constructor for other string formats', () => {
    const isoValue = '2025-01-02T03:30:00.000Z';
    expect(ensureGanttDate(isoValue)).toEqual(new Date(isoValue));
  });
});
