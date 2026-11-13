import React, { createContext, useContext, useState, useEffect } from 'react';
import { lightTheme, darkTheme } from '../constants/theme';
import { getSetting, setSetting } from '../database/db';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeMode, setThemeModeState] = useState('light');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      try {
        const saved = await getSetting('theme', 'light');
        if (saved === 'dark' || saved === 'light') {
          setThemeModeState(saved);
        }
      } catch (err) {
        console.warn('Error loading theme:', err);
      } finally {
        setIsLoaded(true);
      }
    }
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const nextMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeModeState(nextMode);
    try {
      await setSetting('theme', nextMode);
    } catch (err) {
      console.warn('Failed to persist theme:', err);
    }
  };

  const setThemeMode = async (mode) => {
    if (mode !== 'light' && mode !== 'dark') return;
    setThemeModeState(mode);
    try {
      await setSetting('theme', mode);
    } catch (err) {
      console.warn('Failed to persist theme:', err);
    }
  };

  const colors = themeMode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ themeMode, isDark: themeMode === 'dark', colors, toggleTheme, setThemeMode, isLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

