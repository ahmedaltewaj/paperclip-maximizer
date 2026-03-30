# 🖇️ Paperclip Maximizer

**Universal Paperclip Production System** - An incremental game about converting all matter in the universe into paperclips.

![Game Screenshot](screenshot.png)

## 🎮 Play Now

**🌐 [Live Demo](https://wonderful-khapse-84c673.netlify.app)** *(Password: `My-Drop-Site`)*

Or run locally:
```bash
npm install
npm run dev
```

## 🎯 Objective

Your mission is simple: **Convert all matter in the universe into paperclips.**

Start with manual production, then build increasingly advanced automation systems to maximize your paperclip output. The game features a complete prestige system, research tree, achievements, and a victory condition when you've converted all matter in existence.

## ✨ Features

### Core Systems
- **Resource Management** - Balance matter, energy, and paperclip production
- **9 Automation Buildings** - From simple AutoClippers to Galactic Foundries
- **Research Tree** - 5 technologies that unlock new capabilities
- **Prestige System** - Earn processors for permanent bonuses
- **Win Condition** - Convert 10^53 kg of matter to achieve universal conquest

### Advanced Features (v1.2.0 - 21 Major Systems)

**🐾 Pets & Collection**
- **Pet System** - 5+ collectible pets with leveling, equipment, abilities, and arena battles
- **Pet Equipment** - Forge equipment, enchantments, 20+ items, materials system
- **Pet Arena** - Pet battles, 8 leagues (bronze to legend), tournaments, ranking
- **Paperclip Museum** - Collectible designs that provide production bonuses
- **Evolution Lab** - Genetic research, mutations, breeding, 11 paperclip variants

**⚔️ Combat & Events**
- **World Bosses** - 5 raid bosses (Anti-Matter Titan to Omniversal Tyrant) with legendary artifacts
- **Crisis Events** - Random disasters (solar flares, quantum instability, AI uprisings)
- **AI Factions** - 5 rival factions (Neural Collective, Silicon Syndicate, etc.) with diplomacy/warfare

**📜 Quests & Progression**
- **Quest System** - Story quests, daily/weekly quests, quest chains with tiered rewards
- **Season Pass** - 100-tier progression with free/premium rewards, challenges, skins, titles
- **Research Institute** - 12 additional technologies with researchers and breakthroughs

**💰 Economy & Trading**
- **Black Market** - Contraband trading with 4 dealers, reputation, heat system
- **Market Trading** - Buy/sell matter and energy with fluctuating prices
- **Quantum Casino** - Slot machine with growing jackpot pool
- **Prestige Shop** - 10+ permanent upgrades (efficiency, multipliers, auto-clickers)

**⚡ Powers & Abilities**
- **Pantheon** - 7 divine miracles (Blessing of Production, Smite, Resurrection, etc.)
- **Temporal Distortion** - 8 time abilities (acceleration, freeze, rewind, paradox, singularity)
- **Engineer Training** - Hire specialized engineers for production bonuses
- **Artifact Forge** - Craft 16 legendary artifacts across 5 tiers

**🌌 Conquest & Mini-Games**
- **Universal Domination** - Conquer 9 galactic regions (Milky Way to Observable Universe)
- **MiniGame Arcade** - 5 mini-games (Clip Clicker, Matter Matcher, Energy Defense, Quantum Quiz, Drone Racer)

### Technical Features
- **61 Achievements** - Tiered achievement system with progress tracking
- **48+ Manager Classes** - All fully implemented and enabled
- **Web Audio API** - Synthesized sound effects (no external files)
- **Offline Progress** - Accumulate resources while away (up to 24 hours)
- **Particle Effects** - Visual feedback on clicks and achievements
- **PWA Support** - Install as standalone app
- **Keyboard Shortcuts** - Full keyboard navigation
- **Save/Export/Import** - Unicode-safe encoding

### UI/UX Improvements (v1.1.0)
- **Loading Screen** - Animated loading screen with progress indicator
- **Tooltips** - Hover over numbers to see exact values
- **Production Rates** - Each building displays its clips/s or matter/s output
- **Auto-Save Indicator** - Visual status showing last save time
- **Custom Modals** - Beautiful styled modals instead of native confirms
- **Changelog** - Version history accessible from footer
- **Error Boundaries** - Global error handling prevents game crashes
- **Keyboard Navigation** - Full keyboard support for power users

### Statistics & Analytics
- **Production History Chart** - Track your progress over time
- **Personal Statistics Dashboard** - Efficiency metrics and building summary
- **Universal Conversion Progress** - See your path to total conquest
- **Play Time Tracking** - Monitor your session duration
- **Analytics Modal** - Production efficiency metrics

## 🏗️ Buildings

| Building | Production | Cost |
|----------|------------|------|
| AutoClipper | +0.1 clips/s | 10 matter, 10K J |
| Factory Unit | +1 clips/s | 100 matter, 100K J |
| Resource Drone | +1 matter/s | 50 matter, 50K J |
| Quantum Assembler | +50 clips/s | 10K matter, 10^9 J |
| Star Forge | +1K clips/s | 10^6 matter, 10^12 J |
| Matter Replicator | +10K clips/s | 10^9 matter, 10^15 J |
| Singularity Engine | +50K clips/s | 10^12 matter, 10^18 J |
| Universal Constructor | +1M clips/s | 10^15 matter, 10^22 J |
| Galactic Foundry | +50M clips/s | 10^18 matter, 10^26 J |

## 🔬 Research

- **Quantum Computing** - 10x processing power
- **Space Colonization** - Access to asteroid resources
- **Dyson Sphere** - Harness total solar output
- **Von Neumann Probes** - Self-replicating exploration
- **Universal Conversion** - The ultimate technology

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Space** | Make paperclip |
| **1-4** | Set buy amount (1x, 10x, 100x, Max) |
| **Shift+1-9** | Buy building 1-9 |
| **B** | Focus buy button |
| **R** | Open research modal |
| **A** | Scroll to automation panel |
| **S** | Open statistics modal |
| **Ctrl+S** | Save game |
| **Esc** | Close modals |

## 🎵 Audio

The game features a complete audio system using the Web Audio API:
- Click sounds when making paperclips
- Build sounds for construction
- Achievement unlock fanfare
- Victory celebration
- Error sounds for insufficient resources

Toggle sound effects and music from the header or settings.

## 💾 Save System

- **Auto-save** every 30 seconds with visual indicator
- **Manual save** with Ctrl+S or Save button
- **Export/Import** - Share saves between devices with Unicode-safe encoding
- **Offline progress** - Up to 24 hours of production calculated on return
- **Save Validation** - Prevents corrupted saves from breaking the game

## 🏆 Achievements

61 achievements across 5 tiers:
- **Tier 1** - Basic milestones (10 achievements)
- **Tier 2** - Resource accumulation (10 achievements)
- **Tier 3** - Building milestones (10 achievements)
- **Tier 4** - Advanced challenges (10 achievements)
- **Tier 5** - Ultimate goals (21 achievements)

## 🚀 Deployment

### One-Command Deploy
```bash
./deploy.sh
```

### Manual Deploy

Build for production:
```bash
npm run build
```

Deploy the `dist/` folder to any static host:

**GitHub Pages** (Recommended - Free)
1. Push to GitHub
2. Go to Settings → Pages → GitHub Actions
3. Auto-deploys on every push

**Surge.sh** (Free, instant)
```bash
npx surge dist/ paperclip-maximizer.surge.sh
```

**Netlify** (Free, drag-drop)
```bash
npx netlify deploy --prod --dir=dist
```

**Vercel** (Free)
```bash
npx vercel --prod
```

## 🛠️ Tech Stack

- **Vanilla JavaScript** - No frameworks, pure browser APIs
- **Vite** - Fast build tool and dev server
- **CSS3** - Modern styling with CSS variables
- **Web Audio API** - Procedural sound generation
- **localStorage** - Save game persistence
- **requestAnimationFrame** - Smooth 60fps game loop

## 📁 Project Structure

```
paperclip/
├── index.html          # Main HTML template
├── main.js            # Game logic (~12,300 lines)
├── style.css          # Styling (~6,500 lines)
├── manifest.json      # PWA manifest
├── icon-192.svg       # App icon
├── package.json       # Dependencies
├── .gitignore         # Git ignore rules
└── dist/             # Production build
```

## 🎨 Customization

The game uses CSS variables for easy theming:

```css
:root {
  --accent: #00d4ff;           /* Primary brand color */
  --accent-glow: rgba(0, 212, 255, 0.3);
  --bg-primary: #0a0a0f;       /* Main background */
  --bg-secondary: #14141f;     /* Card backgrounds */
  --bg-tertiary: #1e1e2e;      /* Tertiary backgrounds */
  --text-primary: #e0e0ff;     /* Primary text */
  --text-secondary: #a0a0c0;   /* Secondary text */
  --text-muted: #606080;       /* Muted text */
  --success: #00ff88;          /* Success color */
  --warning: #ffaa00;          /* Warning color */
  --danger: #ff4444;           /* Danger color */
}
```

## 🐛 Known Limitations

- **Audio Context** - Browsers may block audio until first user interaction
- **localStorage** - Save data is limited to ~5MB
- **Offline Progress** - Calculated on next load, not real-time

## 📦 Version History

### v1.2.0 - GAME COMPLETE (CEO Agent Final)
- **Enabled ALL 21 major manager systems** - From 5 systems to complete feature set
- **Pet System** - 5+ pets with leveling, equipment, abilities, arena
- **Crisis Events** - Random disasters with defense systems
- **AI Factions** - 5 discoverable factions with diplomacy/warfare
- **Quest System** - Story, daily, weekly quests with rewards
- **Season Pass** - 100-tier progression with challenges
- **Black Market** - Contraband trading with 4 dealers
- **Market Trading** - Resource trading with fluctuating prices
- **Quantum Casino** - Slot machine with growing jackpot
- **Pantheon** - 7 divine miracles and worship system
- **Temporal Distortion** - 8 time manipulation abilities
- **Engineer Training** - Hire specialized engineers
- **Artifact Forge** - Craft 16 legendary artifacts
- **MiniGame Arcade** - 5 mini-games with tokens
- **Universal Domination** - Conquer 9 galactic regions
- **Evolution Lab** - Genetic research, 11 paperclip variants
- **Prestige Shop** - 10+ permanent upgrades
- **Research Institute** - 12 technologies with researchers
- **Pet Equipment** - Forge, enchantments, 20+ items
- **Pet Arena** - 8 leagues, tournaments, ranking
- **Fixed critical bugs** - Research effects, Ascension, Matter Replicator

### v1.1.0 - UI/UX Improvements
- Added loading screen with progress bar
- Added tooltips for exact value display
- Added building production rate indicators
- Added Shift+1-9 keyboard shortcuts for buildings
- Added auto-save status indicator
- Added custom modals for confirmations
- Added changelog modal
- Fixed btoa Unicode encoding for save data
- Improved error handling with global boundaries
- Replaced setInterval with requestAnimationFrame

### v1.0.1 - Bug Fixes & Performance
- Fixed duplicate button ID issues
- Implemented missing modal functions
- Added save import validation
- Optimized game loop performance

### v1.0.0 - Initial Release
- Core gameplay with 9 automation buildings
- Research tree with 5 technologies
- Prestige system with permanent bonuses
- 61 achievements to unlock
- Offline progress calculation

## 📝 License

MIT License - feel free to modify and distribute!

## 🙏 Credits

Inspired by the classic "Universal Paperclips" by Frank Lantz.

Built with ❤️ and an unhealthy obsession with office supplies.

---

**Current Version:** 1.2.0 - GAME COMPLETE  
**Total Lines of Code:** ~19,000  
**Major Systems:** 21 (ALL ENABLED)  
**Achievements:** 61  
**Build Size:** ~372KB JS, ~91KB CSS (gzipped)  
**Status:** Production Ready - Maximum Feature Density
