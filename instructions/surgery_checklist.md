# Surgery Checklist: Simplifying Breach Protocol

**Goal:** Reduce complexity to minimum viable extraction prototype.
**Time:** 2-3 hours of careful refactoring with AI assistance.

---

## Phase 1: Enemy Reduction (30 minutes)

### Cut Enemy Types
**ACTION:** Disable Tank and Swarm enemies entirely.

**Keep:**
- ✅ Basic (E) - Core enemy
- ✅ Fast (F) - Movement challenge  
- ✅ Ranger (R) - Ranged threat

**Remove:**
- ❌ Tank (T) - Not needed for 5-min runs
- ❌ Swarm (S) - Too complex for prototype

**How:** Don't delete code, just disable them from spawning.
See AI Prompt #1 in the AI Refactor document.

**Why:** 3 enemy types is enough to test extraction. You can add them back later if needed.

---

## Phase 2: Weapon Level Reduction (45 minutes)

### Reduce Weapon Levels: 8 → 4

**For Each Weapon:**
- Keep levels 1, 3, 5, 8 from current scaling
- This maintains power curve but cuts grind

**Example (Magic Wand):**
```
OLD (8 levels): 3, 5, 7, 10, 13, 16, 19, 22
NEW (4 levels): 3, 7, 13, 22

Level 1: 3 damage
Level 2: 7 damage  
Level 3: 13 damage
Level 4: 22 damage (MAX)
```

**How:** Modify weapon config files to have only 4 levels.
See AI Prompt #2 in the AI Refactor document.

**Why:** 
- In 5-minute runs, players get 8-12 upgrades
- 4 levels = can max 2-3 weapons = feels complete
- Still has progression, less grind

---

## Phase 3: Passive Level Reduction (30 minutes)

### Reduce Passive Levels: 5 → 3

**For Each Passive:**
- Keep levels 1, 3, 5 from current values
- Adjust bonuses to feel meaningful

**Example (Damage Amp):**
```
OLD (5 levels): +10%, +20%, +30%, +40%, +50%
NEW (3 levels): +15%, +30%, +50%

Level 1: +15% damage
Level 2: +30% damage
Level 3: +50% damage (MAX)
```

**How:** Modify passive config files to have only 3 levels.
See AI Prompt #3 in the AI Refactor document.

**Why:**
- Faster power spikes
- Less diluted upgrade pool
- Each level feels significant

---

## Phase 4: Enemy Speed Reduction (15 minutes)

### Slow Down Enemies by 25-30%

**Reason:** Players complain about "congo line" effect where they just run from hordes.

**New Speeds:**
```
Basic: 70 → 50 px/s
Fast: 90 → 70 px/s
Ranger: 60 → 50 px/s
```

**How:** Simple config value changes.
See AI Prompt #4 in the AI Refactor document.

**Why:**
- Gives player time to position
- Makes combat feel more tactical, less frantic
- Reduces "outrun the blob" gameplay

---

## Phase 5: Spawn System Simplification (45 minutes)

### Replace Complex Wave System with Fixed Waves

**Current Problem:**
- 4 time brackets with scaling intervals/sizes
- Too much tuning complexity
- Hard to balance

**New System:**
```
EARLY PHASE (0-2:30):
- Wave every 15 seconds
- 8-12 enemies per wave
- 2 directions
- Between waves: 1 enemy/second

LATE PHASE (2:30-5:00):
- Wave every 12 seconds  
- 12-18 enemies per wave
- 3 directions
- Between waves: 1 enemy/second
```

**Enemy Type Distribution:**
```
0-1:30: Basic only
1:30-3:00: Basic (70%) + Fast (30%)
3:00-5:00: Basic (50%) + Fast (30%) + Ranger (20%)
```

**How:** Simplify wave timing logic to 2 brackets instead of 4.
See AI Prompt #5 in the AI Refactor document.

**Why:**
- Easier to balance
- Clearer difficulty curve
- Less overwhelming at start

---

## Phase 6: Remove Unused Passives (Optional, 15 minutes)

### Consider Cutting Low-Impact Passives

**Candidates to Cut:**
- Duration (only matters for 1 weapon - Mines)
- Luck (not fully implemented?)
- Regeneration (healing breaks difficulty)

**Keep Core Passives:**
- Damage Amp (offense)
- Wings (mobility)
- Magnet (QoL)
- Vigor (survivability)
- Cooldown (feel good)
- Armor (defense)
- Greed (progression)
- Area (utility)

**Decision:** Your call. 8 passives vs 11 isn't a huge difference.

---

## What NOT to Touch

**KEEP these systems as-is:**
- ✅ XP curve (4 * 1.25^Level) - It's working
- ✅ Player movement/controls - Feels good
- ✅ Projectile systems - All working
- ✅ Collision detection - No issues reported
- ✅ Visual juice (particles, shake, etc.) - This is good
- ✅ UI/HUD layout - Functional
- ✅ Config-driven architecture - Your best design choice

**Don't rebuild systems that work.** Just reduce their complexity.

---

## Success Criteria

After surgery, you should be able to:

**Test Run (5 minutes):**
- [ ] Reach Level 12-15
- [ ] Max out 2-3 weapons to Level 4
- [ ] Have 3-4 passives at Level 2-3
- [ ] Face all 3 enemy types
- [ ] Feel powerful but challenged
- [ ] Die around 5-6 minute mark (if no extraction)

**Feel Check:**
- [ ] Early game (0-1:30) feels calm and learnable
- [ ] Mid game (2-3 min) feels tense but fair
- [ ] Late game (4-5 min) feels chaotic but manageable
- [ ] Enemies are killable, not congo-line invincible
- [ ] Weapons feel impactful at each level

**Code Health:**
- [ ] AI can make changes without breaking everything
- [ ] Config files are simple and readable
- [ ] No "magic number" scaling formulas

---

## After Surgery: Next Steps

Once simplified:

1. **Playtest 3 times** (5-minute runs)
2. **Note what feels good/bad**
3. **THEN build extraction layer:**
   - Add extraction points at 2:00, 3:30, 5:00
   - Add basic hub menu
   - Add gold/loot system
4. **Test if extraction concept works**

**Remember:** You're testing a concept, not building a complete game.

---

## Emotional Check-In

This will feel like "deleting your baby." That's normal.

**Reminder:**
- You're not deleting work, you're refining it
- Simpler = easier to test and iterate
- You can add complexity back AFTER extraction works
- This is how all successful games are made

**You built too much too fast. That's okay. Now you're fixing it.**

Take breaks during the surgery. Don't rush.
