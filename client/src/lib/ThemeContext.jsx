import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check local storage or system preference on mount
    const stored = localStorage.getItem('tt_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (stored === 'dark' || (!stored && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = (event) => {
    const newTheme = !isDarkMode;
    
    // Custom Right-to-Left animated wipe if browser supports View Transitions
    if (document.startViewTransition) {
      const transition = document.startViewTransition(() => {
        applyTheme(newTheme);
      });
      
      transition.ready.then(() => {
        // Calculate longest distance from top-right (100%, 0%) to bottom-left to ensure circle covers screen
        const maxRadius = Math.hypot(window.innerWidth, window.innerHeight);

        document.documentElement.animate(
          [
            { clipPath: 'circle(0px at 100% 0%)' },
            { clipPath: `circle(${maxRadius}px at 100% 0%)` }
          ],
          {
            duration: 1000,
            easing: 'ease-in-out',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      });
    } else {
      // Fallback standard toggle
      applyTheme(newTheme);
    }
  };

  const applyTheme = (themeIsDark) => {
    setIsDarkMode(themeIsDark);
    if (themeIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tt_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tt_theme', 'light');
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
