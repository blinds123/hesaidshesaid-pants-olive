# Seamlessblazer Netlify Site - Restoration Documentation

**Generated:** 2025-11-29
**Site:** https://seamlessblazer.netlify.app
**Netlify Admin:** https://app.netlify.com/projects/seamlessblazer

---

## CURRENT STATE

**Current Product Deployed:** He Said She Said Pants Olive
**Deployment Date:** 2025-11-29
**Commit:** `622a720` - "Deploy He Said She Said Pants Olive landing page"

### Current Configuration
- Product: He Said She Said Pants Olive
- Regular Price: $59
- Pre-Order Price: $19
- Order Bump: $10 (Matching Bustier)
- TikTok Pixel: D3CVHNBC77U2RE92M7O0

---

## PREVIOUS STATE (What Should Be Restored)

**Previous Product:** Auralo Baby Blue Suede Sneakers
**Last Known Deploy:** 2025-11-24
**Commit:** `56c52b7` - "Switch to Baby Blue Sneaker with SimpleSwap pool integration"

### Previous Configuration
- Product Name: Auralo Baby Blue Suede Sneakers
- Title: "Auralo Baby Blue Suede Sneakers - Limited Edition"
- Tagline: "Handcrafted Italian Luxury - Limited Release"
- Regular Price: $69
- Pre-Order Price: $29
- Content ID: auralo-baby-blue-suede-sneakers
- TikTok Pixel: D3CVHNBC77U2RE92M7O0 (same pixel)

### Previous Product Images
The Blue Sneaker deployment used these image files:
- `images/product/prodsneaker11.webp` (Hero image)
- `images/product/prodsneaker121.webp`
- `images/product/prodsneaker1231.webp`
- `images/product/prodsneaker12341.webp`

**NOTE:** These image files are NOT in the current repository. They were replaced when the Pants product was deployed.

---

## GIT COMMIT TIMELINE

### Blue Sneaker Era (Nov 24, 2025)
```
79526a8 - Add SimpleSwap pool integration to Blue Sneaker landing page
56c52b7 - Switch to Baby Blue Sneaker with SimpleSwap pool integration
```

### Pants Era (Nov 28-29, 2025)
```
622a720 - Deploy He Said She Said Pants Olive landing page
2ca9afd - Implement all agent recommendations
a3a7dd2 - Fix critical issues from 4-agent audit
bc46b7c - Add order bump system: preorder with upsell option
```

---

## RESTORATION STEPS

### Option 1: Git Revert to Blue Sneaker (RECOMMENDED IF YOU HAVE BACKUP IMAGES)

**Prerequisites:**
- You must have backup copies of the Blue Sneaker product images:
  - `prodsneaker11.webp`
  - `prodsneaker121.webp`
  - `prodsneaker1231.webp`
  - `prodsneaker12341.webp`

**Steps:**
```bash
cd "/Users/nelsonchan/Downloads/secretjeans TEMPLATE SMALL copy"

# 1. Create a backup branch of current state
git checkout -b backup-pants-olive-2025-11-29

# 2. Return to main branch
git checkout main

# 3. Reset to Blue Sneaker commit (DESTRUCTIVE - creates new history)
git reset --hard 56c52b7

# 4. Restore the Blue Sneaker product images to images/product/
# (You must manually copy the prodsneaker*.webp files back)

# 5. Force push to update Netlify (if auto-deploy is enabled)
git push origin main --force

# 6. Or manually deploy via Netlify CLI
netlify deploy --prod
```

**WARNING:** This is a destructive operation that rewrites git history. The backup branch preserves your Pants deployment.

---

### Option 2: Cherry-Pick Blue Sneaker Code (SAFER)

**Steps:**
```bash
cd "/Users/nelsonchan/Downloads/secretjeans TEMPLATE SMALL copy"

# 1. Check out the Blue Sneaker index.html
git show 56c52b7:index.html > index.html

# 2. Restore Blue Sneaker product images
# (You must manually copy the prodsneaker*.webp files to images/product/)

# 3. Commit the restoration
git add index.html images/product/
git commit -m "Restore Auralo Baby Blue Sneaker landing page"

# 4. Deploy
git push origin main
# Or: netlify deploy --prod
```

---

### Option 3: Start Fresh with New Template (IF NO BACKUP IMAGES)

If you don't have the original Blue Sneaker images, you'll need to:

1. Find the original product images from your source
2. Use the BULLETPROOF LAUNCHER V7.0 template to recreate the page
3. Reference commit `56c52b7` for the exact configuration

**Configuration to use:**
```
Product: Auralo Baby Blue Suede Sneakers
Price: $69
Pre-order: $29
Title: "Auralo Baby Blue Suede Sneakers - Limited Edition"
Description: "Premium Italian handcrafted baby blue suede sneakers"
```

---

## MISSING FILES

The following files from the Blue Sneaker deployment are **NOT** in the current repository:

### Product Images
- `images/product/prodsneaker11.webp`
- `images/product/prodsneaker121.webp`
- `images/product/prodsneaker1231.webp`
- `images/product/prodsneaker12341.webp`

### Other Possible Assets
- Testimonial images specific to sneakers (if any)
- Promotional graphics
- Any other Blue Sneaker-specific assets

**CRITICAL:** You must locate these files from:
- Your local backup
- Original design files
- Previous download folders
- Cloud storage (Dropbox, Google Drive, etc.)

---

## VERIFICATION AFTER RESTORATION

After restoring the Blue Sneaker, verify:

1. **Site loads correctly:**
   ```bash
   curl -I https://seamlessblazer.netlify.app
   ```

2. **Hero image displays:**
   - Check that prodsneaker11.webp loads
   - No broken image icons

3. **CTAs work:**
   - Primary CTA ($69) triggers popup
   - Secondary CTA ($29) triggers popup
   - Decline buttons redirect to SimpleSwap

4. **TikTok Pixel fires:**
   - ViewContent event on page load
   - Purchase event on checkout

5. **Pool integration works:**
   ```bash
   curl -X POST https://seamlessblazer.netlify.app/.netlify/functions/buy-now \
     -H "Content-Type: application/json" \
     -d '{"amountUSD": 69}'
   ```

---

## RECOMMENDED ACTION

**Before proceeding with any restoration:**

1. **Locate the original Blue Sneaker image files**
   - Check your Downloads folder for "Auralo" or "sneaker" folders
   - Check any design tool exports (Canva, Figma, etc.)
   - Search your computer for "prodsneaker*.webp"

2. **Create a complete backup:**
   ```bash
   git checkout -b backup-pants-olive-2025-11-29
   git push origin backup-pants-olive-2025-11-29
   ```

3. **Choose restoration method:**
   - If you have images: Use Option 1 (Git Reset) or Option 2 (Cherry-Pick)
   - If no images: Use Option 3 (Recreate from scratch)

---

## SUPPORT COMMANDS

### Find Blue Sneaker images on your system:
```bash
# Search entire system for sneaker images
find ~ -name "prodsneaker*.webp" 2>/dev/null

# Search Downloads folder
find ~/Downloads -name "*sneaker*" -o -name "*Auralo*" 2>/dev/null

# Search for recent WebP images
find ~/Downloads -name "*.webp" -mtime -30 2>/dev/null
```

### Extract file from git history (if it exists):
```bash
# List all files in the Blue Sneaker commit
git ls-tree -r 56c52b7

# Extract specific image (if it was committed)
git show 56c52b7:images/product/prodsneaker11.webp > prodsneaker11.webp
```

---

## CONCLUSION

The seamlessblazer Netlify site originally hosted the **Auralo Baby Blue Suede Sneakers** product page before being replaced with the **He Said She Said Pants Olive** page on Nov 29, 2025.

**Key blocker:** The original Blue Sneaker product images are not in the current git repository and must be recovered from your local files before restoration can be completed.

**Next step:** Locate the `prodsneaker*.webp` files, then follow one of the three restoration options above.

---

*Documentation generated by analyzing git history and deployment records.*
