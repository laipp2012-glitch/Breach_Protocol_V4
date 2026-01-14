# Task: Implement Time-Gated Enemy Spawning

## Context
Currently, all enemy types spawn from the start of the game. We need to introduce a progression system where stronger enemies (Rangers, Tanks, Swarms) unlock at specific time milestones to smooth the difficulty curve.

## Implementation Plan

### 1. Update `js/config/EnemyConfig.js`
- Modify `getRandomEnemyType(allowedIds)` to accept an optional list of allowed Enemy IDs.
- If `allowedIds` is provided:
  - Filter `ENEMY_TYPES` to only include matching IDs.
  - Recalculate `totalWeight` based ONLY on the filtered list.
  - Perform weighted random selection from the filtered list.

### 2. Update `js/systems/SpawnSystem.js`
- Implement `getAvailableEnemyTypes(gameTime)` method:
  - **0-120s**: `['basic', 'fast']`
  - **120-240s**: Add `['ranger']`
  - **240-420s**: Add `['tank']`
  - **420s+**: Add `['swarm']`
- Implement `selectEnemyType()` helper:
  - Get available types for current `this.gameTime`.
  - Call `getRandomEnemyType(availableTypes)`.
- Replace all direct usage of `getRandomEnemyType()` with `this.selectEnemyType()` in:
  - `spawnEnemy()` (Continuous logic)
  - `spawnWave()` (Wave logic)

## Verification
- Start game -> Verify only Basic/Fast appear.
- Wait for 2:00 -> Verify Rangers start appearing.
- Wait for 4:00 -> Verify Tanks start appearing.
- Verify existing spawn weights are respected (e.g. Basic is still most common).
