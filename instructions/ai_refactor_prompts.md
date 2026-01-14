# AI Refactor Prompts: Safe Simplification

**Important:** Execute these prompts ONE AT A TIME. Test after each change.

---

## Prompt #1: Disable Tank and Swarm Enemies

```
I need to temporarily disable Tank and Swarm enemy types from spawning,
without deleting their code.

CURRENT BEHAVIOR:
All 5 enemy types (Basic, Fast, Ranger, Tank, Swarm) can spawn based on
time-gating and weighted random selection.

DESIRED BEHAVIOR:
Only Basic, Fast, and Ranger enemies should spawn. Tank and Swarm should
be completely disabled but their code preserved for potential future use.

IMPLEMENTATION:
In EnemyConfig.js (or wherever enemy definitions are):

1. Add an "enabled" flag to each enemy type definition:
   ```
   {
     id: 'tank',
     enabled: false,  // ← ADD THIS
     // ... rest of config
   }
   ```

2. Set enabled flags:
   - Basic: true
   - Fast: true
   - Ranger: true
   - Tank: false
   - Swarm: false

3. In SpawnSystem.js, modify enemy selection to filter by enabled flag:
   ```
   getAvailableEnemyTypes(gameTime) {
     // Get base available types (existing time-gating logic)
     const timeGatedTypes = [...existing logic...];
     
     // Filter to only enabled types
     return timeGatedTypes.filter(typeId => {
       const config = EnemyConfig[typeId];
       return config.enabled !== false;
     });
   }
   ```

TESTING:
After implementation:
- Play for 5 minutes
- Verify only E, F, R enemies appear (no T or S)
- Check console for errors

This should be a safe change that preserves all Tank/Swarm code for
later re-enabling.
```

---

## Prompt #2: Reduce Weapon Levels from 8 to 4

```
I need to reduce weapon progression from 8 levels to 4 levels to better
fit 5-minute gameplay loops.

CURRENT STATE:
Each weapon has 8 levels with scaling damage, counts, cooldowns, etc.

DESIRED STATE:
Each weapon should have only 4 levels, using a subset of the current
8-level progression curve.

STRATEGY:
For each weapon, keep levels 1, 3, 5, and 8 from the current progression.
This maintains the power curve shape but cuts the grind in half.

EXAMPLE TRANSFORMATIONS:

Magic Wand Damage:
OLD (8 levels): [3, 5, 7, 10, 13, 16, 19, 22]
NEW (4 levels): [3, 7, 13, 22]

Magic Wand Count (projectiles):
OLD (8 levels): [1, 1, 2, 2, 3, 3, 4, 4]
NEW (4 levels): [1, 2, 3, 4]

IMPLEMENTATION:
In WeaponConfig.js:

1. For each weapon, create new 4-level progressions by selecting:
   - Level 1 → Keep as Level 1
   - Level 3 → Becomes Level 2
   - Level 5 → Becomes Level 3
   - Level 8 → Becomes Level 4

2. Update maxLevel property:
   ```
   OLD: maxLevel: 8
   NEW: maxLevel: 4
   ```

3. Adjust level-up descriptions to match:
   ```
   Level 2: "Increased damage" (was level 3 bonus)
   Level 3: "More projectiles" (was level 5 bonus)
   Level 4: "Maximum power" (was level 8 bonus)
   ```

WEAPONS TO UPDATE:
- Magic Wand
- Throwing Knife  
- Garlic Aura
- Orbiting Shield
- Scatter Shot
- Magic Missile
- Proximity Mine

IMPORTANT:
- Preserve the shape of the power curve
- Level 4 should feel like "maxed out"
- Don't change base mechanics, just level count

TESTING:
After implementation:
- Start game and level up a weapon 4 times
- Verify it shows "MAX" or stops offering upgrades
- Check that Level 4 power feels satisfying
```

---

## Prompt #3: Reduce Passive Levels from 5 to 3

```
I need to reduce passive item progression from 5 levels to 3 levels to
simplify the upgrade pool and create faster power spikes.

CURRENT STATE:
Each passive has 5 levels with incremental bonuses.

DESIRED STATE:
Each passive should have only 3 levels with more impactful bonuses per
level.

STRATEGY:
For each passive, redistribute the total power from 5 levels into 3
levels, making each level feel more significant.

EXAMPLE TRANSFORMATIONS:

Damage Amp:
OLD (5 levels): +10%, +20%, +30%, +40%, +50% (total: +50%)
NEW (3 levels): +15%, +30%, +50% (total: +50%, same endpoint)

Wings (Speed):
OLD (5 levels): +10%, +20%, +30%, +40%, +50%
NEW (3 levels): +15%, +30%, +50%

Vigor (Max HP):
OLD (5 levels): +20, +40, +60, +80, +100 (total: +100 HP)
NEW (3 levels): +30, +60, +100 (total: +100 HP, same endpoint)

Cooldown Reduction:
OLD (5 levels): -8%, -16%, -24%, -32%, -40%
NEW (3 levels): -12%, -24%, -40%

IMPLEMENTATION:
In PassiveConfig.js:

1. For each passive, create new 3-level progressions:
   - Level 1: ~30% of total power
   - Level 2: ~60% of total power  
   - Level 3: 100% of total power (same as old Level 5)

2. Update maxLevel property:
   ```
   OLD: maxLevel: 5
   NEW: maxLevel: 3
   ```

3. Adjust stat bonus calculations to use new values

PASSIVES TO UPDATE:
- Damage Amp (+)
- Wings (^)
- Magnet (U)
- Vigor (H)
- Cooldown (C)
- Armor (#)
- Greed ($)
- Luck (%)
- Regeneration (&)
- Area (O)
- Duration (T)

IMPORTANT:
- Final power (Level 3) should match old Level 5
- Each level should feel like a meaningful power spike
- Maintain balance between different passive types

TESTING:
After implementation:
- Level up a passive 3 times
- Verify it caps at Level 3
- Check that each level feels impactful
```

---

## Prompt #4: Reduce Enemy Movement Speed

```
I need to reduce enemy movement speeds by 25-30% to address "congo line"
gameplay where players just outrun hordes instead of fighting.

CURRENT SPEEDS:
- Basic: 70 px/s
- Fast: 90 px/s
- Ranger: 60 px/s

PROBLEM:
Enemies move too fast relative to kill rate, creating a blob that players
can't fight, only run from. This makes combat feel helpless rather than
tactical.

NEW SPEEDS:
- Basic: 50 px/s (29% reduction)
- Fast: 70 px/s (22% reduction)
- Ranger: 50 px/s (17% reduction)

RATIONALE:
- Player speed is 140 px/s base
- New enemy speeds are 35-50% of player speed (was 42-64%)
- Gives player time to kite, reposition, and let weapons work
- Fast enemies still feel fast relative to Basic

IMPLEMENTATION:
In EnemyConfig.js, update speed values:

```javascript
enemyTypes: {
  basic: {
    // ... other properties
    speed: 50,  // was 70
  },
  fast: {
    speed: 70,  // was 90
  },
  ranger: {
    speed: 50,  // was 60
  }
}
```

TESTING:
After implementation:
- Play for 2-3 minutes
- Check if you can create space between yourself and enemies
- Verify you're killing enemies instead of just running
- Ensure Fast enemies still feel noticeably faster than Basic
```

---

## Prompt #5: Simplify Wave Spawn System to 2 Brackets

```
I need to simplify the wave spawn system from 4 time brackets to 2
brackets to make balancing easier.

CURRENT SYSTEM (Complex):
- 4 time brackets (0-3, 3-6, 6-10, 10+)
- Different wave intervals, sizes, and direction counts
- Hard to tune and predict

NEW SYSTEM (Simple):
Only 2 phases with clear breakpoints.

PHASE 1 - EARLY GAME (0:00 - 2:30):
- Wave interval: 15 seconds
- Wave size: 10 enemies
- Directions: 2
- Continuous spawn: 1 enemy/second
- Enemy types: Basic only (0-1:30), then Basic + Fast

PHASE 2 - LATE GAME (2:30 - 5:00):
- Wave interval: 12 seconds
- Wave size: 15 enemies
- Directions: 3
- Continuous spawn: 1 enemy/second
- Enemy types: Basic (50%) + Fast (30%) + Ranger (20%)

IMPLEMENTATION:
In SpawnSystem.js, modify getWaveParameters():

```javascript
getWaveParameters(gameTime) {
    if (gameTime < 150) { // 0-2:30 (Early)
        return {
            interval: 15,
            size: 10,
            minDirections: 2,
            maxDirections: 2
        };
    } else { // 2:30+ (Late)
        return {
            interval: 12,
            size: 15,
            minDirections: 3,
            maxDirections: 3
        };
    }
}
```

Update enemy type time-gating:

```javascript
getAvailableEnemyTypes(gameTime) {
    const types = ['basic']; // Always available
    
    if (gameTime >= 90) types.push('fast');    // 1:30
    if (gameTime >= 180) types.push('ranger'); // 3:00
    
    // Tank and Swarm disabled (see Prompt #1)
    
    return types.filter(t => EnemyConfig[t].enabled !== false);
}
```

TESTING:
After implementation:
- First 2:30 should feel calm and manageable
- After 2:30, difficulty should spike noticeably
- Waves should be visible and rhythmic (not constant stream)
- Enemy variety should increase gradually
```

---

## Prompt #6: Update Level-Up Choice Generation

```
I need to update the level-up choice generation to account for reduced
weapon/passive levels (4 and 3 respectively).

CURRENT BEHAVIOR:
Level-up presents 3 random choices from pool of:
- New weapons (if not owned)
- Weapon upgrades (if level < 8)
- New passives (if not owned)
- Passive upgrades (if level < 5)

NEW BEHAVIOR:
Same logic, but with updated max levels:
- Weapon upgrades only if level < 4 (not 8)
- Passive upgrades only if level < 3 (not 5)

IMPLEMENTATION:
In UpgradeSystem.js (or wherever upgrade choices are generated):

1. Update maxLevel checks:
   ```javascript
   // For weapons
   if (weapon.currentLevel < 4) { // was < 8
     // Offer upgrade
   }
   
   // For passives
   if (passive.currentLevel < 3) { // was < 5
     // Offer upgrade
   }
   ```

2. Update "MAX" display logic:
   ```javascript
   isMaxLevel(item, type) {
     if (type === 'weapon') return item.level >= 4;
     if (type === 'passive') return item.level >= 3;
   }
   ```

3. Verify upgrade pool generation handles new limits

TESTING:
After implementation:
- Level up multiple times
- Verify weapons cap at Level 4
- Verify passives cap at Level 3
- Check that choices remain available when some items are maxed
- Ensure "MAX" appears in UI at correct levels
```

---

## Safety Notes

**Before Each Prompt:**
1. Commit/backup your current code
2. Test the game works before making changes
3. Execute ONE prompt at a time

**After Each Prompt:**
1. Run the game
2. Play for 2-3 minutes
3. Check for console errors
4. Verify the change worked as intended

**If Something Breaks:**
1. Don't panic
2. Revert to previous backup
3. Ask AI to fix the specific error
4. Try again

**AI Tool Tips:**
- Include the phrase "without breaking existing functionality"
- Ask AI to explain what it changed
- Request before/after diffs for verification
- Have AI add comments explaining the changes

---

## Order of Execution

**Recommended order:**

1. Prompt #4 (Enemy Speed) - Safest, biggest impact on feel
2. Prompt #1 (Disable Enemies) - Simple flag addition
3. Prompt #5 (Wave System) - Improves pacing
4. Prompt #2 (Weapon Levels) - More complex, do carefully
5. Prompt #3 (Passive Levels) - Similar to #2
6. Prompt #6 (Upgrade Logic) - Depends on #2 and #3 working

**Total time:** 2-3 hours if done carefully.

**Break between prompts.** Don't rush.
