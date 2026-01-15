# Breach Protocol - Game Design Document

**Version:** 2.0 (Extraction Update)
**Target Platform:** Web Browser (HTML5/Canvas)
**Genre:** Survival Extraction Roguelike
**Visual Style:** Retro Cyberpunk ASCII

---

## 1. Game Overview

**Breach Protocol** is a high-stakes survival extraction game. You are a rogue process in a hostile mainframe. Your goal is not just to survive, but to secure data (Gold) and get out before the system purges you.

### Core Loop
1.  **PREPARE**: Choose your loadout (Weapon + Passive) at the Hub.
2.  **SURVIVE**: Enter the mainframe. Survive waves of viral enemies.
3.  **COLLECT**: Gather dropped Data Gems (XP) to power up mid-run.
4.  **EXTRACT**: Locate a temporary extraction signal (Exit) and escape.
5.  **PROFIT**: Secure your earnings (Gold) to unlock permanent upgrades (TBD).

**Win Condition:** Successful extraction.
**Loss Condition:** Death (Loss of collected Gold).

---

## 2. Gameplay Mechanics

### 2.1 Extraction System
The core tension of the game comes from timed opportunities.
*   **Extraction Zones:** Green pulsing "Exit" zones spawn at specific time intervals (e.g., 2:00, 3:30, 5:00).
*   **Timed Windows:** Extraction signals are unstable. Each zone is active for only **45 seconds** before despawning.
*   **Spawn Logic:** Signals originate from unstable sectors **far from the player's current position**, forcing traversal across the map.
*   **Extraction Logic:** Standing in the zone and pressing the interaction key (`E`) triggers extraction.
*   **Risk/Reward:** Staying for later windows increases difficulty (enemy density) but offers higher potential Gold rewards.

### 2.2 Player Character
-   **Movement**: 8-directional movement (WASD/Arrows).
-   **Auto-Attack**: Weapons fire automatically.
-   **Stats**:
    -   *Max Health*: 100 base.
    -   *Speed*: 140 pixels/sec base.
    -   *Pickup Radius*: Magnetic range for XP gems.
    -   *Invulnerability*: 1.0s buffer after taking damage.

### 2.3 Combat System (Auto-Battler)
-   **Collision**: Touching enemies deals damage to the player.
-   **Damage Numbers**: Visual feedback for damage dealt.
-   **Hit Effects**: Enemies flash and pulse when hit.

### 2.4 Progression (In-Run)
-   **XP Gems**: Enemies drop data on death. Collection boosts the XP bar.
-   **Level Up**: 3 random choices (Weapon or Passive) upon filling the bar.
-   **Build Crafting**: Combine weapons and passives for synergy during a single run.

---

## 3. User Interface

### 3.1 HUD (Heads-Up Display)
-   **Top Left**: Performance stats (FPS) & Debug info (if enabled).
-   **Top Center**: Health Bar (Green/Red) & Experience Bar (Cyan).
-   **Bottom Left**: Kill Count & Survival Time.
-   **Extraction Alerts**:
    -   **Timer**: Countdown timer (45s) when an extraction window is active.
    -   **Coordinates**: On-screen display (X, Y) pointing to the distant extraction signal.
    -   **Notification**: "SIGNAL ACQUIRED" message on spawn.
-   **Right Side**: "Stats Panel" showing current attributes (SPD, DMG, CD).
-   **Inventory Slots**:
    -   Visual indicators for 6 Weapon slots and 6 Passive slots.
    -   Displays specific **Symbol** and **Color** for each equipped item.
    -   Empty slots shown as gray outlines.

### 3.2 Debug Menu
-   **Access**: Click "DEBUG" button in bottom-left corner.
-   **Tabs**:
    -   *Weapons*: Add or Level Up any weapon instantly.
    -   *Passives*: Add or Level Up any passive item.
    -   *Cheats*: God Mode, Inject XP, Instant Level Up, Kill All Enemies, Full Heal.
-   **Features**: Scrollable lists, real-time stat tracking.

### 3.3 Game Screens
-   **Title Screen**: Start prompt and controls.
-   **Pause Overlay**: Frozen game state with Resume/Restart options.
-   **Rewards Screen**: "Mission Report" styling showing Gold earned, Kills, and Time.
-   **Storage**: View accumulated Gold and lifetime stats (Kills, Playtime).
-   **Wipe Save**: Reset all progress.

---

## 4. Meta-Game & Economy

### 4.1 Hub (Command Center)
A safe menu screen between runs.
-   **Start Mission**: Begin a new run.
-   **Loadout**: Select starting equipment (Weapon + Passive) for the next run.
-   **Storage**: View accumulated Gold and lifetime stats (Kills, Playtime).
-   **Wipe Save**: Reset all progress.

### 4.2 Economy (Gold)
-   **Earning**: Gold is awarded ONLY upon successful extraction.
-   **Calculation**: Based on time thresholds (e.g., Early Exit = Low Payout, Late Exit = High Payout).
-   **Spending**: (Future Feature) Purchase permanent upgrades or unlock new loadout options.

---

## 5. Arsenal (Weapons)

### 4.1 Magic Wand
-   **Type**: Projectile
-   **Behavior**: Fires magic projectiles at the nearest enemy.
-   **Visual**: Symbol `¡` (Blue `#8888ff`).

### 4.2 Knife
-   **Type**: Directional Projectile
-   **Behavior**: Fires fast projectiles in movement direction.
-   **Visual**: Symbol `†` (Silver `#cccccc`).

### 4.3 Garlic
-   **Type**: Area of Effect (AoE)
-   **Behavior**: Creates a damaging field around the player.
-   **Visual**: Symbol `○` (Yellow `#ffff00`).

### 4.4 Orbiting Shield
-   **Type**: Orbit
-   **Behavior**: Deploys defensive drones that circle the player.
-   **Visual**: Symbol `♦` (Cyan `#00ffff`).

### 4.5 Scatter Shot
-   **Type**: Spread Projectile
-   **Behavior**: Fires a shotgun-like blast of projectiles.
-   **Visual**: Symbol `░` (Red `#ff8888`).

### 4.6 Magic Missile (Seeker)
-   **Type**: Tracking Projectile
-   **Behavior**: Fires missiles that actively steer toward targets.
-   **Visual**: Symbol `»` (Magenta `#ff00ff`).

### 4.7 Proximity Mine
-   **Type**: Deployable
-   **Behavior**: Stationary mines that explode on contact.
-   **Visual**: Symbol `x` (Green `#00ff00`).

---

### 4.8 Passive Items
Passive items provide stat boosts that persist for the entire run.
-   **Damage Amp** (`+`): Increases damage multiplier.
-   **Wings** (`^`): Increases movement speed.
-   **Magnet** (`U`): Increases pickup radius.
-   **Vigor** (`H`): Increases maximum health.
-   **Cooldown** (`C`): Reduces weapon cooldowns.
-   **Armor** (`#`): Reduces damage taken.
-   **Greed** (`$`): Increases XP multiplier.
-   **Luck** (`%`): Increases luck chance (affects critical hits, drops).
-   **Regeneration** (`&`): Auto-repairs health over time.
-   **Area** (`O`): Increases weapon AoE size.
-   **Duration** (`T`): Increases weapon effect duration.

---

## 6. Bestiary (Enemies)

Enemies spawn endlessly at the edges of the screen.

| Type | Name | Symbol | Color | Behavior |
|------|------|--------|-------|----------|
| **Basic** | *Glitch* | `E` | Red | Standard fodder. Chases player. |
| **Fast** | *Trojan* | `F` | Orange | Fast but weak. Rushes the player. |
| **Tank** | *Firewall* | `T` | Dark Red | Slow, high health. Meat shield. |
| **Ranger** | *Sniper* | `R` | Orange | Maintains distance and fires projectiles. |
| **Swarm** | *Cluster* | `S` | Purple | Spawns mini-swarmers (`s`) on death. |

---

## 7. Technical Architecture

### 6.1 State Management (`Game.js` State Machine)
-   **PROFILE_CREATION**: First-time setup.
-   **HUB**: Main menu / Meta-game loop.
-   **LOADOUT**: Pre-run preparation.
-   **PLAYING**: Core gameplay loop.
-   **PAUSED**: Suspended state.
-   **REWARDS**: End-of-run summary (Win/Loss).
-   **GAME_OVER**: (Legacy/Merged with Rewards).

### 6.2 Configuration
Gameplay values are centralized in `js/config/` for tuning without code changes.
-   `GameConfig.js`: Global settings.
-   `WeaponConfig.js`: Weapon stats.
-   `EnemyConfig.js`: Enemy behaviors.

### 6.3 Input Handling
Supports both Keyboard (WASD/Arrows + Space/E) and Mouse (Menu interaction) controls.
