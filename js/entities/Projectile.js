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
        // Ensure velocity is always a proper Vector2D even if direction.multiply returns a plain object
        const vel = direction.multiply(weapon.projectileSpeed);
        this.velocity = vel instanceof Vector2D ? vel : new Vector2D(vel.x, vel.y);


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

        /** @type {number} Projectile Size Multiplier */
        this.size = weapon.size || 1.0;

        /** @type {number} Collision radius (Base 4 * size) */
        this.radius = 4 * this.size;

        /** @type {boolean} Whether projectile is active */
        this.alive = true;

        /** @type {string|null} Custom character for rendering (if set by weapon) */
        this.customChar = weapon.customChar || null;

        /** @type {string|null} Custom color for rendering (if set by weapon) */
        this.customColor = weapon.customColor || null;

        // Homing missile properties (optional)
        /** @type {boolean} Whether this projectile homes in on targets */
        this.isHoming = weapon.isHoming || false;

        /** @type {number} Turn rate in degrees per second for homing */
        this.homingStrength = weapon.homingStrength || 0;

        /** @type {number} Maximum distance to acquire/track targets */
        this.lockOnRadius = weapon.lockOnRadius || 400; // Default 400

        /** @type {Object|null} Currently tracked enemy target */
        this.targetEnemy = null;

        /** @type {Set<string>} Set of IDs of enemies already hit */
        this.hitEnemies = new Set();
    }



    /**
     * Updates the projectile each frame
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {Array} enemies - Optional array of enemies for homing projectiles
     */
    update(deltaTime, enemies = null) {
        if (!this.alive) {
            return;
        }

        // Apply homing logic BEFORE position update (if this is a homing projectile)
        if (this.isHoming && enemies) {
            this.applyHomingBehavior(deltaTime, enemies);
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
     * Applies homing behavior - smoothly rotates velocity toward target
     * @param {number} deltaTime - Time since last frame
     * @param {Array} enemies - Array of enemy entities
     */
    applyHomingBehavior(deltaTime, enemies) {
        // Find target (prefer existing target if alive, else find nearest)
        let target = null;

        if (this.targetEnemy && this.targetEnemy.alive && this.targetEnemy.health > 0) {
            // Check if existing target is still within lock-on radius
            const dx = this.targetEnemy.position.x - this.position.x;
            const dy = this.targetEnemy.position.y - this.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= this.lockOnRadius) {
                target = this.targetEnemy;
            }
        }

        // Find new target if needed
        if (!target) {
            target = this.findNearestEnemy(enemies);
            this.targetEnemy = target;
        }

        if (!target) {
            return; // No target, continue straight
        }

        // Calculate angle to target
        const dx = target.position.x - this.position.x;
        const dy = target.position.y - this.position.y;
        const targetAngle = Math.atan2(dy, dx);

        // Current velocity angle
        const currentAngle = Math.atan2(this.velocity.y, this.velocity.x);

        // Calculate smallest angle difference
        let angleDiff = targetAngle - currentAngle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        // Apply turn rate (limited by homingStrength in degrees/second)
        const maxTurn = (this.homingStrength * Math.PI / 180) * deltaTime;
        const turn = Math.max(-maxTurn, Math.min(maxTurn, angleDiff));

        // Rotate velocity vector
        const newAngle = currentAngle + turn;
        const speed = this.velocity.magnitude();
        this.velocity = new Vector2D(
            Math.cos(newAngle) * speed,
            Math.sin(newAngle) * speed
        );
    }

    /**
     * Finds the nearest enemy within lock-on radius
     * @param {Array} enemies - Array of enemy entities
     * @returns {Object|null} Nearest enemy or null if none in range
     */
    findNearestEnemy(enemies) {
        let nearest = null;
        let minDist = this.lockOnRadius;

        for (const enemy of enemies) {
            if (!enemy.alive || enemy.health <= 0) continue;

            const dx = enemy.position.x - this.position.x;
            const dy = enemy.position.y - this.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < minDist) {
                minDist = dist;
                nearest = enemy;
            }
        }

        return nearest;
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
