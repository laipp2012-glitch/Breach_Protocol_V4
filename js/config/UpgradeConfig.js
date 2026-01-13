/**
 * Upgrade Configuration
 * Defines all possible upgrades for level-up selection
 * @module config/UpgradeConfig
 */

/**
 * Upgrade categories
 * @enum {string}
 */
export const UPGRADE_CATEGORY = {
    WEAPON: 'weapon',
    STAT: 'stat',
    NEW_WEAPON: 'new_weapon'
};

/**
 * Stat upgrade definitions
 * @type {Object}
 */
export const STAT_UPGRADES = {
    MAX_HEALTH: {
        id: 'max_health',
        name: '+20% Max Health',
        description: 'Increases maximum health by 20%',
        category: UPGRADE_CATEGORY.STAT,
        apply: (player) => {
            player.maxHealth = Math.floor(player.maxHealth * 1.2);
            player.health = Math.min(player.health + 20, player.maxHealth);
        }
    },
    MOVE_SPEED: {
        id: 'move_speed',
        name: '+10% Move Speed',
        description: 'Increases movement speed by 10%',
        category: UPGRADE_CATEGORY.STAT,
        apply: (player) => {
            player.speed = Math.floor(player.speed * 1.1);
        }
    },
    PICKUP_RADIUS: {
        id: 'pickup_radius',
        name: '+30% Pickup Radius',
        description: 'Increases XP gem collection radius by 30%',
        category: UPGRADE_CATEGORY.STAT,
        apply: (player) => {
            player.pickupRadius = Math.floor(player.pickupRadius * 1.3);
        }
    },
    DAMAGE_BOOST: {
        id: 'damage_boost',
        name: '+15% All Damage',
        description: 'Increases damage of all weapons by 15%',
        category: UPGRADE_CATEGORY.STAT,
        apply: (player) => {
            player.damageMultiplier = (player.damageMultiplier || 1) * 1.15;
        }
    },
    ATTACK_SPEED: {
        id: 'attack_speed',
        name: '+10% Attack Speed',
        description: 'All weapons attack 10% faster',
        category: UPGRADE_CATEGORY.STAT,
        apply: (player) => {
            player.attackSpeedMultiplier = (player.attackSpeedMultiplier || 1) * 1.1;
        }
    }
};

/**
 * Creates a weapon upgrade option
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
        apply: (player) => {
            const w = player.weapons.find(w => w.id === weapon.id);
            if (w && w.level < w.maxLevel) {
                w.level++;
            }
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
        apply: (player, createWeaponFn) => {
            const newWeapon = createWeaponFn(weaponType.id);
            if (newWeapon) {
                player.weapons.push(newWeapon);
            }
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

    // Add stat upgrades
    Object.values(STAT_UPGRADES).forEach(upgrade => {
        upgrades.push({ ...upgrade });
    });

    // Add weapon level-up options
    for (const weapon of player.weapons) {
        if (weapon.level < weapon.maxLevel) {
            upgrades.push(createWeaponUpgrade(weapon));
        }
    }

    // Add new weapon options (if player has < 6 weapons)
    if (player.weapons.length < 6) {
        for (const weaponType of availableWeapons) {
            upgrades.push(createNewWeaponUpgrade(weaponType));
        }
    }

    return upgrades;
}

/**
 * Selects random upgrades from available options
 * @param {Array} upgrades - All available upgrades
 * @param {number} count - Number to select (default 3)
 * @returns {Array} Selected upgrades
 */
export function selectRandomUpgrades(upgrades, count = 3) {
    const shuffled = [...upgrades].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}
