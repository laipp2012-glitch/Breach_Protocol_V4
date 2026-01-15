/**
 * Weapon Configuration
 * Defines all weapon types and their properties using a unified schema
 * @module config/WeaponConfig
 */

/**
 * Standard Weapon Definition Schema
 * @typedef {Object} WeaponConfig
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {string} description - Description
 * @property {Object} baseStats - Base stats at level 1
 * @property {number} baseStats.damage - Damage per hit
 * @property {number} baseStats.cooldown - Time between attacks (seconds)
 * @property {number} baseStats.area - Primary Area stat (Range, Radius, Spread)
 * @property {number} baseStats.size - Projectile Size / Scale (Default 1.0)
 * @property {number} baseStats.speed - Projectile / Orbit Speed
 * @property {number} baseStats.duration - Lifetime / Duration (seconds)
 * @property {number} baseStats.amount - Number of projectiles/drones per fire
 * @property {number} baseStats.pierce - Number of enemies to pierce
 * @property {Object} affectedBy - Flags for passive stat scaling
 * @property {boolean} affectedBy.damage - affected by damageMultiplier
 * @property {boolean} affectedBy.area - affected by areaMultiplier
 * @property {boolean} affectedBy.cooldown - affected by cooldownMultiplier
 * @property {boolean} affectedBy.speed - affected by speedMultiplier
 * @property {boolean} affectedBy.duration - affected by durationMultiplier
 * @property {boolean} affectedBy.amount - affected by amountBonus
 * @property {Array} upgrades - Array of upgrade steps
 */

export const WEAPON_TYPES = {
    /**
     * Magic Wand - Basic auto-targeting projectile weapon
     */
    MAGIC_WAND: {
        id: 'magic_wand',
        name: 'Magic Wand',
        symbol: '¡',
        color: '#8888ff',
        description: 'Fires magic projectiles at the nearest enemy',
        type: 'projectile',
        baseStats: {
            damage: 5,
            cooldown: 1.0,
            area: 400,        // Range
            size: 1.0,
            speed: 200,
            duration: 0,
            amount: 1,
            pierce: 0
        },
        affectedBy: {
            damage: true,
            area: true,       // Affects Size (User Request)
            cooldown: true,
            speed: true,
            duration: false,
            amount: true
        },
        maxLevel: 4,
        upgrades: [
            { level: 2, description: '+Damage, +Amount', property: 'baseStats.damage', value: 5, operation: 'set' },
            { level: 2, description: '', property: 'baseStats.amount', value: 2, operation: 'set' },

            { level: 3, description: '+Damage, +Amount', property: 'baseStats.damage', value: 9, operation: 'set' },
            { level: 3, description: '', property: 'baseStats.amount', value: 3, operation: 'set' },

            { level: 4, description: 'MAX Power', property: 'baseStats.damage', value: 15, operation: 'set' },
            { level: 4, description: '', property: 'baseStats.amount', value: 4, operation: 'set' }
        ]
    },

    /**
     * Knife - Fast projectiles in movement direction
     */
    KNIFE: {
        id: 'knife',
        name: 'Throwing Knife',
        symbol: '†',
        color: '#cccccc',
        description: 'Throws fast knives in the direction you are moving',
        type: 'projectile_directional',
        baseStats: {
            damage: 3,
            cooldown: 1.0,   // approx 1.5 attacks/sec
            area: 300,        // Range
            size: 1.0,
            speed: 500,
            duration: 0,
            amount: 1,
            pierce: 2
        },
        affectedBy: {
            damage: true,
            area: true,       // Affects Size
            cooldown: true,
            speed: true,
            duration: false,
            amount: true
        },
        maxLevel: 4,
        upgrades: [
            { level: 2, description: '+Amount, -Cooldown', property: 'baseStats.amount', value: 2, operation: 'set' },
            { level: 2, description: '', property: 'baseStats.cooldown', value: 0.6, operation: 'set' },

            { level: 3, description: '+Damage, +Pierce', property: 'baseStats.damage', value: 7, operation: 'set' },
            { level: 3, description: '', property: 'baseStats.pierce', value: 2, operation: 'set' },

            { level: 4, description: 'MAX Power', property: 'baseStats.amount', value: 3, operation: 'set' },
            { level: 4, description: '', property: 'baseStats.damage', value: 12, operation: 'set' },
            { level: 4, description: '', property: 'baseStats.pierce', value: 3, operation: 'set' }
        ]
    },

    /**
     * Garlic - Damage aura around player
     */
    GARLIC: {
        id: 'garlic',
        name: 'Garlic Aura',
        symbol: '○',
        color: '#ffff00',
        description: 'Creates a damaging aura around the player',
        type: 'aura',
        baseStats: {
            damage: 3,        // Increased from 2
            cooldown: 0.4,    // Reduced from 0.5 (faster ticks)
            area: 60,         // Radius
            size: 1.0,        // Visual scale
            speed: 0,
            duration: 0,
            amount: 0,
            pierce: 999
        },
        affectedBy: {
            damage: true,
            area: true,       // Affects Radius
            cooldown: true,
            speed: false,
            duration: false,
            amount: false
        },
        maxLevel: 4,
        upgrades: [
            { level: 2, description: '+Damage', property: 'baseStats.damage', value: 7, operation: 'set' },
            { level: 3, description: '+Damage', property: 'baseStats.damage', value: 11, operation: 'set' },
            { level: 4, description: 'MAX Power', property: 'baseStats.damage', value: 12, operation: 'set' },
            { level: 4, description: '', property: 'baseStats.area', value: 100, operation: 'set' }
        ]
    },

    /**
     * Drone - Orbiting defense drones
     */
    ORBIT: {
        id: 'orbit',
        name: 'Orbiting Shield',
        symbol: '♦',
        color: '#00ffff',
        description: 'Deploys defensive drones that orbit and damage enemies',
        type: 'orbit',
        baseStats: {
            damage: 7,
            cooldown: 0,      // Continuous / Contact
            area: 80,         // Orbit Radius
            size: 1.0,
            speed: 180,       // Orbit Speed
            duration: 0,
            amount: 2,
            pierce: 999,
            droneChar: 'D',
            droneColor: '#00FFFF'
        },
        affectedBy: {
            damage: true,
            area: true,       // Affects Radius AND Size (User Request)
            cooldown: false,
            speed: true,      // Affects Orbit Speed
            duration: false,
            amount: true
        },
        maxLevel: 4,
        upgrades: [
            { level: 2, description: '+1 Drone, +Damage', property: 'baseStats.amount', value: 3, operation: 'set' },
            { level: 2, description: '', property: 'baseStats.damage', value: 20, operation: 'set' },

            { level: 3, description: '+1 Drone', property: 'baseStats.amount', value: 4, operation: 'set' },

            { level: 4, description: 'MAX Speed', property: 'baseStats.speed', value: 240, operation: 'set' }
        ]
    },

    /**
     * Scatter Cannon - Cone spread
     */
    SCATTER: {
        id: 'scatter',
        name: 'Scatter Shot',
        symbol: '░',
        color: '#ff8888',
        description: 'Fires a spread of short-range projectiles',
        type: 'projectile_spread',
        baseStats: {
            damage: 2,
            cooldown: 1.0,   // 1.2 attacks/sec
            area: 300,        // Range (projectile lifetime distance)
            size: 1.0,
            speed: 350,
            duration: 0.4,    // Lifetime
            amount: 3,
            pierce: 1,
            spreadAngle: 45,  // Cone spread in degrees
            projectileChar: '*',
            projectileColor: '#FFA500'
        },
        affectedBy: {
            damage: true,
            area: true,       // Affects Size
            cooldown: true,
            speed: true,
            duration: true,
            amount: true
        },
        maxLevel: 4,
        upgrades: [
            { level: 2, description: '+Amount, +Damage', property: 'baseStats.amount', value: 7, operation: 'set' },
            { level: 2, description: '', property: 'baseStats.damage', value: 4, operation: 'set' },

            { level: 3, description: '+Spread', property: 'baseStats.spreadAngle', value: 60, operation: 'set' },

            { level: 4, description: 'MAX Pierce', property: 'baseStats.pierce', value: 1, operation: 'set' },
            { level: 4, description: '', property: 'baseStats.damage', value: 6, operation: 'set' }
        ]
    },

    /**
     * Seeker - Homing missiles
     */
    SEEKER: {
        id: 'seeker',
        name: 'Magic Missile',
        symbol: '»',
        color: '#ff00ff',
        description: 'Fires homing missiles that chase enemies',
        type: 'projectile_homing',
        baseStats: {
            damage: 2,
            cooldown: 0.66,
            area: 400,        // Range (target acquisition / projectile lifetime)
            size: 1.0,
            speed: 200,
            duration: 3.0,
            amount: 3,
            pierce: 0,
            spreadAngle: 60,  // Spread angle in degrees
            homingStrength: 180,
            projectileChar: '>',
            projectileColor: '#FF00FF'
        },
        affectedBy: {
            damage: true,
            area: true,       // Affects Size
            cooldown: true,
            speed: true,
            duration: true,
            amount: true
        },
        maxLevel: 4,
        upgrades: [
            { level: 2, description: '+Amount, +Damage', property: 'baseStats.amount', value: 4, operation: 'set' },
            { level: 2, description: '', property: 'baseStats.damage', value: 4, operation: 'set' },

            { level: 3, description: '+Homing', property: 'baseStats.homingStrength', value: 270, operation: 'set' },

            { level: 4, description: 'MAX Swarm', property: 'baseStats.amount', value: 5, operation: 'set' },
            { level: 4, description: '', property: 'baseStats.damage', value: 6, operation: 'set' }
        ]
    },

    /**
     * Mine - Logic Bomb
     */
    MINE: {
        id: 'mine',
        name: 'Proximity Mine',
        symbol: 'x',
        color: '#00ff00',
        description: 'Drops explosive mines that detonate when enemies approach',
        type: 'deployable',
        baseStats: {
            damage: 11,
            cooldown: 3.0,
            area: 60,         // Explosion Radius
            size: 1.0,        // Visual scale
            speed: 0,
            duration: 8.0,    // Lifetime
            amount: 1,        // Mines deployed per cycle
            pierce: 999,
            maxActiveMines: 10,
            armDelay: 0.4,
            mineChar: '*',
            mineColor: '#FF00FF',
            mineColorArmed: '#FF00FF',
            mineColorUnarmed: '#880088'
        },
        affectedBy: {
            damage: true,
            area: true,       // Affects Radius
            cooldown: true,
            speed: false,
            duration: true,
            amount: false     // Amount bonus usually doesn't affect mine count per drop, but could?
        },
        maxLevel: 4,
        upgrades: [
            { level: 2, description: '+Damage, +Radius', property: 'baseStats.damage', value: 15, operation: 'set' },
            { level: 2, description: '', property: 'baseStats.area', value: 70, operation: 'set' },

            { level: 3, description: '+MaxMines', property: 'baseStats.maxActiveMines', value: 15, operation: 'set' },

            { level: 4, description: 'MAX Duration', property: 'baseStats.duration', value: 12, operation: 'set' }
        ]
    }
};

/**
 * Creates a weapon instance from a weapon type
 */
export function createWeapon(typeId) {
    const type = Object.values(WEAPON_TYPES).find(w => w.id === typeId);
    if (!type) {
        console.error(`Unknown weapon type: ${typeId}`);
        return null;
    }

    // deep copy base stats to avoid mutation of config
    return {
        ...type,
        baseStats: { ...type.baseStats },
        cooldown: 0,
        level: 1
    };
}

/**
 * Gets effective weapon stats including passives
 * @param {Object} weapon - Weapon instance
 * @param {Object} passiveStats - Player's calculated passive stats
 * @returns {Object} Final calculated stats
 */
export function getEffectiveWeaponStats(weapon, passiveStats = {}) {
    // 1. Start with current base stats (which should include level upgrades applied to the instance)
    const stats = { ...weapon.baseStats };

    // 2. Apply passive modifiers based on affectedBy flags
    const flags = weapon.affectedBy || {};

    // Damage
    if (flags.damage && passiveStats.damageMultiplier) {
        stats.damage *= passiveStats.damageMultiplier;
    }

    // Cooldown
    // Formula: Base * (1 - Reduction). 
    // passiveStats.cooldownMultiplier is a negative value (e.g. -0.4 for 40% reduction).
    if (flags.cooldown && passiveStats.cooldownMultiplier) {
        // Clamp minimum cooldown to 0.1s to prevent infinite fire
        stats.cooldown = Math.max(0.1, stats.cooldown * (1 + passiveStats.cooldownMultiplier));
    }

    // Speed (Projectile / Orbit)
    if (flags.speed && passiveStats.speedMultiplier) {
        // Use global speed multiplier (Wings) if weapon is affected by speed
        stats.speed *= passiveStats.speedMultiplier;
    }

    // Amount
    if (flags.amount && passiveStats.amountBonus) {
        stats.amount += passiveStats.amountBonus;
    }

    // Duration
    if (flags.duration && passiveStats.durationMultiplier) {
        stats.duration *= passiveStats.durationMultiplier;
    }

    // Area (Context Dependent Logic)
    if (flags.area && passiveStats.areaMultiplier) {
        const type = weapon.type || '';
        const mult = passiveStats.areaMultiplier; // e.g. 1.5 (+50%)

        if (type.startsWith('projectile')) {
            // Projectiles: Area -> Size
            stats.size *= mult;
        } else if (type === 'aura' || type === 'deployable') {
            // Aura/Mine: Area -> Radius/Area
            stats.area *= mult;
        } else if (type === 'orbit') {
            // Orbit: Area -> Radius AND Size
            stats.area *= mult; // increased orbit radius
            stats.size *= mult; // increased drone size
        }
    }

    // 3. Derived stats for compatibility/convenience
    return {
        ...stats,
        // Legacy mappings for consumers not yet updated (will remove in Phase 3)
        projectileSpeed: stats.speed,
        projectileCount: Math.floor(stats.amount),
        range: stats.area,
        attackSpeed: 1 / Math.max(0.01, stats.cooldown)
    };
}

/**
 * Applies a single upgrade to a weapon instance
 * @param {Object} weapon - Weapon to upgrade
 * @param {Object} upgrade - Upgrade definition
 */
export function applyUpgrade(weapon, upgrade) {
    if (upgrade.operation === 'set') {
        setNestedProperty(weapon, upgrade.property, upgrade.value);
    } else if (upgrade.operation === 'add') {
        const current = getNestedProperty(weapon, upgrade.property);
        setNestedProperty(weapon, upgrade.property, current + upgrade.value);
    }
}

// Helper for nested property access (e.g. 'baseStats.damage')
function setNestedProperty(obj, path, value) {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
}

function getNestedProperty(obj, path) {
    return path.split('.').reduce((o, i) => o[i], obj);
}

// Legacy wrapper (Deprecated)
// We keep this temporarily so existing code doesn't crash during refactor
export function getWeaponStats(weapon) {
    return getEffectiveWeaponStats(weapon, {});
}

// Freeze configs
Object.freeze(WEAPON_TYPES);
Object.values(WEAPON_TYPES).forEach(w => {
    Object.freeze(w);
    Object.freeze(w.baseStats);
    Object.freeze(w.affectedBy);
    Object.freeze(w.upgrades);
});
