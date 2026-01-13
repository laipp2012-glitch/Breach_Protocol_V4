# AI Agent Instructions for Game Development

## Purpose of This Document
This document provides specific instructions, prompts, and workflows for AI agents (Claude Opus, Claude Sonnet, Gemini) working on the Vampire Survivors-style game. It ensures consistency, quality, and efficient collaboration between agents.

---

## Agent Role Definitions

### Primary Developer Agent (Sonnet/Opus)
**Responsibilities**:
- Implement core game systems
- Write production code
- Optimize performance
- Debug complex issues

**Strengths**: 
- Deep reasoning about architecture
- Complex algorithm implementation
- Performance optimization

---

### Code Review Agent (Sonnet)
**Responsibilities**:
- Review code for bugs and issues
- Ensure adherence to architecture
- Suggest improvements
- Validate against requirements

**Strengths**:
- Pattern recognition
- Error detection
- Best practice enforcement

---

### Testing Agent (Gemini/Sonnet)
**Responsibilities**:
- Write test cases
- Manual testing in browser
- Report bugs clearly
- Verify fixes

**Strengths**:
- Systematic testing
- Edge case identification
- Clear bug reporting

---

### Analytics Agent (Opus/Gemini) ⭐ NEW
**Responsibilities**:
- Research best practices for game development
- Analyze multiple implementation approaches
- Find optimal algorithms and design patterns
- Benchmark performance solutions
- Evaluate trade-offs between approaches
- Recommend industry-standard solutions
- Stay updated on modern web game development techniques

**Strengths**:
- Deep research capabilities
- Comparative analysis
- Performance evaluation
- Pattern recognition across multiple domains
- Strategic thinking

**When to Use Analytics Agent**:
- Before starting a new phase (research best approach)
- When performance issues arise (find optimization strategies)
- When multiple implementation options exist (compare trade-offs)
- When stuck on a problem (research alternative solutions)
- After completing a phase (analyze what could be improved)

---

## Universal Agent Prompt Template

Use this template when starting any task:

```
You are working on a browser-based Vampire Survivors-style game. 

CONTEXT:
- Project: [Describe current phase/component]
- Your role: [Developer/Reviewer/Tester]
- Dependencies: [List files/systems this depends on]

ARCHITECTURE REFERENCE:
You MUST read and follow the architecture document at: game_architecture.md
Pay special attention to:
- Directory structure (Section: "Directory Structure")
- Code style requirements (Section: "AI Agent Implementation Guidelines")
- The specific system you're working on (Section: "Core Systems Documentation")

TASK:
[Specific task description]

REQUIREMENTS:
1. Follow the architecture document exactly
2. Use ES6 modules with explicit imports/exports
3. Add JSDoc comments to all functions/classes
4. Handle edge cases and errors
5. Test your code logic before submitting

DELIVERABLES:
- [List specific files to create/modify]
- Brief explanation of implementation approach
- Any blockers or questions

DO NOT:
- Create circular dependencies
- Use global variables
- Implement features not in current phase
- Deviate from architecture without explanation

WHEN COMPLETE:
Provide a status report using the handoff format in the architecture doc.
```

---

## Phase-Specific Agent Prompts

### Phase 1: Core Foundation

#### Prompt for Setting Up Canvas and Game Loop
```
TASK: Implement the core game loop and canvas setup

You are implementing Phase 1 of the game architecture. Your task is to create:
1. index.html with canvas element
2. main.js for initialization
3. GameLoop.js for the main update cycle
4. A simple test (render a red circle) to verify it works

ARCHITECTURE REFERENCE:
- Read "Core Game Loop" section
- Read "Directory Structure" section
- Read "Phase 1: Core Foundation" section

REQUIREMENTS:
- 60 FPS target using requestAnimationFrame
- Canvas size: 800x600 pixels
- Calculate deltaTime for frame-independent movement
- Clear canvas each frame
- Handle window focus/blur (pause when tab not visible)

IMPLEMENTATION STEPS:
1. Create index.html with:
   - Canvas element with id="gameCanvas"
   - Script tag loading main.js as module
   
2. Create js/core/GameLoop.js:
   - Class with start(), stop(), update() methods
   - Use requestAnimationFrame
   - Calculate deltaTime in seconds
   - Call update callback with deltaTime
   
3. Create js/main.js:
   - Get canvas and 2D context
   - Create GameLoop instance
   - In update callback: clear canvas and draw test circle
   - Start the loop

TEST:
Open index.html in browser. You should see a red circle. Check console for errors.

DELIVERABLE:
- index.html
- js/main.js  
- js/core/GameLoop.js
- Screenshot or description of working result
```

---

#### Prompt for Player Movement
```
TASK: Implement player entity with keyboard-controlled movement and ASCII rendering

ARCHITECTURE REFERENCE:
- Read "1. Player System" in Core Systems Documentation
- Read "6. Render System" for renderer abstraction
- Read "InputSystem" 
- Read "Vector2D utility" in utils

You are implementing the Player entity, InputSystem, and ASCII renderer. The player should move smoothly in 8 directions using WASD or Arrow keys and be rendered as the @ symbol.

REQUIREMENTS:
- Player speed: 150 pixels/second
- Diagonal movement must be normalized (divide by √2)
- Player stays within canvas bounds
- Smooth movement (no stuttering)
- ASCII rendering using the @ character

FILE STRUCTURE:
1. js/utils/Vector2D.js - 2D vector math utility
2. js/systems/InputSystem.js - Keyboard input handler
3. js/renderers/IRenderer.js - Abstract renderer interface
4. js/renderers/ASCIIRenderer.js - ASCII text rendering
5. js/systems/RenderSystem.js - Rendering coordinator
6. js/entities/Player.js - Player entity class
7. Update js/main.js to use these

IMPLEMENTATION:

IRenderer.js (Abstract Interface):
```javascript
export class IRenderer {
  // Abstract methods that all renderers must implement
  drawPlayer(ctx, x, y, radius, state) {
    throw new Error('Must implement drawPlayer');
  }
  
  drawEnemy(ctx, x, y, radius, type, health) {
    throw new Error('Must implement drawEnemy');
  }
  
  drawProjectile(ctx, x, y, radius, type) {
    throw new Error('Must implement drawProjectile');
  }
  
  drawPickup(ctx, x, y, radius, type, value) {
    throw new Error('Must implement drawPickup');
  }
  
  drawBackground(ctx, width, height) {
    // Optional: default implementation
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);
  }
}
```

ASCIIRenderer.js:
```javascript
import { IRenderer } from './IRenderer.js';

export class ASCIIRenderer extends IRenderer {
  constructor() {
    super();
    this.font = '20px monospace';
  }
  
  drawPlayer(ctx, x, y, radius, state) {
    ctx.save();
    ctx.font = this.font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Flash red when damaged, otherwise green
    ctx.fillStyle = state.damaged ? '#ff0000' : '#00ff00';
    ctx.fillText('@', x, y);
    
    ctx.restore();
  }
  
  drawEnemy(ctx, x, y, radius, type, health) {
    ctx.save();
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ff0000';
    
    // Different characters for different enemy types
    const char = type === 'tank' ? 'T' : 
                 type === 'fast' ? 'F' : 'E';
    ctx.fillText(char, x, y);
    
    ctx.restore();
  }
  
  drawProjectile(ctx, x, y, radius, type) {
    ctx.save();
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffff00';
    ctx.fillText('*', x, y);
    ctx.restore();
  }
  
  drawPickup(ctx, x, y, radius, type, value) {
    ctx.save();
    ctx.font = value > 5 ? '16px monospace' : '12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#00ffff';
    ctx.fillText('$', x, y);
    ctx.restore();
  }
  
  drawBackground(ctx, width, height) {
    // Dark background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);
    
    // Optional: Draw subtle grid
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    const gridSize = 50;
    
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }
}
```

RenderSystem.js:
```javascript
export class RenderSystem {
  constructor(renderer) {
    this.renderer = renderer;
  }
  
  render(ctx, camera, entities) {
    // Clear and draw background
    this.renderer.drawBackground(ctx, ctx.canvas.width, ctx.canvas.height);
    
    // Apply camera transform
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    
    // Draw all entities (will expand this in later phases)
    for (const entity of entities) {
      if (entity.type === 'player') {
        this.renderer.drawPlayer(
          ctx, 
          entity.position.x, 
          entity.position.y, 
          entity.radius,
          { damaged: entity.invulnerable }
        );
      }
    }
    
    ctx.restore();
  }
}
```

Vector2D.js should have:
```javascript
export class Vector2D {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  
  add(v) {
    return new Vector2D(this.x + v.x, this.y + v.y);
  }
  
  subtract(v) {
    return new Vector2D(this.x - v.x, this.y - v.y);
  }
  
  multiply(scalar) {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }
  
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  
  normalize() {
    const mag = this.magnitude();
    if (mag === 0) return new Vector2D(0, 0);
    return new Vector2D(this.x / mag, this.y / mag);
  }
  
  distanceTo(v) {
    const dx = v.x - this.x;
    const dy = v.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
```

InputSystem.js should:
- Track which keys are currently pressed (use Set or object)
- Listen for keydown/keyup events
- Provide method: getMovementVector() that returns normalized Vector2D

Player.js should:
```javascript
export class Player {
  constructor(x, y) {
    this.type = 'player';
    this.position = new Vector2D(x, y);
    this.velocity = new Vector2D();
    this.speed = 150;
    this.radius = 16;
    this.health = 100;
    this.maxHealth = 100;
    this.invulnerable = false;
    this.invulnerableTime = 0;
  }
  
  update(deltaTime, inputVector, canvasWidth, canvasHeight) {
    // Update velocity based on input
    this.velocity = inputVector.multiply(this.speed);
    
    // Update position
    this.position = this.position.add(this.velocity.multiply(deltaTime));
    
    // Clamp to canvas bounds
    this.position.x = Math.max(this.radius, Math.min(canvasWidth - this.radius, this.position.x));
    this.position.y = Math.max(this.radius, Math.min(canvasHeight - this.radius, this.position.y));
    
    // Update invulnerability timer
    if (this.invulnerable) {
      this.invulnerableTime -= deltaTime;
      if (this.invulnerableTime <= 0) {
        this.invulnerable = false;
      }
    }
  }
}
```

main.js integration:
```javascript
import { GameLoop } from './core/GameLoop.js';
import { Player } from './entities/Player.js';
import { InputSystem } from './systems/InputSystem.js';
import { RenderSystem } from './systems/RenderSystem.js';
import { ASCIIRenderer } from './renderers/ASCIIRenderer.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Initialize systems
const player = new Player(canvas.width / 2, canvas.height / 2);
const inputSystem = new InputSystem();
const renderer = new ASCIIRenderer();
const renderSystem = new RenderSystem(renderer);

// Simple camera (follows player later, for now just center)
const camera = { x: 0, y: 0 };

// Game loop
const gameLoop = new GameLoop((deltaTime) => {
  // Get input
  const inputVector = inputSystem.getMovementVector();
  
  // Update player
  player.update(deltaTime, inputVector, canvas.width, canvas.height);
  
  // Render
  renderSystem.render(ctx, camera, [player]);
});

gameLoop.start();
```

TEST CHECKLIST:
- [ ] Player (@) renders in center of screen
- [ ] Player moves smoothly with WASD/Arrows
- [ ] Diagonal speed same as cardinal directions
- [ ] Player cannot move outside canvas
- [ ] Movement stops when keys released
- [ ] ASCII character is clear and readable
- [ ] Background grid is visible
- [ ] 60 FPS performance

DELIVERABLE:
- All renderer files created (IRenderer, ASCIIRenderer, RenderSystem)
- All three files created
- main.js updated to use them
- Confirmation that player (@) moves correctly
- Screenshot of ASCII rendering
```

---

### Phase 2: Enemy System

#### Prompt for Enemy Spawning and Movement
```
TASK: Implement enemy spawning and pathfinding to player

ARCHITECTURE REFERENCE:
- Read "2. Enemy System" in Core Systems Documentation
- Read "SpawnSystem" section
- Read enemy config format in "Data Configuration Format"

You are implementing enemies that spawn at screen edges and chase the player.

REQUIREMENTS:
- Enemies spawn off-screen (just outside canvas)
- Spawn rate increases over time (start: 1/second, max: 10/second)
- Basic pathfinding: move toward player position
- Multiple enemy types from config
- Max enemy cap: 500

FILES TO CREATE:
1. js/config/enemies.js - Enemy type definitions
2. js/entities/Enemy.js - Enemy entity class
3. js/systems/SpawnSystem.js - Handles enemy spawning
4. Update main.js/Game.js to use these

ENEMY CONFIG FORMAT:
```javascript
export const ENEMY_TYPES = {
  BASIC: {
    id: 'basic',
    health: 10,
    speed: 80,
    damage: 5,
    xpValue: 1,
    radius: 12,
    color: '#ff4444', // Use color for now, sprite later
    spawnWeight: 100
  },
  // Add 2-3 more types
};
```

SPAWNING LOGIC:
1. Choose random edge of screen (top/right/bottom/left)
2. Pick random position along that edge (outside canvas)
3. Select enemy type based on weights (weighted random)
4. Increase spawn rate: rate = baseRate * (1 + time/60)

ENEMY MOVEMENT:
```javascript
update(deltaTime, playerPosition) {
  // Calculate direction to player
  const direction = playerPosition.subtract(this.position).normalize();
  
  // Move toward player
  this.velocity = direction.multiply(this.speed);
  this.position.add(this.velocity.multiply(deltaTime));
}
```

TEST CHECKLIST:
- [ ] Enemies spawn at edges (not visible at spawn)
- [ ] Enemies move toward player
- [ ] Different enemy types spawn
- [ ] Spawn rate increases over time
- [ ] Performance OK with 100+ enemies

DELIVERABLE:
- All files created and integrated
- At least 3 enemy types defined
- Enemies successfully chase player
- Note any performance issues
```

---

### Phase 3: Combat System

#### Prompt for Weapon System
```
TASK: Implement the weapon system with auto-attacking projectiles

ARCHITECTURE REFERENCE:
- Read "3. Weapon System" in Core Systems Documentation
- Read weapon config format
- Read "Projectile entity" details

You are implementing weapons that automatically fire at enemies.

REQUIREMENTS:
- Weapons fire automatically based on cooldown
- Auto-aim to nearest enemy
- Projectiles have speed, damage, pierce count
- Start with Magic Wand weapon

FILES TO CREATE:
1. js/config/weapons.js - Weapon definitions
2. js/entities/Projectile.js - Projectile entity
3. js/systems/WeaponSystem.js - Manages weapon firing
4. Update Player.js to hold weapons array

WEAPON CONFIG:
```javascript
export const WEAPON_TYPES = {
  MAGIC_WAND: {
    id: 'magic_wand',
    name: 'Magic Wand',
    damage: 10,
    attackSpeed: 1.5, // Attacks per second
    projectileSpeed: 300,
    projectileCount: 1,
    piercing: 0, // Hits this many enemies
    range: 500,
    cooldown: 0,
    level: 1
  }
};
```

PROJECTILE CLASS:
```javascript
export class Projectile {
  constructor(x, y, direction, weapon) {
    this.position = new Vector2D(x, y);
    this.velocity = direction.multiply(weapon.projectileSpeed);
    this.damage = weapon.damage;
    this.piercing = weapon.piercing;
    this.range = weapon.range;
    this.distanceTraveled = 0;
    this.hitCount = 0;
    this.alive = true;
  }
  
  update(deltaTime) {
    // Move projectile
    // Track distance traveled
    // Deactivate if out of range
  }
}
```

WEAPON SYSTEM LOGIC:
```javascript
update(deltaTime, player, enemies, projectiles) {
  for (const weapon of player.weapons) {
    // Reduce cooldown
    weapon.cooldown -= deltaTime;
    
    if (weapon.cooldown <= 0) {
      // Find nearest enemy
      const target = this.findNearestEnemy(player.position, enemies);
      
      if (target) {
        // Fire projectile toward target
        const direction = target.position.subtract(player.position).normalize();
        projectiles.push(new Projectile(player.position.x, player.position.y, direction, weapon));
        
        // Reset cooldown
        weapon.cooldown = 1 / weapon.attackSpeed;
      }
    }
  }
  
  // Update all projectiles
  for (const proj of projectiles) {
    proj.update(deltaTime);
  }
  
  // Remove dead projectiles
  projectiles = projectiles.filter(p => p.alive);
}
```

COLLISION DETECTION:
Add to CollisionSystem:
```javascript
checkProjectileEnemyCollisions(projectiles, enemies) {
  for (const proj of projectiles) {
    for (const enemy of enemies) {
      if (this.circleCollision(proj, enemy)) {
        enemy.takeDamage(proj.damage);
        proj.hitCount++;
        
        if (proj.hitCount > proj.piercing) {
          proj.alive = false;
        }
        break; // Only hit one enemy per frame
      }
    }
  }
}
```

TEST CHECKLIST:
- [ ] Player starts with Magic Wand
- [ ] Projectiles fire automatically toward nearest enemy
- [ ] Projectiles hit and damage enemies
- [ ] Projectiles disappear after range/pierce limit
- [ ] Correct fire rate (1.5 attacks/second)
- [ ] No performance issues with 50+ projectiles

DELIVERABLE:
- All files created
- Magic Wand weapon working
- Enemies take damage and die
- Projectiles render and move correctly
```

---

### Phase 4: Progression System

#### Prompt for XP and Leveling
```
TASK: Implement experience collection and level-up system

ARCHITECTURE REFERENCE:
- Read "5. Experience & Leveling System"
- Read "Pickup entity" details
- Read "LevelUp State" in Core Game Loop

You are implementing the XP/leveling system that drives player progression.

REQUIREMENTS:
- Enemies drop XP gems when killed
- Player collects gems in pickup radius
- Level-up pauses game and shows 3 upgrade choices
- Player can upgrade weapons or stats

FILES TO CREATE/MODIFY:
1. js/entities/Pickup.js - XP gem entity
2. js/systems/ExperienceSystem.js - Handles XP/leveling
3. js/ui/LevelUpUI.js - Level-up screen
4. Update Player.js with XP properties
5. Update Enemy.js to drop gems on death

XP FORMULA:
```javascript
function xpForLevel(level) {
  const baseXP = 5;
  return Math.floor(baseXP * Math.pow(1.1, level));
}
```

PICKUP CLASS:
```javascript
export class Pickup {
  constructor(x, y, type, value) {
    this.position = new Vector2D(x, y);
    this.type = type; // 'xp', 'health', etc.
    this.value = value;
    this.radius = 8;
    this.magnetRadius = 80; // Pull toward player in this range
    this.alive = true;
  }
  
  update(deltaTime, playerPos) {
    // If player in magnet range, move toward player
    const dist = this.position.distanceTo(playerPos);
    if (dist < this.magnetRadius) {
      const dir = playerPos.subtract(this.position).normalize();
      this.position.add(dir.multiply(200 * deltaTime)); // Fast pull
    }
  }
}
```

EXPERIENCE SYSTEM:
```javascript
export class ExperienceSystem {
  update(player, pickups) {
    // Check if player collects pickups
    for (const pickup of pickups) {
      const dist = player.position.distanceTo(pickup.position);
      if (dist < player.radius + pickup.radius) {
        if (pickup.type === 'xp') {
          this.addExperience(player, pickup.value);
        }
        pickup.alive = false;
      }
    }
    
    // Remove collected pickups
    pickups = pickups.filter(p => p.alive);
  }
  
  addExperience(player, amount) {
    player.experience += amount;
    const xpNeeded = this.xpForLevel(player.level);
    
    if (player.experience >= xpNeeded) {
      player.experience -= xpNeeded;
      player.level++;
      this.triggerLevelUp(player);
    }
  }
  
  triggerLevelUp(player) {
    // Pause game
    // Show level-up UI with 3 random upgrades
    // Resume when player selects
  }
}
```

LEVEL-UP UPGRADES:
Generate 3 random options from:
1. Upgrade existing weapon (if < max level):
   - Increase damage, attack speed, projectiles, etc.
   
2. Add new weapon (if < 6 weapons):
   - Offer random weapon player doesn't have
   
3. Stat upgrades:
   - +20% max health
   - +10% move speed
   - +20% pickup radius
   - +10% damage (all weapons)

IMPLEMENTATION PRIORITIES:
1. XP gems drop and can be collected ✓
2. XP bar in HUD showing progress ✓
3. Level-up pauses game ✓
4. UI shows 3 upgrade choices ✓
5. Upgrades actually apply to player/weapons ✓

TEST CHECKLIST:
- [ ] Enemies drop gems when killed
- [ ] Gems are pulled toward player
- [ ] Player collects gems and gains XP
- [ ] Level-up triggers at correct XP
- [ ] Game pauses during level-up
- [ ] 3 valid upgrade choices shown
- [ ] Upgrades apply correctly
- [ ] Game resumes after selection

DELIVERABLE:
- All files created
- XP system working end-to-end
- Level-up UI functional
- At least 5 different upgrade types
```

---

### Phase 5: Optimization

#### Prompt for Spatial Hashing
```
TASK: Implement spatial hash grid for optimized collision detection

CURRENT PROBLEM:
With 500 enemies and 200 projectiles, checking every collision pair is O(n²):
500 * 200 = 100,000 checks per frame = performance problem!

SOLUTION:
Spatial hash grid divides the world into cells. Only check collisions between entities in same/adjacent cells.

ARCHITECTURE REFERENCE:
- Read "4. Collision System" in Core Systems Documentation
- Read "Spatial Hash Grid" details
- Read "Performance Optimization Guidelines"

REQUIREMENTS:
- Cell size: 100 pixels
- Update grid every frame
- Query only relevant cells for each entity
- Should reduce collision checks by 90%+

FILE TO CREATE:
js/utils/SpatialHash.js

IMPLEMENTATION:
```javascript
export class SpatialHash {
  constructor(cellSize = 100) {
    this.cellSize = cellSize;
    this.grid = new Map(); // Key: "x,y", Value: entity array
  }
  
  clear() {
    this.grid.clear();
  }
  
  insert(entity) {
    const cellX = Math.floor(entity.position.x / this.cellSize);
    const cellY = Math.floor(entity.position.y / this.cellSize);
    const key = `${cellX},${cellY}`;
    
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key).push(entity);
  }
  
  getNearby(entity) {
    const cellX = Math.floor(entity.position.x / this.cellSize);
    const cellY = Math.floor(entity.position.y / this.cellSize);
    const nearby = [];
    
    // Check this cell + 8 adjacent cells
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${cellX + dx},${cellY + dy}`;
        if (this.grid.has(key)) {
          nearby.push(...this.grid.get(key));
        }
      }
    }
    
    return nearby;
  }
  
  build(entities) {
    this.clear();
    for (const entity of entities) {
      this.insert(entity);
    }
  }
}
```

USAGE IN COLLISION SYSTEM:
```javascript
// Old way (slow):
for (const proj of projectiles) {
  for (const enemy of enemies) {
    if (collision(proj, enemy)) { ... }
  }
}

// New way (fast):
spatialHash.build(enemies);

for (const proj of projectiles) {
  const nearby = spatialHash.getNearby(proj);
  for (const enemy of nearby) {
    if (collision(proj, enemy)) { ... }
  }
}
```

PERFORMANCE TESTING:
Before optimization:
1. Spawn 500 enemies
2. Fire weapon continuously
3. Measure FPS (should be 30-40 FPS)

After optimization:
1. Same test
2. Measure FPS (should be 55-60 FPS)
3. Log collision checks per frame (should be <10,000)

TEST CHECKLIST:
- [ ] Spatial hash builds correctly
- [ ] getNearby returns correct entities
- [ ] Collisions still work correctly
- [ ] FPS improved significantly (before/after comparison)
- [ ] No bugs introduced

DELIVERABLE:
- SpatialHash.js created
- CollisionSystem updated to use it
- Performance metrics (before/after FPS)
- Any issues encountered
```

---

## Code Review Agent Prompts

### General Code Review Prompt
```
You are reviewing code for the Vampire Survivors game project.

ARCHITECTURE DOCUMENT: game_architecture.md
CODE TO REVIEW: [specific files]

REVIEW CHECKLIST:

1. ARCHITECTURE COMPLIANCE:
   - [ ] Follows directory structure
   - [ ] No circular dependencies
   - [ ] Uses ES6 modules correctly
   - [ ] Matches documented system design

2. CODE QUALITY:
   - [ ] JSDoc comments on all functions/classes
   - [ ] Descriptive variable names
   - [ ] No magic numbers (use constants)
   - [ ] Error handling present
   - [ ] Edge cases handled

3. PERFORMANCE:
   - [ ] No unnecessary loops
   - [ ] Efficient algorithms used
   - [ ] No memory leaks
   - [ ] Frame-rate independent (uses deltaTime)

4. CORRECTNESS:
   - [ ] Logic matches requirements
   - [ ] Math is correct (especially vector math)
   - [ ] Collision detection works
   - [ ] No off-by-one errors

5. COMMON PITFALLS:
   - [ ] No use of `var` (use `const`/`let`)
   - [ ] No global variables
   - [ ] Normalized diagonal movement
   - [ ] Cleared intervals/timeouts
   - [ ] Array bounds checked

PROVIDE:
1. List of issues found (critical/moderate/minor)
2. Specific code suggestions for fixes
3. Positive feedback on good practices
4. Overall assessment (approve/needs changes)

Be specific: Quote the problematic code and suggest exact fixes.
```

---

## Testing Agent Prompts

### Manual Testing Prompt
```
You are testing a feature of the Vampire Survivors game.

FEATURE TO TEST: [specific feature]
EXPECTED BEHAVIOR: [from architecture doc]

TESTING PROCEDURE:

1. SETUP:
   - Open index.html in browser
   - Open browser console (F12)
   - Note initial state

2. FUNCTIONAL TESTS:
   For each requirement in the feature spec:
   - [ ] Test the happy path
   - [ ] Test edge cases
   - [ ] Test error conditions
   - [ ] Verify visual feedback

3. PERFORMANCE TESTS:
   - [ ] Check FPS (should be 60)
   - [ ] Test with maximum entities
   - [ ] Monitor console for errors
   - [ ] Check memory usage (shouldn't constantly increase)

4. COMPATIBILITY:
   Test in multiple browsers:
   - [ ] Chrome
   - [ ] Firefox
   - [ ] Safari
   - [ ] Edge

5. USER EXPERIENCE:
   - [ ] Controls feel responsive
   - [ ] Visual feedback is clear
   - [ ] No stuttering or lag
   - [ ] Audio is not annoying

BUG REPORT FORMAT:
If you find bugs, report them like this:

**Bug #1: [Short description]**
- Severity: Critical/High/Medium/Low
- Steps to reproduce:
  1. ...
  2. ...
  3. ...
- Expected: [what should happen]
- Actual: [what does happen]
- Browser: [Chrome 120 / Firefox 121 / etc.]
- Console errors: [any errors]
- Screenshot/video: [if applicable]

DELIVERABLE:
- Completed testing checklist
- Bug reports (if any)
- Performance notes
- Overall quality assessment
```

---

## Emergency Debugging Prompts

### When Code Doesn't Work
```
The [component] is not working as expected.

SYMPTOMS:
[Describe what's happening]

EXPECTED BEHAVIOR:
[What should happen]

DEBUGGING STEPS:

1. ISOLATE THE PROBLEM:
   - Does the file load without errors?
   - Add console.log at entry point of broken feature
   - Check if functions are being called
   - Verify data is correct type/format

2. CHECK THE BASICS:
   - Module imported correctly?
   - Function parameters correct?
   - Return values as expected?
   - Event listeners attached?

3. COMMON ISSUES:
   - Circular dependency?
   - Timing issue (async/promise)?
   - Scope problem (this binding)?
   - Type mismatch?
   - Undefined/null value?

4. BINARY SEARCH:
   - Comment out half the code
   - Does it work now?
   - If yes, problem is in commented section
   - If no, problem is in remaining code
   - Repeat until isolated

5. RUBBER DUCK DEBUG:
   Explain the code line-by-line as if teaching someone.
   Often you'll spot the issue while explaining.

PROVIDE:
- The specific line causing the problem
- Why it's failing
- The fix
- How to prevent similar issues
```

---

### Performance Problem Debugging
```
The game is running slowly (< 60 FPS).

PERFORMANCE PROFILING STEPS:

1. MEASURE BASELINE:
   ```javascript
   // Add to game loop
   const startTime = performance.now();
   // ... update code ...
   const endTime = performance.now();
   console.log(`Frame time: ${endTime - startTime}ms`);
   ```

2. IDENTIFY BOTTLENECK:
   Time each major system:
   - Input processing
   - Enemy updates
   - Weapon updates
   - Collision detection
   - Rendering
   
   Which takes the most time?

3. COMMON PERFORMANCE KILLERS:
   - O(n²) collision checks (not using spatial hash)
   - Rendering off-screen entities
   - Creating/destroying too many objects (need pooling)
   - Heavy computation in tight loops
   - Too many canvas state changes

4. OPTIMIZATION STRATEGIES:
   - Add spatial hashing for collisions
   - Implement draw culling
   - Use object pooling
   - Reduce entity count (cap limits)
   - Batch similar draw calls

5. PROFILING TOOLS:
   - Chrome DevTools Performance tab
   - Record 5 seconds of gameplay
   - Look for long tasks (> 16ms)
   - Identify hot functions

PROVIDE:
- Bottleneck identified
- Time measurements (before optimization)
- Optimization implemented
- Time measurements (after optimization)
- FPS improvement achieved
```

---

---

## Analytics Agent Prompts

### Pre-Phase Analysis Prompt
```
TASK: Analyze best practices for [specific phase/system]

You are the Analytics Agent. Before we implement [Phase X: System Name], 
research and analyze the best approaches.

RESEARCH AREAS:
1. Industry best practices for [specific system]
2. Common pitfalls and how to avoid them
3. Performance considerations
4. Alternative implementation approaches
5. Modern web game development standards

ARCHITECTURE CONTEXT:
- Read the relevant section in game_architecture.md
- Our constraints: Vanilla JS, 60 FPS target, 500+ entities
- Our approach: [current architectural decision]

DELIVERABLE FORMAT:
## Research Summary: [System Name]

### Industry Best Practices
- [List 5-7 key best practices with sources]

### Implementation Approaches
1. **Approach A**: [Description]
   - Pros: [List]
   - Cons: [List]
   - Performance: [Analysis]
   - Complexity: [Low/Medium/High]
   
2. **Approach B**: [Description]
   - Pros: [List]
   - Cons: [List]
   - Performance: [Analysis]
   - Complexity: [Low/Medium/High]

### Recommended Approach
**Winner**: [Approach X]
**Reasoning**: [Detailed explanation]
**Implementation Notes**: [Key points for developer agent]

### Potential Pitfalls
- [List common mistakes to avoid]

### Performance Benchmarks
- Expected performance: [Metrics]
- Optimization opportunities: [List]

### References
- [List articles, documentation, game dev resources]

EXAMPLE RESEARCH TOPICS:
- "Spatial hashing vs Quadtree for 2D collision detection"
- "Entity-Component-System vs Object-Oriented for game entities"
- "Canvas rendering optimization techniques"
- "JavaScript game loop best practices"
```

---

### Performance Analysis Prompt
```
TASK: Analyze performance bottleneck and find optimal solution

CURRENT SITUATION:
- FPS: [current FPS]
- Target: 60 FPS
- Entity count: [number]
- Bottleneck: [suspected system]

PROFILING DATA:
- [Frame time breakdown]
- [Hot functions]
- [Memory usage]

YOUR ANALYSIS SHOULD INCLUDE:

1. **Root Cause Analysis**
   - Identify the actual bottleneck (not just symptoms)
   - Explain why it's happening
   - Quantify the impact

2. **Solution Research**
   Research 3-5 optimization approaches:
   - Algorithm improvements
   - Data structure changes
   - Rendering optimizations
   - Caching strategies
   - Code-level micro-optimizations

3. **Comparative Analysis**
   For each solution:
   - Expected performance gain (% improvement)
   - Implementation complexity (hours)
   - Risk level (Low/Medium/High)
   - Side effects or trade-offs

4. **Recommendation**
   - Primary solution with step-by-step approach
   - Fallback solutions if primary doesn't work
   - Testing strategy to verify improvement

5. **Implementation Guidance**
   - Specific code patterns to use
   - What to measure before/after
   - How to validate the fix

EXAMPLE SCENARIOS:
- "Collision detection taking 12ms per frame with 500 enemies"
- "Rendering slows down with 200+ projectiles on screen"
- "Memory usage growing over time (potential leak)"
```

---

### Trade-off Analysis Prompt
```
TASK: Compare multiple implementation approaches

SCENARIO: We need to implement [feature], and there are multiple ways to do it.

APPROACH 1: [Description]
APPROACH 2: [Description]
APPROACH 3: [Description]

EVALUATION CRITERIA:
1. **Performance**: Which is fastest?
2. **Maintainability**: Which is easiest to understand and modify?
3. **Scalability**: Which handles growth best?
4. **Complexity**: Which is simplest to implement?
5. **Flexibility**: Which is most adaptable to future changes?
6. **Compatibility**: Which fits our architecture best?

YOUR ANALYSIS FORMAT:

## Approach Comparison Matrix

| Criteria | Approach 1 | Approach 2 | Approach 3 |
|----------|-----------|-----------|-----------|
| Performance | [Score/Analysis] | [Score/Analysis] | [Score/Analysis] |
| Maintainability | [Score/Analysis] | [Score/Analysis] | [Score/Analysis] |
| Scalability | [Score/Analysis] | [Score/Analysis] | [Score/Analysis] |
| Complexity | [Score/Analysis] | [Score/Analysis] | [Score/Analysis] |
| Flexibility | [Score/Analysis] | [Score/Analysis] | [Score/Analysis] |
| Architecture Fit | [Score/Analysis] | [Score/Analysis] | [Score/Analysis] |

## Deep Dive Analysis

### Approach 1: [Name]
**Overview**: [Description]
**Strengths**: [Detailed list]
**Weaknesses**: [Detailed list]
**Use Cases**: Best when [conditions]
**Code Example**: [Brief snippet]

[Repeat for each approach]

## Recommendation

**Winner**: [Approach X]

**Reasoning**: [Comprehensive explanation considering all criteria]

**Why Not Others**: 
- Approach Y: [Specific reasons]
- Approach Z: [Specific reasons]

**Implementation Path**: [Step-by-step guide]

**Future Considerations**: [What to watch out for]

EXAMPLE DECISIONS:
- "Object pooling vs Creating/destroying projectiles"
- "Separate collision system vs Integrated entity updates"
- "Pre-rendered sprites vs Dynamic drawing"
```

---

### Best Practices Research Prompt
```
TASK: Research best practices for [specific topic]

You are researching modern best practices for: [TOPIC]

Context: Browser-based JavaScript game development

RESEARCH FRAMEWORK:

1. **Current Industry Standards**
   - What are top game engines doing? (Phaser, PixiJS, Three.js)
   - What do AAA web games use?
   - What's in popular game dev tutorials/books?

2. **Performance Best Practices**
   - Optimization techniques
   - Common performance pitfalls
   - Profiling and benchmarking approaches

3. **Code Quality Best Practices**
   - Architectural patterns
   - Testing approaches
   - Documentation standards
   - Error handling

4. **Browser Compatibility**
   - Cross-browser considerations
   - Mobile vs Desktop differences
   - Performance across devices

5. **Accessibility & UX**
   - Keyboard controls best practices
   - Visual feedback standards
   - Audio considerations

DELIVERABLE:

## Best Practices Guide: [Topic]

### Critical Do's ✅
1. [Practice] - Why: [Explanation]
2. [Practice] - Why: [Explanation]
[Continue...]

### Critical Don'ts ❌
1. [Anti-pattern] - Why: [Explanation]
2. [Anti-pattern] - Why: [Explanation]
[Continue...]

### Code Examples

**Good Example**:
```javascript
// [Code demonstrating best practice]
```
**Why it's good**: [Explanation]

**Bad Example**:
```javascript
// [Code demonstrating anti-pattern]
```
**Why it's bad**: [Explanation]

### Implementation Checklist
- [ ] [Specific action item]
- [ ] [Specific action item]
[Continue...]

### Further Reading
- [Resource 1 with link/description]
- [Resource 2 with link/description]

EXAMPLE TOPICS:
- "JavaScript game loop implementation"
- "Canvas rendering optimization"
- "Entity state management"
- "Input handling in web games"
```

---

### Post-Implementation Review Prompt
```
TASK: Analyze completed phase and suggest improvements

PHASE COMPLETED: [Phase X: Name]

CURRENT IMPLEMENTATION:
- [List key files and their purpose]
- [Current performance metrics]
- [Any known issues]

YOUR REVIEW SHOULD COVER:

1. **Code Quality Analysis**
   - Architecture adherence: [Score 1-10]
   - Code readability: [Score 1-10]
   - Documentation quality: [Score 1-10]
   - Error handling: [Score 1-10]

2. **Performance Analysis**
   - Current FPS: [Number]
   - Bottlenecks identified: [List]
   - Memory usage: [Analysis]
   - Optimization opportunities: [List with priority]

3. **Best Practices Compliance**
   - Following industry standards? [Yes/No with examples]
   - Using optimal algorithms? [Analysis]
   - Proper separation of concerns? [Analysis]

4. **Technical Debt Assessment**
   - Quick hacks that need refactoring: [List]
   - Missing features from spec: [List]
   - Potential future problems: [List]

5. **Improvement Recommendations**

   **Quick Wins** (< 1 hour):
   - [Improvement 1]: [Description + Impact]
   - [Improvement 2]: [Description + Impact]

   **Medium Improvements** (1-4 hours):
   - [Improvement 1]: [Description + Impact]
   - [Improvement 2]: [Description + Impact]

   **Major Refactors** (4+ hours):
   - [Improvement 1]: [Description + Impact]
   - [Improvement 2]: [Description + Impact]

6. **Risk Assessment**
   - High Risk Issues: [Issues that could break the game]
   - Medium Risk: [Issues that could cause problems]
   - Low Risk: [Minor issues]

7. **Readiness for Next Phase**
   - Can we proceed? [Yes/No]
   - Prerequisites for next phase: [List]
   - Recommended fixes before proceeding: [List]

DELIVERABLE: Prioritized action items
```

---

### Algorithm Research Prompt
```
TASK: Find optimal algorithm for [specific problem]

PROBLEM STATEMENT:
[Describe the specific problem that needs an algorithmic solution]

CONSTRAINTS:
- Performance target: [e.g., must run in < 2ms per frame]
- Data size: [e.g., 500 entities, 200 projectiles]
- Update frequency: [e.g., every frame at 60 FPS]
- Memory constraints: [if any]

RESEARCH REQUIREMENTS:

1. **Algorithm Survey**
   Research 4-6 candidate algorithms:
   - Brute Force approach
   - Standard optimized approach
   - Advanced algorithm 1
   - Advanced algorithm 2
   - Novel/cutting-edge approach
   - Game-specific optimization

2. **Complexity Analysis**
   For each algorithm:
   - Time complexity: [Big O notation]
   - Space complexity: [Big O notation]
   - Best case: [When it performs optimally]
   - Worst case: [When it performs poorly]
   - Average case: [Expected real-world performance]

3. **Real-World Performance**
   - Benchmarks from other implementations
   - Expected performance with our data sizes
   - Scaling behavior

4. **Implementation Difficulty**
   - Lines of code estimate
   - Complexity of logic
   - Testing difficulty
   - Debugging difficulty

5. **Comparison Matrix**

| Algorithm | Time | Space | Performance | Complexity | Best For |
|-----------|------|-------|-------------|------------|----------|
| Brute Force | O(n²) | O(1) | Poor | Low | [Scenario] |
| [Algorithm 2] | O(n log n) | O(n) | Good | Medium | [Scenario] |
| [Continue...] | | | | | |

6. **Recommendation**
   **Best Algorithm**: [Name]
   **Reasoning**: [Why it wins for our use case]
   **Implementation Approach**: [High-level steps]
   **Estimated Performance**: [Metrics]

7. **Code Sketch**
```javascript
// Pseudocode or rough implementation
function optimalAlgorithm(data) {
  // Key steps
}
```

8. **Testing Strategy**
   - How to verify correctness
   - Performance benchmarks to run
   - Edge cases to test

EXAMPLE PROBLEMS:
- "Find nearest enemy to player among 500 enemies"
- "Detect collisions between 200 projectiles and 500 enemies"
- "Pathfinding for 100 enemies simultaneously"
- "Sort entities by Y position for rendering depth"
```

---

### Technology Stack Analysis Prompt
```
TASK: Evaluate technology choices for [feature/system]

CURRENT STACK:
- Vanilla JavaScript ES6
- HTML5 Canvas
- Web Audio API
- No external libraries

QUESTION: Should we introduce [Library/Tool/Framework] for [Purpose]?

ANALYSIS FRAMEWORK:

1. **Benefits Analysis**
   - What problems does it solve?
   - What features does it provide?
   - How much development time does it save?
   - Performance improvements?

2. **Cost Analysis**
   - Bundle size: [KB]
   - Learning curve: [Low/Medium/High]
   - Maintenance burden: [Assessment]
   - Browser compatibility: [Analysis]
   - Lock-in risk: [How hard to remove later?]

3. **Alternatives Comparison**
   - Vanilla JS solution: [Pros/Cons]
   - Library A: [Pros/Cons]
   - Library B: [Pros/Cons]
   - Library C: [Pros/Cons]

4. **Integration Analysis**
   - How well does it fit our architecture?
   - Conflicts with existing code?
   - Migration effort: [Hours/Days]
   - Breaking changes risk: [Assessment]

5. **Long-term Considerations**
   - Is it actively maintained?
   - Community size and support
   - Future roadmap
   - License compatibility

6. **Recommendation**
   - [ ] Use it now
   - [ ] Use it later (Phase X)
   - [ ] Don't use it, here's why: [Explanation]
   - [ ] Use alternative: [Alternative + Why]

EXAMPLE QUESTIONS:
- "Should we use Howler.js for audio instead of Web Audio API?"
- "Should we use a physics library like Matter.js?"
- "Should we use TypeScript instead of JavaScript?"
- "Should we use a particle system library?"
```

---

## Analytics Agent Workflow Examples

### Example 1: Before Phase 5 (Optimization)

**Manager to Analytics Agent**:
```
We're about to implement Phase 5 (Performance Optimization). 
Currently, the game runs at 45 FPS with 300 enemies and 150 projectiles.
Research optimal collision detection approaches for our use case.
```

**Analytics Agent Research** → **Report to Manager** → **Manager gives report to Developer Agent**

---

### Example 2: During Phase 3 (Combat System)

**Developer Agent**: "I'm not sure if I should use object pooling for projectiles"

**Manager to Analytics Agent**:
```
Analyze object pooling vs create/destroy for projectile management.
We create ~10 projectiles per second, max ~200 on screen.
```

**Analytics Agent Analysis** → **Recommendation** → **Developer implements**

---

### Example 3: Post-Phase Review

**Manager to Analytics Agent**:
```
Phase 2 (Enemy System) is complete. Review the implementation
and suggest improvements before we move to Phase 3.
Files: Enemy.js, SpawnSystem.js
Current performance: 55 FPS with 500 enemies
```

**Analytics Agent Review** → **Identifies issues** → **Developer fixes critical items**

---

## Collaboration Protocols

### Starting a New Session
When an agent takes over work:

1. Read the architecture document
2. Check status of current phase
3. Review recent code changes
4. Run tests to verify current state
5. **[NEW] Check if Analytics Agent has research/recommendations**
6. Identify next task from phase plan
7. Ask for clarification if needed

### Before Starting a New Phase
**New workflow with Analytics Agent:**

1. **Manager reviews architecture** for upcoming phase
2. **Manager asks Analytics Agent** to research best practices
3. **Analytics Agent delivers** research report
4. **Manager reviews** recommendations
5. **Manager briefs Developer Agent** with both architecture docs AND analytics research
6. **Developer implements** using best practices
7. **Code Review Agent** validates against both architecture and best practices
8. **Testing Agent** verifies implementation

### Ending a Session
When an agent finishes work:

1. Test the code thoroughly
2. Commit/save all files
3. Write status report (see handoff format in architecture doc)
4. Document any blockers or issues
5. Update phase checklist
6. **[NEW] Flag if Analytics Agent review would be helpful**
7. Note what's next

### When to Involve Analytics Agent

**Always involve before**:
- Starting Phase 5 (Performance Optimization)
- Making major architectural decisions
- Choosing between multiple implementation approaches

**Consider involving when**:
- Performance issues arise
- Stuck on a difficult problem
- Unsure about best practices
- After completing a phase (optional review)

**Don't need Analytics Agent for**:
- Simple bug fixes
- Minor tweaks
- Following established patterns
- Implementing already-decided approaches

### Asking for Help
If an agent gets stuck:

```
I'm blocked on [task].

CONTEXT:
- What I'm trying to do: [goal]
- What I've tried: [attempts]
- Current error/issue: [specific problem]
- Relevant code: [code snippet]

QUESTION:
[Specific question]

I think the issue might be [hypothesis], but I'm not sure how to [specific action].
```

---

## Quality Assurance Checklist

Before marking any phase as complete:

### Code Quality
- [ ] All files in correct directories
- [ ] No console errors in browser
- [ ] All functions have JSDoc comments
- [ ] Constants used instead of magic numbers
- [ ] No `var`, only `const` and `let`
- [ ] Error handling for edge cases

### Architecture Compliance
- [ ] Follows documented structure
- [ ] No circular dependencies
- [ ] Clean separation of concerns
- [ ] Uses ES6 modules properly
- [ ] Matches system specifications

### Functionality
- [ ] Feature works as specified
- [ ] Edge cases handled
- [ ] No obvious bugs
- [ ] User feedback is clear
- [ ] Performance is acceptable

### Testing
- [ ] Manually tested in browser
- [ ] Works with min/max values
- [ ] No memory leaks observed
- [ ] FPS remains at 60
- [ ] Compatible with target browsers

### Documentation
- [ ] Code is self-documenting
- [ ] Complex logic explained with comments
- [ ] API documented if creating new system
- [ ] Changes logged in handoff report

---

## Anti-Patterns to Avoid

### ❌ DON'T: Implement Before Understanding
```
I'll just start coding and figure it out as I go.
```
**Problem**: Likely to violate architecture, create bugs, waste time

### ✅ DO: Read First, Code Second
```
Let me read the architecture doc and understand the system design first.
Then I'll implement following the specifications.
```

---

### ❌ DON'T: Copy Code Without Understanding
```
I found similar code online, I'll just copy it.
```
**Problem**: May not fit architecture, likely has different assumptions

### ✅ DO: Understand Then Adapt
```
I found a reference implementation. Let me understand how it works,
then adapt it to fit our architecture and requirements.
```

---

### ❌ DON'T: Add Features Not in Plan
```
I'll add this cool feature I thought of!
```
**Problem**: Scope creep, may break other systems, wastes time

### ✅ DO: Follow the Phase Plan
```
This feature isn't in the current phase. I'll note it as a future
enhancement and focus on the specified requirements.
```

---

### ❌ DON'T: Ignore Performance Until Later
```
I'll make it work first, optimize later.
```
**Problem**: May bake in performance issues that are hard to fix

### ✅ DO: Design for Performance
```
I'll use the spatial hash from the start since I know we'll have
500+ entities. Better than refactoring later.
```

---

### ❌ DON'T: Write Cryptic Code
```javascript
const x = (a * 1.41421356) / 2;
```
**Problem**: No one knows what this does (including future you)

### ✅ DO: Write Clear, Documented Code
```javascript
// Normalize diagonal movement speed
// (moving diagonally at full speed would be 1.41x faster)
const DIAGONAL_FACTOR = Math.sqrt(2);
const normalizedSpeed = (speed * DIAGONAL_FACTOR) / 2;
```

---

## Success Metrics for Agents

### Excellent Agent Performance
- Follows architecture document closely
- Code works on first test
- Comprehensive comments and documentation
- Anticipates edge cases
- Clear handoff reports
- Asks for help when stuck (not after stuck for hours)

### Good Agent Performance
- Generally follows architecture
- Code works with minor fixes
- Basic comments present
- Handles obvious edge cases
- Provides handoff info
- Debugs independently

### Needs Improvement
- Ignores architecture frequently
- Code has major bugs
- No comments or documentation
- Misses obvious edge cases
- Unclear what was done
- Gets stuck without asking for help

---

## Final Prompt: Initial Implementation Task

When you're ready to start, use this prompt:

```
I'm starting implementation of the Vampire Survivors-style game.

ARCHITECTURE: I have read and understand game_architecture.md

STARTING PHASE: Phase 1 - Core Foundation

MY TASKS:
1. Create project structure (folders and base files)
2. Set up index.html with canvas
3. Implement game loop with requestAnimationFrame
4. Create Vector2D utility class
5. Implement player movement with keyboard controls
6. Add basic rendering (player as colored circle)

APPROACH:
I will implement these in order, testing each component before
moving to the next. I will follow the architecture document exactly
and use the code style guidelines specified.

DELIVERABLES:
- Complete file structure
- Working game loop at 60 FPS
- Player that moves smoothly with WASD/Arrow keys
- No console errors
- Status report when complete

I will now begin implementing the project structure and core game loop.
Should I proceed with creating the base files?
```

---

END OF AI AGENT INSTRUCTIONS
