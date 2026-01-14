/**
 * Experience System - Handles XP collection, leveling, and level-up screen
 * @module systems/ExperienceSystem
 */

import { Pickup } from '../entities/Pickup.js';
import { getAvailableUpgrades, selectRandomUpgrades } from '../config/UpgradeConfig.js';
import { WEAPON_TYPES } from '../config/WeaponConfig.js';

/**
 * Manages experience, leveling, and pickup collection
 */
export class ExperienceSystem {
    /**
     * Creates a new ExperienceSystem
     * @param {Function} onLevelUp - Callback when player levels up
     */
    constructor(onLevelUp = null) {
        /** @type {Function} Callback for level-up event */
        this.onLevelUp = onLevelUp;

        /** @type {number} Base XP for level 1 */
        this.baseXP = 4;

        /** @type {Array} Currently shown upgrade options */
        this.currentUpgradeOptions = [];

        /** @type {boolean} Whether level-up screen is showing */
        this.isLevelingUp = false;
    }

    /**
     * Calculates XP required for a specific level
     * Formula: baseXP * 1.25^level - each level requires 25% more XP
     * Level 1: 5, Level 2: 6, Level 5: 12, Level 10: 36
     * @param {number} level - Level to calculate XP for
     * @returns {number} XP required
     */
    xpForLevel(level) {
        return Math.floor(this.baseXP * Math.pow(1.25, level));
    }

    /**
     * Updates the experience system
     * @param {number} deltaTime - Time since last frame
     * @param {Object} player - Player entity
     * @param {Array} pickups - Array of pickup entities
     * @returns {boolean} True if player leveled up this frame
     */
    update(deltaTime, player, pickups) {
        if (this.isLevelingUp) {
            return false;
        }

        // Update pickups (magnetic pull) - use effective pickup radius from passives
        const effectivePickupRadius = player.getEffectivePickupRadius ?
            player.getEffectivePickupRadius() : player.pickupRadius;

        for (const pickup of pickups) {
            if (pickup.alive) {
                pickup.update(deltaTime, player.position, effectivePickupRadius);
            }
        }

        // Check for pickup collection
        let leveledUp = false;
        for (const pickup of pickups) {
            if (!pickup.alive) continue;

            if (pickup.checkCollision(player)) {
                if (pickup.pickupType === 'xp') {
                    leveledUp = this.addExperience(player, pickup.value) || leveledUp;
                } else if (pickup.pickupType === 'health') {
                    player.heal(pickup.value);
                }
                pickup.alive = false;
            }
        }

        return leveledUp;
    }

    /**
     * Adds experience to the player
     * @param {Object} player - Player entity
     * @param {number} amount - XP amount
     * @returns {boolean} True if player leveled up
     */
    addExperience(player, amount) {
        // Apply XP multiplier from passives
        const xpMultiplier = player.passiveStats?.xpMultiplier || 1;
        const finalAmount = Math.floor(amount * xpMultiplier);

        player.experience += finalAmount;

        const xpNeeded = this.xpForLevel(player.level);

        if (player.experience >= xpNeeded) {
            player.experience -= xpNeeded;
            player.level++;
            this.triggerLevelUp(player);
            return true;
        }

        return false;
    }

    /**
     * Triggers the level-up process
     * @param {Object} player - Player entity
     */
    triggerLevelUp(player) {
        this.isLevelingUp = true;

        // Get weapons player doesn't have
        const ownedWeaponIds = player.weapons.map(w => w.id);
        const availableWeapons = Object.values(WEAPON_TYPES)
            .filter(w => !ownedWeaponIds.includes(w.id));

        // Get available upgrades
        const allUpgrades = getAvailableUpgrades(player, availableWeapons);

        // Select 3 random upgrades
        this.currentUpgradeOptions = selectRandomUpgrades(allUpgrades, 3);

        // Trigger callback
        if (this.onLevelUp) {
            this.onLevelUp(this.currentUpgradeOptions);
        }
    }

    /**
     * Applies the selected upgrade
     * @param {number} index - Index of selected upgrade (0-2)
     * @param {Object} player - Player entity
     * @param {Function} createWeaponFn - Function to create new weapons
     */
    selectUpgrade(index, player, createWeaponFn = null) {
        if (index < 0 || index >= this.currentUpgradeOptions.length) {
            return;
        }

        const upgrade = this.currentUpgradeOptions[index];

        // Apply the upgrade
        if (upgrade.apply) {
            upgrade.apply(player, createWeaponFn);
        }

        // Resume game
        this.isLevelingUp = false;
        this.currentUpgradeOptions = [];
    }

    /**
     * Creates XP pickups from a dead enemy
     * @param {Object} enemy - The dead enemy
     * @returns {Array} Array of new pickups
     */
    spawnPickupsFromEnemy(enemy) {
        const pickups = [];

        if (enemy.xpValue > 0) {
            // Create XP gem at enemy position
            const xpGem = Pickup.createXPGem(
                enemy.position.x,
                enemy.position.y,
                enemy.xpValue
            );
            pickups.push(xpGem);
        }

        return pickups;
    }

    /**
     * Gets the XP progress for rendering
     * @param {Object} player - Player entity
     * @returns {Object} XP progress data
     */
    getXPProgress(player) {
        const xpNeeded = this.xpForLevel(player.level);
        return {
            current: player.experience,
            required: xpNeeded,
            percent: player.experience / xpNeeded,
            level: player.level
        };
    }
}
