import { Routes, Route } from 'react-router-dom';
import { FinancePage } from './FinancePage';

const FinanceModule = () => {
  return (
    <Routes>
      <Route path="/" element={<FinancePage />} />
    </Routes>
  );
};

export default FinanceModule;
