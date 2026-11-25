import { useState } from 'react';
import { message } from 'antd';
import type { Office } from '@/store/api/attendanceSlice';
import {
  useGetCompanyProfileQuery,
  useUpdateCompanyProfileMutation,
} from '@/store/api/organizationApiSlice';
import { parsePhoneNumber, validatePhoneNumber } from '../../utils/countryCodes';
import { emptyCompanyInfo } from '../constants';
import type { CompanyInfoState } from '../types';

interface UseCompanyProfileParams {
  hqOffice?: Office;
  totalEmployeesCount: number;
}

interface ErrorPayload {
  data?: { message?: string };
  message?: string;
}

export function useCompanyProfile({ hqOffice, totalEmployeesCount }: UseCompanyProfileParams) {
  const { data: profileResponse, isLoading: isLoadingProfile } = useGetCompanyProfileQuery();
  const [updateCompanyProfile, { isLoading: isUpdatingProfile }] =
    useUpdateCompanyProfileMutation();

  const [companyInfo, setCompanyInfo] = useState<CompanyInfoState>(emptyCompanyInfo);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editForm, setEditForm] = useState<CompanyInfoState>(emptyCompanyInfo);
  const [phoneError, setPhoneError] = useState('');

  const [syncedSnapshot, setSyncedSnapshot] = useState({
    profile: profileResponse?.data,
    total: totalEmployeesCount,
    office: hqOffice,
  });

  // Keep the local profile in sync with the latest DB snapshot and HQ/headcount changes.
  if (
    profileResponse?.data !== syncedSnapshot.profile ||
    totalEmployeesCount !== syncedSnapshot.total ||
    hqOffice !== syncedSnapshot.office
  ) {
    setSyncedSnapshot({
      profile: profileResponse?.data,
      total: totalEmployeesCount,
      office: hqOffice,
    });

    const db = profileResponse?.data;
    if (db) {
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
  }

  const openEditModal = () => {
    const db = profileResponse?.data;
    const currentAddress = db?.address || hqOffice?.address || companyInfo.address || '';
    const parsedPhone = parsePhoneNumber(
      companyInfo.phone,
      companyInfo.phone_country_code,
      companyInfo.phone_number
    );
    const currentHqOfficeId = db?.hq_office_id ?? hqOffice?.id ?? companyInfo.hq_office_id ?? null;

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

  const closeEditModal = () => setShowEditProfileModal(false);

  const saveProfile = async () => {
    if (!editForm.name.trim()) {
      message.error('Please enter the company legal name.');
      return;
    }

    const phoneVal = validatePhoneNumber(
      editForm.phone_country_code || '+1',
      editForm.phone_number || ''
    );
    if (!phoneVal.valid && editForm.phone_number.trim()) {
      setPhoneError(phoneVal.message || 'Invalid phone number');
      message.error(phoneVal.message || 'Please check the phone number format');
      return;
    }

    const compositePhone =
      `${editForm.phone_country_code || '+1'} ${editForm.phone_number.trim()}`.trim();

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

      setCompanyInfo((prev) => ({ ...prev, ...editForm, phone: compositePhone }));
      setShowEditProfileModal(false);
      setPhoneError('');
      message.success('Company profile & Global HQ address successfully saved to database!');
    } catch (error) {
      console.error('Failed to update company profile:', error);
      const err = error as ErrorPayload;
      message.error(
        err?.data?.message || err?.message || 'Failed to save company information to database'
      );
    }
  };

  return {
    companyInfo,
    isLoadingProfile,
    isUpdatingProfile,
    showEditProfileModal,
    editForm,
    setEditForm,
    phoneError,
    setPhoneError,
    openEditModal,
    closeEditModal,
    saveProfile,
  };
}
