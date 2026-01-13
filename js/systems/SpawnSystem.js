/**
 * Spawn System - Handles enemy spawning at camera edges
 * Manages spawn timing, enemy type selection, and spawn rate scaling
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
 * Handles enemy spawning at camera view edges
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

        /** @type {number} Base spawn rate (enemies per second) */
        this.baseSpawnRate = GAME_CONFIG.SPAWN.BASE_RATE;

        /** @type {number} Maximum spawn rate */
        this.maxSpawnRate = GAME_CONFIG.SPAWN.MAX_RATE;

        /** @type {number} Maximum number of enemies */
        this.maxEnemies = GAME_CONFIG.SPAWN.MAX_ENEMIES;

        /** @type {number} Current spawn timer */
        this.spawnTimer = 0;

        /** @type {number} Total game time for spawn scaling */
        this.gameTime = 0;

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
        this.spawnTimer += deltaTime;

        // Calculate current spawn rate (increases with time)
        const spawnRate = this.getCurrentSpawnRate();
        const spawnInterval = 1 / spawnRate;

        const newEnemies = [];

        // Spawn enemies while timer exceeds interval
        while (this.spawnTimer >= spawnInterval && enemies.length + newEnemies.length < this.maxEnemies) {
            this.spawnTimer -= spawnInterval;
            const enemy = this.spawnEnemy();
            if (enemy) {
                newEnemies.push(enemy);
            }
        }

        return newEnemies;
    }

    /**
     * Calculates the current spawn rate based on game time
     * @returns {number} Current spawn rate (enemies per second)
     */
    getCurrentSpawnRate() {
        // Rate increases over time: baseRate * (1 + time/60)
        // This means at 60 seconds, rate is doubled
        const timeMultiplier = 1 + (this.gameTime / 60);
        const rate = this.baseSpawnRate * timeMultiplier;
        return Math.min(rate, this.maxSpawnRate);
    }

    /**
     * Spawns a single enemy at a random edge of the camera view
     * @returns {Enemy} The spawned enemy
     */
    spawnEnemy() {
        // Choose a random edge
        const edge = Math.floor(Math.random() * 4);
        const { x, y } = this.getSpawnPosition(edge);

        // Get a random enemy type
        const enemyType = getRandomEnemyType();

        return new Enemy(x, y, enemyType);
    }

    /**
     * Gets a spawn position on the specified edge of the camera view
     * Positions are in WORLD SPACE (relative to camera position)
     * @param {number} edge - Edge to spawn on (0=top, 1=right, 2=bottom, 3=left)
     * @returns {{x: number, y: number}} Spawn position in world space
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
        this.spawnTimer = 0;
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
}
