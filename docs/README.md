# Breach Protocol - Vampire Survivors Clone

A browser-based survival roguelike with auto-attacking mechanics built using HTML5 Canvas and vanilla JavaScript (ES6+).

## Features

- 🎮 **Core Gameplay**: Auto-attacking weapons, enemy waves, XP collection
- 📈 **Progression**: Level-up system with stat upgrades and new weapons
- 🎯 **Combat**: Auto-targeting projectiles, damage numbers, hit effects
- ✨ **Juice System**: Visual feedback with particles, flashes, and screen shake
- 🎨 **ASCII Rendering**: Retro ASCII art style (sprite renderer ready)
- 🗺️ **Large World**: 4000×4000 scrolling world with camera follow
- ⚡ **Optimized**: Spatial hashing, off-screen culling, object pooling

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
http://localhost:3000
```

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrows | Move |
| 1, 2, 3 | Select upgrade |
| R | Restart (game over) |

## Project Structure

```
js/
├── main.js              # Game initialization
├── config/              # Game configuration
│   ├── GameConfig.js    # Global settings
│   ├── EnemyConfig.js   # Enemy types
│   ├── WeaponConfig.js  # Weapon definitions
│   ├── UpgradeConfig.js # Level-up upgrades
│   └── EffectConfig.js  # Visual effect presets
├── core/                # Core engine
│   ├── GameLoop.js      # 60 FPS loop
│   └── Camera.js        # Camera system
├── entities/            # Game objects
│   ├── Player.js        # Player entity
│   ├── Enemy.js         # Enemy entity
│   ├── Projectile.js    # Weapon projectiles
│   ├── Pickup.js        # XP gems
│   ├── DamageNumber.js  # Floating damage text
│   ├── Effect.js        # Visual effects
│   └── Particle.js      # Particle effects
├── systems/             # Game systems
│   ├── InputSystem.js   # Keyboard input
│   ├── RenderSystem.js  # Rendering + culling
│   ├── SpawnSystem.js   # Enemy spawning
│   ├── CollisionSystem.js # Collision detection
│   ├── WeaponSystem.js  # Weapon firing
│   ├── ExperienceSystem.js # XP & leveling
│   ├── EffectSystem.js  # Effect management
│   └── ParticleSystem.js # Particle management
├── renderers/           # Rendering backends
│   ├── IRenderer.js     # Renderer interface
│   └── ASCIIRenderer.js # ASCII rendering
├── ui/                  # UI components
│   └── LevelUpUI.js     # Level-up screen
└── utils/               # Utilities
    ├── Vector2D.js      # 2D math
    ├── SpatialHash.js   # Collision optimization
    └── ObjectPool.js    # Object reuse
```

## Architecture

- **Modular Design**: Systems communicate through a central game state
- **Renderer Abstraction**: Entities have no render methods, allowing easy renderer swaps
- **Data-Driven**: Weapons, enemies, and effects configured in JS config files
- **Frame-Independent**: All movement uses deltaTime for consistent behavior

## Documentation

See `docs/PROJECT_STATUS.md` for detailed implementation status and technical documentation.

## Development

This game uses vanilla JavaScript with ES6 modules. No build step required - edit files and refresh the browser.

### Debug Options

Edit `js/config/GameConfig.js`:
```javascript
DEBUG: {
    SHOW_FPS: true,      // FPS counter
    GOD_MODE: false,     // Invincibility
    SHOW_HITBOXES: false // Collision circles
}
```

---

*Built with ❤️ using HTML5 Canvas and vanilla JavaScript*
