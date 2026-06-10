import { Routes, Route } from 'react-router-dom';
import { FinancePage } from './FinancePage';
import { InvoicesPage } from './InvoicesPage';
import { ExpensesPage } from './ExpensesPage';
import { PayrollPage } from './PayrollPage';

const FinanceModule = () => {
  return (
    <Routes>
      <Route path="/" element={<FinancePage />} />
      <Route path="/invoices" element={<InvoicesPage />} />
      <Route path="/expenses" element={<ExpensesPage />} />
      <Route path="/payroll" element={<PayrollPage />} />
    </Routes>
  );
};

export default FinanceModule;
