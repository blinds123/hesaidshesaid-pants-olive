const { test } = require('@playwright/test');

const SITE_URL = 'https://hesaidshesaid-pants.netlify.app';

test('Debug: Find what causes 7px overflow on iPhone SE', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(SITE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  console.log('\n🔍 DEBUGGING 7PX OVERFLOW ON IPHONE SE (375px)');
  console.log('='.repeat(60));

  // Find ALL elements wider than 375px
  const overflowingElements = await page.evaluate(() => {
    const allElements = document.querySelectorAll('*');
    const results = [];

    allElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const styles = window.getComputedStyle(el);

      // Check if element is wider than viewport
      if (rect.width > 375 || el.scrollWidth > 375) {
        results.push({
          tag: el.tagName,
          class: el.className,
          id: el.id,
          rectWidth: rect.width,
          scrollWidth: el.scrollWidth,
          offsetWidth: el.offsetWidth,
          computedWidth: styles.width,
          paddingLeft: styles.paddingLeft,
          paddingRight: styles.paddingRight,
          marginLeft: styles.marginLeft,
          marginRight: styles.marginRight,
          boxSizing: styles.boxSizing,
          position: styles.position
        });
      }
    });

    return results;
  });

  console.log('\n📏 ELEMENTS WIDER THAN 375PX:');
  console.log(JSON.stringify(overflowingElements, null, 2));

  // Check body specifically
  const bodyInfo = await page.evaluate(() => {
    const body = document.body;
    const styles = window.getComputedStyle(body);

    return {
      scrollWidth: body.scrollWidth,
      offsetWidth: body.offsetWidth,
      clientWidth: body.clientWidth,
      computedWidth: styles.width,
      maxWidth: styles.maxWidth,
      paddingLeft: styles.paddingLeft,
      paddingRight: styles.paddingRight,
      marginLeft: styles.marginLeft,
      marginRight: styles.marginRight,
      overflowX: styles.overflowX,
      boxSizing: styles.boxSizing
    };
  });

  console.log('\n📦 BODY ELEMENT INFO:');
  console.log(JSON.stringify(bodyInfo, null, 2));

  // Check for any fixed/absolute positioned elements
  const fixedElements = await page.evaluate(() => {
    const allElements = document.querySelectorAll('*');
    const results = [];

    allElements.forEach(el => {
      const styles = window.getComputedStyle(el);
      if (styles.position === 'fixed' || styles.position === 'absolute') {
        const rect = el.getBoundingClientRect();
        results.push({
          tag: el.tagName,
          class: el.className,
          id: el.id,
          position: styles.position,
          width: rect.width,
          left: styles.left,
          right: styles.right,
          transform: styles.transform
        });
      }
    });

    return results;
  });

  console.log('\n📍 FIXED/ABSOLUTE POSITIONED ELEMENTS:');
  console.log(JSON.stringify(fixedElements, null, 2));

  // Take screenshot
  await page.screenshot({
    path: '/Users/nelsonchan/Downloads/secretjeans TEMPLATE SMALL copy/tests/iphone-se-debug.png',
    fullPage: true
  });
  console.log('\n📸 Screenshot saved: iphone-se-debug.png');
});
