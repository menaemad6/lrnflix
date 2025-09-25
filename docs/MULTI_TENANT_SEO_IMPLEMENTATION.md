# Multi-Tenant SEO Implementation

## Overview

The Learnify application now supports **multi-tenant SEO configuration** that dynamically renders different meta tags, favicons, and Open Graph images based on the URL subdomain. Each teacher gets their own branded subdomain with custom SEO metadata.

## How It Works

### 1. Subdomain Detection

The system automatically detects the subdomain from the URL:
- `lrnflix.com` or `www.lrnflix.com` → Default platform configuration
- `pola.lrnflix.com` → Pola Nessim's teacher configuration
- `teacher-name.lrnflix.com` → Custom teacher configuration

### 2. Dynamic Meta Tag Generation

The `index.html` file contains a JavaScript configuration that:
- Detects the current subdomain
- Loads the appropriate tenant configuration
- Dynamically updates all meta tags, favicons, and schema.org data
- Falls back to default configuration if no tenant is found

### 3. Asset Structure

Each teacher can have their own assets in the following structure:
```
src/assets/
├── pola/
│   ├── logo.ico      # Custom favicon
│   └── logo.png      # Custom logo for OG images
├── teacher-name/
│   ├── logo.ico
│   └── logo.png
└── default assets...
```

## Configuration Structure

### Default Platform Configuration
```javascript
default: {
  title: "LRNFLIX - AI-Powered Learning Platform",
  description: "LRNFLIX is a modern, AI-powered educational platform...",
  siteName: "LRNFLIX",
  canonical: "https://lrnflix.com/",
  logo: "/assests/logo.png",
  ogImage: "/assests/logo.png",
  twitterImage: "/assests/logo.png",
  favicon: "/assests/logo.png"
}
```

### Teacher Configuration
```javascript
teachers: {
  pola: {
    title: "Pola Nessim - Secondary School Chemistry Teacher",
    description: "Learn chemistry with Pola Nessim...",
    siteName: "Pola Nessim - Chemistry Teacher",
    canonical: "https://pola.lrnflix.com/",
    logo: "/src/assets/pola/logo.png",
    ogImage: "/src/assets/pola/logo.png",
    twitterImage: "/src/assets/pola/logo.png",
    favicon: "/src/assets/pola/logo.ico",
    schema: {
      "@type": "Person",
      "name": "Pola Nessim",
      "jobTitle": "Secondary School Chemistry Teacher",
      // ... additional schema.org data
    }
  }
}
```

## Features Implemented

### 1. Dynamic Meta Tags
- **Title**: Custom page titles per teacher
- **Description**: Teacher-specific descriptions
- **Open Graph**: Custom OG tags for social sharing
- **Twitter Cards**: Custom Twitter card metadata
- **Canonical URLs**: Proper canonical links per subdomain

### 2. Dynamic Assets
- **Favicons**: Custom `.ico` files per teacher
- **OG Images**: Custom images for social media sharing
- **Logos**: Teacher-specific branding

### 3. Schema.org Structured Data
- **Educational Organization**: For the main platform
- **Person Schema**: For individual teachers with detailed information
- **SEO Optimization**: Rich snippets for better search visibility

### 4. Fallback System
- **Default Configuration**: Always falls back to platform defaults
- **Error Handling**: Graceful degradation if teacher config is missing
- **Asset Fallbacks**: Uses default assets if teacher assets don't exist

## Example Teacher: Pola Nessim

### Database Entry
The system includes a sample teacher "Pola Nessim" with:
- **Slug**: `pola`
- **Subdomain**: `pola.lrnflix.com`
- **Specialization**: Secondary School Chemistry
- **Custom Colors**: Pink/red color scheme
- **Assets**: Custom logo and favicon in `/src/assets/pola/`

### SEO Benefits
- **Custom Title**: "Pola Nessim - Secondary School Chemistry Teacher"
- **Targeted Description**: Chemistry-focused content description
- **Social Sharing**: Custom OG images and descriptions
- **Search Optimization**: Person schema for better search results

## Adding New Teachers

### 1. Database Setup
Add a new teacher to the `teachers` table with:
```sql
INSERT INTO public.teachers (
  slug,
  display_name,
  bio,
  specialization,
  profile_image_url,
  colors
) VALUES (
  'teacher-slug',
  'Teacher Name',
  'Teacher bio...',
  'Subject Specialization',
  '/src/assets/teacher-slug/logo.png',
  '{"primary": "#color", "secondary": "#color", "accent": "#color"}'
);
```

### 2. Asset Setup
Create the asset directory:
```
src/assets/teacher-slug/
├── logo.ico
└── logo.png
```

### 3. Configuration Update
Add the teacher configuration to `index.html`:
```javascript
teachers: {
  'teacher-slug': {
    title: "Teacher Name - Subject Specialization",
    description: "Custom description...",
    // ... other configuration
  }
}
```

## Technical Implementation

### JavaScript Functions
- `getSubdomain()`: Extracts subdomain from hostname
- `getTenantConfig()`: Returns appropriate configuration
- `applyTenantConfig()`: Updates DOM with tenant-specific data
- `updateMetaTag()`: Updates individual meta tags
- `updateFavicon()`: Updates favicon dynamically
- `updateSchemaOrg()`: Updates structured data

### Performance Considerations
- **Client-side Execution**: Runs immediately on page load
- **No Server Requests**: All configuration is embedded in HTML
- **Fast Fallback**: Quick fallback to defaults if needed
- **SEO Friendly**: Search engines see the correct meta tags

## Benefits

### For Teachers
- **Personal Branding**: Custom subdomain with their name
- **SEO Optimization**: Better search visibility for their content
- **Social Sharing**: Custom images and descriptions when shared
- **Professional Appearance**: Dedicated branded experience

### For Students
- **Clear Navigation**: Easy to remember teacher URLs
- **Consistent Experience**: Same platform, different branding
- **Trust Building**: Professional appearance builds confidence

### For Platform
- **Scalability**: Easy to add new teachers
- **SEO Benefits**: Multiple domains for better search presence
- **Brand Recognition**: Each teacher becomes a brand ambassador
- **Monetization**: Premium feature for teachers

## Future Enhancements

### Planned Features
1. **Dynamic Configuration**: Load teacher config from database
2. **Custom Domains**: Support for custom domains (e.g., `chemistry.com`)
3. **A/B Testing**: Test different SEO configurations
4. **Analytics**: Track SEO performance per teacher
5. **Bulk Management**: Admin interface for managing teacher SEO

### Technical Improvements
1. **Server-side Rendering**: Move configuration to server-side
2. **Caching**: Cache teacher configurations for performance
3. **CDN Integration**: Serve teacher assets from CDN
4. **Automated Testing**: Test SEO configurations automatically

## Testing

### Local Testing
1. **Default**: Visit `localhost:3000` (should show default config)
2. **Teacher**: Visit `pola.localhost:3000` (should show Pola's config)
3. **Fallback**: Visit `unknown.localhost:3000` (should fallback to default)

### Production Testing
1. **Default**: Visit `lrnflix.com`
2. **Teacher**: Visit `pola.lrnflix.com`
3. **Social Sharing**: Test OG tags on Facebook/Twitter
4. **Search Engines**: Verify meta tags in page source

## Maintenance

### Regular Tasks
1. **Asset Management**: Ensure teacher assets are properly sized
2. **Configuration Updates**: Update teacher descriptions as needed
3. **SEO Monitoring**: Track search performance per teacher
4. **Fallback Testing**: Ensure fallbacks work correctly

### Troubleshooting
1. **Missing Assets**: Check if teacher assets exist in correct location
2. **Configuration Errors**: Verify JavaScript syntax in `index.html`
3. **Database Issues**: Ensure teacher records exist and are active
4. **DNS Problems**: Verify subdomain routing is working

This multi-tenant SEO system provides a solid foundation for scaling the platform while maintaining excellent SEO performance for each teacher's branded subdomain.
