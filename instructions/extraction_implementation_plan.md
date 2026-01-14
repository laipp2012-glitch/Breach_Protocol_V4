# Extraction Loop Implementation Plan

**Goal:** Build minimum viable extraction mechanics to test the core concept.

**Total Time Estimate:** 6-8 hours across multiple sessions

---

## Implementation Order

Each step builds on the previous one. **Do them in order.**

### **Phase 1: Player Profile System** (1 hour)
**File:** `prompt_1_player_profile.md`
**Purpose:** Create persistent storage for gold, unlocks, stats
**Why First:** Everything else needs this foundation

### **Phase 2: Extraction Points** (1.5 hours)
**File:** `prompt_2_extraction_points.md`
**Purpose:** Add timed extraction zones to the map
**Why Second:** Core mechanic that triggers end-of-run

### **Phase 3: Rewards Screen** (1.5 hours)
**File:** `prompt_3_rewards_screen.md`
**Purpose:** Show results and grant gold after extraction/death
**Why Third:** Closes the run loop, grants progression currency

### **Phase 4: Hub Menu** (2 hours)
**File:** `prompt_4_hub_menu.md`
**Purpose:** Central menu for navigation and viewing stats
**Why Fourth:** Meta-game wrapper around runs

### **Phase 5: Loadout Selection** (2 hours)
**File:** `prompt_5_loadout_selection.md`
**Purpose:** Choose starting weapon/passive before run
**Why Last:** Pre-run customization completes the loop

---

## Testing Checkpoints

After each phase, test this scenario:

### After Phase 1:
- [ ] Start game, check console for "PlayerProfile initialized"
- [ ] Verify gold starts at 0
- [ ] Check localStorage in browser dev tools

### After Phase 2:
- [ ] Play until 2:00 mark
- [ ] Extraction point appears (green EXIT symbol)
- [ ] Walk into it, press E
- [ ] Game ends (for now, no rewards yet)

### After Phase 3:
- [ ] Extract at 2:00
- [ ] See rewards screen with gold earned
- [ ] Verify gold is saved (check localStorage)
- [ ] Die before extracting = 0 gold

### After Phase 4:
- [ ] Game starts at hub menu (not gameplay)
- [ ] Can click START RUN
- [ ] Can view STORAGE (gold amount)
- [ ] After extraction, return to hub

### After Phase 5:
- [ ] Click START RUN → See loadout screen
- [ ] Choose starting weapon + passive
- [ ] Run starts with selected loadout
- [ ] **FULL LOOP COMPLETE**

---

## Final Test Scenario (After Phase 5)

**Complete extraction loop:**
1. Start game → Hub menu appears
2. Click START RUN → Loadout screen
3. Choose Knife + Wings
4. Run begins with Knife and Wings
5. Survive to 2:00
6. Extraction point appears
7. Walk into it, press E
8. Rewards screen: "50 Gold Earned"
9. Return to hub
10. Storage now shows 50 gold
11. Repeat

**If all 10 steps work → Extraction concept is proven.**

---

## What's NOT in This Plan

**Deliberately excluded** (add later if extraction works):

- ❌ Weapon unlocks (3/3 parts system)
- ❌ Mod unlocks
- ❌ Permanent stat upgrades shop
- ❌ Quest system
- ❌ Multiple levels/maps
- ❌ Loot boxes
- ❌ Character creation
- ❌ Boss encounters

**Why:** Test if extraction is fun FIRST. If it is, add these.

---

## If Something Breaks

**Debugging approach:**

1. **Identify which phase broke**
2. **Revert to previous backup**
3. **Re-read the prompt for that phase**
4. **Ask AI to explain what it changed**
5. **Try again, or ask me for help**

**Common issues:**
- Phase 1: localStorage not working in browser
- Phase 2: Extraction point not spawning (check time >= 120s)
- Phase 3: Gold not persisting (check save() calls)
- Phase 4: Game state transitions broken (check state machine)
- Phase 5: Loadout not applying to player (check equipment system)

---

## Success Metrics

**After implementing all 5 phases, the game should:**

- [ ] Start at hub menu (not directly in gameplay)
- [ ] Let player choose loadout before run
- [ ] Spawn extraction points at 2:00, 3:30, 5:00
- [ ] Grant gold based on extraction time
- [ ] Save gold to persistent storage
- [ ] Return to hub after extraction/death
- [ ] Display total gold in hub
- [ ] Allow multiple runs with gold accumulation

**If all ✓ → You have a working extraction prototype.**

---

## Next Steps After Completion

Once extraction loop works:

1. **Playtest 10+ runs**
   - Does extraction create interesting decisions?
   - Is risk/reward balance right?
   - Does gold accumulation feel meaningful?

2. **Get feedback**
   - Have someone else play it
   - Watch them without explaining
   - Note where they get confused

3. **Decide next features**
   - If extraction is fun → Add weapon unlocks, shop, etc.
   - If extraction is boring → Rethink the concept
   - If extraction is confusing → Improve communication/UI

---

## Time Management

**Don't do all 5 phases in one sitting.**

**Recommended schedule:**

**Day 1 (2 hours):**
- Phase 1: Player Profile
- Phase 2: Extraction Points
- Test basic extraction

**Day 2 (2 hours):**
- Phase 3: Rewards Screen
- Test that gold saves

**Day 3 (3 hours):**
- Phase 4: Hub Menu
- Phase 5: Loadout Selection
- Test full loop

**Total: 3 sessions, 7 hours**

Take breaks. Don't rush.

---

## Ready?

**Start with Phase 1.**

Open `prompt_1_player_profile.md` and give it to your AI.

After it's implemented and tested, move to Phase 2.

**Come back here if you get stuck or when you finish all 5 phases.**

Good luck! 🚀
