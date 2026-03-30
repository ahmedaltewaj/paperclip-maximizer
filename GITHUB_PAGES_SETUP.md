# 🚀 GitHub Pages Enablement Guide

## Current Status

- **GitHub Repo:** https://github.com/ahmedaltewaj/paperclip-maximizer
- **GitHub Pages:** Not yet enabled (requires manual setup)
- **Temporary URL:** https://fluffy-groups-lick.loca.lt (expires ~24 hours)

## How to Enable GitHub Pages (One-Time Setup)

### Step 1: Go to Settings
Visit: https://github.com/ahmedaltewaj/paperclip-maximizer/settings/pages

### Step 2: Configure Build Source
Under "Build and deployment":
- **Source:** Select "GitHub Actions"
- Click "Save"

### Step 3: Run the Workflow
1. Go to: https://github.com/ahmedaltewaj/paperclip-maximizer/actions
2. Click "Deploy to GitHub Pages" workflow
3. Click "Run workflow" → "Run workflow"
4. Wait 2-3 minutes for deployment

### Step 4: Your Game is Live!
**Permanent URL:** https://fluffy-groups-lick.loca.lt

This URL will never expire and updates automatically when you push to main.

## Alternative: Quick Redeploy

If you need a fresh temporary URL right now:

```bash
./redeploy.sh
```

This will:
1. Build the game
2. Create a new localtunnel URL
3. Update all documentation with the new URL

## Troubleshooting

### "404 Site not found"
- GitHub Pages is still deploying (wait 2-3 minutes)
- Or Pages hasn't been enabled yet (follow Step 2 above)

### "Workflow failed"
- Check the Actions tab for error details
- Common fix: Ensure "GitHub Actions" is selected as the source in Settings

### "URL expired"
- Run `./redeploy.sh` for a new temporary URL
- Or enable GitHub Pages for a permanent URL
