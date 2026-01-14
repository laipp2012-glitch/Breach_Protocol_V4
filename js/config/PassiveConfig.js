/**
 * Passive Item Configuration
 * Defines all passive items and their level-based effects
 * @module config/PassiveConfig
 */

/**
 * Passive item definitions
 * Each passive has 5 levels with scaling effects
 * @type {Object.<string, Object>}
 */
export const PassiveConfig = {
    /**
     * Damage Amp - Increases all weapon damage
     */
    AMP: {
        id: 'amp',
        name: 'Damage Amp',
        symbol: '+',
        color: '#FF0000',
        description: 'Increases damage for all weapons',
        maxLevel: 3,
        rarity: 'common',
        effects: [
            { level: 1, damageMultiplier: 0.15 },
            { level: 2, damageMultiplier: 0.30 },
            { level: 3, damageMultiplier: 0.50 }
        ]
    },

    /**
     * Wings - Increases movement speed
     */
    WINGS: {
        id: 'wings',
        name: 'Wings',
        symbol: '^',
        color: '#00FFFF',
        description: 'Increases movement speed',
        maxLevel: 3,
        rarity: 'common',
        effects: [
            { level: 1, speedMultiplier: 0.15 },
            { level: 2, speedMultiplier: 0.30 },
            { level: 3, speedMultiplier: 0.50 }
        ]
    },

    /**
     * Magnet - Increases pickup radius
     */
    MAGNET: {
        id: 'magnet',
        name: 'Magnet',
        symbol: 'U',
        color: '#FFFF00',
        description: 'Increases pickup radius',
        maxLevel: 3,
        rarity: 'common',
        effects: [
            { level: 1, pickupRadiusBonus: 30 },
            { level: 2, pickupRadiusBonus: 60 },
            { level: 3, pickupRadiusBonus: 100 }
        ]
    },

    /**
     * Vigor - Increases max health
     */
    VIGOR: {
        id: 'vigor',
        name: 'Vigor',
        symbol: 'H',
        color: '#00FF00',
        description: 'Increases max health',
        maxLevel: 3,
        rarity: 'common',
        effects: [
            { level: 1, maxHealthBonus: 30 },
            { level: 2, maxHealthBonus: 60 },
            { level: 3, maxHealthBonus: 100 }
        ]
    },

    /**
     * Cooldown - Reduces weapon cooldowns
     */
    COOLDOWN: {
        id: 'cooldown',
        name: 'Cooldown',
        symbol: 'C',
        color: '#0088FF',
        description: 'Reduces weapon cooldowns',
        maxLevel: 3,
        rarity: 'common',
        effects: [
            { level: 1, cooldownMultiplier: -0.12 },
            { level: 2, cooldownMultiplier: -0.24 },
            { level: 3, cooldownMultiplier: -0.40 }
        ]
    },

    /**
     * Armor - Reduces damage taken
     */
    ARMOR: {
        id: 'armor',
        name: 'Armor',
        symbol: '#',
        color: '#888888',
        description: 'Reduces damage taken',
        maxLevel: 3,
        rarity: 'uncommon',
        effects: [
            { level: 1, damageReduction: 1 },
            { level: 2, damageReduction: 3 },
            { level: 3, damageReduction: 5 }
        ]
    },

    /**
     * Greed - Increases XP gained
     */
    GREED: {
        id: 'greed',
        name: 'Greed',
        symbol: '$',
        color: '#FFD700',
        description: 'Increases XP gained',
        maxLevel: 3,
        rarity: 'uncommon',
        effects: [
            { level: 1, xpMultiplier: 0.15 },
            { level: 2, xpMultiplier: 0.30 },
            { level: 3, xpMultiplier: 0.50 }
        ]
    },

    /**
     * Luck - Increases loot quality (for future loot system)
     */
    LUCK: {
        id: 'luck',
        name: 'Luck',
        symbol: '%',
        color: '#FF00FF',
        description: 'Increases loot quality',
        maxLevel: 3,
        rarity: 'rare',
        effects: [
            { level: 1, luckBonus: 15 },
            { level: 2, luckBonus: 30 },
            { level: 3, luckBonus: 50 }
        ]
    },

    /**
     * Regeneration - Slowly recover health
     */
    REGENERATION: {
        id: 'regeneration',
        name: 'Regeneration',
        symbol: '&',
        color: '#00FF88',
        description: 'Slowly recover health',
        maxLevel: 3,
        rarity: 'rare',
        effects: [
            { level: 1, healthRegen: 0.3 },
            { level: 2, healthRegen: 0.6 },
            { level: 3, healthRegen: 1.0 }
        ]
    },

    /**
     * Area - Increases weapon area of effect
     */
    AREA: {
        id: 'area',
        name: 'Area',
        symbol: 'O',
        color: '#FF8800',
        description: 'Increases weapon area of effect',
        maxLevel: 3,
        rarity: 'uncommon',
        effects: [
            { level: 1, areaMultiplier: 0.15 },
            { level: 2, areaMultiplier: 0.30 },
            { level: 3, areaMultiplier: 0.50 }
        ]
    },

    /**
     * Duration - Increases weapon effect duration
     */
    DURATION: {
        id: 'duration',
        name: 'Duration',
        symbol: '~',
        color: '#8888FF',
        description: 'Increases weapon effect duration',
        maxLevel: 3,
        rarity: 'uncommon',
        effects: [
            { level: 1, durationMultiplier: 0.15 },
            { level: 2, durationMultiplier: 0.30 },
            { level: 3, durationMultiplier: 0.50 }
        ]
    }
};

/**
 * Gets the passive config by ID (case-insensitive)
 * @param {string} passiveId - Passive ID to look up
 * @returns {Object|null} Passive config or null if not found
 */
export function getPassiveConfig(passiveId) {
    const key = passiveId.toUpperCase();
    return PassiveConfig[key] || null;
}

/**
 * Gets the effect for a passive at a specific level
 * @param {string} passiveId - Passive ID to look up
 * @param {number} level - Level (1-5)
 * @returns {Object|null} Effect object or null if not found
 */
export function getPassiveEffectAtLevel(passiveId, level) {
    const config = getPassiveConfig(passiveId);
    if (!config) return null;

    return config.effects.find(e => e.level === level) || null;
}

/**
 * Gets all passive configurations as an array
 * @returns {Array} Array of passive config objects
 */
export function getAllPassives() {
    return Object.values(PassiveConfig);
}

/**
 * Creates a passive item instance
 * @param {string} passiveId - Passive ID to create
 * @returns {Object|null} Passive instance or null if invalid ID
 */
export function createPassiveItem(passiveId) {
    const config = getPassiveConfig(passiveId);
    if (!config) return null;

    return {
        id: config.id,
        level: 1
    };
}

// Freeze configurations to prevent accidental modification
Object.freeze(PassiveConfig);
Object.values(PassiveConfig).forEach(passive => {
    Object.freeze(passive);
    Object.freeze(passive.effects);
    passive.effects.forEach(effect => Object.freeze(effect));
});
