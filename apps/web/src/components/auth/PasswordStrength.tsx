'use client';

import * as React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Req {
  label: string;
  met: boolean;
}

const getReqs = (p: string): Req[] => [
  { label: 'At least 8 characters', met: p.length >= 8 },
  { label: 'One uppercase letter',  met: /[A-Z]/.test(p) },
  { label: 'One lowercase letter',  met: /[a-z]/.test(p) },
  { label: 'One number',            met: /\d/.test(p) },
];

const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColor = ['', 'bg-danger', 'bg-warning', 'bg-warning', 'bg-success'];
const strengthText  = ['', 'text-danger', 'text-warning', 'text-warning', 'text-success'];

interface Props {
  password?: string;
  className?: string;
}

export function PasswordStrength({ password = '', className }: Props) {
  if (!password) return null;

  const reqs = getReqs(password);
  const met = reqs.filter((r) => r.met).length;

  return (
    <div className={cn('space-y-2.5', className)}>
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1 h-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                'flex-1 rounded-full transition-all duration-300',
                i <= met ? strengthColor[met] : 'bg-border',
              )}
            />
          ))}
        </div>
        {met > 0 && (
          <span className={cn('text-2xs font-medium', strengthText[met])}>
            {strengthLabel[met]}
          </span>
        )}
      </div>

      {/* Requirements list */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {reqs.map((r) => (
          <div key={r.label} className="flex items-center gap-1.5">
            <span
              className={cn(
                'flex-shrink-0 h-4 w-4 rounded-full flex items-center justify-center transition-colors',
                r.met ? 'bg-success/10' : 'bg-border/40',
              )}
            >
              {r.met
                ? <Check size={9} strokeWidth={3} className="text-success" />
                : <X    size={9} strokeWidth={3} className="text-muted" />}
            </span>
            <span className={cn('text-2xs transition-colors', r.met ? 'text-fg' : 'text-muted')}>
              {r.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
