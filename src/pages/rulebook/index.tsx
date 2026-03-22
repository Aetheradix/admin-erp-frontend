import { Routes, Route } from 'react-router-dom';
import { RulebookPage } from './RulebookPage';

const RulebookModule = () => {
  return (
    <Routes>
      <Route path="/" element={<RulebookPage />} />
    </Routes>
  );
};

export default RulebookModule;
