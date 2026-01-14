# Breach Protocol - Game Design Document

**Version:** 1.0 (Current Build)
**Target Platform:** Web Browser (HTML5/Canvas)
**Genre:** Survival Roguelike / "Bullet Heaven" (Vampire Survivors-like)
**Visual Style:** Retro Cyberpunk ASCII

---

## 1. Game Overview

**Breach Protocol** is a fast-paced survival game where the player controls a lone unit surviving against endless waves of viral enemies in a digital cyberspace environment. The goal is to survive as long as possible, collect data (XP), upgrade subroutines (weapons), and become an unstoppable force.

### Core Loop
1.  **SURVIVE**: Move to avoid enemies. Weapons fire automatically.
2.  **COLLECT**: Gather dropped Data Gems (XP) from defeated enemies.
3.  **UPGRADE**: Level up to gain new weapons or boost stats.
4.  **REPEAT**: Survive increasingly difficult waves until death.

---

## 2. Gameplay Mechanics

### 2.1 Player Character
-   **Movement**: 8-directional movement (WASD/Arrows).
-   **Auto-Attack**: Weapons fire automatically provided they are off cooldown.
-   **Stats**:
    -   *Max Health*: 100 base.
    -   *Speed*: 140 pixels/sec base.
    -   *Pickup Radius*: Magnetic range for XP gems.
    -   *Invulnerability*: 1.0s buffer after taking damage.

### 2.2 Combat System
The game utilizes an auto-battler system where the player focuses solely on positioning.
-   **Collision**: Touching enemies deals damage to the player.
-   **Damage Numbers**: Visual feedback for damage dealt to enemies.
-   **Hit Effects**: Enemies flash and pulse when hit.

### 2.3 Progression (Leveling)
-   Enemies drop **XP Gems** (`$` / `◆`) on death.
-   Collecting XP fills the experience bar.
-   **Level Up**: Pauses the game and presents 3 random upgrade choices.
-   **Choices**: Can be a new weapon, a weapon upgrade (damage/count/speed), or a passive stat boost.

---

## 3. Arsenal (Weapons)

### 3.1 Magic Wand
-   **Type**: Projectile
-   **Behavior**: Fires magic projectiles at the nearest enemy (multi-target at higher levels).
-   **Visual**: Symbol `¡` (Blue `#8888ff`).

### 3.2 Knife
-   **Type**: Directional Projectile
-   **Behavior**: Fires fast customisable projectiles in movement direction (spread pattern at higher levels).
-   **Visual**: Symbol `†` (Silver `#cccccc`).

### 3.3 Garlic
-   **Type**: Area of Effect (AoE)
-   **Behavior**: Creates a damaging field around the player.
-   **Visual**: Symbol `○` (Yellow `#ffff00`).

### 3.4 Orbiting Shield
-   **Type**: Orbit
-   **Behavior**: Deploys defensive drones that circle the player.
-   **Visual**: Symbol `♦` (Cyan `#00ffff`).

### 3.5 Scatter Shot
-   **Type**: Spread Projectile
-   **Behavior**: Fires a shotgun-like blast of projectiles.
-   **Visual**: Symbol `░` (Red `#ff8888`).

### 3.6 Magic Missile (Seeker)
-   **Type**: Tracking Projectile
-   **Behavior**: Fires missiles that actively steer toward targets.
-   **Visual**: Symbol `»` (Magenta `#ff00ff`).

### 3.7 Proximity Mine
-   **Type**: Deployable
-   **Behavior**: Stationary mines that explode when enemies approach.
-   **Visual**: Symbol `x` (Green `#00ff00`).

### 3.8 Passive Items
Passive items provide stat boosts that persist for the entire run. All have associated symbols and colors displayed in the HUD.
-   **Damage Amp** (`+`): Increases damage multiplier.
-   **Wings** (`^`): Increases movement speed.
-   **Magnet** (`U`): Increases pickup radius.
-   **Vigor** (`H`): Increases maximum health.
-   **Cooldown** (`C`): Reduces weapon cooldowns.
-   **Armor** (`#`): Reduces damage taken.
-   **Greed** (`$`): Increases XP multiplier.
-   **Luck** (`%`): Increases luck chance.
-   **Regeneration** (`&`): Auto-repairs health.
-   **Area** (`O`): Increases weapon AoE size.
-   **Duration** (`T`): Increases weapon effect duration.

---

## 4. Bestiary (Enemies)

Enemies spawn endlessly at the edges of the screen and track the player.

| Type | Name | Symbol | Color | Behavior |
|------|------|--------|-------|----------|
| **Basic** | *Glitch* | `E` | Red | Standard fodder. Chases player. |
| **Fast** | *Trojan* | `F` | Orange | Fast but weak. Rushes the player. |
| **Tank** | *Firewall* | `T` | Dark Red | Slow, high health. Meat shield. |
| **Ranger** | *Sniper* | `R` | Orange | Maintains distance and fires projectiles. |
| **Swarm** | *Cluster* | `S` | Purple | Spawns mini-swarmers (`s`) on death. |

---

## 5. Game Systems

### 5.1 Juice & Feedback (Visuals)
-   **Particles**: ASCII particles explode from killed enemies.
-   **Screen Shake**: Impact feedback for heavy hits and player damage.
-   **Flash**: Enemies flash white when damaged.
-   **Scale Pulse**: Enemies expand slightly when hit.
-   **Floating Text**: Damage numbers pop up and float away.

### 5.2 World & Camera
-   **Map**: 4000x4000 pixel virtual scrolling world.
-   **Camera**: Smoothly follows the player with a lerp factor.
-   **Grid**: Background grid helps convey movement/speed.

### 5.3 Technical
-   **Renderer**: Custom `ASCIIRenderer` simulating a terminal interface on Canvas.
-   **Spatial Hashing**: Optimizes collision detection.
-   **Object Pooling**: Reuses projectile and particle objects.
-   **Unique IDs**: All entities have unique IDs for tracking (e.g., piercing logic).

### 5.4 Stat System
Stats are calculated dynamically each frame to support upgrades and temporary buffs.
-   **Stacking Logic**:
    -   *Multipliers*: Additive stacking (e.g., Base × (1 + 0.1 + 0.1) = 1.2x).
    -   *Flat Bonuses*: Simple addition (e.g., Base + 20 + 20).
-   **Key Stats**:
    -   `Speed`: Base 140 × Multiplier.
    -   `Damage`: Weapon Base × Level Multiplier × Global Damage Multiplier.
    -   `Cooldown`: Weapon Base × (1 - Cooldown Reduction).
    -   `Area`: Weapon Range/Size × Area Multiplier.
### 5.5 Spawning System
Enemies spawn dynamically based on camera position and game time.
-   **Placement**: Enemies spawn just outside the visible camera view (viewport edge + 50px margin).
-   **Rate Scaling**:
    -   Spawn rate increases linearly over time: `Rate = Base * (1 + Time / 60s)`.
    -   Starts at 1 enemy/sec, caps at 10 enemies/sec.
    -   Global hard cap of 500 active enemies.
-   **Selection Logic**: Weighted random selection (no time-gating in current build).
    -   *Common*: Basic (Weight 100), Fast (Weight 40).
    -   *Uncommon*: Ranger (Weight 30), Tank (Weight 20), Swarm (Weight 15).

---

## 6. User Interface (UI)

### 6.1 HUD (Heads-Up Display)
-   **Top Left**: Performance stats (FPS) & Debug info (if enabled).
-   **Top Center**: Health Bar (Green/Red) & Experience Bar (Cyan).
-   **Bottom Left**: Kill Count & Survival Time.
-   **Right Side**: "Stats Panel" showing current attributes (SPD, DMG, CD).
-   **Inventory Slots**:
    -   Visual indicators for 6 Weapon slots and 6 Passive slots.
    -   Displays specific **Symbol** and **Color** for each equipped item.
    -   Empty slots shown as gray outlines.

### 6.2 Debug Menu
-   **Access**: Click "DEBUG" button in bottom-left corner.
-   **Tabs**:
    -   *Weapons*: Add or Level Up any weapon instantly.
    -   *Passives*: Add or Level Up any passive item.
    -   *Cheats*: God Mode, Inject XP, Instant Level Up, Kill All Enemies, Full Heal.
-   **Features**: Scrollable lists, real-time stat tracking.

### 6.3 Game Screens
-   **Title Screen**:
    -   Displays "BREACH PROTOCOL" logo with glow effect.
    -   Prompt: "PRESS SPACE TO START".
    -   Controls hint overlay.
    -   Debug menu accessible for pre-game setup.
-   **Pause Overlay**:
    -   Semi-transparent black overlay.
    -   Displays current Level and Time.
    -   Options to RESUME (`ESC`) or RESTART (`R`).
    -   Renders the frozen game state behind the UI.
-   **Game Over**:
    -   Red-tinted death screen.
    -   Final Stats Box: Level Reached, Total Time, Enemies Killed.
    -   Options: RESTART (`R`) or RETURN TO TITLE (`SPACE`).

---

## 7. Technical Architecture

### 7.1 Codebase Structure
The project follows a modular ES6 architecture with a clear separation of concerns, avoiding monolithic classes.
-   **`core/`**: Essential engine components (`GameLoop`, `Camera`, `GameState`).
-   **`systems/`**: Managers that handle specific logic domains (`WeaponSystem`, `SpawnSystem`, `CollisionSystem`).
-   **`entities/`**: Game objects with state and update methods (`Player`, `Enemy`, `Projectile`).
-   **`config/`**: Data-driven design files separating values from logic.
-   **`renderers/`**: Visual layer decoupled from game logic (`ASCIIRenderer`).

### 7.2 Game Loop & State
-   **Loop**: `GameLoop.js` uses `requestAnimationFrame` to target 60 FPS.
-   **Delta Time**: All movement and timers are multiplied by `deltaTime` (seconds) to ensure frame-rate independence.
-   **State Management**: `GameState` (enumerated in `core/GameState.js`) controls the flow (Title -> Playing -> Paused -> GameOver).
-   **Pause System**: The loop continues running when paused to handle UI rendering, but game logic updates are skipped.

### 7.3 Configuration System
Use of "Magic Numbers" is strictly avoided. All gameplay values are centralized in `js/config/`:
-   **`GameConfig.js`**: Application constants (Canvas size, Colors, FPS), Base stats (Player speed), and ASCII mappings.
-   **`WeaponConfig.js`**: Definitions for all 7 weapon types (stats, behaviors, visuals).
-   **`EnemyConfig.js`**: Definitions for all 5 enemy types (AI behavior, spawn weights, stats).
-   **`UpgradeConfig.js`**: Logic for generating level-up choices.
-   **`PassiveConfig.js`**: Definitions for all passive item stat boosters.
