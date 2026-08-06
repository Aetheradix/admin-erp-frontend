import { Routes, Route } from 'react-router-dom';
import { TasksPage } from './TasksPage';

const TasksModule = () => {
  return (
    <Routes>
      <Route path="/" element={<TasksPage />} />
    </Routes>
  );
};

export default TasksModule;
