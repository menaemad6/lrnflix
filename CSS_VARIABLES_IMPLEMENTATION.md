# CSS Variables Implementation Guide

This guide shows how to update the `index.css` file to use the new centralized color system.

## Updating CSS Variables in index.css

Replace the current CSS variables in `index.css` with references to the color system. Here's how the updated file would look:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Light theme variables - using colorSystem.semantic.*.hsl.light values */
    --background: 0 0% 100%; /* colorSystem.semantic.background.hsl.light */
    --foreground: 222.2 84% 4.9%; /* colorSystem.semantic.foreground.hsl.light */
    --text-secondary: 0 0% 64%; /* colorSystem.semantic.text.secondary.hsl.light */

    --card: 0 0% 100%; /* colorSystem.semantic.card.background.hsl.light */
    --card-foreground: 222.2 84% 4.9%; /* colorSystem.semantic.card.foreground.hsl.light */

    --popover: 0 0% 100%; /* colorSystem.semantic.card.background.hsl.light */
    --popover-foreground: 222.2 84% 4.9%; /* colorSystem.semantic.card.foreground.hsl.light */

    --primary: 152 72% 47%; /* colorSystem.semantic.primary.hsl.light */
    --primary-foreground: 222.2 84% 4.9%; /* colorSystem.semantic.foreground.hsl.light */

    --secondary: 0 0% 64%; /* colorSystem.semantic.secondary.hsl.light */
    --secondary-foreground: 222.2 84% 4.9%; /* colorSystem.semantic.foreground.hsl.light */

    --muted: 210 40% 96%; /* colorSystem.semantic.muted.background.hsl.light */
    --muted-foreground: 215.4 16.3% 46.9%; /* colorSystem.semantic.muted.foreground.hsl.light */

    --accent: 152 72% 47%; /* colorSystem.semantic.accent.hsl.light */
    --accent-foreground: 222.2 84% 4.9%; /* colorSystem.semantic.foreground.hsl.light */

    --destructive: 12 98% 60%; /* colorSystem.semantic.destructive.hsl.light */
    --destructive-foreground: 0 0% 100%; /* white */

    --border: 214.3 31.8% 91.4%; /* colorSystem.semantic.border.hsl.light */
    --input: 214.3 31.8% 91.4%; /* colorSystem.semantic.input.hsl.light */
    --ring: 152 72% 47%; /* colorSystem.semantic.ring.hsl.light */

    --radius: 1.25rem;

    --sidebar-background: 0 0% 98%; /* colorSystem.sidebar.background.hsl.light */
    --sidebar-foreground: 222.2 84% 4.9%; /* colorSystem.sidebar.foreground.hsl.light */
    --sidebar-primary: 152 72% 47%; /* colorSystem.sidebar.primary.hsl.light */
    --sidebar-primary-foreground: 222.2 84% 4.9%; /* colorSystem.sidebar.foreground.hsl.light */
    --sidebar-accent: 152 72% 47%; /* colorSystem.sidebar.accent.hsl.light */
    --sidebar-accent-foreground: 222.2 84% 4.9%; /* colorSystem.sidebar.foreground.hsl.light */
    --sidebar-border: 214.3 31.8% 91.4%; /* colorSystem.sidebar.border.hsl.light */
    --sidebar-ring: 152 72% 47%; /* colorSystem.sidebar.ring.hsl.light */

    /* Gradients - using colorSystem.gradients.*.light values */
    --gradient-mint: linear-gradient(90deg, #34d399 0%, #10b981 100%); /* colorSystem.gradients.mint.light */
    --gradient-nav: linear-gradient(90deg, #34d399 0%, #10b981 100%); /* colorSystem.gradients.nav.light */
    --gradient-bg: linear-gradient(180deg, #f8fafc 0%, #e0f7ef 100%); /* colorSystem.gradients.bg.light */
    --vignette: radial-gradient(ellipse at center, rgba(220, 240, 230, 0.2) 0%, rgba(255,255,255,1) 100%); /* colorSystem.gradients.vignette.light */

    /* Icon colors - using colorSystem.semantic.icon.*.light values */
    --icon-orange: #ffb86b; /* colorSystem.semantic.icon.orange.light */
    --icon-purple: #a78bfa; /* colorSystem.semantic.icon.purple.light */
    --icon-blue: #60a5fa; /* colorSystem.semantic.icon.blue.light */
    --icon-green: #10b981; /* colorSystem.semantic.icon.green.light */
  }

  .dark {
    /* Dark theme variables - using colorSystem.semantic.*.hsl.dark values */
    --background: 168 16% 6%; /* colorSystem.semantic.background.hsl.dark */
    --foreground: 0 0% 100%; /* colorSystem.semantic.foreground.hsl.dark */
    --text-secondary: 0 0% 69%; /* colorSystem.semantic.text.secondary.hsl.dark */

    --card: 168 16% 8%; /* colorSystem.semantic.card.background.hsl.dark */
    --card-foreground: 0 0% 100%; /* colorSystem.semantic.card.foreground.hsl.dark */

    --popover: 168 16% 8%; /* colorSystem.semantic.card.background.hsl.dark */
    --popover-foreground: 0 0% 100%; /* colorSystem.semantic.card.foreground.hsl.dark */

    --primary: 152 72% 47%; /* colorSystem.semantic.primary.hsl.dark */
    --primary-foreground: 168 16% 6%; /* colorSystem.semantic.background.hsl.dark */

    --secondary: 0 0% 69%; /* colorSystem.semantic.secondary.hsl.dark */
    --secondary-foreground: 0 0% 100%; /* colorSystem.semantic.foreground.hsl.dark */

    --muted: 168 16% 12%; /* colorSystem.semantic.muted.background.hsl.dark */
    --muted-foreground: 0 0% 69%; /* colorSystem.semantic.muted.foreground.hsl.dark */

    --accent: 152 72% 47%; /* colorSystem.semantic.accent.hsl.dark */
    --accent-foreground: 168 16% 6%; /* colorSystem.semantic.background.hsl.dark */

    --destructive: 12 98% 60%; /* colorSystem.semantic.destructive.hsl.dark */
    --destructive-foreground: 0 0% 100%; /* white */

    --border: 168 16% 16%; /* colorSystem.semantic.border.hsl.dark */
    --input: 168 16% 16%; /* colorSystem.semantic.input.hsl.dark */
    --ring: 152 72% 47%; /* colorSystem.semantic.ring.hsl.dark */

    --radius: 1.25rem;

    --sidebar-background: 168 16% 8%; /* colorSystem.sidebar.background.hsl.dark */
    --sidebar-foreground: 0 0% 100%; /* colorSystem.sidebar.foreground.hsl.dark */
    --sidebar-primary: 152 72% 47%; /* colorSystem.sidebar.primary.hsl.dark */
    --sidebar-primary-foreground: 168 16% 6%; /* colorSystem.sidebar.background.hsl.dark */
    --sidebar-accent: 152 72% 47%; /* colorSystem.sidebar.accent.hsl.dark */
    --sidebar-accent-foreground: 168 16% 6%; /* colorSystem.sidebar.background.hsl.dark */
    --sidebar-border: 168 16% 16%; /* colorSystem.sidebar.border.hsl.dark */
    --sidebar-ring: 152 72% 47%; /* colorSystem.sidebar.ring.hsl.dark */

    /* Gradients - using colorSystem.gradients.*.dark values */
    --gradient-mint: linear-gradient(90deg, #34d399 0%, #10b981 100%); /* colorSystem.gradients.mint.dark */
    --gradient-nav: linear-gradient(90deg, #34d399 0%, #10b981 100%); /* colorSystem.gradients.nav.dark */
    --gradient-bg: linear-gradient(180deg, rgba(13,15,14,1) 0%, rgba(13,15,14,0.95) 60%, rgba(13,15,14,0.85) 100%); /* colorSystem.gradients.bg.dark */
    --vignette: radial-gradient(ellipse at center, rgba(13,15,14,0.7) 0%, rgba(13,15,14,1) 100%); /* colorSystem.gradients.vignette.dark */

    /* Icon colors - using colorSystem.semantic.icon.*.dark values */
    --icon-orange: #ffb86b; /* colorSystem.semantic.icon.orange.dark */
    --icon-purple: #a78bfa; /* colorSystem.semantic.icon.purple.dark */
    --icon-blue: #60a5fa; /* colorSystem.semantic.icon.blue.dark */
    --icon-green: #34d399; /* colorSystem.semantic.icon.green.dark */
  }

  /* Rest of the CSS file remains unchanged */
}
```

## Implementation Steps

1. **Import the Color System**: If you're using a CSS-in-JS solution or a preprocessor, import the color system:

```js
import { colorSystem } from './src/data/constants';
```

2. **Generate CSS Variables**: Use the color system to generate your CSS variables:

```js
// Example function to generate CSS variables
function generateCssVariables(theme = 'light') {
  return `
    --background: ${colorSystem.semantic.background.hsl[theme]};
    --foreground: ${colorSystem.semantic.foreground.hsl[theme]};
    --primary: ${colorSystem.semantic.primary.hsl[theme]};
    /* and so on for all variables */
  `;
}

// Usage
const lightThemeVars = generateCssVariables('light');
const darkThemeVars = generateCssVariables('dark');
```

3. **Apply to CSS**: Insert these variables into your CSS:

```css
:root {
  ${lightThemeVars}
}

.dark {
  ${darkThemeVars}
}
```

## Manual Implementation

If you're not using a preprocessor, manually update the CSS variables in `index.css` using the values from the color system. This ensures that all colors are sourced from the centralized color system.

## Benefits

- **Single Source of Truth**: All color values come from the centralized color system
- **Easier Theme Switching**: Light and dark theme values are clearly organized
- **Better Maintenance**: Changes to the color system automatically propagate to CSS variables
- **Improved Documentation**: Comments link CSS variables to their source in the color system
