# 🖇️ Paperclip Maximizer

**Universal Paperclip Production System** - An incremental game about converting all matter in the universe into paperclips.

![Game Screenshot](screenshot.png)

## 🎮 Play Now

[Live Demo](https://your-demo-link-here.com) *(deploy your own!)*

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

### Advanced Features
- **61 Achievements** - Tiered achievement system with progress tracking
- **Web Audio API** - Synthesized sound effects (no external files)
- **Offline Progress** - Accumulate resources while away
- **Particle Effects** - Visual feedback on clicks and achievements
- **PWA Support** - Install as standalone app
- **Keyboard Shortcuts** - Space to make clips, 1-4 for buy amounts
- **Save/Export/Import** - Never lose your progress

### Statistics & Analytics
- **Production History Chart** - Track your progress over time
- **Personal Statistics Dashboard** - Efficiency metrics and building summary
- **Universal Conversion Progress** - See your path to total conquest
- **Play Time Tracking** - Monitor your session duration

## 🏗️ Buildings

| Building | Clips/sec | Cost Progression |
|----------|-----------|------------------|
| AutoClipper | 0.1 | 10 matter, 10K J |
| Factory Unit | 1 | 100 matter, 100K J |
| Resource Drone | - | 50 matter, 50K J (gathers matter) |
| Quantum Assembler | 50 | 10K matter, 10^9 J |
| Star Forge | 1,000 | 10^6 matter, 10^12 J |
| Matter Replicator | 10,000 | 10^9 matter, 10^15 J |
| Singularity Engine | 50,000 | 10^12 matter, 10^18 J |
| Universal Constructor | 1M | 10^15 matter, 10^22 J |
| Galactic Foundry | 50M | 10^18 matter, 10^26 J |

## 🔬 Research

- **Quantum Computing** - 10x processing power
- **Space Colonization** - Access to asteroid resources
- **Dyson Sphere** - Harness total solar output
- **Von Neumann Probes** - Self-replicating exploration
- **Universal Conversion** - The ultimate technology

## ⌨️ Controls

- **Space** - Make paperclip
- **1-4** - Set buy amount (1x, 10x, 100x, Max)
- **Ctrl+S** - Save game
- **Esc** - Close modals

## 🎵 Audio

The game features a complete audio system using the Web Audio API:
- Click sounds when making paperclips
- Build sounds for construction
- Achievement unlock fanfare
- Victory celebration
- Error sounds for insufficient resources

Toggle sound effects and music from the header or settings.

## 💾 Save System

- **Auto-save** every 30 seconds
- **Manual save** with Ctrl+S or Save button
- **Export/Import** - Share saves between devices
- **Offline progress** - Up to 24 hours of production

## 🏆 Achievements

61 achievements across 5 tiers:
- **Tier 1** - Basic milestones (10 achievements)
- **Tier 2** - Resource accumulation (10 achievements)
- **Tier 3** - Building milestones (10 achievements)
- **Tier 4** - Advanced challenges (10 achievements)
- **Tier 5** - Ultimate goals (21 achievements)

## 🚀 Deployment

Build for production:
```bash
npm run build
```

Deploy the `dist/` folder to any static host:
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
- Any web server

## 🛠️ Tech Stack

- **Vanilla JavaScript** - No frameworks, pure browser APIs
- **Vite** - Fast build tool and dev server
- **CSS3** - Modern styling with CSS variables
- **Web Audio API** - Procedural sound generation
- **localStorage** - Save game persistence

## 📁 Project Structure

```
paperclip/
├── index.html          # Main HTML template
├── main.js            # Game logic (4,100+ lines)
├── style.css          # Styling (1,900+ lines)
├── manifest.json      # PWA manifest
├── icon-192.svg       # App icon
├── package.json       # Dependencies
└── dist/             # Production build
```

## 🎨 Customization

The game uses CSS variables for easy theming:

```css
:root {
  --accent: #6366f1;           /* Primary brand color */
  --accent-secondary: #8b5cf6; /* Secondary accent */
  --bg-primary: #0a0a0f;       /* Main background */
  --bg-secondary: #12121a;     /* Card backgrounds */
  --text-primary: #e2e8f0;     /* Primary text */
  --text-secondary: #94a3b8;   /* Secondary text */
}
```

## 🐛 Known Limitations

- **Audio Context** - Browsers may block audio until first user interaction
- **localStorage** - Save data is limited to ~5MB
- **Offline Progress** - Calculated on next load, not real-time

## 📝 License

MIT License - feel free to modify and distribute!

## 🙏 Credits

Inspired by the classic "Universal Paperclips" by Frank Lantz.

Built with ❤️ and an unhealthy obsession with office supplies.

---

**Current Version:** 1.0.0  
**Total Lines of Code:** ~6,500  
**Achievements:** 61  
**Build Size:** ~180KB (gzipped)
