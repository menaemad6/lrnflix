# Color Refactoring Guide

This document outlines the process for refactoring the application's color scheme to support tenant-based customization.

## Objective

The goal is to replace all hardcoded color values in the codebase with a centralized design options object. This will allow for easy theme customization for different tenants.

## `designOptions` Object

A `designOptions` object has been added to `src/data/constants.ts`. This object contains the default color palette for the application.

```typescript
export const designOptions = {
  primary: '#10b981', // emerald-500
  secondary: '#a3a3a3', // neutral-400
  accent: '#34d399', // emerald-400
  textPrimary: '#171717', // neutral-900
  textSecondary: '#a3a3a3', // neutral-400
  background: '#f8fafc', // slate-50
  cardBackground: '#ffffff', // white
  error: '#ef4444', // red-500
  success: '#22c55e', // green-500
  warning: '#f97316', // orange-500
};
```

## Refactoring Steps

1.  **Identify Hardcoded Colors**: Locate all hardcoded color values (hex, rgb, rgba) in `.tsx`, `.ts`, and `.css` files.

2.  **Replace with `designOptions`**: Replace the hardcoded colors with the corresponding values from the `designOptions` object.

    -   For **Tailwind CSS classes** in `.tsx` files, we will need to update `tailwind.config.js` to use CSS variables derived from `designOptions` and then use semantic class names (e.g., `bg-primary`, `text-text-primary`).

    -   For **inline styles** and **CSS files**, import the `designOptions` object and use its properties.

3.  **CSS Variables**: In `index.css`, the root color definitions will be updated to use the values from `designOptions` via CSS variables. This will be the primary way to theme the application.

4.  **Tenant-Specific Overrides**: In the future, a tenant-specific JSON object will be fetched from the database. This object will merge with and override the default `designOptions` to apply the tenant's branding.

## Files to Update

The initial `grep` command has identified numerous files. The refactoring will be done incrementally, starting with the most commonly used components.

-   `src/index.css`
-   `src/components/**/*.tsx`
-   `src/pages/**/*.tsx`
-   ...and so on.
