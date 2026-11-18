import { useState } from 'react';
import { useExpensesPage } from './hooks/useExpensesPage';
import { useAvailableUsers } from './expenses/hooks/useAvailableUsers';
import { useExpenseDateFilter } from './expenses/hooks/useExpenseDateFilter';
import { useExpenseForm } from './expenses/hooks/useExpenseForm';
import { useExpenseExport } from './expenses/hooks/useExpenseExport';
import { getDatePresetLabel } from './expenses/utils';
import { ExpenseStatsCards } from './expenses/components/ExpenseStatsCards';
import { ExpensePageHeader } from './expenses/components/ExpensePageHeader';
import { ExpenseReportCenter } from './expenses/components/ExpenseReportCenter';
import { ExpenseFiltersBar } from './expenses/components/ExpenseFiltersBar';
import { ExpenseTable } from './expenses/components/ExpenseTable';
import { CreateExpenseModal } from './expenses/components/CreateExpenseModal';
import { ExpenseDetailsModal } from './expenses/components/ExpenseDetailsModal';
import { RejectExpenseModal } from './expenses/components/RejectExpenseModal';

export function ExpensesPage() {
  const {
    filteredExpenses,
    stats,
    isLoading,
    isFetching,
    isSubmitting,
    isUpdatingStatus,
    isError,
    error,
    showFormModal,
    setShowFormModal,
    showDetailModal,
    selectedExpense,
    openDetails,
    closeDetails,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    activeStatus,
    setActiveStatus,
    resetFilters,
    handleCreateExpense,
    handleApprove,
    handleReject,
    handleMarkAsPaid,
    refetch,
  } = useExpensesPage();

  const availableUsers = useAvailableUsers();

  const {
    datePreset,
    setDatePreset,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    dateFilteredExpenses,
    clearCustomDates,
    resetDateFilter,
  } = useExpenseDateFilter(filteredExpenses);

  const [rejectionModalId, setRejectionModalId] = useState<number | string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const dateRangeLabel = getDatePresetLabel(datePreset, customStartDate, customEndDate);

  const { handleDownloadCSV, handleExpenseReportDownloadPDF, handleDownloadSingleVoucherPDF } =
    useExpenseExport({
      expenses: dateFilteredExpenses,
      category: activeCategory,
      status: activeStatus,
      dateRangeLabel,
    });

  const expenseForm = useExpenseForm({
    availableUsers,
    onCreate: handleCreateExpense,
    onClose: () => setShowFormModal(false),
  });

  const handleResetAllFilters = () => {
    resetFilters();
    resetDateFilter();
  };

  const onConfirmReject = async () => {
    if (!rejectionModalId) return;
    await handleReject(rejectionModalId, rejectionReason);
    setRejectionModalId(null);
    setRejectionReason('');
  };

  return (
    <div className="p-6 w-full mx-auto space-y-6">
      <ExpensePageHeader
        isFetching={isFetching}
        onRefresh={() => refetch()}
        onExportPdf={handleExpenseReportDownloadPDF}
        onExportCsv={handleDownloadCSV}
        onNewExpense={() => setShowFormModal(true)}
      />

      <ExpenseStatsCards stats={stats} />

      <ExpenseReportCenter
        recordCount={dateFilteredExpenses.length}
        datePreset={datePreset}
        onPresetChange={setDatePreset}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onStartDateChange={setCustomStartDate}
        onEndDateChange={setCustomEndDate}
        onClearCustomDates={clearCustomDates}
        onDownloadCSV={handleDownloadCSV}
        onDownloadPDF={handleExpenseReportDownloadPDF}
      />

      <ExpenseFiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        category={activeCategory}
        onCategoryChange={setActiveCategory}
        status={activeStatus}
        onStatusChange={setActiveStatus}
        onReset={handleResetAllFilters}
      />

      <ExpenseTable
        expenses={dateFilteredExpenses}
        isLoading={isLoading}
        isError={isError}
        error={error}
        isUpdatingStatus={isUpdatingStatus}
        onRefetch={() => refetch()}
        onOpenDetails={openDetails}
        onApprove={handleApprove}
        onRequestReject={setRejectionModalId}
        onMarkPaid={handleMarkAsPaid}
      />

      {showFormModal && (
        <CreateExpenseModal
          availableUsers={availableUsers}
          form={expenseForm}
          isSubmitting={isSubmitting}
          onSubmit={expenseForm.submitForm}
          onClose={expenseForm.closeForm}
        />
      )}

      {showDetailModal && selectedExpense && (
        <ExpenseDetailsModal
          expense={selectedExpense}
          onClose={closeDetails}
          onDownloadVoucher={handleDownloadSingleVoucherPDF}
        />
      )}

      {rejectionModalId && (
        <RejectExpenseModal
          reason={rejectionReason}
          onReasonChange={setRejectionReason}
          isUpdating={isUpdatingStatus}
          onCancel={() => {
            setRejectionModalId(null);
            setRejectionReason('');
          }}
          onConfirm={onConfirmReject}
        />
      )}
    </div>
  );
}

export default ExpensesPage;
