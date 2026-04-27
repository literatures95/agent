import { useEffect, useState } from 'react';

interface Theme {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

export function useTheme(): Theme {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('amy-theme');
    if (saved === 'dark' || saved === 'light') {
      setThemeState(saved);
    } else {
      // 系统偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeState(prefersDark ? 'dark' : 'light');
    }
  }, []);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    localStorage.setItem('amy-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return { theme, setTheme, toggleTheme };
}