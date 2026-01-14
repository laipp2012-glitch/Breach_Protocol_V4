# Balance Changes - Instructions

**Purpose:** Fix critical balance issues in current build before implementing wave spawning.
**Estimated Time:** 30-45 minutes

---

## 1. ENEMY SPAWNING

### File: `js/config/EnemyConfig.js` (or wherever spawn rate is defined)

**Change: Increase Base Spawn Rate**
```
OLD: Base Rate = 1 enemy/sec
NEW: Base Rate = 2 enemies/sec

OLD: Max Rate = 10 enemies/sec  
NEW: Max Rate = 8 enemies/sec
```

**Rationale:** Current rate is too slow early game, too fast late game. Players need more enemies to level up faster and feel progression.

---

## 2. ENEMY STATS

### File: `js/config/EnemyConfig.js`

**Change 1: Reduce Tank HP**
```
OLD: Tank HP = 50
NEW: Tank HP = 35
```

**Rationale:** Tanks spawn from minute 0 but are unkillable bullet sponges early game. Reducing to 35 keeps them tanky (3.5x basic enemy) but killable.

**Change 2: Reduce Swarm XP Value**
```
OLD: Swarm base XP = 8
NEW: Swarm base XP = 3

(Minis remain 1 XP each, so total = 3 + 6 = 9 XP)
```

**Rationale:** Swarm currently gives 14x more XP than basic enemy, breaking progression curve. New value gives 9x (still rewarding, but balanced).

---

## 3. WEAPON BALANCE

### File: `js/config/WeaponConfig.js`

**Change: Buff Garlic Damage & Cooldown**

```
OLD Damage Scaling: 2 → 3 → 4 → 5 → 6 → 7 → 8 → 8
NEW Damage Scaling: 3 → 5 → 7 → 9 → 11 → 12 → 12 → 12

OLD Cooldown: 0.5s
NEW Cooldown: 0.4s
```

**Rationale:** 
- Garlic currently has worst DPS of all weapons (4 DPS → 16 DPS)
- New values give it competitive DPS (7.5 DPS → 30 DPS)
- Makes it a viable early-game defensive option

---

## 4. XP CURVE

### File: `js/systems/LevelSystem.js` (or wherever XP requirements are calculated)

**Change: Gentler XP Curve**
```
OLD Formula: XP_Required = 5 * (1.3 ^ Level)
NEW Formula: XP_Required = 4 * (1.25 ^ Level)
```

**Example Changes:**
| Level | Old XP | New XP |
|-------|--------|--------|
| 2 | 8 | 5 |
| 5 | 18 | 12 |
| 10 | 68 | 36 |
| 15 | 378 | 136 |
| 20 | 952 | 518 |

**Rationale:** Current curve is too steep. Players need to level faster to feel powerful and access weapon upgrades. This keeps late-game scaling but smooths early progression.

---

## SUMMARY OF CHANGES

| System | Parameter | Old → New | Impact |
|--------|-----------|-----------|--------|
| **Spawning** | Base Rate | 1/sec → 2/sec | More enemies early |
| **Spawning** | Max Rate | 10/sec → 8/sec | Less overwhelming late |
| **Enemy** | Tank HP | 50 → 35 | Killable early game |
| **Enemy** | Swarm XP | 8 → 3 | Balanced progression |
| **Weapon** | Garlic Damage | 2→8 → 3→12 | Competitive DPS |
| **Weapon** | Garlic Cooldown | 0.5s → 0.4s | Better feel |
| **Progression** | XP Formula | 5*(1.3^L) → 4*(1.25^L) | Faster leveling |

---

## AFTER IMPLEMENTATION

Test for 10-15 minutes and check:
- [ ] Can you reach Level 5 by 1:00 mark?
- [ ] Does Garlic feel useful?
- [ ] Are Tanks killable with Level 1 weapons?
- [ ] Can you survive past 5:00 without feeling overwhelmed?

**Next Step:** Implement wave-based spawn system (see separate file).
