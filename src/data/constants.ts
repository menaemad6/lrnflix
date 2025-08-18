import { lighter, darker, hexToHsl, generateColorPalette } from '@/utils/colorUtils';

export const PLATFORM_NAME = "LRNFLIX"
export const API_URL = import.meta.env.VITE_API_URL;

/**
 * Comprehensive color system for the application
 * This is the single source of truth for all colors used in the application
 * Colors are calculated from primary colors to reduce redundancy and enable tenant customization
 */
export const colorSystem = {
  // Primary brand colors (these will be tenant-customizable)
  primary: {
    // Main brand color (currently emerald, but will be tenant-customizable)
    main: '#10b981',
    // Calculated variants from main
    light: lighter('#10b981', 0.2),
    dark: darker('#10b981', 0.2),
    // HSL values for CSS variables
    hsl: hexToHsl('#10b981'),
  },
  
  // Secondary brand colors (calculated from primary)
  secondary: {
    // Complementary to primary (calculated)
    main: '#14b8a6', // teal variant
    light: lighter('#14b8a6', 0.2),
    dark: darker('#14b8a6', 0.2),
    hsl: hexToHsl('#14b8a6'),
  },
  
  // Accent colors (calculated from primary)
  accent: {
    // Accent color (calculated from primary)
    main: '#06b6d4', // cyan variant
    light: lighter('#06b6d4', 0.2),
    dark: darker('#06b6d4', 0.2),
    hsl: hexToHsl('#06b6d4'),
  },
  
  // Neutral colors (calculated from primary for consistency)
  neutral: {
    // White to black scale with primary tint
    50: '#f8fafc',   // Very light with primary tint
    100: '#f1f5f9',  // Light with primary tint
    200: '#e2e8f0',  // Light gray with primary tint
    300: '#cbd5e1',  // Medium light gray
    400: '#a3a3a3',  // Medium gray
    500: '#6b7280',  // Medium dark gray
    600: '#4b5563',  // Dark gray
    700: '#374151',  // Darker gray
    800: '#1f2937',  // Very dark gray
    900: '#171717',  // Almost black
  },
  
  // Semantic colors (calculated from primary)
  semantic: {
    success: '#22c55e',    // Green (success)
    warning: '#f97316',    // Orange (warning)
    error: '#ef4444',      // Red (error)
    info: '#3b82f6',       // Blue (info)
  },
  
  // Icon colors (calculated from semantic colors)
  icon: {
    success: '#22c55e',    // Green
    warning: '#f97316',    // Orange
    error: '#ef4444',      // Red
    info: '#3b82f6',       // Blue
    primary: '#10b981',    // Primary brand color
  },
  
  // Theme-aware colors (light/dark variants)
  theme: {
    light: {
      background: '#ffffff',
      foreground: '#171717',
      card: '#ffffff',
      cardForeground: '#171717',
      popover: '#ffffff',
      popoverForeground: '#171717',
      muted: '#f1f5f9',
      mutedForeground: '#6b7280',
      border: '#e2e8f0',
      input: '#e2e8f0',
      ring: '#10b981',
      sidebar: {
        background: '#f8fafc',
        foreground: '#171717',
        border: '#e2e8f0',
      },
    },
    dark: {
      background: '#0d0f0e',
      foreground: '#ffffff',
      card: '#101312',
      cardForeground: '#ffffff',
      popover: '#101312',
      popoverForeground: '#ffffff',
      muted: '#131916',
      mutedForeground: '#a3a3a3',
      border: '#1c2320',
      input: '#1c2320',
      ring: '#10b981',
      sidebar: {
        background: '#101312',
        foreground: '#ffffff',
        border: '#1c2320',
      },
    },
  },
  
  // Gradients (calculated from primary colors)
  gradients: {
    primary: 'linear-gradient(90deg, var(--primary-light) 0%, var(--primary) 100%)',
    secondary: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
    accent: 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)',
    text: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 50%, var(--accent) 100%)',
    background: {
      light: 'linear-gradient(180deg, var(--neutral-50) 0%, rgba(16, 185, 129, 0.05) 100%)',
      dark: 'linear-gradient(180deg, var(--background) 0%, rgba(16, 185, 129, 0.1) 100%)',
    },
    premium: {
      light: 'linear-gradient(120deg, rgba(16, 185, 129, 0.1) 60%, var(--neutral-50) 100%)',
      dark: 'linear-gradient(120deg, var(--background) 0%, rgba(16, 185, 129, 0.05) 100%)',
    },
  },
  
  // Effects (calculated from primary colors)
  effects: {
    glow: '0 0 20px rgba(16, 185, 129, 0.3), 0 0 40px rgba(16, 185, 129, 0.1)',
    pulseGlow: '0 0 20px rgba(16, 185, 129, 0.4), 0 0 40px rgba(16, 185, 129, 0.1)',
    hoverGlow: '0 0 30px rgba(16, 185, 129, 0.4), 0 0 60px rgba(16, 185, 129, 0.2), 0 20px 40px rgba(0, 0, 0, 0.3)',
  },
  
  // Helper functions
  getColor: (colorPath: string, theme = 'light') => {
    const parts = colorPath.split('.');
    let result: any = colorSystem;
    
    for (const part of parts) {
      if (!result[part]) return null;
      result = result[part];
    }
    
    return typeof result === 'object' ? result[theme] : result;
  },
  
  getCssVar: (name: string) => `var(--${name})`,
  
  // For backward compatibility (deprecated - use semantic colors instead)
  designOptions: {
    primary: '#10b981',
    secondary: '#a3a3a3',
    accent: '#34d399',
    textPrimary: '#171717',
    textSecondary: '#a3a3a3',
    background: '#f8fafc',
    cardBackground: '#ffffff',
    error: '#ef4444',
    success: '#22c55e',
    warning: '#f97316',
  },
};

// For backward compatibility
export const designOptions = colorSystem.designOptions;

// CSS Variables generator for tenant customization
export const generateCssVariables = (tenantColors?: {
  primary?: string;
  secondary?: string;
  accent?: string;
}) => {
  const colors = {
    primary: tenantColors?.primary || colorSystem.primary.main,
    secondary: tenantColors?.secondary || colorSystem.secondary.main,
    accent: tenantColors?.accent || colorSystem.accent.main,
  };
  
  // Generate full color palette from primary color
  const primaryPalette = generateColorPalette(colors.primary);
  
  return {
    ...primaryPalette,
    '--secondary': colors.secondary,
    '--secondary-light': lighter(colors.secondary, 0.2),
    '--secondary-dark': darker(colors.secondary, 0.2),
    '--accent': colors.accent,
    '--accent-light': lighter(colors.accent, 0.2),
    '--accent-dark': darker(colors.accent, 0.2),
  };
};
