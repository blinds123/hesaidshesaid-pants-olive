const { test, expect } = require('@playwright/test');

test('E2E Test B - $19 Pre-Order Popup Flow', async ({ page }) => {
  const result = {
    test: "B - $19 Popup Flow",
    page_loaded: false,
    size_selected: false,
    secondary_cta_clicked: false,
    popup_appeared: false,
    popup_shows_correct_price: false,
    decline_clicked: false,
    redirected: false,
    final_url: null,
    passed: false,
    errors: []
  };

  try {
    // Step 1-2: Navigate and wait for page to load
    console.log('Step 1-2: Navigating to site...');
    await page.goto('https://seamlessblazer.netlify.app', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for main content - check for size buttons
    await page.waitForSelector('.size-btn', { timeout: 10000 });
    result.page_loaded = true;
    console.log('✓ Page loaded successfully');

    // Step 3-4: Find and click size selector
    console.log('Step 3-4: Selecting size...');

    // Scroll to size buttons
    await page.evaluate(() => {
      const sizeButton = document.querySelector('.size-btn');
      if (sizeButton) {
        sizeButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    await page.waitForTimeout(1000);

    // Click size S (3rd button, index 2)
    const sizeButtons = page.locator('.size-btn');
    const sButton = sizeButtons.nth(2); // S is the 3rd button
    await sButton.click();
    await page.waitForTimeout(500);

    result.size_selected = true;
    console.log('✓ Size S selected');

    // Step 5: Scroll to secondary CTA
    console.log('Step 5: Scrolling to secondary CTA...');
    await page.evaluate(() => {
      const secondaryCTA = document.getElementById('secondaryCTA');
      if (secondaryCTA) {
        secondaryCTA.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    await page.waitForTimeout(1000);

    // Step 6: Click secondary CTA button
    console.log('Step 6: Clicking secondary CTA...');
    const secondaryCTA = page.locator('#secondaryCTA');
    await secondaryCTA.waitFor({ state: 'visible', timeout: 10000 });
    await secondaryCTA.click();
    result.secondary_cta_clicked = true;
    console.log('✓ Secondary CTA clicked');

    // Step 7-8: Wait for popup and verify pricing
    console.log('Step 7-8: Waiting for popup...');
    await page.waitForSelector('#orderBumpPopup', {
      state: 'visible',
      timeout: 10000
    });
    result.popup_appeared = true;
    console.log('✓ Popup appeared');

    // Verify $19 pricing in popup
    const popupContent = await page.locator('#orderBumpPopup').textContent();
    console.log('Popup content preview:', popupContent.substring(0, 200));

    // Check for $19 pricing
    if (popupContent.includes('$19') || popupContent.includes('19')) {
      result.popup_shows_correct_price = true;
      console.log('✓ Popup shows $19 pricing');
    } else {
      result.errors.push('Popup does not show $19 pricing');
      console.log('✗ Popup pricing issue');
    }

    // Step 9: Click decline button
    console.log('Step 9: Clicking decline button...');
    const declineButton = page.locator('#orderBumpPopup button:has-text("No thanks")');
    await declineButton.waitFor({ state: 'visible', timeout: 5000 });
    await declineButton.click();
    result.decline_clicked = true;
    console.log('✓ Decline button clicked');

    // Step 10: Wait for redirect
    console.log('Step 10: Waiting for redirect...');

    // Wait for navigation to start
    try {
      await page.waitForURL(/simpleswap\.io/, { timeout: 10000, waitUntil: 'domcontentloaded' });
    } catch (e) {
      // Navigation started but may not have fully loaded, check URL anyway
      console.log('Navigation timeout, checking current URL...');
    }

    // Wait a bit more for the page to settle
    await page.waitForTimeout(2000);

    const finalUrl = page.url();
    result.final_url = finalUrl;

    if (finalUrl.includes('simpleswap.io')) {
      result.redirected = true;
      console.log('✓ Redirected to simpleswap.io');
      console.log(`Final URL: ${finalUrl}`);
    } else {
      result.errors.push(`Expected redirect to simpleswap.io, got ${finalUrl}`);
      console.log('✗ Redirect failed');
    }

    // Determine overall pass/fail
    result.passed = result.page_loaded &&
                    result.size_selected &&
                    result.secondary_cta_clicked &&
                    result.popup_appeared &&
                    result.popup_shows_correct_price &&
                    result.decline_clicked &&
                    result.redirected;

  } catch (error) {
    result.errors.push(error.message);
    console.error('Test error:', error.message);
  }

  // Output result as JSON
  console.log('\n' + '='.repeat(80));
  console.log('TEST RESULT:');
  console.log('='.repeat(80));
  console.log(JSON.stringify(result, null, 2));
  console.log('='.repeat(80));

  // Assert test passed
  expect(result.passed).toBe(true);
});
