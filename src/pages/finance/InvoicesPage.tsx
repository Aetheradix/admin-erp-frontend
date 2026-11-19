import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Table } from 'antd';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { exportInvoiceAuditLogs } from '@/utils/auditExport';

import InvoiceTemplate from './invoices/components/InvoiceTemplate';
import { InvoiceFormModal } from './invoices/components/InvoiceFormModal';
import { InvoiceViewModal } from './invoices/components/InvoiceViewModal';
import { InvoiceToolbar } from './invoices/components/InvoiceToolbar';
import { InvoiceAuditLogSection } from './invoices/components/InvoiceAuditLogSection';
import { ClearMonthLogsModal } from './invoices/components/ClearMonthLogsModal';
import { getInvoiceColumns } from './invoices/components/InvoiceColumns';
import { createEmptyForm, filterInvoices } from './invoices/form';
import { useInvoiceRecords } from './invoices/hooks/useInvoiceRecords';
import { useInvoiceAuditTrail } from './invoices/hooks/useInvoiceAuditTrail';
import { useInvoiceFormState } from './invoices/hooks/useInvoiceFormState';
import { useInvoiceSave } from './invoices/hooks/useInvoiceSave';
import { useInvoiceRowActions } from './invoices/hooks/useInvoiceRowActions';
import { useInvoiceDownload } from './invoices/hooks/useInvoiceDownload';

// Legacy helper exports kept for existing importers of this page module.
// eslint-disable-next-line react-refresh/only-export-components
export { generateNextInvoiceNumber, getInvoiceFormData } from './invoices/form';
export type { InvoiceAuditLog } from './invoices/types';

export function InvoicesPage() {
  const { user } = useAuth();
  const currentUserName = user?.username || 'Admin';

  const records = useInvoiceRecords();
  const audit = useInvoiceAuditTrail({
    username: currentUserName,
    userEmail: user?.email || '',
  });
  const formState = useInvoiceFormState(records.invoices);

  const { isSaving, isUploadingPdf, handleSubmit } = useInvoiceSave({
    invoices: records.invoices,
    setInvoices: records.setInvoices,
    form: formState.form,
    setForm: formState.setForm,
    editingInvoice: formState.editingInvoice,
    setEditingInvoice: formState.setEditingInvoice,
    setShowForm: formState.setShowForm,
    viewingInvoice: formState.viewingInvoice,
    setViewingInvoice: formState.setViewingInvoice,
    recordAuditLog: audit.recordAuditLog,
    refetchLogs: audit.refetchLogs,
    refetchBackendInvoices: records.refetchBackendInvoices,
    emptyFormForNextInvoice: () => createEmptyForm(records.invoices),
  });

  const { handleStatusChange, handleDeleteInvoice } = useInvoiceRowActions({
    setInvoices: records.setInvoices,
    viewingInvoice: formState.viewingInvoice,
    setViewingInvoice: formState.setViewingInvoice,
    setShowViewModal: formState.setShowViewModal,
    recordAuditLog: audit.recordAuditLog,
    refetchLogs: audit.refetchLogs,
    refetchBackendInvoices: records.refetchBackendInvoices,
  });

  const { invoicePdfRef, pdfInvoice, downloadInvoice } = useInvoiceDownload({
    recordAuditLog: audit.recordAuditLog,
  });

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredInvoices = useMemo(
    () => filterInvoices(records.invoices, searchText, statusFilter),
    [records.invoices, searchText, statusFilter]
  );

  const columns = getInvoiceColumns({
    onDownloadPdf: downloadInvoice,
    onViewInvoice: formState.handleViewInvoice,
    onEditInvoice: formState.handleEditInvoice,
    onStatusChange: handleStatusChange,
    onDeleteInvoice: handleDeleteInvoice,
  });

  const emptyForm = createEmptyForm(records.invoices);

  return (
    <div className="flex flex-col gap-6 pb-20 w-full mx-auto p-4 sm:p-6">
      <PageHeader
        title="Invoices"
        description="Manage and track client billing, view generated statements, and review audit logs."
        breadcrumbs={[
          { label: 'Home', url: '/' },
          { label: 'Finance', url: '/finance' },
          { label: 'Invoices' },
        ]}
      />

      <InvoiceToolbar
        searchText={searchText}
        onSearchChange={setSearchText}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onCreateNew={formState.handleCreateNew}
        isGenerating={isUploadingPdf}
      />

      <motion.div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <Table
          scroll={{ x: 'max-content' }}
          columns={columns}
          dataSource={filteredInvoices}
          loading={records.isBackendInvoicesLoading}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: 'No invoices found.' }}
        />
      </motion.div>

      <InvoiceAuditLogSection
        logs={audit.combinedAuditLogs}
        isLoading={audit.isLogsLoading}
        retentionCutoffLabel={audit.retentionCutoffLabel}
        onExportExcel={() => exportInvoiceAuditLogs(audit.combinedAuditLogs, 'excel')}
        onExportCsv={() => exportInvoiceAuditLogs(audit.combinedAuditLogs, 'csv')}
        onClearMonth={() => audit.setShowClearMonthModal(true)}
      />

      <InvoiceFormModal
        visible={formState.showForm}
        isEditing={Boolean(formState.editingInvoice)}
        onHide={() => {
          if (isSaving || isUploadingPdf) return;
          formState.setShowForm(false);
          formState.setEditingInvoice(null);
        }}
        form={formState.form}
        updateField={formState.updateField}
        updateItem={formState.updateItem}
        addItem={formState.addItem}
        removeItem={formState.removeItem}
        onSubmit={handleSubmit}
        emptyForm={emptyForm}
        setForm={formState.setForm}
        isSubmitting={isSaving || isUploadingPdf}
      />

      <InvoiceViewModal
        open={formState.showViewModal}
        invoice={formState.viewingInvoice}
        onClose={() => formState.setShowViewModal(false)}
        onEdit={formState.handleEditInvoice}
        onDownload={downloadInvoice}
      />

      <ClearMonthLogsModal
        open={audit.showClearMonthModal}
        onCancel={() => audit.setShowClearMonthModal(false)}
        onConfirm={audit.handleClearMonth}
        isClearing={audit.isClearingMonth}
        selectedMonth={audit.selectedClearMonth}
        selectedYear={audit.selectedClearYear}
        onMonthChange={audit.setSelectedClearMonth}
        onYearChange={audit.setSelectedClearYear}
      />

      <div
        id="invoice-pdf-hidden-container"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '794px',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -9999,
        }}>
        {pdfInvoice && <InvoiceTemplate ref={invoicePdfRef} invoice={pdfInvoice} />}
      </div>
    </div>
  );
}

export default InvoicesPage;
