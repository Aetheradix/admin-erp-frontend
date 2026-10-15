import type { InputHTMLAttributes } from 'react';
import React from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  required,
  value,
  onChange,
  type = 'text',
  ...rest
}) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value ?? ''}
        onChange={onChange}
        className={`w-full rounded-xl border px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
