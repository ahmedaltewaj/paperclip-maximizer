# Hacker News - Show HN Post

## Title
Show HN: Paperclip Maximizer – A feature-complete incremental game in vanilla JS

## Post Body
Paperclip Maximizer is a browser-based incremental game about converting all matter in the universe into paperclips. Built as a love letter to Universal Paperclips, but with a focus on maximum feature density and modern web development practices.

**Live demo: https://pink-numbers-rule.loca.lt**

**GitHub: https://github.com/ahmedaltewaj/paperclip-maximizer**

**Why I built this:**

I wanted to see how much complexity and depth I could pack into a zero-dependency vanilla JavaScript game. The result: ~19,000 lines of JS implementing 21 major manager systems, 61 achievements, and a complete game loop with prestige and win conditions.

**Technical implementation:**

- Pure vanilla JavaScript (no frameworks, no build step for gameplay)
- Vite for dev server and production builds
- Web Audio API for procedural sound generation (no external audio files)
- CSS3 with custom properties for theming
- localStorage for save persistence
- requestAnimationFrame for the game loop
- Unicode-safe save encoding (handles all character sets)

**Systems architecture:**

The game uses a manager pattern where each major feature is a self-contained class:
```javascript
// 48+ manager classes, all enabled
PetManager, WorldBossManager, QuestManager, SeasonPassManager,
BlackMarketManager, TemporalManager, PantheonManager, CasinoManager,
EngineerManager, ArtifactForgeManager, MiniGameManager, ...
```

Each manager handles its own state, UI, and persistence. The main game loop delegates to managers for updates.

**Feature highlights:**

- 9 automation buildings with escalating production
- Complete prestige system with permanent upgrades
- Research tree with 5 core + 12 advanced technologies
- Pet collection and battling system
- World bosses with raid mechanics
- Trading, gambling, and contraband systems
- Time manipulation abilities
- Achievement system with 61 unlockables
- Full keyboard navigation
- Offline progress calculation (up to 24h)

**What I'd do differently:**

Given the scope creep (started as a simple clicker, ended up with 21 systems), I probably would have:
- Used TypeScript for better type safety
- Implemented a proper state management library
- Created automated tests for the manager classes

But as a learning project and proof-of-concept for vanilla JS capabilities, I'm happy with where it landed.

**Try it out:**

The game is playable in the link above. Would love feedback on:
- Balance and progression pacing
- UI/UX improvements
- Bug reports
- Feature suggestions

Thanks for checking it out!

---

*Note: Currently using localtunnel for the demo while setting up permanent hosting on GitHub Pages.*
