import { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Building,
  Globe,
  Edit3,
  Clock,
  Calendar,
  BadgeCheck,
  CreditCard,
  Shield,
  GraduationCap,
  Briefcase,
  Award,
  CheckCircle2,
  ChevronRight,
  User,
  HeartHandshake,
  Hash,
  Landmark,
  FileText,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/primitives/Button';
import type { ProfileUserData } from '../hooks/useProfile';
import type { ProfileCompletionData } from '@/services/employeeProfileService';

interface ProfileInfoTabProps {
  user: ProfileUserData;
  empProfile?: ProfileCompletionData | null;
  isEditing: boolean;
  onStartEdit: () => void;
  onElevationClick: () => void;
}

export const ProfileInfoTab = ({
  user,
  empProfile,
  isEditing,
  onStartEdit,
  onElevationClick,
}: ProfileInfoTabProps) => {
  const [showMoreContact, setShowMoreContact] = useState(false);
  const [showAccountNum, setShowAccountNum] = useState(false);
  const [showAadhaar, setShowAadhaar] = useState(false);

  const personal = empProfile?.personal;
  const bank = empProfile?.bank;
  const identity = empProfile?.identity;
  const education = empProfile?.education || [];
  const employment = empProfile?.employment || [];
  const certifications = empProfile?.certifications || [];

  const effectiveAddress =
    personal?.currentAddress || user.address || personal?.permanentAddress || 'Not specified';

  const effectivePermanentAddress =
    personal?.permanentAddress || personal?.currentAddress || user.address || 'Not specified';

  const maskString = (val?: string, visibleChars = 4) => {
    if (!val) return 'Not specified';
    const clean = val.replace(/\s+/g, '');
    if (clean.length <= visibleChars) return clean;
    const masked = '•'.repeat(Math.max(0, clean.length - visibleChars));
    return `${masked} ${clean.slice(-visibleChars)}`;
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* ── 1. Contact Information Matrix ── */}
      <div className="bg-surface-subtle/50 p-6 sm:p-8 rounded-3xl border border-border-subtle flex flex-col gap-6 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
            <Mail size={16} className="text-primary" /> Contact & Identification
          </h3>
          <div className="flex items-center gap-3">
            <Link
              to="/profile-completion"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              <span>Update via Form</span>
              <ChevronRight size={12} />
            </Link>
            {!isEditing && (
              <button
                onClick={onStartEdit}
                className="text-xs font-bold text-muted hover:text-foreground flex items-center gap-1 cursor-pointer transition-colors">
                <Edit3 size={12} /> Edit
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Employee Code */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider">
              Employee Code
            </span>
            <div className="text-xs font-bold text-foreground flex items-center gap-2 font-mono">
              <BadgeCheck size={14} className="text-primary" />
              {user.employeeCode || user.employeeId || 'Not specified'}
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider">
              Email Address
            </span>
            <a
              href={`mailto:${user.email}`}
              className="text-xs font-bold text-foreground hover:text-primary transition-colors flex items-center gap-2 truncate">
              <Mail size={14} className="text-muted shrink-0" />
              <span className="truncate">{user.email || 'Not specified'}</span>
            </a>
          </div>

          {/* Contact No */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider">
              Primary Phone
            </span>
            <a
              href={`tel:${user.contactNo || personal?.contactNumber}`}
              className="text-xs font-bold text-foreground hover:text-primary transition-colors flex items-center gap-2">
              <Phone size={14} className="text-muted shrink-0" />
              <span>{user.contactNo || personal?.contactNumber || 'Not specified'}</span>
            </a>
          </div>

          {/* Alternate Contact */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider">
              Alternate Contact
            </span>
            <div className="text-xs font-bold text-foreground flex items-center gap-2">
              <Phone size={14} className="text-muted shrink-0" />
              <span>{personal?.alternateContact || 'Not specified'}</span>
            </div>
          </div>

          {/* Work Location */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider">
              Work Location / Base
            </span>
            <div className="text-xs font-bold text-foreground flex items-center gap-2">
              <MapPin size={14} className="text-muted shrink-0" />
              <span>{user.workLocation || user.department || 'Main Campus'}</span>
            </div>
          </div>

          {/* Current Address */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider">
              Residential / Current Address
            </span>
            <div className="text-xs font-bold text-foreground flex items-center gap-2">
              <MapPin size={14} className="text-muted shrink-0" />
              <span className="line-clamp-2">{effectiveAddress}</span>
            </div>
          </div>

          {/* Permanent Address */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider">
              Permanent Address
            </span>
            <div className="text-xs font-bold text-foreground flex items-center gap-2">
              <Building size={14} className="text-muted shrink-0" />
              <span className="line-clamp-2">{effectivePermanentAddress}</span>
            </div>
          </div>
        </div>

        {/* Emergency Contact Sub-section */}
        {(personal?.emergencyContactName || personal?.emergencyContactPhone) && (
          <div className="mt-2 pt-4 border-t border-border-subtle bg-surface-elevated/40 p-4 rounded-2xl">
            <div className="text-[11px] font-black text-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
              <HeartHandshake size={14} className="text-error" />
              Emergency Contact Matrix
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-muted block font-semibold">Contact Person</span>
                <span className="font-bold text-foreground">{personal.emergencyContactName}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted block font-semibold">Relationship</span>
                <span className="font-bold text-foreground">
                  {personal.emergencyContactRelation || 'Relative'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted block font-semibold">Emergency Phone</span>
                <a
                  href={`tel:${personal.emergencyContactPhone}`}
                  className="font-bold text-primary hover:underline flex items-center gap-1.5">
                  <Phone size={12} />
                  {personal.emergencyContactPhone}
                </a>
              </div>
            </div>
          </div>
        )}

        {showMoreContact && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-border-subtle animate-in fade-in duration-200">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider">
                Country
              </span>
              <div className="text-xs font-bold text-foreground flex items-center gap-2">
                <Globe size={14} className="text-muted" />
                {user.country || personal?.nationality || 'India'}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider">
                Sub Organization / Unit
              </span>
              <div className="text-xs font-bold text-foreground">
                {user.subOrganization || user.department || 'Operations'}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider">
                Joined Date
              </span>
              <div className="text-xs font-bold text-foreground flex items-center gap-2">
                <Calendar size={14} className="text-muted" />
                {user.joinDate || 'Active'}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowMoreContact(!showMoreContact)}
          className="text-xs font-extrabold text-primary hover:text-primary/80 self-start cursor-pointer mt-1">
          {showMoreContact ? 'Show Less Details' : 'Show Additional Organizational Details'}
        </button>
      </div>

      {/* ── 2. Bank & Financial Information ── */}
      <div className="bg-surface-subtle/50 p-6 sm:p-8 rounded-3xl border border-border-subtle flex flex-col gap-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
              <CreditCard size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                Banking & Payroll Information
              </h3>
              <p className="text-[11px] text-muted">
                Official bank coordinates for payroll disbursements and reimbursements
              </p>
            </div>
          </div>
          {bank ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-success/10 text-success border border-success/20">
              <CheckCircle2 size={11} /> Verified Account
            </span>
          ) : (
            <Link
              to="/profile-completion"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              <span>Add Bank Details</span>
              <ChevronRight size={12} />
            </Link>
          )}
        </div>

        {bank ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            <div className="flex flex-col gap-1 p-4 rounded-2xl bg-white border border-border-subtle shadow-2xs">
              <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider flex items-center gap-1">
                <Landmark size={12} /> Bank Name
              </span>
              <span className="text-sm font-black text-foreground">{bank.bankName}</span>
              <span className="text-[10px] text-muted">{bank.branchName || 'Main Branch'}</span>
            </div>

            <div className="flex flex-col gap-1 p-4 rounded-2xl bg-white border border-border-subtle shadow-2xs">
              <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider flex items-center gap-1">
                <User size={12} /> Account Holder
              </span>
              <span className="text-sm font-bold text-foreground">{bank.accountHolderName}</span>
              <span className="text-[10px] text-muted">
                {bank.accountType || 'Savings Account'}
              </span>
            </div>

            <div className="flex flex-col gap-1 p-4 rounded-2xl bg-white border border-border-subtle shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider flex items-center gap-1">
                  <Hash size={12} /> Account Number
                </span>
                <button
                  type="button"
                  onClick={() => setShowAccountNum(!showAccountNum)}
                  className="text-muted hover:text-foreground text-[10px] font-semibold flex items-center gap-1 cursor-pointer">
                  {showAccountNum ? <EyeOff size={11} /> : <Eye size={11} />}
                  <span>{showAccountNum ? 'Hide' : 'Reveal'}</span>
                </button>
              </div>
              <span className="text-sm font-mono font-bold text-foreground">
                {showAccountNum ? bank.accountNumber : maskString(bank.accountNumber)}
              </span>
              <span className="text-[10px] font-mono font-semibold text-primary">
                IFSC: {bank.ifscCode}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-surface-elevated border border-dashed border-border-subtle text-center">
            <CreditCard size={28} className="mx-auto text-muted/60 mb-2" />
            <p className="text-xs font-bold text-foreground">No banking records submitted yet</p>
            <p className="text-[11px] text-muted mt-0.5">
              Submit your salary account passbook/cancelled cheque in the onboarding completion
              form.
            </p>
            <Link
              to="/profile-completion"
              className="inline-flex items-center gap-1.5 px-4 py-2 mt-3 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-xs">
              <span>Provide Bank Details</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        )}
      </div>

      {/* ── 3. Identity Verification & Government IDs ── */}
      <div className="bg-surface-subtle/50 p-6 sm:p-8 rounded-3xl border border-border-subtle flex flex-col gap-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Shield size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                Identity & KYC Verification
              </h3>
              <p className="text-[11px] text-muted">
                Statutory identification records submitted for background verification
              </p>
            </div>
          </div>
          {identity ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-success/10 text-success border border-success/20">
              <ShieldCheck size={11} /> Documents Submitted
            </span>
          ) : (
            <Link
              to="/profile-completion"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              <span>Upload ID Proofs</span>
              <ChevronRight size={12} />
            </Link>
          )}
        </div>

        {identity ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {/* PAN */}
            <div className="flex flex-col gap-1 p-4 rounded-2xl bg-white border border-border-subtle shadow-2xs">
              <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider flex items-center gap-1">
                <FileText size={12} /> PAN Card
              </span>
              <span className="text-sm font-mono font-black text-foreground tracking-wider">
                {identity.panNumber || 'Not provided'}
              </span>
              <span className="text-[10px] text-success font-semibold flex items-center gap-1 mt-0.5">
                <CheckCircle2 size={10} /> Tax Identification Active
              </span>
            </div>

            {/* Aadhaar */}
            <div className="flex flex-col gap-1 p-4 rounded-2xl bg-white border border-border-subtle shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider flex items-center gap-1">
                  <Shield size={12} /> Aadhaar Number
                </span>
                <button
                  type="button"
                  onClick={() => setShowAadhaar(!showAadhaar)}
                  className="text-muted hover:text-foreground text-[10px] font-semibold flex items-center gap-1 cursor-pointer">
                  {showAadhaar ? <EyeOff size={11} /> : <Eye size={11} />}
                  <span>{showAadhaar ? 'Hide' : 'Reveal'}</span>
                </button>
              </div>
              <span className="text-sm font-mono font-bold text-foreground tracking-wider">
                {showAadhaar ? identity.aadhaarNumber : maskString(identity.aadhaarNumber)}
              </span>
              <span className="text-[10px] text-muted">Government Verified ID</span>
            </div>

            {/* Passport / DL */}
            <div className="flex flex-col gap-1 p-4 rounded-2xl bg-white border border-border-subtle shadow-2xs">
              <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider flex items-center gap-1">
                <Globe size={12} /> Passport / DL
              </span>
              <span className="text-sm font-mono font-bold text-foreground">
                {identity.passportNumber || identity.drivingLicense || 'Optional / Not added'}
              </span>
              <span className="text-[10px] text-muted">Travel & Driving Document</span>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-surface-elevated border border-dashed border-border-subtle text-center">
            <Shield size={28} className="mx-auto text-muted/60 mb-2" />
            <p className="text-xs font-bold text-foreground">Identity records pending submission</p>
            <p className="text-[11px] text-muted mt-0.5">
              Submit your PAN Card and Aadhaar card details to verify your identity.
            </p>
            <Link
              to="/profile-completion"
              className="inline-flex items-center gap-1.5 px-4 py-2 mt-3 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-xs">
              <span>Submit Identity Proofs</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        )}
      </div>

      {/* ── 4. Educational Qualifications ── */}
      <div className="bg-surface-subtle/50 p-6 sm:p-8 rounded-3xl border border-border-subtle flex flex-col gap-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-info/10 text-info flex items-center justify-center shrink-0">
              <GraduationCap size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                Educational Qualifications
              </h3>
              <p className="text-[11px] text-muted">
                Academic milestones, degrees, and certified marksheets
              </p>
            </div>
          </div>
          <Link
            to="/profile-completion"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            <span>{education.length > 0 ? 'Edit Education' : 'Add Degree'}</span>
            <ChevronRight size={12} />
          </Link>
        </div>

        {education.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {education.map((edu, idx) => (
              <div
                key={edu.id || idx}
                className="p-5 rounded-2xl bg-white border border-border-subtle flex items-start gap-4 shadow-2xs hover:shadow-xs transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-info/10 text-info flex items-center justify-center shrink-0">
                  <GraduationCap size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black text-foreground truncate">{edu.degree}</div>
                  <div className="text-xs font-semibold text-muted mt-0.5 truncate">
                    {edu.institution}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {edu.field && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-subtle text-foreground border border-border-subtle">
                        {edu.field}
                      </span>
                    )}
                    {(edu.startYear || edu.endYear) && (
                      <span className="text-[10px] font-semibold text-muted flex items-center gap-1">
                        <Calendar size={10} />
                        {edu.startYear || '—'} – {edu.endYear || 'Present'}
                      </span>
                    )}
                    {edu.grade && (
                      <span className="text-[10px] font-bold text-success px-2 py-0.5 rounded-md bg-success/10 border border-success/20">
                        Grade: {edu.grade}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-surface-elevated border border-dashed border-border-subtle text-center">
            <GraduationCap size={28} className="mx-auto text-muted/60 mb-2" />
            <p className="text-xs font-bold text-foreground">No academic records added yet</p>
            <p className="text-[11px] text-muted mt-0.5">
              Add your highest degree, university, and year of graduation.
            </p>
            <Link
              to="/profile-completion"
              className="inline-flex items-center gap-1.5 px-4 py-2 mt-3 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-xs">
              <span>Add Education Records</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        )}
      </div>

      {/* ── 5. Previous Employment History ── */}
      <div className="bg-surface-subtle/50 p-6 sm:p-8 rounded-3xl border border-border-subtle flex flex-col gap-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-warning/10 text-warning flex items-center justify-center shrink-0">
              <Briefcase size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                Previous Employment History
              </h3>
              <p className="text-[11px] text-muted">
                Verified work experience, designations, and professional track record
              </p>
            </div>
          </div>
          <Link
            to="/profile-completion"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            <span>{employment.length > 0 ? 'Edit History' : 'Add Experience'}</span>
            <ChevronRight size={12} />
          </Link>
        </div>

        {employment.length > 0 ? (
          <div className="space-y-3 pt-1">
            {employment.map((emp, idx) => (
              <div
                key={emp.id || idx}
                className="p-5 rounded-2xl bg-white border border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs hover:shadow-xs transition-shadow">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center shrink-0">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-black text-foreground">{emp.designation}</div>
                    <div className="text-xs font-bold text-muted flex items-center gap-2 mt-0.5">
                      <Building size={12} />
                      <span>{emp.employer}</span>
                      {emp.isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
                          Current Role
                        </span>
                      )}
                    </div>
                    {emp.responsibilities && (
                      <p className="text-xs text-muted/90 mt-2 line-clamp-2 max-w-xl">
                        {emp.responsibilities}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-xs text-muted font-semibold shrink-0 md:text-right">
                  <div>
                    {emp.startDate || '—'} – {emp.isCurrent ? 'Present' : emp.endDate || '—'}
                  </div>
                  {emp.salary && (
                    <div className="text-[11px] font-mono text-foreground font-bold mt-1">
                      Compensation: {emp.salary}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-surface-elevated border border-dashed border-border-subtle text-center">
            <Briefcase size={28} className="mx-auto text-muted/60 mb-2" />
            <p className="text-xs font-bold text-foreground">No prior work experience listed</p>
            <p className="text-[11px] text-muted mt-0.5">
              Add your past company experiences, designations, and relieving details.
            </p>
            <Link
              to="/profile-completion"
              className="inline-flex items-center gap-1.5 px-4 py-2 mt-3 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-xs">
              <span>Add Prior Work Experience</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        )}
      </div>

      {/* ── 6. Certifications & Credentials ── */}
      <div className="bg-surface-subtle/50 p-6 sm:p-8 rounded-3xl border border-border-subtle flex flex-col gap-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
              <Award size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                Certifications & Achievements
              </h3>
              <p className="text-[11px] text-muted">
                Recognized credentials, licenses, and verified skill badges
              </p>
            </div>
          </div>
          <Link
            to="/profile-completion"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            <span>{certifications.length > 0 ? 'Manage Certifications' : 'Add Certificate'}</span>
            <ChevronRight size={12} />
          </Link>
        </div>

        {certifications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {certifications.map((cert, idx) => (
              <div
                key={cert.id || idx}
                className="p-5 rounded-2xl bg-white border border-border-subtle flex items-start gap-4 shadow-2xs hover:shadow-xs transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                  <Award size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black text-foreground truncate">{cert.title}</div>
                  <div className="text-xs font-semibold text-muted mt-0.5 truncate">
                    {cert.issuingOrganization}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-muted">
                    {cert.issueDate && <span>Issued: {cert.issueDate}</span>}
                    {cert.credentialId && (
                      <span className="font-mono bg-surface-subtle px-2 py-0.5 rounded border border-border-subtle">
                        ID: {cert.credentialId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-surface-elevated border border-dashed border-border-subtle text-center">
            <Award size={28} className="mx-auto text-muted/60 mb-2" />
            <p className="text-xs font-bold text-foreground">No certifications uploaded yet</p>
            <p className="text-[11px] text-muted mt-0.5">
              Add professional credentials like AWS, PMP, Google or Cisco certifications.
            </p>
            <Link
              to="/profile-completion"
              className="inline-flex items-center gap-1.5 px-4 py-2 mt-3 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-xs">
              <span>Add Certification</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        )}
      </div>

      {/* ── Work Hours & Status Banner ── */}
      <div className="bg-gradient-to-r from-primary-soft/30 via-surface-elevated to-surface-subtle p-6 rounded-3xl border border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Clock size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-foreground uppercase tracking-wider">
              Work Hours & Activity
            </span>
            <span className="text-sm font-bold text-primary">{user.workHours}</span>
            <span className="text-xs font-semibold text-muted">
              Status: {user.statusText} • Last seen {user.lastSeen}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={onElevationClick}
          className="text-xs font-black text-primary hover:bg-primary/10 rounded-xl px-4 py-2 border border-primary/30">
          Request Admin Elevation
        </Button>
      </div>
    </div>
  );
};
