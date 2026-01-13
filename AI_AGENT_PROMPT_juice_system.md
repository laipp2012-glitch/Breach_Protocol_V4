# AI Agent Task: Implement Modular Juice/Animation System

## Context
You are working on a Vampire Survivors clone built with vanilla JavaScript ES6+ and HTML5 Canvas. The game uses ASCII rendering currently but has a renderer abstraction (`IRenderer`) for future sprite support. The architecture is highly modular with separate systems for collision, rendering, weapons, etc.

## Project Architecture
- **Entities**: `js/entities/` - Player, Enemy, Projectile, Pickup
- **Systems**: `js/systems/` - CollisionSystem, RenderSystem, WeaponSystem, etc.
- **Renderers**: `js/renderers/` - ASCIIRenderer implements IRenderer interface
- **Config**: `js/config/` - GameConfig, EnemyConfig, WeaponConfig, UpgradeConfig
- **Utils**: `js/utils/` - Vector2D, SpatialHash

All entities have NO render methods. The RenderSystem coordinates with IRenderer implementations.

## Objective
Build a modular **juice/animation system** that adds visual feedback effects to gameplay events. The system must be:
1. **Modular** - Effects are reusable components that can be combined
2. **Non-invasive** - Minimal changes to existing entity classes
3. **Renderer-agnostic** - Works with ASCII now, sprites later
4. **Performant** - Pooled particles, efficient updates

## Required Features

### 1. Effect System (`js/systems/EffectSystem.js`)
Create a system that manages all active visual effects:
- Maintains a list of active effects
- Updates all effects each frame with deltaTime
- Removes completed effects
- Provides methods to spawn effects on entities

### 2. Base Effect Class (`js/entities/Effect.js`)
Create a base Effect class with these properties:
- `target` - The entity this effect is applied to
- `duration` - How long the effect lasts (seconds)
- `elapsed` - Time elapsed since effect started
- `completed` - Boolean flag when effect is done
- `update(deltaTime)` - Updates effect progress
- `apply(progress)` - Override this to implement effect behavior (0-1 normalized)
- `onComplete()` - Cleanup when effect finishes

### 3. Specific Effect Types (all extend Effect)

#### ScalePulseEffect
- Temporarily scales entity larger then back to normal
- Parameters: target, duration (0.15s), scaleMultiplier (1.3x)
- Use easing: quick expand, slow return (ease-out cubic)
- Store original scale, restore on complete
- Entity needs `scale` property (default 1)

#### FlashEffect
- Briefly changes entity color to white (or any color) then fades back
- Parameters: target, duration (0.2s), flashColor ('#FFFFFF')
- Use linear fade from full intensity to 0
- Entity needs `flashAlpha` (0-1) and `flashColor` properties
- Renderer should blend flashColor over base color using flashAlpha

#### ShakeEffect
- Adds random offset to entity position
- Parameters: target, duration (0.15s), intensity (3 pixels)
- Decreasing intensity over time
- Entity needs `shakeOffsetX` and `shakeOffsetY` properties (default 0)
- Renderer should add these offsets to position

#### ScreenShakeEffect
- Shakes the camera instead of individual entity
- Parameters: camera, duration (0.2s), intensity (5 pixels)
- Same as ShakeEffect but applied to Camera object
- Camera needs `shakeOffsetX` and `shakeOffsetY` properties

#### KnockbackEffect
- Pushes entity in a direction
- Parameters: target, direction (Vector2D normalized), force (100), duration (0.2s)
- Decelerates over time
- Entity needs `knockbackVelocityX` and `knockbackVelocityY` properties
- Entity movement should add knockback velocity to normal velocity

### 4. Particle System (`js/entities/Particle.js` and `js/systems/ParticleSystem.js`)

#### Particle Entity
- Properties: x, y, velocityX, velocityY, lifetime, elapsed, color, size
- Simple update: position += velocity * deltaTime, elapsed += deltaTime
- isDead() returns true when elapsed >= lifetime

#### ParticleSystem
- Manages array of active particles
- `spawn(x, y, config)` - Creates particles with config options:
  - `count` - Number of particles (default 5)
  - `color` - Particle color (default '#FF0000')
  - `size` - Particle size (default 2)
  - `speed` - Initial speed range (default 50-100)
  - `lifetime` - How long particles live (default 0.5s)
  - `gravity` - Downward acceleration (default 0)
  - `spread` - Angle spread in degrees (default 360 for all directions)
- Update all particles each frame
- Remove dead particles
- Render method that draws particles (simple circles or ASCII)

### 5. Preset Effect Combinations (`js/config/EffectConfig.js`)
Create preset effect configurations for common events:

```javascript
export const EffectConfig = {
    ENEMY_HIT: {
        effects: ['scalePulse', 'flash'],
        scalePulse: { duration: 0.12, scale: 1.25 },
        flash: { duration: 0.15, color: '#FFFFFF' },
        particles: {
            count: 3,
            color: '#FF3333',
            size: 2,
            speed: [30, 60],
            lifetime: 0.3,
            spread: 180
        }
    },
    
    ENEMY_DEATH: {
        effects: ['scalePulse'],
        scalePulse: { duration: 0.2, scale: 1.5 },
        particles: {
            count: 8,
            color: '#FF0000',
            size: 3,
            speed: [80, 150],
            lifetime: 0.6,
            gravity: 200,
            spread: 360
        }
    },
    
    PLAYER_HIT: {
        effects: ['screenShake', 'flash'],
        screenShake: { duration: 0.15, intensity: 8 },
        flash: { duration: 0.1, color: '#FF0000' }
    },
    
    LEVEL_UP: {
        particles: {
            count: 20,
            color: '#FFD700',
            size: 4,
            speed: [100, 200],
            lifetime: 1.0,
            gravity: -50, // Particles rise up
            spread: 360
        }
    },
    
    XP_COLLECT: {
        effects: ['scalePulse'],
        scalePulse: { duration: 0.1, scale: 1.4 },
        particles: {
            count: 2,
            color: '#00FFFF',
            size: 1,
            speed: [20, 40],
            lifetime: 0.2,
            spread: 360
        }
    }
};
```

## Integration Points

### In CollisionSystem.js
When projectile hits enemy:
```javascript
// After applying damage
EffectSystem.applyEffectPreset('ENEMY_HIT', enemy, ParticleSystem);
```

When enemy dies:
```javascript
// Before removing enemy
EffectSystem.applyEffectPreset('ENEMY_DEATH', enemy, ParticleSystem);
```

When enemy hits player:
```javascript
// After damaging player
EffectSystem.applyEffectPreset('PLAYER_HIT', player, ParticleSystem, camera);
```

### In ExperienceSystem.js
When player levels up:
```javascript
// After level up
EffectSystem.applyEffectPreset('LEVEL_UP', player, ParticleSystem);
```

When player collects XP:
```javascript
// When pickup collected
EffectSystem.applyEffectPreset('XP_COLLECT', pickup, ParticleSystem);
```

### In GameLoop.js (main.js)
Add to update loop:
```javascript
EffectSystem.update(deltaTime);
ParticleSystem.update(deltaTime);
```

Add to render call:
```javascript
// After rendering entities
ParticleSystem.render(renderer, camera);
```

### In ASCIIRenderer.js
Update rendering to respect effect properties:

```javascript
renderEntity(entity, camera) {
    // Calculate position with shake offset
    const screenX = entity.x - camera.x + (entity.shakeOffsetX || 0);
    const screenY = entity.y - camera.y + (entity.shakeOffsetY || 0);
    
    // Apply scale if present
    const scale = entity.scale || 1;
    const size = entity.size * scale;
    
    // Render character
    ctx.fillStyle = entity.color;
    ctx.fillText(entity.char, screenX, screenY);
    
    // Apply flash effect if present
    if (entity.flashAlpha > 0) {
        ctx.globalAlpha = entity.flashAlpha;
        ctx.fillStyle = entity.flashColor;
        ctx.fillText(entity.char, screenX, screenY);
        ctx.globalAlpha = 1.0;
    }
}
```

### In Camera.js
Update camera position to include shake:
```javascript
getRenderX() {
    return this.x + (this.shakeOffsetX || 0);
}

getRenderY() {
    return this.y + (this.shakeOffsetY || 0);
}
```

## Entity Property Additions

### All Entities (Player, Enemy, Projectile)
Add these optional properties with defaults:
```javascript
this.scale = 1;
this.flashAlpha = 0;
this.flashColor = null;
this.shakeOffsetX = 0;
this.shakeOffsetY = 0;
this.knockbackVelocityX = 0;
this.knockbackVelocityY = 0;
```

### Enemy.js
Update movement to include knockback:
```javascript
update(deltaTime) {
    // ... existing movement code ...
    
    // Apply knockback
    this.x += this.knockbackVelocityX * deltaTime;
    this.y += this.knockbackVelocityY * deltaTime;
}
```

## Expected File Outputs

1. `js/entities/Effect.js` - Base Effect class + all effect types
2. `js/systems/EffectSystem.js` - Effect manager singleton
3. `js/entities/Particle.js` - Particle entity
4. `js/systems/ParticleSystem.js` - Particle manager singleton
5. `js/config/EffectConfig.js` - Preset configurations
6. **Modified files**:
   - `js/systems/CollisionSystem.js` - Add effect triggers
   - `js/systems/ExperienceSystem.js` - Add effect triggers
   - `js/renderers/ASCIIRenderer.js` - Support effect properties
   - `js/core/Camera.js` - Add shake support
   - `js/entities/Enemy.js` - Add knockback support
   - `js/entities/Player.js` - Add effect properties
   - `js/main.js` - Update/render EffectSystem and ParticleSystem

## Code Quality Requirements

1. **Use ES6+ syntax**: classes, arrow functions, const/let
2. **Follow existing patterns**: Match the coding style in the project
3. **Add JSDoc comments**: Document all classes and public methods
4. **Performance**: 
   - Don't create effects every frame
   - Pool particles if possible
   - Remove completed effects immediately
5. **Flexibility**: 
   - All effect parameters should have sensible defaults
   - Easy to add new effect types later
   - Config-driven where possible

## Testing Checklist

After implementation, verify:
- [ ] Enemy flashes white and scales when hit
- [ ] Red particles spawn when enemy is hit
- [ ] More particles spawn when enemy dies
- [ ] Screen shakes when player takes damage
- [ ] Player flashes red when hit
- [ ] Gold particles spawn on level up
- [ ] XP pickups pulse when collected
- [ ] Particles have gravity/spread working correctly
- [ ] Effects work with camera scrolling
- [ ] Performance: 60 FPS with 100+ enemies and particles

## Optional Enhancements (if time permits)

1. **Effect Chaining**: Allow effects to trigger other effects
2. **Particle Trails**: Projectiles leave particle trails
3. **Hit Stop**: Brief pause (time slowdown) on impactful hits
4. **Squash and Stretch**: Directional scaling on movement
5. **Particle Emitters**: Continuous particle sources (garlic aura)

## Notes

- Keep ASCII rendering in mind - effects should enhance, not clutter the screen
- Test with many entities - particles can multiply quickly
- Consider adding a config flag `EFFECTS_ENABLED` for performance testing
- The system should work seamlessly when switching to sprite renderer later

Good luck! Build this systematically - start with Effect base class, then one effect type, then system integration, then add more effects.
