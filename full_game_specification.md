# Breach Protocol v1.1 - Technical Specification & Balance

> **Version:** 1.1 (Hybrid Wave Update)
> **Generated:** 2026-01-14

---

## 1. Spawn System Mechanics

The game utilizes a **Hybrid Spawn System** to create pacing peaks and troughs.

### Wave Spawning (The Hordes)
Primary threat mechanic. Enemies spawn in coordinated groups from cardinal directions off-screen.

| Phase Duration | Wave Interval | Enemies per Wave | Direction Count |
|----------------|---------------|------------------|-----------------|
| **00:00 - 03:00** | 10 seconds | 12 - 18 | 2 - 3 |
| **03:00 - 06:00** | 8 seconds | 18 - 25 | 2 - 4 |
| **06:00 - 10:00** | 6 seconds | 25 - 35 | 3 - 4 |
| **10:00 - ∞** | 5 seconds | 35 - 50 | 4 (Surrounded) |

**Logic:**
- Directions (Top/Bottom/Left/Right) are chosen randomly per wave.
- Enemies are distributed evenly along the spawn edge to form lines.
- **Hard Cap**: 500 Enemies max. Tuning stops if cap is hit.

### Continuous Spawning (The Trickle)
Secondary mechanic to keep action flowing between waves.
- **Rate**: ~1.5 enemies / second (0.7s interval).
- **Position**: Random edge position.
- **Purpose**: Keeps "on-kill" effects active and provides steady XP drip.

---

## 2. Global Balance Stats

### Player Character
| Stat | Base Value |
|------|------------|
| **HP** | 100 |
| **Speed** | 140 px/s |
| **Pickup Radius** | 14 px (Collision) |
| **Invincibility** | 1.0s (After hit) |

### XP & Leveling
Exponential curve designed for fast start, steady mid-game.
- **Formula**: `XP = 4 * (1.25 ^ Level)`
- **Milestones**:
  - Lv 2: 5 XP
  - Lv 5: 12 XP
  - Lv 10: 36 XP
  - Lv 20: 518 XP

---

### 3. Bestiary (Enemy Data)

| Enemy ID | HP | Dmg | Speed | XP | Spawn Start | Role |
|----------|----|-----|-------|----|-------------|------|
| **Basic** | 10 | 5 | 70 | 1 | 0:00 | Crowd Filler |
| **Fast** | 5 | 3 | 90 | 2 | 0:00 | Rusher |
| **Ranger** | 8 | 5 | 60 | 4 | 2:00 | Ranged Poker (Range: 400) |
| **Tank** | 35 | 15 | 40 | 5 | 4:00 | Meat Shield |
| **Swarm** | 15 | 8 | 50 | 3 | 7:00 | Cluster Spawner |
| *Mini* | 3 | 3 | 70 | 1 | N/A | Swarm Token |

---

## 4. Arsenal (Weapons)

### Offensive
| Weapon | Damage | CD | Count | Special |
|--------|--------|----|-------|---------|
| **Magic Wand** | 3 -> 22 | 1.0s | 1 -> 4 | Nearest Target |
| **Knife** | 4 -> 26 | 0.66s | 1 -> 4 | Directional / Pierce |
| **Scatter** | 3 -> 12 | 1.2s | 3 -> 6 | Cone Spread |
| **Seeker** | 3 -> 12 | 1.1s | 1 -> 4 | Homing Missile |

### Defensive / Zone
| Weapon | Damage | CD | Area | Special |
|--------|--------|----|------|---------|
| **Garlic** | 3 -> 12 | 0.4s | 60 -> 100 | Local KB / Aura |
| **Orbit** | 7 -> 18 | Cont. | 80 (Orb) | Rotating Shield |
| **Mine** | 11 -> 70 | 2.0s | 60 (Blast) | Proximity Trap |

---

## 5. Development Notes
- **Garlic Buff (v1.1)**: Cooldown greatly reduced (0.5 -> 0.4) and base damage increased to make it viable.
- **Tank Nerf (v1.1)**: HP reduced to 35 to prevent early game stat-check walls.
