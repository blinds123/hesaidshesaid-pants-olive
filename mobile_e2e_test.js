const { chromium } = require('playwright');
const fs = require('fs');

const SITE_URL = 'https://hesaidshesaid-pants.netlify.app';
const MOBILE_VIEWPORT = { width: 390, height: 844 }; // iPhone 12/13/14
const SMALL_VIEWPORT = { width: 375, height: 667 }; // iPhone SE

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testM1_59DollarFlow(browser) {
  console.log('\n=== TEST M1: $59 Direct Flow (Mobile) ===');
  const context = await browser.newContext({
    viewport: MOBILE_VIEWPORT,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  });
  const page = await context.newPage();

  const result = {
    passed: false,
    redirect_url: null,
    popup_mobile_friendly: false,
    issues: []
  };

  try {
    // Navigate and wait for load
    await page.goto(SITE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);

    // Take screenshot of initial load
    await page.screenshot({ path: 'mobile_m1_01_initial.png', fullPage: true });

    // Scroll to find size selector
    await page.evaluate(() => window.scrollTo(0, 800));
    await sleep(500);

    // Find and tap size button
    const sizeButtons = await page.$$('[class*="size"], button[data-size], .size-option, button:has-text("M")');
    if (sizeButtons.length === 0) {
      result.issues.push('No size selector buttons found');
      return result;
    }

    await page.screenshot({ path: 'mobile_m1_02_size_selector.png' });

    // Tap medium size
    await sizeButtons[0].click();
    await sleep(500);

    // Scroll to primary CTA
    await page.evaluate(() => window.scrollTo(0, 1500));
    await sleep(500);

    // Find primary CTA with $59
    const primaryCTA = await page.$('button:has-text("$59"), a:has-text("$59"), button:has-text("GET MINE NOW")');
    if (!primaryCTA) {
      result.issues.push('Primary CTA ($59) not found');
      return result;
    }

    await page.screenshot({ path: 'mobile_m1_03_primary_cta.png' });

    // Get button position to verify tapability
    const ctaBox = await primaryCTA.boundingBox();
    if (ctaBox && ctaBox.height < 44) {
      result.issues.push(`CTA height ${ctaBox.height}px is below recommended 44px for mobile`);
    }

    // Tap primary CTA
    await primaryCTA.click();
    await sleep(1500);

    await page.screenshot({ path: 'mobile_m1_04_after_cta_click.png', fullPage: true });

    // Check for popup
    const popup = await page.$('[class*="popup"], [class*="modal"], [role="dialog"], .order-bump');
    if (!popup) {
      result.issues.push('Order bump popup did not appear');
      return result;
    }

    // Check popup mobile-friendliness
    const popupBox = await popup.boundingBox();
    if (popupBox) {
      if (popupBox.width > MOBILE_VIEWPORT.width) {
        result.issues.push(`Popup width ${popupBox.width}px exceeds viewport ${MOBILE_VIEWPORT.width}px`);
        result.popup_mobile_friendly = false;
      } else {
        result.popup_mobile_friendly = true;
      }
    }

    await page.screenshot({ path: 'mobile_m1_05_popup_visible.png' });

    // Find decline button
    const declineButton = await page.$('button:has-text("No thanks"), button:has-text("just the pants"), [class*="decline"]');
    if (!declineButton) {
      result.issues.push('Decline button not found in popup');
      return result;
    }

    const declineBox = await declineButton.boundingBox();
    if (declineBox && declineBox.height < 44) {
      result.issues.push(`Decline button height ${declineBox.height}px is below recommended 44px`);
    }

    // Listen for navigation
    const navigationPromise = page.waitForNavigation({ timeout: 10000 }).catch(() => null);

    // Tap decline button
    await declineButton.click();
    await sleep(1000);

    const navigation = await navigationPromise;

    await page.screenshot({ path: 'mobile_m1_06_after_decline.png' });

    // Check redirect
    const finalURL = page.url();
    result.redirect_url = finalURL;

    if (finalURL.includes('simpleswap.io')) {
      result.passed = true;
    } else {
      result.issues.push(`Expected redirect to simpleswap.io, got: ${finalURL}`);
    }

  } catch (error) {
    result.issues.push(`Error: ${error.message}`);
  } finally {
    await context.close();
  }

  return result;
}

async function testM2_19DollarFlow(browser) {
  console.log('\n=== TEST M2: $19 Pre-Order Flow (Mobile) ===');
  const context = await browser.newContext({
    viewport: MOBILE_VIEWPORT,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  });
  const page = await context.newPage();

  const result = {
    passed: false,
    redirect_url: null,
    popup_mobile_friendly: false,
    issues: []
  };

  try {
    await page.goto(SITE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);

    await page.screenshot({ path: 'mobile_m2_01_initial.png', fullPage: true });

    // Scroll to size selector
    await page.evaluate(() => window.scrollTo(0, 800));
    await sleep(500);

    // Tap size
    const sizeButtons = await page.$$('[class*="size"], button[data-size], .size-option');
    if (sizeButtons.length > 0) {
      await sizeButtons[0].click();
      await sleep(500);
    }

    // Scroll to secondary CTA
    await page.evaluate(() => window.scrollTo(0, 2000));
    await sleep(500);

    // Find secondary CTA with $19
    const secondaryCTA = await page.$('button:has-text("$19"), a:has-text("$19"), button:has-text("PRE-ORDER"), button:has-text("68% OFF")');
    if (!secondaryCTA) {
      result.issues.push('Secondary CTA ($19) not found');
      return result;
    }

    await page.screenshot({ path: 'mobile_m2_02_secondary_cta.png' });

    // Tap secondary CTA
    await secondaryCTA.click();
    await sleep(1500);

    await page.screenshot({ path: 'mobile_m2_03_after_cta_click.png', fullPage: true });

    // Check for popup with $19 pricing
    const popup = await page.$('[class*="popup"], [class*="modal"], [role="dialog"]');
    if (!popup) {
      result.issues.push('Popup did not appear for $19 flow');
      return result;
    }

    // Verify $19 pricing in popup
    const popupText = await popup.textContent();
    if (!popupText.includes('19') && !popupText.includes('$19')) {
      result.issues.push('Popup does not show $19 pricing');
    }

    // Check mobile-friendliness
    const popupBox = await popup.boundingBox();
    if (popupBox) {
      if (popupBox.width > MOBILE_VIEWPORT.width) {
        result.issues.push(`Popup width ${popupBox.width}px exceeds viewport`);
        result.popup_mobile_friendly = false;
      } else {
        result.popup_mobile_friendly = true;
      }
    }

    await page.screenshot({ path: 'mobile_m2_04_popup.png' });

    // Find decline button
    const declineButton = await page.$('button:has-text("No thanks"), button:has-text("decline"), [class*="decline"]');
    if (!declineButton) {
      result.issues.push('Decline button not found');
      return result;
    }

    // Listen for navigation
    const navigationPromise = page.waitForNavigation({ timeout: 10000 }).catch(() => null);

    await declineButton.click();
    await sleep(1000);

    await navigationPromise;

    await page.screenshot({ path: 'mobile_m2_05_after_decline.png' });

    const finalURL = page.url();
    result.redirect_url = finalURL;

    if (finalURL.includes('simpleswap.io')) {
      result.passed = true;
    } else {
      result.issues.push(`Expected redirect to simpleswap.io, got: ${finalURL}`);
    }

  } catch (error) {
    result.issues.push(`Error: ${error.message}`);
  } finally {
    await context.close();
  }

  return result;
}

async function testM3_MobileUX(browser) {
  console.log('\n=== TEST M3: Mobile UX Quality ===');
  const context = await browser.newContext({
    viewport: MOBILE_VIEWPORT,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  });
  const page = await context.newPage();

  const result = {
    scrolling_smooth: true,
    thumbnails_tappable: false,
    accordion_works: false,
    popup_dismissable: false,
    issues: []
  };

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    await page.goto(SITE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);

    // Test scrolling behavior
    const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
    await page.evaluate(() => window.scrollTo(0, 500));
    await sleep(300);
    const scrollPos1 = await page.evaluate(() => window.scrollY);

    await page.evaluate(() => window.scrollTo(0, 1000));
    await sleep(300);
    const scrollPos2 = await page.evaluate(() => window.scrollY);

    if (scrollPos2 <= scrollPos1) {
      result.scrolling_smooth = false;
      result.issues.push('Scrolling not working properly');
    }

    await page.screenshot({ path: 'mobile_m3_01_scrolled.png' });

    // Test image gallery thumbnails
    const thumbnails = await page.$$('[class*="thumbnail"], .gallery img, [class*="gallery"] button');
    if (thumbnails.length > 0) {
      result.thumbnails_tappable = true;
      await thumbnails[0].click();
      await sleep(500);
      await page.screenshot({ path: 'mobile_m3_02_thumbnail_clicked.png' });
    } else {
      result.issues.push('No thumbnails found to test');
    }

    // Test accordion sections
    const accordions = await page.$$('[class*="accordion"], details, [role="button"]');
    if (accordions.length > 0) {
      await accordions[0].click();
      await sleep(500);
      result.accordion_works = true;
      await page.screenshot({ path: 'mobile_m3_03_accordion.png' });
    }

    // Test popup dismissal
    const ctaButton = await page.$('button:has-text("$59"), button:has-text("GET MINE NOW")');
    if (ctaButton) {
      await ctaButton.click();
      await sleep(1000);

      // Try clicking outside popup
      await page.mouse.click(50, 50);
      await sleep(500);

      const popupStillVisible = await page.$('[class*="popup"], [role="dialog"]');
      if (!popupStillVisible) {
        result.popup_dismissable = true;
      }

      await page.screenshot({ path: 'mobile_m3_04_popup_dismiss_test.png' });

      // Try ESC key
      await page.keyboard.press('Escape');
      await sleep(500);
    }

    if (consoleErrors.length > 0) {
      result.issues.push(`Console errors: ${consoleErrors.join(', ')}`);
    }

  } catch (error) {
    result.issues.push(`Error: ${error.message}`);
  } finally {
    await context.close();
  }

  return result;
}

async function testM4_EdgeCases(browser) {
  console.log('\n=== TEST M4: Mobile Edge Cases ===');
  const context = await browser.newContext({
    viewport: SMALL_VIEWPORT,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  });
  const page = await context.newPage();

  const result = {
    small_viewport_ok: true,
    no_horizontal_scroll: true,
    landscape_ok: true,
    issues: []
  };

  try {
    // Test small viewport (iPhone SE)
    await page.goto(SITE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);

    await page.screenshot({ path: 'mobile_m4_01_small_viewport.png', fullPage: true });

    // Check for horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    if (hasHorizontalScroll) {
      result.no_horizontal_scroll = false;
      result.issues.push('Horizontal scroll detected on small viewport');

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      result.issues.push(`ScrollWidth: ${scrollWidth}, ClientWidth: ${clientWidth}`);
    }

    // Check text readability
    const bodyFontSize = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontSize;
    });
    const fontSize = parseInt(bodyFontSize);
    if (fontSize < 14) {
      result.issues.push(`Body font size ${fontSize}px may be too small for mobile`);
    }

    // Check if buttons are cut off
    const buttons = await page.$$('button, a[class*="button"]');
    for (const button of buttons) {
      const box = await button.boundingBox();
      if (box && box.x + box.width > SMALL_VIEWPORT.width) {
        result.small_viewport_ok = false;
        result.issues.push('Button extends beyond viewport width');
        break;
      }
    }

    await context.close();

    // Test landscape orientation
    const landscapeContext = await browser.newContext({
      viewport: { width: 844, height: 390 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    });
    const landscapePage = await landscapeContext.newPage();

    await landscapePage.goto(SITE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);

    await landscapePage.screenshot({ path: 'mobile_m4_02_landscape.png', fullPage: true });

    // Basic landscape checks
    const landscapeHasHorizontalScroll = await landscapePage.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    if (landscapeHasHorizontalScroll) {
      result.landscape_ok = false;
      result.issues.push('Horizontal scroll in landscape mode');
    }

    await landscapeContext.close();

  } catch (error) {
    result.issues.push(`Error: ${error.message}`);
  }

  return result;
}

async function runAllTests() {
  const browser = await chromium.launch({ headless: true });

  const results = {
    test_m1_59_flow: await testM1_59DollarFlow(browser),
    test_m2_19_flow: await testM2_19DollarFlow(browser),
    test_m3_ux_quality: await testM3_MobileUX(browser),
    test_m4_edge_cases: await testM4_EdgeCases(browser)
  };

  // Calculate overall score
  let passCount = 0;
  let totalTests = 0;

  if (results.test_m1_59_flow.passed) passCount++;
  totalTests++;

  if (results.test_m2_19_flow.passed) passCount++;
  totalTests++;

  if (results.test_m3_ux_quality.scrolling_smooth) passCount++;
  if (results.test_m3_ux_quality.thumbnails_tappable) passCount++;
  if (results.test_m3_ux_quality.accordion_works) passCount++;
  if (results.test_m3_ux_quality.popup_dismissable) passCount++;
  totalTests += 4;

  if (results.test_m4_edge_cases.small_viewport_ok) passCount++;
  if (results.test_m4_edge_cases.no_horizontal_scroll) passCount++;
  if (results.test_m4_edge_cases.landscape_ok) passCount++;
  totalTests += 3;

  const score = Math.round((passCount / totalTests) * 10);
  results.overall_mobile_score = `${score}/10`;

  // Collect critical issues
  results.critical_issues = [];
  if (!results.test_m1_59_flow.passed) {
    results.critical_issues.push('Primary $59 purchase flow failed');
  }
  if (!results.test_m2_19_flow.passed) {
    results.critical_issues.push('Secondary $19 pre-order flow failed');
  }
  if (!results.test_m4_edge_cases.no_horizontal_scroll) {
    results.critical_issues.push('Horizontal scroll on mobile viewports');
  }

  // Generate recommendations
  results.recommendations = [];

  if (!results.test_m1_59_flow.popup_mobile_friendly || !results.test_m2_19_flow.popup_mobile_friendly) {
    results.recommendations.push('Optimize popup width for mobile viewports (max 390px)');
  }

  if (results.test_m1_59_flow.issues.some(i => i.includes('44px')) ||
      results.test_m2_19_flow.issues.some(i => i.includes('44px'))) {
    results.recommendations.push('Increase button heights to at least 44px for better mobile tapability');
  }

  if (!results.test_m3_ux_quality.popup_dismissable) {
    results.recommendations.push('Add touch-outside-to-dismiss functionality for popups');
  }

  if (!results.test_m4_edge_cases.small_viewport_ok) {
    results.recommendations.push('Test and optimize for iPhone SE (375x667) viewport');
  }

  if (results.test_m4_edge_cases.issues.some(i => i.includes('font size'))) {
    results.recommendations.push('Increase base font size to at least 16px for mobile readability');
  }

  await browser.close();

  // Save results
  fs.writeFileSync('mobile_test_results.json', JSON.stringify(results, null, 2));
  console.log('\n=== FINAL RESULTS ===');
  console.log(JSON.stringify(results, null, 2));

  return results;
}

runAllTests().catch(console.error);
