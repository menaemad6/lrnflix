# Internationalization (i18n) Setup

This project has been configured with full internationalization support for Arabic (RTL) and English (LTR) languages.

## Features

- ✅ **Arabic as default language** - The app starts in Arabic by default
- ✅ **RTL Support** - Full right-to-left layout support for Arabic
- ✅ **Language switching** - Easy toggle between Arabic and English
- ✅ **Namespace organization** - Translations organized by feature/page
- ✅ **Dynamic loading** - Support for loading translations from external sources
- ✅ **Type safety** - Full TypeScript support
- ✅ **Production ready** - Clean folder structure and scalable architecture

## Folder Structure

```
src/i18n/
├── i18n.ts                 # Main i18n configuration
├── locales/                # Translation files
│   ├── ar/                 # Arabic translations
│   │   ├── common.json     # Common UI elements
│   │   ├── dashboard.json  # Dashboard specific
│   │   ├── auth.json       # Authentication
│   │   └── courses.json    # Course management
│   └── en/                 # English translations
│       ├── common.json
│       ├── dashboard.json
│       ├── auth.json
│       └── courses.json
└── README.md               # This file
```

## Usage

### Basic Translation

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation('dashboard');
  
  return (
    <h1>{t('welcome.title', { name: 'أحمد' })}</h1>
  );
};
```

### Using the Custom Hook

```tsx
import { useI18n } from '@/hooks/useI18n';

const MyComponent = () => {
  const { t, currentLanguage, isRTL, formatDate } = useI18n('dashboard');
  
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <h1>{t('welcome.title')}</h1>
      <p>Last login: {formatDate(new Date())}</p>
    </div>
  );
};
```

### Language Switching

```tsx
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageToggle = () => {
  const { currentLanguage, toggleLanguage } = useLanguage();
  
  return (
    <button onClick={toggleLanguage}>
      Current: {currentLanguage === 'ar' ? 'العربية' : 'English'}
    </button>
  );
};
```

### RTL Support

The app automatically handles RTL layout when Arabic is selected:

- Document direction is set to `rtl`
- CSS classes are applied for RTL styling
- Spacing utilities are automatically adjusted
- Icons and layouts are mirrored appropriately

## Adding New Translations

### 1. Create Translation Files

Add new namespaces to the `src/i18n/locales/{lang}/` directories:

```json
// src/i18n/locales/en/newFeature.json
{
  "title": "New Feature",
  "description": "This is a new feature"
}

// src/i18n/locales/ar/newFeature.json
{
  "title": "ميزة جديدة",
  "description": "هذه ميزة جديدة"
}
```

### 2. Update i18n Configuration

Add the new namespace to `src/i18n/i18n.ts`:

```typescript
import enNewFeature from './locales/en/newFeature.json';
import arNewFeature from './locales/ar/newFeature.json';

const resources = {
  en: {
    // ... existing namespaces
    newFeature: enNewFeature,
  },
  ar: {
    // ... existing namespaces
    newFeature: arNewFeature,
  },
};
```

### 3. Use in Components

```tsx
const { t } = useTranslation('newFeature');
return <h1>{t('title')}</h1>;
```

## Dynamic Translation Loading

The setup supports loading translations from external sources (e.g., Supabase):

```typescript
// In i18n.ts
backend: {
  loadPath: '/api/translations/{{lng}}/{{ns}}',
  // or
  loadPath: 'https://your-api.com/translations/{{lng}}/{{ns}}',
}
```

## Best Practices

1. **Use namespaces** - Organize translations by feature/page
2. **Keep keys descriptive** - Use dot notation for hierarchy
3. **Provide context** - Use interpolation for dynamic content
4. **Test both languages** - Ensure RTL layout works correctly
5. **Use the custom hook** - Leverage `useI18n` for consistent behavior

## Example Components

- `DashboardExample.tsx` - Shows full i18n usage
- `LanguageSwitcher.tsx` - Language toggle component
- `LanguageContext.tsx` - Language management context

## Configuration Options

The i18n configuration can be customized in `src/i18n/i18n.ts`:

- Default language
- Fallback language
- Debug mode
- Backend configuration
- Language detection
- Interpolation settings

## Troubleshooting

### Common Issues

1. **Translations not loading** - Check namespace registration
2. **RTL not working** - Verify `dir` attribute is set
3. **Language not persisting** - Check localStorage configuration
4. **Missing translations** - Ensure all namespaces are imported

### Debug Mode

Enable debug mode in development:

```typescript
debug: process.env.NODE_ENV === 'development'
```

This will log translation loading and usage to the console.
