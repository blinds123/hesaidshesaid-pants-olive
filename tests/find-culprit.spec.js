const { test } = require('@playwright/test');

const SITE_URL = 'https://hesaidshesaid-pants.netlify.app';

test('Find the exact element causing container overflow', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(SITE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  console.log('\n🔍 FINDING CULPRIT INSIDE .container');
  console.log('='.repeat(60));

  // Check all children of .container
  const containerChildren = await page.evaluate(() => {
    const container = document.querySelector('.container');
    if (!container) return null;

    const children = Array.from(container.children);
    const results = [];

    children.forEach((child, index) => {
      const rect = child.getBoundingClientRect();
      const styles = window.getComputedStyle(child);

      results.push({
        index,
        tag: child.tagName,
        class: child.className,
        id: child.id,
        rectWidth: rect.width,
        scrollWidth: child.scrollWidth,
        offsetWidth: child.offsetWidth,
        computedWidth: styles.width,
        marginLeft: styles.marginLeft,
        marginRight: styles.marginRight,
        paddingLeft: styles.paddingLeft,
        paddingRight: styles.paddingRight,
        boxSizing: styles.boxSizing,
        overflow: `${styles.overflowX} / ${styles.overflowY}`
      });
    });

    return {
      containerScrollWidth: container.scrollWidth,
      containerOffsetWidth: container.offsetWidth,
      children: results
    };
  });

  console.log('\n📦 CONTAINER & ITS CHILDREN:');
  console.log(JSON.stringify(containerChildren, null, 2));

  // Check for any element that extends beyond container width
  const wideElements = await page.evaluate(() => {
    const container = document.querySelector('.container');
    if (!container) return [];

    const allDescendants = container.querySelectorAll('*');
    const containerLeft = container.getBoundingClientRect().left;
    const containerRight = container.getBoundingClientRect().right;
    const containerWidth = container.getBoundingClientRect().width;

    const results = [];

    allDescendants.forEach(el => {
      const rect = el.getBoundingClientRect();
      const styles = window.getComputedStyle(el);

      // Check if element extends beyond container
      if (rect.right > containerRight + 1 || rect.left < containerLeft - 1) {
        results.push({
          tag: el.tagName,
          class: el.className,
          id: el.id,
          rectWidth: rect.width,
          rectLeft: rect.left,
          rectRight: rect.right,
          containerLeft,
          containerRight,
          extendsRightBy: rect.right - containerRight,
          extendsLeftBy: containerLeft - rect.left,
          position: styles.position,
          transform: styles.transform
        });
      }
    });

    return results.slice(0, 20); // Top 20
  });

  console.log('\n🚨 ELEMENTS EXTENDING BEYOND CONTAINER:');
  console.log(JSON.stringify(wideElements, null, 2));

  // Specifically check hero section
  const heroInfo = await page.evaluate(() => {
    const hero = document.querySelector('.hero, [class*="hero"]');
    if (!hero) return null;

    const rect = hero.getBoundingClientRect();
    const styles = window.getComputedStyle(hero);

    return {
      tag: hero.tagName,
      class: hero.className,
      rectWidth: rect.width,
      scrollWidth: hero.scrollWidth,
      computedWidth: styles.width,
      marginLeft: styles.marginLeft,
      marginRight: styles.marginRight,
      paddingLeft: styles.paddingLeft,
      paddingRight: styles.paddingRight
    };
  });

  console.log('\n🎯 HERO SECTION INFO:');
  console.log(JSON.stringify(heroInfo, null, 2));
});
