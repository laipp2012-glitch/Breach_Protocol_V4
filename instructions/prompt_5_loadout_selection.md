# PHASE 5: Loadout Selection

**Estimated Time:** 2 hours
**Difficulty:** Medium-Hard
**Dependencies:** Phase 4 (HubScreen)

---

## What We're Building

Pre-run screen where players choose:
- **1 Starting Weapon** (Magic Wand, Knife, or Garlic)
- **1 Starting Passive** (Wings or Vigor)

This adds strategic choice to each run and prevents all runs from feeling identical.

---

## AI Implementation Prompt

```
I need to create a loadout selection screen that allows players to 
choose their starting equipment before beginning a run.

REQUIREMENTS:

1. CREATE NEW FILE: js/screens/LoadoutScreen.js

class LoadoutScreen {
    constructor() {
        this.active = false;
        this.selectedCategory = 'weapon'; // 'weapon' or 'passive'
        this.selectedWeaponIndex = 0;
        this.selectedPassiveIndex = 0;
        
        // Available starting options (IDs from WeaponConfig/PassiveConfig)
        this.weaponOptions = [
            { id: 'wand', name: 'Magic Wand', symbol: '¡', color: '#8888ff', desc: 'Auto-targets nearest enemy' },
            { id: 'knife', name: 'Throwing Knife', symbol: '†', color: '#cccccc', desc: 'Fires in movement direction' },
            { id: 'garlic', name: 'Garlic Aura', symbol: '○', color: '#ffff00', desc: 'Damage field around player' }
        ];
        
        this.passiveOptions = [
            { id: 'wings', name: 'Wings', symbol: '^', color: '#00ffff', desc: '+15% Movement Speed' },
            { id: 'vigor', name: 'Vigor', symbol: 'H', color: '#ff0000', desc: '+30 Max Health' }
        ];
    }
    
    show() {
        this.active = true;
        this.selectedCategory = 'weapon';
        this.selectedWeaponIndex = 0;
        this.selectedPassiveIndex = 0;
    }
    
    hide() {
        this.active = false;
    }
    
    handleInput(key) {
        // Tab to switch between weapon/passive
        if (key === 'Tab') {
            this.selectedCategory = this.selectedCategory === 'weapon' ? 'passive' : 'weapon';
            return null;
        }
        
        // Navigate options
        if (key === 'KeyA' || key === 'ArrowLeft') {
            this.navigateLeft();
        } else if (key === 'KeyD' || key === 'ArrowRight') {
            this.navigateRight();
        } else if (key === 'Space' || key === 'Enter') {
            // Confirm selection and start run
            return this.confirmLoadout();
        } else if (key === 'Escape') {
            // Cancel and return to hub
            return 'hub';
        }
        
        return null;
    }
    
    navigateLeft() {
        if (this.selectedCategory === 'weapon') {
            this.selectedWeaponIndex = (this.selectedWeaponIndex - 1 + this.weaponOptions.length) % this.weaponOptions.length;
        } else {
            this.selectedPassiveIndex = (this.selectedPassiveIndex - 1 + this.passiveOptions.length) % this.passiveOptions.length;
        }
    }
    
    navigateRight() {
        if (this.selectedCategory === 'weapon') {
            this.selectedWeaponIndex = (this.selectedWeaponIndex + 1) % this.weaponOptions.length;
        } else {
            this.selectedPassiveIndex = (this.selectedPassiveIndex + 1) % this.passiveOptions.length;
        }
    }
    
    confirmLoadout() {
        const selectedWeapon = this.weaponOptions[this.selectedWeaponIndex];
        const selectedPassive = this.passiveOptions[this.selectedPassiveIndex];
        
        console.log('Loadout confirmed:', selectedWeapon.id, selectedPassive.id);
        
        return {
            weapon: selectedWeapon.id,
            passive: selectedPassive.id
        };
    }
    
    draw(renderer) {
        if (!this.active) return;
        
        const centerX = renderer.width / 2;
        const centerY = renderer.height / 2;
        
        // Background
        renderer.drawRect(0, 0, renderer.width, renderer.height, '#000000');
        
        // Title
        renderer.drawText('MISSION LOADOUT', centerX, 60, '#00ffff', 4);
        renderer.drawText('Select your starting equipment', centerX, 110, '#888888', 2);
        
        // Weapon selection
        this.drawWeaponSelection(renderer, centerX, 180);
        
        // Passive selection
        this.drawPassiveSelection(renderer, centerX, 400);
        
        // Controls
        renderer.drawText(
            '[TAB] Switch Category  [A/D] Navigate  [SPACE] Confirm  [ESC] Cancel',
            centerX,
            renderer.height - 40,
            '#666666',
            1
        );
    }
    
    drawWeaponSelection(renderer, centerX, startY) {
        const isActive = this.selectedCategory === 'weapon';
        const headerColor = isActive ? '#ffff00' : '#666666';
        
        // Header
        renderer.drawText('WEAPON', centerX, startY, headerColor, 3);
        
        if (isActive) {
            renderer.drawText('>', centerX - 200, startY, '#ffff00', 2);
            renderer.drawText('<', centerX + 200, startY, '#ffff00', 2);
        }
        
        // Options (horizontally laid out)
        const spacing = 250;
        const baseX = centerX - spacing;
        
        this.weaponOptions.forEach((weapon, i) => {
            const x = baseX + i * spacing;
            const y = startY + 80;
            const isSelected = isActive && i === this.selectedWeaponIndex;
            
            // Box
            if (isSelected) {
                renderer.drawRect(x - 80, y - 60, 160, 160, '#333333');
            }
            
            // Symbol
            renderer.drawText(weapon.symbol, x, y - 20, weapon.color, 5);
            
            // Name
            const nameColor = isSelected ? '#ffffff' : '#888888';
            renderer.drawText(weapon.name, x, y + 30, nameColor, 2);
            
            // Description (only for selected)
            if (isSelected) {
                renderer.drawText(weapon.desc, x, y + 70, '#aaaaaa', 1);
            }
        });
    }
    
    drawPassiveSelection(renderer, centerX, startY) {
        const isActive = this.selectedCategory === 'passive';
        const headerColor = isActive ? '#ffff00' : '#666666';
        
        // Header
        renderer.drawText('PASSIVE', centerX, startY, headerColor, 3);
        
        if (isActive) {
            renderer.drawText('>', centerX - 200, startY, '#ffff00', 2);
            renderer.drawText('<', centerX + 200, startY, '#ffff00', 2);
        }
        
        // Options (horizontally laid out)
        const spacing = 300;
        const baseX = centerX - spacing / 2;
        
        this.passiveOptions.forEach((passive, i) => {
            const x = baseX + i * spacing;
            const y = startY + 80;
            const isSelected = isActive && i === this.selectedPassiveIndex;
            
            // Box
            if (isSelected) {
                renderer.drawRect(x - 80, y - 60, 160, 160, '#333333');
            }
            
            // Symbol
            renderer.drawText(passive.symbol, x, y - 20, passive.color, 5);
            
            // Name
            const nameColor = isSelected ? '#ffffff' : '#888888';
            renderer.drawText(passive.name, x, y + 30, nameColor, 2);
            
            // Description (only for selected)
            if (isSelected) {
                renderer.drawText(passive.desc, x, y + 70, '#aaaaaa', 1);
            }
        });
    }
}

export default LoadoutScreen;


2. INTEGRATE WITH GAME STATE MACHINE

// Import loadout screen
import LoadoutScreen from './js/screens/LoadoutScreen.js';

// In game initialization
this.loadoutScreen = new LoadoutScreen();

// Add LOADOUT state
const GameState = {
    HUB: 'hub',
    LOADOUT: 'loadout', // NEW
    PLAYING: 'playing',
    PAUSED: 'paused',
    REWARDS: 'rewards',
    GAME_OVER: 'game_over'
};

// Update hub to go to loadout instead of directly to playing
// In hub input handling:
const action = this.hubScreen.handleInput(key);
if (action === 'loadout') {
    this.gameState = GameState.LOADOUT;
    this.loadoutScreen.show();
}


3. HANDLE LOADOUT CONFIRMATION

// In update loop
if (this.gameState === GameState.LOADOUT) {
    // Handle input
}

// In input handler
if (this.gameState === GameState.LOADOUT) {
    const result = this.loadoutScreen.handleInput(e.code);
    
    if (result === 'hub') {
        // Cancelled, return to hub
        this.gameState = GameState.HUB;
        this.loadoutScreen.hide();
        this.hubScreen.show();
    } else if (result && result.weapon && result.passive) {
        // Loadout confirmed, start run with selections
        this.startNewRunWithLoadout(result.weapon, result.passive);
        this.gameState = GameState.PLAYING;
        this.loadoutScreen.hide();
    }
}

// In render loop
if (this.gameState === GameState.LOADOUT) {
    this.loadoutScreen.draw(this.renderer);
}


4. APPLY LOADOUT TO RUN

Update startNewRun to accept loadout parameters:

startNewRunWithLoadout(weaponId, passiveId) {
    // Reset game state
    this.gameTime = 0;
    this.killCount = 0;
    
    // Reset player
    this.player.reset();
    
    // Reset systems
    this.spawnSystem.reset();
    this.extractionSystem.reset();
    
    // **IMPORTANT**: Apply starting loadout
    // Add weapon
    this.weaponSystem.addWeapon(weaponId); // Use your weapon system's method
    
    // Add passive
    this.passiveSystem.addPassive(passiveId); // Use your passive system's method
    
    console.log(`Run started with ${weaponId} + ${passiveId}`);
}


5. WEAPON/PASSIVE SYSTEM INTEGRATION

If your weapon/passive systems don't have addWeapon/addPassive methods:

// In WeaponSystem
addWeapon(weaponId) {
    if (this.weapons[weaponId]) {
        console.warn('Weapon already owned:', weaponId);
        return;
    }
    
    // Get weapon config
    const config = WeaponConfig[weaponId];
    
    // Create weapon instance
    this.weapons[weaponId] = {
        id: weaponId,
        level: 1,
        config: config,
        cooldownTimer: 0
    };
    
    console.log('Weapon added:', weaponId);
}

// In PassiveSystem
addPassive(passiveId) {
    if (this.passives[passiveId]) {
        console.warn('Passive already owned:', passiveId);
        return;
    }
    
    // Get passive config
    const config = PassiveConfig[passiveId];
    
    // Create passive instance
    this.passives[passiveId] = {
        id: passiveId,
        level: 1,
        config: config
    };
    
    // Apply stat bonus immediately
    this.applyPassiveBonus(passiveId);
    
    console.log('Passive added:', passiveId);
}


TESTING:

Test Scenario 1: Basic Loadout Flow
1. Start game at hub
2. Select START MISSION
3. Loadout screen appears
4. Weapon category active (yellow header)
5. Magic Wand selected by default
6. Press D → Knife selected
7. Press Tab → Passive category active
8. Wings selected by default
9. Press Space → Run starts
10. Check: Player has Knife and Wings equipped

Test Scenario 2: Different Loadout
1. At loadout screen
2. Select Garlic (weapon)
3. Select Vigor (passive)
4. Confirm
5. Run starts with Garlic aura active + 130 HP (100 + 30)

Test Scenario 3: Cancel Loadout
1. At loadout screen
2. Press ESC
3. Return to hub (not starting run)
4. Can select START MISSION again

Test Scenario 4: Multiple Runs
1. First run: Knife + Wings
2. Extract
3. At hub, start new mission
4. Second run: Wand + Vigor
5. Verify different starting equipment


IMPORTANT NOTES:

- Loadout only affects starting gear (not later upgrades)
- Players can still get other weapons/passives during run via level-ups
- Starting choice creates different early game strategies
- All options are "unlocked" for now (no progression system yet)

AVOID:

- Don't add unlock requirements yet (all options available)
- Don't add more than 3 weapons / 2 passives (keeps choice simple)
- Don't save "last used loadout" (let players choose every time)


FUTURE ENHANCEMENTS (Post-MVP):

After extraction loop is proven:
- Add more starting options
- Require gold/progress to unlock options
- Add "recommended" or "random" loadout button
- Save last used loadout as default
- Add weapon/passive stats preview
```

---

## Testing Checklist

After implementation:

- [ ] Hub → START MISSION → Loadout screen
- [ ] Can navigate weapons with A/D
- [ ] Tab switches to passive selection
- [ ] Can navigate passives with A/D
- [ ] Selected items highlighted (yellow header)
- [ ] Descriptions show for selected items
- [ ] Space confirms and starts run
- [ ] Run starts with chosen weapon + passive
- [ ] ESC returns to hub without starting
- [ ] Different loadouts work on multiple runs
- [ ] No errors in console

---

## Visual Reference

**Loadout Screen (Weapon Active):**
```
          MISSION LOADOUT (cyan)
          Select your starting equipment (gray)
          
     >    WEAPON (yellow)    <
          
     Magic Wand    Throwing Knife    Garlic Aura
         ¡ (blue)      † (silver)      ○ (yellow)
         
     (selected)      (unselected)    (unselected)
     
     Auto-targets nearest enemy
     
     
          PASSIVE (gray)
          
          Wings         Vigor
         ^ (cyan)      H (red)
         
         
[TAB] Switch  [A/D] Navigate  [SPACE] Confirm  [ESC] Cancel
```

**Loadout Screen (Passive Active):**
```
          MISSION LOADOUT
          
          WEAPON (gray)
          
     Magic Wand    Throwing Knife    Garlic Aura
     
     
     
     >    PASSIVE (yellow)    <
          
          Wings         Vigor
         ^ (cyan)      H (red)
         
     (selected)    (unselected)
     
     +15% Movement Speed
```

---

## Common Issues

**Issue: Loadout doesn't apply to run**
- Check startNewRunWithLoadout is called correctly
- Verify weaponSystem.addWeapon() works
- Check player actually has weapon during run
- Log weapon/passive IDs to debug

**Issue: Tab key doesn't switch**
- Check Tab key detection (e.code === 'Tab')
- Verify selectedCategory toggles
- Check visual feedback (header color)

**Issue: Navigation doesn't work**
- Check A/D key detection
- Verify index wrapping (modulo operator)
- Check options array has items

**Issue: Run starts with wrong gear**
- Verify IDs match WeaponConfig/PassiveConfig
- Check addWeapon/addPassive use correct IDs
- Log selected options on confirmation

---

## What This Completes

**🎉 FULL EXTRACTION LOOP IS NOW COMPLETE! 🎉**

Players can now:
1. Start at hub
2. Choose loadout (weapon + passive)
3. Play run with chosen gear
4. Find extraction points at 2:00, 3:30, 5:00
5. Extract to earn gold
6. See rewards screen
7. Return to hub with accumulated gold
8. Start new run with different loadout

**You have successfully built an extraction roguelite prototype!**

---

## Next Step

**PLAYTEST THE FULL LOOP!**

Do 5-10 complete runs:
- Try different loadouts
- Extract at different times
- Intentionally die a few times
- Check if gold accumulates
- Verify stats update

**Then come back and tell me:**
1. Does the extraction decision feel meaningful?
2. Is the risk/reward balance right?
3. Does gold accumulation feel rewarding?
4. What should you build next?

**You did it! 🚀**
