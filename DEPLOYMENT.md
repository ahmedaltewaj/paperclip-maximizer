# Deployment Guide

## Current Status

**Game is built and ready for deployment!**

Production build location: `/home/ahmed/paperclip/dist/`

Build stats:
- JavaScript: 372KB (77KB gzipped)
- CSS: 91KB (13KB gzipped)
- HTML: 28KB (5KB gzipped)
- Total: ~95KB gzipped

---

## Quick Deploy Options

### Option 1: GitHub Pages (Recommended - Free, Permanent)

**Status:** ❌ Requires manual enablement in GitHub UI

**Steps:**
1. Go to: https://github.com/ahmedaltewaj/paperclip-maximizer/settings/pages
2. Under "Build and deployment", select **"GitHub Actions"**
3. Click Save
4. The workflow will automatically deploy on every push to main

**Expected URL:** https://ahmedaltewaj.github.io/paperclip-maximizer/

---

### Option 2: Netlify (Free, Instant)

**Steps:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login (opens browser)
netlify login

# Deploy
cd /home/ahmed/paperclip
netlify deploy --prod --dir=dist
```

**Features:**
- Custom domain support
- Automatic HTTPS
- Branch previews
- Form handling

---

### Option 3: Vercel (Free, Serverless)

**Steps:**
```bash
# Install Vercel CLI
npm install -g vercel

# Login (opens browser)
vercel login

# Deploy
cd /home/ahmed/paperclip/dist
vercel --prod
```

**Features:**
- Zero-config deployment
- Automatic HTTPS
- Edge network
- Serverless functions (if needed later)

---

### Option 4: Surge.sh (Free, Simple)

**Steps:**
```bash
# Install Surge
npm install -g surge

# Deploy
cd /home/ahmed/paperclip/dist
surge

# Or with custom domain:
surge --domain paperclip-maximizer.surge.sh
```

**Features:**
- No account required for basic use
- Custom subdomain
- Automatic HTTPS

---

### Option 5: Cloudflare Pages (Free, Fast)

**Steps:**
1. Go to https://dash.cloudflare.com
2. Navigate to Pages
3. Click "Create a project"
4. Connect your GitHub repo
5. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`

**Features:**
- 200+ edge locations
- Automatic HTTPS
- Custom domain
- Analytics

---

## Current Temporary Solution

**Localtunnel:** https://pink-numbers-rule.loca.lt

- ✅ Working now
- ⚠️ URL changes if tunnel restarts
- ⚠️ Requires tunnel process to keep running

---

## Recommended Action

**Enable GitHub Pages** - It's the most permanent solution and requires no additional accounts:

1. Visit: https://github.com/ahmedaltewaj/paperclip-maximizer/settings/pages
2. Select "GitHub Actions" under Build and deployment
3. Click Save
4. The game will be live at https://ahmedaltewaj.github.io/paperclip-maximizer/ within 2-3 minutes

The workflow file is already configured at `.github/workflows/deploy.yml`

---

## Post-Deployment Checklist

After deploying, update these files with the new URL:
- [ ] README.md
- [ ] marketing/reddit-incremental-games.md
- [ ] marketing/hacker-news.md
- [ ] marketing/LAUNCH-GUIDE.md
- [ ] package.json (homepage field)

Run this command to update all URLs:
```bash
# Replace OLD_URL with your temporary URL
# Replace NEW_URL with your permanent URL
find . -name "*.md" -o -name "*.json" | xargs sed -i 's|pink-numbers-rule.loca.lt|your-new-url.com|g'
```

---

## Need Help?

If you encounter issues:
1. Check that `dist/` folder exists and has files
2. Verify your hosting account is set up
3. Check build logs for errors
4. Test locally with `npx serve dist`

**Current game is ready to deploy!** 🚀
