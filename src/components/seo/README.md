# SEO System Documentation

## Overview

This is a comprehensive SEO system built with React Helmet that provides tenant-aware and language-aware metadata management for your application. The system automatically handles SEO for different routes, languages (English/Arabic), and tenant contexts.

## Features

- **Tenant-Aware**: Automatically adjusts titles and metadata based on tenant context
- **Language-Aware**: Supports both English and Arabic with proper RTL/LTR handling
- **Route-Based**: Pre-configured SEO for all major routes
- **Dynamic Content**: Specialized components for courses, lessons, and teacher profiles
- **Open Graph**: Full social media optimization
- **Twitter Cards**: Optimized Twitter sharing
- **Schema.org**: Structured data support
- **Performance**: Optimized with preconnect and viewport settings

## Installation

The SEO system is already installed and configured in your project. It uses `react-helmet-async` for managing document head metadata.

## Basic Usage

### 1. Simple Page SEO

For basic pages that use route-based metadata:

```tsx
import { SEOHead } from '@/components/seo';

const MyPage = () => (
  <>
    <SEOHead />
    <div>Your page content</div>
  </>
);
```

### 2. Course Page SEO

For course pages with dynamic content:

```tsx
import { CourseSEO } from '@/components/seo';

const CoursePage = ({ course }) => (
  <>
    <CourseSEO 
      courseTitle={course.title}
      courseDescription={course.description}
      courseImage={course.coverImage}
    />
    <div>Course content</div>
  </>
);
```

### 3. Lesson Page SEO

For lesson pages with course context:

```tsx
import { LessonSEO } from '@/components/seo';

const LessonPage = ({ lesson, course }) => (
  <>
    <LessonSEO 
      lessonTitle={lesson.title}
      lessonDescription={lesson.description}
      courseTitle={course.title}
      lessonImage={lesson.image}
    />
    <div>Lesson content</div>
  </>
);
```

### 4. Teacher Profile SEO

For teacher profile pages:

```tsx
import { TeacherSEO } from '@/components/seo';

const TeacherProfile = ({ teacher }) => (
  <>
    <TeacherSEO 
      teacherName={teacher.display_name}
      teacherBio={teacher.bio}
      teacherImage={teacher.profile_image_url}
    />
    <div>Teacher profile content</div>
  </>
);
```

### 5. Custom SEO Override

For pages that need custom metadata:

```tsx
import { SEOHead } from '@/components/seo';

const CustomPage = () => (
  <>
    <SEOHead 
      title="Custom Title"
      description="Custom description"
      keywords="custom, keywords"
      noindex={true}
      canonical="https://example.com/custom-page"
    />
    <div>Custom page content</div>
  </>
);
```

## SEO Components

### SEOHead

The main SEO component that provides comprehensive metadata management.

**Props:**
- `title` - Page title (overrides route-based title)
- `description` - Page description (overrides route-based description)
- `keywords` - Page keywords
- `ogTitle` - Open Graph title
- `ogDescription` - Open Graph description
- `ogImage` - Open Graph image URL
- `ogType` - Open Graph type (default: 'website')
- `ogUrl` - Open Graph URL
- `twitterTitle` - Twitter title
- `twitterDescription` - Twitter description
- `twitterImage` - Twitter image URL
- `twitterCard` - Twitter card type (default: 'summary_large_image')
- `canonical` - Canonical URL
- `noindex` - Whether to add noindex meta tag
- `nofollow` - Whether to add nofollow meta tag
- `contentTitle` - Dynamic content title for route-based metadata
- `contentDescription` - Dynamic content description for route-based metadata
- `forceLanguage` - Override current language
- `forceTenantName` - Override current tenant name

### BasicSEO

A simplified component for basic SEO needs.

**Props:**
- `title` - Page title
- `description` - Page description

### CourseSEO

Optimized for course pages with dynamic content.

**Props:**
- `courseTitle` - Course title
- `courseDescription` - Course description
- `courseImage` - Course cover image URL

### LessonSEO

Optimized for lesson pages with course context.

**Props:**
- `lessonTitle` - Lesson title
- `lessonDescription` - Lesson description
- `courseTitle` - Course title (optional)
- `lessonImage` - Lesson image URL

### TeacherSEO

Optimized for teacher profile pages.

**Props:**
- `teacherName` - Teacher's name
- `teacherBio` - Teacher's bio
- `teacherImage` - Teacher's profile image URL

## Route-Based SEO Configuration

The system includes pre-configured SEO metadata for all major routes:

- `/` - Home/Landing page
- `/auth` - Authentication pages
- `/courses` - Course catalog
- `/teacher/dashboard` - Teacher dashboard
- `/teacher/courses` - Teacher course management
- `/student/dashboard` - Student dashboard
- `/student/courses` - Student course access
- `/chapters` - Chapter management
- `/groups` - Study groups
- `/questions` - Q&A section
- `/teachers` - Teacher directory
- `/dashboard/settings` - Settings page
- `/redeem` - Code redemption
- `/multiplayer-quiz` - Quiz games
- `/student/store` - Learning store

## Language Support

### English (en)
- Default language
- LTR text direction
- English metadata and descriptions

### Arabic (ar)
- RTL text direction
- Arabic metadata and descriptions
- Proper language attributes

## Tenant Awareness

The system automatically detects tenant context and adjusts metadata accordingly:

### Platform Mode (No Tenant)
- Uses `LRNFLIX` as the platform name
- Generic metadata for platform-wide access

### Tenant Mode (With Tenant)
- Uses teacher's `display_name` instead of `LRNFLIX`
- Customized titles like "Courses | John Morgan" instead of "Courses | LRNFLIX"
- Tenant-specific branding

## Metadata Structure

Each route includes:
- **Title**: Page title with tenant awareness
- **Description**: SEO-optimized description
- **Keywords**: Relevant keywords for search engines
- **Open Graph**: Facebook and social media optimization
- **Twitter Cards**: Twitter sharing optimization
- **Canonical URLs**: Proper URL canonicalization
- **Language Attributes**: Proper language and direction settings

## Example Output

### Platform Mode (No Tenant)
```html
<title>Courses | LRNFLIX</title>
<meta name="description" content="Explore our comprehensive collection of courses designed to enhance your learning journey.">
<meta property="og:title" content="Courses | LRNFLIX">
<meta property="og:site_name" content="LRNFLIX">
```

### Tenant Mode (John Morgan)
```html
<title>Courses | John Morgan</title>
<meta name="description" content="Explore our comprehensive collection of courses designed to enhance your learning journey.">
<meta property="og:title" content="Courses | John Morgan">
<meta property="og:site_name" content="John Morgan">
```

## Advanced Usage

### Custom Route SEO

To add SEO for a new route, update the `BASE_SEO_CONFIG` in `src/data/seo.ts`:

```typescript
'/new-route': {
  en: {
    title: `New Route | ${PLATFORM_NAME}`,
    description: 'Description for English users',
    keywords: 'relevant, keywords',
    ogType: 'website',
    canonical: 'https://learnify.app/new-route',
  },
  ar: {
    title: `المسار الجديد | ${PLATFORM_NAME}`,
    description: 'وصف للمستخدمين العرب',
    keywords: 'كلمات, مفتاحية, ذات, صلة',
    ogType: 'website',
    canonical: 'https://learnify.app/new-route',
  },
},
```

### Dynamic Content SEO

For pages with dynamic content, use the `getDynamicSEOMetadata` function:

```typescript
import { getDynamicSEOMetadata } from '@/data/seo';

const metadata = getDynamicSEOMetadata(
  '/courses',           // Base route
  'en',                 // Language
  'React Mastery',      // Content title
  'Learn React from scratch', // Content description
  'John Morgan'         // Tenant name (optional)
);
```

## Performance Features

- **Preconnect**: Optimized font and resource loading
- **Viewport**: Mobile-optimized viewport settings
- **Theme Colors**: Dynamic theme color support
- **Favicon**: Proper favicon and touch icon support

## Best Practices

1. **Always include SEO components** at the top of your page components
2. **Use appropriate specialized components** (CourseSEO, LessonSEO, etc.) for content pages
3. **Keep descriptions under 160 characters** for optimal search engine display
4. **Use relevant keywords** that match your content
5. **Provide high-quality images** for Open Graph and Twitter Cards
6. **Test with social media debuggers** to ensure proper sharing

## Testing

### Social Media Debuggers
- **Facebook**: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- **Twitter**: [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- **LinkedIn**: [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

### SEO Tools
- **Google**: [Google Rich Results Test](https://search.google.com/test/rich-results)
- **Schema.org**: [Schema.org Validator](https://validator.schema.org/)

## Troubleshooting

### Common Issues

1. **Metadata not updating**: Ensure the component is mounted and the route is correct
2. **Tenant name not showing**: Check that the tenant context is properly loaded
3. **Language not switching**: Verify the language context is working correctly
4. **Images not displaying**: Ensure image URLs are absolute and accessible

### Debug Mode

Enable debug mode by checking the browser console for SEO-related logs and the document head for generated meta tags.

## Support

For issues or questions about the SEO system, check:
1. The SEO demo page at `/seo-demo` (if implemented)
2. The browser's developer tools for meta tag inspection
3. The console for any error messages
4. The network tab for resource loading issues
