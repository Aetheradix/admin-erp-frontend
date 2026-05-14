'use client';

import React from 'react';

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-layout">
      {/* Left Brand Panel */}
      <div className="auth-brand-panel">
        <div className="auth-brand-logo">
          <div className="auth-brand-logo-icon">A</div>
          <span className="auth-brand-logo-text">AetherERP</span>
        </div>

        <div className="auth-brand-content">
          <div className="auth-trusted-badge">
            <div className="auth-trusted-avatars">
              <span style={{ background: '#E8583A', color: '#fff' }}>👤</span>
              <span style={{ background: '#d04a2e', color: '#fff' }}>👤</span>
              <span style={{ background: '#c0401e', color: '#fff' }}>👤</span>
            </div>
            TRUSTED BY 1000+ FOUNDERS
          </div>

          <h1 className="auth-brand-heading">
            Your team's brain,
            <br />
            <em>always</em> accessible.
          </h1>

          <p className="auth-brand-subtext">
            AetherERP keeps your collective intelligence flowing across
            every tool, every conversation, every decision. Never lose
            context again.
          </p>
        </div>

        <div className="auth-brand-footer">
          <a href="#">FEATURES</a>
          <a href="#">HOW IT WORKS</a>
          <a href="#">MISSION</a>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        {children}
      </div>
    </div>
  );
}
