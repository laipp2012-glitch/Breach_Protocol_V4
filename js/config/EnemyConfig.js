/**
 * Enemy Configuration
 * Defines all enemy types and their properties
 * @module config/EnemyConfig
 */

/**
 * @typedef {Object} EnemyType
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {number} health - Base health points
 * @property {number} speed - Movement speed in pixels/second
 * @property {number} damage - Damage dealt to player on collision
 * @property {number} xpValue - Experience points dropped on death
 * @property {number} radius - Collision radius in pixels
 * @property {number} spawnWeight - Relative spawn probability
 */

/**
 * Enemy type definitions
 * @type {Object.<string, EnemyType>}
 */
export const ENEMY_TYPES = {
    /**
     * Basic enemy - standard balanced stats
     * ASCII Character: E (red)
     */
    BASIC: {
        id: 'basic',
        name: 'Basic',
        health: 10,
        speed: 50,
        damage: 5,
        xpValue: 1,
        radius: 12,
        spawnWeight: 100,
        enabled: true
    },

    /**
     * Tank enemy - slow but tanky with high damage
     * ASCII Character: T (dark red)
     */
    TANK: {
        id: 'tank',
        name: 'Tank',
        health: 35,
        speed: 40,
        damage: 15,
        xpValue: 5,
        radius: 18,
        spawnWeight: 20,
        enabled: false
    },

    /**
     * Fast enemy - quick but fragile
     * ASCII Character: F (orange)
     */
    FAST: {
        id: 'fast',
        name: 'Fast',
        health: 5,
        speed: 70,
        damage: 3,
        xpValue: 2,
        radius: 10,
        spawnWeight: 40,
        enabled: true
    },

    /**
     * Ranger enemy - ranged attacker that maintains distance
     * ASCII Character: R (orange)
     */
    RANGER: {
        id: 'ranger',
        name: 'Ranger',
        health: 8,
        speed: 50,
        damage: 5,          // Contact damage if player touches
        xpValue: 4,
        radius: 12,
        spawnWeight: 30,
        enabled: true,

        // Ranger-specific AI properties
        preferredDistance: 180,    // Stay this far from player
        retreatDistance: 120,      // Retreat if closer than this
        detectionRange: 400,       // Only shoots if player within range

        // Projectile properties
        projectileSpeed: 180,
        projectileDamage: 8,
        projectileChar: '*',
        projectileColor: '#FF6600',
        projectileLifetime: 2,
        fireRate: 0.5              // Shoots every 2 seconds (1/2 = 0.5 per second)
    },

    /**
     * Swarm enemy - spawns mini enemies on death
     * ASCII Character: S (purple)
     */
    SWARM: {
        id: 'swarm',
        name: 'Swarm',
        health: 15,
        speed: 50,
        damage: 8,
        xpValue: 3,
        radius: 14,
        spawnWeight: 15,
        enabled: false,

        // Swarm-specific spawning properties
        spawnOnDeath: true,
        spawnCount: 6,
        spawnType: 'swarm_mini'
    },

    /**
     * Swarm Mini - spawned by Swarm on death
     * ASCII Character: o (light purple)
     */
    SWARM_MINI: {
        id: 'swarm_mini',
        name: 'Swarm Mini',
        health: 3,
        speed: 70,
        damage: 3,
        xpValue: 1,
        radius: 8,
        spawnWeight: 0,  // Not spawnable directly

        // Prevent infinite spawn chains
        spawnOnDeath: false
    }
};

/**
 * Get total spawn weight for weighted random selection
 * @returns {number} Sum of all spawn weights
 */
export function getTotalSpawnWeight() {
    return Object.values(ENEMY_TYPES).reduce((sum, type) => sum + type.spawnWeight, 0);
}

/**
 * Select a random enemy type based on spawn weights
 * @param {Array<string>} [allowedIds] - Optional list of allowed enemy IDs to filter by
 * @returns {EnemyType} Selected enemy type
 */
export function getRandomEnemyType(allowedIds = null) {
    let types = Object.values(ENEMY_TYPES);

    // Filter if allowedIds provided
    if (allowedIds) {
        types = types.filter(t => allowedIds.includes(t.id));
    }

    // Calculate total weight of available types
    const totalWeight = types.reduce((sum, type) => sum + type.spawnWeight, 0);

    let random = Math.random() * totalWeight;

    for (const type of types) {
        random -= type.spawnWeight;
        if (random <= 0) {
            return type;
        }
    }

    // Fallback to first available or Basic
    return types[0] || ENEMY_TYPES.BASIC;
}

// Freeze config to prevent accidental modification
Object.freeze(ENEMY_TYPES);
Object.freeze(ENEMY_TYPES.BASIC);
Object.freeze(ENEMY_TYPES.TANK);
Object.freeze(ENEMY_TYPES.FAST);
Object.freeze(ENEMY_TYPES.RANGER);
Object.freeze(ENEMY_TYPES.SWARM);
Object.freeze(ENEMY_TYPES.SWARM_MINI);
