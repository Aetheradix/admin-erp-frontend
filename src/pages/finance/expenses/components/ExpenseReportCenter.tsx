import { DATE_RANGE_PRESETS } from '../constants';
import type { DateRangePreset } from '../types';

interface ExpenseReportCenterProps {
  recordCount: number;
  datePreset: DateRangePreset;
  onPresetChange: (preset: DateRangePreset) => void;
  customStartDate: string;
  customEndDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onClearCustomDates: () => void;
  onDownloadCSV: () => void;
  onDownloadPDF: () => void;
}

export function ExpenseReportCenter({
  recordCount,
  datePreset,
  onPresetChange,
  customStartDate,
  customEndDate,
  onStartDateChange,
  onEndDateChange,
  onClearCustomDates,
  onDownloadCSV,
  onDownloadPDF,
}: ExpenseReportCenterProps) {
  return (
    <div className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Expense Reports & Export Center
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Select date ranges and export filtered expense reports ({recordCount} record
            {recordCount === 1 ? '' : 's'}).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDownloadCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export CSV (.csv)
          </button>
          <button
            type="button"
            onClick={onDownloadPDF}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-800 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download PDF (.pdf)
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-gray-600 mr-1 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Period:
        </span>

        {DATE_RANGE_PRESETS.map((preset) => {
          const isActive = datePreset === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onPresetChange(preset.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                isActive ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              {preset.label}
            </button>
          );
        })}
      </div>

      {datePreset === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-dashed border-gray-200">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 font-medium">From:</label>
            <input
              type="date"
              value={customStartDate}
              onChange={(event) => onStartDateChange(event.target.value)}
              className="px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 font-medium">To:</label>
            <input
              type="date"
              value={customEndDate}
              onChange={(event) => onEndDateChange(event.target.value)}
              className="px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {(customStartDate || customEndDate) && (
            <button
              type="button"
              onClick={onClearCustomDates}
              className="text-xs text-red-600 hover:underline">
              Clear Dates
            </button>
          )}
        </div>
      )}
    </div>
  );
}
