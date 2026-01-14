# Breach Protocol - Game Balance Document

> **Generated on:** 2026-01-14
> **Context:** Comprehensive reference for all game balance values, stats, and formulas.

## 1. Player Character

### Base Attributes
| Stat | Value | Notes |
|------|-------|-------|
| **Max Health** | `100` | Base HP without upgrades |
| **Speed** | `140 px/sec` | Movement speed |
| **Pickup Radius** | `14 px` | Magnetic range for gems (Collision: 14) |
| **Invulnerability** | `1.0 sec` | Buffer after taking damage |

---

## 2. Progression & Leveling

### XP Curve
- **Formula**: `XP_Required = 4 * (1.25 ^ Level)`
- **Scaling**: Each level requires 25% more XP than the last.
- **Reference Table**:
  - Lv 1: `5 XP`
  - Lv 2: `6 XP`
  - Lv 5: `12 XP`
  - Lv 10: `36 XP`
  - Lv 20: `518 XP`

### Drops
- **Small Gem (`$`)**: 1 XP (Basic Enemies)
- **Large Gem (`◆`)**: 10 XP (Bosses/Elites - not yet fully implemented)

---

## 3. Arsenal (Weapons)

All weapons have a max level of **8**.

### Projectile Weapons

| Weapon | Damage | Cooldown | Count | Range/Area | Pierce | Speed | Special |
|--------|--------|----------|-------|------------|--------|-------|---------|
| **Magic Wand** | 3 → 22 | 1.0s | 1 → 4 | 400 | 0 | 300 | Targets nearest. Lv8: -Cooldown. |
| **Throwing Knife** | 4 → 26 | 0.66s | 1 → 4 | 300 | 1 | 500  | Directional (Movement). Lv8: +Pierce. |
| **Scatter Shot** | 3 → 12 | 1.2s | 3 → 6 | 300 | 0 | 400 | Cone Spread (45° → 60°). Lv8: +Count. |
| **Magic Missile** | 3 → 12 | 1.1s | 1 → 4 | 450 | 0 | 250 | Homing. Spread (60°). Lv8: +TurnSpeed. |

### Area / Defense Weapons

| Weapon | Damage | Cooldown | Count | Range/Area | Duration | Special |
|--------|--------|----------|-------|------------|----------|---------|
| **Garlic Aura** | 3 → 12 | 0.4s | N/A | 60 → 100 | N/A | Local AoE. Knockback. Lv8: +Area. |
| **Orbit Shield** | 7 → 18 | Continuous | 1 → 4 | 80 (Orbit) | N/A | Rotates around player. Lv8: +Speed. |
| **Proximity Mine** | 11 → 70 | 2.0s | 1 → 1 | 60 (Blast) | 8.0s | Arm delay 0.3s. Lv8: +Duration. |

---

## 4. Passive Items

All passive items have a max level of **5**.

| Item | Symbol | Effect per Level | Max Effect |
|------|:------:|------------------|------------|
| **Damage Amp** | `+` | +10% Damage | +50% Damage |
| **Wings** | `^` | +10% Speed | +50% Speed |
| **Magnet** | `U` | +20px Pickup Radius | +100px Radius |
| **Vigor** | `H` | +20 Max Health | +100 HP |
| **Cooldown** | `C` | -8% Cooldown | -40% Cooldown |
| **Armor** | `#` | -1 Damage Taken | -5 Damage |
| **Greed** | `$` | +10% XP Gain | +50% XP |
| **Luck** | `%` | +5% Luck | +25% Luck |
| **Regeneration** | `&` | +0.5 HP/sec | +2.5 HP/sec |
| **Area** | `O` | +10% Area Size | +50% Size |
| **Duration** | `T` | +10% Duration | +50% Duration |

---

## 5. Beastieary (Enemies)

### Enemy Stats

| Type | Health | Damage | Speed | XP Value | Spawn Weight | Notes |
|------|--------|--------|-------|----------|--------------|-------|
| **Basic** | 10 | 5 | 70 | 1 | 100 | Standard fodder |
| **Fast** | 5 | 3 | 90 | 2 | 40 | Rushes player |
| **Ranger** | 8 | 5 | 60 | 4 | 30 | Shoots from distance (400px range) |
| **Tank** | 35 | 15 | 40 | 5 | 20 | High HP, Dark Red |
| **Swarm** | 15 | 8 | 50 | 3 | 15 | Spawns 6 Minis on death |
| *Swarm Mini* | 3 | 3 | 70 | 1 | N/A | Spawned by Swarm |

### Selection Odds
Based on relative weights:
- **Common (~49%)**: Basic
- **Uncommon (~20%)**: Fast
- **Uncommon (~15%)**: Ranger
- **Rare (~10%)**: Tank
- **Rare (~7%)**: Swarm

---

## 6. Difficulty & Spawning

## 6. Spawn System & Difficulty

The game uses a **Hybrid Spawn System** combining massive waves with continuous pressure.

### Primary: Wave Logic
Large groups of enemies spawn simultaneously from multiple screen edges.

| Phase (Time) | Wave Interval | Wave Size (Avg) | Directions | Notes |
|--------------|:|:|:|---|
| **0 - 3 min** | Every 10s | ~15 Enemies | 2-3 sides | Early pressure, easy to kite |
| **3 - 6 min** | Every 8s | ~22 Enemies | 2-4 sides | Ramping up, distinct hordes |
| **6 - 10 min** | Every 6s | ~30 Enemies | 3-4 sides | High intensity, constant movement needed |
| **10+ min** | Every 5s | ~45 Enemies | 4 sides | "Sudden Death" pacing |

*Note: Waves will spawn fewer enemies if the global cap (500) is reached.*

### Secondary: Continuous Pressure
- **Rate**: ~1.5 enemies/sec (Every 0.7s)
- **Behavior**: Spawns 1 enemy at a random edge between waves.
- **Purpose**: Prevents "empty" feeling between waves and maintains combo potential.

### Caps
- **Hard Cap**: `500 Enemies` (Performance limit)
- **Spawn Margin**: `50px` outside camera view (Spawned off-screen)
