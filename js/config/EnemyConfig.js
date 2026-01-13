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
        speed: 80,
        damage: 5,
        xpValue: 1,
        radius: 12,
        spawnWeight: 100
    },

    /**
     * Tank enemy - slow but tanky with high damage
     * ASCII Character: T (dark red)
     */
    TANK: {
        id: 'tank',
        name: 'Tank',
        health: 50,
        speed: 40,
        damage: 15,
        xpValue: 5,
        radius: 18,
        spawnWeight: 20
    },

    /**
     * Fast enemy - quick but fragile
     * ASCII Character: F (orange)
     */
    FAST: {
        id: 'fast',
        name: 'Fast',
        health: 5,
        speed: 150,
        damage: 3,
        xpValue: 2,
        radius: 10,
        spawnWeight: 40
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
 * @returns {EnemyType} Selected enemy type
 */
export function getRandomEnemyType() {
    const totalWeight = getTotalSpawnWeight();
    let random = Math.random() * totalWeight;

    for (const type of Object.values(ENEMY_TYPES)) {
        random -= type.spawnWeight;
        if (random <= 0) {
            return type;
        }
    }

    // Fallback to basic
    return ENEMY_TYPES.BASIC;
}

// Freeze config to prevent accidental modification
Object.freeze(ENEMY_TYPES);
Object.freeze(ENEMY_TYPES.BASIC);
Object.freeze(ENEMY_TYPES.TANK);
Object.freeze(ENEMY_TYPES.FAST);
