import * as React from 'react';

interface AuthShellProps {
  heading: string;
  subheading: string;
  children: React.ReactNode;
}

/**
 * Thin wrapper used by every auth page.
 * Provides consistent heading layout inside the auth card right panel.
 */
export function AuthShell({ heading, subheading, children }: AuthShellProps) {
  return (
    <div className="w-full">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold text-fg tracking-tight">{heading}</h1>
        {subheading && (
          <p className="text-sm text-muted mt-1">{subheading}</p>
        )}
      </div>
      {children}
    </div>
  );
}
