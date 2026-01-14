# PHASE 1: Player Profile System

**Estimated Time:** 1 hour
**Difficulty:** Medium
**Dependencies:** None (this is the foundation)

---

## What We're Building

A persistent player profile that stores:
- Gold (currency earned from extractions)
- Stats (total runs, kills, time played)
- Future: Unlocked weapons, purchased upgrades

**Why:** Everything in the extraction loop needs persistent data storage.

---

## AI Implementation Prompt

```
I need to create a PlayerProfile system that persists data between 
game sessions using browser localStorage.

REQUIREMENTS:

1. CREATE NEW FILE: js/systems/PlayerProfile.js

This class should handle all persistent player data:

class PlayerProfile {
    constructor() {
        this.data = {
            gold: 0,
            stats: {
                totalRuns: 0,
                totalKills: 0,
                totalTimeAlive: 0,
                longestRun: 0,
                highestLevel: 0
            },
            // Future: unlocks, upgrades, etc.
        };
        
        this.load(); // Load from localStorage on init
    }
    
    // Load profile from localStorage
    load() {
        const saved = localStorage.getItem('breachProtocolProfile');
        if (saved) {
            this.data = JSON.parse(saved);
            console.log('Profile loaded:', this.data);
        } else {
            console.log('New profile created');
        }
    }
    
    // Save profile to localStorage
    save() {
        localStorage.setItem('breachProtocolProfile', JSON.stringify(this.data));
        console.log('Profile saved:', this.data);
    }
    
    // Add gold
    addGold(amount) {
        this.data.gold += amount;
        this.save();
    }
    
    // Spend gold (for future shop)
    spendGold(amount) {
        if (this.data.gold >= amount) {
            this.data.gold -= amount;
            this.save();
            return true;
        }
        return false;
    }
    
    // Update stats after a run
    recordRun(kills, timeAlive, level) {
        this.data.stats.totalRuns++;
        this.data.stats.totalKills += kills;
        this.data.stats.totalTimeAlive += timeAlive;
        this.data.stats.longestRun = Math.max(this.data.stats.longestRun, timeAlive);
        this.data.stats.highestLevel = Math.max(this.data.stats.highestLevel, level);
        this.save();
    }
    
    // Get current gold
    getGold() {
        return this.data.gold;
    }
    
    // Get stats
    getStats() {
        return this.data.stats;
    }
    
    // Reset profile (for testing)
    reset() {
        localStorage.removeItem('breachProtocolProfile');
        this.data = {
            gold: 0,
            stats: {
                totalRuns: 0,
                totalKills: 0,
                totalTimeAlive: 0,
                longestRun: 0,
                highestLevel: 0
            }
        };
        console.log('Profile reset');
    }
}

// Export as singleton
export const playerProfile = new PlayerProfile();


2. UPDATE GAME INITIALIZATION

In your main game file (index.js or main.js), import the profile:

import { playerProfile } from './js/systems/PlayerProfile.js';

Initialize it early in the game startup:

// After other system initialization
console.log('Player Profile:', playerProfile.data);


3. ADD DEBUG COMMAND (Optional but helpful)

In your debug menu or console, add commands:

// View profile
window.viewProfile = () => console.log(playerProfile.data);

// Add gold for testing
window.addGold = (amount) => {
    playerProfile.addGold(amount);
    console.log(`Added ${amount} gold. Total: ${playerProfile.getGold()}`);
};

// Reset profile
window.resetProfile = () => playerProfile.reset();


TESTING:

After implementation, open browser console and test:

1. Check profile loads:
   > viewProfile()
   Should show: {gold: 0, stats: {...}}

2. Add gold:
   > addGold(100)
   Should show: "Added 100 gold. Total: 100"

3. Refresh page:
   > viewProfile()
   Should show: {gold: 100, ...} (gold persists!)

4. Reset:
   > resetProfile()
   Should show: {gold: 0, stats: {...}}


IMPORTANT NOTES:

- Don't modify existing game systems yet
- This is just data storage, no gameplay impact yet
- localStorage works in all modern browsers
- Data persists until browser cache is cleared
- Profile auto-saves on every change

AVOID:

- Don't connect this to gameplay yet (Phases 2-5 will do that)
- Don't add complex unlock systems (too early)
- Don't modify existing save/load if it exists (this is separate)


ERROR HANDLING:

If localStorage fails (privacy mode, etc.), the profile should still 
work in-memory, just won't persist:

load() {
    try {
        const saved = localStorage.getItem('breachProtocolProfile');
        if (saved) {
            this.data = JSON.parse(saved);
        }
    } catch (e) {
        console.warn('localStorage unavailable, using in-memory profile');
    }
}

save() {
    try {
        localStorage.setItem('breachProtocolProfile', JSON.stringify(this.data));
    } catch (e) {
        console.warn('Could not save profile');
    }
}
```

---

## Testing Checklist

After implementation:

- [ ] Game loads without errors
- [ ] Console shows "Profile loaded" or "New profile created"
- [ ] `viewProfile()` command works
- [ ] `addGold(50)` increases gold to 50
- [ ] Refresh page → gold is still 50 (persists!)
- [ ] `resetProfile()` resets gold to 0
- [ ] No impact on gameplay yet (that's correct)

---

## What This Enables

**Phase 2** will use `playerProfile.recordRun()` when extracting
**Phase 3** will use `playerProfile.addGold()` to grant rewards
**Phase 4** will use `playerProfile.getGold()` to display currency
**Phase 5** will use `playerProfile.spendGold()` for unlocks (future)

---

## If Something Goes Wrong

**Issue: "localStorage is not defined"**
- You might be testing in Node.js instead of browser
- Make sure game is running in a web browser

**Issue: Profile resets every refresh**
- Check browser console for errors
- Verify localStorage.setItem is being called
- Check if browser is in private/incognito mode

**Issue: Import error**
- Make sure file path is correct
- Verify you're using ES6 modules (type="module" in HTML)

**Issue: "playerProfile is undefined"**
- Ensure you exported it: `export const playerProfile = new PlayerProfile();`
- Ensure you imported it: `import { playerProfile } from '...'`

---

## Next Step

Once this works and you can see gold persisting between refreshes:

**→ Move to Phase 2: Extraction Points**

Open `prompt_2_extraction_points.md`
