/**
 * Upgrade Configuration
 * Defines all possible upgrades for level-up selection
 * @module config/UpgradeConfig
 */

import { GAME_CONFIG } from './GameConfig.js';
import { getAllPassives, getPassiveConfig } from './PassiveConfig.js';

/**
 * Upgrade categories
 * @enum {string}
 */
export const UPGRADE_CATEGORY = {
    WEAPON: 'weapon',
    PASSIVE: 'passive',
    NEW_WEAPON: 'new_weapon',
    NEW_PASSIVE: 'new_passive',
    SKIP: 'skip'
};

/**
 * Creates a weapon upgrade option (level up existing weapon)
 * @param {Object} weapon - Weapon to upgrade
 * @returns {Object} Upgrade option
 */
export function createWeaponUpgrade(weapon) {
    return {
        id: `upgrade_${weapon.id}`,
        name: `Level Up ${weapon.name}`,
        description: `Upgrade ${weapon.name} to level ${weapon.level + 1}`,
        category: UPGRADE_CATEGORY.WEAPON,
        weaponId: weapon.id,
        symbol: '↑',
        color: '#88ff88',
        apply: (player) => {
            player.upgradeWeapon(weapon.id);
        }
    };
}

/**
 * Creates a new weapon option
 * @param {Object} weaponType - Weapon type to add
 * @returns {Object} Upgrade option
 */
export function createNewWeaponUpgrade(weaponType) {
    return {
        id: `new_${weaponType.id}`,
        name: `New: ${weaponType.name}`,
        description: weaponType.description,
        category: UPGRADE_CATEGORY.NEW_WEAPON,
        weaponType: weaponType,
        symbol: '*',
        color: '#ffff88',
        apply: (player, createWeaponFn) => {
            player.addWeapon(weaponType.id, createWeaponFn);
        }
    };
}

/**
 * Creates a new passive item option
 * @param {Object} passiveConfig - Passive config to add
 * @returns {Object} Upgrade option
 */
export function createNewPassiveUpgrade(passiveConfig) {
    return {
        id: `new_passive_${passiveConfig.id}`,
        name: `New: ${passiveConfig.name}`,
        description: passiveConfig.description,
        category: UPGRADE_CATEGORY.NEW_PASSIVE,
        passiveId: passiveConfig.id,
        symbol: passiveConfig.symbol,
        color: passiveConfig.color,
        rarity: passiveConfig.rarity,
        apply: (player) => {
            player.addPassiveItem(passiveConfig.id);
        }
    };
}

/**
 * Creates a passive item upgrade option (level up existing passive)
 * @param {Object} passive - Passive item instance {id, level}
 * @returns {Object} Upgrade option
 */
export function createPassiveUpgrade(passive) {
    const config = getPassiveConfig(passive.id);
    if (!config) return null;

    // Get next level effect for description
    const nextEffect = config.effects.find(e => e.level === passive.level + 1);
    let description = `Upgrade ${config.name} to level ${passive.level + 1}`;

    if (nextEffect) {
        const effectKey = Object.keys(nextEffect).find(k => k !== 'level');
        if (effectKey) {
            const value = nextEffect[effectKey];
            const sign = value >= 0 ? '+' : '';
            description = `${config.description} (${sign}${value})`;
        }
    }

    return {
        id: `upgrade_passive_${passive.id}`,
        name: `Level Up ${config.name}`,
        description: description,
        category: UPGRADE_CATEGORY.PASSIVE,
        passiveId: passive.id,
        symbol: config.symbol,
        color: config.color,
        currentLevel: passive.level,
        maxLevel: config.maxLevel,
        apply: (player) => {
            player.upgradePassiveItem(passive.id);
        }
    };
}

/**
 * Creates a skip option (when no upgrades available)
 * @returns {Object} Skip option
 */
export function createSkipOption() {
    return {
        id: 'skip',
        name: 'Skip',
        description: 'All items are at max level',
        category: UPGRADE_CATEGORY.SKIP,
        symbol: '→',
        color: '#888888',
        apply: () => {
            // Do nothing
        }
    };
}

/**
 * Gets a list of available upgrades for the player
 * @param {Object} player - Player entity
 * @param {Array} availableWeapons - Weapon types player doesn't have
 * @returns {Array} Array of possible upgrades
 */
export function getAvailableUpgrades(player, availableWeapons = []) {
    const upgrades = [];
    const maxWeapons = GAME_CONFIG.INVENTORY.MAX_WEAPONS;
    const maxPassives = GAME_CONFIG.INVENTORY.MAX_PASSIVES;

    // 1. Add passive item upgrades (for existing passives not at max level)
    for (const passive of player.passiveItems) {
        const config = getPassiveConfig(passive.id);
        if (config && passive.level < config.maxLevel) {
            const upgrade = createPassiveUpgrade(passive);
            if (upgrade) {
                upgrades.push(upgrade);
            }
        }
    }

    // 2. Add weapon level-up options
    for (const weapon of player.weapons) {
        if (weapon.level < weapon.maxLevel) {
            upgrades.push(createWeaponUpgrade(weapon));
        }
    }

    // 3. Add new passive options (if player has room)
    if (player.passiveItems.length < maxPassives) {
        const ownedPassiveIds = player.passiveItems.map(p => p.id);
        const allPassives = getAllPassives();

        for (const passiveConfig of allPassives) {
            if (!ownedPassiveIds.includes(passiveConfig.id)) {
                upgrades.push(createNewPassiveUpgrade(passiveConfig));
            }
        }
    }

    // 4. Add new weapon options (if player has room)
    if (player.weapons.length < maxWeapons) {
        for (const weaponType of availableWeapons) {
            upgrades.push(createNewWeaponUpgrade(weaponType));
        }
    }

    return upgrades;
}

/**
 * Generates upgrade choices for level-up
 * @param {Object} player - Player entity
 * @param {Array} availableWeapons - Weapon types player doesn't have
 * @param {number} count - Number of choices to generate (default 3)
 * @returns {Array} Array of upgrade choices
 */
export function generateChoices(player, availableWeapons = [], count = 3) {
    const available = getAvailableUpgrades(player, availableWeapons);

    // If no upgrades available, return skip option
    if (available.length === 0) {
        return [createSkipOption()];
    }

    // Shuffle and pick up to count
    const shuffled = shuffleArray([...available]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Selects random upgrades from available options
 * @param {Array} upgrades - All available upgrades
 * @param {number} count - Number to select (default 3)
 * @returns {Array} Selected upgrades
 */
export function selectRandomUpgrades(upgrades, count = 3) {
    const shuffled = shuffleArray([...upgrades]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Fisher-Yates shuffle
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
