const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const results = {
    test: "C - UI Quality",
    images_total: 0,
    images_loaded: 0,
    broken_images: [],
    mobile_viewport_ok: true,
    horizontal_scroll: false,
    accessibility: {
      images_with_alt: 0,
      images_missing_alt: 0
    },
    passed: false,
    errors: []
  };

  try {
    console.log('Loading site...');
    await page.goto('https://seamlessblazer.netlify.app', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Desktop tests first
    console.log('Testing desktop viewport...');

    // Check all images
    console.log('Checking images...');
    const images = await page.$$eval('img', imgs =>
      imgs.map(i => ({
        src: i.src,
        loaded: i.naturalHeight > 0 && i.naturalWidth > 0,
        alt: i.alt,
        hasAlt: i.alt && i.alt.trim().length > 0
      }))
    );

    results.images_total = images.length;
    results.images_loaded = images.filter(i => i.loaded).length;
    results.broken_images = images
      .filter(i => !i.loaded)
      .map(i => i.src);
    results.accessibility.images_with_alt = images.filter(i => i.hasAlt).length;
    results.accessibility.images_missing_alt = images.filter(i => !i.hasAlt).length;

    console.log(`Images: ${results.images_loaded}/${results.images_total} loaded`);
    console.log(`Alt text: ${results.accessibility.images_with_alt}/${results.images_total} images have alt text`);

    // Mobile viewport test
    console.log('Testing mobile viewport (390x844 - iPhone)...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'networkidle' });

    // Wait a moment for any dynamic content
    await page.waitForTimeout(2000);

    // Check for horizontal scroll
    const horizontalScroll = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });

    results.horizontal_scroll = horizontalScroll;
    results.mobile_viewport_ok = !horizontalScroll;

    console.log(`Mobile viewport: ${results.mobile_viewport_ok ? 'OK' : 'FAIL'} (horizontal scroll: ${horizontalScroll})`);

    // Check button labels for accessibility
    const buttons = await page.$$eval('button', btns =>
      btns.map(b => ({
        text: b.textContent.trim(),
        hasLabel: b.textContent.trim().length > 0 || b.getAttribute('aria-label')
      }))
    );

    const buttonsWithoutLabels = buttons.filter(b => !b.hasLabel).length;
    if (buttonsWithoutLabels > 0) {
      results.errors.push(`${buttonsWithoutLabels} buttons missing labels`);
    }

    // Determine if test passed
    results.passed =
      results.images_loaded === results.images_total &&
      results.mobile_viewport_ok &&
      results.accessibility.images_missing_alt === 0 &&
      buttonsWithoutLabels === 0;

    console.log(`\nTest result: ${results.passed ? 'PASSED' : 'FAILED'}`);

  } catch (error) {
    console.error('Error during test:', error.message);
    results.errors.push(error.message);
    results.passed = false;
  } finally {
    await browser.close();

    // Write results to JSON file
    const outputPath = '/Users/nelsonchan/Downloads/secretjeans TEMPLATE SMALL copy/state/test-c.json';
    const outputDir = path.dirname(outputPath);

    // Ensure state directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\nResults written to: ${outputPath}`);
    console.log(JSON.stringify(results, null, 2));
  }
})();
