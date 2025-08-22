import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTenant } from '@/contexts/TenantContext';
import { getSEOMetadata, getDynamicSEOMetadata, SEOMetadata, Language } from '@/data/seo';

interface SEOHeadProps {
  // Basic SEO props
  title?: string;
  description?: string;
  keywords?: string;
  
  // Open Graph props
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  
  // Twitter props
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: string;
  
  // Other props
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  
  // Dynamic content props
  contentTitle?: string;
  contentDescription?: string;
  
  // Override language and tenant
  forceLanguage?: Language;
  forceTenantName?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  ogType,
  ogUrl,
  twitterTitle,
  twitterDescription,
  twitterImage,
  twitterCard = 'summary_large_image',
  canonical,
  noindex = false,
  nofollow = false,
  contentTitle,
  contentDescription,
  forceLanguage,
  forceTenantName,
}) => {
  const location = useLocation();
  const { currentLanguage } = useLanguage();
  const { teacher } = useTenant();
  
  // Determine the language to use
  const language = forceLanguage || currentLanguage;
  
  // Determine tenant name
  const tenantName = forceTenantName || teacher?.full_name || undefined;
  
  // Get base SEO metadata for the current route
  const baseMetadata = getSEOMetadata(location.pathname, language, tenantName);
  
  // If we have dynamic content, get dynamic metadata
  let metadata: SEOMetadata;
  if (contentTitle && contentDescription) {
    const baseRoute = '/' + location.pathname.split('/')[1];
    metadata = getDynamicSEOMetadata(baseRoute, language, contentTitle, contentDescription, tenantName);
  } else {
    metadata = baseMetadata;
  }
  
  // Override with props if provided
  const finalMetadata: SEOMetadata = {
    ...metadata,
    title: title || metadata.title,
    description: description || metadata.description,
    keywords: keywords || metadata.keywords,
    ogTitle: ogTitle || metadata.ogTitle || metadata.title,
    ogDescription: ogDescription || metadata.ogDescription || metadata.description,
    ogImage: ogImage || metadata.ogImage,
    ogType: ogType || metadata.ogType,
    twitterTitle: twitterTitle || metadata.twitterTitle || metadata.title,
    twitterDescription: twitterDescription || metadata.twitterDescription || metadata.description,
    twitterImage: twitterImage || metadata.twitterImage || metadata.ogImage,
    canonical: canonical || metadata.canonical,
  };
  
  // Set document language
  React.useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalMetadata.title}</title>
      <meta name="description" content={finalMetadata.description} />
      {finalMetadata.keywords && <meta name="keywords" content={finalMetadata.keywords} />}
      
      {/* Canonical URL */}
      {finalMetadata.canonical && <link rel="canonical" href={finalMetadata.canonical} />}
      
      {/* Robots */}
      {(noindex || nofollow) && (
        <meta 
          name="robots" 
          content={`${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`} 
        />
      )}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={finalMetadata.ogType || 'website'} />
      <meta property="og:title" content={finalMetadata.ogTitle} />
      <meta property="og:description" content={finalMetadata.ogDescription} />
      <meta property="og:url" content={ogUrl || finalMetadata.canonical || window.location.href} />
      <meta property="og:site_name" content={tenantName || 'LRNFLIX'} />
      {finalMetadata.ogImage && <meta property="og:image" content={finalMetadata.ogImage} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={finalMetadata.twitterTitle} />
      <meta name="twitter:description" content={finalMetadata.twitterDescription} />
      {finalMetadata.twitterImage && <meta name="twitter:image" content={finalMetadata.twitterImage} />}
      
      {/* Additional Meta Tags for Arabic */}
      {language === 'ar' && (
        <>
          <meta name="language" content="Arabic" />
          <meta name="content-language" content="ar" />
        </>
      )}
      
      {/* Additional Meta Tags for English */}
      {language === 'en' && (
        <>
          <meta name="language" content="English" />
          <meta name="content-language" content="en" />
        </>
      )}
      
      {/* Viewport and Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Theme Color */}
      <meta name="theme-color" content="#10b981" />
      <meta name="msapplication-TileColor" content="#10b981" />
      
      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      
      {/* Preconnect for Performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Helmet>
  );
};

// Convenience component for basic SEO
export const BasicSEO: React.FC<{ title?: string; description?: string }> = ({ 
  title, 
  description 
}) => (
  <SEOHead title={title} description={description} />
);

// Convenience component for course pages
export const CourseSEO: React.FC<{ 
  courseTitle: string; 
  courseDescription: string; 
  courseImage?: string;
}> = ({ courseTitle, courseDescription, courseImage }) => (
  <SEOHead
    contentTitle={courseTitle}
    contentDescription={courseDescription}
    ogImage={courseImage}
    twitterImage={courseImage}
  />
);

// Convenience component for lesson pages
export const LessonSEO: React.FC<{ 
  lessonTitle: string; 
  lessonDescription: string; 
  courseTitle?: string;
  lessonImage?: string;
}> = ({ lessonTitle, lessonDescription, courseTitle, lessonImage }) => {
  const fullTitle = courseTitle ? `${lessonTitle} - ${courseTitle}` : lessonTitle;
  return (
    <SEOHead
      contentTitle={fullTitle}
      contentDescription={lessonDescription}
      ogImage={lessonImage}
      twitterImage={lessonImage}
    />
  );
};

// Convenience component for teacher profile pages
export const TeacherSEO: React.FC<{ 
  teacherName: string; 
  teacherBio: string; 
  teacherImage?: string;
}> = ({ teacherName, teacherBio, teacherImage }) => (
  <SEOHead
    contentTitle={teacherName}
    contentDescription={teacherBio}
    ogImage={teacherImage}
    twitterImage={teacherImage}
    ogType="profile"
  />
);

export default SEOHead;
