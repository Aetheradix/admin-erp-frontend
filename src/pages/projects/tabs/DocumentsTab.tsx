import { useState } from 'react';
import type { Project, ProjectDocument, DocumentPhase } from '@/types/project';
import { FileText, Download, CheckCircle2, XCircle } from 'lucide-react';
import { projectService } from '@/services/projectService';
import { Card, Progress, Button, Tag, Modal, Input, Space, message } from 'antd';

const { TextArea } = Input;

interface DocumentsTabProps {
  project: Project;
  documents: ProjectDocument[];
  onDocumentsUpdated: () => void;
}

const PHASES: { id: DocumentPhase; label: string }[] = [
  { id: 'initiation', label: '1. Initiation' },
  { id: 'requirements', label: '2. Requirements' },
  { id: 'planning', label: '3. Planning' },
  { id: 'design', label: '4. Design & Architecture' },
  { id: 'build', label: '5. Build & Code Standards' },
  { id: 'testing', label: '6. Quality Assurance & UAT' },
  { id: 'release', label: '7. Release & Deployment' },
  { id: 'closure', label: '8. Project Closure' },
];

export function DocumentsTab({ project, documents, onDocumentsUpdated }: DocumentsTabProps) {
  const [notNeededReason, setNotNeededReason] = useState('');
  const [reasonModalDoc, setReasonModalDoc] = useState<ProjectDocument | null>(null);

  const doneCount = documents.filter((d) => d.status === 'done').length;
  const activeCount = documents.filter((d) => d.status !== 'not_needed').length;
  const progressPct = activeCount > 0 ? Math.round((doneCount / activeCount) * 100) : 0;

  const handleDownloadTemplate = (doc: ProjectDocument) => {
    const blob = new Blob(
      [
        `StartupOS Document Template\nProject: ${project.name} (${project.key})\nDocument: ${doc.name}\nPhase: ${doc.phase}`,
      ],
      {
        type: 'text/plain',
      }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.key}_${doc.name.replace(/\s+/g, '_')}.${doc.templateFormat || 'docx'}`;
    a.click();
    URL.revokeObjectURL(url);
    message.success(`Template for "${doc.name}" downloaded`);
  };

  const handleMarkDone = (doc: ProjectDocument) => {
    projectService.updateDocumentStatus(doc.id, 'done');
    message.success(`"${doc.name}" marked as Completed`);
    onDocumentsUpdated();
  };

  const handleMarkNotNeeded = () => {
    if (!reasonModalDoc || !notNeededReason.trim()) {
      message.error('Reason is required to mark a document as not needed');
      return;
    }
    projectService.updateDocumentStatus(reasonModalDoc.id, 'not_needed', notNeededReason);
    message.info(`"${reasonModalDoc.name}" flagged as Not Needed`);
    setReasonModalDoc(null);
    setNotNeededReason('');
    onDocumentsUpdated();
  };

  return (
    <div className="space-y-6">
      {/* Progress Metric Card */}
      <Card
        className="rounded-2xl border-border-subtle bg-surface-subtle shadow-xs"
        styles={{ body: { padding: '20px' } }}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">Project Deliverables Checklist</h3>
              <p className="text-xs text-muted">
                {doneCount} of {activeCount} mandatory deliverables submitted and verified
              </p>
            </div>
          </div>

          <div className="w-full md:w-64">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-muted">Progress</span>
              <span className="text-primary">{progressPct}%</span>
            </div>
            <Progress
              percent={progressPct}
              showInfo={false}
              strokeColor="var(--primary, #3b82f6)"
            />
          </div>
        </div>
      </Card>

      {/* Phase Groups */}
      <div className="space-y-4">
        {PHASES.map((phase) => {
          const phaseDocs = documents.filter((d) => d.phase === phase.id);
          if (phaseDocs.length === 0) return null;

          return (
            <Card
              key={phase.id}
              className="rounded-2xl border-border-subtle bg-surface-subtle overflow-hidden shadow-xs"
              styles={{ body: { padding: 0 } }}>
              <div className="px-4 py-3 bg-surface-elevated/40 border-b border-border-subtle flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">{phase.label}</span>
                <Tag color="default" className="text-[11px] font-semibold m-0">
                  {phaseDocs.filter((d) => d.status === 'done').length} / {phaseDocs.length} Done
                </Tag>
              </div>

              <div className="divide-y divide-border-subtle">
                {phaseDocs.map((doc) => {
                  const isDone = doc.status === 'done';
                  const isNotNeeded = doc.status === 'not_needed';

                  return (
                    <div
                      key={doc.id}
                      className="p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs hover:bg-surface-elevated/20 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            isDone
                              ? 'bg-emerald-500/15 text-emerald-500'
                              : isNotNeeded
                                ? 'bg-slate-500/15 text-slate-400'
                                : 'bg-primary/10 text-primary'
                          }`}>
                          {isDone ? (
                            <CheckCircle2 size={14} />
                          ) : isNotNeeded ? (
                            <XCircle size={14} />
                          ) : (
                            <FileText size={14} />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p
                            className={`font-semibold ${isNotNeeded ? 'line-through text-muted' : 'text-foreground'}`}>
                            {doc.name}
                          </p>
                          <p className="text-[10px] text-muted flex items-center gap-2">
                            <span>Role: {doc.ownerRole}</span>
                            {doc.ownerName && <span>• Assigned: {doc.ownerName}</span>}
                            {isNotNeeded && doc.notNeededReason && (
                              <span className="text-amber-500 font-medium">
                                • Reason: {doc.notNeededReason}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <Space size={6} className="shrink-0 self-end md:self-auto">
                        <Button
                          size="small"
                          icon={<Download size={12} />}
                          onClick={() => handleDownloadTemplate(doc)}
                          className="rounded-lg text-[11px] font-semibold">
                          Template
                        </Button>

                        {!isDone && !isNotNeeded && (
                          <>
                            <Button
                              size="small"
                              type="primary"
                              icon={<CheckCircle2 size={12} />}
                              onClick={() => handleMarkDone(doc)}
                              className="rounded-lg text-[11px] font-bold bg-emerald-500 hover:bg-emerald-600">
                              Mark Done
                            </Button>
                            <Button
                              size="small"
                              onClick={() => {
                                setReasonModalDoc(doc);
                                setNotNeededReason('');
                              }}
                              className="rounded-lg text-[11px]">
                              Not Needed
                            </Button>
                          </>
                        )}

                        {isDone && (
                          <Tag color="green" className="font-bold text-[10px] uppercase m-0">
                            Completed
                          </Tag>
                        )}
                        {isNotNeeded && (
                          <Tag color="default" className="font-bold text-[10px] uppercase m-0">
                            Exempted
                          </Tag>
                        )}
                      </Space>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Exemption Reason Modal */}
      <Modal
        title={<span className="text-sm font-black">Document Exemption</span>}
        open={!!reasonModalDoc}
        onCancel={() => setReasonModalDoc(null)}
        onOk={handleMarkNotNeeded}
        okText="Confirm Exemption"
        centered>
        <p className="text-xs text-muted mb-2">
          State the audit rationale for why <strong>{reasonModalDoc?.name}</strong> is not needed
          for this project:
        </p>
        <TextArea
          rows={3}
          value={notNeededReason}
          onChange={(e) => setNotNeededReason(e.target.value)}
          placeholder="e.g. Scope does not require custom database migrations or schema design"
          className="rounded-xl"
        />
      </Modal>
    </div>
  );
}
