# Performance Testing Script

## Quick Performance Test

Add this script to your browser console to test the performance improvements:

```javascript
// Performance Testing Script for Multi-Tenant SEO
(function() {
  console.log('🧪 Starting Multi-Tenant SEO Performance Tests...');
  
  // Test 1: Cache Performance
  console.group('📊 Cache Performance Test');
  console.time('Cache Hit (First Load)');
  const config1 = window.tenantSEO.getConfig();
  console.timeEnd('Cache Hit (First Load)');
  
  console.time('Cache Hit (Second Load)');
  const config2 = window.tenantSEO.getConfig();
  console.timeEnd('Cache Hit (Second Load)');
  
  console.log('Config consistency:', config1 === config2 ? '✅ PASS' : '❌ FAIL');
  console.groupEnd();
  
  // Test 2: DOM Update Performance
  console.group('🎨 DOM Update Performance Test');
  console.time('DOM Update');
  window.tenantSEO.reinitialize();
  console.timeEnd('DOM Update');
  console.groupEnd();
  
  // Test 3: Favicon Loading Test
  console.group('🖼️ Favicon Loading Test');
  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon) {
    console.log('Favicon URL:', favicon.href);
    console.log('Favicon type:', favicon.type);
    
    // Test favicon loading
    const img = new Image();
    img.onload = () => console.log('✅ Favicon loaded successfully');
    img.onerror = () => console.log('❌ Favicon failed to load');
    img.src = favicon.href;
  } else {
    console.log('❌ No favicon found');
  }
  console.groupEnd();
  
  // Test 4: Memory Usage
  console.group('💾 Memory Usage Test');
  if (performance.memory) {
    console.log('Used JS Heap:', (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2), 'MB');
    console.log('Total JS Heap:', (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2), 'MB');
  } else {
    console.log('Memory API not available');
  }
  console.groupEnd();
  
  // Test 5: Meta Tags Verification
  console.group('🏷️ Meta Tags Verification');
  const metaTests = [
    ['title', document.title],
    ['description', document.querySelector('meta[name="description"]')?.content],
    ['og:title', document.querySelector('meta[property="og:title"]')?.content],
    ['og:image', document.querySelector('meta[property="og:image"]')?.content],
    ['canonical', document.querySelector('link[rel="canonical"]')?.href]
  ];
  
  metaTests.forEach(([name, value]) => {
    console.log(`${name}:`, value ? '✅' : '❌', value || 'Missing');
  });
  console.groupEnd();
  
  // Test 6: Schema.org Verification
  console.group('📋 Schema.org Verification');
  const schemaScript = document.querySelector('script[type="application/ld+json"]');
  if (schemaScript) {
    try {
      const schema = JSON.parse(schemaScript.textContent);
      console.log('Schema type:', schema['@type']);
      console.log('Schema name:', schema.name);
      console.log('✅ Schema.org data valid');
    } catch (e) {
      console.log('❌ Invalid JSON-LD:', e.message);
    }
  } else {
    console.log('❌ No schema.org script found');
  }
  console.groupEnd();
  
  // Test 7: Performance Metrics
  console.group('⚡ Performance Metrics');
  const navigation = performance.getEntriesByType('navigation')[0];
  if (navigation) {
    console.log('DOM Content Loaded:', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart, 'ms');
    console.log('Load Complete:', navigation.loadEventEnd - navigation.loadEventStart, 'ms');
  }
  
  // Measure tenant SEO initialization time
  const tenantSEOEntries = performance.getEntriesByName('tenant-seo');
  if (tenantSEOEntries.length > 0) {
    console.log('Tenant SEO Init:', tenantSEOEntries[0].duration, 'ms');
  }
  console.groupEnd();
  
  console.log('🎉 Performance tests completed!');
  
  // Summary
  console.group('📈 Test Summary');
  console.log('Subdomain:', window.tenantSEO.getSubdomain());
  console.log('Configuration loaded:', !!config1);
  console.log('Cache working:', config1 === config2);
  console.log('Meta tags updated:', !!document.querySelector('meta[property="og:title"]')?.content);
  console.log('Favicon updated:', !!document.querySelector('link[rel="icon"]')?.href);
  console.groupEnd();
  
})();
```

## Manual Testing Steps

### 1. **Load Time Testing**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Clear cache and reload page
4. Check timing for:
   - HTML document load
   - JavaScript execution
   - Favicon loading

### 2. **Cache Testing**
1. Load page first time (cache miss)
2. Reload page (cache hit)
3. Check console for cache performance logs
4. Verify faster second load

### 3. **Favicon Testing**
1. Navigate to different subdomains
2. Check if favicon changes correctly
3. Verify no broken favicon links
4. Test cache busting (timestamp in URL)

### 4. **Meta Tags Testing**
1. View page source
2. Check all meta tags are updated
3. Verify Open Graph tags
4. Test social media sharing

### 5. **Performance Monitoring**
1. Use Chrome DevTools Performance tab
2. Record page load
3. Check for:
   - Long tasks
   - Layout thrashing
   - Memory leaks
   - Unused resources

## Expected Results

### ✅ **Good Performance Indicators**
- Cache hit: < 1ms
- DOM update: < 10ms
- Favicon load: < 100ms
- Total initialization: < 50ms
- Memory usage: Stable
- No console errors

### ❌ **Performance Issues to Watch**
- Cache miss every time
- DOM updates > 50ms
- Favicon not loading
- Memory increasing over time
- JavaScript errors
- Layout shifts

## Troubleshooting Commands

```javascript
// Clear cache and test
window.tenantSEO.clearCache();
window.tenantSEO.reinitialize();

// Check current state
console.log('Current config:', window.tenantSEO.getConfig());
console.log('Subdomain:', window.tenantSEO.getSubdomain());

// Force favicon reload
const favicon = document.querySelector('link[rel="icon"]');
if (favicon) {
  favicon.href = favicon.href.split('?')[0] + '?v=' + Date.now();
}

// Monitor performance
performance.mark('test-start');
// ... run operations
performance.mark('test-end');
performance.measure('test-duration', 'test-start', 'test-end');
console.log('Duration:', performance.getEntriesByName('test-duration')[0].duration, 'ms');
```

This testing script helps verify that all performance optimizations are working correctly and the multi-tenant SEO system is running efficiently.
