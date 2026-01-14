/**
 * Weapon System - Manages weapon firing and projectile creation
 * Handles cooldowns, targeting, auto-firing, aura weapons, and deployables
 * @module systems/WeaponSystem
 */

import { Projectile } from '../entities/Projectile.js';
import { OrbitDrone } from '../entities/OrbitDrone.js';
import { Mine } from '../entities/Mine.js';
import { getEffectiveWeaponStats } from '../config/WeaponConfig.js';
import { Vector2D } from '../utils/Vector2D.js';

/**
 * Manages weapon behavior and projectile creation
 */
export class WeaponSystem {
    /**
     * Creates a new WeaponSystem
     */
    constructor() {
        /** @type {number} Maximum projectiles allowed on screen */
        this.maxProjectiles = 300;

        /** @type {Array} Enemies hit by aura this tick (to prevent multi-hit) */
        this.auraHitEnemies = new Set();

        /** @type {Array<OrbitDrone>} Active orbit drones */
        this.orbitDrones = [];

        /** @type {number} Last known drone count (to detect changes) */
        this.lastDroneCount = 0;

        /** @type {number} Last known drone weapon level (to detect upgrades) */
        this.lastDroneLevel = 0;

        /** @type {Array<Mine>} Active mines on the field */
        this.activeMines = [];
    }

    /**
     * Updates all weapons and projectiles
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {Object} player - The player entity
     * @param {Array} enemies - Array of enemy entities
     * @param {Array} projectiles - Array of active projectiles
     * @returns {Object} Result containing new projectiles and aura hits
     */
    update(deltaTime, player, enemies, projectiles) {
        const newProjectiles = [];
        const auraHits = [];

        // Update each weapon the player has
        for (const weapon of player.weapons) {
            // Get effective stats (includes Passives, Upgrades)
            // CRITICAL: This allows centralized stat management
            const stats = getEffectiveWeaponStats(weapon, player.passiveStats);

            // Handle orbit-type weapons separately (always active, no cooldown firing logic)
            if (weapon.type === 'orbit') {
                this.updateOrbitWeapon(deltaTime, player, weapon, stats);
                continue;
            }

            // Handle deployable-type weapons (mines)
            if (weapon.type === 'deployable') {
                weapon.cooldown -= deltaTime;
                if (weapon.cooldown <= 0) {
                    this.deployMine(player.position, stats);
                    // Use calculated stats.cooldown (includes reduction)
                    weapon.cooldown = stats.cooldown;
                }
                continue;
            }

            // Standard Cooldown Logic
            weapon.cooldown -= deltaTime;

            // Check if weapon can fire
            if (weapon.cooldown <= 0) {
                // Determine behavior based on weapon type
                if (weapon.type === 'aura') {
                    // Aura (Garlic): Damage check is per cooldown tick
                    const hits = this.processAuraWeapon(player, enemies, weapon, stats);
                    auraHits.push(...hits);
                    weapon.cooldown = stats.cooldown;

                } else if (weapon.type === 'projectile_directional') {
                    // Directional (Knife): Fire in movement direction or nearest enemy
                    let baseDirection = null;
                    const velMag = player.velocity ? player.velocity.magnitude() : 0;

                    if (velMag > 0.1) {
                        baseDirection = player.velocity.normalize();
                    } else {
                        const target = this.findNearestEnemy(player.position, enemies);
                        if (target) {
                            baseDirection = target.position.subtract(player.position).normalize();
                        }
                    }

                    if (baseDirection) {
                        const count = Math.floor(stats.amount) || 1;

                        if (count > 1) {
                            // Use spread firing for multiple projectiles
                            const targets = this.findMultipleTargets(player.position, enemies, count);
                            if (targets.length > 0) {
                                const fired = this.fireMultiTargetWeapon(player, player.position, targets, weapon, stats, projectiles.length + newProjectiles.length);
                                newProjectiles.push(...fired);
                            } else {
                                // No enemies, fire in movement direction with spread
                                const fired = this.fireDirectionalSpread(player, player.position, baseDirection, weapon, stats, projectiles.length + newProjectiles.length);
                                newProjectiles.push(...fired);
                            }
                        } else {
                            const fired = this.fireWeapon(player, player.position, baseDirection, weapon, stats, projectiles.length + newProjectiles.length);
                            newProjectiles.push(...fired);
                        }
                        weapon.cooldown = stats.cooldown;
                    }

                } else if (weapon.type === 'projectile_spread' || weapon.type === 'projectile_homing' || weapon.type === 'projectile') {
                    // Find multiple targets for multi-projectile weapons
                    const count = Math.floor(stats.amount) || 1;
                    const targets = this.findMultipleTargets(player.position, enemies, count);

                    if (targets.length > 0) {
                        // Fire at multiple targets or use spread if only one target
                        const fired = this.fireMultiTargetWeapon(player, player.position, targets, weapon, stats, projectiles.length + newProjectiles.length);
                        newProjectiles.push(...fired);
                        weapon.cooldown = stats.cooldown;
                    }
                }
            }
        }

        // Update all existing projectiles
        for (const projectile of projectiles) {
            projectile.update(deltaTime, enemies);
        }

        // Update orbit drones positions
        for (const drone of this.orbitDrones) {
            if (drone.alive) {
                drone.update(deltaTime, player.position);
            }
        }
        this.orbitDrones = this.orbitDrones.filter(d => d.alive);

        // Update mines
        const mineExplosions = [];
        for (const mine of this.activeMines) {
            const explosionData = mine.update(deltaTime, enemies);
            if (explosionData) {
                mineExplosions.push(explosionData);
            }
        }
        this.activeMines = this.activeMines.filter(m => m.alive);

        return {
            newProjectiles,
            auraHits,
            orbitDrones: this.orbitDrones,
            activeMines: this.activeMines,
            mineExplosions
        };
    }

    /**
     * Deploys a mine
     */
    deployMine(position, stats) {
        // Create mine config from Generic Stats
        const mineConfig = {
            damage: stats.damage,
            explosionRadius: stats.area, // Mapped from area
            armDelay: stats.armDelay,
            mineLifetime: stats.duration, // Mapped from duration
            mineChar: stats.mineChar,
            mineColorArmed: stats.mineColorArmed,
            mineColorUnarmed: stats.mineColorUnarmed
        };

        // Remove oldest mine if at capacity
        if (this.activeMines.length >= stats.maxActiveMines) {
            this.activeMines.shift();
        }

        const mine = new Mine(position.x, position.y, mineConfig);
        this.activeMines.push(mine);

        return mine;
    }

    /**
     * Updates orbit weapon (Drones)
     */
    updateOrbitWeapon(deltaTime, player, weapon, stats) {
        // stats.amount = maxDrones
        // stats.area = orbitRadius
        // stats.speed = orbitSpeed
        // stats.size = droneSize multiplier (handled in OrbitDrone or implicit?)
        // Wait, OrbitDrone needs explicit Orbit Radius.
        // We pass 'config' to OrbitDrone. We should pass mapped values.

        const orbitConfig = {
            orbitRadius: stats.area,
            orbitSpeed: stats.speed,
            damage: stats.damage,
            droneChar: stats.droneChar,
            droneColor: stats.droneColor,
            size: stats.size // New prop for visual size
        };

        const currentDroneCount = this.orbitDrones.length;
        const targetDroneCount = Math.floor(stats.amount);
        const weaponLevel = weapon.level;

        // Cleanup if weapon removed
        if (!player.weapons.some(w => w.id === weapon.id)) {
            this.orbitDrones.forEach(d => d.destroy());
            this.orbitDrones = [];
            this.lastDroneCount = 0;
            return;
        }

        // Reconfigure check
        if (currentDroneCount !== targetDroneCount || weaponLevel !== this.lastDroneLevel) {
            this.orbitDrones.forEach(d => d.destroy());
            this.orbitDrones = [];

            for (let i = 0; i < targetDroneCount; i++) {
                const drone = new OrbitDrone(i, targetDroneCount, orbitConfig);
                drone.update(0, player.position); // Init pos
                this.orbitDrones.push(drone);
            }
            this.lastDroneCount = targetDroneCount;
            this.lastDroneLevel = weaponLevel;
        } else {
            // Reconfigure existing drones with potentially new stats (e.g. Area passive changed radius dynamically)
            // It's expensive to do this every frame? No, passives change rarely.
            // Actually passives change stats frame-to-frame if Player.passiveStats changes.
            // Let's call reconfigure on drones every frame? Or just update their properties directly?
            // OrbitDrone has 'reconfigure'.
            this.orbitDrones.forEach((drone, i) => {
                drone.reconfigure(i, targetDroneCount, orbitConfig);
            });
        }
    }

    /**
     * Processes Aura (Garlic)
     */
    processAuraWeapon(player, enemies, weapon, stats) {
        const hits = [];
        const range = stats.area; // Mapped
        const rangeSq = range * range;

        for (const enemy of enemies) {
            if (!enemy.alive) continue;

            const dx = enemy.position.x - player.position.x;
            const dy = enemy.position.y - player.position.y;
            const distSq = dx * dx + dy * dy;

            if (distSq <= rangeSq) {
                // Damage is fully calculated in stats.damage (includes passive mult)
                const killed = enemy.takeDamage(stats.damage);
                hits.push({
                    enemy,
                    damage: stats.damage,
                    killed,
                    weaponId: weapon.id
                });
            }
        }
        return hits;
    }

    /**
     * Helper for Garlic Rendering
     */
    getGarlicAura(player) {
        const garlicWeapon = player.weapons.find(w => w.id === 'garlic');
        if (!garlicWeapon) return null;

        const stats = getEffectiveWeaponStats(garlicWeapon, player.passiveStats);

        // Pulse based on cooldown
        const cooldownRatio = garlicWeapon.cooldown / stats.cooldown;
        const pulseScale = 1 + (1 - cooldownRatio) * 0.1;

        return {
            x: player.position.x,
            y: player.position.y,
            radius: stats.area * pulseScale,
            baseRadius: stats.area,
            level: garlicWeapon.level,
            damage: stats.damage
        };
    }

    /**
     * Fire Weapon
     */
    fireWeapon(player, position, direction, weapon, stats, currentCount) {
        const projectiles = [];
        if (currentCount >= this.maxProjectiles) return projectiles;

        const weaponConfig = {
            id: weapon.id,
            damage: stats.damage,
            projectileSpeed: stats.speed,
            piercing: stats.pierce,
            range: stats.area, // Range mapped to area
            size: stats.size,  // Size multiplier
            customChar: stats.projectileChar,
            customColor: stats.projectileColor,
            isHoming: weapon.type === 'projectile_homing',
            homingStrength: stats.homingStrength,
            lockOnRadius: stats.area // Seeker range? No, seeker has 'lockOnRadius' not mapped to 'area'. 
            // My Schema for Seeker: area=60 (Spread). Range is derived Duration*Speed.
            // Wait, Seeker 'lockOnRadius' was in old config. Schema has it?
            // Seeker baseStats: cooldown, area, size, speed, duration, amount, pierce, homingStrength.
            // I did NOT put 'lockOnRadius' in baseStats. 
            // Default it to a high value or derive? 
            // Let's use 400 as default or if it's in baseStats (I assumed extended props are there).
            // Checked Schema: I only put std props. 
            // Fix: Access weapon.baseStats['lockOnRadius'] if it exists? 
            // getEffectiveWeaponStats copies ...baseStats. So any extra props in baseStats persist.
            // Seeker has 'homingStrength' in baseStats. Does it have 'lockOnRadius'?
            // Checked Step 256: Seeker baseStats has damage, cooldown, area... NO lockOnRadius.
            // So I should default it.
        };

        const count = Math.floor(stats.amount);
        // Spread logic - use explicit spreadAngle for all weapon types that need spread
        // area is always range, spreadAngle is always the spread angle in degrees

        let spreadAngle = 0;
        if (weapon.type === 'projectile_spread' || weapon.type === 'projectile_homing') {
            // Use explicit spreadAngle parameter
            spreadAngle = (stats.spreadAngle || 0) * (Math.PI / 180);
        }

        for (let i = 0; i < count; i++) {
            let finalDirection = direction;
            if (count > 1 && spreadAngle > 0) {
                const angleStep = spreadAngle / (count - 1);
                const startAngle = -spreadAngle / 2;
                const angleOffset = startAngle + (angleStep * i);
                // Rotation logic...
                const cos = Math.cos(angleOffset);
                const sin = Math.sin(angleOffset);
                finalDirection = new Vector2D(
                    direction.x * cos - direction.y * sin,
                    direction.x * sin + direction.y * cos
                );
            }

            // Create Projectile
            // NOTE: Projectile constructor needs update in Phase 3 to handle 'size'
            const projectile = new Projectile(position.x, position.y, finalDirection, weaponConfig);
            projectiles.push(projectile);
            if (currentCount + projectiles.length >= this.maxProjectiles) break;
        }

        return projectiles;
    }

    findNearestEnemy(position, enemies) {
        let nearest = null;
        let nearestDistSq = Infinity;
        for (const enemy of enemies) {
            if (!enemy.alive) continue;
            const dx = enemy.position.x - position.x;
            const dy = enemy.position.y - position.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < nearestDistSq) {
                nearestDistSq = distSq;
                nearest = enemy;
            }
        }
        return nearest;
    }

    /**
     * Find multiple enemies sorted by distance
     * @param {Vector2D} position - Origin position
     * @param {Array} enemies - All enemies
     * @param {number} count - How many to find
     * @returns {Array} Array of enemy objects
     */
    findMultipleTargets(position, enemies, count) {
        const living = enemies.filter(e => e.alive);

        // Sort by distance
        living.sort((a, b) => {
            const dxA = a.position.x - position.x;
            const dyA = a.position.y - position.y;
            const dxB = b.position.x - position.x;
            const dyB = b.position.y - position.y;
            return (dxA * dxA + dyA * dyA) - (dxB * dxB + dyB * dyB);
        });

        return living.slice(0, count);
    }

    /**
     * Fire weapon at multiple targets with smart distribution
     * @param {Object} player - Player entity
     * @param {Vector2D} position - Fire origin
     * @param {Array} targets - Array of target enemies
     * @param {Object} weapon - Weapon config
     * @param {Object} stats - Effective weapon stats
     * @param {number} currentCount - Current projectile count
     * @returns {Array} New projectiles
     */
    fireMultiTargetWeapon(player, position, targets, weapon, stats, currentCount) {
        const projectiles = [];
        if (currentCount >= this.maxProjectiles) return projectiles;
        if (targets.length === 0) return projectiles;

        const count = Math.floor(stats.amount);

        const weaponConfig = {
            id: weapon.id,
            damage: stats.damage,
            projectileSpeed: stats.speed,
            piercing: stats.pierce,
            range: stats.area,
            size: stats.size,
            customChar: stats.projectileChar,
            customColor: stats.projectileColor,
            isHoming: weapon.type === 'projectile_homing',
            homingStrength: stats.homingStrength,
            lockOnRadius: stats.area
        };

        // Determine spread angle
        let spreadAngle = 0;
        if (weapon.type === 'projectile_spread' || weapon.type === 'projectile_homing') {
            spreadAngle = (stats.spreadAngle || 0) * (Math.PI / 180);
        } else if (count > 1) {
            // Auto-spread for standard projectiles: 15 degrees per extra projectile
            spreadAngle = Math.min((count - 1) * 15, 60) * (Math.PI / 180);
        }

        for (let i = 0; i < count; i++) {
            // Distribute projectiles among available targets
            const targetIndex = i % targets.length;
            const target = targets[targetIndex];

            // Fire at enemy's CURRENT position (no prediction - more tactical gameplay)
            let direction = target.position.subtract(position).normalize();

            // Apply spread if multiple projectiles aim at same target
            if (count > 1 && spreadAngle > 0 && targets.length < count) {
                // Calculate how many projectiles are targeting this enemy
                const projectilesPerTarget = Math.ceil(count / targets.length);
                const indexInGroup = Math.floor(i / targets.length);

                if (projectilesPerTarget > 1) {
                    // Spread within group
                    const groupSpread = spreadAngle / (projectilesPerTarget - 1 || 1);
                    const startAngle = -spreadAngle / 2;
                    const angleOffset = startAngle + (groupSpread * indexInGroup);

                    const cos = Math.cos(angleOffset);
                    const sin = Math.sin(angleOffset);
                    direction = new Vector2D(
                        direction.x * cos - direction.y * sin,
                        direction.x * sin + direction.y * cos
                    );
                }
            } else if (count > 1 && spreadAngle > 0) {
                // Even spread across all projectiles
                const angleStep = spreadAngle / (count - 1);
                const startAngle = -spreadAngle / 2;
                const angleOffset = startAngle + (angleStep * i);

                const cos = Math.cos(angleOffset);
                const sin = Math.sin(angleOffset);
                direction = new Vector2D(
                    direction.x * cos - direction.y * sin,
                    direction.x * sin + direction.y * cos
                );
            }

            const projectile = new Projectile(position.x, position.y, direction, weaponConfig);
            projectiles.push(projectile);

            if (currentCount + projectiles.length >= this.maxProjectiles) break;
        }

        return projectiles;
    }

    /**
     * Fire directional weapon with spread (no target)
     */
    fireDirectionalSpread(player, position, baseDirection, weapon, stats, currentCount) {
        const projectiles = [];
        if (currentCount >= this.maxProjectiles) return projectiles;

        const count = Math.floor(stats.amount);

        const weaponConfig = {
            id: weapon.id,
            damage: stats.damage,
            projectileSpeed: stats.speed,
            piercing: stats.pierce,
            range: stats.area,
            size: stats.size,
            customChar: stats.projectileChar,
            customColor: stats.projectileColor,
            isHoming: false,
            homingStrength: 0,
            lockOnRadius: stats.area
        };

        // Auto-spread for directional projectiles
        const spreadAngle = Math.min((count - 1) * 10, 45) * (Math.PI / 180);

        for (let i = 0; i < count; i++) {
            let direction = baseDirection;

            if (count > 1 && spreadAngle > 0) {
                const angleStep = spreadAngle / (count - 1);
                const startAngle = -spreadAngle / 2;
                const angleOffset = startAngle + (angleStep * i);

                const cos = Math.cos(angleOffset);
                const sin = Math.sin(angleOffset);
                direction = new Vector2D(
                    baseDirection.x * cos - baseDirection.y * sin,
                    baseDirection.x * sin + baseDirection.y * cos
                );
            }

            const projectile = new Projectile(position.x, position.y, direction, weaponConfig);
            projectiles.push(projectile);

            if (currentCount + projectiles.length >= this.maxProjectiles) break;
        }

        return projectiles;
    }

    getOrbitDrones() { return this.orbitDrones; }
    getActiveMines() { return this.activeMines; }
}
