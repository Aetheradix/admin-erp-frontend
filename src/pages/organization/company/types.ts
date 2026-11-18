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

export type OrganizationTab =
  | 'Overview'
  | 'Organization Hierarchy'
  | 'What We Do'
  | 'Company Policies'
  | 'Document Vault'
  | 'Offices & Branches';

export interface UploadDocumentForm {
  title: string;
  category: CompanyDocument['category'];
  visibility: CompanyDocument['visibility'];
  description: string;
}

export interface CapabilityPillar {
  title: string;
  desc: string;
  badge: string;
}
