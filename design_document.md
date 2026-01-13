# Breach Protocol - Game Design Document

**Version:** 0.5 (Draft)
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
-   **Auto-Attack**: Weapons fire automatically at nearest enemies or in specific patterns.
-   **Stats**:
    -   *Max Health*: 100 base.
    -   *Speed*: 140 pixels/sec base.
    -   *Pickup Radius*: Magnetic range for XP gems.
    -   *Invulnerability*: 1.0s buffer after taking damage.

### 2.2 Combat System
The game utilizes an auto-battler system where the player focuses solely on positioning.
-   **Collision**: Touching enemies deals damage to the player.
-   **Damage Numbers**: Visual feedback for damage dealt to enemies (White = Standard, Green = Aura).
-   **Hit Effects**: Enemies flash and pulse when hit.

### 2.3 Progression (Leveling)
-   Enemies drop **XP Gems** (Pickups) on death.
-   Collecting XP fills the experience bar.
-   **Level Up**: Pauses the game and presents 3 random upgrade choices.
-   **Choices**: Can be a new weapon, a weapon upgrade, or a passive stat boost.

---

## 3. Arsenal (Weapons)

### 3.1 Magic Wand (Starter)
-   **Type**: Projectile
-   **Behavior**: Fires a projectile at the nearest enemy.
-   **Stats**: Moderate damage, single target (initial), auto-aim.
-   **Visual**: ASCII character `*` projectile.

### 3.2 Garlic Aura
-   **Type**: Area of Effect (AoE)
-   **Behavior**: Creates a damaging field around the player.
-   **Effect**: Damages all enemies within range every 0.5 seconds.
-   **Visual**: pulsing green circle + scaling pulse on hit enemies.
-   **Best For**: Crowd control and defense against weak swarms.

### 3.3 Knife
-   **Type**: Directional Projectile
-   **Behavior**: Fires fast projectiles in the player's movement direction.
-   **Special**: If standing still, targets the nearest enemy.
-   **Stats**: High speed, pierces 1 enemy.
-   **Visual**: ASCII character `|` or `-` (simulated).

---

## 4. Bestiary (Enemies)

Enemies spawn endlessly at the edges of the screen and track the player.

| Type | Name | Symbol | Stats | Behavior |
|------|------|--------|-------|----------|
| **Basic** | *Glitch* | `x` | HP: 10, Spd: 70 | Standard fodder. Spawns in groups. |
| **Fast** | *Trojan* | `>` | HP: 5, Spd: 90 | fast but weak. Rushes the player. |
| **Tank** | *Firewall* | `#` | HP: 25, Spd: 40 | Slow, high health. Acts as a meat shield. |

---

## 5. Game Systems

### 5.1 Juice & Feedback (Visuals)
-   **Particles**: ASCII particles explode from killed enemies.
-   **Screen Shake**: Impact feedback for heavy hits.
-   **Flash**: Enemies flash white (`filter: brightness`) when damaged.
-   **Scale Pulse**: Enemies expand slightly when hit.
-   **Floating Text**: Damage numbers pop up and float away.

### 5.2 World & Camera
-   **Map**: 4000x4000 pixel virtual scrolling world.
-   **Camera**: Smoothly follows the player with a lerp factor.
-   **Boundaries**: Soft boundaries keep the player within the digital arena.

### 5.3 Technical
-   **Spatial Hashing**: Optimizes collision detection for hundreds of entities.
-   **Object Pooling**: Reuses projectile and particle objects to prevent GC stutters.
-   **Culling**: Entities off-screen are not rendered to save cycles.

---

## 6. User Interface (UI)

### 6.1 HUD (Heads-Up Display)
-   **Top Left**: Health Bar (Red) & Numeric HP.
-   **Top Right**: Kill Count & Timer.
-   **Top Center**: XP Bar (Blue).
-   **Bottom Left**: Current Level.

### 6.2 Menus (Planned/In-Progress)
-   **Title Screen**: Retro "BREACH PROTOCOL" logo, "Press Start".
-   **Pause Overlay**: Semi-transparent dark overlay with stats.
-   **Game Over**: Summary of survival time, level reached, and kills. Restart option.

---

## 7. Controls
| Action | Keyboard |
|--------|----------|
| **Move** | `W` `A` `S` `D` or Arrow Keys |
| **Pause** | `ESC` |
| **Confirm** | `SPACE` or `ENTER` |
| **Select Upgrade** | `1`, `2`, `3` or Mouse Click |
| **Restart** | `R` (on Game Over) |

---

## 8. Development Roadmap

### Immediate Next Steps
- [ ] Complete UI integration (Title, Pause, Game Over).
- [ ] Implement sound effects (Web Audio API).

### Future Considerations
- [ ] **Weapon Evolution**: Combine max-level weapons with passives for "Evolved" forms.
- [ ] **Boss Battles**: Large, unique enemies every 5 or 10 minutes.
- [ ] **Meta-Progression**: Persistent currency to buy permanent upgrades between runs.
- [ ] **Sprite Mode**: Toggle to switch from ASCII to Sprite graphics.
