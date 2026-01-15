# AI Prompt: Vampire Survivors Spawn System for 5-Minute Extraction Loop

**Goal:** Replace wave-based spawning with continuous VS-style spawning, compressed to fit a 5-minute extraction gameplay loop.

**Critical:** This is a complete rewrite of spawn logic, not a modification. Back up existing code first.

---

## Understanding the Timeline

**5-Minute Extraction Arc:**

| Time Range | Phase Name | Purpose | Spawn Intensity | Player State |
|------------|------------|---------|-----------------|--------------|
| 0:00 - 1:00 | Learning | Tutorial, safe exploration | Low | Learning controls, getting first upgrades |
| 1:00 - 2:00 | Fighting | Combat engagement begins | Medium | Building loadout, feeling stronger |
| 2:00 | **Extraction Window 1** | **First escape opportunity** | Spike | Decision: Safe exit or push deeper? |
| 2:00 - 3:00 | Survival | Increased pressure | High | Managing dense enemies, tactics matter |
| 3:00 | **Extraction Window 2** | **Risk/reward decision** | Spike | Decision: Good reward or greed? |
| 3:00 - 5:00 | Chaos | Maximum intensity | Extreme | Screen-filling enemies, godhood or death |
| 5:00 | **Extraction Window 3** | **Maximum reward** | Massive Spike | Survive or die trying |

---

## Spawn Rate Progression (Exponential Curve)

### Formula Design

**Base Formula:**
```javascript
spawnRate = BASE * Math.pow(MULTIPLIER, timeInMinutes)

Where:
BASE = 3 (starting spawn rate, enemies per second)
MULTIPLIER = 2.8 (aggression of curve)
timeInMinutes = gameTime / 60
```

**Target Spawn Rates:**

| Time | Formula Result | Capped Rate | Enemies On Screen |
|------|---------------|-------------|-------------------|
| 0:00 | 3/sec | 3/sec | 10-20 |
| 0:30 | 5/sec | 5/sec | 20-40 |
| 1:00 | 8/sec | 8/sec | 40-70 |
| 1:30 | 14/sec | 14/sec | 70-110 |
| 2:00 | 23/sec | 23/sec | 110-150 |
| 2:30 | 38/sec | 38/sec | 150-220 |
| 3:00 | 63/sec | 50/sec (CAPPED) | 220-300 |
| 4:00 | 175/sec | 50/sec (CAPPED) | 300-400 |
| 5:00 | 487/sec | 50/sec (CAPPED) | 400-500 (MAX) |

**Why This Curve:**
- Gentle start (learning phase)
- Accelerates rapidly at 1:00 (fighting phase)
- Hits intensity at 2:00 (first extraction pressure)
- Maxes out at 3:00+ (chaos phase, late extractions)

---

## Implementation Requirements

### FILE 1: js/config/SpawnConfig.js

**REPLACE entire file with:**

```javascript
/**
 * Spawn Configuration - VS-Style Continuous Spawning
 * Adapted for 5-minute extraction loop
 */

export const SPAWN_CONFIG = {
    /**
     * General spawn settings
     */
    GENERAL: {
        /** Maximum enemies allowed on screen */
        MAX_ENEMIES: 500,

        /** Spawn margin outside viewport (pixels) */
        SPAWN_MARGIN: 50,
    },

    /**
     * VS-Style continuous spawn formula
     */
    CONTINUOUS_SPAWN: {
        /** Base spawn rate (enemies per second at t=0) */
        BASE_RATE: 3,

        /** Exponential multiplier (aggression curve) */
        MULTIPLIER: 2.8,

        /** Maximum spawn rate cap (enemies per second) */
        MAX_RATE: 50,

        /** Spawn tick interval (seconds) - how often to spawn */
        SPAWN_INTERVAL: 0.05  // 20 times per second
    },

    /**
     * Enemy type unlock times (seconds)
     * Controls when each enemy becomes available
     */
    ENEMY_UNLOCK_TIMES: {
        basic: 0,      // 0:00 - Always available
        fast: 45,      // 0:45 - Add mobility challenge
        ranger: 90,    // 1:30 - Add ranged pressure
        tank: 150,     // 2:30 - Add after first extraction
        swarm: 210     // 3:30 - Add after second extraction
    },

    /**
     * Enemy type spawn weights by time bracket
     * Controls spawn distribution as game progresses
     */
    SPAWN_WEIGHTS: {
        // 0:00 - 1:30 (Learning + Early Fighting)
        EARLY: {
            basic: 100,
            fast: 0,
            ranger: 0,
            tank: 0,
            swarm: 0
        },
        // 1:30 - 2:30 (Fighting + First Extraction)
        MID: {
            basic: 70,
            fast: 30,
            ranger: 0,
            tank: 0,
            swarm: 0
        },
        // 2:30 - 3:30 (Survival + Second Extraction)
        LATE: {
            basic: 50,
            fast: 25,
            ranger: 20,
            tank: 5,
            swarm: 0
        },
        // 3:30+ (Chaos + Final Extraction)
        CHAOS: {
            basic: 40,
            fast: 20,
            ranger: 20,
            tank: 15,
            swarm: 5
        }
    },

    /**
     * Extraction wave settings
     * Massive wave spawned when extraction point appears
     */
    EXTRACTION_WAVE: {
        /** Enable/disable extraction wave spawn */
        ENABLED: true,
        /** Number of enemies to spawn */
        ENEMY_COUNT: 50,
        /** Spawn from all 4 directions */
        DIRECTIONS: 4
    }
};

/**
 * Gets spawn weights for current game time
 * @param {number} gameTime - Current game time in seconds
 * @returns {Object} Spawn weight distribution
 */
export function getSpawnWeights(gameTime) {
    if (gameTime < 90) return SPAWN_CONFIG.SPAWN_WEIGHTS.EARLY;
    if (gameTime < 150) return SPAWN_CONFIG.SPAWN_WEIGHTS.MID;
    if (gameTime < 210) return SPAWN_CONFIG.SPAWN_WEIGHTS.LATE;
    return SPAWN_CONFIG.SPAWN_WEIGHTS.CHAOS;
}

/**
 * Gets available enemy types for current game time
 * @param {number} gameTime - Current game time in seconds
 * @returns {Array<string>} Array of enemy type IDs
 */
export function getAvailableEnemies(gameTime) {
    const unlockTimes = SPAWN_CONFIG.ENEMY_UNLOCK_TIMES;
    return Object.keys(unlockTimes).filter(type => gameTime >= unlockTimes[type]);
}

// Freeze config
Object.freeze(SPAWN_CONFIG);
Object.freeze(SPAWN_CONFIG.GENERAL);
Object.freeze(SPAWN_CONFIG.CONTINUOUS_SPAWN);
Object.freeze(SPAWN_CONFIG.ENEMY_UNLOCK_TIMES);
Object.freeze(SPAWN_CONFIG.SPAWN_WEIGHTS);
Object.freeze(SPAWN_CONFIG.EXTRACTION_WAVE);
```

---

### FILE 2: js/systems/SpawnSystem.js

**CRITICAL CHANGES:**

**1. Remove all wave-based logic:**
- Delete `waveTimer` property
- Delete `waveInterval` property  
- Delete `spawnWave()` method
- Delete `selectWaveDirections()` method
- Delete `getWaveParameters()` method

**2. Add VS-style continuous spawn properties:**

In the constructor, REPLACE wave properties with:

```javascript
constructor(viewportWidth, viewportHeight) {
    // ... existing viewport properties ...

    // VS-Style Continuous Spawning
    /** @type {number} Accumulator for spawn timing */
    this.spawnAccumulator = 0;

    /** @type {number} Total game time */
    this.gameTime = 0;

    /** @type {boolean} Whether spawning is active */
    this.active = true;

    /** @type {{x: number, y: number}} Current camera position */
    this.cameraPosition = { x: 0, y: 0 };
}
```

**3. Replace update() method logic:**

FIND the existing update() method and REPLACE its spawn logic with:

```javascript
update(deltaTime, enemies, camera = null) {
    if (!this.active) {
        return [];
    }

    // Update camera position for spawning
    if (camera) {
        this.cameraPosition = { x: camera.x, y: camera.y };
    }

    this.gameTime += deltaTime;

    const newEnemies = [];
    const currentEnemyCount = enemies.length;

    // Check enemy cap
    if (currentEnemyCount >= this.maxEnemies) {
        return [];
    }

    // ===== VS-STYLE CONTINUOUS SPAWNING =====
    
    // Calculate current spawn rate based on game time
    const spawnRate = this.calculateSpawnRate(this.gameTime);
    const spawnInterval = 1 / spawnRate;

    // Accumulate delta time
    this.spawnAccumulator += deltaTime;

    // Spawn enemies based on accumulated time
    while (this.spawnAccumulator >= spawnInterval) {
        this.spawnAccumulator -= spawnInterval;

        // Check if we can spawn more
        if (enemies.length + newEnemies.length >= this.maxEnemies) {
            break;
        }

        // Spawn single enemy at random edge
        const enemy = this.spawnSingleEnemy();
        if (enemy) {
            newEnemies.push(enemy);
        }
    }

    return newEnemies;
}
```

**4. Add calculateSpawnRate() method:**

ADD this new method to SpawnSystem class:

```javascript
/**
 * Calculates spawn rate using exponential curve
 * @param {number} gameTime - Current game time in seconds
 * @returns {number} Enemies to spawn per second
 */
calculateSpawnRate(gameTime) {
    const config = SPAWN_CONFIG.CONTINUOUS_SPAWN;
    
    // Convert game time to minutes for formula
    const timeInMinutes = gameTime / 60;
    
    // Exponential formula: BASE * (MULTIPLIER ^ time)
    const rate = config.BASE_RATE * Math.pow(config.MULTIPLIER, timeInMinutes);
    
    // Cap at maximum rate
    return Math.min(rate, config.MAX_RATE);
}
```

**5. Add spawnSingleEnemy() method:**

ADD this new method to SpawnSystem class:

```javascript
/**
 * Spawns a single enemy at a random screen edge
 * @returns {Enemy} Spawned enemy
 */
spawnSingleEnemy() {
    // Select random edge (0-3: Top, Right, Bottom, Left)
    const edge = Math.floor(Math.random() * 4) + 1; // SPAWN_EDGE uses 1-4
    
    // Get spawn position on that edge
    const pos = this.getRandomSpawnPosition(edge);
    
    // Select enemy type based on time and weights
    const enemyType = this.selectWeightedEnemyType();
    
    // Create enemy
    const enemy = new Enemy(pos.x, pos.y, enemyType);
    
    // Store spawn direction for movement spread
    enemy.spawnDirection = this.getDirectionName(edge);
    
    return enemy;
}
```

**6. Add getRandomSpawnPosition() method:**

ADD this new method to SpawnSystem class:

```javascript
/**
 * Gets a random position along a screen edge
 * @param {number} edge - Edge identifier (1-4: Top/Right/Bottom/Left)
 * @returns {{x: number, y: number}} Spawn position
 */
getRandomSpawnPosition(edge) {
    const margin = this.spawnMargin;
    const camX = this.cameraPosition.x;
    const camY = this.cameraPosition.y;

    // Add slight padding from corners
    const padding = 20;

    switch (edge) {
        case 1: // TOP
            return {
                x: camX + padding + Math.random() * (this.viewportWidth - 2 * padding),
                y: camY - margin
            };
        case 2: // BOTTOM
            return {
                x: camX + padding + Math.random() * (this.viewportWidth - 2 * padding),
                y: camY + this.viewportHeight + margin
            };
        case 3: // LEFT
            return {
                x: camX - margin,
                y: camY + padding + Math.random() * (this.viewportHeight - 2 * padding)
            };
        case 4: // RIGHT
            return {
                x: camX + this.viewportWidth + margin,
                y: camY + padding + Math.random() * (this.viewportHeight - 2 * padding)
            };
        default:
            return { x: camX, y: camY };
    }
}
```

**7. Add selectWeightedEnemyType() method:**

ADD this new method to SpawnSystem class:

```javascript
/**
 * Selects enemy type using weighted random based on game time
 * @returns {Object} Enemy type config
 */
selectWeightedEnemyType() {
    // Get available enemy types for current time
    const availableTypes = this.getAvailableEnemyTypes(this.gameTime);
    
    // Get spawn weights for current time
    const weights = getSpawnWeights(this.gameTime);
    
    // Filter to only available types
    const weightedTypes = availableTypes
        .map(typeId => ({
            typeId,
            weight: weights[typeId] || 0
        }))
        .filter(item => item.weight > 0);
    
    // Calculate total weight
    const totalWeight = weightedTypes.reduce((sum, item) => sum + item.weight, 0);
    
    // Weighted random selection
    let random = Math.random() * totalWeight;
    
    for (const item of weightedTypes) {
        random -= item.weight;
        if (random <= 0) {
            // Get actual enemy config
            const enemyConfig = Object.values(ENEMY_TYPES).find(t => t.id === item.typeId);
            return enemyConfig || ENEMY_TYPES.BASIC;
        }
    }
    
    // Fallback to basic
    return ENEMY_TYPES.BASIC;
}
```

**8. Update reset() method:**

FIND the reset() method and UPDATE it to:

```javascript
reset() {
    this.spawnAccumulator = 0;
    this.gameTime = 0;
    this.active = true;
    this.cameraPosition = { x: 0, y: 0 };
}
```

**9. Keep these existing methods unchanged:**
- `getAvailableEnemyTypes()` - Still needed for time-gating
- `getDirectionName()` - Still needed for enemy spread
- `enable()` / `disable()` - Still needed for pause
- `getGameTime()` / `getFormattedTime()` - Still needed for UI
- `spawnExtractionWave()` - Still needed for extraction events

---

## Import Updates

**At the top of SpawnSystem.js, ensure these imports:**

```javascript
import { Enemy } from '../entities/Enemy.js';
import { getRandomEnemyType, ENEMY_TYPES } from '../config/EnemyConfig.js';
import { SPAWN_CONFIG, getAvailableEnemies, getSpawnWeights } from '../config/SpawnConfig.js';
```

---

## Testing Protocol

### Phase 1: Spawn Rate Verification (10 minutes)

**Do 3 test runs to specific time marks:**

**Test 1: 1:00 Mark**
- Expected spawn rate: ~8/sec
- Expected enemy count: 40-70 on screen
- Feel: "I can dodge between enemies"

**Test 2: 2:00 Mark**
- Expected spawn rate: ~23/sec
- Expected enemy count: 110-150 on screen
- Feel: "Screen is getting crowded, time to consider extraction"

**Test 3: 3:30 Mark**
- Expected spawn rate: 50/sec (capped)
- Expected enemy count: 250-350 on screen
- Feel: "Wall of enemies, intense but manageable with good build"

**Verification Method:**
Add debug logging in calculateSpawnRate():
```javascript
if (Math.floor(gameTime) % 10 === 0 && gameTime > lastLogTime + 1) {
    console.log(`Time: ${this.getFormattedTime()} | Spawn Rate: ${spawnRate.toFixed(1)}/sec | Enemies: ${enemies.length}`);
    lastLogTime = gameTime;
}
```

---

### Phase 2: Enemy Distribution Check (5 minutes)

**Verify enemies spawn from all sides:**

Stand still in center of screen for 30 seconds.

**Check:**
- [ ] Enemies appear from top
- [ ] Enemies appear from bottom
- [ ] Enemies appear from left
- [ ] Enemies appear from right
- [ ] No single side dominates

**If one side dominates:** Edge spawning logic has bias, check getRandomSpawnPosition().

---

### Phase 3: Extraction Timing (15 minutes)

**Do 3 extraction runs:**

**Run 1: Extract at 2:00**
- Enemy pressure: Should feel manageable
- Decision: "I could keep going, but 2:00 is safe"
- Success rate: 90%+

**Run 2: Extract at 3:30**
- Enemy pressure: Should feel challenging
- Decision: "This is intense, but I can make it"
- Success rate: 60-70%

**Run 3: Push to 5:00**
- Enemy pressure: Should feel overwhelming
- Decision: "This is chaos, barely holding on"
- Success rate: 30-40%

**If all 3 feel too easy:**
- Increase MULTIPLIER from 2.8 to 3.2
- Reduce MAX_ENEMIES cap from 500 to 400

**If 2:00 feels too hard:**
- Decrease MULTIPLIER from 2.8 to 2.5
- Increase MAX_ENEMIES cap from 500 to 600

---

## Expected Results by Time

### 0:00 - 1:00 (Learning Phase)

**Spawn Rate:** 3-8 enemies/sec  
**Screen Density:** 10-40 enemies (10-20% coverage)  
**Player Experience:** "I'm learning the game. Enemies are manageable. I can explore safely."  
**Strategy:** Circle around screen, collect XP, try different weapons

**Visual:** Sparse enemies, lots of open space, no immediate threat

---

### 1:00 - 2:00 (Fighting Phase)

**Spawn Rate:** 8-23 enemies/sec  
**Screen Density:** 40-150 enemies (30-50% coverage)  
**Player Experience:** "Combat is engaging. I need to position carefully. Build is taking shape."  
**Strategy:** Active dodging, weapon positioning matters, XP collection requires thought

**Visual:** Screen filling but navigable, clear threats, tactical decisions

---

### 2:00 - 3:00 (Survival Phase)

**Spawn Rate:** 23-50 enemies/sec  
**Screen Density:** 150-250 enemies (60-75% coverage)  
**Player Experience:** "This is intense. Screen is crowded. My weapons are working hard."  
**Strategy:** Tight movements, relying on weapons to clear space, risky XP grabs

**Visual:** Dense enemy coverage, limited open space, constant action

---

### 3:00 - 5:00 (Chaos Phase)

**Spawn Rate:** 50 enemies/sec (capped)  
**Screen Density:** 250-500 enemies (80-100% coverage)  
**Player Experience:** "Pure chaos. Can barely see ground. Lawnmower mode or death."  
**Strategy:** Minimal movement, let maxed weapons do the work, survival is victory

**Visual:** Screen-filling enemies, particle effects everywhere, sensory overload

---

## Tuning After Implementation

### If Early Game (0-1 min) is Too Hard:
- Reduce BASE_RATE from 3 to 2
- Delay Fast enemy spawn from 0:45 to 1:15

### If Early Game is Too Easy:
- Increase BASE_RATE from 3 to 4
- Add Fast enemies at 0:30 instead of 0:45

### If Mid Game (1-3 min) is Too Hard:
- Reduce MULTIPLIER from 2.8 to 2.5
- Delay Ranger spawn from 1:30 to 2:00

### If Mid Game is Too Easy:
- Increase MULTIPLIER from 2.8 to 3.0
- Add Rangers at 1:00 instead of 1:30

### If Late Game (3-5 min) is Too Hard:
- Reduce MAX_RATE from 50 to 40
- Increase MAX_ENEMIES from 500 to 600

### If Late Game is Too Easy:
- Increase MAX_RATE from 50 to 60
- Reduce MAX_ENEMIES from 500 to 400
- Add more Tanks/Swarms in weight distribution

---

## Critical Success Factors

**✅ Must Achieve:**
1. Screen gradually fills over 5 minutes (not instant)
2. 2:00 extraction is reliably achievable (80%+ success rate)
3. 3:30 extraction requires good build (60% success rate)
4. 5:00 extraction is high-risk (30% success rate)
5. Enemies surround from all directions (not blob from one side)
6. Running in circles is NOT optimal strategy
7. Player feels power growth despite increasing difficulty

**❌ Must Avoid:**
1. Early game too slow/boring (nothing happening)
2. Spawn rate spikes too suddenly (unfair jumps)
3. One direction spawns way more than others (unbalanced)
4. Player can "outrun" enemies indefinitely (broken)
5. Late game impossible regardless of build (too hard)

---

## Debug Tools

**Add to SpawnSystem for testing:**

```javascript
// Call this from debug menu or console
getDebugInfo() {
    const rate = this.calculateSpawnRate(this.gameTime);
    return {
        time: this.getFormattedTime(),
        spawnRate: `${rate.toFixed(1)}/sec`,
        gameTime: this.gameTime,
        active: this.active
    };
}
```

**Console command:**
```javascript
// In browser console:
spawnSystem.getDebugInfo()
// Returns: {time: "02:34", spawnRate: "38.2/sec", gameTime: 154, active: true}
```

---

## Final Verification Checklist

Before considering implementation complete:

- [ ] Spawn rate starts at ~3/sec at 0:00
- [ ] Spawn rate hits ~8/sec at 1:00
- [ ] Spawn rate hits ~23/sec at 2:00
- [ ] Spawn rate caps at 50/sec around 3:00
- [ ] Enemies spawn from all 4 edges equally
- [ ] Basic enemies spawn immediately
- [ ] Fast enemies spawn at 0:45
- [ ] Ranger enemies spawn at 1:30
- [ ] No wave-based spawning remains
- [ ] No "downtime" between spawns
- [ ] Console logs show spawn rate increasing
- [ ] 500 enemy cap is never exceeded
- [ ] Game feels like "trapped in arena" not "running simulator"
- [ ] Extraction timing feels balanced

---

## Common Implementation Errors

**Error 1: Spawn accumulator never resets**
Symptom: Huge burst of enemies after first spawn
Fix: Ensure `this.spawnAccumulator -= spawnInterval` is in the while loop

**Error 2: Enemies only spawn from one edge**
Symptom: All enemies come from top/bottom/left/right exclusively
Fix: Verify `Math.floor(Math.random() * 4) + 1` is generating 1-4 correctly

**Error 3: Spawn rate doesn't increase**
Symptom: Same spawn rate throughout entire game
Fix: Check `this.gameTime += deltaTime` is being called every frame

**Error 4: Spawn rate explodes too fast**
Symptom: Screen fills at 1:30, game becomes unplayable
Fix: Reduce MULTIPLIER from 2.8 to 2.3

**Error 5: getSpawnWeights is not defined**
Symptom: Crash when trying to spawn enemies
Fix: Ensure `import { getSpawnWeights } from '../config/SpawnConfig.js'` is present

---

## Success Metrics

**After implementation, you should achieve:**

| Metric | Target | How to Measure |
|--------|--------|----------------|
| 2:00 extraction success | 80-90% | Do 10 runs, extract at 2:00 |
| 3:30 extraction success | 50-70% | Do 10 runs, extract at 3:30 |
| 5:00 extraction success | 20-40% | Do 10 runs, try to reach 5:00 |
| Early game fun | 7+/10 | Subjective feel rating |
| Late game intensity | 9+/10 | Subjective feel rating |
| "One more run" desire | Yes | Do you want to play again? |

**If you hit these targets → System is working as designed.**

---

**Implementation Priority: HIGH**

This is the foundation of your gameplay feel. Everything else (weapons, balance, extraction) depends on spawn pressure working correctly.

Take your time. Test thoroughly. This is the most important system in your game.
