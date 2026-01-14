Modify the enemy spawn system to gate enemy types by game time.

CURRENT BEHAVIOR:
All enemy types (Basic, Fast, Ranger, Tank, Swarm) can spawn from 
the start of the game using weighted random selection.

DESIRED BEHAVIOR:
Enemy types unlock gradually as the game progresses:

TIME BRACKETS:
0:00 - 2:00 (0-120 seconds):
  - ONLY spawn: Basic, Fast
  - Weight: Basic (100), Fast (40)
  
2:00 - 4:00 (120-240 seconds):
  - Add: Ranger
  - Weight: Basic (100), Fast (40), Ranger (30)
  
4:00 - 7:00 (240-420 seconds):
  - Add: Tank
  - Weight: Basic (100), Fast (40), Ranger (30), Tank (20)
  
7:00+ (420+ seconds):
  - Add: Swarm (full roster unlocked)
  - Weight: Basic (100), Fast (40), Ranger (30), Tank (20), Swarm (15)

IMPLEMENTATION:
In SpawnSystem.js (or wherever enemy type selection happens):

1. Add method: getAvailableEnemyTypes(gameTime)
   - Returns array of enemy type IDs based on current time
   - Example at 1:30: ['basic', 'fast']
   - Example at 5:00: ['basic', 'fast', 'ranger', 'tank']

2. Modify selectEnemyType() method:
   - Get available types using getAvailableEnemyTypes(gameTime)
   - Filter spawn weights to only include available types
   - Perform weighted random selection from filtered list

3. Ensure wave spawning respects this restriction:
   - When spawnWave() creates enemies, each should call 
     selectEnemyType() with current game time
   - Don't hard-code enemy types in wave logic

EXAMPLE CODE STRUCTURE:

getAvailableEnemyTypes(gameTime) {
    const types = ['basic', 'fast']; // Always available
    
    if (gameTime >= 120) types.push('ranger'); // 2:00
    if (gameTime >= 240) types.push('tank');   // 4:00
    if (gameTime >= 420) types.push('swarm');  // 7:00
    
    return types;
}

selectEnemyType(gameTime) {
    const available = this.getAvailableEnemyTypes(gameTime);
    
    // Filter EnemyConfig spawn weights to only include available types
    const validWeights = enemyTypes
        .filter(type => available.includes(type.id))
        .map(type => ({id: type.id, weight: type.spawnWeight}));
    
    // Perform weighted random selection from validWeights
    return weightedRandomChoice(validWeights);
}

TESTING CRITERIA:
After implementation, verify:
- 0-2 min: Only see E (Basic) and F (Fast) enemies
- At 2:05: R (Ranger) starts appearing
- At 4:05: T (Tank) starts appearing  
- At 7:05: S (Swarm) starts appearing
- Weights remain proportional within available pool