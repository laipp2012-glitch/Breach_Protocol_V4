/**
 * Spawn System - Handles enemy spawning at camera edges
 * Manages wave-based spawning and continuous pressure
 * Enemies spawn at the edge of the visible camera view (not world edge)
 * @module systems/SpawnSystem
 */

import { Enemy } from '../entities/Enemy.js';
import { getRandomEnemyType } from '../config/EnemyConfig.js';
import { GAME_CONFIG } from '../config/GameConfig.js';

/**
 * Spawn edge enumeration
 * @enum {number}
 */
const SPAWN_EDGE = {
    TOP: 0,
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
        this.spawnMargin = GAME_CONFIG.SPAWN.MARGIN;

        /** @type {number} Maximum number of enemies */
        this.maxEnemies = GAME_CONFIG.SPAWN.MAX_ENEMIES;

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
     * @returns {Array<Enemy>} New enemies spawned this frame
     */
    update(deltaTime, enemies, camera = null) {
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
                    waveParams.maxDirections
                );

                const waveEnemies = this.spawnWave(actualWaveSize, directions);
                newEnemies.push(...waveEnemies);

                console.log(`[SpawnSystem] WAVE: ${waveEnemies.length} enemies from ${directions.map(d => SPAWN_EDGE[d] || d).join(', ')}`);
            }
        }

        // --- CONTINUOUS SPAWNING ---
        this.continuousSpawnTimer += deltaTime;
        const continuousInterval = GAME_CONFIG.SPAWN.CONTINUOUS_INTERVAL;

        if (this.continuousSpawnTimer >= continuousInterval) {
            this.continuousSpawnTimer = 0;

            // Spawn 1 enemy if space available
            if (enemies.length + newEnemies.length < this.maxEnemies) {
                const enemy = this.spawnEnemy(); // Uses existing random logic
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
        const waves = GAME_CONFIG.SPAWN.WAVES;

        // Find the matching wave config for current time
        const config = waves.find(w => gameTime < w.TIME_LIMIT) || waves[waves.length - 1];

        return {
            interval: config.INTERVAL,
            size: config.SIZE,
            minDirections: config.MIN_DIRS,
            maxDirections: config.MAX_DIRS
        };
    }

    /**
     * Selects random spawn directions
     * @param {number} min - Minimum number of directions
     * @param {number} max - Maximum number of directions
     * @returns {Array<number>} Array of SPAWN_EDGE values
     */
    selectWaveDirections(min, max) {
        const count = Math.floor(Math.random() * (max - min + 1)) + min;
        const available = [SPAWN_EDGE.TOP, SPAWN_EDGE.RIGHT, SPAWN_EDGE.BOTTOM, SPAWN_EDGE.LEFT];

        // Shuffle and take 'count' elements
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
     * @returns {Enemy} The spawned enemy
     */
    spawnEnemy() {
        // Choose a random edge
        const edge = Math.floor(Math.random() * 4);
        const { x, y } = this.getSpawnPosition(edge);

        // Get a random enemy type (Time-gated)
        const enemyType = this.selectEnemyType();

        return new Enemy(x, y, enemyType);
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
                return { x: camX - margin, y: camY - margin };
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
        // Always available
        const types = ['basic', 'fast'];

        // Unlock Ranger at 2:00 (120s)
        if (gameTime >= 120) types.push('ranger');

        // Unlock Tank at 4:00 (240s)
        if (gameTime >= 240) types.push('tank');

        // Unlock Swarm at 7:00 (420s)
        if (gameTime >= 420) types.push('swarm');

        return types;
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
}
