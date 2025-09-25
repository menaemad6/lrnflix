# Multi-Tenant SEO Testing Guide

## Quick Testing Checklist

### 1. Default Platform (lrnflix.com)
- [ ] Title shows: "LRNFLIX - AI-Powered Learning Platform"
- [ ] Description contains: "LRNFLIX is a modern, AI-powered educational platform"
- [ ] Favicon: `/assests/logo.png`
- [ ] OG Image: `/assests/logo.png`
- [ ] Schema.org type: "EducationalOrganization"

### 2. Teacher Subdomain (pola.lrnflix.com)
- [ ] Title shows: "Pola Nessim - Secondary School Chemistry Teacher"
- [ ] Description contains: "Learn chemistry with Pola Nessim"
- [ ] Favicon: `/src/assets/pola/logo.ico`
- [ ] OG Image: `/src/assets/pola/logo.png`
- [ ] Schema.org type: "Person"
- [ ] Schema includes: name, jobTitle, teaches, educationalLevel

### 3. Unknown Subdomain (unknown.lrnflix.com)
- [ ] Falls back to default configuration
- [ ] Shows default title and description
- [ ] Uses default favicon and OG image

## Browser Testing Steps

### Step 1: Test Default Configuration
1. Open browser developer tools (F12)
2. Navigate to `localhost:3000` (or your domain)
3. Check the `<head>` section for:
   - `<title>` tag content
   - Meta description
   - Favicon link
   - OG meta tags
   - Schema.org JSON-LD

### Step 2: Test Teacher Configuration
1. Navigate to `pola.localhost:3000` (or `pola.yourdomain.com`)
2. Verify all meta tags have changed to Pola's configuration
3. Check that favicon is now the custom `.ico` file
4. Verify schema.org data shows "Person" type with Pola's details

### Step 3: Test Social Media Sharing
1. Use Facebook's Sharing Debugger: https://developers.facebook.com/tools/debug/
2. Test with both default and teacher URLs
3. Verify OG images and descriptions are correct
4. Use Twitter Card Validator: https://cards-dev.twitter.com/validator

### Step 4: Test Search Engine Preview
1. Use Google's Rich Results Test: https://search.google.com/test/rich-results
2. Test both default and teacher URLs
3. Verify structured data is properly recognized

## Console Testing

### JavaScript Console Commands
```javascript
// Test subdomain detection
console.log('Current subdomain:', getSubdomain());

// Test configuration loading
console.log('Current config:', getTenantConfig());

// Test meta tag updates
console.log('Title:', document.title);
console.log('Description:', document.querySelector('meta[name="description"]').content);
console.log('OG Title:', document.querySelector('meta[property="og:title"]').content);
```

## Asset Verification

### Check Asset Files Exist
```bash
# Verify Pola's assets exist
ls -la src/assets/pola/
# Should show: logo.ico, logo.png

# Check file sizes and formats
file src/assets/pola/logo.ico  # Should be ICO format
file src/assets/pola/logo.png  # Should be PNG format
```

### Asset Optimization
- **Favicon**: Should be 16x16, 32x32, or 48x48 pixels
- **OG Image**: Should be 1200x630 pixels for optimal social sharing
- **File Size**: Keep under 1MB for fast loading

## Performance Testing

### Page Load Speed
1. Use Google PageSpeed Insights
2. Test both default and teacher URLs
3. Verify no performance degradation with dynamic meta tags

### SEO Impact
1. Use Google Search Console
2. Monitor indexing of teacher subdomains
3. Track click-through rates from search results

## Troubleshooting Common Issues

### Issue: Meta tags not updating
**Solution**: Check browser cache, try hard refresh (Ctrl+F5)

### Issue: Favicon not showing
**Solution**: Verify `.ico` file exists and is properly formatted

### Issue: OG images not working
**Solution**: Check image URLs are accessible and properly sized

### Issue: Schema.org errors
**Solution**: Use Google's Rich Results Test to validate JSON-LD

## Automated Testing Script

```javascript
// Add this to browser console for automated testing
function testMultiTenant() {
  const tests = [
    {
      name: 'Default Configuration',
      url: window.location.origin,
      expectedTitle: 'LRNFLIX - AI-Powered Learning Platform'
    },
    {
      name: 'Pola Configuration',
      url: window.location.origin.replace('localhost', 'pola.localhost'),
      expectedTitle: 'Pola Nessim - Secondary School Chemistry Teacher'
    }
  ];
  
  tests.forEach(test => {
    console.log(`Testing ${test.name}...`);
    // Add your test logic here
  });
}

testMultiTenant();
```

## Production Deployment Checklist

### Before Going Live
- [ ] All teacher assets are optimized and uploaded
- [ ] Database migration has been run
- [ ] DNS subdomain routing is configured
- [ ] SSL certificates cover all subdomains
- [ ] Social media sharing has been tested
- [ ] Search engine indexing is working
- [ ] Performance is acceptable on all subdomains

### Post-Deployment Monitoring
- [ ] Monitor search engine indexing
- [ ] Track social media sharing metrics
- [ ] Monitor page load speeds
- [ ] Check for any JavaScript errors
- [ ] Verify fallback behavior works correctly

This testing guide ensures the multi-tenant SEO system works correctly across all scenarios and provides a professional experience for both teachers and students.
