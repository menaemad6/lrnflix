/**
 * CSS Variable Injector
 * Dynamically injects CSS variables from the color system into the document
 * This replaces hardcoded CSS variables with dynamically calculated ones
 */

import { generateCssVariables } from '@/data/constants';
import { DEFAULT_TENANT_COLORS } from '@/data/constants';

/**
 * Converts a hex color to HSL format for CSS variables
 * @param hex - Hex color string (e.g., '#10b981')
 * @returns HSL string for CSS (e.g., '152 72% 47%')
 */
function hexToHslString(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse hex values
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Injects CSS variables into the document root
 * @param tenantColors - Optional tenant-specific colors
 */
export function injectCssVariables(tenantColors?: {
  primary?: string;
  secondary?: string | null;
  accent?: string | null;
}) {
  // Detect current theme
  const isDark = document.documentElement.classList.contains('dark');
  const theme = isDark ? 'dark' : 'light';
  
  const cssVariables = generateCssVariables(tenantColors, theme);
  const root = document.documentElement;
  
  // Set all CSS variables
  Object.entries(cssVariables).forEach(([key, value]) => {
    if (value.startsWith('#')) {
      // Convert hex to HSL string
      root.style.setProperty(key, hexToHslString(value));
    } else {
      // Already in correct format (e.g., HSL string like "214.3 31.8% 91.4%")
      root.style.setProperty(key, value);
    }
  });

  // Log the injection for debugging
  console.log('CSS Variables injected:', Object.keys(cssVariables).length, 'variables for', theme, 'theme');
  console.log('Sample variables:', {
    '--border': cssVariables['--border'],
    '--input': cssVariables['--input'],
    '--ring': cssVariables['--ring'],
    '--card': cssVariables['--card'],
    '--background': cssVariables['--background'],
    '--primary': cssVariables['--primary'],
  });
  
  // Verify that the variables were actually set
  setTimeout(() => {
    const computedBorder = getComputedStyle(root).getPropertyValue('--border').trim();
    const computedInput = getComputedStyle(root).getPropertyValue('--input').trim();
    const computedRing = getComputedStyle(root).getPropertyValue('--ring').trim();
    const computedCard = getComputedStyle(root).getPropertyValue('--card').trim();
    
    console.log('CSS Variables verification:', {
      '--border': computedBorder,
      '--input': computedInput,
      '--ring': computedRing,
      '--card': computedCard,
      'Expected border': cssVariables['--border'],
      'Expected input': cssVariables['--input'],
      'Expected ring': cssVariables['--ring'],
      'Expected card': cssVariables['--card'],
    });
  }, 100);
}

/**
 * Injects CSS variables on app initialization
 * This should be called early in the app lifecycle
 */
export function initializeCssVariables() {
  // Check if we have tenant colors stored (e.g., from previous session)
  const storedColors = localStorage.getItem('tenantColors');
  let tenantColors;
  
  if (storedColors) {
    try {
      tenantColors = JSON.parse(storedColors);
    } catch (e) {
      console.warn('Failed to parse stored tenant colors:', e);
    }
  }
  
  // If no stored colors, use defaults
  if (!tenantColors) {
    tenantColors = DEFAULT_TENANT_COLORS;
  }
  
  // Inject colors (with tenant colors or defaults)
  injectCssVariables(tenantColors);
  
  // Listen for theme changes if needed
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const target = mutation.target as HTMLElement;
        if (target.classList.contains('dark') || target.classList.contains('light')) {
          // Re-inject variables when theme changes
          console.log('Theme changed, re-injecting CSS variables');
          injectCssVariables(tenantColors);
        }
      }
    });
  });
  
  // Observe the html element for class changes
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
}

/**
 * Updates CSS variables with new tenant colors
 * @param tenantColors - New tenant colors
 */
export function updateTenantColors(tenantColors: {
  primary: string;
  secondary?: string | null;
  accent?: string | null;
}) {
  // Filter out null values for the color generation, but keep the structure
  const filteredColors = {
    primary: tenantColors.primary,
    ...(tenantColors.secondary && { secondary: tenantColors.secondary }),
    ...(tenantColors.accent && { accent: tenantColors.accent }),
  };

  // Store colors in localStorage for persistence
  try {
    localStorage.setItem('tenantColors', JSON.stringify(filteredColors));
  } catch (e) {
    console.warn('Failed to store tenant colors in localStorage:', e);
  }

  // Re-inject variables with current theme
  injectCssVariables(filteredColors);
}

/**
 * Gets the current CSS variable value
 * @param name - CSS variable name without -- prefix
 * @returns Current value of the CSS variable
 */
export function getCssVariable(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
}

/**
 * Sets a single CSS variable
 * @param name - CSS variable name without -- prefix
 * @param value - Value to set
 */
export function setCssVariable(name: string, value: string) {
  document.documentElement.style.setProperty(`--${name}`, value);
}

/**
 * Gets all current CSS variables as an object
 * @returns Object with all CSS variable names and values
 */
export function getAllCssVariables(): Record<string, string> {
  const variables: Record<string, string> = {};
  const computedStyle = getComputedStyle(document.documentElement);
  
  // Get all CSS custom properties
  for (let i = 0; i < computedStyle.length; i++) {
    const property = computedStyle[i];
    if (property.startsWith('--')) {
      variables[property] = computedStyle.getPropertyValue(property).trim();
    }
  }
  
  return variables;
}
