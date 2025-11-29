const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://hesaidshesaid-pants.netlify.app';

// Mobile viewports to test
const viewports = [
  { name: 'iPhone SE', width: 375, height: 667, deviceScaleFactor: 2 },
  { name: 'iPhone 12/13/14', width: 390, height: 844, deviceScaleFactor: 3 },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932, deviceScaleFactor: 3 },
  { name: 'Samsung Galaxy S21', width: 360, height: 800, deviceScaleFactor: 2 }
];

async function analyzeMobileDesign() {
  const browser = await chromium.launch({ headless: true });
  const screenshotsDir = path.join(__dirname, 'mobile-screenshots');

  // Create screenshots directory
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const report = {
    timestamp: new Date().toISOString(),
    url: SITE_URL,
    viewports: []
  };

  for (const viewport of viewports) {
    console.log(`\n🔍 Analyzing ${viewport.name} (${viewport.width}x${viewport.height})...`);

    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: viewport.deviceScaleFactor,
      isMobile: true,
      hasTouch: true
    });

    const page = await context.newPage();

    try {
      await page.goto(SITE_URL, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000); // Wait for any animations

      const viewportAnalysis = {
        device: viewport.name,
        dimensions: `${viewport.width}x${viewport.height}`,
        screenshots: [],
        analysis: {}
      };

      // Screenshot 1: Full page
      const fullPagePath = path.join(screenshotsDir, `${viewport.name.replace(/\//g, '-')}-fullpage.png`);
      await page.screenshot({ path: fullPagePath, fullPage: true });
      viewportAnalysis.screenshots.push({ type: 'fullpage', path: fullPagePath });
      console.log(`  ✓ Full page screenshot saved`);

      // Screenshot 2: Above the fold
      const aboveFoldPath = path.join(screenshotsDir, `${viewport.name.replace(/\//g, '-')}-above-fold.png`);
      await page.screenshot({ path: aboveFoldPath, fullPage: false });
      viewportAnalysis.screenshots.push({ type: 'above-fold', path: aboveFoldPath });
      console.log(`  ✓ Above-the-fold screenshot saved`);

      // Analyze above-the-fold content
      console.log(`  📊 Analyzing above-the-fold content...`);
      const aboveFoldAnalysis = await page.evaluate(({ viewportHeight }) => {
        const results = {
          productImageVisible: false,
          priceVisible: false,
          ctaVisible: false,
          heroImageRatio: null,
          elements: []
        };

        // Check hero/product image
        const heroImage = document.querySelector('.hero-image img, .product-hero img, .main-image img, img[alt*="pants" i], img[alt*="product" i]');
        if (heroImage) {
          const rect = heroImage.getBoundingClientRect();
          results.productImageVisible = rect.top < viewportHeight;
          results.heroImageRatio = rect.height / viewportHeight;
          results.elements.push({
            type: 'hero-image',
            visible: results.productImageVisible,
            top: rect.top,
            height: rect.height,
            width: rect.width,
            heightRatio: (rect.height / viewportHeight * 100).toFixed(1) + '%'
          });
        }

        // Check price visibility
        const priceElements = document.querySelectorAll('.price, [class*="price"], .product-price, .cost');
        for (const price of priceElements) {
          const rect = price.getBoundingClientRect();
          if (rect.top < viewportHeight && price.textContent.includes('$')) {
            results.priceVisible = true;
            results.elements.push({
              type: 'price',
              visible: true,
              top: rect.top,
              text: price.textContent.trim()
            });
            break;
          }
        }

        // Check CTA visibility
        const ctaButtons = document.querySelectorAll('button, .cta, .buy-button, [class*="add-to-cart"], a[href*="checkout"]');
        for (const cta of ctaButtons) {
          const rect = cta.getBoundingClientRect();
          const text = cta.textContent.trim().toLowerCase();
          if (rect.top < viewportHeight && (text.includes('buy') || text.includes('add') || text.includes('cart') || text.includes('shop'))) {
            results.ctaVisible = true;
            results.elements.push({
              type: 'cta',
              visible: true,
              top: rect.top,
              height: rect.height,
              width: rect.width,
              text: cta.textContent.trim(),
              thumbZone: rect.top > (viewportHeight * 0.66)
            });
          }
        }

        return results;
      }, { viewportHeight: viewport.height });

      viewportAnalysis.analysis.aboveFold = aboveFoldAnalysis;

      // Analyze CTA buttons in detail
      console.log(`  🎯 Analyzing CTA buttons...`);
      const ctaAnalysis = await page.evaluate(({ viewportHeight }) => {
        const buttons = document.querySelectorAll('button, .cta, .buy-button, [class*="add-to-cart"], .btn');
        const ctaData = [];

        buttons.forEach((btn, index) => {
          const rect = btn.getBoundingClientRect();
          const styles = window.getComputedStyle(btn);
          const text = btn.textContent.trim();

          if (rect.width > 0 && rect.height > 0) {
            const bgColor = styles.backgroundColor;
            const textColor = styles.color;
            const fontSize = styles.fontSize;

            ctaData.push({
              index,
              text,
              dimensions: {
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                meetsMinSize: rect.width >= 44 && rect.height >= 44
              },
              position: {
                top: Math.round(rect.top),
                left: Math.round(rect.left),
                inThumbZone: rect.top > (viewportHeight * 0.66),
                distanceFromBottom: viewportHeight - rect.bottom
              },
              styles: {
                fontSize,
                backgroundColor: bgColor,
                color: textColor,
                padding: styles.padding,
                borderRadius: styles.borderRadius
              }
            });
          }
        });

        return ctaData;
      }, { viewportHeight: viewport.height });

      viewportAnalysis.analysis.ctaButtons = ctaAnalysis;

      // Analyze typography
      console.log(`  📝 Analyzing typography...`);
      const typographyAnalysis = await page.evaluate(() => {
        const textElements = [];

        // Headings
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
          const elements = document.querySelectorAll(tag);
          elements.forEach(el => {
            const styles = window.getComputedStyle(el);
            const fontSize = parseFloat(styles.fontSize);
            textElements.push({
              tag,
              fontSize: fontSize,
              lineHeight: styles.lineHeight,
              text: el.textContent.trim().substring(0, 50),
              readabilityScore: fontSize >= 16 ? 'good' : fontSize >= 14 ? 'acceptable' : 'poor'
            });
          });
        });

        // Body text
        const paragraphs = document.querySelectorAll('p, li, span');
        let bodyTextSample = null;
        for (const p of paragraphs) {
          if (p.textContent.trim().length > 20) {
            const styles = window.getComputedStyle(p);
            bodyTextSample = {
              tag: p.tagName.toLowerCase(),
              fontSize: parseFloat(styles.fontSize),
              lineHeight: styles.lineHeight,
              readabilityScore: parseFloat(styles.fontSize) >= 16 ? 'good' : 'needs improvement'
            };
            break;
          }
        }

        return {
          headings: textElements,
          bodyText: bodyTextSample
        };
      });

      viewportAnalysis.analysis.typography = typographyAnalysis;

      // Analyze spacing and layout
      console.log(`  📐 Analyzing spacing and layout...`);
      const layoutAnalysis = await page.evaluate(({ viewportWidth }) => {
        const body = document.body;
        const scrollWidth = body.scrollWidth;
        const hasHorizontalScroll = scrollWidth > viewportWidth;

        // Check container padding
        const containers = document.querySelectorAll('main, .container, .product-container, section');
        const paddingData = [];

        containers.forEach((container, index) => {
          const styles = window.getComputedStyle(container);
          paddingData.push({
            index,
            paddingLeft: styles.paddingLeft,
            paddingRight: styles.paddingRight,
            paddingTop: styles.paddingTop,
            paddingBottom: styles.paddingBottom
          });
        });

        return {
          hasHorizontalScroll,
          bodyScrollWidth: scrollWidth,
          viewportWidth,
          containerPadding: paddingData
        };
      }, { viewportWidth: viewport.width });

      viewportAnalysis.analysis.layout = layoutAnalysis;

      // Analyze images
      console.log(`  🖼️  Analyzing images...`);
      const imageAnalysis = await page.evaluate(({ viewportWidth }) => {
        const images = document.querySelectorAll('img');
        const imageData = [];

        images.forEach((img, index) => {
          const rect = img.getBoundingClientRect();
          if (rect.width > 0) {
            imageData.push({
              index,
              alt: img.alt,
              src: img.src.substring(0, 80),
              dimensions: {
                displayWidth: Math.round(rect.width),
                displayHeight: Math.round(rect.height),
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight
              },
              quality: {
                isStretched: Math.abs(rect.width - img.naturalWidth) / img.naturalWidth > 0.1,
                isOversized: img.naturalWidth > viewportWidth * 2,
                aspectRatioMaintained: Math.abs((rect.width / rect.height) - (img.naturalWidth / img.naturalHeight)) < 0.1
              }
            });
          }
        });

        return imageData;
      }, { viewportWidth: viewport.width });

      viewportAnalysis.analysis.images = imageAnalysis;

      // Try to capture size selector if visible
      console.log(`  👕 Looking for size selector...`);
      const sizeSelector = await page.locator('.size-selector, .product-sizes, [class*="size"]').first();
      if (await sizeSelector.isVisible().catch(() => false)) {
        const sizeSelectorPath = path.join(screenshotsDir, `${viewport.name.replace(/\//g, '-')}-size-selector.png`);
        await sizeSelector.screenshot({ path: sizeSelectorPath });
        viewportAnalysis.screenshots.push({ type: 'size-selector', path: sizeSelectorPath });
        console.log(`  ✓ Size selector screenshot saved`);

        // Analyze size selector buttons
        const sizeButtonAnalysis = await page.evaluate(() => {
          const sizeButtons = document.querySelectorAll('.size-option, .size-button, [class*="size"] button');
          const buttonData = [];

          sizeButtons.forEach((btn, index) => {
            const rect = btn.getBoundingClientRect();
            const styles = window.getComputedStyle(btn);

            buttonData.push({
              index,
              text: btn.textContent.trim(),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              meetsMinTouchTarget: rect.width >= 44 && rect.height >= 44,
              padding: styles.padding,
              margin: styles.margin
            });
          });

          return buttonData;
        });

        viewportAnalysis.analysis.sizeSelector = sizeButtonAnalysis;
      }

      // Try to trigger and capture order bump popup
      console.log(`  🎁 Looking for order bump popup...`);
      const addToCartButton = await page.locator('button:has-text("Add to Cart"), button:has-text("Buy Now")').first();
      if (await addToCartButton.isVisible().catch(() => false)) {
        await addToCartButton.click();
        await page.waitForTimeout(1500);

        const popup = await page.locator('.popup, .modal, .order-bump, [class*="upsell"]').first();
        if (await popup.isVisible().catch(() => false)) {
          const popupPath = path.join(screenshotsDir, `${viewport.name.replace(/\//g, '-')}-order-bump.png`);
          await page.screenshot({ path: popupPath });
          viewportAnalysis.screenshots.push({ type: 'order-bump', path: popupPath });
          console.log(`  ✓ Order bump popup screenshot saved`);
        }
      }

      report.viewports.push(viewportAnalysis);
      await context.close();

    } catch (error) {
      console.error(`  ❌ Error analyzing ${viewport.name}:`, error.message);
      viewportAnalysis.error = error.message;
      report.viewports.push(viewportAnalysis);
      await context.close();
    }
  }

  await browser.close();

  // Save report
  const reportPath = path.join(screenshotsDir, 'analysis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n✅ Analysis complete! Report saved to: ${reportPath}`);

  return report;
}

// Run the analysis
analyzeMobileDesign().then(report => {
  console.log('\n📊 SUMMARY:');
  console.log(`Analyzed ${report.viewports.length} viewports`);
  console.log(`Screenshots saved to: mobile-screenshots/`);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
