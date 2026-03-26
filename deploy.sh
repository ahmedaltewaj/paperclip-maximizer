#!/bin/bash

# Paperclip Maximizer - Deployment Script
# Supports: Surge.sh, Netlify, Vercel, or GitHub Pages

set -e

echo "🖇️  Paperclip Maximizer Deployment"
echo "=================================="

# Build first
echo "📦 Building project..."
npm run build

# Check if dist exists
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist folder not found"
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Deployment options
echo "Choose deployment target:"
echo "1) Surge.sh (requires surge account)"
echo "2) Netlify CLI (requires netlify account)"
echo "3) Vercel CLI (requires vercel account)"
echo "4) GitHub Pages (pushes to repo, requires GitHub)"
echo "5) Local preview only"
echo ""
read -p "Enter choice (1-5): " choice

case $choice in
    1)
        if ! command -v surge &> /dev/null; then
            echo "Installing surge..."
            npm install -g surge
        fi
        read -p "Enter subdomain (default: paperclip-maximizer): " subdomain
        subdomain=${subdomain:-paperclip-maximizer}
        surge dist/ "$subdomain.surge.sh"
        echo "✅ Deployed to https://$subdomain.surge.sh"
        ;;
    
    2)
        if ! command -v netlify &> /dev/null; then
            echo "Installing netlify-cli..."
            npm install -g netlify-cli
        fi
        netlify deploy --prod --dir=dist
        ;;
    
    3)
        if ! command -v vercel &> /dev/null; then
            echo "Installing vercel..."
            npm install -g vercel
        fi
        vercel --prod
        ;;
    
    4)
        echo "🚀 GitHub Pages Deployment"
        echo "==========================="
        echo "To deploy to GitHub Pages:"
        echo "1. Push this repo to GitHub"
        echo "2. Go to Settings > Pages"
        echo "3. Set source to 'GitHub Actions'"
        echo "4. The workflow in .github/workflows/deploy.yml will auto-deploy"
        echo ""
        read -p "Push to GitHub now? (y/n): " push
        if [ "$push" = "y" ]; then
            read -p "Enter GitHub repo URL: " repo
            git remote add origin "$repo" 2>/dev/null || true
            git push -u origin main
            echo "✅ Pushed to GitHub! Enable Pages in repo settings."
        fi
        ;;
    
    5)
        echo "🖥️  Starting local preview server..."
        npm run preview
        ;;
    
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esc
