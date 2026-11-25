import type { Office } from '@/store/api/attendanceSlice';
import type { CompanyProfileData } from '@/store/api/organizationApiSlice';
import type { ResolvedOffice } from '../types';
import { FALLBACKS } from '../constants';

export interface OfficeTargetUser {
  office_id?: number | string | null;
  officeId?: number | string | null;
  [key: string]: unknown;
}

function mapOffice(o: Office): ResolvedOffice {
  return {
    id: o.id,
    name: o.name,
    address: o.address || FALLBACKS.COMPANY_ADDRESS,
    timezone: o.timezone || FALLBACKS.DEFAULT_TIMEZONE,
    is_hq: o.is_hq,
    isHq: (o as { isHq?: boolean }).isHq,
    latitude: o.latitude ? Number(o.latitude) : undefined,
    longitude: o.longitude ? Number(o.longitude) : undefined,
    radius: o.radius ? Number(o.radius) : undefined,
  };
}

export function resolveOffice(
  targetUser: OfficeTargetUser | null | undefined,
  offices: Office[],
  companyProfile?: CompanyProfileData | null
): ResolvedOffice | null {
  const targetOfficeId = targetUser?.office_id ?? targetUser?.officeId;

  if (targetOfficeId && offices.length > 0) {
    const found = offices.find((o) => Number(o.id) === Number(targetOfficeId));
    if (found) return mapOffice(found);
  }

  const hqOffice = offices.find((o) => o.is_hq || (o as { isHq?: boolean }).isHq);
  if (hqOffice) return mapOffice(hqOffice);

  const activeOffice = offices.find((o) => o.is_active || (o as { isActive?: boolean }).isActive);
  if (activeOffice) return mapOffice(activeOffice);

  if (offices.length > 0) return mapOffice(offices[0]);

  if (companyProfile?.hq_office) {
    return {
      id: companyProfile.hq_office.id,
      name: companyProfile.hq_office.name || companyProfile.name || FALLBACKS.COMPANY_NAME,
      address:
        companyProfile.hq_office.address || companyProfile.address || FALLBACKS.COMPANY_ADDRESS,
      timezone: FALLBACKS.DEFAULT_TIMEZONE,
      is_hq: true,
      latitude: Number(companyProfile.hq_office.latitude) || FALLBACKS.HQ_LATITUDE,
      longitude: Number(companyProfile.hq_office.longitude) || FALLBACKS.HQ_LONGITUDE,
      radius: companyProfile.hq_office.radius || FALLBACKS.HQ_RADIUS,
    };
  }

  if (companyProfile?.address) {
    return {
      id: 1,
      name: companyProfile.name || FALLBACKS.COMPANY_NAME,
      address: companyProfile.address,
      timezone: FALLBACKS.DEFAULT_TIMEZONE,
      is_hq: true,
      latitude: FALLBACKS.HQ_LATITUDE,
      longitude: FALLBACKS.HQ_LONGITUDE,
      radius: FALLBACKS.HQ_RADIUS,
    };
  }

  return null;
}
