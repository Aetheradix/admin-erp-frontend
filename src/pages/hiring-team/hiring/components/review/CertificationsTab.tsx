import type { ProfileCompletionData } from '@/services/employeeProfileService';

interface CertificationsTabProps {
  profile: ProfileCompletionData;
}

export function CertificationsTab({ profile }: CertificationsTabProps) {
  return (
    <div className="space-y-3">
      {profile.certifications && profile.certifications.length > 0 ? (
        profile.certifications.map((cert, i) => (
          <div
            key={cert.id || i}
            className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle space-y-1">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-bold text-foreground">{cert.title}</div>
                <div className="text-xs text-muted">{cert.issuingOrganization}</div>
              </div>
              <span className="text-[11px] font-mono text-muted">Issued: {cert.issueDate}</span>
            </div>
            {cert.credentialId && (
              <div className="text-xs text-muted">Credential ID: {cert.credentialId}</div>
            )}
            {cert.expiryDate && (
              <div className="text-xs text-muted">Expires: {cert.expiryDate}</div>
            )}
          </div>
        ))
      ) : (
        <div className="text-xs text-muted italic p-4 bg-surface-subtle rounded-xl text-center">
          No certifications recorded.
        </div>
      )}
    </div>
  );
}
