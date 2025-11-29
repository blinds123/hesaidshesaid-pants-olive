const { test, expect, devices } = require('@playwright/test');

const SITE_URL = 'https://hesaidshesaid-pants.netlify.app';

test.describe('Mobile E2E Verification After Fixes - CORRECTED', () => {

  test('TEST 1: Verify No Horizontal Scroll (iPhone SE 375px)', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 }
    });
    const page = await context.newPage();

    console.log('\n🧪 TEST 1: Checking horizontal scroll on iPhone SE (375x667)...');

    await page.goto(SITE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const scrollInfo = await page.evaluate(() => {
      return {
        viewportWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        htmlMaxWidth: window.getComputedStyle(document.documentElement).maxWidth,
        bodyMaxWidth: window.getComputedStyle(document.body).maxWidth
      };
    });

    console.log(JSON.stringify(scrollInfo, null, 2));

    const passed = scrollInfo.documentWidth <= 375 && scrollInfo.bodyWidth <= 375;
    console.log(`✅ TEST 1 PASSED: ${passed}`);

    await context.close();

    return {
      test_name: 'TEST 1: Horizontal Scroll',
      viewport_width: 375,
      document_scroll_width: scrollInfo.documentWidth,
      body_scroll_width: scrollInfo.bodyWidth,
      passed: passed
    };
  });

  test('TEST 1b: Verify No Horizontal Scroll (iPhone 12/13 390px)', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();

    console.log('\n🧪 TEST 1b: Checking horizontal scroll on iPhone 12/13 (390x844)...');

    await page.goto(SITE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const scrollInfo = await page.evaluate(() => {
      return {
        viewportWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth
      };
    });

    console.log(JSON.stringify(scrollInfo, null, 2));

    const passed = scrollInfo.documentWidth <= 390 && scrollInfo.bodyWidth <= 390;
    console.log(`✅ TEST 1b PASSED: ${passed}`);

    await context.close();

    return {
      test_name: 'TEST 1b: Horizontal Scroll 390px',
      viewport_width: 390,
      document_scroll_width: scrollInfo.documentWidth,
      body_scroll_width: scrollInfo.bodyWidth,
      passed: passed
    };
  });

  test('TEST 2: $59 Flow on Mobile', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();

    console.log('\n🧪 TEST 2: Testing $59 flow...');

    await page.goto(SITE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Step 1: Select a size (using correct class name)
    console.log('Step 1: Selecting size...');
    const sizeButton = page.locator('button.size-btn').first();
    await sizeButton.scrollIntoViewIfNeeded();
    await sizeButton.click();
    await page.waitForTimeout(500);

    const sizeSelected = await sizeButton.evaluate(el => el.classList.contains('selected'));
    console.log(`Size selected: ${sizeSelected}`);

    // Step 2: Click primary CTA (using correct ID)
    console.log('Step 2: Clicking primary CTA ($59)...');
    const primaryCTA = page.locator('#primaryCTA');
    await primaryCTA.scrollIntoViewIfNeeded();
    await primaryCTA.click();
    await page.waitForTimeout(1500);

    // Step 3: Check if popup appeared (using correct ID)
    console.log('Step 3: Checking popup...');
    const popup = page.locator('#orderBumpPopup');
    const popupVisible = await popup.isVisible();
    console.log(`Popup appeared: ${popupVisible}`);

    // Step 4: Check button sizes
    if (popupVisible) {
      const acceptButton = page.locator('#acceptBumpBtn');
      const declineButton = page.locator('#declineBumpBtn');

      const acceptHeight = await acceptButton.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return parseFloat(styles.height);
      });

      const declineHeight = await declineButton.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return parseFloat(styles.height);
      });

      console.log(`Accept button height: ${acceptHeight}px`);
      console.log(`Decline button height: ${declineHeight}px`);
      console.log(`Both buttons ≥ 52px: ${acceptHeight >= 52 && declineHeight >= 52}`);
    }

    // Step 5: Click decline button
    console.log('Step 4: Clicking decline button...');
    const declineButton = page.locator('#declineBumpBtn');

    let redirectUrl = '';
    let declineWorked = false;

    if (await declineButton.isVisible()) {
      const [response] = await Promise.all([
        page.waitForURL(/simpleswap\.io/, { timeout: 10000 }).catch(() => null),
        declineButton.click()
      ]);

      await page.waitForTimeout(2000);
      redirectUrl = page.url();
      declineWorked = redirectUrl.includes('simpleswap.io');
      console.log(`Redirect URL: ${redirectUrl}`);
      console.log(`Decline worked: ${declineWorked}`);
    }

    const passed = sizeSelected && popupVisible && declineWorked;
    console.log(`✅ TEST 2 PASSED: ${passed}`);

    await context.close();

    return {
      test_name: 'TEST 2: $59 Flow',
      size_selected: sizeSelected,
      popup_appeared: popupVisible,
      decline_worked: declineWorked,
      redirect_url: redirectUrl,
      passed: passed
    };
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
    const sizeButton = page.locator('button.size-btn').nth(1);
    await sizeButton.scrollIntoViewIfNeeded();
    await sizeButton.click();
    await page.waitForTimeout(500);

    const sizeSelected = await sizeButton.evaluate(el => el.classList.contains('selected'));
    console.log(`Size selected: ${sizeSelected}`);

    // Step 2: Click secondary CTA ($19 button)
    console.log('Step 2: Clicking $19 CTA...');
    const secondaryCTA = page.locator('#secondaryCTA');
    await secondaryCTA.scrollIntoViewIfNeeded();
    await secondaryCTA.click();
    await page.waitForTimeout(1500);

    // Step 3: Check if popup appeared
    console.log('Step 3: Checking popup...');
    const popup = page.locator('#orderBumpPopup');
    const popupVisible = await popup.isVisible();
    console.log(`Popup appeared: ${popupVisible}`);

    // Step 4: Click decline button
    console.log('Step 4: Clicking decline button...');
    const declineButton = page.locator('#declineBumpBtn');

    let redirectUrl = '';
    let declineWorked = false;

    if (await declineButton.isVisible()) {
      const [response] = await Promise.all([
        page.waitForURL(/simpleswap\.io/, { timeout: 10000 }).catch(() => null),
        declineButton.click()
      ]);

      await page.waitForTimeout(2000);
      redirectUrl = page.url();
      declineWorked = redirectUrl.includes('simpleswap.io');
      console.log(`Redirect URL: ${redirectUrl}`);
      console.log(`Decline worked: ${declineWorked}`);
    }

    const passed = sizeSelected && popupVisible && declineWorked;
    console.log(`✅ TEST 3 PASSED: ${passed}`);

    await context.close();

    return {
      test_name: 'TEST 3: $19 Flow',
      size_selected: sizeSelected,
      popup_appeared: popupVisible,
      decline_worked: declineWorked,
      redirect_url: redirectUrl,
      passed: passed
    };
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
    const stickyBar = page.locator('#stickyMobileCTA');
    const initiallyVisible = await stickyBar.isVisible();
    console.log(`Sticky bar initially visible: ${initiallyVisible}`);

    // Scroll down 400px
    console.log('Step 2: Scrolling down 400px...');
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(1000);

    // Check if sticky bar appeared (check display style)
    const stickyInfo = await page.evaluate(() => {
      const sticky = document.getElementById('stickyMobileCTA');
      if (sticky) {
        const styles = window.getComputedStyle(sticky);
        const rect = sticky.getBoundingClientRect();
        return {
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          position: styles.position,
          bottom: styles.bottom,
          isInViewport: rect.bottom > 0 && rect.top < window.innerHeight,
          classList: sticky.className
        };
      }
      return null;
    });

    console.log('Sticky bar info after scroll:', JSON.stringify(stickyInfo, null, 2));

    const appearedAfterScroll = stickyInfo && stickyInfo.display !== 'none' &&
                                 stickyInfo.visibility !== 'hidden' &&
                                 parseFloat(stickyInfo.opacity) > 0;

    console.log(`Sticky bar appeared after scroll: ${appearedAfterScroll}`);

    // Test if buttons work
    let buttonsWork = false;
    if (appearedAfterScroll) {
      console.log('Step 3: Testing sticky bar buttons...');

      // First select a size
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
      const sizeButton = page.locator('button.size-btn').first();
      await sizeButton.click();
      await page.waitForTimeout(500);

      // Scroll back down
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(500);

      // Click sticky bar primary button
      const stickyPrimaryButton = stickyBar.locator('button.cta-btn.cta-primary').first();
      await stickyPrimaryButton.click();
      await page.waitForTimeout(1500);

      // Check if popup appeared
      const popup = page.locator('#orderBumpPopup');
      buttonsWork = await popup.isVisible();
      console.log(`Sticky button triggered popup: ${buttonsWork}`);
    }

    const passed = appearedAfterScroll && buttonsWork;
    console.log(`✅ TEST 4 PASSED: ${passed}`);

    await context.close();

    return {
      test_name: 'TEST 4: Sticky CTA Bar',
      appeared_after_scroll: appearedAfterScroll,
      buttons_work: buttonsWork,
      passed: passed
    };
  });

  test('TEST 5: Above-the-Fold Content', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();

    console.log('\n🧪 TEST 5: Testing above-the-fold content...');

    await page.goto(SITE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({
      path: '/Users/nelsonchan/Downloads/secretjeans TEMPLATE SMALL copy/tests/above-fold-final.png',
      fullPage: false
    });
    console.log('Screenshot saved: above-fold-final.png');

    // Check if price and CTA are visible
    const aboveFoldInfo = await page.evaluate(() => {
      const viewportHeight = window.innerHeight;

      // Find price
      const priceEl = document.querySelector('#primaryCTA, #secondaryCTA');
      const priceRect = priceEl ? priceEl.getBoundingClientRect() : null;
      const priceVisible = priceRect && priceRect.top < viewportHeight && priceRect.top >= 0;

      // Find CTA buttons
      const primaryCTA = document.getElementById('primaryCTA');
      const primaryRect = primaryCTA ? primaryCTA.getBoundingClientRect() : null;
      const primaryVisible = primaryRect && primaryRect.top < viewportHeight && primaryRect.top >= 0;

      const secondaryCTA = document.getElementById('secondaryCTA');
      const secondaryRect = secondaryCTA ? secondaryCTA.getBoundingClientRect() : null;
      const secondaryVisible = secondaryRect && secondaryRect.top < viewportHeight && secondaryRect.top >= 0;

      return {
        viewportHeight,
        priceVisible,
        pricePosition: priceRect ? priceRect.top : null,
        primaryCTAVisible: primaryVisible,
        primaryCTAPosition: primaryRect ? primaryRect.top : null,
        secondaryCTAVisible: secondaryVisible,
        secondaryCTAPosition: secondaryRect ? secondaryRect.top : null
      };
    });

    console.log('Above-fold info:', JSON.stringify(aboveFoldInfo, null, 2));

    const passed = aboveFoldInfo.priceVisible &&
                   (aboveFoldInfo.primaryCTAVisible || aboveFoldInfo.secondaryCTAVisible);

    console.log(`✅ TEST 5 PASSED: ${passed}`);

    await context.close();

    return {
      test_name: 'TEST 5: Above-the-Fold',
      price_visible: aboveFoldInfo.priceVisible,
      cta_visible: aboveFoldInfo.primaryCTAVisible || aboveFoldInfo.secondaryCTAVisible,
      passed: passed
    };
  });
});
