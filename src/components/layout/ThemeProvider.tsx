import * as React from 'react';

import { useThemeStore } from '@/stores/themeStore';
import { useThemeInit } from '@/hooks/useThemeInit';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: 'dark' | 'light' | 'system';
  storageKey?: string;
}

/**
 * ThemeProvider wraps the app and:
 *  - bootstraps the theme on mount (from localStorage or default)
 *  - listens for system preference changes when theme === 'system'
 */
export function ThemeProvider({ children, defaultTheme = 'dark' }: ThemeProviderProps) {
  const setTheme = useThemeStore((s) => s.setTheme);
  const theme = useThemeStore((s) => s.theme);

  // Initialize from store on first mount
  React.useEffect(() => {
    if (!theme) {
      setTheme(defaultTheme);
    } else {
      setTheme(theme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useThemeInit();

  return <>{children}</>;
}
