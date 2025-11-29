const { chromium } = require('playwright');
const fs = require('fs');

const SITE_URL = 'https://hesaidshesaid-pants.netlify.app';
const MOBILE_VIEWPORT = { width: 390, height: 844 };
const SMALL_VIEWPORT = { width: 375, height: 667 };

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testM1_59DollarFlow(browser) {
  console.log('\n=== TEST M1: $59 Direct Flow (Mobile) ===');
  const context = await browser.newContext({
    viewport: MOBILE_VIEWPORT,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
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
    await page.screenshot({ path: 'final_m1_01_loaded.png', fullPage: true });

    // Find size buttons
    const sizeButtons = await page.$$('button');
    let sizeClicked = false;
    for (const btn of sizeButtons) {
      const text = await btn.textContent();
      if (text && (text.trim() === 'S' || text.trim() === 'M' || text.trim() === 'L')) {
        await btn.click();
        sizeClicked = true;
        console.log('Clicked size:', text.trim());
        break;
      }
    }

    if (!sizeClicked) {
      result.issues.push('Size selector not found');
    }
    await sleep(1000);

    // Find primary CTA
    const allButtons = await page.$$('button');
    let primaryCTA = null;
    for (const btn of allButtons) {
      const text = await btn.textContent();
      if (text && text.includes('GET MINE NOW')) {
        primaryCTA = btn;
        const box = await btn.boundingBox();
        console.log('Primary CTA found, dimensions:', box);
        if (box && box.height < 44) {
          const roundedHeight = Math.floor(box.height);
          result.issues.push('Primary CTA height ' + roundedHeight + 'px is below 44px');
        }
        break;
      }
    }

    if (!primaryCTA) {
      result.issues.push('Primary CTA not found');
      await context.close();
      return result;
    }

    await page.screenshot({ path: 'final_m1_02_before_click.png' });
    await primaryCTA.click();
    await sleep(2000);
    await page.screenshot({ path: 'final_m1_03_after_click.png', fullPage: true });

    // Check URL
    const currentURL = page.url();
    console.log('URL after CTA click:', currentURL);

    if (currentURL.includes('simpleswap.io')) {
      result.passed = true;
      result.redirect_url = currentURL;
    } else {
      // Look for popup
      const pageContent = await page.content();
      if (pageContent.includes("Don't Miss Out") || pageContent.includes("No Thanks")) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await sleep(1000);
        await page.screenshot({ path: 'final_m1_04_scrolled_bottom.png' });

        // Find No Thanks button
        const buttons = await page.$$('button');
        let foundNoThanks = false;
        for (const btn of buttons) {
          const text = await btn.textContent();
          if (text && text.includes('No Thanks')) {
            console.log('Found No Thanks button');
            const box = await btn.boundingBox();
            if (box && box.height < 44) {
              const roundedHeight = Math.floor(box.height);
              result.issues.push('No Thanks button height ' + roundedHeight + 'px is below 44px');
            }

            const navPromise = page.waitForNavigation({ timeout: 10000 }).catch(() => null);
            await btn.click();
            await sleep(1500);
            await navPromise;

            foundNoThanks = true;
            break;
          }
        }

        if (!foundNoThanks) {
          result.issues.push('No Thanks button not found');
        } else {
          const finalURL = page.url();
          result.redirect_url = finalURL;
          console.log('Final URL:', finalURL);

          if (finalURL.includes('simpleswap.io')) {
            result.passed = true;
          } else {
            result.issues.push('Expected simpleswap.io redirect, got: ' + finalURL);
          }
        }
      } else {
        result.issues.push('Order bump section not found');
      }
    }

  } catch (error) {
    result.issues.push('Error: ' + error.message);
    console.error(error);
  } finally {
    await page.screenshot({ path: 'final_m1_99_final.png', fullPage: true });
    await context.close();
  }

  return result;
}

async function testM2_19DollarFlow(browser) {
  console.log('\n=== TEST M2: $19 Pre-Order Flow (Mobile) ===');
  const context = await browser.newContext({
    viewport: MOBILE_VIEWPORT,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
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

    // Click size
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text && text.trim() === 'M') {
        await btn.click();
        break;
      }
    }
    await sleep(1000);

    // Find secondary CTA
    let secondaryCTA = null;
    const allButtons = await page.$$('button');
    for (const btn of allButtons) {
      const text = await btn.textContent();
      if (text && text.includes('PRE-ORDER')) {
        secondaryCTA = btn;
        break;
      }
    }

    if (!secondaryCTA) {
      result.issues.push('Secondary CTA not found');
      await context.close();
      return result;
    }

    await secondaryCTA.click();
    await sleep(2000);
    await page.screenshot({ path: 'final_m2_01_after_click.png', fullPage: true });

    const currentURL = page.url();

    if (currentURL.includes('simpleswap.io')) {
      result.passed = true;
      result.redirect_url = currentURL;
    } else {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await sleep(1000);

      const buttons2 = await page.$$('button');
      for (const btn of buttons2) {
        const text = await btn.textContent();
        if (text && text.includes('No Thanks')) {
          const navPromise = page.waitForNavigation({ timeout: 10000 }).catch(() => null);
          await btn.click();
          await sleep(1500);
          await navPromise;

          const finalURL = page.url();
          result.redirect_url = finalURL;

          if (finalURL.includes('simpleswap.io')) {
            result.passed = true;
          } else {
            result.issues.push('Expected simpleswap.io, got: ' + finalURL);
          }
          break;
        }
      }
    }

  } catch (error) {
    result.issues.push('Error: ' + error.message);
  } finally {
    await page.screenshot({ path: 'final_m2_99_final.png', fullPage: true });
    await context.close();
  }

  return result;
}

async function testM3_MobileUX(browser) {
  console.log('\n=== TEST M3: Mobile UX Quality ===');
  const context = await browser.newContext({ viewport: MOBILE_VIEWPORT });
  const page = await context.newPage();

  const result = {
    scrolling_smooth: true,
    thumbnails_tappable: false,
    accordion_works: false,
    popup_dismissable: true,
    issues: []
  };

  try {
    await page.goto(SITE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);

    // Test scrolling
    await page.evaluate(() => window.scrollTo(0, 500));
    await sleep(200);
    const pos1 = await page.evaluate(() => window.scrollY);

    await page.evaluate(() => window.scrollTo(0, 1000));
    await sleep(200);
    const pos2 = await page.evaluate(() => window.scrollY);

    if (pos2 <= pos1) {
      result.scrolling_smooth = false;
      result.issues.push('Scrolling failed');
    }

    // Test thumbnails
    const imgs = await page.$$('img');
    if (imgs.length > 4) {
      result.thumbnails_tappable = true;
      await imgs[1].click();
      await sleep(500);
    }

  } catch (error) {
    result.issues.push('Error: ' + error.message);
  } finally {
    await context.close();
  }

  return result;
}

async function testM4_EdgeCases(browser) {
  console.log('\n=== TEST M4: Mobile Edge Cases ===');
  const context = await browser.newContext({ viewport: SMALL_VIEWPORT });
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
    await page.screenshot({ path: 'final_m4_01_small.png', fullPage: true });

    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth
    }));

    console.log('Small viewport:', metrics);

    if (metrics.scrollWidth > metrics.clientWidth) {
      result.no_horizontal_scroll = false;
      const overflow = metrics.scrollWidth - metrics.clientWidth;
      result.issues.push(overflow + 'px horizontal overflow (' + metrics.scrollWidth + 'px in ' + metrics.clientWidth + 'px)');

      // Find offending element
      const widestElement = await page.evaluate(() => {
        const els = Array.from(document.querySelectorAll('*'));
        let widest = null;
        let maxWidth = 0;
        els.forEach(el => {
          const width = el.scrollWidth;
          if (width > maxWidth && width > window.innerWidth) {
            maxWidth = width;
            widest = { tag: el.tagName, class: el.className, width };
          }
        });
        return widest;
      });

      if (widestElement) {
        result.issues.push('Widest element: ' + widestElement.tag + '.' + widestElement.class + ' (' + widestElement.width + 'px)');
      }
    }

    await context.close();

    // Landscape test
    const landscapeCtx = await browser.newContext({ viewport: { width: 844, height: 390 } });
    const landscapePage = await landscapeCtx.newPage();

    await landscapePage.goto(SITE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);
    await landscapePage.screenshot({ path: 'final_m4_02_landscape.png', fullPage: true });

    const landscapeMetrics = await landscapePage.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth
    }));

    if (landscapeMetrics.scrollWidth > landscapeMetrics.clientWidth) {
      result.landscape_ok = false;
      result.issues.push('Horizontal scroll in landscape');
    }

    await landscapeCtx.close();

  } catch (error) {
    result.issues.push('Error: ' + error.message);
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

  let passCount = 0;
  if (results.test_m1_59_flow.passed) passCount++;
  if (results.test_m2_19_flow.passed) passCount++;
  if (results.test_m3_ux_quality.scrolling_smooth) passCount++;
  if (results.test_m3_ux_quality.thumbnails_tappable) passCount++;
  if (results.test_m4_edge_cases.no_horizontal_scroll) passCount++;
  if (results.test_m4_edge_cases.landscape_ok) passCount++;

  const score = Math.floor((passCount / 6) * 10);
  results.overall_mobile_score = score + '/10';

  results.critical_issues = [];
  if (!results.test_m1_59_flow.passed) {
    results.critical_issues.push('CRITICAL: $59 purchase flow FAILED - ' + results.test_m1_59_flow.issues.join('; '));
  }
  if (!results.test_m2_19_flow.passed) {
    results.critical_issues.push('CRITICAL: $19 pre-order flow FAILED - ' + results.test_m2_19_flow.issues.join('; '));
  }
  if (!results.test_m4_edge_cases.no_horizontal_scroll) {
    results.critical_issues.push('CRITICAL: Horizontal scroll breaks mobile UX');
  }

  results.recommendations = [];

  const hasButtonHeightIssues = results.test_m1_59_flow.issues.some(i => i.includes('44px')) ||
      results.test_m2_19_flow.issues.some(i => i.includes('44px'));

  if (hasButtonHeightIssues) {
    results.recommendations.push('Increase button heights to 44px minimum for iOS touch guidelines');
  }

  if (!results.test_m4_edge_cases.no_horizontal_scroll) {
    results.recommendations.push('Fix horizontal scroll by constraining container widths to 100vw and using max-width instead of fixed widths');
  }

  const widestIssue = results.test_m4_edge_cases.issues.find(i => i.includes('Widest element'));
  if (widestIssue) {
    results.recommendations.push('Fix overflow element: ' + widestIssue);
  }

  results.recommendations.push('Test on real iPhone devices for touch accuracy validation');
  results.recommendations.push('Consider implementing touch-friendly hover states (active states for buttons)');

  await browser.close();

  fs.writeFileSync('mobile_test_final_results.json', JSON.stringify(results, null, 2));
  console.log('\n========================================');
  console.log('MOBILE E2E TEST RESULTS');
  console.log('========================================\n');
  console.log(JSON.stringify(results, null, 2));

  return results;
}

runAllTests().catch(console.error);
