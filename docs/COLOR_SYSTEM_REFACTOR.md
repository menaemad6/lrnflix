# Color System Refactor Documentation

## Overview

This document describes the comprehensive refactor of the color system in the LRNFLIX application. The new system centralizes all colors, reduces redundancy through calculated variants, and enables tenant customization.

## Key Benefits

1. **Centralized Colors**: All colors are defined in one place (`src/data/constants.ts`)
2. **Reduced Redundancy**: Color variants are calculated from primary colors instead of hardcoded
3. **Tenant Customization**: Different tenants can have different color schemes
4. **No Hardcoded Colors**: All CSS and config files use CSS variables
5. **Automatic Variants**: Light/dark variants are automatically generated
6. **Type Safety**: Full TypeScript support for color management

## Architecture

### 1. Color Constants (`src/data/constants.ts`)

The central source of truth for all colors in the application.

```typescript
export const colorSystem = {
  // Primary brand colors (tenant-customizable)
  primary: {
    main: '#10b981',
    light: lighter('#10b981', 0.2),    // Calculated
    dark: darker('#10b981', 0.2),      // Calculated
    hsl: hexToHsl('#10b981'),          // Calculated
  },
  
  // Secondary and accent colors
  secondary: { /* ... */ },
  accent: { /* ... */ },
  
  // Semantic colors
  semantic: {
    success: '#22c55e',
    warning: '#f97316',
    error: '#ef4444',
    info: '#3b82f6',
  },
  
  // Theme-aware colors
  theme: {
    light: { /* ... */ },
    dark: { /* ... */ },
  },
  
  // Gradients and effects
  gradients: { /* ... */ },
  effects: { /* ... */ },
};
```

### 2. Color Utilities (`src/utils/colorUtils.ts`)

Mathematical functions for color manipulation and generation.

```typescript
// Make colors lighter/darker
lighter(color: string, amount: number = 0.2): string
darker(color: string, amount: number = 0.2): string

// Color conversions
hexToHsl(hex: string): { h: number; s: number; l: number }
hslToHex(h: number, s: number, l: number): string

// Generate color palettes
generateColorPalette(primary: string): Record<string, string>

// Color theory functions
complementary(color: string): string
analogous(color: string, direction: 'left' | 'right'): string
triadic(color: string, variant: 1 | 2): string
```

### 3. CSS Variables (`src/index.css`)

All colors are now CSS variables that can be dynamically changed.

```css
:root {
  /* Primary colors */
  --primary: 152 72% 47%;
  --primary-light: 152 72% 57%;
  --primary-dark: 152 72% 37%;
  
  /* Secondary colors */
  --secondary: 173 80% 36%;
  --secondary-light: 173 80% 46%;
  --secondary-dark: 173 80% 26%;
  
  /* Neutral scale */
  --neutral-50: 210 40% 98%;
  --neutral-100: 210 40% 96%;
  /* ... more neutral variants */
  
  /* Semantic colors */
  --success: 142 76% 36%;
  --warning: 25 95% 53%;
  --error: 0 84% 60%;
  --info: 217 91% 60%;
}
```

### 4. Tailwind Integration (`tailwind.config.ts`)

Tailwind now uses CSS variables instead of hardcoded colors.

```typescript
colors: {
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))',
    light: 'hsl(var(--primary-light))',
    dark: 'hsl(var(--primary-dark))',
  },
  secondary: { /* ... */ },
  accent: { /* ... */ },
  neutral: {
    50: 'hsl(var(--neutral-50))',
    100: 'hsl(var(--neutral-100))',
    /* ... more variants */
  },
}
```

## Tenant Customization

### 1. Tenant Context (`src/contexts/TenantContext.tsx`)

The context now includes color customization capabilities.

```typescript
export interface TenantColors {
  primary?: string;
  secondary?: string;
  accent?: string;
}

export interface TenantInfo {
  slug: string;
  teacher?: Teacher | null;
  loading: boolean;
  colors?: TenantColors;
}
```

### 2. CSS Variable Generation

Colors are dynamically applied to CSS variables for immediate customization.

```typescript
export const generateCssVariables = (tenantColors?: TenantColors) => {
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
    // ... more variants
  };
};
```

### 3. Color Picker Component (`src/components/settings/TenantColorPicker.tsx`)

A UI component for tenants to customize their colors in real-time.

## Usage Examples

### 1. Using Colors in Components

```typescript
// Before (hardcoded)
<div className="bg-emerald-500 text-emerald-100">
  Content
</div>

// After (using CSS variables)
<div className="bg-primary text-primary-100">
  Content
</div>
```

### 2. Dynamic Color Application

```typescript
import { useTenant } from '@/contexts/TenantContext';

const MyComponent = () => {
  const { colors } = useTenant();
  
  return (
    <div style={{ backgroundColor: colors?.primary }}>
      Dynamic color from tenant
    </div>
  );
};
```

### 3. Custom Color Generation

```typescript
import { generateColorPalette, lighter, darker } from '@/utils/colorUtils';

const customColor = '#ff6b6b';
const palette = generateColorPalette(customColor);
const lighterVariant = lighter(customColor, 0.3);
const darkerVariant = darker(customColor, 0.3);
```

## Migration Guide

### 1. Replace Hardcoded Colors

```typescript
// Old
className="bg-emerald-500 hover:bg-emerald-600 text-emerald-100"

// New
className="bg-primary hover:bg-primary-dark text-primary-100"
```

### 2. Update CSS Classes

```css
/* Old */
.glow {
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
}

/* New */
.glow {
  box-shadow: 0 0 20px hsl(var(--primary) / 0.3);
}
```

### 3. Update Tailwind Classes

```typescript
// Old
className="from-emerald-500 to-teal-500"

// New
className="from-primary to-secondary"
```

## Database Integration

To enable persistent tenant color storage, you'll need to:

1. **Add colors column to teachers table**:
```sql
ALTER TABLE teachers ADD COLUMN colors JSONB DEFAULT '{}';
```

2. **Update types**:
```typescript
// In src/integrations/supabase/types.ts
teachers: {
  Row: {
    // ... existing fields
    colors?: Json | null
  }
}
```

3. **Fetch colors from database**:
```typescript
// In TenantContext
const { data: teacherData } = await supabase
  .from('teachers')
  .select('colors')
  .eq('slug', slug)
  .single();

const tenantColors = teacherData?.colors as TenantColors;
```

## Best Practices

1. **Always use CSS variables** instead of hardcoded colors
2. **Use semantic color names** (primary, secondary, accent) instead of specific colors
3. **Leverage the color utilities** for dynamic color generation
4. **Test color changes** in both light and dark themes
5. **Ensure sufficient contrast** when customizing colors
6. **Use the color picker component** for testing tenant customization

## Theme Color Customization Guide

### Primary Colors to Change for Theme Customization

To change the theme color of your application, you need to modify these **3 key colors** in the `src/data/constants.ts` file:

#### 1. **Primary Color** (Main Brand Color)
```typescript
// In src/data/constants.ts - Line 22
primary: {
  main: '#10b981', // ← CHANGE THIS COLOR
  // All other primary variants are automatically calculated
  light: lighter('#10b981', 0.2),    // 20% lighter
  dark: darker('#10b981', 0.2),      // 20% darker
  hsl: hexToHsl('#10b981'),          // HSL conversion
},
```

#### 2. **Secondary Color** (Complementary/Supporting Color)
```typescript
// In src/data/constants.ts - Line 30
secondary: {
  main: '#14b8a6', // ← CHANGE THIS COLOR
  // All other secondary variants are automatically calculated
  light: lighter('#14b8a6', 0.2),
  dark: darker('#14b8a6', 0.2),
  hsl: hexToHsl('#14b8a6'),
},
```

#### 3. **Accent Color** (Highlight/Interactive Color)
```typescript
// In src/data/constants.ts - Line 38
accent: {
  main: '#06b6d4', // ← CHANGE THIS COLOR
  // All other accent variants are automatically calculated
  light: lighter('#06b6d4', 0.2),
  dark: darker('#06b6d4', 0.2),
  hsl: hexToHsl('#06b6d4'),
},
```

### What Happens When You Change These Colors

1. **Automatic Variant Generation**: Light and dark variants are automatically calculated
2. **CSS Variables Update**: All CSS variables are regenerated with new colors
3. **Tailwind Integration**: Tailwind classes automatically use the new colors
4. **Gradients Update**: All gradients using these colors are updated
5. **Effects Update**: Glows, shadows, and other effects use the new colors

### Example: Changing to a Blue Theme

```typescript
// Change from green theme to blue theme
primary: {
  main: '#3b82f6', // Blue instead of green
  // ... rest is automatic
},
secondary: {
  main: '#1d4ed8', // Darker blue
  // ... rest is automatic
},
accent: {
  main: '#06b6d4', // Keep cyan or change to blue variant
  // ... rest is automatic
},
```

### Example: Changing to a Purple Theme

```typescript
// Change to purple theme
primary: {
  main: '#8b5cf6', // Purple
  // ... rest is automatic
},
secondary: {
  main: '#7c3aed', // Darker purple
  // ... rest is automatic
},
accent: {
  main: '#ec4899', // Pink accent
  // ... rest is automatic
},
```

### Colors You DON'T Need to Change

These colors are **semantic** and should remain consistent across themes:

```typescript
// Keep these unchanged for consistency
semantic: {
  success: '#22c55e',    // Green (success)
  warning: '#f97316',    // Orange (warning)
  error: '#ef4444',      // Red (error)
  info: '#3b82f6',       // Blue (info)
},

// Neutral colors are also calculated from primary
neutral: {
  50: '#f8fafc',   // Very light with primary tint
  100: '#f1f5f9',  // Light with primary tint
  // ... etc
},
```

### How to Apply Theme Changes

#### Method 1: Direct File Edit (Recommended for Development)
1. Edit `src/data/constants.ts`
2. Change the 3 main colors (primary, secondary, accent)
3. Restart your development server
4. All colors will automatically update

#### Method 2: Tenant Context (For Production)
1. Use the `TenantContext` to set custom colors
2. Colors are applied dynamically via CSS variables
3. No server restart needed

#### Method 3: CSS Variables Override
```css
/* Override in your CSS */
:root {
  --primary: 220 100% 50%; /* Blue */
  --secondary: 220 100% 40%; /* Darker blue */
  --accent: 220 100% 60%; /* Lighter blue */
}
```

### Testing Your Theme Changes

1. **Visual Check**: Look for primary color usage throughout the app
2. **CSS Variables**: Check browser dev tools for updated CSS variables
3. **Tailwind Classes**: Verify `bg-primary`, `text-primary`, etc. work
4. **Gradients**: Check that gradients use the new colors
5. **Effects**: Verify glows and shadows use new primary color

### Common Theme Color Combinations

#### Professional Blue Theme
```typescript
primary: '#3b82f6',    // Blue
secondary: '#1d4ed8',  // Dark blue
accent: '#06b6d4',     // Cyan
```

#### Warm Orange Theme
```typescript
primary: '#f97316',    // Orange
secondary: '#ea580c',  // Dark orange
accent: '#f59e0b',     // Amber
```

#### Elegant Purple Theme
```typescript
primary: '#8b5cf6',    // Purple
secondary: '#7c3aed',  // Dark purple
accent: '#ec4899',     // Pink
```

#### Nature Green Theme (Current)
```typescript
primary: '#10b981',    // Emerald
secondary: '#14b8a6',  // Teal
accent: '#06b6d4',     // Cyan
```

## Future Enhancements

1. **Color Presets**: Pre-defined color schemes for common use cases
2. **Accessibility Tools**: Automatic contrast checking and suggestions
3. **Color Analytics**: Track which colors are most popular among tenants
4. **Advanced Color Theory**: More sophisticated color relationship algorithms
5. **Export/Import**: Allow tenants to share color schemes

## Troubleshooting

### Common Issues

1. **Colors not updating**: Ensure CSS variables are being set on `:root`
2. **Tailwind not recognizing colors**: Check that Tailwind config uses CSS variables
3. **Type errors**: Verify color utility function imports
4. **Performance issues**: Limit color calculations to necessary variants

### Debug Tools

1. **Browser DevTools**: Inspect CSS variables in the Elements panel
2. **Color Picker Component**: Use for real-time color testing
3. **Console Logging**: Log generated CSS variables for debugging

## Conclusion

The new color system provides a robust, maintainable, and customizable foundation for the LRNFLIX application. By centralizing colors and using calculated variants, we've eliminated redundancy while enabling powerful tenant customization features.

The system is designed to be extensible, so future enhancements like color presets, accessibility tools, and advanced color theory can be easily integrated.
