#!/bin/bash
set -e

echo "🖇️  Paperclip Maximizer - Redeploy Script"
echo "=========================================="

pkill -f "serve" 2>/dev/null || true
pkill -f "lt --port" 2>/dev/null || true
sleep 2

echo "Building..."
npm run build

echo "Starting local server..."
cd dist
npx serve -l 8080 > /dev/null 2>&1 &
sleep 3

echo "Creating tunnel..."
TUNNEL_OUTPUT=$(npx lt --port 8080 2>&1)
NEW_URL=$(echo "$TUNNEL_OUTPUT" | grep -o 'https://[^[:space:]]*\.loca\.lt')

echo ""
echo "✅ Game is LIVE!"
echo "🌐 URL: $NEW_URL"
echo ""

cd ..
OLD_URL=$(grep -o 'https://[^[:space:]]*\.loca\.lt' README.md | head -1 || true)
if [ -n "$OLD_URL" ]; then
    find . -name "*.md" -type f -exec sed -i "s|$OLD_URL|$NEW_URL|g" {} \;
    echo "✅ Documentation updated"
fi

echo ""
echo "📋 Summary:"
echo "   Game URL: $NEW_URL"
echo "   This URL will expire in ~24 hours"
echo "   Run ./redeploy.sh to get a new URL"
echo ""
echo "🚀 For permanent hosting, enable GitHub Pages:"
echo "   https://github.com/ahmedaltewaj/paperclip-maximizer/settings/pages"
