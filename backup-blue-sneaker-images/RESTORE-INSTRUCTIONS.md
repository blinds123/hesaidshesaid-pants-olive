# Quick Restore Instructions for Blue Sneaker

**Product:** Auralo Baby Blue Suede Sneakers
**Target Site:** https://seamlessblazer.netlify.app

---

## FAST RESTORATION (5 minutes)

### Step 1: Copy Images
```bash
cd "/Users/nelsonchan/Downloads/secretjeans TEMPLATE SMALL copy"

# Copy Blue Sneaker images to product folder
cp backup-blue-sneaker-images/prodsneaker*.webp images/product/
```

### Step 2: Restore HTML
```bash
# Replace current index.html with Blue Sneaker version
cp backup-blue-sneaker-images/index-blue-sneaker.html index.html
```

### Step 3: Commit and Deploy
```bash
# Add changes
git add images/product/ index.html

# Commit restoration
git commit -m "Restore Auralo Baby Blue Sneaker landing page

Restored from commit 56c52b7

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to deploy (if auto-deploy enabled)
git push origin main
```

### Step 4: Manual Deploy (if auto-deploy not enabled)
```bash
netlify deploy --prod
```

---

## VERIFICATION

After deployment, verify:

1. **Site loads:**
   ```bash
   curl -I https://seamlessblazer.netlify.app
   ```

2. **Check hero image:**
   - Visit https://seamlessblazer.netlify.app
   - Hero image should show baby blue sneakers
   - No broken images

3. **Test CTAs:**
   - Primary CTA ($69) opens popup
   - Secondary CTA ($29) opens popup
   - Decline buttons redirect to SimpleSwap

4. **Test pool function:**
   ```bash
   curl -X POST https://seamlessblazer.netlify.app/.netlify/functions/buy-now \
     -H "Content-Type: application/json" \
     -d '{"amountUSD": 69}'
   ```

---

## FILES IN THIS BACKUP

- `prodsneaker11.webp` - Hero image (53KB)
- `prodsneaker121.webp` - Gallery image 2 (59KB)
- `prodsneaker1231.webp` - Gallery image 3 (58KB)
- `prodsneaker12341.webp` - Gallery image 4 (49KB)
- `index-blue-sneaker.html` - Complete landing page
- `netlify-blue-sneaker.toml` - Netlify configuration (if different)

All files extracted from git commit: `56c52b7`

---

## PRODUCT DETAILS

- Product: Auralo Baby Blue Suede Sneakers
- Title: "Auralo Baby Blue Suede Sneakers - Limited Edition"
- Tagline: "Handcrafted Italian Luxury - Limited Release"
- Regular Price: $69
- Pre-Order Price: $29
- TikTok Pixel: D3CVHNBC77U2RE92M7O0

---

## ROLLBACK (If Something Goes Wrong)

If you need to rollback to He Said She Said Pants:

```bash
# Revert the restoration commit
git revert HEAD

# Push changes
git push origin main
```

Or restore from backup branch:
```bash
# If you created backup branch before restoring
git checkout backup-pants-olive-2025-11-29
git checkout -b main-restored
git push origin main-restored
```

---

**Extracted:** 2025-11-29
**Ready to deploy!**
