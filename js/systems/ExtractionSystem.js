/**
 * Extraction System
 * Manages extraction point spawning and player extraction
 * @module systems/ExtractionSystem
 */

import { ExtractionPoint } from '../entities/ExtractionPoint.js';
import { GAME_CONFIG } from '../config/GameConfig.js';

/**
 * Manages extraction points and extraction logic
 */
export class ExtractionSystem {
    constructor() {
        /** @type {ExtractionPoint[]} Active extraction points */
        this.extractionPoints = [];

        /** @type {number[]} Times when extraction points spawn (seconds) */
        this.extractionTimes = [120, 210, 300]; // 2:00, 3:30, 5:00

        /** @type {number[]} Times that have already spawned */
        this.spawnedTimes = [];

        /** @type {boolean} Track E key state for edge detection */
        this.eKeyWasPressed = false;
    }

    /**
     * Updates all extraction points
     * @param {number} deltaTime - Time since last frame
     * @param {number} gameTime - Current game time in seconds
     * @param {Object} player - Player entity
     * @param {Object} inputSystem - Input system for key detection
     * @returns {{extracted: boolean, time?: number}} Extraction result
     */
    update(deltaTime, gameTime, player, inputSystem) {
        // Spawn extraction points at designated times
        for (const time of this.extractionTimes) {
            if (gameTime >= time && !this.spawnedTimes.includes(time)) {
                this.spawnExtractionPoint(player, time);
                this.spawnedTimes.push(time);
            }
        }

        // Update all extraction points
        let playerCanExtract = false;
        for (const point of this.extractionPoints) {
            const isActive = point.update(deltaTime, player.position);
            if (isActive) {
                playerCanExtract = true;
            }
        }

        // Check for E key press (edge detection)
        const eKeyPressed = inputSystem.isKeyPressed('KeyE');
        const eKeyJustPressed = eKeyPressed && !this.eKeyWasPressed;
        this.eKeyWasPressed = eKeyPressed;

        // Extract if E pressed while in extraction zone
        if (playerCanExtract && eKeyJustPressed) {
            console.log('Player extracted at:', Math.floor(gameTime), 'seconds');
            return { extracted: true, time: gameTime };
        }

        return { extracted: false };
    }

    /**
     * Spawns an extraction point near the player
     * @param {Object} player - Player entity
     * @param {number} spawnTime - Game time when spawned
     */
    spawnExtractionPoint(player, spawnTime) {
        // Spawn at random angle, fixed distance from player
        const angle = Math.random() * Math.PI * 2;
        const distance = 300;

        let x = player.position.x + Math.cos(angle) * distance;
        let y = player.position.y + Math.sin(angle) * distance;

        // Clamp to world bounds
        const margin = 100;
        x = Math.max(margin, Math.min(GAME_CONFIG.WORLD.WIDTH - margin, x));
        y = Math.max(margin, Math.min(GAME_CONFIG.WORLD.HEIGHT - margin, y));

        const point = new ExtractionPoint(x, y, spawnTime);
        this.extractionPoints.push(point);

        console.log(`Extraction point spawned at ${spawnTime}s (${Math.floor(x)}, ${Math.floor(y)})`);
    }

    /**
     * Renders all extraction points
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} camera - Camera position
     */
    render(ctx, camera) {
        ctx.save();
        ctx.translate(-camera.x, -camera.y);

        for (const point of this.extractionPoints) {
            if (point.alive) {
                point.render(ctx);
            }
        }

        ctx.restore();
    }

    /**
     * Checks if any extraction point is currently active (player in range)
     * @returns {boolean}
     */
    hasActivePoint() {
        return this.extractionPoints.some(p => p.active);
    }

    /**
     * Resets the extraction system for a new run
     */
    reset() {
        this.extractionPoints = [];
        this.spawnedTimes = [];
        this.eKeyWasPressed = false;
    }
}
