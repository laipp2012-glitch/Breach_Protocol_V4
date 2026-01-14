/**
 * Mine Entity - Deployable explosive that detonates when enemies get close
 * @module entities/Mine
 */

import { Vector2D } from '../utils/Vector2D.js';

/**
 * Mine entity class
 * Stationary explosive that arms after a delay and detonates when enemies approach
 */
export class Mine {
    /**
     * Creates a new Mine
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} config - Mine configuration from weapon
     */
    constructor(x, y, config) {
        /** @type {string} Entity type identifier */
        this.type = 'mine';

        /** @type {Vector2D} Position (stationary once placed) */
        this.position = new Vector2D(x, y);

        /** @type {number} Damage dealt on explosion */
        this.damage = config.damage || 40;

        /** @type {number} Explosion blast radius */
        this.explosionRadius = config.explosionRadius || 60;

        /** @type {number} Time in seconds before mine arms */
        this.armDelay = config.armDelay || 0.3;

        /** @type {number} Total lifetime in seconds */
        this.lifetime = config.mineLifetime || 8;

        /** @type {number} Time elapsed since creation */
        this.age = 0;

        /** @type {boolean} Whether mine is armed and can explode */
        this.armed = false;

        /** @type {boolean} Whether mine has exploded */
        this.exploded = false;

        /** @type {boolean} Whether mine is still active */
        this.alive = true;

        /** @type {string} Character for rendering */
        this.mineChar = config.mineChar || '*';

        /** @type {string} Color when armed */
        this.mineColorArmed = config.mineColorArmed || '#FF00FF';

        /** @type {string} Color when unarmed */
        this.mineColorUnarmed = config.mineColorUnarmed || '#880088';

        /** @type {number} Collision radius for rendering/debug */
        this.radius = 8;

        /** @type {number} Current visual scale (for pulse effect) */
        this.visualScale = 0.7;

        /** @type {number} Pulse timer for armed animation */
        this.pulseTimer = 0;
    }

    /**
     * Updates the mine each frame
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {Array} enemies - Array of enemy entities for proximity check
     * @returns {Object|null} Explosion data if mine exploded, null otherwise
     */
    update(deltaTime, enemies) {
        if (!this.alive || this.exploded) {
            return null;
        }

        // Update age
        this.age += deltaTime;

        // Check if lifetime expired
        if (this.age >= this.lifetime) {
            this.alive = false;
            return null;
        }

        // Check if mine should arm
        if (!this.armed && this.age >= this.armDelay) {
            this.armed = true;
        }

        // Update visual pulse for armed mines
        if (this.armed) {
            this.pulseTimer += deltaTime * 4; // Pulse speed
            this.visualScale = 0.9 + Math.sin(this.pulseTimer) * 0.1; // 0.8-1.0 scale
        }

        // Check proximity to enemies (only when armed)
        if (this.armed && enemies) {
            for (const enemy of enemies) {
                if (!enemy.alive || enemy.health <= 0) continue;

                const dx = enemy.position.x - this.position.x;
                const dy = enemy.position.y - this.position.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist <= this.explosionRadius) {
                    // Trigger explosion!
                    return this.explode(enemies);
                }
            }
        }

        return null;
    }

    /**
     * Triggers mine explosion
     * @param {Array} enemies - All enemies to check for blast damage
     * @returns {Object} Explosion data with affected enemies
     */
    explode(enemies) {
        this.exploded = true;
        this.alive = false;

        const affectedEnemies = [];

        // Find all enemies within explosion radius
        for (const enemy of enemies) {
            if (!enemy.alive || enemy.health <= 0) continue;

            const dx = enemy.position.x - this.position.x;
            const dy = enemy.position.y - this.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= this.explosionRadius) {
                affectedEnemies.push({
                    enemy,
                    distance: dist
                });
            }
        }

        return {
            position: { x: this.position.x, y: this.position.y },
            damage: this.damage,
            radius: this.explosionRadius,
            affectedEnemies
        };
    }

    /**
     * Gets current display color based on armed state
     * @returns {string} Hex color code
     */
    getColor() {
        return this.armed ? this.mineColorArmed : this.mineColorUnarmed;
    }

    /**
     * Gets current visual scale for rendering
     * @returns {number} Scale multiplier
     */
    getScale() {
        return this.armed ? this.visualScale : 0.7;
    }
}
