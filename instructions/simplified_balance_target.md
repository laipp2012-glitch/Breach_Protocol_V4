# Breach Protocol v1.2 - Simplified Balance (Target State)

> **Version:** 1.2 (Extraction Prototype)
> **Purpose:** Minimum viable extraction loop testing
> **Run Duration:** 5 minutes target

---

## Core Philosophy

**Design Goal:** Test extraction mechanics with simple, balanced VS combat.

**Not Included:**
- Complex synergies
- 30-minute scaling
- Boss fights (yet)
- Meta-progression (yet)

---

## 1. Player Base Stats

| Stat | Value | Notes |
|------|-------|-------|
| **Max Health** | 100 | +30/+60/+100 with Vigor |
| **Speed** | 140 px/s | +21/+42/+70 with Wings |
| **Pickup Radius** | 14 px | +30/+60/+100 with Magnet |
| **Invulnerability** | 1.0 sec | After taking damage |

---

## 2. Progression System

### XP Curve
**Formula:** `XP = 4 * (1.25 ^ Level)`

**Key Milestones:**
| Level | XP Required | Cumulative |
|-------|-------------|------------|
| 2 | 5 | 5 |
| 5 | 12 | 45 |
| 10 | 36 | 232 |
| 15 | 136 | 1,009 |
| 18 | 260 | 1,851 |

**Expected Levels:**
- 2:00 mark → Level 8-10
- 3:30 mark → Level 12-15
- 5:00 mark → Level 15-18

### XP Drops
- Basic enemy: 1 XP
- Fast enemy: 2 XP
- Ranger enemy: 4 XP

---

## 3. Enemy Roster (SIMPLIFIED)

### Active Enemies (3 Types)

| Type | HP | Damage | Speed | XP | Behavior |
|------|----|----|-------|----|----|
| **Basic (E)** | 10 | 5 | 50 | 1 | Chases player |
| **Fast (F)** | 5 | 3 | 70 | 2 | Rushes player |
| **Ranger (R)** | 8 | 5 | 50 | 4 | Maintains 400px distance, shoots |

**Spawn Weights:**
- Basic: 100 (Highest)
- Fast: 40 (Common)
- Ranger: 30 (Uncommon)

### Disabled Enemies (Saved for Later)

| Type | Status | Reason |
|------|--------|--------|
| **Tank (T)** | Disabled | Too tanky for 5-min runs |
| **Swarm (S)** | Disabled | Too complex for prototype |

*These can be re-enabled after extraction mechanics are proven.*

---

## 4. Spawn System

### Wave Spawning

**EARLY PHASE (0:00 - 2:30):**
- Wave interval: 15 seconds
- Enemies per wave: 10
- Spawn directions: 2 (random sides)
- Between waves: 1 enemy/second

**LATE PHASE (2:30 - 5:00):**
- Wave interval: 12 seconds
- Enemies per wave: 15
- Spawn directions: 3 (random sides)
- Between waves: 1 enemy/second

### Enemy Type Distribution by Time

| Time Range | Enemy Types Available |
|------------|-----------------------|
| 0:00 - 1:30 | Basic only |
| 1:30 - 3:00 | Basic (70%) + Fast (30%) |
| 3:00 - 5:00 | Basic (50%) + Fast (30%) + Ranger (20%) |

**Hard Cap:** 500 active enemies maximum

---

## 5. Weapon Arsenal (4 Levels Each)

### Projectile Weapons

**Magic Wand**
| Level | Damage | Cooldown | Count | Range |
|-------|--------|----------|-------|-------|
| 1 | 3 | 1.0s | 1 | 400 |
| 2 | 7 | 1.0s | 2 | 400 |
| 3 | 13 | 1.0s | 3 | 400 |
| 4 | 22 | 0.9s | 4 | 400 |

*Targets nearest enemy automatically*

---

**Throwing Knife**
| Level | Damage | Cooldown | Count | Pierce |
|-------|--------|----------|-------|--------|
| 1 | 4 | 0.66s | 1 | 1 |
| 2 | 10 | 0.66s | 2 | 1 |
| 3 | 18 | 0.66s | 3 | 1 |
| 4 | 26 | 0.66s | 4 | 2 |

*Fires in movement direction*

---

**Scatter Shot**
| Level | Damage | Cooldown | Count | Spread |
|-------|--------|----------|-------|--------|
| 1 | 3 | 1.2s | 3 | 45° |
| 2 | 6 | 1.2s | 4 | 50° |
| 3 | 9 | 1.2s | 5 | 55° |
| 4 | 12 | 1.2s | 6 | 60° |

*Cone spread pattern*

---

**Magic Missile (Seeker)**
| Level | Damage | Cooldown | Count | Turn Speed |
|-------|--------|----------|-------|------------|
| 1 | 3 | 1.1s | 1 | 0.05 |
| 2 | 6 | 1.1s | 2 | 0.05 |
| 3 | 9 | 1.1s | 3 | 0.05 |
| 4 | 12 | 1.1s | 4 | 0.08 |

*Homing missiles*

---

### Zone Control Weapons

**Garlic Aura**
| Level | Damage | Cooldown | Area |
|-------|--------|----------|------|
| 1 | 3 | 0.4s | 60 |
| 2 | 6 | 0.4s | 75 |
| 3 | 9 | 0.4s | 90 |
| 4 | 12 | 0.4s | 100 |

*Constant damage field around player*

---

**Orbiting Shield**
| Level | Damage | Count | Orbit Radius | Rotation Speed |
|-------|--------|-------|--------------|----------------|
| 1 | 7 | 1 | 80 | 1.0 |
| 2 | 11 | 2 | 80 | 1.0 |
| 3 | 15 | 3 | 80 | 1.0 |
| 4 | 18 | 4 | 80 | 1.3 |

*Defensive orbs rotating around player*

---

**Proximity Mine**
| Level | Damage | Cooldown | Blast Radius | Duration |
|-------|--------|----------|--------------|----------|
| 1 | 11 | 2.0s | 60 | 8s |
| 2 | 28 | 2.0s | 60 | 8s |
| 3 | 49 | 2.0s | 60 | 8s |
| 4 | 70 | 2.0s | 60 | 10s |

*Stationary traps*

---

## 6. Passive Items (3 Levels Each)

| Passive | Symbol | L1 | L2 | L3 | Total Bonus |
|---------|:------:|----|----|----|-------------|
| **Damage Amp** | `+` | +15% | +30% | +50% | +50% Damage |
| **Wings** | `^` | +15% | +30% | +50% | +70 Speed |
| **Magnet** | `U` | +30px | +60px | +100px | +100px Radius |
| **Vigor** | `H` | +30 | +60 | +100 | +100 Max HP |
| **Cooldown** | `C` | -12% | -24% | -40% | -40% Cooldown |
| **Armor** | `#` | -1 | -3 | -5 | -5 Damage Taken |
| **Greed** | `$` | +15% | +30% | +50% | +50% XP |
| **Area** | `O` | +15% | +30% | +50% | +50% Area |

**Optional Passives (Consider Cutting):**
- Luck (%) - Not fully implemented
- Regeneration (&) - Breaks difficulty curve
- Duration (T) - Only affects Mines

---

## 7. Expected Run Progression

### 0:00 - 1:30 (Learning Phase)
- **Enemies:** Basic only
- **Expected Level:** 1-6
- **Feel:** Calm, tutorial-like
- **Goals:** Learn controls, get first weapons

### 1:30 - 2:30 (Ramp Up)
- **Enemies:** Basic + Fast
- **Expected Level:** 6-10
- **Feel:** Increasing pressure
- **Goals:** Build weapon synergies

### 2:30 - 3:30 (First Challenge)
- **Enemies:** Basic + Fast + Ranger
- **Expected Level:** 10-13
- **Wave intensity increases**
- **Feel:** Tense but manageable
- **Extraction point available at 2:00**

### 3:30 - 5:00 (Peak Difficulty)
- **Enemies:** Full mix with higher density
- **Expected Level:** 13-18
- **Feel:** Chaotic but powerful
- **Extraction points at 3:30 and 5:00**

### 5:00+ (Beyond Extraction)
- Only for testing/fun
- Not balanced for extended play
- Player should feel godlike or die

---

## 8. Balance Testing Targets

### Power Curve Checks

**At 2:00 mark:**
- Level: 8-10
- Weapons owned: 3-4
- Weapons maxed: 0-1
- Can clear Basic enemies easily
- Fast enemies are challenge
- Should consider extracting (safe)

**At 3:30 mark:**
- Level: 12-15
- Weapons owned: 4-5
- Weapons maxed: 1-2
- Rangers are manageable
- Waves create tension
- Risk/reward decision point

**At 5:00 mark:**
- Level: 15-18
- Weapons owned: 5-6
- Weapons maxed: 2-3
- Feeling powerful
- Surviving waves with good build
- High risk, high reward extraction

---

## 9. What's NOT Balanced Yet

**Missing Systems:**
- Extraction mechanics (to be built)
- Gold economy
- Weapon unlock system
- Meta-progression
- Boss encounters
- Level variety

**Intentionally Simplified:**
- Only 3 enemy types
- No complex synergies
- No weapon mods
- Fixed spawn patterns

**These will be added AFTER extraction prototype works.**

---

## 10. Success Criteria

The prototype is successful if:

- [ ] **Feel:** Combat feels satisfying for 5 minutes
- [ ] **Pacing:** Clear difficulty curve from calm to chaos
- [ ] **Choice:** Level-up choices feel meaningful
- [ ] **Power:** Player feels progression in 5-minute window
- [ ] **Balance:** Can survive to 5:00 with decent build
- [ ] **Clarity:** Easy to understand what's happening
- [ ] **Stability:** No major bugs or performance issues

**If these are met, move to extraction layer.**
**If not, iterate on combat until they are.**

---

## Notes for AI Implementation

When implementing these changes:
- Preserve all existing systems (camera, collision, rendering)
- Only modify config values and spawn logic
- Add "enabled" flags instead of deleting code
- Keep complex weapons disabled, not deleted
- Comment out unused features clearly
- Test after each major change

**This is a reduction, not a rebuild.**
