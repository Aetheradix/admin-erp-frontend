import React from 'react';

interface ConfirmDialogProps {
  visible?: boolean;
  onHide?: () => void;
  message?: React.ReactNode;
  header?: string;
  icon?: string;
  accept?: () => void | Promise<void>;
  reject?: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  onHide,
  message,
  header,
  accept,
  reject,
}) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}>
      <div
        style={{
          background: 'var(--surface-card, #1e1e2e)',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '480px',
          width: '90%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
        {header && (
          <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>{header}</h2>
        )}
        <div style={{ marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
          {message}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              reject?.();
              onHide?.();
            }}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: '8px',
              border: '1px solid var(--border, #3f3f5a)',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}>
            Cancel
          </button>
          <button
            onClick={() => {
              accept?.();
              onHide?.();
            }}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--primary, #e11d48)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
