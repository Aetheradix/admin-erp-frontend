import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import {
  UserPlus,
  ChevronDown,
  Loader2,
  X,
  Mail,
  Briefcase,
  User,
  Building2,
  Calendar,
  Hash,
  Image,
} from 'lucide-react';
import { useCreateStaffMutation } from '@/store/api/userSlice';
import type {
  HierarchyNodeUser,
  DepartmentHierarchyItem,
} from '@/store/api/organizationApiSlice';

interface OrgAddEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  preselectedManagerId?: number | null;
  flatUsers: HierarchyNodeUser[];
  departments: DepartmentHierarchyItem[];
  onSuccess: (newUserId?: number) => void;
}

export const OrgAddEmployeeModal: React.FC<OrgAddEmployeeModalProps> = ({
  open,
  onClose,
  preselectedManagerId,
  flatUsers,
  departments,
  onSuccess,
}) => {
  const [createStaff, { isLoading }] = useCreateStaffMutation();

  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [team, setTeam] = useState<string>('');
  const [reportingManagerId, setReportingManagerId] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Available teams from departments list or flatUsers
  const availableTeams = React.useMemo(() => {
    const set = new Set<string>();
    departments.forEach((d) => {
      if (d.department_name) set.add(d.department_name);
    });
    flatUsers.forEach((u) => {
      if (u.department) set.add(u.department);
    });
    if (set.size === 0) {
      set.add('Executive');
      set.add('Engineering');
      set.add('Product');
      set.add('Design');
      set.add('Growth');
      set.add('People & Ops');
      set.add('Sales');
      set.add('Finance');
    }
    return Array.from(set);
  }, [departments, flatUsers]);

  useEffect(() => {
    if (open) {
      setFullName('');
      setJobTitle('');
      setEmail('');
      setPhotoUrl('');
      setEmployeeId(`EMP-${Math.floor(1000 + Math.random() * 9000)}`);
      setJoiningDate(new Date().toISOString().split('T')[0]);

      if (preselectedManagerId) {
        setReportingManagerId(preselectedManagerId);
        const mgr = flatUsers.find((u) => u.id === preselectedManagerId);
        if (mgr?.department) {
          setTeam(mgr.department);
        } else {
          setTeam(availableTeams[0] || 'Engineering');
        }
      } else {
        const rootUser = flatUsers[0];
        setReportingManagerId(rootUser?.id ?? null);
        setTeam(rootUser?.department || availableTeams[0] || 'Executive');
      }
    }
  }, [open, preselectedManagerId, flatUsers, availableTeams]);

  // Auto-suggest email based on name if user hasn't typed one
  const handleNameChange = (nameVal: string) => {
    setFullName(nameVal);
    const clean = nameVal.trim().toLowerCase().replace(/[^a-z0-9]/g, '.');
    if (clean) {
      setEmail(`${clean}@aetheradix.com`);
    } else {
      setEmail('');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      message.error('Please enter the employee full name');
      return;
    }
    if (!jobTitle.trim()) {
      message.error('Please enter the job title');
      return;
    }
    if (!team) {
      message.error('Please select a team / department');
      return;
    }

    const cleanName = fullName.trim();
    const finalEmail =
      email.trim() ||
      `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@aetheradix.com`;

    try {
      const res = await createStaff({
        name: cleanName,
        username: cleanName,
        email: finalEmail,
        designation: jobTitle.trim(),
        role: 'Staff',
        department: team,
        reporting_manager_id: reportingManagerId,
        employee_code: employeeId.trim() || undefined,
        join_date: joiningDate || undefined,
        image_url: photoUrl.trim() || undefined,
        status: 'Active',
      } as any).unwrap();

      message.success(`${cleanName} successfully added to the organization!`);
      onClose();

      const newId =
        (res as any)?.id ||
        (res as any)?.data?.id ||
        (res as any)?.user?.id;

      onSuccess(newId);
    } catch (err: any) {
      console.error('Failed to create employee:', err);
      message.error(err?.data?.message || err?.message || 'Failed to add employee');
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[540px] rounded-2xl bg-white border border-slate-200 shadow-2xl p-7 text-slate-800 font-sans relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e8583a]/10 text-[#e8583a] flex items-center justify-center">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Add New Employee
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Add a member to the organization chart and reporting hierarchy
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs text-slate-600 font-bold mb-1.5 flex items-center gap-1.5">
                <User size={13} className="text-[#e8583a]" />
                <span>Full Name <span className="text-red-500">*</span></span>
              </label>
              <input
                type="text"
                autoFocus
                required
                value={fullName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#e8583a] focus:ring-2 focus:ring-[#e8583a]/15 transition-all"
              />
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-xs text-slate-600 font-bold mb-1.5 flex items-center gap-1.5">
                <Briefcase size={13} className="text-[#e8583a]" />
                <span>Job Title <span className="text-red-500">*</span></span>
              </label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#e8583a] focus:ring-2 focus:ring-[#e8583a]/15 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Team / Department Dropdown */}
            <div>
              <label className="block text-xs text-slate-600 font-bold mb-1.5 flex items-center gap-1.5">
                <Building2 size={13} className="text-[#e8583a]" />
                <span>Team / Department <span className="text-red-500">*</span></span>
              </label>
              <div className="relative">
                <select
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  className="w-full h-10 px-3 pr-9 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#e8583a] focus:ring-2 focus:ring-[#e8583a]/15 transition-all appearance-none cursor-pointer"
                >
                  {availableTeams.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Reports to Dropdown */}
            <div>
              <label className="block text-xs text-slate-600 font-bold mb-1.5 flex items-center gap-1.5">
                <User size={13} className="text-[#e8583a]" />
                <span>Reports To (Manager)</span>
              </label>
              <div className="relative">
                <select
                  value={reportingManagerId ?? ''}
                  onChange={(e) =>
                    setReportingManagerId(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full h-10 px-3 pr-9 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#e8583a] focus:ring-2 focus:ring-[#e8583a]/15 transition-all appearance-none cursor-pointer"
                >
                  {flatUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username} ({u.designation || u.role})
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Work Email */}
            <div>
              <label className="block text-xs text-slate-600 font-bold mb-1.5 flex items-center gap-1.5">
                <Mail size={13} className="text-slate-400" />
                <span>Work Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.m@aetheradix.com"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#e8583a] focus:ring-2 focus:ring-[#e8583a]/15 transition-all"
              />
            </div>

            {/* Employee ID */}
            <div>
              <label className="block text-xs text-slate-600 font-bold mb-1.5 flex items-center gap-1.5">
                <Hash size={13} className="text-slate-400" />
                <span>Employee ID</span>
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="EMP-1049"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#e8583a] focus:ring-2 focus:ring-[#e8583a]/15 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Joining Date */}
            <div>
              <label className="block text-xs text-slate-600 font-bold mb-1.5 flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-400" />
                <span>Joining Date</span>
              </label>
              <input
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#e8583a] focus:ring-2 focus:ring-[#e8583a]/15 transition-all"
              />
            </div>

            {/* Profile Photo URL */}
            <div>
              <label className="block text-xs text-slate-600 font-bold mb-1.5 flex items-center gap-1.5">
                <Image size={13} className="text-slate-400" />
                <span>Profile Photo URL <span className="text-slate-400 font-normal">(Optional)</span></span>
              </label>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#e8583a] focus:ring-2 focus:ring-[#e8583a]/15 transition-all"
              />
            </div>
          </div>

          {/* Form Actions with StartupOS Primary Orange */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="h-10 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="h-10 px-6 rounded-xl bg-[#e8583a] hover:bg-[#d04a2e] text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50"
            >
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              <span>Add Employee</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
