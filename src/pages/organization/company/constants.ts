import type {
  CapabilityPillar,
  CompanyDocument,
  CompanyInfoState,
  OrganizationTab,
  PolicyItem,
} from './types';

export const ORGANIZATION_TABS: OrganizationTab[] = [
  'Overview',
  'Organization Hierarchy',
  'What We Do',
  'Company Policies',
  'Document Vault',
  'Offices & Branches',
];

export const emptyCompanyInfo: CompanyInfoState = {
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

export const INITIAL_DOCUMENTS: CompanyDocument[] = [
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

export const INITIAL_POLICIES: PolicyItem[] = [
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

export const CATEGORY_BADGE_COLORS: Record<string, string> = {
  Certificate: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  Policy: 'bg-primary/10 text-primary border-primary/20',
  Legal: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  Tax: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  Handbook: 'bg-info/10 text-info border-info/20',
};

export const CAPABILITY_PILLARS: CapabilityPillar[] = [
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
];

export const DOCUMENT_CATEGORY_OPTIONS = [
  { label: 'Certificate', value: 'Certificate' },
  { label: 'Policy', value: 'Policy' },
  { label: 'Legal Agreement', value: 'Legal' },
  { label: 'Tax & Compliance', value: 'Tax' },
  { label: 'Handbook', value: 'Handbook' },
];

export const DOCUMENT_VISIBILITY_OPTIONS = [
  { label: 'Public (All Staff)', value: 'Public' },
  { label: 'Private (Admins & C-Suite)', value: 'Private' },
];

export const DOCUMENTS_STORAGE_KEY = 'erp_compliance_documents';
