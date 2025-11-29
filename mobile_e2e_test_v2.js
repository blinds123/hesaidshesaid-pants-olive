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
    popup_mobile_friendly: true,
    issues: []
  };

  try {
    // Navigate and wait for load
    await page.goto(SITE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);

    await page.screenshot({ path: 'mobile_v2_m1_01_initial.png', fullPage: true });

    // Scroll to find size selector
    await page.evaluate(() => {
      const sizeSection = document.querySelector('[class*="size"]');
      if (sizeSection) sizeSection.scrollIntoView({ behavior: 'smooth' });
    });
    await sleep(1000);

    // Find and tap size button
    const sizeButton = await page.$('button:has-text("S"), button:has-text("M"), button:has-text("L")');
    if (!sizeButton) {
      result.issues.push('No size selector buttons found');
      await page.screenshot({ path: 'mobile_v2_m1_02_no_size.png', fullPage: true });
      return result;
    }

    await page.screenshot({ path: 'mobile_v2_m1_02_size_found.png' });
    await sizeButton.click();
    await sleep(500);

    // Scroll to primary CTA
    await page.evaluate(() => {
      const ctaButton = document.querySelector('button:has-text("GET MINE NOW")');
      if (ctaButton) {
        ctaButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    await sleep(1000);

    // Find primary CTA with $59
    const primaryCTA = await page.$('button:has-text("GET MINE NOW")');
    if (!primaryCTA) {
      result.issues.push('Primary CTA not found');
      await page.screenshot({ path: 'mobile_v2_m1_03_no_cta.png', fullPage: true });
      return result;
    }

    await page.screenshot({ path: 'mobile_v2_m1_03_cta_found.png' });

    // Get button dimensions
    const ctaBox = await primaryCTA.boundingBox();
    console.log('Primary CTA dimensions:', ctaBox);
    if (ctaBox && ctaBox.height < 44) {
      result.issues.push(`CTA height ${Math.round(ctaBox.height)}px is below recommended 44px for mobile`);
    }

    // Tap primary CTA
    await primaryCTA.click();
    await sleep(2000);

    await page.screenshot({ path: 'mobile_v2_m1_04_after_cta.png', fullPage: true });

    // Look for bottom popup section "Don't Miss Out"
    const bottomPopup = await page.$('text="Don\'t Miss Out"');
    if (bottomPopup) {
      console.log('Found bottom popup section');
      await page.evaluate(() => {
        const popup = document.querySelector('text="Don\'t Miss Out"');
        if (popup) popup.scrollIntoView({ behavior: 'smooth' });
      });
      await sleep(1000);
      await page.screenshot({ path: 'mobile_v2_m1_05_bottom_popup.png' });

      // Find "No thanks" button
      const noThanksButton = await page.$('button:has-text("No Thanks")');
      if (noThanksButton) {
        const buttonBox = await noThanksButton.boundingBox();
        console.log('No Thanks button dimensions:', buttonBox);
        if (buttonBox && buttonBox.height < 44) {
          result.issues.push(`No Thanks button height ${Math.round(buttonBox.height)}px is below 44px`);
        }

        // Listen for navigation
        const navigationPromise = page.waitForNavigation({ timeout: 15000 }).catch(() => null);

        await noThanksButton.click();
        await sleep(1500);

        await navigationPromise;
        await page.screenshot({ path: 'mobile_v2_m1_06_after_decline.png' });

        const finalURL = page.url();
        result.redirect_url = finalURL;
        console.log('Final URL:', finalURL);

        if (finalURL.includes('simpleswap.io')) {
          result.passed = true;
        } else {
          result.issues.push(`Expected redirect to simpleswap.io, got: ${finalURL}`);
        }
      } else {
        result.issues.push('No Thanks button not found in bottom popup');
      }
    } else {
      result.issues.push('Bottom popup section not found after CTA click');
    }

  } catch (error) {
    result.issues.push(`Error: ${error.message}`);
    console.error('Test M1 Error:', error);
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
    popup_mobile_friendly: true,
    issues: []
  };

  try {
    await page.goto(SITE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);

    await page.screenshot({ path: 'mobile_v2_m2_01_initial.png', fullPage: true });

    // Tap size
    const sizeButton = await page.$('button:has-text("M")');
    if (sizeButton) {
      await sizeButton.click();
      await sleep(500);
    }

    // Scroll to secondary CTA ($19 pre-order)
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const preorderBtn = buttons.find(btn => btn.textContent.includes('PRE-ORDER') || btn.textContent.includes('$19'));
      if (preorderBtn) {
        preorderBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    await sleep(1000);

    // Find secondary CTA with $19
    const secondaryCTA = await page.$('button:has-text("PRE-ORDER")');
    if (!secondaryCTA) {
      result.issues.push('Secondary CTA ($19) not found');
      await page.screenshot({ path: 'mobile_v2_m2_02_no_cta.png', fullPage: true });
      return result;
    }

    await page.screenshot({ path: 'mobile_v2_m2_02_cta_found.png' });

    // Tap secondary CTA
    await secondaryCTA.click();
    await sleep(2000);

    await page.screenshot({ path: 'mobile_v2_m2_03_after_cta.png', fullPage: true });

    // Look for bottom popup
    const bottomPopup = await page.$('text="Don\'t Miss Out"');
    if (bottomPopup) {
      await page.evaluate(() => {
        const popup = document.querySelector('text="Don\'t Miss Out"');
        if (popup) popup.scrollIntoView({ behavior: 'smooth' });
      });
      await sleep(1000);
      await page.screenshot({ path: 'mobile_v2_m2_04_popup.png' });

      // Find No Thanks button
      const noThanksButton = await page.$('button:has-text("No Thanks")');
      if (noThanksButton) {
        const navigationPromise = page.waitForNavigation({ timeout: 15000 }).catch(() => null);

        await noThanksButton.click();
        await sleep(1500);

        await navigationPromise;
        await page.screenshot({ path: 'mobile_v2_m2_05_after_decline.png' });

        const finalURL = page.url();
        result.redirect_url = finalURL;
        console.log('Final URL:', finalURL);

        if (finalURL.includes('simpleswap.io')) {
          result.passed = true;
        } else {
          result.issues.push(`Expected redirect to simpleswap.io, got: ${finalURL}`);
        }
      } else {
        result.issues.push('No Thanks button not found');
      }
    } else {
      result.issues.push('Bottom popup not found after $19 CTA click');
    }

  } catch (error) {
    result.issues.push(`Error: ${error.message}`);
    console.error('Test M2 Error:', error);
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

    // Test scrolling
    await page.evaluate(() => window.scrollTo(0, 500));
    await sleep(300);
    const scrollPos1 = await page.evaluate(() => window.scrollY);

    await page.evaluate(() => window.scrollTo(0, 1000));
    await sleep(300);
    const scrollPos2 = await page.evaluate(() => window.scrollY);

    if (scrollPos2 <= scrollPos1) {
      result.scrolling_smooth = false;
      result.issues.push('Scrolling not working');
    }

    // Test image gallery thumbnails
    const thumbnails = await page.$$('.gallery img, [class*="thumbnail"]');
    if (thumbnails.length > 0) {
      result.thumbnails_tappable = true;
      await thumbnails[0].click();
      await sleep(500);
      await page.screenshot({ path: 'mobile_v2_m3_01_thumbnail.png' });
    }

    // Test bottom popup is not blocking content
    const ctaButton = await page.$('button:has-text("GET MINE NOW")');
    if (ctaButton) {
      await ctaButton.scrollIntoView();
      await sleep(500);
      const isVisible = await ctaButton.isVisible();
      if (!isVisible) {
        result.issues.push('CTA button blocked or not visible');
      }
    }

    if (consoleErrors.length > 0) {
      const filteredErrors = consoleErrors.filter(e => !e.includes('404')); // Ignore known 404
      if (filteredErrors.length > 0) {
        result.issues.push(`Console errors: ${filteredErrors.join(', ')}`);
      }
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
    await page.goto(SITE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);

    await page.screenshot({ path: 'mobile_v2_m4_01_small.png', fullPage: true });

    // Check horizontal scroll
    const scrollMetrics = await page.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasHorizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth
      };
    });

    console.log('Small viewport scroll metrics:', scrollMetrics);

    if (scrollMetrics.hasHorizontalScroll) {
      result.no_horizontal_scroll = false;
      const overflow = scrollMetrics.scrollWidth - scrollMetrics.clientWidth;
      result.issues.push(`Horizontal scroll detected: ${overflow}px overflow (${scrollMetrics.scrollWidth}px content in ${scrollMetrics.clientWidth}px viewport)`);
    }

    // Check text readability
    const fontMetrics = await page.evaluate(() => {
      const body = window.getComputedStyle(document.body);
      const heading = document.querySelector('h1');
      return {
        bodySize: body.fontSize,
        headingSize: heading ? window.getComputedStyle(heading).fontSize : 'N/A'
      };
    });

    console.log('Font metrics:', fontMetrics);
    const fontSize = parseInt(fontMetrics.bodySize);
    if (fontSize < 14) {
      result.issues.push(`Body font ${fontSize}px is too small for mobile (min 16px recommended)`);
    }

    // Check button tapability
    const buttons = await page.$$('button');
    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const box = await buttons[i].boundingBox();
      if (box) {
        if (box.x + box.width > SMALL_VIEWPORT.width) {
          result.small_viewport_ok = false;
          result.issues.push(`Button ${i+1} extends beyond viewport (${Math.round(box.x + box.width)}px > ${SMALL_VIEWPORT.width}px)`);
        }
      }
    }

    await context.close();

    // Test landscape
    const landscapeContext = await browser.newContext({
      viewport: { width: 844, height: 390 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    });
    const landscapePage = await landscapeContext.newPage();

    await landscapePage.goto(SITE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);

    await landscapePage.screenshot({ path: 'mobile_v2_m4_02_landscape.png', fullPage: true });

    const landscapeMetrics = await landscapePage.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      };
    });

    console.log('Landscape metrics:', landscapeMetrics);

    if (landscapeMetrics.scrollWidth > landscapeMetrics.clientWidth) {
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

  // Calculate score
  let passCount = 0;
  let totalTests = 0;

  if (results.test_m1_59_flow.passed) passCount++;
  totalTests++;

  if (results.test_m2_19_flow.passed) passCount++;
  totalTests++;

  if (results.test_m3_ux_quality.scrolling_smooth) passCount++;
  if (results.test_m3_ux_quality.thumbnails_tappable) passCount++;
  totalTests += 2;

  if (results.test_m4_edge_cases.small_viewport_ok) passCount++;
  if (results.test_m4_edge_cases.no_horizontal_scroll) passCount++;
  if (results.test_m4_edge_cases.landscape_ok) passCount++;
  totalTests += 3;

  const score = Math.round((passCount / totalTests) * 10);
  results.overall_mobile_score = `${score}/10`;

  // Critical issues
  results.critical_issues = [];
  if (!results.test_m1_59_flow.passed) {
    results.critical_issues.push('PRIMARY BLOCKER: $59 purchase flow failed - ' + results.test_m1_59_flow.issues.join('; '));
  }
  if (!results.test_m2_19_flow.passed) {
    results.critical_issues.push('PRIMARY BLOCKER: $19 pre-order flow failed - ' + results.test_m2_19_flow.issues.join('; '));
  }
  if (!results.test_m4_edge_cases.no_horizontal_scroll) {
    results.critical_issues.push('MOBILE UX ISSUE: Horizontal scroll breaks mobile experience');
  }

  // Recommendations
  results.recommendations = [];

  if (results.test_m1_59_flow.issues.some(i => i.includes('44px')) ||
      results.test_m2_19_flow.issues.some(i => i.includes('44px'))) {
    results.recommendations.push('Increase all tap targets to minimum 44x44px for iOS guidelines');
  }

  if (!results.test_m4_edge_cases.no_horizontal_scroll) {
    results.recommendations.push('Fix horizontal scroll: likely caused by fixed-width elements or negative margins');
  }

  if (!results.test_m4_edge_cases.small_viewport_ok) {
    results.recommendations.push('Optimize for iPhone SE (375px) - smallest common mobile viewport');
  }

  if (results.test_m4_edge_cases.issues.some(i => i.includes('font'))) {
    results.recommendations.push('Use 16px minimum font size to prevent iOS zoom on input focus');
  }

  results.recommendations.push('Test on real devices (iPhone 12, iPhone SE) to verify touch interactions');

  await browser.close();

  fs.writeFileSync('mobile_test_results_v2.json', JSON.stringify(results, null, 2));
  console.log('\n=== FINAL MOBILE E2E TEST RESULTS ===');
  console.log(JSON.stringify(results, null, 2));

  return results;
}

runAllTests().catch(console.error);
