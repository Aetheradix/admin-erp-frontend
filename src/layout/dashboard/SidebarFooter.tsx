'use client';

import React from 'react';

const SidebarFooter: React.FC = () => {
    return (
        <div className="sidebar-footer" style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ color: 'var(--muted)', fontSize: 11, textAlign: 'center' }}>
                © 2026 AetherERP v1.4
            </div>
        </div>
    );
};

export default SidebarFooter;
