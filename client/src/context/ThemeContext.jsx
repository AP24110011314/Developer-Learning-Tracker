import { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  toggle: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  useEffect(() => {
    // Enforce light theme across the application
    const root = document.documentElement;
    root.classList.remove('dark');
    try {
      localStorage.removeItem('bigo-theme');
    } catch {
      // ignore storage access errors in sandboxed environments
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'light', toggle: () => {}, toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

