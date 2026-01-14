# PHASE 2: Extraction Points

**Estimated Time:** 1.5 hours
**Difficulty:** Medium
**Dependencies:** Phase 1 (PlayerProfile)

---

## What We're Building

Timed extraction zones that appear on the map at:
- **2:00** (Early extraction - safe, low reward)
- **3:30** (Mid extraction - balanced risk/reward)
- **5:00** (Late extraction - high risk, high reward)

Players walk into the zone and press **E** to extract (end run).

---

## AI Implementation Prompt

```
I need to create extraction points that spawn at specific times during 
gameplay, allowing players to voluntarily end their run.

REQUIREMENTS:

1. CREATE NEW FILE: js/entities/ExtractionPoint.js

class ExtractionPoint {
    constructor(x, y, spawnTime) {
        this.id = `extraction_${Date.now()}`;
        this.x = x;
        this.y = y;
        this.spawnTime = spawnTime; // When this point spawned (for UI)
        this.radius = 80; // Activation radius
        this.active = false; // Player must be in radius
        this.pulseTimer = 0;
        this.pulseScale = 1.0;
    }
    
    update(deltaTime, player) {
        // Pulse animation
        this.pulseTimer += deltaTime;
        this.pulseScale = 1.0 + Math.sin(this.pulseTimer * 3) * 0.2;
        
        // Check if player is in radius
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.active = distance <= this.radius;
        
        return this.active;
    }
    
    draw(renderer, camera) {
        // Draw large pulsing circle
        renderer.drawCircle(
            this.x, 
            this.y, 
            this.radius * this.pulseScale,
            '#00ff00', // Green
            camera
        );
        
        // Draw EXIT text in center
        renderer.drawText(
            '[EXIT]',
            this.x,
            this.y - 20,
            '#00ff00',
            3, // Large size
            camera
        );
        
        // If player in radius, show prompt
        if (this.active) {
            renderer.drawText(
                'PRESS [E] TO EXTRACT',
                this.x,
                this.y + 30,
                '#ffffff',
                2,
                camera
            );
        }
    }
}

export default ExtractionPoint;


2. CREATE NEW FILE: js/systems/ExtractionSystem.js

import ExtractionPoint from '../entities/ExtractionPoint.js';

class ExtractionSystem {
    constructor() {
        this.extractionPoints = [];
        this.extractionTimes = [120, 210, 300]; // 2:00, 3:30, 5:00
        this.spawnedTimes = [];
    }
    
    update(deltaTime, gameTime, player, camera) {
        // Spawn extraction points at designated times
        for (const time of this.extractionTimes) {
            if (gameTime >= time && !this.spawnedTimes.includes(time)) {
                this.spawnExtractionPoint(player, camera, time);
                this.spawnedTimes.push(time);
            }
        }
        
        // Update all active extraction points
        for (const point of this.extractionPoints) {
            const isActive = point.update(deltaTime, player);
            
            // Check for E key press
            if (isActive && this.isExtractKeyPressed()) {
                return { extracted: true, time: gameTime };
            }
        }
        
        return { extracted: false };
    }
    
    spawnExtractionPoint(player, camera, spawnTime) {
        // Spawn near player but not too close
        const angle = Math.random() * Math.PI * 2;
        const distance = 300; // 300px from player
        
        const x = player.x + Math.cos(angle) * distance;
        const y = player.y + Math.sin(angle) * distance;
        
        const point = new ExtractionPoint(x, y, spawnTime);
        this.extractionPoints.push(point);
        
        console.log(`Extraction point spawned at ${spawnTime}s`);
    }
    
    isExtractKeyPressed() {
        // Check if E key was pressed this frame
        // You'll need to integrate this with your input system
        // For now, return false (implement in step 3)
        return false;
    }
    
    draw(renderer, camera) {
        for (const point of this.extractionPoints) {
            point.draw(renderer, camera);
        }
    }
    
    reset() {
        this.extractionPoints = [];
        this.spawnedTimes = [];
    }
}

export default ExtractionSystem;


3. INTEGRATE WITH GAME LOOP

In your main game file, add extraction system:

import ExtractionSystem from './js/systems/ExtractionSystem.js';

// In game initialization
this.extractionSystem = new ExtractionSystem();

// In game update loop (where other systems update)
const extractionResult = this.extractionSystem.update(
    deltaTime,
    this.gameTime,
    this.player,
    this.camera
);

if (extractionResult.extracted) {
    console.log('Player extracted at:', extractionResult.time);
    // For now, just log it (Phase 3 will handle rewards)
    // Temporarily transition to game over or title screen
}

// In render loop (after enemies, before UI)
this.extractionSystem.draw(this.renderer, this.camera);

// When starting new game/run
this.extractionSystem.reset();


4. ADD E KEY DETECTION

In your input handling system:

// Add to keyboard input
this.keys = {
    // ... existing keys
    KeyE: false
};

// In keydown handler
case 'KeyE':
    this.keys.KeyE = true;
    break;

// In ExtractionSystem.isExtractKeyPressed()
isExtractKeyPressed() {
    // Access your input system's E key state
    // Example (adapt to your input system):
    const pressed = inputSystem.keys.KeyE && !this.eKeyWasPressed;
    this.eKeyWasPressed = inputSystem.keys.KeyE;
    return pressed;
}


ALTERNATIVE (Simpler E Key Detection):
If your input system is complex, just track E globally:

let extractKeyPressed = false;

window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyE') extractKeyPressed = true;
});

// In ExtractionSystem.isExtractKeyPressed()
isExtractKeyPressed() {
    if (extractKeyPressed) {
        extractKeyPressed = false; // Consume the press
        return true;
    }
    return false;
}


5. VISUAL IMPROVEMENTS (Optional)

If you want the extraction point to look better:

// In ExtractionPoint.draw(), add multiple circles
draw(renderer, camera) {
    // Outer pulse
    renderer.drawCircle(this.x, this.y, this.radius * this.pulseScale, '#00ff00', camera);
    
    // Inner circle
    renderer.drawCircle(this.x, this.y, 50, '#00ff00', camera);
    
    // Center dot
    renderer.drawCircle(this.x, this.y, 10, '#ffffff', camera);
    
    // EXIT text
    renderer.drawText('[EXIT]', this.x, this.y - 20, '#00ff00', 3, camera);
    
    // Prompt when active
    if (this.active) {
        renderer.drawText('PRESS [E] TO EXTRACT', this.x, this.y + 30, '#ffff00', 2, camera);
    }
}


TESTING:

After implementation:

1. Start a run
2. Survive to 2:00 mark
3. Green [EXIT] symbol should appear near you
4. Walk into the green circle
5. "PRESS [E] TO EXTRACT" prompt appears
6. Press E
7. Console logs: "Player extracted at: 120"
8. (Game ends or returns to title for now)

Repeat for 3:30 and 5:00 extraction points.


IMPORTANT NOTES:

- Extraction points don't disappear (player can choose which to use)
- Multiple extraction points can be active (2:00 one stays when 3:30 spawns)
- Player can ignore extraction and keep playing
- Pressing E outside radius does nothing

AVOID:

- Don't implement rewards yet (Phase 3)
- Don't add hub transition yet (Phase 4)
- Don't save any data yet (just test the mechanic)


EDGE CASES:

1. Player is near edge of map when extraction spawns:
   - Clamp extraction point to map bounds if needed
   
2. Multiple extraction points overlap:
   - Doesn't matter, pressing E in any will extract
   
3. Player dies before reaching extraction:
   - Extraction points disappear on death (handled by reset())
```

---

## Testing Checklist

After implementation:

- [ ] Play for 2:00, extraction point spawns
- [ ] Green pulsing circle is visible
- [ ] Walk into circle → prompt appears
- [ ] Press E → console logs extraction
- [ ] Survive to 3:30 → second extraction spawns
- [ ] Both extractions stay active (don't disappear)
- [ ] Can extract from either one
- [ ] E key only works inside extraction radius
- [ ] Die before extracting → no errors

---

## Common Issues

**Issue: Extraction point doesn't spawn**
- Check console for spawn message
- Verify gameTime is incrementing correctly
- Ensure update() is called every frame

**Issue: E key doesn't work**
- Check input system integration
- Use global keydown listener as fallback
- Verify isExtractKeyPressed() is returning true

**Issue: Can't see extraction point**
- Check draw() is called after enemies but before UI
- Verify camera positioning
- Check renderer.drawCircle() exists and works

**Issue: Multiple extractions don't work**
- Check spawnedTimes array is being populated
- Verify loop checks all extractionTimes

---

## What You Should See

At **2:00**:
- Large green pulsing circle appears near player
- `[EXIT]` text in center
- Walking into it shows "PRESS [E] TO EXTRACT"
- Pressing E logs extraction and ends run

At **3:30**:
- Second extraction point spawns
- Both 2:00 and 3:30 points are active
- Can extract from either

At **5:00**:
- Third extraction point spawns
- All three points remain active
- Player chooses which to use (or ignore all)

---

## Next Step

Once extraction points spawn and E key works:

**→ Move to Phase 3: Rewards Screen**

Open `prompt_3_rewards_screen.md`
