/**
 * Player Entity - The main player character
 * Contains position, movement, and health logic
 * NOTE: This class has NO render() method - all rendering goes through RenderSystem
 * @module entities/Player
 */

import { Vector2D } from '../utils/Vector2D.js';
import { GAME_CONFIG } from '../config/GameConfig.js';
import { getPassiveConfig, getPassiveEffectAtLevel } from '../config/PassiveConfig.js';
import { createWeapon, WEAPON_TYPES, applyUpgrade } from '../config/WeaponConfig.js';

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

        // Passive items system
        /** @type {Array<{id: string, level: number}>} Equipped passive items */
        this.passiveItems = [];

        /** @type {Object} Calculated passive stats (recalculated when passives change) */
        this.passiveStats = this.calculatePassiveStats();

        // Base stats for reference (used with passives for effective values)
        /** @type {number} Base movement speed */
        this.baseSpeed = GAME_CONFIG.PLAYER.SPEED;

        /** @type {number} Base max health */
        this.baseMaxHealth = GAME_CONFIG.PLAYER.MAX_HEALTH;

        /** @type {number} Base pickup radius */
        this.basePickupRadius = 50;
    }

    /**
     * Updates the player each frame
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {Vector2D} inputVector - Normalized movement input
     * @param {number} worldWidth - World width for bounds checking
     * @param {number} worldHeight - World height for bounds checking
     */
    update(deltaTime, inputVector, worldWidth, worldHeight) {
        // Calculate effective speed with passive multiplier
        const effectiveSpeed = this.baseSpeed * this.passiveStats.speedMultiplier;

        // Update velocity based on input
        this.velocity = inputVector.multiply(effectiveSpeed);

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

        // Apply damage reduction from passives (minimum 1 damage)
        const reducedDamage = Math.max(1, amount - this.passiveStats.damageReduction);

        this.health -= reducedDamage;
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
        const effectiveMaxHealth = this.getEffectiveMaxHealth();
        this.health = Math.min(effectiveMaxHealth, this.health + amount);
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
        return this.health / this.getEffectiveMaxHealth();
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

        // Reset passive items
        this.passiveItems = [];
        this.passiveStats = this.calculatePassiveStats();
    }

    /**
     * Adds a weapon to the player
     * @param {string} typeId - Weapon type ID
     */
    addWeapon(typeId) {
        // Check if already have it
        if (this.weapons.some(w => w.id === typeId)) {
            return false;
        }

        const weapon = createWeapon(typeId);
        if (weapon) {
            this.weapons.push(weapon);
            return true;
        }
        return false;
    }

    /**
     * Upgrades an existing weapon
     * @param {string} weaponId - Weapon ID
     */
    upgradeWeapon(weaponId) {
        const weapon = this.weapons.find(w => w.id === weaponId);
        if (!weapon) return false;

        if (weapon.level >= weapon.maxLevel) return false;

        weapon.level++;

        // Apply specific upgrade effect for this level
        if (weapon.upgrades) {
            const upgrade = weapon.upgrades.find(u => u.level === weapon.level);
            if (upgrade) {
                applyUpgrade(weapon, upgrade);
            }
        }

        return true;
    }

    // ============================================
    // PASSIVE ITEM SYSTEM
    // ============================================

    /**
     * Adds a new passive item or upgrades existing one
     * @param {string} passiveId - ID of the passive to add
     * @returns {boolean} True if successful
     */
    addPassiveItem(passiveId) {
        const config = getPassiveConfig(passiveId);
        if (!config) return false;

        // Check if already have this passive
        const existing = this.passiveItems.find(p => p.id === passiveId);
        if (existing) {
            return this.upgradePassiveItem(passiveId);
        }

        // Add at level 1
        this.passiveItems.push({
            id: passiveId,
            level: 1
        });

        // Recalculate stats
        this.passiveStats = this.calculatePassiveStats();

        // If we gained max health bonus, heal the difference
        if (this.passiveStats.maxHealthBonus > 0) {
            const healthGain = this.passiveStats.maxHealthBonus;
            this.health = Math.min(this.getEffectiveMaxHealth(), this.health + healthGain);
        }

        return true;
    }

    /**
     * Upgrades an existing passive item
     * @param {string} passiveId - ID of the passive to upgrade
     * @returns {boolean} True if upgrade successful
     */
    upgradePassiveItem(passiveId) {
        const passive = this.passiveItems.find(p => p.id === passiveId);
        if (!passive) return false;

        const config = getPassiveConfig(passiveId);
        if (passive.level >= config.maxLevel) return false;

        // Store old max health bonus
        const oldMaxHealthBonus = this.passiveStats.maxHealthBonus;

        passive.level++;
        this.passiveStats = this.calculatePassiveStats();

        // If max health increased, heal the difference
        const healthGain = this.passiveStats.maxHealthBonus - oldMaxHealthBonus;
        if (healthGain > 0) {
            this.health = Math.min(this.getEffectiveMaxHealth(), this.health + healthGain);
        }

        return true;
    }

    /**
     * Calculates aggregate passive stats from all equipped passives
     * @returns {Object} Calculated passive stats
     */
    calculatePassiveStats() {
        const stats = {
            // Weapon Modifiers
            damageMultiplier: 1.0,
            areaMultiplier: 1.0,
            cooldownMultiplier: 0.0, // Additive reduction (e.g. 0.1 = 10% reduction)
            speedMultiplier: 1.0,
            durationMultiplier: 1.0,
            amountBonus: 0,

            // Global / Player Stats
            xpMultiplier: 1.0,
            pickupRadiusBonus: 0,
            maxHealthBonus: 0,
            damageReduction: 0,
            healthRegen: 0,
            luckBonus: 0
        };

        // Sum all passive effects
        for (const passive of this.passiveItems) {
            const effect = getPassiveEffectAtLevel(passive.id, passive.level);
            if (!effect) continue;

            // Apply each effect property
            for (const [key, value] of Object.entries(effect)) {
                if (key === 'level') continue;

                // Handle cooldown specially if it's negative in config (e.g. -0.1)
                // We want to sum reductions.

                if (key === 'cooldownMultiplier') {
                    // Config has negative values (e.g. -0.08)
                    // We sum them up. Result -0.4 means 40% reduction.
                    stats.cooldownMultiplier += value;
                }
                // Multipliers stack additively (1.0 + 0.1 + 0.1 = 1.2)
                else if (key.includes('Multiplier')) {
                    stats[key] += value;
                }
                // Flat bonuses stack additively
                else if (stats.hasOwnProperty(key)) {
                    stats[key] += value;
                }
            }
        }

        return stats;
    }

    /**
     * Gets the effective max health (base + passive bonus)
     * @returns {number} Effective max health
     */
    getEffectiveMaxHealth() {
        return this.baseMaxHealth + this.passiveStats.maxHealthBonus;
    }

    /**
     * Gets the effective pickup radius (base + passive bonus)
     * @returns {number} Effective pickup radius
     */
    getEffectivePickupRadius() {
        return this.basePickupRadius + this.passiveStats.pickupRadiusBonus;
    }

    /**
     * Applies health regeneration based on passive stats
     * @param {number} deltaTime - Time since last frame in seconds
     */
    applyRegeneration(deltaTime) {
        if (this.passiveStats.healthRegen > 0 && this.health > 0) {
            const effectiveMaxHealth = this.getEffectiveMaxHealth();
            this.health = Math.min(
                effectiveMaxHealth,
                this.health + this.passiveStats.healthRegen * deltaTime
            );
        }
    }
}
