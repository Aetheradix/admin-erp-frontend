import {
  BookOpen,
  Building2,
  Calendar,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from 'antd';
import type { Office } from '@/store/api/attendanceSlice';
import { Button } from '@/components/ui/primitives/Button';
import type { CompanyInfoState } from '../types';

interface OverviewTabProps {
  companyInfo: CompanyInfoState;
  hqOffice?: Office;
  officesCount: number;
  totalEmployeesCount: number;
  policiesCount: number;
  documentsCount: number;
  isLoadingProfile: boolean;
  isLoadingUsers: boolean;
  onOpenEdit: () => void;
  onOpenHeadquarters: () => void;
}

export function OverviewTab({
  companyInfo,
  hqOffice,
  officesCount,
  totalEmployeesCount,
  policiesCount,
  documentsCount,
  isLoadingProfile,
  isLoadingUsers,
  onOpenEdit,
  onOpenHeadquarters,
}: OverviewTabProps) {
  const metrics = [
    {
      label: 'Workforce Strength',
      val: isLoadingUsers && totalEmployeesCount === 0 ? '...' : `${totalEmployeesCount}`,
      icon: Users,
    },
    {
      label: 'Active Branches',
      val: `${officesCount} Location${officesCount === 1 ? '' : 's'}`,
      icon: MapPin,
    },
    { label: 'Published Policies', val: `${policiesCount} Active`, icon: BookOpen },
    { label: 'Compliance Docs', val: `${documentsCount} Verified`, icon: Shield },
  ];

  const infoCards = [
    { icon: Calendar, label: 'Established', value: companyInfo.founded || 'Not specified' },
    {
      icon: Users,
      label: 'Headcount',
      value:
        isLoadingUsers && totalEmployeesCount === 0
          ? 'Loading...'
          : `${totalEmployeesCount} Employees`,
    },
    {
      icon: Globe,
      label: 'Official Portal',
      value: companyInfo.website || 'Not specified',
      isLink: Boolean(companyInfo.website),
    },
    { icon: Mail, label: 'Corporate Email', value: companyInfo.email || 'Not specified' },
    { icon: Phone, label: 'Direct Line', value: companyInfo.phone || 'Not specified' },
  ];

  return (
    <div className="flex flex-col gap-8">
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
                onClick={onOpenEdit}
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
                {companyInfo.values.map((value) => (
                  <span
                    key={value}
                    className="px-4 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider border border-primary/10">
                    {value}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-6 rounded-[24px] bg-white border border-border-subtle shadow-soft flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-surface-subtle flex items-center justify-center text-primary shrink-0">
              <metric.icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{metric.val}</p>
              <p className="text-xs text-muted font-bold">{metric.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onOpenHeadquarters}
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
                {Number(hqOffice.latitude).toFixed(4)}°, {Number(hqOffice.longitude).toFixed(4)}° •{' '}
                {hqOffice.radius}m zone
              </span>
            )}
          </div>
        </motion.div>

        {infoCards.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: (index + 1) * 0.05 }}
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
  );
}
