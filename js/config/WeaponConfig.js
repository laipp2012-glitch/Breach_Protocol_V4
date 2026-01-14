/**
 * Weapon Configuration
 * Defines all weapon types and their properties
 * @module config/WeaponConfig
 */

/**
 * @typedef {Object} WeaponType
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {string} description - Weapon description
 * @property {number} damage - Base damage per hit
 * @property {number} attackSpeed - Attacks per second
 * @property {number} projectileSpeed - Projectile speed in pixels/second
 * @property {number} projectileCount - Number of projectiles per attack
 * @property {number} piercing - Number of enemies a projectile can hit (0 = hits 1 enemy)
 * @property {number} range - Maximum projectile travel distance
 * @property {number} maxLevel - Maximum upgrade level
 */

/**
 * Weapon type definitions
 * @type {Object.<string, WeaponType>}
 */
export const WEAPON_TYPES = {
    /**
     * Magic Wand - Basic auto-targeting projectile weapon
     */
    MAGIC_WAND: {
        id: 'magic_wand',
        name: 'Magic Wand',
        description: 'Fires magic projectiles at the nearest enemy',
        damage: 5,
        attackSpeed: 1,        // 1.5 attacks per second
        projectileSpeed: 300,    // Pixels per second
        projectileCount: 1,      // Projectiles per attack
        piercing: 0,             // Hits 1 enemy only (piercing + 1)
        range: 400,              // Max travel distance
        maxLevel: 8,
        // Level bonuses (applied per level)
        levelBonus: {
            damage: 3,           // +3 damage per level
            attackSpeed: 0.1,    // +0.1 attacks/sec per level
            projectileCount: 0   // +1 projectile at levels 3, 5, 7
        }
    },

    /**
     * Knife - Fast projectiles in the direction player is moving
     */
    KNIFE: {
        id: 'knife',
        name: 'Knife',
        description: 'Throws fast knives in the direction you are moving',
        damage: 8,
        attackSpeed: 1.5,
        projectileSpeed: 500,
        projectileCount: 1,
        piercing: 1,             // Pierces through 2 enemies
        range: 300,
        maxLevel: 8,
        levelBonus: {
            damage: 2,
            attackSpeed: 0.15,
            projectileCount: 0
        }
    },

    /**
     * Garlic - Damage aura around player
     */
    GARLIC: {
        id: 'garlic',
        name: 'Garlic',
        description: 'Creates a damaging aura around the player',
        damage: 5,
        attackSpeed: 2,          // Damage ticks per second
        projectileSpeed: 0,      // No projectile
        projectileCount: 0,
        piercing: 999,           // Hits all in range
        range: 60,               // Aura radius
        maxLevel: 8,
        levelBonus: {
            damage: 2,
            range: 5
        }
    },

    /**
     * Drone - Orbiting defense drones that damage enemies on contact
     */
    DRONE: {
        id: 'drone',
        name: 'Security Drone',
        description: 'Deploys defensive drones that orbit and damage enemies',
        type: 'orbit',           // NEW type for orbit weapons
        damage: 15,
        orbitRadius: 80,         // Distance from player
        orbitSpeed: 180,         // Degrees per second
        maxDrones: 2,            // Start with 2 drones
        droneChar: 'D',          // ASCII character
        droneColor: '#99ff00ff',   // Cyan
        maxLevel: 5,
        // Upgrade progression
        upgrades: [
            { level: 2, property: 'maxDrones', value: 3 },
            { level: 3, property: 'damage', value: 20 },
            { level: 4, property: 'maxDrones', value: 4 },
            { level: 5, property: 'orbitSpeed', value: 240 }
        ]
    },

    /**
     * Scatter Cannon - Fires multiple pellets in a cone spread
     */
    SCATTER: {
        id: 'scatter',
        name: 'Scatter Cannon',
        description: 'Fires a spread of pellets in a cone',
        type: 'projectile',          // Uses existing projectile system
        damage: 12,
        attackSpeed: 1.2,            // Fires slower than wand (fires/second)
        projectileSpeed: 350,        // Pellet speed
        projectileLifetime: 0.4,     // Short range (seconds)
        pierce: 0,                   // No pierce by default
        projectileCount: 5,          // Fire 5 pellets
        spreadAngle: 30,             // 30-degree cone
        projectileChar: '.',         // Small pellet character
        projectileColor: '#FFA500',  // Orange
        maxLevel: 5,
        // Upgrade progression
        upgrades: [
            { level: 2, property: 'projectileCount', value: 7 },
            { level: 3, property: 'damage', value: 18 },
            { level: 4, property: 'spreadAngle', value: 45 },
            { level: 5, property: 'pierce', value: 1 }
        ]
    },

    /**
     * Homing Seeker - Fires homing missiles that track enemies
     */
    SEEKER: {
        id: 'seeker',
        name: 'Homing Seeker',
        description: 'Fires homing missiles that track enemies',
        type: 'projectile',          // Uses existing projectile system
        damage: 3,
        attackSpeed: 1.5,            // Fires 1.5 times per second
        projectileSpeed: 200,        // Slower than other projectiles
        projectileLifetime: 3,       // Long lifetime (3 seconds)
        pierce: 0,                   // No pierce by default
        projectileCount: 3,          // Fire 3 missiles at once
        spreadAngle: 60,             // Wide 60-degree spread
        isHoming: true,              // Enable homing behavior
        homingStrength: 180,         // Turn up to 180 deg/sec
        lockOnRadius: 400,           // Max distance to acquire targets
        projectileChar: '>',         // Arrow character
        projectileColor: '#FF00FF',  // Magenta
        maxLevel: 5,
        // Upgrade progression
        upgrades: [
            { level: 2, property: 'projectileCount', value: 4 },
            { level: 3, property: 'damage', value: 30 },
            { level: 4, property: 'homingStrength', value: 270 },
            { level: 5, property: 'projectileCount', value: 5 }
        ]
    },

    /**
     * Logic Bomb - Drops explosive mines that detonate when enemies get close
     */
    MINE: {
        id: 'mine',
        name: 'Logic Bomb',
        description: 'Drops explosive mines that detonate when enemies approach',
        type: 'deployable',          // NEW type for stationary deployables
        damage: 40,
        attackSpeed: 0.5,            // Drops mine every 0.5s (2 per second)
        mineLifetime: 8,             // Mines last 8 seconds
        armDelay: 0.3,               // Arms after 0.3s
        explosionRadius: 60,         // Blast radius
        maxActiveMines: 10,          // Max mines on field
        mineChar: '*',               // Asterisk character
        mineColor: '#FF00FF',        // Magenta (for explosion)
        mineColorArmed: '#FF00FF',   // Bright when armed
        mineColorUnarmed: '#880088', // Dimmer when unarmed
        maxLevel: 5,
        // Upgrade progression
        upgrades: [
            { level: 2, property: 'damage', value: 60 },
            { level: 3, property: 'explosionRadius', value: 80 },
            { level: 4, property: 'maxActiveMines', value: 15 },
            { level: 5, property: 'mineLifetime', value: 12 }
        ]
    }
};

/**
 * Creates a weapon instance from a weapon type
 * @param {string} typeId - Weapon type ID (e.g., 'magic_wand')
 * @returns {Object} Weapon instance with mutable state
 */
export function createWeapon(typeId) {
    const type = Object.values(WEAPON_TYPES).find(w => w.id === typeId);
    if (!type) {
        console.error(`Unknown weapon type: ${typeId}`);
        return null;
    }

    return {
        ...type,
        cooldown: 0,    // Current cooldown timer
        level: 1        // Current upgrade level
    };
}

/**
 * Gets the effective stats for a weapon at its current level
 * @param {Object} weapon - Weapon instance
 * @returns {Object} Calculated stats
 */
export function getWeaponStats(weapon) {
    const levelMultiplier = weapon.level - 1;
    const bonus = weapon.levelBonus || {};

    return {
        damage: weapon.damage + (bonus.damage || 0) * levelMultiplier,
        attackSpeed: weapon.attackSpeed + (bonus.attackSpeed || 0) * levelMultiplier,
        projectileSpeed: weapon.projectileSpeed,
        projectileCount: weapon.projectileCount + Math.floor(levelMultiplier / 2) * (bonus.projectileCount || 0),
        piercing: weapon.piercing,
        range: weapon.range + (bonus.range || 0) * levelMultiplier
    };
}

/**
 * Gets the effective stats for an orbit-type weapon at its current level
 * @param {Object} weapon - Orbit weapon instance
 * @returns {Object} Calculated orbit stats
 */
export function getOrbitWeaponStats(weapon) {
    // Start with base values
    let stats = {
        damage: weapon.damage,
        orbitRadius: weapon.orbitRadius,
        orbitSpeed: weapon.orbitSpeed,
        maxDrones: weapon.maxDrones,
        droneChar: weapon.droneChar,
        droneColor: weapon.droneColor
    };

    // Apply upgrades based on level
    if (weapon.upgrades) {
        for (const upgrade of weapon.upgrades) {
            if (weapon.level >= upgrade.level) {
                stats[upgrade.property] = upgrade.value;
            }
        }
    }

    return stats;
}

/**
 * Gets the effective stats for a scatter-type weapon at its current level
 * @param {Object} weapon - Scatter weapon instance
 * @returns {Object} Calculated scatter stats
 */
export function getScatterWeaponStats(weapon) {
    // Start with base values
    let stats = {
        damage: weapon.damage,
        attackSpeed: weapon.attackSpeed,
        projectileSpeed: weapon.projectileSpeed,
        projectileLifetime: weapon.projectileLifetime,
        pierce: weapon.pierce,
        projectileCount: weapon.projectileCount,
        spreadAngle: weapon.spreadAngle,
        projectileChar: weapon.projectileChar,
        projectileColor: weapon.projectileColor,
        // Calculate range from lifetime and speed
        range: weapon.projectileSpeed * weapon.projectileLifetime
    };

    // Apply upgrades based on level
    if (weapon.upgrades) {
        for (const upgrade of weapon.upgrades) {
            if (weapon.level >= upgrade.level) {
                stats[upgrade.property] = upgrade.value;
            }
        }
    }

    // Recalculate range if lifetime changed via upgrade
    stats.range = stats.projectileSpeed * stats.projectileLifetime;

    return stats;
}

/**
 * Gets the effective stats for a seeker-type weapon at its current level
 * @param {Object} weapon - Seeker weapon instance
 * @returns {Object} Calculated seeker stats
 */
export function getSeekerWeaponStats(weapon) {
    // Start with base values
    let stats = {
        damage: weapon.damage,
        attackSpeed: weapon.attackSpeed,
        projectileSpeed: weapon.projectileSpeed,
        projectileLifetime: weapon.projectileLifetime,
        pierce: weapon.pierce,
        projectileCount: weapon.projectileCount,
        spreadAngle: weapon.spreadAngle,
        isHoming: weapon.isHoming,
        homingStrength: weapon.homingStrength,
        lockOnRadius: weapon.lockOnRadius,
        projectileChar: weapon.projectileChar,
        projectileColor: weapon.projectileColor,
        // Calculate range from lifetime and speed
        range: weapon.projectileSpeed * weapon.projectileLifetime
    };

    // Apply upgrades based on level
    if (weapon.upgrades) {
        for (const upgrade of weapon.upgrades) {
            if (weapon.level >= upgrade.level) {
                stats[upgrade.property] = upgrade.value;
            }
        }
    }

    // Recalculate range if lifetime changed via upgrade
    stats.range = stats.projectileSpeed * stats.projectileLifetime;

    return stats;
}

/**
 * Gets the effective stats for a mine-type weapon at its current level
 * @param {Object} weapon - Mine weapon instance
 * @returns {Object} Calculated mine stats
 */
export function getMineWeaponStats(weapon) {
    // Start with base values
    let stats = {
        damage: weapon.damage,
        attackSpeed: weapon.attackSpeed,
        mineLifetime: weapon.mineLifetime,
        armDelay: weapon.armDelay,
        explosionRadius: weapon.explosionRadius,
        maxActiveMines: weapon.maxActiveMines,
        mineChar: weapon.mineChar,
        mineColor: weapon.mineColor,
        mineColorArmed: weapon.mineColorArmed,
        mineColorUnarmed: weapon.mineColorUnarmed
    };

    // Apply upgrades based on level
    if (weapon.upgrades) {
        for (const upgrade of weapon.upgrades) {
            if (weapon.level >= upgrade.level) {
                stats[upgrade.property] = upgrade.value;
            }
        }
    }

    return stats;
}

// Freeze base configs
Object.freeze(WEAPON_TYPES);
Object.freeze(WEAPON_TYPES.MAGIC_WAND);
Object.freeze(WEAPON_TYPES.MAGIC_WAND.levelBonus);
Object.freeze(WEAPON_TYPES.DRONE);
Object.freeze(WEAPON_TYPES.DRONE.upgrades);
Object.freeze(WEAPON_TYPES.SCATTER);
Object.freeze(WEAPON_TYPES.SCATTER.upgrades);
Object.freeze(WEAPON_TYPES.SEEKER);
Object.freeze(WEAPON_TYPES.SEEKER.upgrades);
Object.freeze(WEAPON_TYPES.MINE);
Object.freeze(WEAPON_TYPES.MINE.upgrades);

