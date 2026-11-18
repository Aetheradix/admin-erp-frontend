import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp } from 'lucide-react';
import type React from 'react';

interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

export function KPICard({ label, value, sub, trend, icon, color }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{label}</span>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `${color}22`,
            color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {icon}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px' }}>
          {value}
        </div>
        {sub && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            {trend === 'up' && <TrendingUp size={13} color="#22c55e" />}
            {trend === 'down' && <TrendingDown size={13} color="#f87171" />}
            <span
              style={{
                fontSize: 12,
                color: trend === 'up' ? '#22c55e' : trend === 'down' ? '#f87171' : '#64748b',
              }}>
              {sub}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
