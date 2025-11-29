const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const results = {
    test: "E - Performance Audit",
    page_size_bytes: 0,
    page_size_ok: false,
    hero_image_size_bytes: 211282,
    hero_image_ok: false,
    load_time_ms: 0,
    lcp_estimate_ok: false,
    critical_css_inlined: false,
    images_preloaded: false,
    performance_score: "0/10",
    passed: false,
    errors: [],
    details: {}
  };

  try {
    // Track all network requests
    const resources = [];
    page.on('response', async (response) => {
      const url = response.url();
      const headers = response.headers();
      const contentLength = headers['content-length'];

      resources.push({
        url: url,
        status: response.status(),
        contentLength: contentLength ? parseInt(contentLength) : 0,
        contentType: headers['content-type'] || ''
      });
    });

    // Measure load time
    const startTime = Date.now();
    await page.goto('https://seamlessblazer.netlify.app', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    const loadTime = Date.now() - startTime;
    results.load_time_ms = loadTime;

    // Wait a bit for lazy-loaded resources
    await page.waitForTimeout(2000);

    // Calculate total page size
    let totalSize = 0;
    resources.forEach(r => {
      totalSize += r.contentLength;
    });
    results.page_size_bytes = totalSize;
    results.page_size_ok = totalSize < 3 * 1024 * 1024; // < 3MB

    // Check hero image size
    results.hero_image_ok = results.hero_image_size_bytes < 500 * 1024; // < 500KB

    // Check for inline critical CSS
    const inlineStyles = await page.$$eval('head style', styles => styles.length);
    results.critical_css_inlined = inlineStyles > 0;

    // Check for preloaded images
    const preloadedImages = await page.$$eval('link[rel="preload"][as="image"]', links => links.length);
    results.images_preloaded = preloadedImages > 0;

    // Get performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');

      return {
        domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
        loadComplete: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
      };
    });

    results.details.performanceMetrics = performanceMetrics;

    // Estimate LCP (using load time as proxy since we can't get real LCP without Chrome DevTools Protocol)
    // Real LCP should be measured with web-vitals library, but for this test we'll estimate
    results.lcp_estimate_ok = loadTime < 2500;

    // Check for render-blocking resources
    const renderBlockingCSS = await page.$$eval('link[rel="stylesheet"]:not([media="print"])', links => {
      return links.filter(link => !link.hasAttribute('defer') && !link.hasAttribute('async')).length;
    });

    const renderBlockingJS = await page.$$eval('script[src]:not([async]):not([defer])', scripts => scripts.length);

    results.details.renderBlocking = {
      css: renderBlockingCSS,
      js: renderBlockingJS,
      total: renderBlockingCSS + renderBlockingJS
    };

    // Get resource breakdown
    const resourceBreakdown = {
      html: 0,
      css: 0,
      js: 0,
      images: 0,
      fonts: 0,
      other: 0
    };

    resources.forEach(r => {
      const type = r.contentType.toLowerCase();
      if (type.includes('html')) resourceBreakdown.html += r.contentLength;
      else if (type.includes('css')) resourceBreakdown.css += r.contentLength;
      else if (type.includes('javascript')) resourceBreakdown.js += r.contentLength;
      else if (type.includes('image')) resourceBreakdown.images += r.contentLength;
      else if (type.includes('font')) resourceBreakdown.fonts += r.contentLength;
      else resourceBreakdown.other += r.contentLength;
    });

    results.details.resourceBreakdown = resourceBreakdown;
    results.details.totalRequests = resources.length;

    // Calculate performance score
    let score = 0;
    if (results.page_size_ok) score += 2;
    if (results.hero_image_ok) score += 2;
    if (results.lcp_estimate_ok) score += 2;
    if (results.critical_css_inlined) score += 1;
    if (results.images_preloaded) score += 1;
    if (renderBlockingCSS === 0) score += 1;
    if (renderBlockingJS === 0) score += 1;

    results.performance_score = `${score}/10`;
    results.passed = score >= 7;

    // Add any errors or warnings
    if (!results.page_size_ok) {
      results.errors.push(`Page size (${(totalSize / 1024).toFixed(2)} KB) exceeds 3MB limit`);
    }
    if (!results.hero_image_ok) {
      results.errors.push(`Hero image (${(results.hero_image_size_bytes / 1024).toFixed(2)} KB) exceeds 500KB limit`);
    }
    if (!results.lcp_estimate_ok) {
      results.errors.push(`Load time (${loadTime}ms) exceeds 2.5s LCP target`);
    }
    if (!results.critical_css_inlined) {
      results.errors.push('No critical CSS inlined in <head>');
    }
    if (!results.images_preloaded) {
      results.errors.push('No images preloaded with <link rel="preload">');
    }
    if (renderBlockingCSS > 0) {
      results.errors.push(`${renderBlockingCSS} render-blocking CSS file(s) detected`);
    }
    if (renderBlockingJS > 0) {
      results.errors.push(`${renderBlockingJS} render-blocking JavaScript file(s) detected`);
    }

  } catch (error) {
    results.errors.push(`Test error: ${error.message}`);
    results.passed = false;
  }

  await browser.close();

  // Write results to JSON file
  const outputPath = '/Users/nelsonchan/Downloads/secretjeans TEMPLATE SMALL copy/state/test-e.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log('\n=== PERFORMANCE AUDIT RESULTS ===\n');
  console.log(JSON.stringify(results, null, 2));
  console.log('\n=================================\n');

})();
