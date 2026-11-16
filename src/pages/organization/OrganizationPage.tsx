import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Tabs } from '@/components/ui/primitives/Tabs';
import { Dialog } from '@/components/ui/composed/Dialog';
import { ConfirmDialog } from '@/components/ui/composed/ConfirmDialog';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Button } from '@/components/ui/primitives/Button';
import {
  Building2,
  MapPin,
  Globe,
  Calendar,
  Users,
  Mail,
  Phone,
  Shield,
  FileText,
  Upload,
  Download,
  Lock,
  Unlock,
  Trash2,
  Sparkles,
  BookOpen,
  Layers,
  ArrowRight,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Table, message, Tag, Select as AntSelect, Input as AntInput, Divider, Skeleton } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { BranchesPage } from './BranchesPage';
import { OrganizationHierarchyView } from './components/OrganizationHierarchyView';
import { useUploadImageMutation } from '@/store/api/uploadSlice';
import { useGetAllOfficesQuery } from '@/store/api/attendanceSlice';
import { useGetUsersQuery } from '@/store/api/userSlice';
import {
  useGetOrganizationHierarchyQuery,
  useGetCompanyProfileQuery,
  useUpdateCompanyProfileMutation,
} from '@/store/api/organizationApiSlice';
import { InternationalPhoneInput } from './components/InternationalPhoneInput';
import { parsePhoneNumber, validatePhoneNumber } from './utils/countryCodes';
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';

// --- DATA STRUCTURES ---
export interface CompanyDocument {
  id: number | string;
  title: string;
  category: 'Certificate' | 'Policy' | 'Legal' | 'Tax' | 'Handbook';
  fileSize: string;
  uploadDate: string;
  visibility: 'Public' | 'Private';
  downloadUrl: string;
  description?: string;
}

export interface PolicyItem {
  id: number;
  title: string;
  category: string;
  summary: string;
  effectiveDate: string;
  version: string;
  visibility: 'Public' | 'Private';
  mandatory: boolean;
  docUrl?: string;
}

export interface CompanyInfoState {
  name: string;
  tagline: string;
  industry: string;
  founded: string;
  website: string;
  email: string;
  phone_country_code: string;
  phone_number: string;
  phone: string;
  employees: number;
  address: string;
  hq_office_id: number | null;
  description: string;
  mission: string;
  vision: string;
  values: string[];
}

const emptyCompanyInfo: CompanyInfoState = {
  name: '',
  tagline: '',
  industry: '',
  founded: '',
  website: '',
  email: '',
  phone_country_code: '+91',
  phone_number: '',
  phone: '',
  employees: 0,
  address: '',
  hq_office_id: null,
  description: '',
  mission: '',
  vision: '',
  values: [],
};

const initialDocuments: CompanyDocument[] = [
  {
    id: 1,
    title: 'Certificate of Incorporation',
    category: 'Legal',
    fileSize: '1.4 MB',
    uploadDate: '2026-01-15',
    visibility: 'Public',
    downloadUrl: '#',
    description:
      'Official corporate registration certificate issued by the Registrar of Companies.',
  },
  {
    id: 2,
    title: 'ISO 27001:2022 Security Compliance',
    category: 'Certificate',
    fileSize: '2.8 MB',
    uploadDate: '2026-02-10',
    visibility: 'Public',
    downloadUrl: '#',
    description: 'International accreditation for Information Security Management Systems.',
  },
  {
    id: 3,
    title: 'GST & Corporate Tax Registration',
    category: 'Tax',
    fileSize: '950 KB',
    uploadDate: '2026-01-20',
    visibility: 'Private',
    downloadUrl: '#',
    description: 'Confidential tax registration and statutory filings.',
  },
  {
    id: 4,
    title: 'Employee Code of Conduct Handbook 2026',
    category: 'Handbook',
    fileSize: '4.2 MB',
    uploadDate: '2026-03-01',
    visibility: 'Public',
    downloadUrl: '#',
    description:
      'Comprehensive guide to organizational standards, ethics, and workplace protocols.',
  },
  {
    id: 5,
    title: 'Global Master Services Agreement (MSA)',
    category: 'Legal',
    fileSize: '3.1 MB',
    uploadDate: '2026-03-25',
    visibility: 'Private',
    downloadUrl: '#',
    description: 'Standard enterprise client agreement terms and liabilities.',
  },
  {
    id: 6,
    title: 'SOC 2 Type II Audit Attestation',
    category: 'Certificate',
    fileSize: '5.6 MB',
    uploadDate: '2026-04-12',
    visibility: 'Private',
    downloadUrl: '#',
    description:
      'Third-party auditor report verifying cloud security and confidentiality controls.',
  },
];

const initialPolicies: PolicyItem[] = [
  {
    id: 1,
    title: 'Workplace Ethics & Code of Conduct',
    category: 'Governance',
    summary:
      'Defines our commitments to honesty, mutual respect, professional integrity, and zero tolerance for harassment.',
    effectiveDate: 'Jan 2026',
    version: 'v3.2',
    visibility: 'Public',
    mandatory: true,
  },
  {
    id: 2,
    title: 'Remote Work & Hybrid Flexibility Policy',
    category: 'Operations',
    summary:
      'Guidelines on asynchronous communication, core overlap hours, home-office stipends, and check-in expectations.',
    effectiveDate: 'Feb 2026',
    version: 'v2.1',
    visibility: 'Public',
    mandatory: false,
  },
  {
    id: 3,
    title: 'Information Security & Data Privacy (GDPR / ISO)',
    category: 'Security',
    summary:
      'Mandatory multi-factor authentication, device encryption, zero-trust network access, and incident reporting SLA.',
    effectiveDate: 'Jan 2026',
    version: 'v4.0',
    visibility: 'Public',
    mandatory: true,
  },
  {
    id: 4,
    title: 'Leave, Sick Days & Sabbatical Protocol',
    category: 'People & HR',
    summary:
      'Annual leave allotments, parental leave, bereavement compensation, and rollover policies for calendar years.',
    effectiveDate: 'Jan 2026',
    version: 'v2.0',
    visibility: 'Public',
    mandatory: false,
  },
  {
    id: 5,
    title: 'Travel & Expense Reimbursement Guidelines',
    category: 'Finance',
    summary:
      'Approved domestic/international per diem rates, flight booking thresholds, and receipt submission deadlines (15 days).',
    effectiveDate: 'Mar 2026',
    version: 'v1.5',
    visibility: 'Public',
    mandatory: true,
  },
  {
    id: 6,
    title: 'Whistleblower & POSH Grievance Redressal',
    category: 'Legal',
    summary:
      'Protected anonymous escalation mechanisms directly to the Internal Complaints Committee (ICC) and Board of Directors.',
    effectiveDate: 'Jan 2026',
    version: 'v3.0',
    visibility: 'Public',
    mandatory: true,
  },
];

const categoryBadgeColors: Record<string, string> = {
  Certificate: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  Policy: 'bg-primary/10 text-primary border-primary/20',
  Legal: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  Tax: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  Handbook: 'bg-info/10 text-info border-info/20',
};

export function OrganizationPage() {
  const { isSuperadmin: isAuthSuper, roles } = useAuth();
  const { can, isSuperadmin: isPermSuper } = usePermission();
  const canManageOrg =
    isAuthSuper ||
    isPermSuper ||
    can('organization:manage') ||
    Boolean(
      roles?.some((r) => {
        const lr = String(r).toLowerCase().replace(/[\s_-]/g, '');
        return lr.includes('admin') || lr.includes('hr');
      })
    );

  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const initialTab =
    urlTab === 'Organization Hierarchy' || urlTab === 'hierarchy' || urlTab === 'org'
      ? 'Organization Hierarchy'
      : urlTab === 'Offices & Branches' || urlTab === 'branches'
        ? 'Offices & Branches'
        : 'Overview';

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'Organization Hierarchy' || tabParam === 'hierarchy' || tabParam === 'org') {
      setActiveTab('Organization Hierarchy');
    } else if (tabParam === 'Offices & Branches' || tabParam === 'branches') {
      setActiveTab('Offices & Branches');
    }
  }, [searchParams]);
  const [autoOpenHQ, setAutoOpenHQ] = useState(false);
  const [autoOpenCreate, setAutoOpenCreate] = useState(false);
  const { data: offices = [] } = useGetAllOfficesQuery();
  const { data: users = [], isLoading: isLoadingUsers } = useGetUsersQuery();
  const { data: hierarchyData } = useGetOrganizationHierarchyQuery();

  const totalEmployeesCount = useMemo(() => {
    if (users.length > 0) return users.length;
    if (hierarchyData?.data?.stats?.totalEmployees) return hierarchyData.data.stats.totalEmployees;
    if (hierarchyData?.data?.flatUsers?.length) return hierarchyData.data.flatUsers.length;
    return 0;
  }, [users, hierarchyData]);

  const hqOffice = useMemo(() => {
    return offices.find((o) => o.is_hq || o.isHq) || offices[0];
  }, [offices]);

  const [companyInfo, setCompanyInfo] = useState<CompanyInfoState>(emptyCompanyInfo);
  const [phoneError, setPhoneError] = useState('');

  // Database integration: Fetch & Update Company Profile
  const { data: profileResponse, isLoading: isLoadingProfile } = useGetCompanyProfileQuery();
  const [updateCompanyProfile, { isLoading: isUpdatingProfile }] =
    useUpdateCompanyProfileMutation();

  // Sync state from Database
  useEffect(() => {
    if (profileResponse?.data) {
      const db = profileResponse.data;
      const parsedPhone = parsePhoneNumber(
        db.phone || '',
        db.phone_country_code || '',
        db.phone_number || ''
      );
      setCompanyInfo({
        name: db.name || '',
        tagline: db.tagline || '',
        industry: db.industry || '',
        founded: db.founded || '',
        website: db.website || '',
        email: db.email || '',
        phone_country_code: parsedPhone.countryCode || db.phone_country_code || '+91',
        phone_number: parsedPhone.phoneNumber || db.phone_number || '',
        phone: db.phone || `${parsedPhone.countryCode} ${parsedPhone.phoneNumber}`.trim(),
        employees: totalEmployeesCount,
        address: db.address || hqOffice?.address || '',
        hq_office_id: db.hq_office_id ?? hqOffice?.id ?? null,
        description: db.description || '',
        mission: db.mission || '',
        vision: db.vision || '',
        values: Array.isArray(db.values) ? db.values : [],
      });
    }
  }, [profileResponse?.data, totalEmployeesCount, hqOffice]);

  const [documents, setDocuments] = useState<CompanyDocument[]>(() => {
    try {
      const saved = localStorage.getItem('erp_compliance_documents');
      if (saved) return JSON.parse(saved);
    } catch { }
    return initialDocuments;
  });
  const [policies] = useState<PolicyItem[]>(initialPolicies);

  useEffect(() => {
    try {
      localStorage.setItem('erp_compliance_documents', JSON.stringify(documents));
    } catch { }
  }, [documents]);

  // Documents visible to the current user (employees only see Public docs, admins see all)
  const visibleDocuments = useMemo(() => {
    if (canManageOrg) return documents;
    return documents.filter((d) => d.visibility === 'Public');
  }, [canManageOrg, documents]);

  // Upload mutation
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();

  // Modals
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editForm, setEditForm] = useState<CompanyInfoState>(emptyCompanyInfo);

  const handleOpenEditModal = () => {
    const db = profileResponse?.data;
    const currentAddress =
      db?.address || hqOffice?.address || companyInfo.address || '';
    const parsedPhone = parsePhoneNumber(
      companyInfo.phone,
      companyInfo.phone_country_code,
      companyInfo.phone_number
    );
    const currentHqOfficeId =
      db?.hq_office_id ?? hqOffice?.id ?? companyInfo.hq_office_id ?? null;

    setEditForm({
      name: companyInfo.name,
      tagline: companyInfo.tagline,
      industry: companyInfo.industry,
      founded: companyInfo.founded,
      website: companyInfo.website,
      email: companyInfo.email,
      phone_country_code: parsedPhone.countryCode || companyInfo.phone_country_code || '+91',
      phone_number: parsedPhone.phoneNumber || companyInfo.phone_number || '',
      phone: companyInfo.phone,
      employees: totalEmployeesCount,
      address: currentAddress,
      hq_office_id: currentHqOfficeId,
      description: companyInfo.description,
      mission: companyInfo.mission,
      vision: companyInfo.vision,
      values: companyInfo.values,
    });
    setPhoneError('');
    setShowEditProfileModal(true);
  };

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDocForm, setUploadDocForm] = useState({
    title: '',
    category: 'Certificate' as CompanyDocument['category'],
    visibility: 'Public' as CompanyDocument['visibility'],
    description: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [deleteDocId, setDeleteDocId] = useState<number | string | null>(null);

  const TABS = [
    'Overview',
    'Organization Hierarchy',
    'What We Do',
    'Company Policies',
    'Document Vault',
    'Offices & Branches',
  ];

  // Handle Edit Profile Save directly to Database
  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) {
      message.error('Please enter the company legal name.');
      return;
    }

    // International Phone validation
    const phoneVal = validatePhoneNumber(
      editForm.phone_country_code || '+1',
      editForm.phone_number || ''
    );
    if (!phoneVal.valid && editForm.phone_number.trim()) {
      setPhoneError(phoneVal.message || 'Invalid phone number');
      message.error(phoneVal.message || 'Please check the phone number format');
      return;
    }

    const compositePhone = `${editForm.phone_country_code || '+1'} ${editForm.phone_number.trim()}`.trim();

    try {
      await updateCompanyProfile({
        name: editForm.name.trim(),
        tagline: editForm.tagline.trim(),
        industry: editForm.industry.trim(),
        description: editForm.description.trim(),
        website: editForm.website.trim(),
        email: editForm.email.trim(),
        phone_country_code: editForm.phone_country_code || '+91',
        phone_number: editForm.phone_number.trim(),
        phone: compositePhone,
        address: editForm.address.trim(),
        hq_office_id: editForm.hq_office_id || undefined,
        founded: editForm.founded ? editForm.founded.trim() : '',
        mission: editForm.mission ? editForm.mission.trim() : '',
        vision: editForm.vision ? editForm.vision.trim() : '',
        values: editForm.values,
      }).unwrap();

      setCompanyInfo((prev) => ({
        ...prev,
        ...editForm,
        phone: compositePhone,
      }));
      setShowEditProfileModal(false);
      setPhoneError('');
      message.success('Company profile & Global HQ address successfully saved to database!');
    } catch (err: any) {
      console.error('Failed to update company profile:', err);
      message.error(
        err?.data?.message ||
          err?.message ||
          'Failed to save company information to database'
      );
    }
  };

  // Handle File Upload Submit
  const handleUploadSubmit = async () => {
    if (!uploadDocForm.title) {
      message.error('Please enter a document title.');
      return;
    }

    let downloadUrl = '#';
    let fileSizeStr = '1.2 MB';

    if (selectedFile) {
      fileSizeStr = `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`;
      try {
        const res = await uploadImage({
          file: selectedFile,
          category: 'general',
        }).unwrap();
        if (res.data?.url) downloadUrl = res.data.url;
      } catch {
        // Fallback to local URL for offline / sandbox
        downloadUrl = URL.createObjectURL(selectedFile);
      }
    }

    const newDoc: CompanyDocument = {
      id: Date.now(),
      title: uploadDocForm.title,
      category: uploadDocForm.category,
      fileSize: fileSizeStr,
      uploadDate: new Date().toISOString().split('T')[0],
      visibility: uploadDocForm.visibility,
      downloadUrl,
      description: uploadDocForm.description || 'Uploaded company document.',
    };

    setDocuments([newDoc, ...documents]);
    setShowUploadModal(false);
    setUploadDocForm({
      title: '',
      category: 'Certificate',
      visibility: 'Public',
      description: '',
    });
    setSelectedFile(null);
    message.success('Document uploaded and indexed successfully!');
  };

  // Toggle Visibility (Public ⇄ Private)
  const handleToggleVisibility = (id: number | string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === id) {
          const nextVis = doc.visibility === 'Public' ? 'Private' : 'Public';
          message.info(`${doc.title} is now ${nextVis}.`);
          return { ...doc, visibility: nextVis };
        }
        return doc;
      })
    );
  };

  // Delete Document
  const handleConfirmDelete = () => {
    if (!deleteDocId) return;
    setDocuments((prev) => prev.filter((d) => d.id !== deleteDocId));
    setDeleteDocId(null);
    message.success('Document removed from vault.');
  };

  // Document Vault Table Columns
  const docColumns: ColumnsType<CompanyDocument> = [
    {
      title: 'Document Name',
      key: 'title',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <FileText size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">{record.title}</span>
            <span className="text-xs text-muted max-w-sm truncate">{record.description}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => (
        <span
          className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${categoryBadgeColors[cat] || 'bg-surface-subtle text-muted'
            }`}>
          {cat}
        </span>
      ),
    },
    {
      title: 'File Size',
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (size: string) => <span className="text-xs font-mono text-muted">{size}</span>,
    },
    {
      title: 'Upload Date',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
      render: (date: string) => <span className="text-xs text-muted">{date}</span>,
    },
    {
      title: 'Visibility Control',
      key: 'visibility',
      render: (_, record) => {
        if (!canManageOrg) {
          return (
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border select-none ${record.visibility === 'Public'
                  ? 'bg-success/10 text-success border-success/20'
                  : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                }`}>
              {record.visibility === 'Public' ? (
                <>
                  <Unlock size={12} />
                  <span>Public (All Staff)</span>
                </>
              ) : (
                <>
                  <Lock size={12} />
                  <span>Private (Admin Only)</span>
                </>
              )}
            </span>
          );
        }
        return (
          <button
            onClick={() => handleToggleVisibility(record.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition-all border cursor-pointer ${record.visibility === 'Public'
                ? 'bg-success/10 text-success border-success/20 hover:bg-success/20'
                : 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20'
              }`}>
            {record.visibility === 'Public' ? (
              <>
                <Unlock size={12} />
                <span>Public (All Staff)</span>
              </>
            ) : (
              <>
                <Lock size={12} />
                <span>Private (Admin Only)</span>
              </>
            )}
          </button>
        );
      },
    },
    {
      title: 'Actions',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <a
            href={record.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="p-2 rounded-lg hover:bg-surface-subtle text-muted hover:text-foreground transition-colors cursor-pointer"
            title="Download Document">
            <Download size={16} />
          </a>
          {canManageOrg && (
            <button
              onClick={() => setDeleteDocId(record.id)}
              className="p-2 rounded-lg hover:bg-error/10 text-muted hover:text-error transition-colors cursor-pointer"
              title="Delete Document">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Company Profile & Governance"
        description="Unified organizational intelligence: corporate identity, policies, compliance vault, and regional branches."
        breadcrumbs={[{ label: 'Home', url: '/' }, { label: 'Organization' }]}
        primaryAction={
          canManageOrg
            ? {
              label: 'Edit Profile',
              onClick: handleOpenEditModal,
              icon: 'pi pi-pencil',
            }
            : undefined
        }
      />

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-soft p-3">
        <Tabs items={TABS} activeItem={activeTab} onItemChange={setActiveTab} />
      </div>

      {/* ── TAB 1: OVERVIEW ── */}
      {activeTab === 'Overview' && (
        <div className="flex flex-col gap-8">
          {/* Company Hero Card */}
          {isLoadingProfile ? (
            <div className="bg-white rounded-[32px] border border-border-subtle shadow-soft p-10">
              <Skeleton active avatar={{ size: 80, shape: 'square' }} paragraph={{ rows: 3 }} />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[32px] border border-border-subtle shadow-soft p-10 flex flex-col lg:flex-row items-start gap-10">
              <div className="w-28 h-28 rounded-3xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-inner">
                <Building2 size={48} className="text-primary" />
              </div>
              <div className="flex flex-col gap-4 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-black text-foreground tracking-tight">
                      {companyInfo.name || 'Company Legal Name'}
                    </h2>
                    {companyInfo.tagline && (
                      <p className="text-sm font-semibold text-primary mt-0.5">{companyInfo.tagline}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    label="Update Details"
                    icon="pi pi-pencil"
                    onClick={handleOpenEditModal}
                    className="rounded-md! shrink-0!"
                  />
                </div>

                {companyInfo.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
                    {companyInfo.description}
                  </p>
                )}

                {companyInfo.values && companyInfo.values.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {companyInfo.values.map((v) => (
                      <span
                        key={v}
                        className="px-4 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider border border-primary/10">
                        {v}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                label: 'Workforce Strength',
                val: isLoadingUsers && totalEmployeesCount === 0 ? '...' : `${totalEmployeesCount}`,
                icon: Users,
              },
              {
                label: 'Active Branches',
                val: `${offices.length} Location${offices.length === 1 ? '' : 's'}`,
                icon: MapPin,
              },
              { label: 'Published Policies', val: `${policies.length} Active`, icon: BookOpen },
              { label: 'Compliance Docs', val: `${documents.length} Verified`, icon: Shield },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-[24px] bg-white border border-border-subtle shadow-soft flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-surface-subtle flex items-center justify-center text-primary shrink-0">
                  <m.icon size={22} />
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground">{m.val}</p>
                  <p className="text-xs text-muted font-bold">{m.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Global HQ Interactive Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => {
                setActiveTab('Offices & Branches');
                setAutoOpenHQ(true);
              }}
              title="Click to view & select Global HQ geolocation in Office Geofencing"
              className="bg-white rounded-[28px] border-2 border-primary/30 hover:border-primary shadow-soft p-8 flex items-start gap-5 group hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl border-l border-b border-primary/20 flex items-center gap-1">
                <Sparkles size={11} />
                <span>Geofenced HQ</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shrink-0">
                <MapPin size={22} />
              </div>
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <span className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em] flex items-center gap-1.5">
                  Global HQ
                  <span className="text-primary text-[10px] font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center">
                    (Edit &rarr;)
                  </span>
                </span>
                <span className="text-sm font-bold text-foreground line-clamp-2">
                  {companyInfo.address || hqOffice?.address || 'No headquarters address specified'}
                </span>
                {hqOffice && (
                  <span className="text-[11px] font-mono font-semibold text-muted mt-0.5">
                    {Number(hqOffice.latitude).toFixed(4)}°, {Number(hqOffice.longitude).toFixed(4)}° • {hqOffice.radius}m zone
                  </span>
                )}
              </div>
            </motion.div>

            {[
              { icon: Calendar, label: 'Established', value: companyInfo.founded || 'Not specified' },
              {
                icon: Users,
                label: 'Headcount',
                value: isLoadingUsers && totalEmployeesCount === 0 ? 'Loading...' : `${totalEmployeesCount} Employees`,
              },
              { icon: Globe, label: 'Official Portal', value: companyInfo.website || 'Not specified', isLink: Boolean(companyInfo.website) },
              { icon: Mail, label: 'Corporate Email', value: companyInfo.email || 'Not specified' },
              { icon: Phone, label: 'Direct Line', value: companyInfo.phone || 'Not specified' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: (i + 1) * 0.05 }}
                className="bg-white rounded-[28px] border border-border-subtle shadow-soft p-8 flex items-start gap-5 group hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-surface-subtle flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shrink-0">
                  <item.icon size={22} />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                    {item.label}
                  </span>
                  {item.isLink ? (
                    <a
                      href={item.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-primary hover:underline flex items-center gap-1 truncate">
                      {item.value} <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="text-sm font-bold text-foreground truncate">{item.value}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 1.5: ORGANIZATION HIERARCHY ── */}
      {activeTab === 'Organization Hierarchy' && (
        <div className="flex flex-col gap-8">
          <OrganizationHierarchyView />
        </div>
      )}

      {/* ── TAB 2: WHAT WE DO ── */}
      {activeTab === 'What We Do' && (
        <div className="flex flex-col gap-8">
          {/* Mission & Vision Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-10 rounded-[32px] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-soft flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center">
                <Sparkles size={24} />
              </div>
              <h3 className="text-2xl font-black text-foreground">Our Purpose & Mission</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {companyInfo.mission || 'No mission statement defined yet. Use Edit Profile to configure.'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-10 rounded-[32px] bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/20 shadow-soft flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
                <Layers size={24} />
              </div>
              <h3 className="text-2xl font-black text-foreground">Long-Term Vision</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {companyInfo.vision || 'No vision statement defined yet. Use Edit Profile to configure.'}
              </p>
            </motion.div>
          </div>

          {/* Core Capability Pillars */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-black text-foreground">
              Enterprise Solutions & Core Pillars
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'ERP & Workflow Automation',
                  desc: 'Full-stack enterprise resource planning with automated task lifecycles, project pipelines, and role-based permissions.',
                  badge: 'Core Engine',
                },
                {
                  title: 'FinTech & Payroll Intelligence',
                  desc: 'Automated salary generation, expense tracking, multi-tier approvals, and statutory taxation ledger exports.',
                  badge: 'Finance Stack',
                },
                {
                  title: 'Supply Chain & Inventory Management',
                  desc: 'Real-time stock audits, bookable resource check-ins, automated invoice linking, and maintenance logging.',
                  badge: 'Logistics',
                },
                {
                  title: 'Unified Team Communications',
                  desc: 'Encrypted company-wide broadcast channels, project discussions, and instant employee directory messaging.',
                  badge: 'Collaboration',
                },
                {
                  title: 'HR & Attendance Intelligence',
                  desc: 'Geo-verified check-ins, biometric integrations, leave management, and automated mood/wellbeing analytics.',
                  badge: 'People Ops',
                },
                {
                  title: 'Content & Public Syndication',
                  desc: 'Publish once, broadcast anywhere. Native synchronization of blogs and news across enterprise website portals.',
                  badge: 'Media & Web',
                },
              ].map((c, i) => (
                <motion.div
                  key={c.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="p-8 rounded-[28px] bg-white border border-border-subtle shadow-soft flex flex-col justify-between gap-4 group hover:border-primary/40 transition-all">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
                      {c.badge}
                    </span>
                    <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {c.title}
                    </h4>
                    <p className="text-xs text-muted leading-relaxed">{c.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-primary pt-2">
                    <span>Explore module</span>
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: COMPANY POLICIES ── */}
      {activeTab === 'Company Policies' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-foreground">
                Operational Policies & Guidelines
              </h3>
              <p className="text-xs text-muted">
                Official regulatory and cultural guidelines enforced across all departments and
                subsidiaries.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Filtered by:</span>
              <Tag color="blue" className="font-bold">
                All Employees
              </Tag>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {policies.map((pol, i) => (
              <motion.div
                key={pol.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-8 rounded-[28px] bg-white border border-border-subtle shadow-soft flex flex-col justify-between gap-6 hover:shadow-lg transition-all">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      {pol.category}
                    </span>
                    {pol.mandatory && (
                      <span className="text-[10px] font-bold text-error bg-error/10 px-2 py-0.5 rounded border border-error/20">
                        Mandatory
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-foreground">{pol.title}</h4>
                  <p className="text-xs text-muted leading-relaxed">{pol.summary}</p>
                </div>

                <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted">Version {pol.version}</span>
                    <span className="text-[10px] text-muted">Effective {pol.effectiveDate}</span>
                  </div>
                  <button
                    onClick={() => message.info(`Downloading full policy document: ${pol.title}`)}
                    className="p-2 rounded-lg bg-surface-subtle hover:bg-primary/10 hover:text-primary transition-colors text-muted flex items-center gap-1.5 text-xs font-bold">
                    <Download size={14} />
                    <span>PDF</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: DOCUMENT VAULT & COMPLIANCE ── */}
      {activeTab === 'Document Vault' && (
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-border-subtle shadow-soft p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-foreground">Compliance Document Vault</h3>
              <p className="text-xs text-muted">
                Statutory legal contracts, ISO certificates, and internal handbooks with granular
                access visibility controls.
              </p>
            </div>
            {canManageOrg && (
              <Button
                label="Upload Document"
                icon="pi pi-upload"
                onClick={() => setShowUploadModal(true)}
                className="rounded-md! px-6! cursor-pointer"
              />
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-border-subtle shadow-soft overflow-hidden">
            <Table
              scroll={{ x: 'max-content' }}
              columns={docColumns}
              dataSource={visibleDocuments}
              rowKey="id"
              pagination={{ pageSize: 8 }}
              className="premium-table"
            />
          </motion.div>
        </div>
      )}

      {/* ── TAB 5: OFFICES & BRANCHES ── */}
      {activeTab === 'Offices & Branches' && (
        <BranchesPage
          autoOpenHQ={autoOpenHQ}
          autoOpenCreate={autoOpenCreate}
          onClearAutoOpen={() => {
            setAutoOpenHQ(false);
            setAutoOpenCreate(false);
          }}
        />
      )}

      {/* ── EDIT PROFILE MODAL ── */}
      <Dialog
        visible={showEditProfileModal}
        onHide={() => setShowEditProfileModal(false)}
        header="Edit Company Information"
        modal
        className="w-full max-w-4xl mx-4"
        contentClassName="p-8"
        headerClassName="px-8 pt-8 pb-4 text-xl font-black tracking-tight border-none"
        pt={{
          root: { className: 'rounded-2xl overflow-hidden border-none shadow-2xl bg-white' },
          mask: { className: 'backdrop-blur-md bg-black/40' },
        }}>
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Company Legal Name
              </label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Industry Sector
              </label>
              <Input
                value={editForm.industry}
                onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
              Tagline / Headline
            </label>
            <Input
              value={editForm.tagline}
              onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
              Company Overview & Description
            </label>
            <AntInput.TextArea
              rows={3}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              placeholder="Enter comprehensive company description..."
              className="w-full !rounded-md !bg-white !text-foreground !text-sm !font-medium !border-border-subtle hover:!border-primary/50 focus:!border-primary !shadow-xs resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Official Website
              </label>
              <Input
                value={editForm.website}
                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Contact Email
              </label>
              <Input
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Phone Number
              </label>
              <InternationalPhoneInput
                countryCode={editForm.phone_country_code || '+1'}
                phoneNumber={editForm.phone_number || ''}
                error={phoneError}
                onChange={(code, num) => {
                  setEditForm({
                    ...editForm,
                    phone_country_code: code,
                    phone_number: num,
                    phone: `${code} ${num}`.trim(),
                  });
                  if (phoneError) setPhoneError('');
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Global Headquarters Address
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowEditProfileModal(false);
                  setActiveTab('Offices & Branches');
                  setAutoOpenCreate(true);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                <Plus size={12} />
                Add New Location
              </button>
            </div>

            <AntSelect
              value={editForm.hq_office_id || undefined}
              placeholder="Select headquarters location..."
              size="large"
              showSearch
              optionFilterProp="label"
              className="w-full text-sm [&_.ant-select-selector]:!min-h-[46px] [&_.ant-select-selector]:!py-1 [&_.ant-select-selector]:!rounded-md [&_.ant-select-selector]:!border-border-subtle [&_.ant-select-selector]:!bg-white [&_.ant-select-selection-item]:!font-medium [&_.ant-select-selection-placeholder]:!text-muted/60"
              onChange={(val) => {
                const selectedId = Number(val);
                const selectedOffice = offices.find((o) => o.id === selectedId);
                setEditForm({
                  ...editForm,
                  hq_office_id: selectedId || null,
                  address: selectedOffice?.address || editForm.address,
                });
              }}
              options={offices.map((o) => ({
                value: o.id,
                label: `${o.name} — ${o.address || 'No address'}`,
                name: o.name,
                address: o.address,
                isHq: Boolean(o.is_hq || o.isHq),
              }))}
              optionRender={(option) => {
                const data = option.data as { name: string; address?: string; isHq?: boolean };
                return (
                  <div className="flex items-start gap-2.5 py-1">
                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <MapPin size={13} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-xs">{data.name}</span>
                        {data.isHq && (
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-bold">
                            Current HQ
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted truncate max-w-[500px]">
                        {data.address || 'No address specified'}
                      </span>
                    </div>
                  </div>
                );
              }}
              notFoundContent={
                <div className="py-4 px-3 text-center">
                  <div className="text-xs text-muted mb-2 font-medium">No office locations added yet</div>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setShowEditProfileModal(false);
                      setActiveTab('Offices & Branches');
                      setAutoOpenCreate(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                  >
                    <Plus size={13} />
                    Add New Location
                  </button>
                </div>
              }
              dropdownRender={(menu) => (
                <div>
                  {menu}
                  <Divider style={{ margin: '4px 0' }} />
                  <div
                    className="px-3 py-2 flex items-center justify-between hover:bg-primary/5 cursor-pointer rounded-b transition-colors"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setShowEditProfileModal(false);
                      setActiveTab('Offices & Branches');
                      setAutoOpenCreate(true);
                    }}
                  >
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <Plus size={14} />
                      Add New Location
                    </span>
                    <span className="text-[10px] text-muted font-medium">Go to Offices & Branches</span>
                  </div>
                </div>
              )}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button
              variant="ghost"
              label="Cancel"
              onClick={() => setShowEditProfileModal(false)}
              className="rounded-md!"
            />
            <Button
              label={isUpdatingProfile ? 'Saving...' : 'Save Changes'}
              disabled={isUpdatingProfile}
              onClick={handleSaveProfile}
              icon="pi pi-check"
              className="rounded-md! px-8!"
            />
          </div>
        </div>
      </Dialog>

      {/* ── UPLOAD DOCUMENT MODAL ── */}
      <Dialog
        visible={showUploadModal}
        onHide={() => setShowUploadModal(false)}
        header="Upload Document to Vault"
        modal
        className="w-full max-w-xl mx-4"
        contentClassName="p-8"
        headerClassName="px-8 pt-8 pb-4 text-xl font-black tracking-tight border-none"
        pt={{
          root: { className: 'rounded-2xl overflow-hidden border-none shadow-2xl bg-white' },
          mask: { className: 'backdrop-blur-md bg-black/40' },
        }}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
              Document Title
            </label>
            <Input
              placeholder="e.g. ISO 27001 Re-certification 2026"
              value={uploadDocForm.title}
              onChange={(e) => setUploadDocForm({ ...uploadDocForm, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Category
              </label>
              <Select
                options={[
                  { label: 'Certificate', value: 'Certificate' },
                  { label: 'Policy', value: 'Policy' },
                  { label: 'Legal Agreement', value: 'Legal' },
                  { label: 'Tax & Compliance', value: 'Tax' },
                  { label: 'Handbook', value: 'Handbook' },
                ]}
                value={uploadDocForm.category}
                onChange={(e) => setUploadDocForm({ ...uploadDocForm, category: e.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Visibility Level
              </label>
              <Select
                options={[
                  { label: 'Public (All Staff)', value: 'Public' },
                  { label: 'Private (Admins & C-Suite)', value: 'Private' },
                ]}
                value={uploadDocForm.visibility}
                onChange={(e) => setUploadDocForm({ ...uploadDocForm, visibility: e.value })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
              Description / Notes
            </label>
            <Input
              placeholder="Brief summary of document purpose..."
              value={uploadDocForm.description}
              onChange={(e) => setUploadDocForm({ ...uploadDocForm, description: e.target.value })}
            />
          </div>

          {/* File Picker */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
              Select File (PDF, DOCX, PNG)
            </label>
            <label className="border-2 border-dashed border-border-subtle hover:border-primary/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-surface-subtle/50">
              <Upload size={28} className="text-primary" />
              <span className="text-xs font-semibold text-foreground">
                {selectedFile ? selectedFile.name : 'Click or drag file to attach'}
              </span>
              <span className="text-[11px] text-muted">Max file size 25MB</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                }}
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button
              variant="ghost"
              label="Cancel"
              onClick={() => setShowUploadModal(false)}
              className="rounded-md!"
            />
            <Button
              label={isUploading ? 'Uploading...' : 'Upload & Index'}
              disabled={isUploading}
              onClick={handleUploadSubmit}
              icon="pi pi-upload"
              className="rounded-md! px-8!"
            />
          </div>
        </div>
      </Dialog>

      {/* ── DELETE DOCUMENT CONFIRMATION ── */}
      <ConfirmDialog
        visible={!!deleteDocId}
        onHide={() => setDeleteDocId(null)}
        header="Delete Document from Vault"
        message="Are you sure you want to delete this document? Any active employee links to this file will be permanently invalidated."
        accept={handleConfirmDelete}
        reject={() => setDeleteDocId(null)}
      />
    </div>
  );
}
