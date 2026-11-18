import { ExternalLink, FileText } from 'lucide-react';
import type { ProfileCompletionData } from '@/services/employeeProfileService';
import { DetailField } from './DetailField';

interface IdentityTabProps {
  profile: ProfileCompletionData;
}

export function IdentityTab({ profile }: IdentityTabProps) {
  const identity = profile.identity;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <DetailField label="PAN Number" value={identity?.panNumber || '—'} mono />
        <DetailField
          label="Aadhaar Number"
          value={
            identity?.aadhaarNumber ? `•••• •••• ${identity.aadhaarNumber.slice(-4)}` : '—'
          }
          mono
        />
        <DetailField label="Passport Number" value={identity?.passportNumber || '—'} mono />
        <DetailField label="Driving License" value={identity?.drivingLicense || '—'} mono />
      </div>

      <div className="pt-2">
        <div className="text-xs font-bold text-foreground mb-3">Uploaded Identity Documents:</div>
        {profile.documents && profile.documents.length > 0 ? (
          <div className="space-y-2">
            {profile.documents.map((doc) => (
              <div
                key={doc.id}
                className="p-3 rounded-xl border border-border-subtle bg-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-primary" />
                  <div>
                    <div className="text-xs font-bold text-foreground">
                      {doc.fileName || doc.label}
                    </div>
                    <div className="text-[10px] text-muted capitalize">
                      {doc.type} • {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(0)} KB` : ''} •
                      Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      doc.status === 'verified'
                        ? 'bg-success/10 border-success/25 text-success'
                        : doc.status === 'rejected'
                          ? 'bg-error/10 border-error/25 text-error'
                          : 'bg-surface-subtle border-border-subtle text-muted'
                    }`}>
                    {doc.status}
                  </span>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 rounded-lg bg-surface-subtle text-primary hover:bg-primary/10 text-xs font-bold transition-all flex items-center gap-1">
                    <ExternalLink size={12} />
                    View
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-muted italic p-4 bg-surface-subtle rounded-xl text-center">
            No documents attached yet.
          </div>
        )}
      </div>
    </div>
  );
}
