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

// Freeze base configs
Object.freeze(WEAPON_TYPES);
Object.freeze(WEAPON_TYPES.MAGIC_WAND);
Object.freeze(WEAPON_TYPES.MAGIC_WAND.levelBonus);
