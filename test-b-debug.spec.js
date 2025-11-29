const { test, expect } = require('@playwright/test');

test('Debug - Check page structure', async ({ page }) => {
  await page.goto('https://seamlessblazer.netlify.app', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  // Take screenshot
  await page.screenshot({ path: 'debug-page.png', fullPage: true });

  // Get page content
  const bodyHTML = await page.locator('body').innerHTML();
  console.log('=== PAGE HTML (first 2000 chars) ===');
  console.log(bodyHTML.substring(0, 2000));

  // Check for various selectors
  const selectors = [
    '.size-selector',
    '#sizeSelector',
    '[class*="size"]',
    'button[class*="size"]',
    '#secondaryCTA',
    '[id*="CTA"]',
    'button'
  ];

  for (const selector of selectors) {
    const count = await page.locator(selector).count();
    console.log(`Selector "${selector}": ${count} elements found`);
  }

  // Get all button text
  const buttons = await page.locator('button').all();
  console.log(`\n=== Found ${buttons.length} buttons ===`);
  for (let i = 0; i < buttons.length; i++) {
    const text = await buttons[i].textContent();
    const id = await buttons[i].getAttribute('id');
    const className = await buttons[i].getAttribute('class');
    console.log(`Button ${i}: "${text?.trim()}" [id="${id}", class="${className}"]`);
  }
});
