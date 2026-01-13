/**
 * Player Entity - The main player character
 * Contains position, movement, and health logic
 * NOTE: This class has NO render() method - all rendering goes through RenderSystem
 * @module entities/Player
 */

import { Vector2D } from '../utils/Vector2D.js';
import { GAME_CONFIG } from '../config/GameConfig.js';

/**
 * Player entity class
 * Manages player state, movement, and properties
 */
export class Player {
    /**
     * Creates a new Player at the specified position
     * @param {number} x - Initial X position
     * @param {number} y - Initial Y position
     */
    constructor(x, y) {
        /** @type {string} Entity type identifier */
        this.type = 'player';

        /** @type {Vector2D} Current position */
        this.position = new Vector2D(x, y);

        /** @type {Vector2D} Current velocity */
        this.velocity = new Vector2D(0, 0);

        /** @type {number} Movement speed in pixels per second */
        this.speed = GAME_CONFIG.PLAYER.SPEED;

        /** @type {number} Collision radius */
        this.radius = GAME_CONFIG.PLAYER.RADIUS;

        /** @type {number} Current health */
        this.health = GAME_CONFIG.PLAYER.MAX_HEALTH;

        /** @type {number} Maximum health */
        this.maxHealth = GAME_CONFIG.PLAYER.MAX_HEALTH;

        /** @type {boolean} Whether player is currently invulnerable */
        this.invulnerable = false;

        /** @type {number} Remaining invulnerability time in seconds */
        this.invulnerableTimer = 0;

        /** @type {boolean} Whether player was recently damaged (for flash effect) */
        this.damaged = false;

        /** @type {number} Damage flash timer */
        this.damageFlashTimer = 0;

        // Experience/leveling (for Phase 4)
        /** @type {number} Current experience points */
        this.experience = 0;

        /** @type {number} Current level */
        this.level = 1;

        // Weapons array (for Phase 3)
        /** @type {Array} Equipped weapons */
        this.weapons = [];

        /** @type {number} Pickup magnet radius */
        this.pickupRadius = 50;
    }

    /**
     * Updates the player each frame
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {Vector2D} inputVector - Normalized movement input
     * @param {number} worldWidth - World width for bounds checking
     * @param {number} worldHeight - World height for bounds checking
     */
    update(deltaTime, inputVector, worldWidth, worldHeight) {
        // Update velocity based on input
        this.velocity = inputVector.multiply(this.speed);

        // Update position based on velocity and deltaTime
        this.position = this.position.add(this.velocity.multiply(deltaTime));

        // Clamp position to world bounds
        this.position.x = Math.max(
            this.radius,
            Math.min(worldWidth - this.radius, this.position.x)
        );
        this.position.y = Math.max(
            this.radius,
            Math.min(worldHeight - this.radius, this.position.y)
        );

        // Update invulnerability timer
        if (this.invulnerable) {
            this.invulnerableTimer -= deltaTime;
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
                this.invulnerableTimer = 0;
            }
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
     * Applies damage to the player
     * @param {number} amount - Amount of damage to apply
     * @returns {boolean} True if damage was applied (false if invulnerable)
     */
    takeDamage(amount) {
        if (this.invulnerable) {
            return false;
        }

        this.health -= amount;
        this.damaged = true;
        this.damageFlashTimer = 0.1; // 100ms flash

        // Become invulnerable after taking damage
        this.invulnerable = true;
        this.invulnerableTimer = GAME_CONFIG.PLAYER.INVULNERABLE_DURATION;

        // Check for death
        if (this.health <= 0) {
            this.health = 0;
            return true; // Could trigger death handling in game logic
        }

        return true;
    }

    /**
     * Heals the player
     * @param {number} amount - Amount to heal
     */
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    /**
     * Checks if the player is alive
     * @returns {boolean} True if health > 0
     */
    isAlive() {
        return this.health > 0;
    }

    /**
     * Adds experience to the player
     * @param {number} amount - XP amount to add
     * @returns {boolean} True if player leveled up
     */
    addExperience(amount) {
        this.experience += amount;

        // Check for level up (will be expanded in Phase 4)
        const xpNeeded = this.getXPForNextLevel();
        if (this.experience >= xpNeeded) {
            this.experience -= xpNeeded;
            this.level++;
            return true;
        }

        return false;
    }

    /**
     * Gets the XP required for the next level
     * @returns {number} XP needed for next level
     */
    getXPForNextLevel() {
        const baseXP = 5;
        return Math.floor(baseXP * Math.pow(1.1, this.level));
    }

    /**
     * Gets the player's current health as a percentage
     * @returns {number} Health percentage (0-1)
     */
    getHealthPercent() {
        return this.health / this.maxHealth;
    }

    /**
     * Gets the player's current XP as a percentage of next level
     * @returns {number} XP percentage (0-1)
     */
    getXPPercent() {
        return this.experience / this.getXPForNextLevel();
    }

    /**
     * Resets the player to initial state
     * @param {number} x - New X position
     * @param {number} y - New Y position
     */
    reset(x, y) {
        this.position.set(x, y);
        this.velocity.set(0, 0);
        this.health = this.maxHealth;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        this.damaged = false;
        this.damageFlashTimer = 0;
        this.experience = 0;
        this.level = 1;
        this.weapons = [];
    }
}
