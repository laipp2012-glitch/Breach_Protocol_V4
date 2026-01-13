/**
 * Enemy Entity - Enemy characters that chase the player
 * Contains position, movement, and health logic
 * NOTE: This class has NO render() method - all rendering goes through RenderSystem
 * @module entities/Enemy
 */

import { Vector2D } from '../utils/Vector2D.js';

/**
 * Enemy entity class
 * Manages enemy state, movement toward player, and health
 */
export class Enemy {
    /**
     * Creates a new Enemy at the specified position
     * @param {number} x - Initial X position
     * @param {number} y - Initial Y position
     * @param {Object} config - Enemy type configuration
     */
    constructor(x, y, config) {
        /** @type {string} Entity type identifier */
        this.type = 'enemy';

        /** @type {string} Enemy type (basic, tank, fast) */
        this.enemyType = config.id;

        /** @type {Vector2D} Current position */
        this.position = new Vector2D(x, y);

        /** @type {Vector2D} Current velocity */
        this.velocity = new Vector2D(0, 0);

        /** @type {number} Movement speed in pixels per second */
        this.speed = config.speed;

        /** @type {number} Collision radius */
        this.radius = config.radius;

        /** @type {number} Current health */
        this.health = config.health;

        /** @type {number} Maximum health */
        this.maxHealth = config.health;

        /** @type {number} Damage dealt to player on collision */
        this.damage = config.damage;

        /** @type {number} XP dropped on death */
        this.xpValue = config.xpValue;

        /** @type {boolean} Whether enemy is alive */
        this.alive = true;

        /** @type {boolean} Whether enemy was recently damaged (for flash effect) */
        this.damaged = false;

        /** @type {number} Damage flash timer */
        this.damageFlashTimer = 0;

        // Add slight speed variation for visual interest
        this.speed *= 0.9 + Math.random() * 0.2; // ±10% speed variation
    }

    /**
     * Updates the enemy each frame
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {Vector2D} playerPosition - Current player position
     */
    update(deltaTime, playerPosition) {
        if (!this.alive) {
            return;
        }

        // Calculate direction to player
        const direction = playerPosition.subtract(this.position);
        const distance = direction.magnitude();

        // Only move if not already at player position
        if (distance > 1) {
            const normalizedDir = direction.normalize();
            this.velocity = normalizedDir.multiply(this.speed);
            this.position = this.position.add(this.velocity.multiply(deltaTime));
        } else {
            this.velocity = new Vector2D(0, 0);
        }

        // Update damage flash timer
        if (this.damaged) {
            this.damageFlashTimer -= deltaTime;
            if (this.damageFlashTimer <= 0) {
                this.damaged = false;
                this.damageFlashTimer = 0;
            }
        }
    }

    /**
     * Applies damage to the enemy
     * @param {number} amount - Amount of damage to apply
     * @returns {boolean} True if enemy died from this damage
     */
    takeDamage(amount) {
        if (!this.alive) {
            return false;
        }

        this.health -= amount;
        this.damaged = true;
        this.damageFlashTimer = 0.1; // 100ms flash

        if (this.health <= 0) {
            this.health = 0;
            this.alive = false;
            return true;
        }

        return false;
    }

    /**
     * Gets the health percentage
     * @returns {number} Health as percentage (0-1)
     */
    getHealthPercent() {
        return this.health / this.maxHealth;
    }

    /**
     * Pushes enemy away from a point (for separation)
     * @param {Vector2D} point - Point to push away from
     * @param {number} strength - Push strength
     */
    pushFrom(point, strength) {
        const direction = this.position.subtract(point);
        const distance = direction.magnitude();

        if (distance > 0 && distance < this.radius * 2) {
            const pushDir = direction.normalize();
            const pushAmount = (this.radius * 2 - distance) * strength;
            this.position = this.position.add(pushDir.multiply(pushAmount));
        }
    }
}
