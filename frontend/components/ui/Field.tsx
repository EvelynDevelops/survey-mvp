/**
 * Reusable Field component for form fields with labels.
 */

import { ReactNode } from 'react';

interface FieldProps {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  required?: boolean;
  error?: string;
}

export function Field({ label, htmlFor, children, required, error }: FieldProps) {
  return (
    <div className="mb-4">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
