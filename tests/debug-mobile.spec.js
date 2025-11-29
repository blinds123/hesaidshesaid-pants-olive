const { test, expect } = require('@playwright/test');

const SITE_URL = 'https://hesaidshesaid-pants.netlify.app';

test('Debug: Inspect page structure and elements', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(SITE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  console.log('\n🔍 DEBUGGING PAGE STRUCTURE');
  console.log('='.repeat(60));

  // Check body scroll width issue
  console.log('\n1️⃣ HORIZONTAL SCROLL CHECK:');
  const scrollInfo = await page.evaluate(() => {
    return {
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      htmlMaxWidth: window.getComputedStyle(document.documentElement).maxWidth,
      bodyMaxWidth: window.getComputedStyle(document.body).maxWidth,
      bodyOverflowX: window.getComputedStyle(document.body).overflowX
    };
  });
  console.log(JSON.stringify(scrollInfo, null, 2));

  // Find overflowing elements
  console.log('\n2️⃣ FINDING OVERFLOWING ELEMENTS:');
  const overflowingElements = await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    const overflowing = [];
    const viewportWidth = window.innerWidth;

    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > viewportWidth) {
        overflowing.push({
          tag: el.tagName,
          class: el.className,
          id: el.id,
          width: rect.width,
          computedWidth: window.getComputedStyle(el).width
        });
      }
    });

    return overflowing.slice(0, 10); // Top 10
  });
  console.log('Overflowing elements:', JSON.stringify(overflowingElements, null, 2));

  // Check for size selector elements
  console.log('\n3️⃣ SIZE SELECTOR CHECK:');
  const sizeSelectors = await page.evaluate(() => {
    const sizes = document.querySelectorAll('.size-option, [class*="size"]');
    return {
      count: sizes.length,
      classes: Array.from(sizes).map(el => ({
        tag: el.tagName,
        class: el.className,
        id: el.id,
        visible: el.offsetParent !== null
      }))
    };
  });
  console.log(JSON.stringify(sizeSelectors, null, 2));

  // Check for CTA buttons
  console.log('\n4️⃣ CTA BUTTONS CHECK:');
  const ctaButtons = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button, [class*="cta"]');
    return {
      count: buttons.length,
      buttons: Array.from(buttons).map(el => ({
        tag: el.tagName,
        class: el.className,
        id: el.id,
        text: el.textContent.substring(0, 50),
        visible: el.offsetParent !== null
      }))
    };
  });
  console.log(JSON.stringify(ctaButtons, null, 2));

  // Check for sticky bar
  console.log('\n5️⃣ STICKY BAR CHECK:');
  const stickyBar = await page.evaluate(() => {
    const sticky = document.querySelector('.sticky-cta-bar, #stickyCTA, [class*="sticky"]');
    if (sticky) {
      return {
        exists: true,
        class: sticky.className,
        id: sticky.id,
        visible: sticky.offsetParent !== null,
        display: window.getComputedStyle(sticky).display,
        position: window.getComputedStyle(sticky).position
      };
    }
    return { exists: false };
  });
  console.log(JSON.stringify(stickyBar, null, 2));

  // Check for popup
  console.log('\n6️⃣ POPUP CHECK:');
  const popup = await page.evaluate(() => {
    const popupEl = document.querySelector('#upsellPopup, .popup-overlay, [class*="popup"]');
    if (popupEl) {
      return {
        exists: true,
        class: popupEl.className,
        id: popupEl.id,
        visible: popupEl.offsetParent !== null,
        display: window.getComputedStyle(popupEl).display
      };
    }
    return { exists: false };
  });
  console.log(JSON.stringify(popup, null, 2));

  // Take full page screenshot
  await page.screenshot({
    path: '/Users/nelsonchan/Downloads/secretjeans TEMPLATE SMALL copy/tests/debug-full-page.png',
    fullPage: true
  });
  console.log('\n📸 Full page screenshot saved: debug-full-page.png');

  // Check HTML content
  console.log('\n7️⃣ HTML STRUCTURE:');
  const htmlStructure = await page.evaluate(() => {
    const body = document.body;
    return {
      bodyChildren: Array.from(body.children).map(el => ({
        tag: el.tagName,
        class: el.className,
        id: el.id
      }))
    };
  });
  console.log(JSON.stringify(htmlStructure, null, 2));
});
