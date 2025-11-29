const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const results = {
    test: "A - $59 Direct Flow",
    page_loaded: false,
    size_selected: false,
    popup_appeared: false,
    redirect_url: null,
    passed: false,
    errors: [],
    details: []
  };

  let browser;
  let page;

  try {
    console.log('🚀 Starting Test Agent A: $59 Direct Flow E2E Test\n');
    console.log('Site URL: https://seamlessblazer.netlify.app');
    console.log('Pool URL: https://simpleswap-automation-1.onrender.com\n');

    // Launch browser
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });
    page = await context.newPage();

    // Enable console logging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => {
      console.log('PAGE ERROR:', err.message);
      results.errors.push(`Page error: ${err.message}`);
    });

    // Step 1: Navigate to site
    console.log('📍 Step 1: Navigating to https://seamlessblazer.netlify.app');
    try {
      await page.goto('https://seamlessblazer.netlify.app', {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      results.details.push('Page navigation successful');
      console.log('✅ Page loaded successfully');
    } catch (error) {
      results.errors.push(`Navigation failed: ${error.message}`);
      console.log('❌ Navigation failed:', error.message);
      throw error;
    }

    // Step 2: Verify page loads (check for title or h1)
    console.log('\n📍 Step 2: Verifying page content');
    try {
      const title = await page.title();
      const h1 = await page.$('h1');
      const h1Text = h1 ? await h1.textContent() : 'No h1 found';

      console.log('Page title:', title);
      console.log('H1 content:', h1Text);

      if (title || h1) {
        results.page_loaded = true;
        results.details.push(`Page verified - Title: "${title}", H1: "${h1Text}"`);
        console.log('✅ Page content verified');
      } else {
        throw new Error('No title or h1 found on page');
      }
    } catch (error) {
      results.errors.push(`Page verification failed: ${error.message}`);
      console.log('❌ Page verification failed:', error.message);
    }

    // Take screenshot of initial page
    await page.screenshot({ path: '/Users/nelsonchan/Downloads/secretjeans TEMPLATE SMALL copy/state/test-a-step1.png' });
    console.log('📸 Screenshot saved: test-a-step1.png');

    // Step 3: Click a size button
    console.log('\n📍 Step 3: Selecting a size');
    try {
      // Wait for size buttons to be visible
      await page.waitForSelector('.size-button, button[data-size], .size-option', { timeout: 10000 });

      // Get all size buttons
      const sizeButtons = await page.$$('.size-button, button[data-size], .size-option');
      console.log(`Found ${sizeButtons.length} size buttons`);

      if (sizeButtons.length > 0) {
        // Click the first available size button
        await sizeButtons[0].click();
        await page.waitForTimeout(1000); // Wait for any animations

        results.size_selected = true;
        results.details.push('Size button clicked successfully');
        console.log('✅ Size selected');
      } else {
        throw new Error('No size buttons found on page');
      }
    } catch (error) {
      results.errors.push(`Size selection failed: ${error.message}`);
      console.log('❌ Size selection failed:', error.message);
    }

    await page.screenshot({ path: '/Users/nelsonchan/Downloads/secretjeans TEMPLATE SMALL copy/state/test-a-step2.png' });
    console.log('📸 Screenshot saved: test-a-step2.png');

    // Step 4: Click the primary CTA button
    console.log('\n📍 Step 4: Clicking primary CTA button');
    try {
      // Look for primary CTA button
      const ctaSelector = '#primaryCTA, .cta-primary, button.cta-primary, .primary-cta';
      await page.waitForSelector(ctaSelector, { timeout: 5000 });

      const ctaButton = await page.$(ctaSelector);
      if (ctaButton) {
        const buttonText = await ctaButton.textContent();
        console.log(`Found CTA button: "${buttonText}"`);

        await ctaButton.click();
        await page.waitForTimeout(2000); // Wait for popup animation

        results.details.push(`Primary CTA clicked: "${buttonText}"`);
        console.log('✅ CTA button clicked');
      } else {
        throw new Error('Primary CTA button not found');
      }
    } catch (error) {
      results.errors.push(`CTA click failed: ${error.message}`);
      console.log('❌ CTA click failed:', error.message);
    }

    await page.screenshot({ path: '/Users/nelsonchan/Downloads/secretjeans TEMPLATE SMALL copy/state/test-a-step3.png' });
    console.log('📸 Screenshot saved: test-a-step3.png');

    // Step 5: Verify the order bump popup appears
    console.log('\n📍 Step 5: Verifying order bump popup');
    try {
      // Look for order bump popup
      const popupSelector = '#orderBumpPopup, .order-bump-popup, .popup, [role="dialog"]';
      const popup = await page.$(popupSelector);

      if (popup) {
        const isVisible = await popup.isVisible();
        console.log('Popup found, visible:', isVisible);

        if (isVisible) {
          results.popup_appeared = true;
          results.details.push('Order bump popup appeared successfully');
          console.log('✅ Order bump popup is visible');
        } else {
          // Check computed style
          const display = await popup.evaluate(el => window.getComputedStyle(el).display);
          console.log('Popup display style:', display);

          if (display !== 'none') {
            results.popup_appeared = true;
            results.details.push('Order bump popup appeared (display not none)');
            console.log('✅ Order bump popup detected');
          } else {
            throw new Error('Popup exists but is not visible (display: none)');
          }
        }
      } else {
        throw new Error('Order bump popup not found');
      }
    } catch (error) {
      results.errors.push(`Popup verification failed: ${error.message}`);
      console.log('❌ Popup verification failed:', error.message);
    }

    await page.screenshot({ path: '/Users/nelsonchan/Downloads/secretjeans TEMPLATE SMALL copy/state/test-a-step4.png' });
    console.log('📸 Screenshot saved: test-a-step4.png');

    // Step 6: Click "No thanks, just the pants" (decline button)
    console.log('\n📍 Step 6: Clicking decline button');
    try {
      // Look for decline button
      const declineSelector = '.decline-button, #declineOrderBump, button:has-text("No thanks"), button:has-text("just the")';

      // Try multiple selectors
      let declineButton = await page.$('.decline-button');
      if (!declineButton) declineButton = await page.$('#declineOrderBump');
      if (!declineButton) {
        // Look for button with text containing "no thanks" or "just"
        const buttons = await page.$$('button');
        for (const btn of buttons) {
          const text = await btn.textContent();
          if (text && (text.toLowerCase().includes('no thanks') || text.toLowerCase().includes('just the'))) {
            declineButton = btn;
            break;
          }
        }
      }

      if (declineButton) {
        const buttonText = await declineButton.textContent();
        console.log(`Found decline button: "${buttonText}"`);

        // Set up navigation listener before clicking
        const navigationPromise = page.waitForNavigation({ timeout: 15000 }).catch(() => null);

        await declineButton.click();
        results.details.push(`Decline button clicked: "${buttonText}"`);
        console.log('✅ Decline button clicked');

        // Wait for navigation or timeout
        await Promise.race([
          navigationPromise,
          page.waitForTimeout(5000)
        ]);

      } else {
        throw new Error('Decline button not found');
      }
    } catch (error) {
      results.errors.push(`Decline button click failed: ${error.message}`);
      console.log('❌ Decline button click failed:', error.message);
    }

    await page.waitForTimeout(3000); // Wait for any redirect
    await page.screenshot({ path: '/Users/nelsonchan/Downloads/secretjeans TEMPLATE SMALL copy/state/test-a-step5.png' });
    console.log('📸 Screenshot saved: test-a-step5.png');

    // Step 7: Verify redirect to simpleswap.io OR exchange URL
    console.log('\n📍 Step 7: Verifying redirect');
    try {
      const currentUrl = page.url();
      console.log('Current URL:', currentUrl);

      if (currentUrl.includes('simpleswap.io') || currentUrl.includes('simpleswap')) {
        results.redirect_url = currentUrl;
        results.details.push(`Redirected to: ${currentUrl}`);
        console.log('✅ Successfully redirected to SimpleSwap');
      } else if (currentUrl !== 'https://seamlessblazer.netlify.app' && currentUrl !== 'https://seamlessblazer.netlify.app/') {
        results.redirect_url = currentUrl;
        results.details.push(`Redirected to alternate URL: ${currentUrl}`);
        console.log('⚠️  Redirected to alternate URL:', currentUrl);
      } else {
        // Check if there's a redirect happening via meta refresh or JavaScript
        const metaRefresh = await page.$('meta[http-equiv="refresh"]');
        if (metaRefresh) {
          const content = await metaRefresh.getAttribute('content');
          console.log('Meta refresh found:', content);
          results.details.push(`Meta refresh detected: ${content}`);

          // Wait for meta refresh to take effect
          await page.waitForTimeout(3000);
          const newUrl = page.url();
          if (newUrl !== currentUrl) {
            results.redirect_url = newUrl;
            console.log('✅ Redirected via meta refresh to:', newUrl);
          }
        } else {
          console.log('⚠️  No redirect detected - still on original site');
          results.details.push('No redirect occurred');
        }
      }
    } catch (error) {
      results.errors.push(`Redirect verification failed: ${error.message}`);
      console.log('❌ Redirect verification failed:', error.message);
    }

    await page.screenshot({ path: '/Users/nelsonchan/Downloads/secretjeans TEMPLATE SMALL copy/state/test-a-final.png' });
    console.log('📸 Screenshot saved: test-a-final.png');

    // Determine overall pass/fail
    results.passed = results.page_loaded &&
                     results.size_selected &&
                     results.popup_appeared &&
                     results.redirect_url !== null;

    console.log('\n' + '='.repeat(60));
    console.log('TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log('Page Loaded:', results.page_loaded ? '✅' : '❌');
    console.log('Size Selected:', results.size_selected ? '✅' : '❌');
    console.log('Popup Appeared:', results.popup_appeared ? '✅' : '❌');
    console.log('Redirect URL:', results.redirect_url || '❌ None');
    console.log('Overall Status:', results.passed ? '✅ PASSED' : '❌ FAILED');
    console.log('Errors:', results.errors.length);
    if (results.errors.length > 0) {
      results.errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    }
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Fatal test error:', error);
    results.errors.push(`Fatal error: ${error.message}`);
    results.passed = false;
  } finally {
    // Save results to JSON
    const outputPath = '/Users/nelsonchan/Downloads/secretjeans TEMPLATE SMALL copy/state/test-a.json';
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${outputPath}`);

    // Close browser
    if (browser) {
      await browser.close();
      console.log('🔒 Browser closed\n');
    }

    // Exit with appropriate code
    process.exit(results.passed ? 0 : 1);
  }
})();
