import { useCallback, useEffect, useState } from 'react';
import './App.css';
import GanttChart from './components/gantt-chart';
import { Task } from './components/gantt-chart/types';
import Spinner from './components/spinner';
import { DEFAULT_PROJECT_START_DATE } from './components/gantt-chart/constants';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectStartDate, setProjectStartDate] = useState<Date>(() => new Date(DEFAULT_PROJECT_START_DATE));

  const handleProjectStartChange = useCallback((date: Date) => {
    setProjectStartDate(date);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data.json');
        if (!response.ok) {
          throw new Error('Failed to load schedule data');
        }
        const data: Task[] = await response.json();
        setTasks(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <main className="App">
        <div className="loading"><Spinner/></div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="App">
        <div className="error">Error: {error}</div>
      </main>
    );
  }

  return (
    <main className="App">
      <GanttChart
        tasks={tasks}
        projectStartDate={projectStartDate}
        onProjectStartChange={handleProjectStartChange}
      />
    </main>
  );
  
}

export default App;
