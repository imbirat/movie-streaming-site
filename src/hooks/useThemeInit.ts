import { useEffect } from 'react';

import { useThemeStore } from '@/stores/themeStore';

/**
 * Applies the resolved theme to <html> + listens to system preference changes
 * when the user has selected 'system'.
 */
export function useThemeInit() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  useEffect(() => {
    // Apply on mount (in case store loaded from localStorage but DOM hasn't been touched yet)
    setTheme(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme, setTheme]);
}
