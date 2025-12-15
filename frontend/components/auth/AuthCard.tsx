'use client';

import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';
import { AcornLmsLogo } from '@/components/icon/AcornLogo';

type FieldConfig = {
  name: string;                 // key in values
  label: string;                // shown label
  type?: 'text' | 'email' | 'password' | 'tel';
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
};

type AuthCardProps = {
  brandText?: string;           // e.g. "acorn"
  title: string;               // e.g. "Register" / "Login"
  submitText: string;          // button text
  fields: FieldConfig[];
  onClose?: () => void;        // click X
  onSubmit: (values: Record<string, string>) => Promise<void> | void;
  footer?: React.ReactNode;    // e.g. link to login/register
};

export function AuthCard({
  brandText = 'acorn',
  title,
  submitText,
  fields,
  onClose,
  onSubmit,
  footer,
}: AuthCardProps) {
  const [values, setValues] = React.useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of fields) init[f.name] = '';
    return init;
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  function setValue(name: string, val: string) {
    setValues((prev) => ({ ...prev, [name]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // minimal required validation
    for (const f of fields) {
      if (f.required && !values[f.name]?.trim()) {
        setError('Please fill in all required fields.');
        return;
      }
    }

    try {
      setLoading(true);
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Card className="rounded-[2.5rem] border bg-white shadow-sm">
          {/* Header */}
          <div className="px-10 pt-10 pb-6">
            <div className="flex justify-center">
              <AcornLmsLogo className="h-10 w-auto text-navy" />
            </div>
          </div>

          {/* Body */}
          <div className="px-10 pb-10">
            <p className="text-gray-600 mb-8 text-center">
              {title === 'Login'
                ? 'Welcome back! Sign in to continue to your account.'
                : 'Create your account to get started.'}
            </p>

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {fields.map((f) => (
                <div key={f.name} className="space-y-2">
                  <Label className="text-base font-semibold">
                    {f.label}
                    {f.required ? <span className="text-red-500">*</span> : null}
                  </Label>
                  <Input
                    type={f.type ?? 'text'}
                    value={values[f.name] ?? ''}
                    onChange={(e) => setValue(f.name, e.target.value)}
                    placeholder={f.placeholder}
                    autoComplete={f.autoComplete}
                    required={!!f.required}
                    className="h-12 rounded-full px-5"
                  />
                </div>
              ))}

              <div className="pt-2 flex justify-center">
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 px-12 rounded-full text-base font-semibold"
                >
                  {loading ? 'Submitting...' : submitText}
                </Button>
              </div>

              {footer ? (
                <div className="pt-2 text-center text-sm text-muted-foreground">
                  {footer}
                </div>
              ) : null}
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
