/**
 * Projectile Entity - Weapon projectiles that damage enemies
 * Contains position, movement, and damage logic
 * NOTE: This class has NO render() method - all rendering goes through RenderSystem
 * @module entities/Projectile
 */

import { Vector2D } from '../utils/Vector2D.js';

/**
 * Projectile entity class
 * Manages projectile state, movement, and hit tracking
 */
export class Projectile {
    /**
     * Creates a new Projectile
     * @param {number} x - Starting X position
     * @param {number} y - Starting Y position
     * @param {Vector2D} direction - Normalized direction vector
     * @param {Object} weapon - Weapon that fired this projectile
     */
    constructor(x, y, direction, weapon) {
        /** @type {string} Entity type identifier */
        this.type = 'projectile';

        /** @type {string} Weapon type that fired this */
        this.weaponType = weapon.id;

        /** @type {Vector2D} Current position */
        this.position = new Vector2D(x, y);

        /** @type {Vector2D} Starting position (for range calculation) */
        this.startPosition = new Vector2D(x, y);

        /** @type {Vector2D} Velocity vector */
        this.velocity = direction.multiply(weapon.projectileSpeed);

        /** @type {number} Damage dealt on hit */
        this.damage = weapon.damage;

        /** @type {number} Number of enemies this can pierce through */
        this.piercing = weapon.piercing;

        /** @type {number} Maximum travel distance */
        this.range = weapon.range;

        /** @type {number} Distance traveled so far */
        this.distanceTraveled = 0;

        /** @type {number} Number of enemies hit */
        this.hitCount = 0;

        /** @type {number} Collision radius */
        this.radius = 4;

        /** @type {boolean} Whether projectile is active */
        this.alive = true;
    }

    /**
     * Updates the projectile each frame
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        if (!this.alive) {
            return;
        }

        // Calculate movement this frame
        const movement = this.velocity.multiply(deltaTime);
        const moveDistance = movement.magnitude();

        // Update position
        this.position = this.position.add(movement);

        // Track total distance traveled
        this.distanceTraveled += moveDistance;

        // Deactivate if exceeded range
        if (this.distanceTraveled >= this.range) {
            this.alive = false;
        }
    }

    /**
     * Called when projectile hits an enemy
     * @returns {boolean} True if projectile should be destroyed
     */
    onHit() {
        this.hitCount++;

        // Destroy if exceeded pierce count
        // piercing = 0 means hits 1 enemy
        // piercing = 1 means hits 2 enemies, etc.
        if (this.hitCount > this.piercing) {
            this.alive = false;
            return true;
        }

        return false;
    }

    /**
     * Gets the current speed of the projectile
     * @returns {number} Speed in pixels per second
     */
    getSpeed() {
        return this.velocity.magnitude();
    }

    /**
     * Checks if projectile is within given bounds
     * @param {number} minX - Minimum X
     * @param {number} minY - Minimum Y
     * @param {number} maxX - Maximum X
     * @param {number} maxY - Maximum Y
     * @returns {boolean} True if within bounds
     */
    isInBounds(minX, minY, maxX, maxY) {
        return this.position.x >= minX &&
            this.position.x <= maxX &&
            this.position.y >= minY &&
            this.position.y <= maxY;
    }
}
