# Changelog & Feature Status

> **Generated on:** 2026-01-14
> **Context:** Summary of implemented vs. pending features based on codebase analysis.

## ✅ Implemented Features

### Core Engine
- **Game Loop**: Fixed timestep 60 FPS loop (`GameLoop.js`)
- **Rendering**: ASCII-based rendering system with off-screen culling (`ASCIIRenderer.js`)
- **Optimization**: Spatial Hash Grid for O(n) collision detection (`SpatialHash.js`), Object Pooling (`ObjectPool.js`)
- **Camera**: Smooth player-following camera with screen shake support (`Camera.js`)

### Gameplay Systems
- **Player Controller**: WASD movement, state management
- **Enemy AI**: 5 Distinct behaviors:
    - **Basic**: Chases player
    - **Tank**: Slow, high HP
    - **Fast**: High speed, low HP
    - **Ranger**: Keeps distance and fires projectiles
    - **Swarm**: Bursts into mini-enemies on death
- **Spawning**: Dynamic edge-spawning system based on camera view
- **Progression**: XP collection, Leveling system, Upgrade selection UI
- **Stat System**: Detailed stat stacking (additive multipliers, flat bonuses) supporting 10 passive item types.
- **Juice/Effects**: Detailed visual feedback system (Screen shake, Flash, Scale pulse, Particles)
- **UI & States**:
    - **Title Screen**: Retro intro with "Press Start" prompt
    - **Pause Screen**: Functional pause overlay with current run stats
    - **Game Over**: Summary screen with survival time, kills, and restart option

### Passive Items (Arsenal)
*Complete implementation of the following passive stat boosters:*
- **Damage Amp**: Increases overall damage output
- **Wings**: Increases movement speed
- **Magnet**: Increases XP pickup range
- **Vigor**: Increases Max HP
- **Cooldown**: Reduces weapon cooldowns
- **Armor**: Reduces incoming damage
- **Greed**: Increases XP gain rate
- **Luck**: Increases luck stat (affects loot/crits)
- **Regeneration**: Passive health recovery
- **Area**: Increases weapon attack size

### Combat & Weapons
*Complete implementation of the following weapon archetypes:*
- **Magic Wand**: Auto-targeting nearest enemy projectile
- **Knife**: Directional projectile (moves with player)
- **Garlic**: PBAoE (Point Blank Area of Effect) damage aura
- **Security Drone**: Orbiting projectiles (Zone control)
- **Scatter Cannon**: Multi-projectile shotgun spread pattern
- **Homing Seeker**: Tracking missiles with turn-speed logic
- **Logic Bomb (Mine)**: Proximity mines with arming delay and explosion radius

## 🚧 Not Implemented / Cut Features

*The following features were planned or are standard for the genre but are currently missing, likely due to time/quota constraints:*

### Tech & Core
- **Sprite Renderer**: The code contains `IRenderer` interface but only `ASCIIRenderer` is implemented. Canvas sprite rendering is missing.
- **Audio System**: No sound effects or music implementation (`assets/audio` is empty).
- **Save/Load System**: No persistence for high scores, unlocked achievements, or meta-progression.
- **Touch Controls**: No mobile/touch input support.

### Content
- **Weapon Evolutions**: The "Evolution" mechanic (combining max-level weapons) is not implemented.
- **Boss Battles**: No large, multi-phase boss enemies.
- **Map Variety**: Only a single infinite void map exists. No distinct stages or tilesets.
- **Meta-Progression**: No "Gold" currency or permanent upgrades between runs.
- **Game States**:
    - "Game Over" is a full screen with stats and restart options.
    - Title and Pause screens are fully implemented.
