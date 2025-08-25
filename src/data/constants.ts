import { 
  lighter, 
  darker, 
  hexToHsl, 
  generateColorPalette,
  generateColorScheme,
  generateNeutralColors,
  generateTrueNeutralColors,
  generateSemanticColors
} from '@/utils/colorUtils';

export const PLATFORM_NAME = "LRNFLIX"
export const API_URL = import.meta.env.VITE_API_URL;

// Base primary color - this is the ONLY hardcoded color, everything else is calculated
const BASE_PRIMARY_COLOR = '#10b981';

// Default tenant colors object that matches the teachers table structure
export const DEFAULT_TENANT_COLORS = {
  primary: '#10b981', // Emerald green as default
  secondary: '#12A594',    // Will be auto-calculated from primary
  accent: '#06B6D4',       // Will be auto-calculated from primary
};

/**
 * Dynamic color system for the application
 * All colors are calculated from the primary color to ensure consistency
 * and enable easy tenant customization by changing just the primary color
 */
export const colorSystem = {
  // Primary brand colors (calculated from base)
  primary: {
    main: BASE_PRIMARY_COLOR,
    light: lighter(BASE_PRIMARY_COLOR, 0.2),
    dark: darker(BASE_PRIMARY_COLOR, 0.2),
    hsl: hexToHsl(BASE_PRIMARY_COLOR),
  },
  
  // Secondary brand colors (dynamically calculated from primary)
  secondary: {
    main: generateColorScheme(BASE_PRIMARY_COLOR).secondary,
    light: generateColorScheme(BASE_PRIMARY_COLOR).secondaryLight,
    dark: generateColorScheme(BASE_PRIMARY_COLOR).secondaryDark,
    hsl: hexToHsl(generateColorScheme(BASE_PRIMARY_COLOR).secondary),
  },
  
  // Accent colors (dynamically calculated from primary)
  accent: {
    main: generateColorScheme(BASE_PRIMARY_COLOR).accent,
    light: generateColorScheme(BASE_PRIMARY_COLOR).accentLight,
    dark: generateColorScheme(BASE_PRIMARY_COLOR).accentDark,
    hsl: hexToHsl(generateColorScheme(BASE_PRIMARY_COLOR).accent),
  },
  
  // Neutral colors (dynamically calculated with primary tint)
  neutral: generateNeutralColors(BASE_PRIMARY_COLOR),
  
  // Semantic colors (calculated with primary influence)
  semantic: generateSemanticColors(BASE_PRIMARY_COLOR),
  
  // Icon colors (calculated from semantic colors)
  icon: {
    success: generateSemanticColors(BASE_PRIMARY_COLOR).success,
    warning: generateSemanticColors(BASE_PRIMARY_COLOR).warning,
    error: generateSemanticColors(BASE_PRIMARY_COLOR).error,
    info: generateSemanticColors(BASE_PRIMARY_COLOR).info,
    primary: BASE_PRIMARY_COLOR,
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
      ring: BASE_PRIMARY_COLOR,
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
      ring: BASE_PRIMARY_COLOR,
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
      dark: 'linear-gradient(180deg, var(--background) 0%, rgba(0, 0, 0, 0.1) 100%)',
    },
    premium: {
      light: 'linear-gradient(120deg, rgba(16, 185, 129, 0.1) 60%, var(--neutral-50) 100%)',
      dark: 'linear-gradient(120deg, var(--background) 0%, rgba(0, 0, 0, 0.05) 100%)',
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
    let result: unknown = colorSystem;
    
    for (const part of parts) {
      if (typeof result === 'object' && result !== null && part in result) {
        result = (result as Record<string, unknown>)[part];
      } else {
        return null;
      }
    }
    
    return typeof result === 'object' ? (result as Record<string, unknown>)[theme] : result;
  },
  
  getCssVar: (name: string) => `var(--${name})`,
  
  // For backward compatibility (deprecated - use semantic colors instead)
  designOptions: {
    primary: BASE_PRIMARY_COLOR,
    secondary: generateColorScheme(BASE_PRIMARY_COLOR).secondary,
    accent: generateColorScheme(BASE_PRIMARY_COLOR).accent,
    textPrimary: '#171717',
    textSecondary: '#a3a3a3',
    background: '#f8fafc',
    cardBackground: '#ffffff',
    error: generateSemanticColors(BASE_PRIMARY_COLOR).error,
    success: generateSemanticColors(BASE_PRIMARY_COLOR).success,
    warning: generateSemanticColors(BASE_PRIMARY_COLOR).warning,
  },
};

// For backward compatibility
export const designOptions = colorSystem.designOptions;

// CSS Variables generator for tenant customization
export const generateCssVariables = (tenantColors?: {
  primary?: string;
  secondary?: string | null;
  accent?: string | null;
}, theme: 'light' | 'dark' = 'light') => {
  // Use tenant colors or fall back to defaults
  const colors = {
    primary: tenantColors?.primary || DEFAULT_TENANT_COLORS.primary,
    secondary: tenantColors?.secondary || DEFAULT_TENANT_COLORS.secondary,
    accent: tenantColors?.accent || DEFAULT_TENANT_COLORS.accent,
  };
  
  // Generate full color palette from primary color
  const primaryPalette = generateColorPalette(colors.primary);
  const neutralColors = theme === 'dark' ? generateTrueNeutralColors() : generateNeutralColors(colors.primary);
  const semanticColors = generateSemanticColors(colors.primary);
  
  // Generate secondary and accent palettes
  const secondaryPalette = generateColorPalette(colors.secondary);
  const accentPalette = generateColorPalette(colors.accent);
  
  // Dynamically calculate theme colors based on primary color
  const primaryHsl = hexToHsl(colors.primary);
  
  // Calculate border and input colors based on primary color
  // For light theme: use primary hue with low saturation and high lightness
  // For dark theme: use primary hue with low saturation and low lightness
  const borderHue = primaryHsl.h;
  const borderSaturation = Math.min(primaryHsl.s, 15); // Keep saturation low for borders
  
  // Debug logging
  console.log('Color generation debug:', {
    primaryColor: colors.primary,
    primaryHsl,
    borderHue,
    borderSaturation,
    theme,
    hasSecondary: !!colors.secondary,
    hasAccent: !!colors.accent
  });
  
  const themeColors = theme === 'dark' ? {
    // Dark theme: true neutral colors (no hue tint) for backgrounds
    '--background': '0 0% 0%',  // Pure black
    '--foreground': '0 0% 100%',
    '--card': '0 0% 3%',        // Very dark gray (almost black)
    '--card-foreground': '0 0% 100%',
    '--popover': '0 0% 3%',     // Very dark gray (almost black)
    '--popover-foreground': '0 0% 100%',
    '--muted': '0 0% 3%',       // Very dark gray (almost black)
    '--muted-foreground': '0 0% 69%',
    '--border': '0 0% 12%',     // Dark gray
    '--input': '0 0% 12%',      // Dark gray
    '--ring': `${borderHue} ${borderSaturation}% 60%`,
    '--sidebar-background': '0 0% 3%', // Very dark gray (almost black)
    '--sidebar-foreground': '0 0% 100%',
    '--sidebar-border': '0 0% 12%',    // Dark gray
  } : {
    // Light theme: lighter colors with primary tint
    '--background': `${primaryHsl.h} ${Math.min(primaryHsl.s, 5)}% 100%`,
    '--foreground': '0 0% 0%',
    '--card': `${primaryHsl.h} ${Math.min(primaryHsl.s, 5)}% 100%`,
    '--card-foreground': '0 0% 0%',
    '--popover': `${primaryHsl.h} ${Math.min(primaryHsl.s, 5)}% 100%`,
    '--popover-foreground': '0 0% 0%',
    '--muted': `${primaryHsl.h} ${Math.min(primaryHsl.s, 10)}% 96%`,
    '--muted-foreground': `${primaryHsl.h} ${Math.min(primaryHsl.s, 15)}% 47%`,
    '--border': `${borderHue} ${borderSaturation}% 91%`,
    '--input': `${borderHue} ${borderSaturation}% 91%`,
    '--ring': `${borderHue} ${borderSaturation}% 60%`,
    '--sidebar-background': `${primaryHsl.h} ${Math.min(primaryHsl.s, 5)}% 98%`,
    '--sidebar-foreground': '0 0% 0%',
    '--sidebar-border': `${borderHue} ${borderSaturation}% 91%`,
  };
  
  return {
    ...primaryPalette,
    // Secondary colors with full numeric scale
    '--secondary': colors.secondary,
    ...Object.entries(secondaryPalette).reduce((acc, [key, value]) => {
      // Rename keys to match secondary scale (e.g., --primary-50 -> --secondary-50)
      const newKey = key.replace('--primary', '--secondary');
      acc[newKey] = value;
      return acc;
    }, {} as Record<string, string>),
    // Accent colors with full numeric scale
    '--accent': colors.accent,
    ...Object.entries(accentPalette).reduce((acc, [key, value]) => {
      // Rename keys to match accent scale (e.g., --primary-50 -> --accent-50)
      const newKey = key.replace('--primary', '--accent');
      acc[newKey] = value;
      return acc;
    }, {} as Record<string, string>),
    // Add neutral colors
    ...Object.entries(neutralColors).reduce((acc, [key, value]) => {
      acc[`--neutral-${key}`] = value;
      return acc;
    }, {} as Record<string, string>),
    // Add semantic colors
    '--success': semanticColors.success,
    '--warning': semanticColors.warning,
    '--error': semanticColors.error,
    '--info': semanticColors.info,
    
    // Add theme-specific UI colors
    ...themeColors,
    
    // Common colors for both themes
    '--primary-foreground': '0 0% 100%',
    '--secondary-foreground': '0 0% 100%',
    '--accent-foreground': theme === 'dark' ? '0 0% 100%' : '0 0% 0%',
    '--destructive': '12 98% 60%',
    '--destructive-foreground': '0 0% 100%',
    '--radius': '1.25rem',
    
    // Sidebar colors
    '--sidebar-primary': colors.primary,
    '--sidebar-primary-foreground': '0 0% 100%',
    '--sidebar-accent': colors.primary,
    '--sidebar-accent-foreground': '0 0% 100%',
    '--sidebar-ring': colors.primary,
  };
};

// Function to get all colors as a flat object for easy access
export const getAllColors = () => {
  const scheme = generateColorScheme(BASE_PRIMARY_COLOR);
  const neutralColors = generateTrueNeutralColors(); // Always use true neutral colors
  const semanticColors = generateSemanticColors(BASE_PRIMARY_COLOR);
  
  return {
    // Primary colors
    primary: scheme.primary,
    'primary-light': scheme.primaryLight,
    'primary-dark': scheme.primaryDark,
    
    // Secondary colors
    secondary: scheme.secondary,
    'secondary-light': scheme.secondaryLight,
    'secondary-dark': scheme.secondaryDark,
    
    // Accent colors
    accent: scheme.accent,
    'accent-light': scheme.accentLight,
    'accent-dark': scheme.accentDark,
    
    // Neutral colors
    ...neutralColors,
    
    // Semantic colors
    ...semanticColors,
  };
};

// Image Upload Buckets
export const IMAGE_UPLOAD_BUCKETS = {
  LECTURES_THUMBNAILS: 'lectures_thumbnails',
  CHAPTERS_THUMBNAILS: 'chapters_thumbnails',
  GROUPS_THUMBNAILS: 'groups_thumbnails',
  QUIZ_QUESTIONS: 'quiz_questions',
  TEACHERS_IMAGES: 'teachers_images',
} as const;

export type ImageBucketType = typeof IMAGE_UPLOAD_BUCKETS[keyof typeof IMAGE_UPLOAD_BUCKETS];

// Image upload configuration
export const IMAGE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  COMPRESSION_QUALITY: 0.8,
  THUMBNAIL_SIZE: 300,
  PREVIEW_SIZE: 800,
} as const;
