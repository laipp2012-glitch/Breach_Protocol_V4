import { WEAPON_TYPES } from '../js/config/WeaponConfig.js';

let errors = 0;
console.log('Validating Weapon Configuration Schema...');

for (const [key, weapon] of Object.entries(WEAPON_TYPES)) {
    console.log(`Checking ${key}...`);

    if (!weapon.baseStats) {
        console.error(`[ERROR] ${key} missing baseStats`);
        errors++;
    } else {
        const requiredStats = ['damage', 'cooldown', 'area', 'size', 'speed', 'duration', 'amount', 'pierce'];
        for (const stat of requiredStats) {
            if (weapon.baseStats[stat] === undefined) {
                console.error(`[ERROR] ${key} missing baseStats.${stat}`);
                errors++;
            }
        }
    }

    if (!weapon.affectedBy) {
        console.error(`[ERROR] ${key} missing affectedBy flags`);
        errors++;
    } else {
        const requiredFlags = ['damage', 'area', 'cooldown', 'speed', 'duration', 'amount'];
        for (const flag of requiredFlags) {
            if (weapon.affectedBy[flag] === undefined) {
                console.error(`[ERROR] ${key} missing affectedBy.${flag}`);
                errors++;
            }
        }
    }
}

if (errors === 0) {
    console.log('SUCCESS: All weapon configs are valid.');
} else {
    console.error(`FAILED: Found ${errors} errors.`);
    process.exit(1);
}
