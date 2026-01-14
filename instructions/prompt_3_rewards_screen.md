# PHASE 3: Rewards Screen

**Estimated Time:** 1.5 hours
**Difficulty:** Medium
**Dependencies:** Phase 1 (PlayerProfile), Phase 2 (ExtractionPoints)

---

## What We're Building

End-of-run screen that shows:
- Mission result (Extracted vs. Signal Lost)
- Stats (Time, Level, Kills)
- Gold earned (only if extracted)
- Option to return to title screen (hub in Phase 4)

**Gold Formula:**
- 2:00 extraction: 50 gold
- 3:30 extraction: 100 gold
- 5:00 extraction: 200 gold
- Death: 0 gold

---

## AI Implementation Prompt

```
I need to create a rewards screen that displays run results and grants 
gold to the player profile when they successfully extract.

REQUIREMENTS:

1. CREATE NEW FILE: js/screens/RewardsScreen.js

import { playerProfile } from '../systems/PlayerProfile.js';

class RewardsScreen {
    constructor() {
        this.active = false;
        this.runData = null;
    }
    
    show(runData) {
        this.active = true;
        this.runData = runData;
        
        // Calculate and grant gold if extraction was successful
        if (runData.extracted) {
            const goldEarned = this.calculateGold(runData.extractionTime);
            playerProfile.addGold(goldEarned);
            this.runData.goldEarned = goldEarned;
        } else {
            this.runData.goldEarned = 0;
        }
        
        // Record stats
        playerProfile.recordRun(
            runData.kills,
            runData.timeSurvived,
            runData.level
        );
        
        console.log('Rewards screen shown:', this.runData);
    }
    
    calculateGold(extractionTime) {
        // Gold based on when player extracted
        if (extractionTime < 130) {        // ~2:00
            return 50;
        } else if (extractionTime < 220) { // ~3:30
            return 100;
        } else {                           // ~5:00+
            return 200;
        }
    }
    
    hide() {
        this.active = false;
        this.runData = null;
    }
    
    handleInput(key) {
        // Space or R to continue
        if (key === 'Space' || key === 'KeyR') {
            this.hide();
            return true; // Signal to transition to next screen
        }
        return false;
    }
    
    draw(renderer) {
        if (!this.active) return;
        
        const centerX = renderer.width / 2;
        const centerY = renderer.height / 2;
        
        // Background overlay
        renderer.drawRect(0, 0, renderer.width, renderer.height, 'rgba(0, 0, 0, 0.85)');
        
        // Title
        const title = this.runData.extracted ? 'EXTRACTION SUCCESSFUL' : 'SIGNAL LOST';
        const titleColor = this.runData.extracted ? '#00ff00' : '#ff0000';
        renderer.drawText(title, centerX, 100, titleColor, 4);
        
        // Stats Box
        const boxY = 200;
        const lineHeight = 40;
        
        renderer.drawText('=== MISSION REPORT ===', centerX, boxY, '#ffffff', 2);
        
        // Time
        const minutes = Math.floor(this.runData.timeSurvived / 60);
        const seconds = Math.floor(this.runData.timeSurvived % 60);
        renderer.drawText(
            `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`,
            centerX,
            boxY + lineHeight * 1,
            '#cccccc',
            2
        );
        
        // Level
        renderer.drawText(
            `Level Reached: ${this.runData.level}`,
            centerX,
            boxY + lineHeight * 2,
            '#cccccc',
            2
        );
        
        // Kills
        renderer.drawText(
            `Enemies Eliminated: ${this.runData.kills}`,
            centerX,
            boxY + lineHeight * 3,
            '#cccccc',
            2
        );
        
        // Gold earned (highlight)
        const goldColor = this.runData.goldEarned > 0 ? '#ffff00' : '#ff0000';
        renderer.drawText(
            `Gold Earned: ${this.runData.goldEarned}`,
            centerX,
            boxY + lineHeight * 4.5,
            goldColor,
            3
        );
        
        // Total gold
        renderer.drawText(
            `Total Gold: ${playerProfile.getGold()}`,
            centerX,
            boxY + lineHeight * 5.5,
            '#00ffff',
            2
        );
        
        // Continue prompt
        renderer.drawText(
            'PRESS [SPACE] TO CONTINUE',
            centerX,
            renderer.height - 80,
            '#888888',
            2
        );
    }
}

export default RewardsScreen;


2. INTEGRATE WITH GAME STATE MACHINE

Update your game state management to handle rewards screen:

// Add new state
const GameState = {
    TITLE: 'title',
    PLAYING: 'playing',
    PAUSED: 'paused',
    REWARDS: 'rewards', // NEW
    GAME_OVER: 'game_over'
};

// Import rewards screen
import RewardsScreen from './js/screens/RewardsScreen.js';

// In game initialization
this.rewardsScreen = new RewardsScreen();

// Modify extraction handling (from Phase 2)
if (extractionResult.extracted) {
    // Collect run data
    const runData = {
        extracted: true,
        extractionTime: this.gameTime,
        timeSurvived: this.gameTime,
        level: this.player.level,
        kills: this.killCount
    };
    
    // Show rewards screen
    this.rewardsScreen.show(runData);
    this.gameState = GameState.REWARDS;
}

// Modify death handling
onPlayerDeath() {
    const runData = {
        extracted: false,
        timeSurvived: this.gameTime,
        level: this.player.level,
        kills: this.killCount
    };
    
    this.rewardsScreen.show(runData);
    this.gameState = GameState.REWARDS;
}

// In update loop
if (this.gameState === GameState.REWARDS) {
    // Handle input
    if (/* Space or R pressed */) {
        if (this.rewardsScreen.handleInput('Space')) {
            // For now, go back to title screen
            // Phase 4 will change this to hub
            this.gameState = GameState.TITLE;
            this.resetGame();
        }
    }
}

// In render loop
if (this.gameState === GameState.REWARDS) {
    // Draw frozen game state behind rewards
    this.drawGame(); // Draw world, enemies, player (frozen)
    this.rewardsScreen.draw(this.renderer);
}


3. UPDATE RENDERER (if needed)

If your renderer doesn't have drawRect method:

// In ASCIIRenderer or your renderer class
drawRect(x, y, width, height, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
}


4. INPUT HANDLING FOR REWARDS SCREEN

In your input system, detect Space/R key in REWARDS state:

// In keydown handler
if (this.gameState === GameState.REWARDS) {
    if (e.code === 'Space' || e.code === 'KeyR') {
        if (this.rewardsScreen.handleInput(e.code)) {
            // Transition handled
        }
    }
}


TESTING:

Test Scenario 1: Successful Extraction
1. Start run
2. Survive to 2:00
3. Extract at 2:00 point
4. Rewards screen shows:
   - "EXTRACTION SUCCESSFUL" (green)
   - Time: 2:00
   - Level: ~8-10
   - Kills: ~150-200
   - Gold Earned: 50 (yellow)
   - Total Gold: 50
5. Press Space
6. Return to title screen (for now)
7. Check console: playerProfile.data.gold should be 50

Test Scenario 2: Later Extraction (More Gold)
1. New run
2. Survive to 3:30
3. Extract at 3:30 point
4. Rewards screen shows:
   - Gold Earned: 100
   - Total Gold: 150 (50 from previous + 100 new)
5. Refresh page
6. Check console: viewProfile() shows 150 gold (persisted!)

Test Scenario 3: Death (No Gold)
1. New run
2. Let enemies kill you before extracting
3. Rewards screen shows:
   - "SIGNAL LOST" (red)
   - Gold Earned: 0 (red)
   - Total Gold: 150 (unchanged)
4. Stats still recorded (kills, time, level)


IMPORTANT NOTES:

- Gold only granted on successful extraction
- Death = 0 gold, but stats are still recorded
- Gold persists between sessions (localStorage)
- Total gold accumulates across runs
- Can't "spend" gold yet (Phase 5)

AVOID:

- Don't add shop/unlocks yet (too early)
- Don't add loot boxes (not in MVP)
- Don't add XP persistence (gold is enough for now)


EDGE CASES:

1. Player extracts at exactly 2:00:
   - Give 50 gold (early extraction)

2. Player survives past 5:00 but dies:
   - Give 0 gold (no extraction = no reward)

3. Player extracts at 5:30:
   - Give 200 gold (max reward)

4. localStorage fails:
   - Gold still shows in session, just won't persist
   - PlayerProfile handles this gracefully
```

---

## Testing Checklist

After implementation:

- [ ] Extract at 2:00 → Rewards screen shows 50 gold
- [ ] Extract at 3:30 → Shows 100 gold
- [ ] Extract at 5:00 → Shows 200 gold
- [ ] Die before extracting → Shows 0 gold
- [ ] Gold accumulates across runs (50 + 100 = 150)
- [ ] Refresh page → Gold persists
- [ ] Stats update (kills, time, level)
- [ ] Press Space → Returns to title screen
- [ ] No errors in console

---

## Visual Reference

**Successful Extraction Screen:**
```
          EXTRACTION SUCCESSFUL (green)

          === MISSION REPORT ===
          
          Time: 3:30
          Level Reached: 14
          Enemies Eliminated: 456
          
          Gold Earned: 100 (yellow, large)
          Total Gold: 150 (cyan)
          
          
          
          PRESS [SPACE] TO CONTINUE (gray)
```

**Death Screen:**
```
          SIGNAL LOST (red)

          === MISSION REPORT ===
          
          Time: 2:15
          Level Reached: 10
          Enemies Eliminated: 203
          
          Gold Earned: 0 (red, large)
          Total Gold: 150 (cyan)
          
          
          
          PRESS [SPACE] TO CONTINUE (gray)
```

---

## Common Issues

**Issue: Gold doesn't persist**
- Check playerProfile.save() is called
- Verify localStorage is working
- Check browser isn't in private mode

**Issue: Rewards screen doesn't show**
- Verify gameState is set to REWARDS
- Check rewardsScreen.show() is called
- Ensure runData has all required fields

**Issue: Gold amount is wrong**
- Check calculateGold() time thresholds
- Verify extractionTime is correct
- Log the values to debug

**Issue: Can't close rewards screen**
- Check input handling in REWARDS state
- Verify handleInput() returns true
- Check Space key detection

---

## What This Enables

Now players can:
- See immediate results of their run
- Earn gold for successful extractions
- Track their total gold accumulation
- Understand risk/reward of different extraction times

**Next: Create a hub to spend that gold!**

---

## Next Step

Once rewards screen shows and gold persists:

**→ Move to Phase 4: Hub Menu**

Open `prompt_4_hub_menu.md`
