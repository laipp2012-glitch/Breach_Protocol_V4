# ASCII Visual Style Guide

## Quick Reference for Developers

This guide shows the ASCII art style used in phases 1-6. In phase 7, these will be replaced with your custom Figma graphics.

---

## Character Map

### Player
```
Character: @
Color: #00ff00 (green)
Font: 20px monospace
State: Normal

Character: @
Color: #ff0000 (red)
Font: 20px monospace
State: Damaged/Invulnerable
```

### Enemies

```
Character: E
Color: #ff0000 (red)
Font: 16px monospace
Type: Basic Enemy
```

```
Character: T
Color: #ff4444 (dark red)
Font: 20px monospace
Type: Tank Enemy (more health, slower)
```

```
Character: F
Color: #ff8800 (orange)
Font: 14px monospace
Type: Fast Enemy (less health, faster)
```

```
Character: B
Color: #ff00ff (magenta)
Font: 18px monospace
Type: Boss Enemy (future)
```

### Projectiles

```
Character: *
Color: #ffff00 (yellow)
Font: 12px monospace
Type: Magic Wand projectile
```

```
Character: +
Color: #ffffff (white)
Font: 14px monospace
Type: Cross/Boomerang
```

```
Character: ~
Color: #00ffff (cyan)
Font: 12px monospace
Type: Holy Water (ground effect)
```

### Pickups

```
Character: $
Color: #00ffff (cyan)
Font: 12px monospace
Type: XP Gem (small)
```

```
Character: ◆
Color: #00ffff (cyan)
Font: 16px monospace
Type: XP Gem (large)
```

```
Character: +
Color: #00ff00 (green)
Font: 14px monospace
Type: Health Pickup
```

### UI Elements

```
Character: █
Color: #ff0000 (red)
Font: 10px monospace
Use: Health bar fill
```

```
Character: ░
Color: #333333 (dark gray)
Font: 10px monospace
Use: Empty health bar
```

```
Character: █
Color: #00ffff (cyan)
Font: 10px monospace
Use: XP bar fill
```

---

## Example Screen Layout

```
┌────────────────────────────────────────┐
│ HP: ████████░░  XP: ██████░░░░  Lvl: 5 │
│ Time: 05:23     Kills: 127             │
├────────────────────────────────────────┤
│                                        │
│    E    F         $                    │
│                                        │
│      T      *  *  $    E               │
│                                        │
│           @                            │
│                                        │
│    E         *        $     F          │
│                                        │
│        $    E      T                   │
│                                        │
└────────────────────────────────────────┘
```

**Legend:**
- `@` = Player (you)
- `E` = Basic Enemy
- `T` = Tank Enemy
- `F` = Fast Enemy
- `*` = Projectile
- `$` = XP Gem

---

## Background Style

**Color Scheme:**
```css
Background: #0a0a0a (very dark gray, almost black)
Grid Lines: #1a1a1a (slightly lighter gray)
Grid Size: 50px
```

**Grid Pattern (Optional):**
```
┌─┬─┬─┬─┬─┬─┬─┬─┬─┐
├─┼─┼─┼─┼─┼─┼─┼─┼─┤
├─┼─┼─┼─┼─┼─┼─┼─┼─┤
├─┼─┼─┼─┼─┼─┼─┼─┼─┤
├─┼─┼─┼─┼─┼─┼─┼─┼─┤
└─┴─┴─┴─┴─┴─┴─┴─┴─┘
```

Or simple dots:
```
· · · · · · · · · · · · · · ·
· · · · · · · · · · · · · · ·
· · · · · · @ · · · · · · · ·
· · · · E · · · · F · · · · ·
· · · · · · · · · · · · · · ·
```

---

## Color Palette

### Entity Colors
| Entity | Hex | RGB | Purpose |
|--------|-----|-----|---------|
| Player Normal | `#00ff00` | rgb(0, 255, 0) | Healthy player |
| Player Damaged | `#ff0000` | rgb(255, 0, 0) | Taking damage |
| Enemy Basic | `#ff0000` | rgb(255, 0, 0) | Standard threat |
| Enemy Tank | `#ff4444` | rgb(255, 68, 68) | Heavy threat |
| Enemy Fast | `#ff8800` | rgb(255, 136, 0) | Quick threat |
| Projectile | `#ffff00` | rgb(255, 255, 0) | Player attacks |
| XP Gem | `#00ffff` | rgb(0, 255, 255) | Collectibles |
| Health | `#00ff00` | rgb(0, 255, 0) | Health pickup |

### UI Colors
| Element | Hex | RGB | Purpose |
|---------|-----|-----|---------|
| Background | `#0a0a0a` | rgb(10, 10, 10) | Canvas background |
| Grid | `#1a1a1a` | rgb(26, 26, 26) | Grid lines |
| UI Text | `#ffffff` | rgb(255, 255, 255) | HUD text |
| HP Bar | `#ff0000` | rgb(255, 0, 0) | Health bar fill |
| XP Bar | `#00ffff` | rgb(0, 255, 255) | XP bar fill |
| Bar Empty | `#333333` | rgb(51, 51, 51) | Empty bar space |

---

## Font Rendering Settings

**Font Family:**
```css
font-family: 'Courier New', Courier, monospace;
```

**Text Rendering:**
```javascript
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.font = '16px monospace';
```

**Anti-aliasing:**
- Leave default (browser handles it)
- On retina displays, characters will be sharp

**Size Guidelines:**
- Player: 20px (largest, most important)
- Enemies: 14-20px (varies by type)
- Projectiles: 12px (small, numerous)
- Pickups: 12-16px (varies by value)
- UI Text: 14px (readable)
- Damage Numbers: 10px (small, temporary)

---

## Animation Using ASCII

Even with ASCII characters, you can create simple animations:

### Damage Flash
```javascript
// Enemy takes damage
1. Normal color (#ff0000) for 50ms
2. White (#ffffff) for 50ms
3. Normal color (#ff0000) for 50ms
4. White (#ffffff) for 50ms
5. Return to normal
```

### Death Animation
```javascript
// Entity dies
1. Normal character with normal color
2. Fade alpha from 1.0 to 0.0 over 300ms
3. Optional: scale up slightly (1.0 to 1.5)
4. Remove entity
```

### Level Up Effect
```javascript
// Player levels up
1. Show "LEVEL UP!" text above player
2. Pulse @ character (scale 1.0 → 1.5 → 1.0)
3. Color cycle: green → yellow → green
4. Emit $ symbols that float upward
```

### Invincibility Flash
```javascript
// Player is invulnerable
1. Alternate visibility every 100ms
2. Visible → Invisible → Visible → Invisible
3. Or alternate: green → white → green → white
```

---

## Particle Effects in ASCII

### XP Collection Trail
```
Player at (100, 100)
XP gem at (200, 200)

Animation frames:
Frame 1: $ at (200, 200)
Frame 2: $ at (180, 180), fading
Frame 3: $ at (160, 160), more faded
Frame 4: $ at (140, 140), nearly invisible
Frame 5: Player glows briefly
```

### Projectile Trail
```
Projectile moving right:
* * * * (trail fades from left to right)

Current: * (full bright)
-1 frame: * (80% alpha)
-2 frame: * (60% alpha)
-3 frame: * (40% alpha)
```

### Death Explosion
```
Enemy dies at position:
Frame 1: E (normal)
Frame 2: * * * (small explosion)
         * E *
         * * *
Frame 3: $ (XP gem appears, explosion fades)
```

---

## HUD Layout (ASCII Style)

```
┌────────────────────────────────────────────────────────────┐
│ HP: ████████████░░░  XP: ██████████░░░░░  Lvl: 12  05:34  │
└────────────────────────────────────────────────────────────┘

Where:
- HP bar: 15 characters wide
- XP bar: 15 characters wide
- Level: 2-digit number
- Time: MM:SS format
```

**Alternative Compact HUD:**
```
HP: 87/100  XP: 245/300  Lvl: 5  Time: 03:21  Kills: 89
```

---

## Weapon Indicators (Optional)

Show active weapons with small icons:

```
Weapons: [*] [+] [~]
         ^   ^   ^
       Wand Cross Water
```

Or as text:
```
Wands: 3 | Cross: 1 | Garlic: 1
```

---

## Transition to Graphics (Phase 7)

When replacing ASCII with your Figma designs:

**Before (ASCII):**
```javascript
ctx.fillStyle = '#00ff00';
ctx.fillText('@', x, y);
```

**After (SVG):**
```javascript
ctx.drawImage(playerSprite, x - radius, y - radius, radius * 2, radius * 2);
```

**Key Point:** The game logic doesn't change! Just swap the renderer:
```javascript
// Change one line in main.js:
const renderer = new SpriteRenderer(); // was ASCIIRenderer()
```

---

## Design Tips

### For ASCII Phase (Now):
1. **High Contrast:** Dark background, bright characters
2. **Distinct Characters:** Each entity type should be instantly recognizable
3. **Size Hierarchy:** Important = larger font size
4. **Color Coding:** Similar entities share color families
5. **Readability First:** If unsure, make it bigger and brighter

### For Graphics Phase (Later):
1. **Match ASCII Color Scheme:** Players expect green = friendly, red = enemy
2. **Size Consistency:** Sprite sizes should match ASCII collision radii
3. **Visual Clarity:** Even more important with detailed sprites
4. **Animation Frames:** Can reuse ASCII animation timing
5. **Style Unity:** All sprites should feel like they're from the same game

---

## Testing Your ASCII Rendering

**Checklist:**
- [ ] Characters render at correct positions
- [ ] Colors are vibrant and distinct
- [ ] Text is centered on entity position
- [ ] No overlapping text (unless intentional)
- [ ] Readable at 800x600 canvas size
- [ ] Works at different monitor DPI
- [ ] Performance: 60 FPS with 500+ characters on screen

**Common Issues:**
1. **Blurry Text:** Use monospace font, don't scale canvas
2. **Misaligned:** Always use `textAlign = 'center'` and `textBaseline = 'middle'`
3. **Performance:** Pre-set font once, don't change every draw call
4. **Colors Wrong:** Double-check hex codes, use constants

---

## Example: Rendering a Full Scene

```javascript
// ASCIIRenderer.js - drawScene method

drawScene(ctx, gameState) {
  // Background
  this.drawBackground(ctx, 800, 600);
  
  // XP gems (furthest back)
  for (const gem of gameState.gems) {
    this.drawPickup(ctx, gem.x, gem.y, gem.radius, 'xp', gem.value);
  }
  
  // Projectiles (middle layer)
  for (const proj of gameState.projectiles) {
    this.drawProjectile(ctx, proj.x, proj.y, proj.radius, proj.type);
  }
  
  // Enemies (front of projectiles)
  for (const enemy of gameState.enemies) {
    this.drawEnemy(ctx, enemy.x, enemy.y, enemy.radius, enemy.type, enemy.health);
  }
  
  // Player (always on top)
  this.drawPlayer(ctx, gameState.player.x, gameState.player.y, 
                  gameState.player.radius, gameState.player.state);
  
  // UI Overlay (always on top)
  this.drawHUD(ctx, gameState.player);
}
```

---

## Congratulations!

You now have a complete ASCII visual style guide. This will serve as your rapid prototyping visual system while you develop the core gameplay. Once the game is fun and working perfectly, you can create beautiful Figma designs and swap them in without touching any game logic!

**Remember:** The renderer abstraction means the game NEVER needs to know if it's being drawn with ASCII or high-res sprites. That's the power of good architecture!

---

END OF ASCII STYLE GUIDE
