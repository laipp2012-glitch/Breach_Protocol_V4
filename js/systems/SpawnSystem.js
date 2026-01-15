/**
 * Spawn System - Handles enemy spawning at camera edges
 * Manages wave-based spawning and continuous pressure
 * Enemies spawn at the edge of the visible camera view (not world edge)
 * @module systems/SpawnSystem
 */

import { Enemy } from '../entities/Enemy.js';
import { getRandomEnemyType, ENEMY_TYPES } from '../config/EnemyConfig.js';
import { SPAWN_CONFIG, getWaveParams, getAvailableEnemies } from '../config/SpawnConfig.js';

/**
 * Spawn edge enumeration
 * @enum {number}
 */
const SPAWN_EDGE = {
    TOP: 1,
    RIGHT: 1,
    BOTTOM: 2,
    LEFT: 3
};

/**
 * Handles enemy spawning at camera view edges using a hybrid Wave + Continuous system
 */
export class SpawnSystem {
    /**
     * Creates a new SpawnSystem
     * @param {number} viewportWidth - Width of the viewport (camera view)
     * @param {number} viewportHeight - Height of the viewport (camera view)
     */
    constructor(viewportWidth, viewportHeight) {
        /** @type {number} Viewport width */
        this.viewportWidth = viewportWidth;

        /** @type {number} Viewport height */
        this.viewportHeight = viewportHeight;

        /** @type {number} Spawn margin outside viewport */
        this.spawnMargin = SPAWN_CONFIG.GENERAL.SPAWN_MARGIN;

        /** @type {number} Maximum number of enemies */
        this.maxEnemies = SPAWN_CONFIG.GENERAL.MAX_ENEMIES;

        /** @type {number} Total game time */
        this.gameTime = 0;

        // Wave Spawning Properties
        /** @type {number} Time since last wave */
        this.waveTimer = 0;

        // Continuous Spawning Properties
        /** @type {number} Time since last continuous spawn */
        this.continuousSpawnTimer = 0;

        /** @type {boolean} Whether spawning is active */
        this.active = true;

        /** @type {{x: number, y: number}} Current camera position */
        this.cameraPosition = { x: 0, y: 0 };
    }

    /**
     * Updates the spawn system and spawns enemies as needed
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {Array<Enemy>} enemies - Current enemy array
     * @param {Object} camera - Camera object with x, y position
     * @param {Object} player - Player object for directional spawning (optional)
     * @returns {Array<Enemy>} New enemies spawned this frame
     */
    update(deltaTime, enemies, camera = null, player = null) {
        if (!this.active) {
            return [];
        }

        // Update camera position for spawning
        if (camera) {
            this.cameraPosition = { x: camera.x, y: camera.y };
        }

        this.gameTime += deltaTime;

        const newEnemies = [];
        const currentEnemyCount = enemies.length;

        // Skip spawning if hard cap reached
        if (currentEnemyCount >= this.maxEnemies) {
            // Still update timers/logic even if full? 
            // Instructions say: "If enemy cap is reached, skip spawning but continue timers"
            this.waveTimer += deltaTime;
            this.continuousSpawnTimer += deltaTime;

            // If a wave triggers while full, we just reset timer and skip it
            const waveParams = this.getWaveParameters(this.gameTime);
            if (this.waveTimer >= waveParams.interval) {
                this.waveTimer = 0;
            }
            return [];
        }

        // --- WAVE SPAWNING ---
        this.waveTimer += deltaTime;
        const waveParams = this.getWaveParameters(this.gameTime);

        if (this.waveTimer >= waveParams.interval) {
            this.waveTimer = 0;

            // Calculate how many enemies we can spawn without exceeding cap
            const spaceAvailable = this.maxEnemies - (currentEnemyCount + newEnemies.length);
            const actualWaveSize = Math.min(waveParams.size, spaceAvailable);

            if (actualWaveSize > 0) {
                const directions = this.selectWaveDirections(
                    waveParams.minDirections,
                    waveParams.maxDirections,
                    player
                );

                const waveEnemies = this.spawnWave(actualWaveSize, directions);
                newEnemies.push(...waveEnemies);

                console.log(`[SpawnSystem] WAVE: ${waveEnemies.length} enemies from ${directions.map(d => SPAWN_EDGE[d] || d).join(', ')}`);
            }
        }

        // --- CONTINUOUS SPAWNING ---
        this.continuousSpawnTimer += deltaTime;
        const continuousInterval = SPAWN_CONFIG.GENERAL.CONTINUOUS_INTERVAL;

        if (this.continuousSpawnTimer >= continuousInterval) {
            this.continuousSpawnTimer = 0;

            // Spawn 1 enemy if space available
            if (enemies.length + newEnemies.length < this.maxEnemies) {
                const enemy = this.spawnEnemy(player); // Pass player for directional spawning
                if (enemy) {
                    newEnemies.push(enemy);
                }
            }
        }

        return newEnemies;
    }

    /**
     * Gets wave parameters based on game time brackets
     * @param {number} gameTime - Current game time in seconds
     * @returns {{interval: number, size: number, minDirections: number, maxDirections: number}}
     */
    getWaveParameters(gameTime) {
        return getWaveParams(gameTime);
    }

    /**
     * Selects random spawn directions
     * @param {number} min - Minimum number of directions
     * @param {number} max - Maximum number of directions
     * @param {Object} player - Player object for directional bias (optional)
     * @returns {Array<number>} Array of SPAWN_EDGE values
     */
    selectWaveDirections(min, max, player = null) {
        const count = Math.floor(Math.random() * (max - min + 1)) + min;
        let available = [SPAWN_EDGE.TOP, SPAWN_EDGE.RIGHT, SPAWN_EDGE.BOTTOM, SPAWN_EDGE.LEFT];

        // If player is moving, bias towards movement direction
        if (player) {
            const movementEdge = this.getMovementDirectionEdge(player);

            // 70% chance to FORCE the movement edge to be included
            if (Math.random() < 0.7) {
                // Remove movementEdge from available
                available = available.filter(e => e !== movementEdge);

                // Shuffle remaining
                for (let i = available.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [available[i], available[j]] = [available[j], available[i]];
                }

                // Add movementEdge at start to ensure it's picked
                available.unshift(movementEdge);

                // Return 'count' elements
                return available.slice(0, count);
            }
        }

        // Standard shuffle
        for (let i = available.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [available[i], available[j]] = [available[j], available[i]];
        }

        return available.slice(0, count);
    }

    /**
     * Spawns a wave of enemies distributed across directions
     * @param {number} waveSize - Total enemies in this wave
     * @param {Array<number>} directions - Array of SPAWN_EDGE directions
     * @returns {Array<Enemy>} Array of spawned enemies
     */
    spawnWave(waveSize, directions) {
        const generatedEnemies = [];
        if (directions.length === 0) return generatedEnemies;

        const enemiesPerDirection = Math.floor(waveSize / directions.length);
        const remainder = waveSize % directions.length;

        directions.forEach((edge, index) => {
            // Add remainder to first few directions
            const count = enemiesPerDirection + (index < remainder ? 1 : 0);

            for (let i = 0; i < count; i++) {
                const pos = this.getSpawnPositionForDirection(edge, i, count);
                const enemyType = this.selectEnemyType();
                const enemy = new Enemy(pos.x, pos.y, enemyType);

                // Store spawn direction for movement spread
                enemy.spawnDirection = this.getDirectionName(edge);

                generatedEnemies.push(enemy);
            }
        });

        return generatedEnemies;
    }

    /**
     * Calculates spawn position for a specific enemy in a wave line
     * @param {number} edge - The edge to spawn on
     * @param {number} index - Index of this enemy in the line
     * @param {number} total - Total enemies in this line
     * @returns {{x: number, y: number}}
     */
    getSpawnPositionForDirection(edge, index, total) {
        const margin = this.spawnMargin;
        const camX = this.cameraPosition.x;
        const camY = this.cameraPosition.y;

        // Calculate spread factor (padding from corners)
        const padding = 50;

        let x, y;

        // Linear interpolation factor (0.0 to 1.0)
        // If total is 1, place in middle (0.5)
        const t = (index + 0.5) / total;

        switch (edge) {
            case SPAWN_EDGE.TOP:
                // Spread across Width
                x = camX + padding + (this.viewportWidth - 2 * padding) * t;
                y = camY - margin;
                break;
            case SPAWN_EDGE.BOTTOM:
                // Spread across Width
                x = camX + padding + (this.viewportWidth - 2 * padding) * t;
                y = camY + this.viewportHeight + margin;
                break;
            case SPAWN_EDGE.LEFT:
                // Spread across Height
                x = camX - margin;
                y = camY + padding + (this.viewportHeight - 2 * padding) * t;
                break;
            case SPAWN_EDGE.RIGHT:
                // Spread across Height
                x = camX + this.viewportWidth + margin;
                y = camY + padding + (this.viewportHeight - 2 * padding) * t;
                break;
        }

        // Add slight randomness to x/y to prevent perfect lines
        x += (Math.random() - 0.5) * 20;
        y += (Math.random() - 0.5) * 20;

        return { x, y };
    }

    /**
     * Spawns a single enemy at a random edge (Continuous Logic)
     * @param {Object} player - Player object for directional spawning (optional)
     * @returns {Enemy} The spawned enemy
     */
    spawnEnemy(player = null) {
        // Choose edge - 70% bias toward player's movement direction
        let edge;
        if (player && Math.random() < 0.7) {
            // Directional spawn based on player velocity
            edge = this.getMovementDirectionEdge(player);
        } else {
            // Random edge
            const randomInt = Math.floor(Math.random() * 4); // 0, 1, 2, 3
            switch (randomInt) {
                case 0: edge = SPAWN_EDGE.TOP; break;
                case 1: edge = SPAWN_EDGE.RIGHT; break;
                case 2: edge = SPAWN_EDGE.BOTTOM; break;
                case 3: edge = SPAWN_EDGE.LEFT; break;
            }
        }

        const { x, y } = this.getSpawnPosition(edge);

        // Get a random enemy type (Time-gated)
        const enemyType = this.selectEnemyType();

        const enemy = new Enemy(x, y, enemyType);

        // Store spawn direction
        enemy.spawnDirection = this.getDirectionName(edge);

        return enemy;
    }

    /**
     * Gets a random spawn position on the specified edge
     * @param {number} edge - Edge to spawn on
     * @returns {{x: number, y: number}} Spawn position
     */
    getSpawnPosition(edge) {
        const margin = this.spawnMargin;
        const camX = this.cameraPosition.x;
        const camY = this.cameraPosition.y;

        switch (edge) {
            case SPAWN_EDGE.TOP:
                return {
                    x: camX + Math.random() * this.viewportWidth,
                    y: camY - margin
                };
            case SPAWN_EDGE.RIGHT:
                return {
                    x: camX + this.viewportWidth + margin,
                    y: camY + Math.random() * this.viewportHeight
                };
            case SPAWN_EDGE.BOTTOM:
                return {
                    x: camX + Math.random() * this.viewportWidth,
                    y: camY + this.viewportHeight + margin
                };
            case SPAWN_EDGE.LEFT:
                return {
                    x: camX - margin,
                    y: camY + Math.random() * this.viewportHeight
                };
            default:
                // Fallback to a random edge if an invalid edge is passed
                const randomInt = Math.floor(Math.random() * 4);
                let fallbackEdge;
                switch (randomInt) {
                    case 0: fallbackEdge = SPAWN_EDGE.TOP; break;
                    case 1: fallbackEdge = SPAWN_EDGE.RIGHT; break;
                    case 2: fallbackEdge = SPAWN_EDGE.BOTTOM; break;
                    case 3: fallbackEdge = SPAWN_EDGE.LEFT; break;
                }
                return this.getSpawnPosition(fallbackEdge);
        }
    }

    /**
     * Enables spawning
     */
    enable() {
        this.active = true;
    }

    /**
     * Disables spawning
     */
    disable() {
        this.active = false;
    }

    /**
     * Resets the spawn system
     */
    reset() {
        this.waveTimer = 0;
        this.continuousSpawnTimer = 0;
        this.gameTime = 0;
        this.active = true;
        this.cameraPosition = { x: 0, y: 0 };
    }

    /**
     * Gets the current game time in seconds
     * @returns {number} Game time
     */
    getGameTime() {
        return this.gameTime;
    }

    /**
     * Formats game time as MM:SS string
     * @returns {string} Formatted time
     */
    getFormattedTime() {
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = Math.floor(this.gameTime % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Determines which enemy types are unlocked based on game time
     * @param {number} gameTime - Current game time in seconds
     * @returns {Array<string>} Array of allowed enemy IDs
     */
    getAvailableEnemyTypes(gameTime) {
        return getAvailableEnemies(gameTime).filter(typeId => {
            const enemyConfig = Object.values(ENEMY_TYPES).find(t => t.id === typeId);
            return enemyConfig && enemyConfig.enabled !== false;
        });
    }

    /**
     * Selects an enemy type from the currently available pool
     * @returns {Object} Selected enemy type config
     */
    selectEnemyType() {
        // Get allowed types for current time
        const available = this.getAvailableEnemyTypes(this.gameTime);

        // Pass to weighted random selector
        return getRandomEnemyType(available);
    }

    /**
     * Gets extraction wave configuration
     * @returns {Object} Extraction wave config
     */
    getExtractionWaveConfig() {
        return SPAWN_CONFIG.EXTRACTION_WAVE;
    }

    /**
     * Spawns a massive wave when extraction point appears
     * @param {Array} enemies - Current enemies array
     * @param {Object} camera - Camera position
     * @param {number} viewportWidth - Viewport width
     * @param {number} viewportHeight - Viewport height
     * @param {number} gameTime - Current game time
     */
    spawnExtractionWave(enemies, camera, viewportWidth, viewportHeight, gameTime) {
        const config = SPAWN_CONFIG.EXTRACTION_WAVE;
        if (!config.ENABLED) return;

        // Temporarily update camera reference
        const oldCameraX = this.cameraX;
        const oldCameraY = this.cameraY;
        this.cameraX = camera.x;
        this.cameraY = camera.y;

        // Get directions
        const directions = this.selectWaveDirections(config.DIRECTIONS, config.DIRECTIONS);

        // Spawn the wave
        const spawnedEnemies = this.spawnWave(config.ENEMY_COUNT, directions);

        // Add to enemies array
        for (const enemy of spawnedEnemies) {
            if (enemies.length < SPAWN_CONFIG.GENERAL.MAX_ENEMIES) {
                enemies.push(enemy);
            }
        }

        // Restore camera reference
        this.cameraX = oldCameraX;
        this.cameraY = oldCameraY;

        console.log(`Extraction wave: ${spawnedEnemies.length} enemies spawned`);
    }

    /**
     * Converts SPAWN_EDGE enum to direction name
     * @param {number} edge - SPAWN_EDGE value
     * @returns {string} Direction name
     */
    /**
     * Determines which edge corresponds to player's movement direction
     * @param {Object} player - Player object with velocity
     * @returns {number} Edge index (SPAWN_EDGE value) for TOP, RIGHT, BOTTOM, LEFT
     */
    getMovementDirectionEdge(player) {
        if (!player.velocity || (Math.abs(player.velocity.x) < 1 && Math.abs(player.velocity.y) < 1)) {
            // If not moving or no velocity, return a random edge
            const randomInt = Math.floor(Math.random() * 4);
            switch (randomInt) {
                case 0: return SPAWN_EDGE.TOP;
                case 1: return SPAWN_EDGE.RIGHT;
                case 2: return SPAWN_EDGE.BOTTOM;
                case 3: return SPAWN_EDGE.LEFT;
            }
        }

        const vx = player.velocity.x;
        const vy = player.velocity.y;

        // Determine dominant direction
        if (Math.abs(vx) > Math.abs(vy)) {
            // Moving horizontally
            return vx > 0 ? SPAWN_EDGE.RIGHT : SPAWN_EDGE.LEFT;
        } else {
            // Moving vertically
            return vy > 0 ? SPAWN_EDGE.BOTTOM : SPAWN_EDGE.TOP;
        }
    }

    getDirectionName(edge) {
        switch (edge) {
            case SPAWN_EDGE.TOP: return 'TOP';
            case SPAWN_EDGE.BOTTOM: return 'BOTTOM';
            case SPAWN_EDGE.LEFT: return 'LEFT';
            case SPAWN_EDGE.RIGHT: return 'RIGHT';
            default: return null;
        }
    }
}
