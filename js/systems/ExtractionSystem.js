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
     * @returns {{extracted: boolean, pointSpawned: boolean, time?: number}} Extraction result
     */
    update(deltaTime, gameTime, player, inputSystem) {
        let pointSpawned = false;

        // Spawn extraction points at designated times
        for (const time of this.extractionTimes) {
            if (gameTime >= time && !this.spawnedTimes.includes(time)) {
                this.spawnExtractionPoint(player, time);
                this.spawnedTimes.push(time);
                pointSpawned = true;
            }
        }

        // Update all extraction points
        let playerCanExtract = false;
        for (const point of this.extractionPoints) {
            if (point.alive) {
                const isActive = point.update(deltaTime, player.position);
                if (isActive) {
                    playerCanExtract = true;
                }
            }
        }

        // Remove expired extraction points
        this.extractionPoints = this.extractionPoints.filter(p => p.alive);

        // Check for E key press (edge detection)
        const eKeyPressed = inputSystem.isKeyPressed('KeyE');
        const eKeyJustPressed = eKeyPressed && !this.eKeyWasPressed;
        this.eKeyWasPressed = eKeyPressed;

        // Extract if E pressed while in extraction zone
        if (playerCanExtract && eKeyJustPressed) {
            console.log('Player extracted at:', Math.floor(gameTime), 'seconds');
            return { extracted: true, pointSpawned, time: gameTime };
        }

        return { extracted: false, pointSpawned };
    }

    /**
     * Spawns an extraction point far from the player
     * @param {Object} player - Player entity
     * @param {number} spawnTime - Game time when spawned
     */
    spawnExtractionPoint(player, spawnTime) {
        const margin = 150;
        const minDistance = 800; // Minimum distance from player

        let x, y, distance;
        let attempts = 0;

        // Try to find a position far from player
        do {
            x = margin + Math.random() * (GAME_CONFIG.WORLD.WIDTH - 2 * margin);
            y = margin + Math.random() * (GAME_CONFIG.WORLD.HEIGHT - 2 * margin);

            const dx = x - player.position.x;
            const dy = y - player.position.y;
            distance = Math.sqrt(dx * dx + dy * dy);
            attempts++;
        } while (distance < minDistance && attempts < 50);

        const point = new ExtractionPoint(x, y, spawnTime);
        this.extractionPoints.push(point);

        console.log(`Extraction point spawned at ${spawnTime}s - Coordinates: (${Math.floor(x)}, ${Math.floor(y)})`);
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
     * Renders extraction coordinates HUD
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} screenWidth - Screen width
     * @param {number} screenHeight - Screen height
     */
    renderHUD(ctx, screenWidth, screenHeight) {
        if (this.extractionPoints.length === 0) return;

        // Find nearest active extraction point
        const activePoint = this.extractionPoints.find(p => p.alive);
        if (!activePoint) return;

        const x = Math.floor(activePoint.position.x);
        const y = Math.floor(activePoint.position.y);
        const timeLeft = Math.ceil(activePoint.timeRemaining);

        // Draw extraction coordinates HUD (top-left, below other HUD elements)
        ctx.save();
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        // Background box
        const hudX = 10;
        const hudY = 80;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(hudX, hudY, 180, 50);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1;
        ctx.strokeRect(hudX, hudY, 180, 50);

        // Title
        ctx.fillStyle = '#00ff00';
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 5;
        ctx.fillText('▶ EXTRACTION', hudX + 8, hudY + 8);
        ctx.shadowBlur = 0;

        // Coordinates
        ctx.font = '12px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`COORDS: ${x}, ${y}`, hudX + 8, hudY + 26);

        // Timer
        const timerColor = timeLeft <= 10 ? '#ff3333' : (timeLeft <= 20 ? '#ffaa00' : '#00ff00');
        ctx.fillStyle = timerColor;
        ctx.fillText(`TIME: ${timeLeft}s`, hudX + 110, hudY + 26);

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
