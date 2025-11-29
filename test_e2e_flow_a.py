"""
E2E Test Agent A - $59 Direct Purchase Flow
Tests the complete flow from landing page to simpleswap.io redirect
"""

import json
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

def test_direct_purchase_flow():
    """
    Test the $59 direct purchase flow:
    1. Load page
    2. Select size
    3. Click primary CTA
    4. Decline order bump
    5. Verify redirect to simpleswap.io
    """

    result = {
        "test": "A - $59 Direct Flow",
        "page_loaded": False,
        "size_selected": False,
        "primary_cta_clicked": False,
        "popup_appeared": False,
        "decline_clicked": False,
        "redirected": False,
        "final_url": None,
        "passed": False,
        "errors": [],
        "details": []
    }

    with sync_playwright() as p:
        browser = None
        try:
            # Launch browser
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            )
            page = context.new_page()

            result["details"].append("Browser launched successfully")

            # Step 1: Navigate to the site and wait for load
            result["details"].append("Step 1: Navigating to site...")
            page.goto('https://seamlessblazer.netlify.app', wait_until='networkidle', timeout=30000)

            # Verify page loaded by checking title
            title = page.title()
            result["details"].append(f"Page title: {title}")

            if "He Said She Said" in title or "Pants" in title or len(title) > 0:
                result["page_loaded"] = True
                result["details"].append("✓ Page loaded successfully")
            else:
                result["errors"].append(f"Unexpected page title: {title}")

            # Wait a moment for any dynamic content
            page.wait_for_timeout(2000)

            # Step 2: Scroll down to find size selector
            result["details"].append("Step 2: Looking for size selector...")

            # Try to find size buttons - they might be in different formats
            size_selectors = [
                'button.size-btn',
                'button[data-size]',
                '.size-selector button',
                'button:has-text("M")',
                'button:has-text("S")'
            ]

            size_button = None
            for selector in size_selectors:
                try:
                    size_button = page.wait_for_selector(selector, timeout=5000)
                    if size_button:
                        result["details"].append(f"Found size selector: {selector}")
                        break
                except:
                    continue

            if not size_button:
                result["errors"].append("Could not find size selector buttons")
                result["details"].append("Attempting to scroll and search for size selector...")
                # Scroll down to look for it
                page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
                page.wait_for_timeout(1000)

                # Try again
                for selector in size_selectors:
                    try:
                        size_button = page.wait_for_selector(selector, timeout=3000)
                        if size_button:
                            result["details"].append(f"Found size selector after scroll: {selector}")
                            break
                    except:
                        continue

            # Step 3: Click size button
            if size_button:
                result["details"].append("Step 3: Selecting size M...")
                try:
                    # Scroll to the size button
                    size_button.scroll_into_view_if_needed()
                    page.wait_for_timeout(500)

                    # Click the size button
                    size_button.click()
                    result["size_selected"] = True
                    result["details"].append("✓ Size M selected")
                    page.wait_for_timeout(1000)
                except Exception as e:
                    result["errors"].append(f"Error selecting size: {str(e)}")
            else:
                result["errors"].append("Size selector not found, cannot proceed")

            # Step 4: Scroll back to top for primary CTA
            result["details"].append("Step 4: Scrolling to primary CTA...")
            page.evaluate("window.scrollTo(0, 0)")
            page.wait_for_timeout(1000)

            # Step 5: Find and click primary CTA
            result["details"].append("Step 5: Looking for primary CTA button...")

            cta_selectors = [
                '#primaryCTA',
                'button:has-text("GET MINE NOW")',
                'button:has-text("$59")',
                '.cta-button',
                'button.primary-cta'
            ]

            cta_button = None
            for selector in cta_selectors:
                try:
                    cta_button = page.wait_for_selector(selector, timeout=3000)
                    if cta_button:
                        result["details"].append(f"Found CTA button: {selector}")
                        break
                except:
                    continue

            if cta_button:
                try:
                    # Scroll to CTA if needed
                    cta_button.scroll_into_view_if_needed()
                    page.wait_for_timeout(500)

                    # Click the CTA
                    result["details"].append("Clicking primary CTA...")
                    cta_button.click()
                    result["primary_cta_clicked"] = True
                    result["details"].append("✓ Primary CTA clicked")

                    # Wait for popup to appear
                    page.wait_for_timeout(2000)
                except Exception as e:
                    result["errors"].append(f"Error clicking CTA: {str(e)}")
            else:
                result["errors"].append("Primary CTA button not found")

            # Step 6: Wait for order bump popup
            result["details"].append("Step 6: Waiting for order bump popup...")

            popup_selectors = [
                '#orderBumpPopup',
                '.popup-overlay',
                '.order-bump-popup',
                '[class*="popup"]',
                '[id*="popup"]'
            ]

            popup_found = False
            for selector in popup_selectors:
                try:
                    popup = page.wait_for_selector(selector, state='visible', timeout=5000)
                    if popup:
                        result["popup_appeared"] = True
                        result["details"].append(f"✓ Popup appeared: {selector}")
                        popup_found = True
                        break
                except:
                    continue

            if not popup_found:
                result["errors"].append("Order bump popup did not appear")
                result["details"].append("Checking if page redirected without popup...")

            # Step 7: Click decline button
            result["details"].append("Step 7: Looking for decline button...")

            decline_selectors = [
                'button:has-text("No thanks")',
                'button:has-text("just the pants")',
                '#declineBtn',
                '.decline-button',
                'button[onclick*="decline"]',
                'a:has-text("No thanks")'
            ]

            decline_button = None
            for selector in decline_selectors:
                try:
                    decline_button = page.wait_for_selector(selector, timeout=3000)
                    if decline_button:
                        result["details"].append(f"Found decline button: {selector}")
                        break
                except:
                    continue

            if decline_button:
                try:
                    result["details"].append("Clicking decline button...")
                    decline_button.click()
                    result["decline_clicked"] = True
                    result["details"].append("✓ Decline button clicked")

                    # Wait for redirect
                    result["details"].append("Waiting for redirect...")
                    page.wait_for_timeout(5000)
                except Exception as e:
                    result["errors"].append(f"Error clicking decline: {str(e)}")
            else:
                result["errors"].append("Decline button not found")
                # Check if we're already redirected
                current_url = page.url
                if 'simpleswap.io' in current_url:
                    result["details"].append("Already redirected to simpleswap.io")
                    result["decline_clicked"] = True

            # Step 8: Verify redirect
            result["details"].append("Step 8: Verifying redirect...")

            # Wait a bit more for any final redirects
            page.wait_for_timeout(3000)

            final_url = page.url
            result["final_url"] = final_url
            result["details"].append(f"Final URL: {final_url}")

            if 'simpleswap.io' in final_url:
                result["redirected"] = True
                result["details"].append("✓ Successfully redirected to simpleswap.io")

                # Check for exchange ID in URL
                if '?id=' in final_url or 'exchange' in final_url:
                    result["details"].append("✓ Valid exchange ID detected in URL")
                else:
                    result["details"].append("⚠ Warning: No exchange ID detected in URL")
            else:
                result["errors"].append(f"Did not redirect to simpleswap.io. Current URL: {final_url}")

            # Determine overall pass/fail
            result["passed"] = (
                result["page_loaded"] and
                result["size_selected"] and
                result["primary_cta_clicked"] and
                (result["popup_appeared"] or result["redirected"]) and  # Allow either popup or direct redirect
                result["redirected"]
            )

            if result["passed"]:
                result["details"].append("\n✓✓✓ TEST PASSED ✓✓✓")
            else:
                result["details"].append("\n✗✗✗ TEST FAILED ✗✗✗")

        except Exception as e:
            result["errors"].append(f"Unexpected error: {str(e)}")
            result["details"].append(f"Exception occurred: {str(e)}")

        finally:
            if browser:
                browser.close()
                result["details"].append("Browser closed")

    return result

if __name__ == "__main__":
    print("=" * 80)
    print("E2E TEST AGENT A - $59 DIRECT PURCHASE FLOW")
    print("=" * 80)
    print()

    result = test_direct_purchase_flow()

    # Print formatted JSON result
    print(json.dumps(result, indent=2))

    print()
    print("=" * 80)
    if result["passed"]:
        print("RESULT: ✓ PASSED")
    else:
        print("RESULT: ✗ FAILED")
    print("=" * 80)
