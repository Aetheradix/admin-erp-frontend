import { Routes, Route } from 'react-router-dom';
import { FinancePage } from './FinancePage';
import { InvoicesPage } from './InvoicesPage';
import { ExpensesPage } from './ExpensesPage';
import { PayrollPage } from './PayrollPage';
import SalarySlipForm from './components/SalarySlipForm';

const FinanceModule = () => {
  return (
    <Routes>
      <Route path="/" element={<FinancePage />} />
      <Route path="/salary-slip" element={<SalarySlipForm />} />
      <Route path="/invoices" element={<InvoicesPage />} />
      <Route path="/expenses" element={<ExpensesPage />} />
      <Route path="/payroll" element={<PayrollPage />} />
    </Routes>
  );
};

export default FinanceModule;
