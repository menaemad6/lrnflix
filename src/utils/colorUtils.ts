/**
 * Color utility functions for calculating color variants and conversions
 * This enables dynamic color generation from primary colors for tenant customization
 */

// Convert hex color to HSL
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
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
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

// Convert HSL to hex
export function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Make a color lighter
export function lighter(color: string, amount: number = 0.2): string {
  const hsl = hexToHsl(color);
  const newL = Math.min(100, hsl.l + (hsl.l * amount));
  return hslToHex(hsl.h, hsl.s, newL);
}

// Make a color darker
export function darker(color: string, amount: number = 0.2): string {
  const hsl = hexToHsl(color);
  const newL = Math.max(0, hsl.l - (hsl.l * amount));
  return hslToHex(hsl.h, hsl.s, newL);
}

// Adjust color saturation
export function adjustSaturation(color: string, amount: number = 0): string {
  const hsl = hexToHsl(color);
  const newS = Math.max(0, Math.min(100, hsl.s + amount));
  return hslToHex(hsl.h, newS, hsl.l);
}

// Adjust color hue
export function adjustHue(color: string, amount: number = 0): string {
  const hsl = hexToHsl(color);
  const newH = (hsl.h + amount) % 360;
  return hslToHex(newH < 0 ? newH + 360 : newH, hsl.s, hsl.l);
}

// Generate a complementary color
export function complementary(color: string): string {
  const hsl = hexToHsl(color);
  const newH = (hsl.h + 180) % 360;
  return hslToHex(newH, hsl.s, hsl.l);
}

// Generate an analogous color (30 degrees apart)
export function analogous(color: string, direction: 'left' | 'right' = 'right'): string {
  const hsl = hexToHsl(color);
  const offset = direction === 'right' ? 30 : -30;
  const newH = (hsl.h + offset + 360) % 360;
  return hslToHex(newH, hsl.s, hsl.l);
}

// Generate a triadic color (120 degrees apart)
export function triadic(color: string, variant: 1 | 2 = 1): string {
  const hsl = hexToHsl(color);
  const offset = variant === 1 ? 120 : 240;
  const newH = (hsl.h + offset) % 360;
  return hslToHex(newH, hsl.s, hsl.l);
}

// Generate a split-complementary color scheme
export function splitComplementary(color: string): [string, string] {
  const hsl = hexToHsl(color);
  const left = (hsl.h + 150) % 360;
  const right = (hsl.h + 210) % 360;
  return [
    hslToHex(left, hsl.s, hsl.l),
    hslToHex(right, hsl.s, hsl.l)
  ];
}

// Generate a monochromatic color scheme
export function monochromatic(color: string, count: number = 5): string[] {
  const hsl = hexToHsl(color);
  const colors: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const lightness = Math.max(10, Math.min(90, hsl.l + (i - Math.floor(count / 2)) * 15));
    colors.push(hslToHex(hsl.h, hsl.s, lightness));
  }
  
  return colors;
}

// Check if a color is light or dark
export function isLight(color: string): boolean {
  const hsl = hexToHsl(color);
  return hsl.l > 50;
}

// Get contrast ratio between two colors
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string) => {
    const rgb = hexToRgb(color);
    const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

// Convert hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

// Convert RGB to hex
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.round(c).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Generate CSS custom properties for a color palette
export function generateColorPalette(primary: string): Record<string, string> {
  return {
    '--primary': primary,
    '--primary-light': lighter(primary, 0.2),
    '--primary-dark': darker(primary, 0.2),
    '--primary-lighter': lighter(primary, 0.4),
    '--primary-darker': darker(primary, 0.4),
    '--primary-50': lighter(primary, 0.9),
    '--primary-100': lighter(primary, 0.8),
    '--primary-200': lighter(primary, 0.6),
    '--primary-300': lighter(primary, 0.4),
    '--primary-400': lighter(primary, 0.2),
    '--primary-500': primary,
    '--primary-600': darker(primary, 0.2),
    '--primary-700': darker(primary, 0.4),
    '--primary-800': darker(primary, 0.6),
    '--primary-900': darker(primary, 0.8),
  };
}
