const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const results = {
    test: "B - $19 Popup Flow",
    page_loaded: false,
    size_selected: false,
    popup_appeared: false,
    popup_shows_correct_price: false,
    redirect_url: null,
    passed: false,
    errors: []
  };

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();

    // Step 1: Navigate to site
    console.log('Step 1: Navigating to https://seamlessblazer.netlify.app');
    const response = await page.goto('https://seamlessblazer.netlify.app', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    if (response && response.ok()) {
      results.page_loaded = true;
      console.log('✓ Page loaded successfully');
    } else {
      results.errors.push(`Page load failed with status: ${response?.status()}`);
    }

    // Wait for page to be fully interactive
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Step 2: Select a size
    console.log('Step 2: Selecting a size');
    const sizeButtons = await page.locator('.size-btn:not(:disabled)').all();

    if (sizeButtons.length > 0) {
      await sizeButtons[0].click();
      await page.waitForTimeout(500);
      results.size_selected = true;
      console.log('✓ Size selected');
    } else {
      results.errors.push('No enabled size buttons found');
    }

    // Step 3: Click secondary CTA (#secondaryCTA - "PRE-ORDER FOR 68% OFF - $19")
    console.log('Step 3: Clicking secondary CTA button');
    const secondaryCTA = page.locator('#secondaryCTA');
    const ctaExists = await secondaryCTA.count() > 0;

    if (ctaExists) {
      const ctaText = await secondaryCTA.textContent();
      console.log(`Secondary CTA text: "${ctaText}"`);

      await secondaryCTA.click();
      await page.waitForTimeout(1000);
      console.log('✓ Secondary CTA clicked');
    } else {
      results.errors.push('Secondary CTA button (#secondaryCTA) not found');
    }

    // Step 4: Verify popup appears with correct pricing
    console.log('Step 4: Checking for popup with correct pricing');
    const popup = page.locator('#orderBumpPopup, .popup-overlay, [id*="popup"]');
    const popupVisible = await popup.isVisible().catch(() => false);

    if (popupVisible) {
      results.popup_appeared = true;
      console.log('✓ Popup appeared');

      // Check for pricing information
      const popupContent = await popup.textContent();
      console.log('Popup content snippet:', popupContent.substring(0, 200));

      // Look for $19 base price and $10 bustier price
      const has19Price = popupContent.includes('$19') || popupContent.includes('19');
      const has10Price = popupContent.includes('$10') || popupContent.includes('10');
      const has29Total = popupContent.includes('$29') || popupContent.includes('29');

      if (has19Price && has10Price && has29Total) {
        results.popup_shows_correct_price = true;
        console.log('✓ Popup shows correct pricing ($19 + $10 = $29)');
      } else {
        results.errors.push(`Popup pricing incomplete: $19=${has19Price}, $10=${has10Price}, $29=${has29Total}`);
      }
    } else {
      results.errors.push('Popup did not appear after clicking secondary CTA');
    }

    // Step 5: Click decline button
    console.log('Step 5: Clicking decline button');
    const declineButton = page.locator('button:has-text("No thanks"), button:has-text("just the pants"), .decline-btn, #declineOffer');
    const declineExists = await declineButton.count() > 0;

    if (declineExists) {
      const declineText = await declineButton.first().textContent();
      console.log(`Decline button text: "${declineText}"`);

      // Listen for navigation
      const navigationPromise = page.waitForURL(/simpleswap\.io/, { timeout: 10000 }).catch(() => null);

      await declineButton.first().click();
      console.log('✓ Decline button clicked');

      // Wait for redirect
      await page.waitForTimeout(2000);

      // Step 6: Verify redirect to simpleswap.io
      console.log('Step 6: Checking redirect URL');
      const currentURL = page.url();
      console.log(`Current URL: ${currentURL}`);

      if (currentURL.includes('simpleswap.io')) {
        results.redirect_url = currentURL;
        console.log('✓ Redirected to simpleswap.io');

        // Verify it's for $19 exchange (check URL parameters)
        const url = new URL(currentURL);
        const amount = url.searchParams.get('amount') || url.searchParams.get('fixedAmount');
        console.log(`Exchange amount in URL: ${amount}`);
      } else {
        results.errors.push(`Did not redirect to simpleswap.io. Current URL: ${currentURL}`);
      }
    } else {
      results.errors.push('Decline button not found in popup');
    }

    // Determine if test passed
    results.passed = results.page_loaded &&
                     results.size_selected &&
                     results.popup_appeared &&
                     results.popup_shows_correct_price &&
                     results.redirect_url !== null &&
                     results.redirect_url.includes('simpleswap.io');

    console.log('\n=== TEST RESULTS ===');
    console.log(JSON.stringify(results, null, 2));

  } catch (error) {
    results.errors.push(`Test execution error: ${error.message}`);
    console.error('Test failed with error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }

    // Write results to file
    const outputDir = path.join('/Users/nelsonchan/Downloads/secretjeans TEMPLATE SMALL copy/state');
    const outputFile = path.join(outputDir, 'test-b.json');

    // Create state directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    console.log(`\n✓ Results written to: ${outputFile}`);
  }
})();
