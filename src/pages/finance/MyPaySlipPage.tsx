import { useState } from 'react';
import {
  FileText,
  Eye,
  Search,
  X,
  Loader2,
  AlertCircle,
  Download,
  ShieldCheck,
  User,
  UserCheck,
  ExternalLink,
  Calendar,
  Sparkles,
  Building2,
  Briefcase,
} from 'lucide-react';
import { useGetSalarySlipsQuery } from '@/store/api/uploadSlice';
import { useGetMyPermissionsQuery } from '@/store/api/permissionSlice';

// 1. Types matching your Salary Slips payload
export interface SalarySlip {
  id: number;
  user_id: number;
  username: string;
  salary_slip_url: string;
  created_by: number;
  created_by_username: string;
  created_at: string;
}

export interface SalarySlipApiResponse {
  success: boolean;
  data: SalarySlip[];
}

// 2. Types matching your User Permissions payload
export interface TeamScope {
  roleId: number;
  roleName: string;
  teamId: number | null;
  teamName: string | null;
}

export interface UserPermissionData {
  userId: number;
  username: string;
  email: string;
  department: string;
  status: string;
  roles: string[];
  isSuperadmin: boolean;
  permissions: string[];
  teamScopes: TeamScope[];
}

export interface PermissionApiResponse {
  success: boolean;
  message?: string;
  data: UserPermissionData;
}

export default function MyPaySlipPage() {
  const [search, setSearch] = useState('');
  const [selectedSlip, setSelectedSlip] = useState<SalarySlip | null>(null);

  // 1. Fetch authenticated user details & permissions
  const { data: permissionResponse, isLoading: isPermissionsLoading } =
    useGetMyPermissionsQuery();
  const userDetails = permissionResponse?.data;
  const userId = userDetails?.userId;

  // 2. Fetch salary slips for current user
  const {
    data: apiResponse,
    isLoading: isSlipsLoading,
    error: isError,
    refetch,
  } = useGetSalarySlipsQuery(userId!, {
    skip: !userId,
  });

  // Extract slips array safely
  const userPayslips: SalarySlip[] = (
    Array.isArray(apiResponse)
      ? apiResponse
      : (apiResponse as SalarySlipApiResponse)?.data ?? []
  ) as SalarySlip[];

  // Fallback username (safe against TS errors)
  const currentUsername =
    userPayslips[0]?.username || userDetails?.username || 'User';

  // Date Formatting Helpers
  const formatDate = (isoString: string) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatMonthYear = (isoString: string) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  // Search filter across username, creator username, slip ID, and issue date
  const filteredSlips = userPayslips.filter((slip) => {
    const query = search.toLowerCase();
    const formattedDate = formatDate(slip.created_at).toLowerCase();
    const monthYear = formatMonthYear(slip.created_at).toLowerCase();

    return (
      slip.username.toLowerCase().includes(query) ||
      slip.created_by_username.toLowerCase().includes(query) ||
      slip.id.toString().includes(query) ||
      formattedDate.includes(query) ||
      monthYear.includes(query)
    );
  });

  // Loading State
  if (isPermissionsLoading || (userId && isSlipsLoading)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-slate-500 gap-3">
        <Loader2 size={36} className="animate-spin text-slate-900" />
        <p className="text-sm font-medium text-slate-600">
          Loading user records & salary slips...
        </p>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shadow-sm">
          <AlertCircle size={28} />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900 text-lg">
            Unable to load salary slips
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Could not fetch salary documents for{' '}
            <strong className="text-slate-800">@{currentUsername}</strong>.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-5 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl hover:bg-slate-800 transition-all shadow-sm active:scale-95">
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Dynamic Profile Banner using User Permission Data */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-900 text-white flex items-center justify-center font-bold text-2xl shadow-md ring-4 ring-slate-100 shrink-0">
            {currentUsername.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">
                @{currentUsername}
              </h1>
              {userDetails?.isSuperadmin && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck size={12} /> Superadmin
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full capitalize">
                {userDetails?.status || 'Active'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
                <Building2 size={13} className="text-slate-400" />
                {userDetails?.department || 'Department N/A'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Briefcase size={13} className="text-slate-400" />
                {userDetails?.roles?.join(', ') || 'Employee'}
              </span>
              <span>•</span>
              <span className="font-mono text-slate-700">ID: #{userId}</span>
            </div>
          </div>
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-80">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by name, creator, date or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-slate-800 focus:bg-white transition-all shadow-inner"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Salary Slips Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Salary Statements
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                {filteredSlips.length} Record(s)
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Salary receipts generated for @{currentUsername}
            </p>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Slip ID</th>
                <th className="py-3.5 px-6">Pay Period</th>
                <th className="py-3.5 px-6">Created For</th>
                <th className="py-3.5 px-6">Created By</th>
                <th className="py-3.5 px-6">Issue Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSlips.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileText size={32} className="text-slate-300" />
                      <p className="text-sm font-medium text-slate-600">
                        No salary slips found matching "{search}".
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSlips.map((slip) => (
                  <tr
                    key={slip.id}
                    className="hover:bg-slate-50/80 transition-colors group">
                    {/* Slip ID */}
                    <td className="py-4 px-6 font-mono text-xs font-bold text-slate-900">
                      <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                        <Sparkles size={11} className="text-slate-400" /> #{slip.id}
                      </span>
                    </td>

                    {/* Pay Period */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Calendar size={15} className="text-slate-400" />
                        <span className="font-bold text-slate-900">
                          {formatMonthYear(slip.created_at)}
                        </span>
                      </div>
                    </td>

                    {/* Created For */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          <User size={13} />
                        </div>
                        <span className="font-semibold text-slate-800">
                          @{slip.username}
                        </span>
                      </div>
                    </td>

                    {/* Created By */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                          <UserCheck size={13} />
                        </div>
                        <span className="font-medium text-slate-700">
                          @{slip.created_by_username}
                        </span>
                      </div>
                    </td>

                    {/* Issue Date */}
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {formatDate(slip.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={slip.salary_slip_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition active:scale-95 shadow-sm">
                          <Download size={13} />
                          <span className="hidden sm:inline">Download</span>
                        </a>

                        <button
                          onClick={() => setSelectedSlip(slip)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold transition active:scale-95 shadow-sm">
                          <Eye size={13} />
                          <span>View PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF Modal */}
      {selectedSlip && (
        <PdfPreviewModal
          slip={selectedSlip}
          onClose={() => setSelectedSlip(null)}
        />
      )}
    </div>
  );
}

// Modal Component
function PdfPreviewModal({
  slip,
  onClose,
}: {
  slip: SalarySlip;
  onClose: () => void;
}) {
  const formattedMonth = new Date(slip.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-slate-700" />
              <span className="text-sm font-bold text-slate-900">
                Salary Statement ({formattedMonth})
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Created for @{slip.username} • Issued by @{slip.created_by_username}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={slip.salary_slip_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100 transition active:scale-95 shadow-sm">
              <ExternalLink size={14} /> Open Outer Link
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-200 text-slate-500 transition">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-slate-100 w-full h-full relative">
          <iframe
            src={slip.salary_slip_url}
            className="w-full h-full border-none"
            title={`Salary Slip #${slip.id}`}
          />
        </div>
      </div>
    </div>
  );
}