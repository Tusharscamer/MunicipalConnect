import { createContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";

export const ThemeContext = createContext();

const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(THEMES.SYSTEM);
  const [resolvedTheme, setResolvedTheme] = useState(THEMES.LIGHT);
  const [accentColor, setAccentColor] = useState('#3b82f6'); // blue-500

  // Get system theme
  const getSystemTheme = useCallback(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? THEMES.DARK 
      : THEMES.LIGHT;
  }, []);

  // Apply theme to document
  const applyTheme = useCallback((themeToApply) => {
    const root = document.documentElement;
    const resolved = themeToApply === THEMES.SYSTEM ? getSystemTheme() : themeToApply;
    
    // Remove all theme classes
    root.classList.remove(THEMES.LIGHT, THEMES.DARK);
    
    // Add new theme class
    root.classList.add(resolved);
    
    // Set data-theme attribute for CSS custom properties
    root.setAttribute('data-theme', resolved);
    
    // Update Tailwind dark mode
    if (resolved === THEMES.DARK) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Set CSS custom properties for accent color
    root.style.setProperty('--color-accent', accentColor);
    
    // Store in localStorage
    localStorage.setItem('theme', themeToApply);
    localStorage.setItem('accentColor', accentColor);
    
    setResolvedTheme(resolved);
    
    // Optional: Trigger custom event for other components
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: resolved } }));
  }, [accentColor, getSystemTheme]);

  // Initialize theme
  useEffect(() => {
    // Load saved preferences
    const savedTheme = localStorage.getItem('theme') || THEMES.SYSTEM;
    const savedAccent = localStorage.getItem('accentColor') || '#3b82f6';
    
    setTheme(savedTheme);
    setAccentColor(savedAccent);
    applyTheme(savedTheme);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === THEMES.SYSTEM) {
        applyTheme(THEMES.SYSTEM);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [applyTheme, theme]);

  // Toggle between light/dark
  const toggleTheme = () => {
    const newTheme = theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    setTheme(newTheme);
    applyTheme(newTheme);
    
    toast.success(`Switched to ${newTheme} mode`, {
      icon: newTheme === THEMES.DARK ? '🌙' : '☀️',
      style: {
        background: newTheme === THEMES.DARK ? '#1f2937' : '#ffffff',
        color: newTheme === THEMES.DARK ? '#ffffff' : '#000000',
      }
    });
  };

  // Set specific theme
  const setSpecificTheme = (newTheme) => {
    if (!Object.values(THEMES).includes(newTheme)) {
      console.error('Invalid theme:', newTheme);
      return;
    }
    
    setTheme(newTheme);
    applyTheme(newTheme);
    
    if (newTheme !== THEMES.SYSTEM) {
      toast.success(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode enabled`);
    }
  };

  // Set accent color
  const updateAccentColor = (color) => {
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      toast.error('Invalid color format. Use hex format like #3b82f6');
      return;
    }
    
    setAccentColor(color);
    applyTheme(theme);
    
    toast.success('Accent color updated!', {
      style: {
        background: color,
        color: getContrastColor(color)
      }
    });
  };

  // Helper to get contrast color
  const getContrastColor = (hexColor) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  // Get theme colors for components
  const getThemeColors = () => {
    const colors = {
      light: {
        bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
        card: 'bg-white',
        text: 'text-gray-900',
        textSecondary: 'text-gray-600',
        border: 'border-gray-200',
        hover: 'hover:bg-gray-50'
      },
      dark: {
        bg: 'bg-gradient-to-br from-gray-900 to-gray-800',
        card: 'bg-gradient-to-br from-gray-800 to-gray-900',
        text: 'text-white',
        textSecondary: 'text-gray-300',
        border: 'border-gray-700',
        hover: 'hover:bg-gray-800'
      }
    };
    
    return colors[resolvedTheme] || colors.light;
  };

  // Check if dark mode
  const isDarkMode = resolvedTheme === THEMES.DARK;

  // Theme toggle options for UI
  const themeOptions = [
    { value: THEMES.LIGHT, label: 'Light', icon: '☀️' },
    { value: THEMES.DARK, label: 'Dark', icon: '🌙' },
    { value: THEMES.SYSTEM, label: 'System', icon: '🖥️' }
  ];

  // Predefined accent colors
  const accentColors = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Orange', value: '#f59e0b' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Teal', value: '#14b8a6' }
  ];

  return (
    <ThemeContext.Provider 
      value={{ 
        theme,
        resolvedTheme,
        accentColor,
        isDarkMode,
        themeOptions,
        accentColors,
        toggleTheme,
        setSpecificTheme,
        updateAccentColor,
        getThemeColors,
        getSystemTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}