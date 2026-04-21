'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch — render a stable placeholder until client mounts
  React.useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="
        h-8 w-8 flex items-center justify-center rounded-lg
        text-muted hover:text-fg hover:bg-subtle
        transition-colors duration-150
      "
    >
      {/*
       * Always render both icons — CSS controls which is visible.
       * This avoids any server/client mismatch and eliminates the
       * mounted-guard flicker entirely.
       */}
      <Sun
        size={16}
        strokeWidth={1.8}
        className="block dark:hidden"
        aria-hidden
      />
      <Moon
        size={16}
        strokeWidth={1.8}
        className="hidden dark:block"
        aria-hidden
      />
    </button>
  );
}
