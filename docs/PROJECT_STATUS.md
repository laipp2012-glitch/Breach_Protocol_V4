# Vampire Survivors Clone - Project Documentation

## Overview

A browser-based survival roguelike with auto-attacking mechanics built using HTML5 Canvas and vanilla JavaScript (ES6+). Features a modular juice/effects system for satisfying visual feedback.

**Current Status**: Phases 1-5 Complete + Juice System

---

## Implementation Status

### ✅ Phase 1: Core Foundation
| Feature | Status | File(s) |
|---------|--------|---------|
| Game Loop (60 FPS) | ✅ | `js/core/GameLoop.js` |
| Player Entity | ✅ | `js/entities/Player.js` |
| Input System (WASD/Arrows) | ✅ | `js/systems/InputSystem.js` |
| Renderer Abstraction | ✅ | `js/renderers/IRenderer.js` |
| ASCII Renderer | ✅ | `js/renderers/ASCIIRenderer.js` |
| Render System | ✅ | `js/systems/RenderSystem.js` |
| Vector2D Utility | ✅ | `js/utils/Vector2D.js` |
| Game Configuration | ✅ | `js/config/GameConfig.js` |

### ✅ Phase 2: Enemy System
| Feature | Status | File(s) |
|---------|--------|---------|
| Enemy Entity (3 types) | ✅ | `js/entities/Enemy.js` |
| Enemy Config (Basic/Tank/Fast) | ✅ | `js/config/EnemyConfig.js` |
| Spawn System (edge spawning) | ✅ | `js/systems/SpawnSystem.js` |
| Enemy-Player Collision | ✅ | `js/systems/CollisionSystem.js` |
| Enemy movement toward player | ✅ | `js/entities/Enemy.js` |

### ✅ Phase 3: Combat System
| Feature | Status | File(s) |
|---------|--------|---------|
| Weapon Configuration | ✅ | `js/config/WeaponConfig.js` |
| Projectile Entity | ✅ | `js/entities/Projectile.js` |
| Weapon System (auto-targeting) | ✅ | `js/systems/WeaponSystem.js` |
| Projectile-Enemy Collision | ✅ | `js/systems/CollisionSystem.js` |
| Magic Wand Weapon | ✅ | Defined in `WeaponConfig.js` |
| Damage Numbers | ✅ | `js/entities/DamageNumber.js` |

### ✅ Phase 4: Progression System
| Feature | Status | File(s) |
|---------|--------|---------|
| XP Pickup Entity | ✅ | `js/entities/Pickup.js` |
| Experience System | ✅ | `js/systems/ExperienceSystem.js` |
| Level-Up UI (3 choices) | ✅ | `js/ui/LevelUpUI.js` |
| Upgrade Config (5 stat types) | ✅ | `js/config/UpgradeConfig.js` |
| HUD (Health, XP, Stats) | ✅ | `js/main.js` (drawHUD) |

### ✅ Phase 5: Optimization
| Feature | Status | File(s) |
|---------|--------|---------|
| Spatial Hash Grid | ✅ | `js/utils/SpatialHash.js` |
| Optimized Collision | ✅ | `js/systems/CollisionSystem.js` |
| Object Pooling Utility | ✅ | `js/utils/ObjectPool.js` |
| Off-screen Culling | ✅ | `js/systems/RenderSystem.js` |

### ✅ Juice/Effects System (NEW)
| Feature | Status | File(s) |
|---------|--------|---------|
| Effect Base Class | ✅ | `js/entities/Effect.js` |
| ScalePulse Effect | ✅ | `js/entities/Effect.js` |
| Flash Effect | ✅ | `js/entities/Effect.js` |
| Shake Effect | ✅ | `js/entities/Effect.js` |
| ScreenShake Effect | ✅ | `js/entities/Effect.js` |
| Knockback Effect | ✅ | `js/entities/Effect.js` |
| Effect System | ✅ | `js/systems/EffectSystem.js` |
| Particle Entity | ✅ | `js/entities/Particle.js` |
| Particle System | ✅ | `js/systems/ParticleSystem.js` |
| Effect Presets Config | ✅ | `js/config/EffectConfig.js` |

### ✅ Camera System
| Feature | Status | File(s) |
|---------|--------|---------|
| Camera following player | ✅ | `js/core/Camera.js` |
| 4000×4000 world | ✅ | `GameConfig.WORLD` |
| Smooth camera lerp | ✅ | `Camera.update()` |
| Camera-edge spawning | ✅ | `js/systems/SpawnSystem.js` |
| Screen shake support | ✅ | `js/core/Camera.js` |

### ⏳ Phase 6: Content Expansion (Partial)
| Feature | Status | Notes |
|---------|--------|-------|
| Knife Weapon | ⏳ | Config defined, visual support ready |
| Garlic Weapon | ⏳ | Config defined, visual support ready |
| More enemy types | ❌ | Only 3 types exist |
| Weapon evolution | ❌ | Not implemented |

### ❌ Phase 7: Graphics & Polish (Not Started)
| Feature | Status | Notes |
|---------|--------|-------|
| Sprite Renderer | ❌ | Only ASCII renderer |
| Sound system | ❌ | No audio |
| Main menu | ❌ | Game starts immediately |
| Save/load | ❌ | No persistence |

---

## File Structure

```
js/
├── main.js                 # Game initialization & HUD
├── config/
│   ├── GameConfig.js       # Global constants (world, player, colors, ASCII)
│   ├── EnemyConfig.js      # 3 enemy types: Basic, Tank, Fast
│   ├── WeaponConfig.js     # Magic Wand + Knife/Garlic (defined)
│   ├── UpgradeConfig.js    # 5 stat upgrades + weapon upgrades
│   └── EffectConfig.js     # Juice effect presets (NEW)
├── core/
│   ├── GameLoop.js         # 60 FPS requestAnimationFrame loop
│   └── Camera.js           # Player-following camera with lerp + shake
├── entities/
│   ├── Player.js           # Player state, movement, XP, weapons
│   ├── Enemy.js            # Enemy state, AI movement, effect properties
│   ├── Projectile.js       # Weapon projectiles with pierce/range
│   ├── Pickup.js           # XP gems with magnetic pull
│   ├── DamageNumber.js     # Floating damage text (NEW)
│   ├── Effect.js           # Base effect + 5 effect types (NEW)
│   └── Particle.js         # Visual particles (NEW)
├── renderers/
│   ├── IRenderer.js        # Abstract renderer interface
│   └── ASCIIRenderer.js    # ASCII character rendering + effects
├── systems/
│   ├── InputSystem.js      # Keyboard input handling
│   ├── RenderSystem.js     # Rendering coordinator + off-screen culling
│   ├── SpawnSystem.js      # Enemy spawning at camera edges
│   ├── CollisionSystem.js  # Spatial-hashed collision detection
│   ├── WeaponSystem.js     # Auto-targeting weapon firing
│   ├── ExperienceSystem.js # XP collection and leveling
│   ├── EffectSystem.js     # Visual effects manager (NEW)
│   └── ParticleSystem.js   # Particle spawning/updating (NEW)
├── ui/
│   └── LevelUpUI.js        # Level-up selection screen
└── utils/
    ├── Vector2D.js         # 2D math utilities
    ├── SpatialHash.js      # Grid-based spatial partitioning
    └── ObjectPool.js       # Object reuse utility (NEW)
```

---

## Key Architecture Decisions

### 1. Renderer Abstraction
All entities have **no render methods**. The `RenderSystem` coordinates with `IRenderer` implementations. This allows swapping ASCII for sprites without changing game logic.

### 2. Frame-Rate Independence
All movement uses `deltaTime` multiplication for consistent behavior regardless of actual FPS.

### 3. Spatial Hashing
Collisions use 100px grid cells, checking only 9 adjacent cells. Reduces O(n²) to O(n).

### 4. Camera System
Player moves in 4000×4000 world space. Camera follows with smooth lerp. Enemies spawn at camera view edges.

### 5. Modular Juice System
Effects are config-driven and renderer-agnostic. Five effect types (scale, flash, shake, screen shake, knockback) can be combined in presets. Particles support ASCII characters.

### 6. Data-Driven Configuration
Weapons, enemies, upgrades, and effects defined in config files. Easy to tune and add content.

---

## Juice/Effects System

### Effect Types
| Effect | Description | Use Case |
|--------|-------------|----------|
| ScalePulse | Briefly scale up then return | Enemy hit, level up |
| Flash | Color overlay fade | Damage taken |
| Shake | Random position offset | Entity damage |
| ScreenShake | Camera shake | Player hit |
| Knockback | Push in direction | Future use |

### Effect Presets (EffectConfig.js)
- `ENEMY_HIT` - Scale pulse + flash + red particles
- `ENEMY_DEATH` - Scale pulse + particle burst
- `PLAYER_HIT` - Screen shake + red flash
- `LEVEL_UP` - Gold particle fountain
- `XP_COLLECT` - Small particle sparkle

### Particle Configuration
```javascript
particles: {
    count: 6,           // Number of particles
    char: '*',          // ASCII character (null = circles)
    color: '#FF0000',   // Color
    size: 12,           // Font size / circle radius
    speed: [60, 120],   // Speed range
    lifetime: 0.4,      // Duration in seconds
    gravity: 100,       // Downward acceleration (- = up)
    spread: 360         // Angle spread in degrees
}
```

---

## ASCII Visual Reference

| Entity | Character | Color |
|--------|-----------|-------|
| Player | @ | Green |
| Basic Enemy | E | Red |
| Tank Enemy | T | Dark Red |
| Fast Enemy | F | Orange |
| Magic Wand Projectile | * | Yellow |
| Knife Projectile | / | Silver |
| Garlic Aura | ◎ | Light Green |
| XP Gem | $ | Cyan |
| Health Pickup | + | Green |
| Damage Number | (text) | White |
| Particles | * · + | Configurable |

---

## How to Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
http://localhost:3000
```

## Controls
- **WASD / Arrow Keys**: Move player
- **1, 2, 3 / Click**: Select upgrade on level-up
- **R**: Restart (after game over)

## Debug Options (GameConfig.js)
- `DEBUG.SHOW_FPS`: Show FPS counter
- `DEBUG.GOD_MODE`: Disable player damage
- `DEBUG.SHOW_HITBOXES`: Show collision circles

---

## Performance Metrics

| Metric | Target | Achieved |
|--------|--------|----------|
| FPS | 60 | ✅ 60+ |
| Max Enemies | 500 | ✅ Tested |
| Max Projectiles | 200 | ✅ Tested |
| Max Particles | 500 | ✅ Capped |
| Max Effects | 200 | ✅ Capped |
| Collision Algorithm | O(n) | ✅ Spatial Hash |

---

*Documentation updated: 2026-01-13*
