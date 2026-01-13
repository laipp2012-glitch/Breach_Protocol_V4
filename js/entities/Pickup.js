/**
 * Pickup Entity - Collectible items like XP gems and health
 * Contains position, magnetic pull toward player, and value
 * NOTE: This class has NO render() method - all rendering goes through RenderSystem
 * @module entities/Pickup
 */

import { Vector2D } from '../utils/Vector2D.js';

/**
 * Pickup entity class
 * Manages pickup state, magnetic movement toward player, and collection
 */
export class Pickup {
    /**
     * Creates a new Pickup
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} type - Pickup type ('xp', 'health')
     * @param {number} value - Value of the pickup
     */
    constructor(x, y, type, value) {
        /** @type {string} Entity type identifier */
        this.type = 'pickup';

        /** @type {string} Pickup type (xp, health) */
        this.pickupType = type;

        /** @type {Vector2D} Current position */
        this.position = new Vector2D(x, y);

        /** @type {number} Value of this pickup */
        this.value = value;

        /** @type {number} Collision radius */
        this.radius = value > 5 ? 10 : 6;

        /** @type {number} Magnetic pull radius */
        this.magnetRadius = 80;

        /** @type {number} Speed when being pulled */
        this.magnetSpeed = 300;

        /** @type {boolean} Whether pickup is active */
        this.alive = true;

        /** @type {boolean} Whether currently being pulled */
        this.beingPulled = false;
    }

    /**
     * Updates the pickup each frame
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {Vector2D} playerPosition - Current player position
     * @param {number} playerPickupRadius - Player's pickup magnet radius
     */
    update(deltaTime, playerPosition, playerPickupRadius = 80) {
        if (!this.alive) {
            return;
        }

        // Calculate distance to player
        const dx = playerPosition.x - this.position.x;
        const dy = playerPosition.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Use the larger of pickup's or player's magnet radius
        const effectiveRadius = Math.max(this.magnetRadius, playerPickupRadius);

        // If within magnet radius, pull toward player
        if (distance < effectiveRadius && distance > 0) {
            this.beingPulled = true;

            // Normalize direction
            const dirX = dx / distance;
            const dirY = dy / distance;

            // Move toward player (speed increases as we get closer)
            const speedMultiplier = 1 + (1 - distance / effectiveRadius);
            const moveDistance = this.magnetSpeed * speedMultiplier * deltaTime;

            this.position.x += dirX * moveDistance;
            this.position.y += dirY * moveDistance;
        } else {
            this.beingPulled = false;
        }
    }

    /**
     * Checks if pickup collides with player
     * @param {Object} player - Player entity
     * @returns {boolean} True if colliding
     */
    checkCollision(player) {
        const dx = player.position.x - this.position.x;
        const dy = player.position.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < player.radius + this.radius;
    }

    /**
     * Factory method to create an XP gem
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} value - XP value
     * @returns {Pickup} New XP gem pickup
     */
    static createXPGem(x, y, value) {
        return new Pickup(x, y, 'xp', value);
    }

    /**
     * Factory method to create a health pickup
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} value - Health value
     * @returns {Pickup} New health pickup
     */
    static createHealthPickup(x, y, value) {
        return new Pickup(x, y, 'health', value);
    }
}
