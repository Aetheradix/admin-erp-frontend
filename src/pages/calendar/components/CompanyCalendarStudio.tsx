import { useState, useMemo } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Checkbox,
  Button as AntButton,
  Popconfirm,
} from 'antd';
import dayjs from 'dayjs';
import {
  useGetCalendarsQuery,
  useCreateCalendarMutation,
  useAddHolidayMutation,
  useUpdateHolidayMutation,
  useDeleteHolidayMutation,
  useDeleteCalendarMutation,
  type CalendarHoliday,
} from '@/store/api/leaveSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { Button } from '@/components/ui/primitives/Button';
import {
  CalendarDays,
  Plus,
  Trash2,
  Edit2,
  MapPin,
  Search,
  Calendar as CalendarIcon,
} from 'lucide-react';

export function CompanyCalendarStudio({ isAdmin }: { isAdmin: boolean }) {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const { data: calendars = [], isLoading: isLoadingCals } = useGetCalendarsQuery({ year: selectedYear });

  const [activeCalId, setActiveCalId] = useState<number | null>(null);
  const activeCalendar = calendars.find((c) => c.id === activeCalId) || calendars[0] || null;

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Ant Design Form Instances
  const [createCalForm] = Form.useForm();
  const [addHolidayForm] = Form.useForm();
  const [editHolidayForm] = Form.useForm();

  // Modal States
  const [showNewCalModal, setShowNewCalModal] = useState(false);
  const [showNewHolidayModal, setShowNewHolidayModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<CalendarHoliday | null>(null);

  // Mutations
  const [createCalendar, { isLoading: isCreatingCal }] = useCreateCalendarMutation();
  const [deleteCalendar] = useDeleteCalendarMutation();
  const [addHoliday, { isLoading: isAddingHoliday }] = useAddHolidayMutation();
  const [updateHoliday, { isLoading: isUpdatingHoliday }] = useUpdateHolidayMutation();
  const [deleteHoliday] = useDeleteHolidayMutation();

  const handleCreateCalendar = async (values: {
    name: string;
    country_code: string;
    weekend_mask: number;
  }) => {
    try {
      await createCalendar({
        name: values.name.trim(),
        year: selectedYear,
        country_code: values.country_code.toUpperCase(),
        weekend_mask: values.weekend_mask,
      }).unwrap();
      showToast({ severity: 'success', summary: 'Success', detail: 'Calendar created successfully' });
      setShowNewCalModal(false);
      createCalForm.resetFields();
    } catch (err: any) {
      showToast({ severity: 'error', summary: 'Failed', detail: err?.data?.message || 'Failed to create calendar' });
    }
  };

  const handleAddHoliday = async (values: {
    name: string;
    holiday_date: dayjs.Dayjs;
    holiday_type: 'PUBLIC' | 'COMPANY' | 'RESTRICTED' | 'OPTIONAL';
    is_half_day?: boolean;
    description?: string;
  }) => {
    if (!activeCalendar) return;
    const dateStr = values.holiday_date ? dayjs(values.holiday_date).format('YYYY-MM-DD') : '';
    try {
      await addHoliday({
        calendarId: activeCalendar.id,
        name: values.name.trim(),
        holiday_date: dateStr,
        holiday_type: values.holiday_type,
        is_half_day: values.is_half_day ? 1 : 0,
        description: values.description?.trim() || null,
      }).unwrap();
      showToast({ severity: 'success', summary: 'Saved', detail: `Holiday "${values.name}" added successfully` });
      setShowNewHolidayModal(false);
      addHolidayForm.resetFields();
    } catch (err: any) {
      showToast({ severity: 'error', summary: 'Failed', detail: err?.data?.message || 'Failed to add holiday' });
    }
  };

  const openEditHoliday = (h: CalendarHoliday) => {
    setEditingHoliday(h);
    editHolidayForm.setFieldsValue({
      name: h.name,
      holiday_date: h.holiday_date ? dayjs(h.holiday_date.split('T')[0]) : null,
      holiday_type: h.holiday_type,
      is_half_day: Boolean(h.is_half_day),
      description: h.description || '',
    });
  };

  const handleUpdateHoliday = async (values: {
    name: string;
    holiday_date: dayjs.Dayjs;
    holiday_type: 'PUBLIC' | 'COMPANY' | 'RESTRICTED' | 'OPTIONAL';
    is_half_day?: boolean;
    description?: string;
  }) => {
    if (!editingHoliday) return;
    const dateStr = values.holiday_date ? dayjs(values.holiday_date).format('YYYY-MM-DD') : '';
    try {
      await updateHoliday({
        holidayId: editingHoliday.id,
        name: values.name.trim(),
        holiday_date: dateStr,
        holiday_type: values.holiday_type,
        is_half_day: values.is_half_day ? 1 : 0,
        description: values.description?.trim() || null,
      }).unwrap();
      showToast({ severity: 'success', summary: 'Updated', detail: `Holiday "${values.name}" updated successfully` });
      setEditingHoliday(null);
    } catch (err: any) {
      showToast({ severity: 'error', summary: 'Failed', detail: err?.data?.message || 'Failed to update holiday' });
    }
  };

  const handleDeleteHoliday = async (holidayId: number, holidayName: string) => {
    try {
      await deleteHoliday(holidayId).unwrap();
      showToast({ severity: 'info', summary: 'Removed', detail: `Holiday "${holidayName}" removed from calendar` });
    } catch (err: any) {
      showToast({ severity: 'error', summary: 'Failed', detail: err?.data?.message || 'Could not delete holiday' });
    }
  };

  const handleDeleteCalendar = async (id: number, calName: string) => {
    try {
      await deleteCalendar(id).unwrap();
      showToast({ severity: 'info', summary: 'Deleted', detail: `Calendar "${calName}" deleted` });
      setActiveCalId(null);
    } catch (err: any) {
      showToast({ severity: 'error', summary: 'Failed', detail: err?.data?.message || 'Failed to delete calendar' });
    }
  };

  // Filtered Holidays
  const filteredHolidays = useMemo(() => {
    if (!activeCalendar?.holidays) return [];
    return activeCalendar.holidays.filter((h) => {
      const matchesSearch =
        searchQuery === '' ||
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (h.description && h.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = filterType === 'ALL' || h.holiday_type === filterType;
      return matchesSearch && matchesType;
    });
  }, [activeCalendar?.holidays, searchQuery, filterType]);

  const formatHolidayDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('T')[0].split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top action strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-surface border border-border-subtle shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <CalendarDays size={24} />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground tracking-tight">
              Yearly Organization Calendars ({selectedYear})
            </h3>
            <p className="text-xs text-muted">
              Configure multi-region working calendars, public holidays, and weekend policies.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3.5 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs font-bold text-foreground">
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>

          {isAdmin && (
            <Button
              onClick={() => {
                createCalForm.resetFields();
                setShowNewCalModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-black shadow-md shadow-primary/20 hover:bg-primary-hover">
              <Plus size={16} />
              <span>New Calendar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Calendar Switcher Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {calendars.map((c) => {
          const isActive = activeCalendar?.id === c.id;
          const totalHolidays = c.holidays?.length ?? c.holiday_count ?? 0;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCalId(c.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-foreground text-background shadow-md'
                  : 'bg-surface border border-border-subtle text-muted hover:text-foreground hover:bg-surface-elevated'
              }`}>
              <MapPin size={13} className={isActive ? 'text-primary' : 'text-muted'} />
              <span>{c.name}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  isActive
                    ? 'bg-background/20 text-background'
                    : 'bg-surface-elevated text-muted'
                }`}>
                {totalHolidays} holidays
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Calendar Details & Holiday Table */}
      {activeCalendar ? (
        <div className="flex flex-col gap-6 p-6 rounded-3xl bg-surface border border-border-subtle shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-black text-foreground">{activeCalendar.name}</h4>
                {Boolean(activeCalendar.is_default) && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider">
                    Default Master
                  </span>
                )}
              </div>
              <p className="text-xs text-muted mt-1 flex items-center gap-3">
                <span>Country: <strong className="text-foreground">{activeCalendar.country_code}</strong></span>
                <span>•</span>
                <span>Weekend: <strong className="text-foreground">{activeCalendar.weekend_mask === 65 ? 'Sat + Sun Off' : 'Custom'}</strong></span>
                <span>•</span>
                <span>Total Holidays: <strong className="text-foreground">{activeCalendar.holidays?.length || 0}</strong></span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <>
                  <Button
                    onClick={() => {
                      addHolidayForm.resetFields();
                      setShowNewHolidayModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-black shadow-md shadow-primary/20 hover:bg-primary-hover">
                    <Plus size={14} /> Add Holiday
                  </Button>
                  {calendars.length > 1 && (
                    <Popconfirm
                      title="Delete Organization Calendar"
                      description={`Are you sure you want to delete "${activeCalendar.name}" and all its holidays?`}
                      onConfirm={() => handleDeleteCalendar(activeCalendar.id, activeCalendar.name)}
                      okText="Yes, Delete"
                      cancelText="Cancel"
                      okButtonProps={{ danger: true }}>
                      <Button
                        variant="ghost"
                        className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl"
                        title="Delete Calendar">
                        <Trash2 size={16} />
                      </Button>
                    </Popconfirm>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Search & Category Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search holidays by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-foreground placeholder:text-muted/60"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              {['ALL', 'PUBLIC', 'COMPANY', 'OPTIONAL', 'RESTRICTED'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterType(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    filterType === cat
                      ? 'bg-foreground text-background shadow-xs'
                      : 'bg-surface-elevated border border-border-subtle text-muted hover:text-foreground'
                  }`}>
                  {cat === 'ALL' ? 'All Types' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Holidays Listing */}
          <div className="overflow-x-auto rounded-2xl border border-border-subtle/70">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-subtle/50 text-muted uppercase tracking-wider text-[10px] font-extrabold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Holiday Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Duration</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle bg-white">
                {filteredHolidays.map((h: CalendarHoliday) => {
                  const formattedDate = formatHolidayDate(h.holiday_date);
                  const isFuture = new Date(h.holiday_date.split('T')[0]) >= new Date(new Date().toDateString());

                  return (
                    <tr key={h.id} className="hover:bg-surface-elevated/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-foreground whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <CalendarIcon size={14} className={isFuture ? 'text-primary' : 'text-muted/60'} />
                          <span>{formattedDate}</span>
                          {isFuture && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Upcoming" />
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-black text-foreground">
                        <div className="flex flex-col">
                          <span>{h.name}</span>
                          {h.description && (
                            <p className="text-[11px] font-normal text-muted mt-0.5">{h.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            h.holiday_type === 'PUBLIC'
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : h.holiday_type === 'COMPANY'
                              ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          }`}>
                          {h.holiday_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-muted font-medium">
                        {h.is_half_day ? (
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[10px]">
                            Half-Day (0.5)
                          </span>
                        ) : (
                          'Full Day Off'
                        )}
                      </td>
                      {isAdmin && (
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditHoliday(h)}
                              className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                              title="Edit Holiday">
                              <Edit2 size={14} />
                            </button>

                            <Popconfirm
                              title="Delete Holiday"
                              description={`Are you sure you want to remove the holiday "${h.name}"?`}
                              onConfirm={() => handleDeleteHoliday(h.id, h.name)}
                              okText="Yes, Delete"
                              cancelText="Cancel"
                              okButtonProps={{ danger: true }}>
                              <button
                                type="button"
                                className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Remove Holiday">
                                <Trash2 size={14} />
                              </button>
                            </Popconfirm>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredHolidays.length === 0 && (
              <div className="py-12 text-center text-muted">
                <CalendarDays size={28} className="mx-auto mb-2 text-muted/50" />
                <p className="text-xs font-bold text-foreground">
                  {searchQuery || filterType !== 'ALL'
                    ? 'No holidays match your search filter.'
                    : 'No holidays defined for this calendar yet.'}
                </p>
                {isAdmin && !searchQuery && filterType === 'ALL' && (
                  <button
                    type="button"
                    onClick={() => {
                      addHolidayForm.resetFields();
                      setShowNewHolidayModal(true);
                    }}
                    className="mt-2 text-xs font-black text-primary hover:underline cursor-pointer">
                    + Add the first holiday
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-muted rounded-3xl bg-surface border border-border-subtle">
          <p className="text-sm font-bold">
            {isLoadingCals ? 'Loading organization calendars...' : `No calendar available for ${selectedYear}`}
          </p>
        </div>
      )}

      {/* Modal: Create Calendar (Ant Design Form) */}
      <Modal
        open={showNewCalModal}
        onCancel={() => setShowNewCalModal(false)}
        title={<span className="text-base font-black text-foreground">Register New Calendar ({selectedYear})</span>}
        footer={null}
        centered
        destroyOnClose>
        <Form
          form={createCalForm}
          layout="vertical"
          className="mt-4"
          initialValues={{
            country_code: 'IND',
            weekend_mask: 65,
          }}
          onFinish={handleCreateCalendar}>
          <Form.Item
            label={<span className="text-xs font-bold text-foreground">Calendar Name</span>}
            name="name"
            rules={[{ required: true, message: 'Please enter calendar name' }]}>
            <Input placeholder="e.g. India - Bangalore Hub 2026" className="rounded-xl py-2" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label={<span className="text-xs font-bold text-foreground">Country Code</span>}
              name="country_code"
              rules={[{ required: true, message: 'Country code is required' }]}>
              <Input maxLength={3} className="rounded-xl py-2" />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-bold text-foreground">Weekend Policy</span>}
              name="weekend_mask">
              <Select
                className="w-full"
                options={[
                  { label: 'Sat + Sun (5-Day Week)', value: 65 },
                  { label: 'Sunday Only (6-Day Week)', value: 1 },
                  { label: 'No Weekly Offs (Rotational)', value: 0 },
                ]}
              />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-2.5 mt-5 pt-3 border-t border-border-subtle">
            <AntButton onClick={() => setShowNewCalModal(false)} className="rounded-xl">
              Cancel
            </AntButton>
            <AntButton
              type="primary"
              htmlType="submit"
              loading={isCreatingCal}
              className="rounded-xl bg-primary">
              Create Calendar
            </AntButton>
          </div>
        </Form>
      </Modal>

      {/* Modal: Add Holiday (Ant Design Form) */}
      <Modal
        open={showNewHolidayModal}
        onCancel={() => setShowNewHolidayModal(false)}
        title={
          <span className="text-base font-black text-foreground">
            Add Holiday to {activeCalendar?.name}
          </span>
        }
        footer={null}
        centered
        destroyOnClose>
        <Form
          form={addHolidayForm}
          layout="vertical"
          className="mt-4"
          initialValues={{
            holiday_type: 'PUBLIC',
            is_half_day: false,
          }}
          onFinish={handleAddHoliday}>
          <Form.Item
            label={<span className="text-xs font-bold text-foreground">Holiday Name</span>}
            name="name"
            rules={[{ required: true, message: 'Please enter holiday name' }]}>
            <Input placeholder="e.g. Independence Day" className="rounded-xl py-2" />
          </Form.Item>

          <Form.Item
            label={<span className="text-xs font-bold text-foreground">Date</span>}
            name="holiday_date"
            rules={[{ required: true, message: 'Please select holiday date' }]}>
            <DatePicker className="w-full rounded-xl py-2" format="YYYY-MM-DD" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label={<span className="text-xs font-bold text-foreground">Category</span>}
              name="holiday_type">
              <Select
                className="w-full"
                options={[
                  { label: 'Public / Gazetted', value: 'PUBLIC' },
                  { label: 'Company Specific', value: 'COMPANY' },
                  { label: 'Restricted', value: 'RESTRICTED' },
                  { label: 'Optional / Floating', value: 'OPTIONAL' },
                ]}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-bold text-foreground">Duration</span>}
              name="is_half_day"
              valuePropName="checked">
              <Checkbox className="mt-2 text-xs font-bold">Half-Day Holiday</Checkbox>
            </Form.Item>
          </div>

          <Form.Item
            label={<span className="text-xs font-bold text-foreground">Description / Notes (Optional)</span>}
            name="description">
            <Input.TextArea
              rows={3}
              placeholder="e.g. National holiday celebrating sovereignty"
              className="rounded-xl"
            />
          </Form.Item>

          <div className="flex justify-end gap-2.5 mt-5 pt-3 border-t border-border-subtle">
            <AntButton onClick={() => setShowNewHolidayModal(false)} className="rounded-xl">
              Cancel
            </AntButton>
            <AntButton
              type="primary"
              htmlType="submit"
              loading={isAddingHoliday}
              className="rounded-xl bg-primary">
              Save Holiday
            </AntButton>
          </div>
        </Form>
      </Modal>

      {/* Modal: Edit Holiday (Ant Design Form) */}
      <Modal
        open={Boolean(editingHoliday)}
        onCancel={() => setEditingHoliday(null)}
        title={
          <span className="text-base font-black text-foreground">
            Edit Holiday: {editingHoliday?.name}
          </span>
        }
        footer={null}
        centered
        destroyOnClose>
        <Form
          form={editHolidayForm}
          layout="vertical"
          className="mt-4"
          onFinish={handleUpdateHoliday}>
          <Form.Item
            label={<span className="text-xs font-bold text-foreground">Holiday Name</span>}
            name="name"
            rules={[{ required: true, message: 'Please enter holiday name' }]}>
            <Input className="rounded-xl py-2" />
          </Form.Item>

          <Form.Item
            label={<span className="text-xs font-bold text-foreground">Date</span>}
            name="holiday_date"
            rules={[{ required: true, message: 'Please select holiday date' }]}>
            <DatePicker className="w-full rounded-xl py-2" format="YYYY-MM-DD" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label={<span className="text-xs font-bold text-foreground">Category</span>}
              name="holiday_type">
              <Select
                className="w-full"
                options={[
                  { label: 'Public / Gazetted', value: 'PUBLIC' },
                  { label: 'Company Specific', value: 'COMPANY' },
                  { label: 'Restricted', value: 'RESTRICTED' },
                  { label: 'Optional / Floating', value: 'OPTIONAL' },
                ]}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-bold text-foreground">Duration</span>}
              name="is_half_day"
              valuePropName="checked">
              <Checkbox className="mt-2 text-xs font-bold">Half-Day Holiday</Checkbox>
            </Form.Item>
          </div>

          <Form.Item
            label={<span className="text-xs font-bold text-foreground">Description / Notes (Optional)</span>}
            name="description">
            <Input.TextArea rows={3} className="rounded-xl" />
          </Form.Item>

          <div className="flex justify-end gap-2.5 mt-5 pt-3 border-t border-border-subtle">
            <AntButton onClick={() => setEditingHoliday(null)} className="rounded-xl">
              Cancel
            </AntButton>
            <AntButton
              type="primary"
              htmlType="submit"
              loading={isUpdatingHoliday}
              className="rounded-xl bg-primary">
              Update Holiday
            </AntButton>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
