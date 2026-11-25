import { AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import type { GeofenceAuditLog } from '../types';

interface GeofenceLogsTableProps {
  logs: GeofenceAuditLog[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function GeofenceLogsTable({ logs, isLoading, onRefresh }: GeofenceLogsTableProps) {
  return (
    <div className="bg-surface-elevated rounded-3xl border border-border-subtle shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-foreground">
            Geofence Check-in Verification History
          </h3>
          <p className="text-xs text-muted font-medium">
            Live audit trail of all employee geofence boundary validations
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer">
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center">
          <RefreshCw size={22} className="animate-spin text-primary mx-auto mb-2" />
          <p className="text-xs font-bold text-muted">Loading audit entries...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="py-12 text-center text-muted text-xs font-semibold">
          No geofence check-in attempts recorded yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-muted text-[10px] font-black uppercase tracking-wider">
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Employee</th>
                <th className="py-3 px-3">Target Office</th>
                <th className="py-3 px-3">Distance / Radius</th>
                <th className="py-3 px-3">GPS Accuracy</th>
                <th className="py-3 px-3">Verification Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/60">
              {logs.map((log) => {
                const isSuccess = log.status === 'SUCCESS' || log.status === 'REMOTE_WFH';
                return (
                  <tr key={log.id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="py-3 px-3 font-mono text-[11px] text-muted">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-bold text-foreground">
                      {log.username ||
                        log.email ||
                        (log.employee_code ? `Emp #${log.employee_code}` : `User #${log.user_id}`)}
                    </td>
                    <td className="py-3 px-3 text-foreground font-semibold">
                      {log.office_name ||
                        (log.office_id ? `Office #${log.office_id}` : 'Remote / WFH')}
                    </td>
                    <td className="py-3 px-3 font-mono text-foreground">
                      {log.distance_meters !== null && log.distance_meters !== undefined ? (
                        <span>
                          <strong>{Math.round(log.distance_meters)}m</strong>
                          {log.allowed_radius_meters ? ` / ${log.allowed_radius_meters}m` : ''}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-muted">
                      {log.location_accuracy ? `±${Math.round(log.location_accuracy)}m` : '—'}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isSuccess
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-red-500/15 text-red-600 dark:text-red-400'
                        }`}>
                        {isSuccess ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                        {log.status}
                      </span>
                      {log.failure_reason && (
                        <p className="text-[10px] text-red-500 font-medium mt-0.5">
                          {log.failure_reason}
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
