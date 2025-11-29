"""
E2E Test Agent C - UI Quality and Visual Integrity Test
Tests image loading, mobile responsiveness, accessibility, and visual quality
"""

from playwright.sync_api import sync_playwright
import json
import sys

def test_ui_quality(url):
    """
    Test UI quality and visual integrity of the website.

    Args:
        url (str): The URL to test

    Returns:
        dict: Test results in JSON format
    """
    result = {
        "test": "C - UI Quality",
        "images_total": 0,
        "images_loaded": 0,
        "broken_images": [],
        "mobile_viewport_ok": True,
        "horizontal_scroll": False,
        "accessibility": {
            "images_with_alt": 0,
            "images_missing_alt": 0
        },
        "touch_targets_ok": True,
        "passed": False,
        "errors": []
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        try:
            # Test on desktop first
            page = browser.new_page(viewport={'width': 1920, 'height': 1080})

            # Navigate and wait for load
            page.goto(url, wait_until='networkidle', timeout=30000)

            # Wait a bit more for any lazy-loaded images
            page.wait_for_timeout(3000)

            # Check all images
            images = page.locator('img').all()
            result["images_total"] = len(images)

            for i, img in enumerate(images):
                try:
                    # Check if image loaded
                    natural_height = img.evaluate('img => img.naturalHeight')
                    src = img.get_attribute('src') or ''
                    alt = img.get_attribute('alt')

                    if natural_height > 0:
                        result["images_loaded"] += 1
                    else:
                        result["broken_images"].append({
                            "index": i,
                            "src": src,
                            "reason": "naturalHeight is 0"
                        })

                    # Check alt text
                    if alt and alt.strip():
                        result["accessibility"]["images_with_alt"] += 1
                    else:
                        result["accessibility"]["images_missing_alt"] += 1

                except Exception as e:
                    result["broken_images"].append({
                        "index": i,
                        "error": str(e)
                    })

            # Take desktop screenshot
            page.screenshot(path='/Users/nelsonchan/Downloads/secretjeans TEMPLATE SMALL copy/test_desktop.png', full_page=True)

            # Test mobile viewport (390x844 - iPhone 12 Pro)
            page.set_viewport_size({'width': 390, 'height': 844})
            page.wait_for_timeout(1000)

            # Check for horizontal scroll
            scroll_width = page.evaluate('document.documentElement.scrollWidth')
            client_width = page.evaluate('document.documentElement.clientWidth')

            if scroll_width > client_width:
                result["horizontal_scroll"] = True
                result["mobile_viewport_ok"] = False
                result["errors"].append(f"Horizontal scroll detected: scrollWidth={scroll_width}, clientWidth={client_width}")

            # Take mobile screenshot
            page.screenshot(path='/Users/nelsonchan/Downloads/secretjeans TEMPLATE SMALL copy/test_mobile.png', full_page=True)

            # Test touch targets (buttons and clickable elements)
            buttons = page.locator('button, a.button, .cta-button, input[type="submit"]').all()
            small_targets = []

            for button in buttons:
                try:
                    box = button.bounding_box()
                    if box and (box['width'] < 44 or box['height'] < 44):
                        small_targets.append({
                            "element": button.evaluate('el => el.tagName + (el.className ? "." + el.className : "")'),
                            "width": box['width'],
                            "height": box['height']
                        })
                except:
                    pass

            if small_targets:
                result["touch_targets_ok"] = False
                result["errors"].append(f"Found {len(small_targets)} touch targets smaller than 44px")

            # Test accordion functionality if present
            accordions = page.locator('[class*="accordion"], [class*="faq"]').all()
            if accordions:
                for accordion in accordions[:3]:  # Test first 3
                    try:
                        if accordion.is_visible():
                            accordion.click()
                            page.wait_for_timeout(500)
                    except:
                        pass

            # Check for basic visual issues
            # 1. Check if body has content
            body_text = page.locator('body').inner_text()
            if len(body_text.strip()) < 100:
                result["errors"].append("Very little text content detected on page")

            # 2. Check for visible CTA on mobile
            page.set_viewport_size({'width': 390, 'height': 844})
            page.wait_for_timeout(500)

            cta_buttons = page.locator('button:has-text("Add to Cart"), button:has-text("Buy"), a:has-text("Add to Cart"), a:has-text("Buy")').all()
            visible_cta = False
            for cta in cta_buttons:
                try:
                    if cta.is_visible():
                        box = cta.bounding_box()
                        if box and box['y'] < 844:  # Visible in first viewport
                            visible_cta = True
                            break
                except:
                    pass

            if not visible_cta and cta_buttons:
                result["errors"].append("CTA button not visible in first mobile viewport")

            # Determine pass/fail
            result["passed"] = (
                result["images_loaded"] == result["images_total"] and
                result["images_total"] > 0 and
                not result["horizontal_scroll"] and
                result["accessibility"]["images_missing_alt"] == 0 and
                result["touch_targets_ok"] and
                len(result["errors"]) == 0
            )

        except Exception as e:
            result["errors"].append(f"Test execution error: {str(e)}")
            result["passed"] = False

        finally:
            browser.close()

    return result

if __name__ == "__main__":
    url = "https://seamlessblazer.netlify.app"
    result = test_ui_quality(url)
    print(json.dumps(result, indent=2))

    # Exit with appropriate code
    sys.exit(0 if result["passed"] else 1)
