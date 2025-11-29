const { test, expect, devices } = require('@playwright/test');

const SITE_URL = 'https://hesaidshesaid-pants.netlify.app';

test.describe('Mobile E2E Verification After Fixes', () => {

  test('TEST 1: Verify No Horizontal Scroll (iPhone SE)', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone SE'],
      viewport: { width: 375, height: 667 }
    });
    const page = await context.newPage();

    console.log('\n🧪 TEST 1: Checking horizontal scroll on iPhone SE (375x667)...');

    await page.goto(SITE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const viewportWidth = 375;
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);

    console.log(`Viewport Width: ${viewportWidth}px`);
    console.log(`Document Scroll Width: ${scrollWidth}px`);
    console.log(`Body Scroll Width: ${bodyScrollWidth}px`);

    const passed = scrollWidth <= viewportWidth && bodyScrollWidth <= viewportWidth;
    console.log(`✅ TEST 1 PASSED: ${passed}`);

    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth);

    await context.close();
  });

  test('TEST 2: $59 Flow on Mobile', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();

    console.log('\n🧪 TEST 2: Testing $59 flow...');

    await page.goto(SITE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Step 1: Select a size
    console.log('Step 1: Selecting size...');
    const sizeButton = page.locator('.size-option').first();
    await sizeButton.scrollIntoViewIfNeeded();
    await sizeButton.click();
    await page.waitForTimeout(500);

    const sizeSelected = await sizeButton.evaluate(el => el.classList.contains('selected'));
    console.log(`Size selected: ${sizeSelected}`);

    // Step 2: Click primary CTA
    console.log('Step 2: Clicking primary CTA...');
    const primaryCTA = page.locator('button.cta-button').first();
    await primaryCTA.scrollIntoViewIfNeeded();
    await primaryCTA.click();
    await page.waitForTimeout(1000);

    // Step 3: Check if popup appeared
    console.log('Step 3: Checking popup...');
    const popup = page.locator('#upsellPopup, .popup-overlay');
    const popupVisible = await popup.isVisible();
    console.log(`Popup appeared: ${popupVisible}`);

    // Step 4: Check button sizes (should be min 52px on mobile)
    const popupButtons = page.locator('#upsellPopup button, .popup-overlay button');
    const buttonCount = await popupButtons.count();

    if (buttonCount > 0) {
      const firstButtonHeight = await popupButtons.first().evaluate(el => {
        const styles = window.getComputedStyle(el);
        return parseFloat(styles.height);
      });
      console.log(`Popup button height: ${firstButtonHeight}px (should be ≥ 52px)`);
    }

    // Step 5: Click decline button
    console.log('Step 4: Clicking decline button...');
    const declineButton = page.locator('button:has-text("No thanks")').or(
      page.locator('button:has-text("just the pants")')
    ).first();

    let redirectUrl = '';
    let declineWorked = false;

    if (await declineButton.isVisible()) {
      // Listen for navigation
      const navigationPromise = page.waitForURL(/simpleswap\.io/, { timeout: 10000 }).catch(() => null);
      await declineButton.click();
      await navigationPromise;

      redirectUrl = page.url();
      declineWorked = redirectUrl.includes('simpleswap.io');
      console.log(`Redirect URL: ${redirectUrl}`);
      console.log(`Decline worked: ${declineWorked}`);
    }

    const passed = sizeSelected && popupVisible && declineWorked;
    console.log(`✅ TEST 2 PASSED: ${passed}`);

    expect(passed).toBeTruthy();

    await context.close();
  });

  test('TEST 3: $19 Flow on Mobile', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();

    console.log('\n🧪 TEST 3: Testing $19 flow...');

    await page.goto(SITE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Step 1: Select a size
    console.log('Step 1: Selecting size...');
    const sizeButton = page.locator('.size-option').nth(1);
    await sizeButton.scrollIntoViewIfNeeded();
    await sizeButton.click();
    await page.waitForTimeout(500);

    const sizeSelected = await sizeButton.evaluate(el => el.classList.contains('selected'));
    console.log(`Size selected: ${sizeSelected}`);

    // Step 2: Click secondary CTA ($19 button)
    console.log('Step 2: Clicking $19 CTA...');
    const secondaryCTA = page.locator('button.cta-button.secondary, button:has-text("$19")').first();
    await secondaryCTA.scrollIntoViewIfNeeded();
    await secondaryCTA.click();
    await page.waitForTimeout(1000);

    // Step 3: Check if popup appeared
    console.log('Step 3: Checking popup...');
    const popup = page.locator('#upsellPopup, .popup-overlay');
    const popupVisible = await popup.isVisible();
    console.log(`Popup appeared: ${popupVisible}`);

    // Step 4: Click decline button
    console.log('Step 4: Clicking decline button...');
    const declineButton = page.locator('button:has-text("No thanks")').or(
      page.locator('button:has-text("just the pants")')
    ).first();

    let redirectUrl = '';
    let declineWorked = false;

    if (await declineButton.isVisible()) {
      const navigationPromise = page.waitForURL(/simpleswap\.io/, { timeout: 10000 }).catch(() => null);
      await declineButton.click();
      await navigationPromise;

      redirectUrl = page.url();
      declineWorked = redirectUrl.includes('simpleswap.io');
      console.log(`Redirect URL: ${redirectUrl}`);
      console.log(`Decline worked: ${declineWorked}`);
    }

    const passed = sizeSelected && popupVisible && declineWorked;
    console.log(`✅ TEST 3 PASSED: ${passed}`);

    expect(passed).toBeTruthy();

    await context.close();
  });

  test('TEST 4: Sticky CTA Bar', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();

    console.log('\n🧪 TEST 4: Testing sticky CTA bar...');

    await page.goto(SITE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Check initial state (should be hidden)
    console.log('Step 1: Checking initial state (should be hidden)...');
    const stickyBar = page.locator('.sticky-cta-bar, #stickyCTA');
    const initiallyVisible = await stickyBar.isVisible().catch(() => false);
    console.log(`Sticky bar initially visible: ${initiallyVisible}`);

    // Scroll down 400px
    console.log('Step 2: Scrolling down 400px...');
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(1000);

    // Check if sticky bar appeared
    const appearedAfterScroll = await stickyBar.isVisible().catch(() => false);
    console.log(`Sticky bar appeared after scroll: ${appearedAfterScroll}`);

    // Check if buttons work
    let buttonsWork = false;
    if (appearedAfterScroll) {
      console.log('Step 3: Testing sticky bar buttons...');

      // First select a size
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
      const sizeButton = page.locator('.size-option').first();
      await sizeButton.scrollIntoViewIfNeeded();
      await sizeButton.click();
      await page.waitForTimeout(500);

      // Scroll back down to see sticky bar
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(500);

      // Click sticky bar button
      const stickyButton = stickyBar.locator('button').first();
      if (await stickyButton.isVisible()) {
        await stickyButton.click();
        await page.waitForTimeout(1000);

        // Check if popup appeared
        const popup = page.locator('#upsellPopup, .popup-overlay');
        buttonsWork = await popup.isVisible();
        console.log(`Sticky button triggered popup: ${buttonsWork}`);
      }
    }

    const passed = appearedAfterScroll && buttonsWork;
    console.log(`✅ TEST 4 PASSED: ${passed}`);

    expect(passed).toBeTruthy();

    await context.close();
  });

  test('TEST 5: Above-the-Fold Content', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();

    console.log('\n🧪 TEST 5: Testing above-the-fold content...');

    await page.goto(SITE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Take screenshot of above-the-fold
    await page.screenshot({
      path: '/Users/nelsonchan/Downloads/secretjeans TEMPLATE SMALL copy/tests/above-fold-mobile.png',
      fullPage: false
    });
    console.log('Screenshot saved: above-fold-mobile.png');

    // Check if price is visible
    console.log('Step 1: Checking if price ($59) is visible...');
    const priceElement = page.locator('text=/\\$59/i').first();
    const priceInViewport = await priceElement.isVisible();

    if (priceInViewport) {
      const priceBox = await priceElement.boundingBox();
      console.log(`Price position: ${priceBox ? priceBox.y : 'unknown'}px from top`);
      console.log(`Price visible without scroll: ${priceBox ? priceBox.y < 844 : false}`);
    }

    // Check if at least one CTA is visible
    console.log('Step 2: Checking if CTA is visible...');
    const ctaButtons = page.locator('button.cta-button');
    const ctaCount = await ctaButtons.count();

    let ctaVisible = false;
    for (let i = 0; i < ctaCount; i++) {
      const isVisible = await ctaButtons.nth(i).isVisible();
      if (isVisible) {
        const box = await ctaButtons.nth(i).boundingBox();
        if (box && box.y < 844) {
          ctaVisible = true;
          console.log(`CTA ${i + 1} visible at ${box.y}px from top`);
          break;
        }
      }
    }

    const passed = priceInViewport && ctaVisible;
    console.log(`✅ TEST 5 PASSED: ${passed}`);

    expect(passed).toBeTruthy();

    await context.close();
  });

  test('FINAL: Generate Test Summary', async ({ browser }) => {
    console.log('\n' + '='.repeat(60));
    console.log('📊 MOBILE E2E VERIFICATION COMPLETE');
    console.log('='.repeat(60));
    console.log('\nAll tests completed. Check results above.');
  });
});
