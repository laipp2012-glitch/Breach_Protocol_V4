/**
 * Extraction Point Entity
 * Pulsing zone that allows players to extract and end their run
 * @module entities/ExtractionPoint
 */

import { Vector2D } from '../utils/Vector2D.js';

/**
 * Extraction zone that players can enter to extract
 */
export class ExtractionPoint {
    /**
     * Creates an extraction point
     * @param {number} x - World X position
     * @param {number} y - World Y position
     * @param {number} spawnTime - Game time when spawned (seconds)
     */
    constructor(x, y, spawnTime) {
        /** @type {Vector2D} Position in world */
        this.position = new Vector2D(x, y);

        /** @type {number} When this point spawned */
        this.spawnTime = spawnTime;

        /** @type {number} Activation radius */
        this.radius = 80;

        /** @type {boolean} Whether player is in radius */
        this.active = false;

        /** @type {number} Pulse animation timer */
        this.pulseTimer = 0;

        /** @type {number} Current pulse scale */
        this.pulseScale = 1.0;

        /** @type {boolean} Whether point is alive */
        this.alive = true;
    }

    /**
     * Updates the extraction point
     * @param {number} deltaTime - Time since last frame
     * @param {Vector2D} playerPosition - Player's position
     * @returns {boolean} Whether player is in activation radius
     */
    update(deltaTime, playerPosition) {
        // Pulse animation
        this.pulseTimer += deltaTime;
        this.pulseScale = 1.0 + Math.sin(this.pulseTimer * 3) * 0.2;

        // Check if player is in radius
        const dx = playerPosition.x - this.position.x;
        const dy = playerPosition.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        this.active = distance <= this.radius;

        return this.active;
    }

    /**
     * Renders the extraction point
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        const x = this.position.x;
        const y = this.position.y;

        // Outer pulsing circle
        ctx.beginPath();
        ctx.arc(x, y, this.radius * this.pulseScale, 0, Math.PI * 2);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.8;
        ctx.stroke();

        // Inner circle
        ctx.beginPath();
        ctx.arc(x, y, 50, 0, Math.PI * 2);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.stroke();

        // Center dot
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 1;
        ctx.fill();

        // EXIT text
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#00ff00';
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 10;
        ctx.fillText('[EXIT]', x, y - 25);
        ctx.shadowBlur = 0;

        // Prompt when active
        if (this.active) {
            ctx.font = '16px monospace';
            ctx.fillStyle = '#ffff00';
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 5;
            ctx.fillText('PRESS [E] TO EXTRACT', x, y + 40);
            ctx.shadowBlur = 0;
        }

        ctx.globalAlpha = 1;
    }
}
