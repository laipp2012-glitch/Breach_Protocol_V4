# Vampire Survivors-Style Game - Technical Architecture

## Project Overview

**Game Type**: Browser-based survival roguelike with auto-attacking mechanics  
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge)  
**Technology Stack**: HTML5 Canvas, Vanilla JavaScript (ES6+), Web Audio API  
**Development Approach**: AI-agent driven development with modular architecture

---

## Core Game Loop

### Main Game States
1. **Menu State**: Title screen, character selection
2. **Playing State**: Active gameplay
3. **Paused State**: Game paused
4. **GameOver State**: Death/victory screen
5. **LevelUp State**: Character upgrade selection

### Frame Update Sequence (60 FPS target)
```
1. Input Processing → Handle user keyboard/mouse inputs
2. Game Logic Update → Update entities, check collisions, spawn enemies
3. Render → Draw all game elements to canvas
4. Audio Update → Manage sound effects and music
```

---

## Architecture Principles for AI Agents

### Modular Design
- Each system should be in its own file/module
- Clear separation of concerns
- Use ES6 modules with explicit imports/exports
- No global variables except the main game instance

### Data-Driven Approach
- Configuration files for weapons, enemies, characters
- JSON-based data structures
- Easy to modify and extend without code changes

### Component-Based Entities
- Entities have components (Position, Sprite, Health, etc.)
- Systems operate on entities with specific components
- Facilitates AI agent understanding and modification

---

## Directory Structure

```
/game
├── index.html              # Entry point
├── css/
│   └── styles.css         # Minimal UI styling
├── js/
│   ├── main.js            # Game initialization
│   ├── config/
│   │   ├── weapons.js     # Weapon configurations
│   │   ├── enemies.js     # Enemy configurations
│   │   └── characters.js  # Playable character stats
│   ├── core/
│   │   ├── Game.js        # Main game controller
│   │   ├── GameLoop.js    # RequestAnimationFrame loop
│   │   └── StateManager.js # Game state transitions
│   ├── systems/
│   │   ├── InputSystem.js     # Keyboard/mouse handling
│   │   ├── MovementSystem.js  # Entity movement
│   │   ├── CollisionSystem.js # Collision detection
│   │   ├── WeaponSystem.js    # Weapon behavior
│   │   ├── SpawnSystem.js     # Enemy spawning
│   │   ├── ExperienceSystem.js # XP and leveling
│   │   └── RenderSystem.js    # Canvas rendering coordinator
│   ├── renderers/
│   │   ├── IRenderer.js       # Renderer interface (abstract)
│   │   ├── ASCIIRenderer.js   # ASCII/text rendering (MVP)
│   │   ├── SpriteRenderer.js  # SVG/sprite rendering (Phase 7+)
│   │   └── HybridRenderer.js  # Mix of ASCII and sprites
│   ├── entities/
│   │   ├── Player.js      # Player entity
│   │   ├── Enemy.js       # Enemy entity
│   │   ├── Projectile.js  # Weapon projectile
│   │   └── Pickup.js      # XP gems, items
│   ├── ui/
│   │   ├── HUD.js         # Health, XP bar, timer
│   │   └── Menu.js        # Menus and overlays
│   └── utils/
│       ├── Vector2D.js    # 2D vector math
│       ├── SpatialHash.js # Optimized collision detection
│       └── AudioManager.js # Sound management
├── assets/
│   ├── sprites/           # PNG/SVG images (Phase 7+)
│   │   ├── player/        # Player graphics from Figma
│   │   ├── enemies/       # Enemy graphics
│   │   ├── projectiles/   # Projectile graphics
│   │   ├── pickups/       # XP gem graphics
│   │   └── ui/            # UI elements
│   ├── audio/            # Sound effects and music
│   └── fonts/            # Web fonts
└── docs/
    └── AI_INSTRUCTIONS.md # This file + agent guidelines
```

---

## Core Systems Documentation

### 1. Player System
**Responsibilities**: Player movement, health, XP collection, weapon management

**Key Properties**:
```javascript
{
  position: { x, y },
  velocity: { x, y },
  health: number,
  maxHealth: number,
  speed: number,
  experience: number,
  level: number,
  weapons: Array<Weapon>,
  collider: { radius }
}
```

**Behavior**:
- Moves in 8 directions (WASD/Arrow keys)
- Normalized diagonal movement (speed √2)
- Cannot move outside play area
- Auto-collects XP gems in pickup radius
- Weapons fire automatically towards nearest enemy

---

### 2. Enemy System
**Responsibilities**: Enemy spawning, movement, pathfinding to player

**Enemy Properties**:
```javascript
{
  position: { x, y },
  velocity: { x, y },
  health: number,
  maxHealth: number,
  speed: number,
  damage: number,
  experienceValue: number,
  collider: { radius },
  sprite: string
}
```

**Spawning Logic**:
- Spawn enemies at screen edges (off-camera)
- Increase spawn rate over time
- Balance enemy types (basic, fast, tank, elite)
- Maximum enemy cap to maintain performance

**Movement**:
- Simple pathfinding: Move directly toward player
- Basic obstacle avoidance (push apart overlapping enemies)
- Slightly randomized speed for visual variety

---

### 3. Weapon System
**Responsibilities**: Weapon firing, projectile management, damage calculation

**Base Weapon Properties**:
```javascript
{
  name: string,
  damage: number,
  attackSpeed: number,        // Attacks per second
  projectileSpeed: number,
  projectileCount: number,    // Bullets per attack
  piercing: number,           // Enemies pierced per projectile
  range: number,
  area: number,               // Explosion/effect radius
  cooldown: number,           // Current cooldown timer
  level: number,              // Upgrade level (1-8)
  levelModifiers: Object      // Stats per level
}
```

**Weapon Types to Implement**:
1. **Magic Wand**: Basic projectile, targets nearest enemy
2. **Whip**: Melee area damage in front of player
3. **Knife**: Fast projectiles in facing direction
4. **Garlic**: Constant damage aura around player
5. **Holy Water**: Ground-based area damage
6. **Cross**: Boomerang-style projectiles

**Firing Logic**:
- Each weapon has independent cooldown timer
- Auto-aim to nearest enemy (for projectile weapons)
- Update all projectiles each frame
- Remove projectiles when: out of range, hit max pierce count, or off-screen

---

### 4. Collision System
**Responsibilities**: Detect and resolve collisions efficiently

**Spatial Hash Grid**:
```javascript
// Divide play area into grid cells
cellSize = 100 pixels
// Only check collisions within same/adjacent cells
// Dramatically reduces collision checks from O(n²) to O(n)
```

**Collision Pairs**:
- Player ↔ Enemy: Take damage, knock back
- Player ↔ XP Gem: Collect experience
- Projectile ↔ Enemy: Deal damage, reduce pierce count
- Enemy ↔ Enemy: Slight push-apart (avoid stacking)

**Collision Resolution**:
- Circle-to-circle collision detection (all entities are circles)
- Calculate overlap depth
- Push entities apart along collision normal
- Apply damage/effects as needed

---

### 5. Experience & Leveling System
**Responsibilities**: XP collection, level-up, upgrade selection

**Level Progression**:
```javascript
// XP required for level n: base * (1.1 ^ n)
baseXP = 5
xpForLevel(n) = Math.floor(baseXP * Math.pow(1.1, n))
```

**Level-Up Process**:
1. Pause game
2. Show 3 random upgrade choices:
   - Upgrade existing weapon (if < max level)
   - Add new weapon (if < weapon limit)
   - Improve player stats (health, speed, pickup radius)
3. Resume game after selection

**XP Gems**:
- Dropped by enemies on death
- Value scales with enemy difficulty
- Magnetic pull toward player when in range
- Visual size indicates value (small/medium/large)

---

### 6. Render System
**Responsibilities**: Draw all entities to HTML5 Canvas

**RENDERING ABSTRACTION - CRITICAL FOR GRAPHICS UPGRADE PATH**:

The render system uses a **Renderer abstraction layer** to separate game logic from visual representation. This allows switching from ASCII to SVG/sprites without touching game code.

**Renderer Interface**:
```javascript
class IRenderer {
  drawPlayer(ctx, x, y, radius, state) { }
  drawEnemy(ctx, x, y, radius, type, health) { }
  drawProjectile(ctx, x, y, radius, type) { }
  drawPickup(ctx, x, y, radius, type) { }
  drawParticle(ctx, x, y, type, progress) { }
}
```

**Phase 1-6: ASCII Renderer** (MVP):
```javascript
class ASCIIRenderer extends IRenderer {
  drawPlayer(ctx, x, y, radius, state) {
    ctx.font = '20px monospace';
    ctx.fillStyle = state.damaged ? '#ff0000' : '#00ff00';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('@', x, y);
  }
  
  drawEnemy(ctx, x, y, radius, type, health) {
    ctx.font = '16px monospace';
    ctx.fillStyle = '#ff0000';
    ctx.fillText('E', x, y);
  }
  
  drawProjectile(ctx, x, y, radius, type) {
    ctx.font = '12px monospace';
    ctx.fillStyle = '#ffff00';
    ctx.fillText('*', x, y);
  }
  
  drawPickup(ctx, x, y, radius, type) {
    ctx.font = '14px monospace';
    ctx.fillStyle = '#00ffff';
    ctx.fillText('$', x, y); // XP gem
  }
}
```

**Phase 7+: SVG/Sprite Renderer** (Graphics upgrade):
```javascript
class SpriteRenderer extends IRenderer {
  constructor() {
    this.sprites = {}; // Load SVG/images here
  }
  
  drawPlayer(ctx, x, y, radius, state) {
    // Draw SVG or sprite image
    const sprite = this.sprites.player[state.animation];
    ctx.drawImage(sprite, x - radius, y - radius, radius * 2, radius * 2);
  }
  
  drawEnemy(ctx, x, y, radius, type, health) {
    const sprite = this.sprites.enemies[type];
    ctx.drawImage(sprite, x - radius, y - radius, radius * 2, radius * 2);
    // Health bar can be added here
  }
  
  // ... similar for other entities
}
```

**Usage in Game**:
```javascript
// In main.js - easy to swap renderers
const renderer = new ASCIIRenderer(); // or new SpriteRenderer()
const renderSystem = new RenderSystem(renderer);

// Game code never changes:
renderSystem.drawEntity(entity); // Renderer handles visualization
```

**ASCII Character Map** (Phase 1-6):
| Entity | Character | Color | Font Size |
|--------|-----------|-------|-----------|
| Player | @ | #00ff00 (green) | 20px |
| Enemy Basic | E | #ff0000 (red) | 16px |
| Enemy Tank | T | #ff4444 (dark red) | 20px |
| Enemy Fast | F | #ff8800 (orange) | 14px |
| Projectile | * | #ffff00 (yellow) | 12px |
| XP Gem Small | $ | #00ffff (cyan) | 12px |
| XP Gem Large | ◆ | #00ffff (cyan) | 16px |
| Health Pickup | + | #00ff00 (green) | 14px |
| Damage Number | -10 | #ffffff (white) | 10px |

**Rendering Order** (back to front):
1. Background (dark grid pattern in ASCII mode)
2. XP gems and pickups
3. Projectiles
4. Enemies (sorted by Y position for depth)
5. Player
6. Particle effects (damage numbers, death effects)
7. UI overlay (HUD)

**Camera System**:
- Camera centers on player
- Smooth interpolation (lerp) for camera movement
- Fixed viewport size
- Draw culling: Don't render entities far off-screen

**Visual Effects** (work in both ASCII and sprite modes):
- Enemy damage flash (color change for 100ms)
- Player invincibility flash (alternating transparency)
- Death animations (fade out)
- XP collection particle trail (flying characters/sprites)

---

## Performance Optimization Guidelines

### Frame Budget
- Target: 60 FPS (16.67ms per frame)
- Breakdown:
  - Logic: 5-8ms
  - Rendering: 5-8ms
  - Browser overhead: 2-3ms

### Optimization Strategies

**1. Entity Pooling**:
```javascript
// Reuse entity objects instead of creating/destroying
const projectilePool = {
  active: [],
  inactive: [],
  spawn() { return inactive.pop() || new Projectile() },
  despawn(proj) { inactive.push(proj) }
}
```

**2. Spatial Hashing**:
- Only check collisions between nearby entities
- Update hash grid every frame

**3. Draw Culling**:
```javascript
// Don't render entities outside viewport + margin
if (entity.x < camera.x - margin || 
    entity.x > camera.x + camera.width + margin) {
  return; // Skip rendering
}
```

**4. Sprite Batching**:
- Draw same sprite type in batches
- Reduce context state changes

**5. Limit Entity Count**:
```javascript
maxEnemies = 500
maxProjectiles = 300
maxParticles = 100
```

---

## Data Configuration Format

### Weapon Config Example
```javascript
// js/config/weapons.js
export const WEAPONS = {
  MAGIC_WAND: {
    id: 'magic_wand',
    name: 'Magic Wand',
    description: 'Shoots magic projectiles at nearest enemy',
    baseDamage: 10,
    baseAttackSpeed: 1.5,  // Attacks per second
    baseProjectileSpeed: 300,
    baseProjectileCount: 1,
    basePiercing: 0,
    baseRange: 500,
    baseArea: 0,
    maxLevel: 8,
    levelBonus: {
      damage: 5,           // +5 damage per level
      attackSpeed: 0.1,    // +0.1 attacks/sec per level
      projectileCount: 1   // +1 projectile every 2 levels
    }
  }
}
```

### Enemy Config Example
```javascript
// js/config/enemies.js
export const ENEMIES = {
  BASIC: {
    id: 'basic',
    name: 'Basic Enemy',
    health: 10,
    speed: 80,           // Pixels per second
    damage: 5,
    experienceValue: 1,
    radius: 12,          // Collision radius
    sprite: 'enemy_basic.png',
    spawnWeight: 100     // Higher = spawn more often
  },
  TANK: {
    id: 'tank',
    health: 100,
    speed: 40,
    damage: 10,
    experienceValue: 10,
    radius: 20,
    sprite: 'enemy_tank.png',
    spawnWeight: 10
  }
}
```

---

## AI Agent Implementation Guidelines

### Code Style Requirements
1. **Use TypeScript-style JSDoc comments**:
```javascript
/**
 * @typedef {Object} Vector2D
 * @property {number} x
 * @property {number} y
 */

/**
 * Calculate distance between two points
 * @param {Vector2D} a - First point
 * @param {Vector2D} b - Second point
 * @returns {number} Distance in pixels
 */
function distance(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}
```

2. **Error Handling**:
- Validate inputs
- Gracefully handle edge cases
- Use try-catch for external resources (images, audio)

3. **Constants**:
```javascript
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_SPEED = 150;
const MAX_ENEMIES = 500;
```

4. **Naming Conventions**:
- Classes: PascalCase (`PlayerEntity`)
- Functions/variables: camelCase (`movePlayer`)
- Constants: UPPER_SNAKE_CASE (`MAX_HEALTH`)
- Private methods: prefix with underscore (`_internalUpdate`)

### Testing Checklist for Each Module
- [ ] Module loads without errors
- [ ] Exports are properly defined
- [ ] No circular dependencies
- [ ] Works with mock data
- [ ] Handles edge cases (empty arrays, null values)
- [ ] Performance acceptable with 500 entities

---

## Phase-by-Phase Implementation Plan

### Phase 1: Core Foundation (Essential)
**Goal**: Get a player moving on screen with ASCII rendering

**Tasks**:
1. Set up HTML5 Canvas and game loop
2. Implement Vector2D utility class
3. Create IRenderer interface (abstract base)
4. Create ASCIIRenderer (concrete implementation)
5. Create Player entity with movement
6. Implement InputSystem (keyboard controls)
7. Basic camera that follows player
8. Render player as @ symbol, draw basic background

**Success Criteria**: 
- Player (@) moves smoothly in 8 directions
- ASCII rendering is clean and readable
- 60 FPS performance
- Foundation ready for graphics upgrade later

---

### Phase 2: Enemy System (Essential)
**Goal**: Enemies spawn and chase player with ASCII visuals

**Tasks**:
1. Create Enemy entity class
2. Implement SpawnSystem (spawn at edges)
3. Add enemy movement toward player
4. Implement basic collision detection (player-enemy)
5. Add enemy health and death
6. Render enemies as E, T, F symbols (different types)
7. Update ASCIIRenderer with enemy rendering

**Success Criteria**: 
- Enemies spawn continuously with distinct ASCII characters
- Follow player, die on collision
- Visual distinction between enemy types

---

### Phase 3: Combat System (Essential)
**Goal**: Player can damage and kill enemies with weapons

**Tasks**:
1. Create Projectile entity
2. Implement WeaponSystem base class
3. Add Magic Wand weapon (auto-targeting projectiles)
4. Implement projectile-enemy collision
5. Add enemy damage and death effects
6. Display damage numbers

**Success Criteria**: Projectiles fire automatically, kill enemies, visual feedback works

---

### Phase 4: Progression System (Essential)
**Goal**: XP collection and level-up mechanics

**Tasks**:
1. Create XP Gem entity (dropped by enemies)
2. Implement XP collection and player leveling
3. Add level-up screen with upgrade choices
4. Implement weapon upgrade system (increase stats)
5. Add HUD (health bar, XP bar, level, timer)

**Success Criteria**: Player gains XP, levels up, gets stronger over time

---

### Phase 5: Optimization (Essential)
**Goal**: Game runs smoothly with many entities

**Tasks**:
1. Implement SpatialHash for collision optimization
2. Add entity pooling for projectiles
3. Implement draw culling (don't render off-screen)
4. Add max entity caps
5. Profile and optimize hot paths

**Success Criteria**: 60 FPS with 500 enemies + 200 projectiles on screen

---

### Phase 6: Content Expansion (Important)
**Goal**: More weapons, enemies, and variety

**Tasks**:
1. Add 3-5 more weapon types (Whip, Knife, Garlic, etc.)
2. Add 4-5 enemy types with different behaviors
3. Implement weapon evolution (max level upgrades)
4. Add passive items (stat upgrades)
5. Balance enemy spawn rates over time

**Success Criteria**: Diverse gameplay, interesting weapon combos

---

### Phase 7: Graphics & Polish (Nice-to-Have)
**Goal**: Replace ASCII with custom Figma graphics and add professional presentation

**Tasks**:
1. Implement SpriteRenderer for SVG/PNG support
2. Create sprite loading system
3. Replace ASCII characters with your Figma designs:
   - Player sprite and animations
   - Enemy sprites (all types)
   - Projectile sprites
   - Pickup/XP gem sprites
4. Add particle effects (deaths, impacts, level-up)
5. Implement sound effects and music
6. Create main menu and character selection
7. Add game-over screen with stats
8. Polish UI elements with custom designs
9. Implement save/load for unlockables

**Success Criteria**: 
- Full visual upgrade from ASCII to custom graphics
- Smooth renderer swap with no game logic changes
- Professional look matching your Figma designs
- All visual polish complete

---

## Common Pitfalls for AI Agents

### 1. Circular Dependencies
❌ **Wrong**:
```javascript
// Player.js
import { Enemy } from './Enemy.js';

// Enemy.js  
import { Player } from './Player.js';
```

✅ **Correct**:
```javascript
// Both import from Game.js
// Game.js coordinates interaction
```

### 2. Frame-Rate Dependent Movement
❌ **Wrong**:
```javascript
player.x += player.speed; // Speed depends on FPS
```

✅ **Correct**:
```javascript
player.x += player.speed * deltaTime; // Speed in units/second
```

### 3. Memory Leaks
❌ **Wrong**:
```javascript
setInterval(() => { /* never cleared */ }, 1000);
projectiles.push(new Projectile()); // Never removed
```

✅ **Correct**:
```javascript
const intervalId = setInterval(...);
clearInterval(intervalId); // Clear when done

projectiles = projectiles.filter(p => p.isAlive);
```

### 4. Tight Coupling
❌ **Wrong**:
```javascript
class Player {
  attack() {
    const enemy = game.enemies[0]; // Directly accessing game state
    enemy.health -= 10;
  }
}
```

✅ **Correct**:
```javascript
class WeaponSystem {
  update(entities) {
    // System handles interaction between entities
  }
}
```

---

## Testing & Debugging

### Browser Console Commands
```javascript
// Access game instance (expose to window in debug mode)
window.game.player.health = 9999;
window.game.player.level = 10;
window.game.spawnSystem.spawnEnemy('TANK', x, y);
window.game.toggleDebugMode(); // Show hitboxes, FPS, etc.
```

### Debug Visualization
- Draw collision circles
- Show spatial hash grid
- Display entity count
- FPS counter
- Performance graph

### Unit Test Structure
```javascript
// test/Player.test.js
import { Player } from '../js/entities/Player.js';

test('Player takes damage correctly', () => {
  const player = new Player(0, 0);
  player.health = 100;
  player.takeDamage(20);
  assert(player.health === 80);
});
```

---

## Handoff Protocol Between AI Agents

### When Passing Work to Another Agent

**1. Status Report Format**:
```markdown
## Completed
- [x] Implemented PlayerEntity with movement
- [x] Added InputSystem for keyboard controls
- [x] Basic collision detection

## In Progress
- [ ] WeaponSystem (60% done)
  - Magic Wand works
  - Need to add Whip and Knife

## Blocked/Issues
- Performance issue with >200 enemies (50 FPS)
- Projectile pooling not implemented yet

## Next Steps
1. Complete WeaponSystem
2. Implement projectile pooling
3. Add 2 more enemy types
```

**2. Code Handoff Checklist**:
- [ ] All files in correct directories
- [ ] No console errors
- [ ] Code is commented
- [ ] Test in browser (provide URL/instructions)
- [ ] List any external dependencies
- [ ] Note any config changes needed

**3. Context Preservation**:
- Document design decisions made
- Explain any non-obvious implementations
- Link related files
- Note any deviations from original plan

---

## Success Metrics

### Minimum Viable Product (MVP)
- Player moves smoothly with keyboard
- Enemies spawn and chase player
- At least 1 working weapon
- XP and level-up system
- Game runs at 60 FPS with 100+ entities
- Basic HUD (health, XP, level)

### Full Release Quality
- 6+ unique weapons with upgrades
- 5+ enemy types with behaviors
- Particle effects and polish
- Sound effects and music
- Main menu and game-over screen
- 60 FPS with 500+ entities
- Mobile-friendly controls (optional)

---

## SVG/Custom Graphics Integration (Post-MVP)

### Design Philosophy
The game is architected with **renderer abstraction** to make graphics upgrades trivial. All game logic is separate from rendering.

### Figma → Game Workflow

**1. Design in Figma**:
- Create all entity sprites (Player, Enemies, Projectiles, etc.)
- Use consistent dimensions (e.g., 64x64px artboards)
- Name layers clearly (player_idle, player_walk, enemy_basic, etc.)
- Export as SVG for scalability

**2. Export Settings**:
```
Format: SVG
Settings:
- Include "id" attribute: YES
- Outline text: YES  
- Simplify stroke: YES
```

**3. Integration Steps**:

a) Place SVG files in `/assets/sprites/` directory:
```
/assets/sprites/
  /player/
    player_idle.svg
    player_walk.svg
    player_damaged.svg
  /enemies/
    enemy_basic.svg
    enemy_tank.svg
    enemy_fast.svg
  /projectiles/
    projectile_wand.svg
    projectile_knife.svg
  /pickups/
    xp_small.svg
    xp_large.svg
```

b) Create SpriteRenderer class:
```javascript
class SpriteRenderer extends IRenderer {
  constructor() {
    super();
    this.sprites = {};
    this.loaded = false;
  }
  
  async loadSprites() {
    // Load all SVG files as Image objects
    const spriteMap = {
      player: ['idle', 'walk', 'damaged'],
      enemies: ['basic', 'tank', 'fast'],
      projectiles: ['wand', 'knife'],
      pickups: ['xp_small', 'xp_large']
    };
    
    for (const [category, names] of Object.entries(spriteMap)) {
      this.sprites[category] = {};
      for (const name of names) {
        this.sprites[category][name] = await this.loadSVG(
          `assets/sprites/${category}/${name}.svg`
        );
      }
    }
    this.loaded = true;
  }
  
  async loadSVG(path) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = path;
    });
  }
  
  drawPlayer(ctx, x, y, radius, state) {
    if (!this.loaded) return; // Fallback to ASCII
    
    const animation = state.moving ? 'walk' : 'idle';
    const sprite = this.sprites.player[animation];
    
    // Draw centered on entity position
    ctx.drawImage(
      sprite,
      x - radius, y - radius,  // Top-left corner
      radius * 2, radius * 2   // Width and height
    );
  }
}
```

c) Update main.js to use SpriteRenderer:
```javascript
// Try to load sprite renderer, fallback to ASCII
const renderer = new SpriteRenderer();
await renderer.loadSprites();

if (!renderer.loaded) {
  console.warn('Sprites failed to load, using ASCII renderer');
  renderer = new ASCIIRenderer();
}

const renderSystem = new RenderSystem(renderer);
```

**4. Progressive Enhancement**:
You can mix ASCII and sprites:
```javascript
class HybridRenderer extends IRenderer {
  constructor() {
    this.spriteRenderer = new SpriteRenderer();
    this.asciiRenderer = new ASCIIRenderer();
  }
  
  drawPlayer(ctx, x, y, radius, state) {
    if (this.spriteRenderer.hasSprite('player')) {
      this.spriteRenderer.drawPlayer(ctx, x, y, radius, state);
    } else {
      this.asciiRenderer.drawPlayer(ctx, x, y, radius, state);
    }
  }
}
```

This allows you to replace graphics incrementally (e.g., player first, then enemies, etc.)

### Animation Support

For animated sprites from Figma:

**Option A: Sprite Sheets**
- Export multiple frames as single SVG/PNG
- Use canvas clipping to show one frame at a time

**Option B: Frame Sequences**
- Export each frame as separate SVG
- Cycle through frames based on time

```javascript
class AnimatedSprite {
  constructor(frames, fps = 12) {
    this.frames = frames; // Array of Image objects
    this.fps = fps;
    this.currentFrame = 0;
    this.time = 0;
  }
  
  update(deltaTime) {
    this.time += deltaTime;
    const frameDuration = 1 / this.fps;
    
    if (this.time >= frameDuration) {
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
      this.time = 0;
    }
  }
  
  getCurrentFrame() {
    return this.frames[this.currentFrame];
  }
}
```

### Performance Considerations

**SVG vs Rasterized**:
- SVG: Scalable, but slower to render
- PNG/JPG: Faster rendering, but fixed resolution
- **Recommendation**: Export from Figma as PNG at 2x resolution for retina displays

**Optimization**:
```javascript
// Pre-render sprites to offscreen canvas for better performance
class OptimizedRenderer {
  constructor() {
    this.spriteCache = new Map();
  }
  
  cacheSprite(sprite, size) {
    const key = `${sprite.src}_${size}`;
    if (!this.spriteCache.has(key)) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(sprite, 0, 0, size, size);
      this.spriteCache.set(key, canvas);
    }
    return this.spriteCache.get(key);
  }
  
  drawCached(ctx, sprite, x, y, size) {
    const cached = this.cacheSprite(sprite, size);
    ctx.drawImage(cached, x, y);
  }
}
```

### Design Guidelines for Figma

**Size Standards**:
- Player: 64x64px (32px collision radius)
- Basic Enemy: 48x48px (24px radius)
- Tank Enemy: 80x80px (40px radius)
- Projectile: 24x24px (12px radius)
- XP Gem: 32x32px (16px radius)

**Color Palette** (for consistency):
- Player: Green/Blue tones (#00ff00, #00aaff)
- Enemies: Red/Orange tones (#ff0000, #ff8800)
- Projectiles: Yellow/White (#ffff00, #ffffff)
- XP: Cyan/Blue (#00ffff, #0088ff)
- UI: Dark with bright accents (#1a1a1a bg, #ffffff text)

**Export Checklist**:
- [ ] All sprites centered in artboard
- [ ] Consistent scale across all entities
- [ ] Clear visual hierarchy (player stands out)
- [ ] Distinct silhouettes for enemy types
- [ ] High contrast for readability
- [ ] Include hover states for UI elements

### Testing Graphics Integration

```javascript
// Add to main.js for easy renderer switching
window.switchRenderer = function(type) {
  switch(type) {
    case 'ascii':
      game.renderSystem.renderer = new ASCIIRenderer();
      break;
    case 'sprite':
      game.renderSystem.renderer = new SpriteRenderer();
      break;
    case 'hybrid':
      game.renderSystem.renderer = new HybridRenderer();
      break;
  }
};

// Usage in browser console:
// switchRenderer('sprite') - Switch to your custom graphics
// switchRenderer('ascii') - Switch back to ASCII for debugging
```

This setup ensures your ASCII MVP can be upgraded to full graphics without touching game logic!

---

### Libraries (Optional)
- **Howler.js**: Audio library (if Web Audio API is too complex)
- **PixiJS**: 2D rendering engine (if Canvas performance insufficient)
- **Matter.js**: Physics engine (only if adding physics-based weapons)

### Asset Resources
- **OpenGameArt.org**: Free sprites and sounds
- **Kenney.nl**: Free game assets
- **Freesound.org**: Free sound effects

### References
- Vampire Survivors (study for mechanics)
- Brotato (similar genre)
- Other roguelike survivors games

---

## Version Control Guidelines

### Commit Message Format
```
[Component] Brief description

Detailed explanation of changes:
- Added X feature
- Fixed Y bug
- Refactored Z for performance

Affects: Player.js, WeaponSystem.js
```

### Branching Strategy
- `main`: Stable, tested code
- `dev`: Integration branch
- `feature/*`: Individual features
- `bugfix/*`: Bug fixes

---

## Final Notes for AI Agents

**Key Principles**:
1. **Start simple**: Make it work, then make it good, then make it fast
2. **Test frequently**: Test in browser after every major change
3. **Communicate clearly**: Document decisions and blockers
4. **Follow the plan**: Stick to phase structure unless blocked
5. **Ask for help**: Flag issues early rather than building on broken foundation

**When in Doubt**:
- Refer back to this architecture document
- Check existing similar code in the project
- Implement the simplest solution first
- Add TODOs for future optimization

---

END OF ARCHITECTURE DOCUMENT
