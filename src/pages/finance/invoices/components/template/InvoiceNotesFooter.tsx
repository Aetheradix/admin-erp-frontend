interface InvoiceNotesFooterProps {
  notes: string;
}

export function InvoiceNotesFooter({ notes }: InvoiceNotesFooterProps) {
  return (
    <>
      {notes && (
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            marginTop: '64px',
            paddingTop: '20px',
            borderTop: '1px solid #D1D5DB',
          }}>
          <p style={{ margin: 0, fontWeight: 700 }}>Notes</p>

          <p style={{ margin: '8px 0 0 0', color: '#6B7280' }}>{notes}</p>
        </div>
      )}

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          marginTop: '64px',
          paddingTop: '20px',
          borderTop: '1px solid #D1D5DB',
          textAlign: 'center',
          color: '#6B7280',
        }}>
        {notes || 'Thank you for your business'}
      </div>
    </>
  );
}
