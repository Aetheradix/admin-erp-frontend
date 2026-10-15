import { Routes, Route } from 'react-router-dom';
import { FinancePage } from './FinancePage';
import { InvoicesPage } from './InvoicesPage';
import { ExpensesPage } from './ExpensesPage';
import PayrollPage from './PayrollPage';
import MyPaySlipPage from './MyPaySlipPage';
import AuditBookPage from './AuditBookPage';

const FinanceModule = () => {
  return (
    <Routes>
      <Route path="/" element={<FinancePage />} />
      <Route path="/invoices" element={<InvoicesPage />} />
      <Route path="/expenses" element={<ExpensesPage />} />
      <Route path="/payroll" element={<PayrollPage />} />
      <Route path="/my-payslip" element={<MyPaySlipPage />} />
      <Route path="/audit" element={<AuditBookPage />} />
      <Route path="/reimbursements" element={<FinancePage />} />
    </Routes>
  );
};

export default FinanceModule;
