# PHASE 4: Hub Menu

**Estimated Time:** 2 hours
**Difficulty:** Medium-Hard
**Dependencies:** Phase 1 (PlayerProfile), Phase 3 (RewardsScreen)

---

## What We're Building

Central hub menu that serves as the "home base" between runs:
- **START RUN** - Begin a new mission
- **STORAGE** - View gold and stats
- **UPGRADES** - Placeholder for future shop (not implemented yet)
- **QUIT** - Exit game

The hub is now the **entry point** of the game, not the title screen.

---

## AI Implementation Prompt

```
I need to create a hub menu system that serves as the central navigation 
between runs, replacing the title screen as the game's entry point.

REQUIREMENTS:

1. CREATE NEW FILE: js/screens/HubScreen.js

import { playerProfile } from '../systems/PlayerProfile.js';

class HubScreen {
    constructor() {
        this.active = false;
        this.selectedOption = 0;
        this.options = [
            { text: 'START MISSION', action: 'start' },
            { text: 'STORAGE', action: 'storage' },
            { text: 'UPGRADES', action: 'upgrades' },
            { text: 'QUIT', action: 'quit' }
        ];
        this.showingStorage = false;
        this.showingUpgrades = false;
    }
    
    show() {
        this.active = true;
        this.selectedOption = 0;
        this.showingStorage = false;
        this.showingUpgrades = false;
    }
    
    hide() {
        this.active = false;
    }
    
    handleInput(key) {
        if (this.showingStorage || this.showingUpgrades) {
            // ESC to close submenus
            if (key === 'Escape') {
                this.showingStorage = false;
                this.showingUpgrades = false;
            }
            return null;
        }
        
        // Navigate menu
        if (key === 'KeyW' || key === 'ArrowUp') {
            this.selectedOption = (this.selectedOption - 1 + this.options.length) % this.options.length;
        } else if (key === 'KeyS' || key === 'ArrowDown') {
            this.selectedOption = (this.selectedOption + 1) % this.options.length;
        } else if (key === 'Space' || key === 'Enter') {
            return this.selectOption();
        }
        
        return null;
    }
    
    selectOption() {
        const action = this.options[this.selectedOption].action;
        
        switch (action) {
            case 'start':
                return 'loadout'; // Go to loadout screen (Phase 5)
                
            case 'storage':
                this.showingStorage = true;
                return null;
                
            case 'upgrades':
                this.showingUpgrades = true;
                return null;
                
            case 'quit':
                // Close tab or show confirmation
                if (confirm('Exit Breach Protocol?')) {
                    window.close();
                }
                return null;
        }
    }
    
    draw(renderer) {
        if (!this.active) return;
        
        const centerX = renderer.width / 2;
        const centerY = renderer.height / 2;
        
        // If showing submenu, render that instead
        if (this.showingStorage) {
            this.drawStorage(renderer, centerX, centerY);
            return;
        }
        
        if (this.showingUpgrades) {
            this.drawUpgrades(renderer, centerX, centerY);
            return;
        }
        
        // Main hub screen
        
        // Background
        renderer.drawRect(0, 0, renderer.width, renderer.height, '#000000');
        
        // Title
        renderer.drawText('BREACH PROTOCOL', centerX, 80, '#00ffff', 5);
        renderer.drawText('COMMAND CENTER', centerX, 130, '#00ff00', 3);
        
        // Menu options
        const menuStartY = 250;
        const lineHeight = 60;
        
        this.options.forEach((option, i) => {
            const y = menuStartY + i * lineHeight;
            const isSelected = i === this.selectedOption;
            
            // Selector
            if (isSelected) {
                renderer.drawText('>', centerX - 150, y, '#ffff00', 3);
                renderer.drawText('<', centerX + 150, y, '#ffff00', 3);
            }
            
            // Option text
            const color = isSelected ? '#ffffff' : '#888888';
            const size = isSelected ? 3 : 2;
            renderer.drawText(option.text, centerX, y, color, size);
        });
        
        // Gold display (bottom)
        renderer.drawText(
            `CREDITS: ${playerProfile.getGold()}`,
            centerX,
            renderer.height - 60,
            '#ffff00',
            2
        );
        
        // Controls hint
        renderer.drawText(
            '[W/S] Navigate  [SPACE] Select',
            centerX,
            renderer.height - 30,
            '#666666',
            1
        );
    }
    
    drawStorage(renderer, centerX, centerY) {
        // Background
        renderer.drawRect(0, 0, renderer.width, renderer.height, '#000000');
        
        // Title
        renderer.drawText('STORAGE', centerX, 60, '#00ffff', 4);
        
        // Gold
        renderer.drawText('=== CREDITS ===', centerX, 150, '#ffffff', 2);
        renderer.drawText(
            `${playerProfile.getGold()}`,
            centerX,
            200,
            '#ffff00',
            4
        );
        
        // Stats
        const stats = playerProfile.getStats();
        const statsY = 280;
        const lineHeight = 40;
        
        renderer.drawText('=== STATISTICS ===', centerX, statsY, '#ffffff', 2);
        
        renderer.drawText(
            `Total Runs: ${stats.totalRuns}`,
            centerX,
            statsY + lineHeight * 1,
            '#cccccc',
            2
        );
        
        renderer.drawText(
            `Total Kills: ${stats.totalKills}`,
            centerX,
            statsY + lineHeight * 2,
            '#cccccc',
            2
        );
        
        const minutes = Math.floor(stats.totalTimeAlive / 60);
        renderer.drawText(
            `Total Time: ${minutes}m`,
            centerX,
            statsY + lineHeight * 3,
            '#cccccc',
            2
        );
        
        const longestMin = Math.floor(stats.longestRun / 60);
        const longestSec = Math.floor(stats.longestRun % 60);
        renderer.drawText(
            `Longest Run: ${longestMin}:${longestSec.toString().padStart(2, '0')}`,
            centerX,
            statsY + lineHeight * 4,
            '#cccccc',
            2
        );
        
        renderer.drawText(
            `Highest Level: ${stats.highestLevel}`,
            centerX,
            statsY + lineHeight * 5,
            '#cccccc',
            2
        );
        
        // Back prompt
        renderer.drawText(
            'PRESS [ESC] TO RETURN',
            centerX,
            renderer.height - 50,
            '#888888',
            2
        );
    }
    
    drawUpgrades(renderer, centerX, centerY) {
        // Background
        renderer.drawRect(0, 0, renderer.width, renderer.height, '#000000');
        
        // Title
        renderer.drawText('UPGRADES', centerX, 60, '#00ffff', 4);
        
        // Placeholder
        renderer.drawText(
            'SYSTEM OFFLINE',
            centerX,
            centerY - 40,
            '#ff0000',
            3
        );
        
        renderer.drawText(
            'This feature will be available',
            centerX,
            centerY + 20,
            '#888888',
            2
        );
        
        renderer.drawText(
            'in a future update.',
            centerX,
            centerY + 60,
            '#888888',
            2
        );
        
        // Back prompt
        renderer.drawText(
            'PRESS [ESC] TO RETURN',
            centerX,
            renderer.height - 50,
            '#888888',
            2
        );
    }
}

export default HubScreen;


2. MODIFY GAME STATE MACHINE

Update your game initialization to start at hub:

// Import hub
import HubScreen from './js/screens/HubScreen.js';

// In game initialization
this.hubScreen = new HubScreen();

// Start at hub instead of title screen
this.gameState = GameState.HUB; // NEW state
this.hubScreen.show();

// Add HUB state to GameState enum
const GameState = {
    HUB: 'hub',        // NEW
    TITLE: 'title',    // Can keep or remove
    PLAYING: 'playing',
    PAUSED: 'paused',
    REWARDS: 'rewards',
    GAME_OVER: 'game_over'
};


3. UPDATE STATE TRANSITIONS

From Rewards → Hub:
// In rewards screen input handling
if (this.rewardsScreen.handleInput('Space')) {
    this.gameState = GameState.HUB;  // Changed from TITLE
    this.hubScreen.show();
}

From Hub → Loadout (Phase 5 will implement this):
// In hub screen input handling
const action = this.hubScreen.handleInput(key);
if (action === 'loadout') {
    // For now, just start game directly
    // Phase 5 will add loadout screen here
    this.startNewRun();
    this.gameState = GameState.PLAYING;
}


4. UPDATE GAME LOOP

// In update loop
switch (this.gameState) {
    case GameState.HUB:
        // Hub handles its own input
        break;
        
    case GameState.PLAYING:
        // Existing gameplay update
        break;
        
    // ... other states
}

// In render loop
switch (this.gameState) {
    case GameState.HUB:
        this.hubScreen.draw(this.renderer);
        break;
        
    case GameState.PLAYING:
        // Existing gameplay render
        break;
        
    // ... other states
}

// In input handler
if (this.gameState === GameState.HUB) {
    const action = this.hubScreen.handleInput(e.code);
    if (action === 'loadout') {
        // Transition to loadout or gameplay
        this.startNewRun();
        this.gameState = GameState.PLAYING;
    }
}


5. STARTING NEW RUNS

Create or update your startNewRun() method:

startNewRun() {
    // Reset game state
    this.gameTime = 0;
    this.killCount = 0;
    
    // Reset player
    this.player.reset();
    
    // Reset systems
    this.spawnSystem.reset();
    this.extractionSystem.reset();
    this.weaponSystem.reset();
    // ... reset other systems
    
    console.log('New run started');
}


TESTING:

Test Scenario 1: First Launch
1. Open game
2. Hub menu appears (not title screen)
3. Shows "CREDITS: 0"
4. Navigate with W/S keys
5. Highlight changes (yellow selector)
6. Select START MISSION
7. Game begins immediately (for now)

Test Scenario 2: After Extraction
1. Complete a run, extract at 2:00
2. Rewards screen shows 50 gold
3. Press Space
4. Hub menu appears
5. Shows "CREDITS: 50"
6. Start new run
7. Rewards screen after 2nd run shows cumulative gold

Test Scenario 3: Storage View
1. At hub, navigate to STORAGE
2. Press Space
3. Storage screen shows:
   - Gold amount
   - Total runs
   - Total kills
   - Total time
   - Longest run
   - Highest level
4. Press ESC
5. Return to main hub menu

Test Scenario 4: Upgrades (Placeholder)
1. Navigate to UPGRADES
2. Press Space
3. "SYSTEM OFFLINE" message
4. Press ESC
5. Return to hub


IMPORTANT NOTES:

- Hub is now the entry point (not title screen)
- Title screen can be removed or kept as intro
- Upgrades is a placeholder (no functionality yet)
- Storage is read-only (no actions)
- Gold accumulates and persists

AVOID:

- Don't implement shop yet (too complex for MVP)
- Don't add weapon unlocks yet (Phase 5 handles starting loadout)
- Don't add character customization yet


VISUAL IMPROVEMENTS (Optional):

Add animated background or ASCII art:
// In drawHub(), before menu
this.drawBackgroundGrid(renderer);
this.drawLogoAnimation(renderer);

Add pulsing effect to selected option:
const pulseAlpha = 0.5 + Math.sin(Date.now() / 200) * 0.5;
```

---

## Testing Checklist

After implementation:

- [ ] Game starts at hub (not title screen)
- [ ] Can navigate with W/S or arrows
- [ ] Selected option highlighted
- [ ] START MISSION begins gameplay
- [ ] STORAGE shows gold and stats
- [ ] ESC closes storage/upgrades
- [ ] After run, return to hub (not title)
- [ ] Gold persists and displays correctly
- [ ] Stats update after each run
- [ ] No errors in console

---

## Visual Reference

**Main Hub:**
```
          BREACH PROTOCOL (cyan, large)
          COMMAND CENTER (green)
          
          
          
          >  START MISSION  < (white, selected)
             STORAGE (gray)
             UPGRADES (gray)
             QUIT (gray)
          
          
          
          
          CREDITS: 250 (yellow)
          
          [W/S] Navigate  [SPACE] Select
```

**Storage View:**
```
          STORAGE (cyan)
          
          === CREDITS ===
          250 (yellow, large)
          
          === STATISTICS ===
          Total Runs: 12
          Total Kills: 3,456
          Total Time: 42m
          Longest Run: 5:30
          Highest Level: 22
          
          
          PRESS [ESC] TO RETURN
```

---

## Common Issues

**Issue: Hub doesn't show on start**
- Check gameState is set to HUB in init
- Verify hubScreen.show() is called
- Check render loop handles HUB state

**Issue: Can't start game from hub**
- Check input handling in HUB state
- Verify selectOption() returns 'loadout'
- Check startNewRun() is called

**Issue: Gold doesn't display**
- Check playerProfile.getGold() returns number
- Verify gold is persisting (Phase 1 issue)
- Check storage screen rendering

**Issue: Navigation doesn't work**
- Check W/S key detection
- Verify selectedOption wraps correctly
- Check arrow key support

---

## What This Completes

Players now have:
- ✅ Central menu between runs
- ✅ Persistent gold display
- ✅ Stats tracking
- ✅ Clear game flow: Hub → Run → Rewards → Hub

**Almost done! Just need pre-run loadout selection.**

---

## Next Step

Once hub menu works and shows gold correctly:

**→ Move to Phase 5: Loadout Selection**

Open `prompt_5_loadout_selection.md`
