/**
 * Weapon System - Manages weapon firing and projectile creation
 * Handles cooldowns, targeting, auto-firing, aura weapons, and deployables
 * @module systems/WeaponSystem
 */

import { Projectile } from '../entities/Projectile.js';
import { OrbitDrone } from '../entities/OrbitDrone.js';
import { Mine } from '../entities/Mine.js';
import { getWeaponStats, getOrbitWeaponStats, getScatterWeaponStats, getSeekerWeaponStats, getMineWeaponStats } from '../config/WeaponConfig.js';
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
            // Handle orbit-type weapons separately
            if (weapon.type === 'orbit') {
                this.updateOrbitWeapon(deltaTime, player, weapon);
                continue;
            }

            // Handle deployable-type weapons (mines)
            if (weapon.type === 'deployable') {
                // Apply cooldown multiplier from passives
                const cdMultiplier = 1 + (player.passiveStats?.cooldownMultiplier || 0);
                weapon.cooldown -= deltaTime;
                if (weapon.cooldown <= 0) {
                    const mineStats = getMineWeaponStats(weapon);
                    // Apply damage multiplier to mine damage
                    mineStats.damage = mineStats.damage * (player.passiveStats?.damageMultiplier || 1);
                    this.deployMine(player.position, mineStats);
                    weapon.cooldown = (1 / mineStats.attackSpeed) * cdMultiplier;
                }
                continue;
            }

            // Reduce cooldown
            weapon.cooldown -= deltaTime;


            // Check if weapon can fire
            if (weapon.cooldown <= 0) {
                // Get effective stats (includes level bonuses)
                const stats = getWeaponStats(weapon);

                // Handle different weapon types
                if (weapon.id === 'garlic') {
                    // Garlic is an aura weapon - damage enemies in range
                    // Apply area multiplier for garlic range
                    const areaMultiplier = player.passiveStats?.areaMultiplier || 1;
                    const enhancedStats = { ...stats, range: stats.range * areaMultiplier };
                    const hits = this.processAuraWeapon(player, enemies, weapon, enhancedStats);
                    auraHits.push(...hits);

                    // Reset cooldown with cooldown multiplier
                    const cdMultiplier = 1 + (player.passiveStats?.cooldownMultiplier || 0);
                    weapon.cooldown = (1 / stats.attackSpeed) * cdMultiplier;
                } else if (weapon.id === 'knife') {
                    // Knife: movement direction when moving, nearest enemy when still
                    let direction = null;

                    // Check if player is moving (velocity has magnitude)
                    const velMag = player.velocity ?
                        Math.sqrt(player.velocity.x ** 2 + player.velocity.y ** 2) : 0;

                    if (velMag > 0.1) {
                        // Player is MOVING - fire in movement direction
                        direction = new Vector2D(
                            player.velocity.x / velMag,
                            player.velocity.y / velMag
                        );
                    } else {
                        // Player is STILL - auto-target nearest enemy (like Magic Wand)
                        const target = this.findNearestEnemy(player.position, enemies);
                        if (target) {
                            direction = target.position.subtract(player.position).normalize();
                        }
                    }

                    // Only fire if we have a valid direction
                    if (direction && (direction.x !== 0 || direction.y !== 0)) {
                        const projectilesFired = this.fireWeapon(
                            player,
                            player.position,
                            direction,
                            weapon,
                            stats,
                            projectiles.length + newProjectiles.length
                        );

                        newProjectiles.push(...projectilesFired);
                        // Apply cooldown multiplier
                        const cdMultiplier = 1 + (player.passiveStats?.cooldownMultiplier || 0);
                        weapon.cooldown = (1 / stats.attackSpeed) * cdMultiplier;
                    }
                } else if (weapon.id === 'scatter') {
                    // Scatter: uses special stats function for upgrade progression
                    const scatterStats = getScatterWeaponStats(weapon);
                    const target = this.findNearestEnemy(player.position, enemies);

                    if (target) {
                        const direction = target.position.subtract(player.position).normalize();

                        const projectilesFired = this.fireWeapon(
                            player,
                            player.position,
                            direction,
                            weapon,
                            scatterStats,
                            projectiles.length + newProjectiles.length
                        );

                        newProjectiles.push(...projectilesFired);

                        // Reset cooldown with multiplier
                        const cdMultiplier = 1 + (player.passiveStats?.cooldownMultiplier || 0);
                        weapon.cooldown = (1 / scatterStats.attackSpeed) * cdMultiplier;
                    }
                } else if (weapon.id === 'seeker') {
                    // Seeker: homing missiles with spread pattern
                    const seekerStats = getSeekerWeaponStats(weapon);
                    const target = this.findNearestEnemy(player.position, enemies);

                    if (target) {
                        const direction = target.position.subtract(player.position).normalize();

                        const projectilesFired = this.fireWeapon(
                            player,
                            player.position,
                            direction,
                            weapon,
                            seekerStats,
                            projectiles.length + newProjectiles.length
                        );

                        newProjectiles.push(...projectilesFired);

                        // Reset cooldown with multiplier
                        const cdMultiplier = 1 + (player.passiveStats?.cooldownMultiplier || 0);
                        weapon.cooldown = (1 / seekerStats.attackSpeed) * cdMultiplier;
                    }
                } else {

                    // Standard projectile weapon (Magic Wand) - target nearest enemy
                    const target = this.findNearestEnemy(player.position, enemies);

                    if (target) {
                        const direction = target.position.subtract(player.position).normalize();

                        const projectilesFired = this.fireWeapon(
                            player,
                            player.position,
                            direction,
                            weapon,
                            stats,
                            projectiles.length + newProjectiles.length
                        );

                        newProjectiles.push(...projectilesFired);

                        // Reset cooldown with multiplier
                        const cdMultiplier = 1 + (player.passiveStats?.cooldownMultiplier || 0);
                        weapon.cooldown = (1 / stats.attackSpeed) * cdMultiplier;
                    }
                }

            }
        }

        // Update all existing projectiles (pass enemies for homing missiles)
        for (const projectile of projectiles) {
            projectile.update(deltaTime, enemies);
        }


        // Update orbit drones positions
        for (const drone of this.orbitDrones) {
            if (drone.alive) {
                drone.update(deltaTime, player.position);
            }
        }
        // Remove dead drones
        this.orbitDrones = this.orbitDrones.filter(d => d.alive);

        // Update all active mines and collect explosions
        const mineExplosions = [];
        for (const mine of this.activeMines) {
            const explosionData = mine.update(deltaTime, enemies);
            if (explosionData) {
                mineExplosions.push(explosionData);
            }
        }
        // Remove dead/exploded mines
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
     * Deploys a mine at the given position
     * @param {Object} position - Position to deploy mine
     * @param {Object} stats - Calculated weapon stats
     * @returns {Mine} The deployed mine
     */
    deployMine(position, stats) {
        // Create mine config from stats
        const mineConfig = {
            damage: stats.damage,
            explosionRadius: stats.explosionRadius,
            armDelay: stats.armDelay,
            mineLifetime: stats.mineLifetime,
            mineChar: stats.mineChar,
            mineColorArmed: stats.mineColorArmed,
            mineColorUnarmed: stats.mineColorUnarmed
        };

        // Remove oldest mine if at capacity (FIFO)
        if (this.activeMines.length >= stats.maxActiveMines) {
            this.activeMines.shift(); // Remove oldest
        }

        // Create and add new mine
        const mine = new Mine(position.x, position.y, mineConfig);
        this.activeMines.push(mine);

        return mine;
    }

    /**
     * Gets the active mines for rendering
     * @returns {Array<Mine>} Array of active mines
     */
    getActiveMines() {
        return this.activeMines;
    }


    /**
     * Updates an orbit-type weapon (manages drone lifecycle)
     * @param {number} deltaTime - Time since last frame
     * @param {Object} player - Player entity
     * @param {Object} weapon - Orbit weapon instance
     */
    updateOrbitWeapon(deltaTime, player, weapon) {
        const stats = getOrbitWeaponStats(weapon);

        // Check if we need to create or destroy drones
        const currentDroneCount = this.orbitDrones.length;
        const targetDroneCount = stats.maxDrones;
        const weaponLevel = weapon.level;

        // Destroy drones if drone weapon was removed
        if (!player.weapons.some(w => w.id === 'drone')) {
            for (const drone of this.orbitDrones) {
                drone.destroy();
            }
            this.orbitDrones = [];
            this.lastDroneCount = 0;
            this.lastDroneLevel = 0;
            return;
        }

        // Create/destroy drones if count changed or level increased
        if (currentDroneCount !== targetDroneCount || weaponLevel !== this.lastDroneLevel) {
            // Clear existing drones
            for (const drone of this.orbitDrones) {
                drone.destroy();
            }
            this.orbitDrones = [];

            // Create new drones with proper spacing
            for (let i = 0; i < targetDroneCount; i++) {
                const drone = new OrbitDrone(i, targetDroneCount, stats);
                // Initialize position immediately
                drone.update(0, player.position);
                this.orbitDrones.push(drone);
            }

            this.lastDroneCount = targetDroneCount;
            this.lastDroneLevel = weaponLevel;
        }
    }

    /**
     * Gets the active orbit drones
     * @returns {Array<OrbitDrone>} Array of active drones
     */
    getOrbitDrones() {
        return this.orbitDrones;
    }

    /**
     * Processes an aura weapon like Garlic
     * @param {Object} player - Player entity
     * @param {Array} enemies - Enemy array
     * @param {Object} weapon - Weapon instance
     * @param {Object} stats - Calculated weapon stats
     * @returns {Array} Enemies hit by the aura
     */
    processAuraWeapon(player, enemies, weapon, stats) {
        const hits = [];
        const rangeSq = stats.range * stats.range;

        for (const enemy of enemies) {
            if (!enemy.alive) continue;

            // Check if enemy is within aura range
            const dx = enemy.position.x - player.position.x;
            const dy = enemy.position.y - player.position.y;
            const distSq = dx * dx + dy * dy;

            if (distSq <= rangeSq) {
                // Apply damage with player's passive damage multiplier
                const finalDamage = stats.damage * (player.passiveStats?.damageMultiplier || 1);
                const killed = enemy.takeDamage(finalDamage);

                hits.push({
                    enemy,
                    damage: finalDamage,
                    killed,
                    weaponId: weapon.id
                });
            }
        }

        return hits;
    }

    /**
     * Gets the garlic aura info for rendering
     * @param {Object} player - Player entity
     * @returns {Object|null} Aura info or null if no garlic
     */
    getGarlicAura(player) {
        const garlicWeapon = player.weapons.find(w => w.id === 'garlic');
        if (!garlicWeapon) return null;

        const stats = getWeaponStats(garlicWeapon);

        // Apply area multiplier from passives
        const areaMultiplier = player.passiveStats?.areaMultiplier || 1;
        const effectiveRange = stats.range * areaMultiplier;

        // Calculate pulse effect based on cooldown
        const cooldownRatio = garlicWeapon.cooldown / (1 / stats.attackSpeed);
        const pulseScale = 1 + (1 - cooldownRatio) * 0.1; // 10% pulse on damage tick

        return {
            x: player.position.x,
            y: player.position.y,
            radius: effectiveRange * pulseScale,
            baseRadius: effectiveRange,
            level: garlicWeapon.level,
            damage: stats.damage * (player.passiveStats?.damageMultiplier || 1)
        };
    }

    /**
     * Fires a weapon, creating projectiles
     * @param {Object} player - Player entity (for passive stats)
     * @param {Object} position - Starting position
     * @param {Object} direction - Normalized direction vector
     * @param {Object} weapon - Weapon being fired
     * @param {Object} stats - Calculated weapon stats
     * @param {number} currentProjectileCount - Current number of active projectiles
     * @returns {Array} Array of created projectiles
     */
    fireWeapon(player, position, direction, weapon, stats, currentProjectileCount) {
        const projectiles = [];

        // Check if we can spawn more projectiles
        if (currentProjectileCount >= this.maxProjectiles) {
            return projectiles;
        }

        // Create weapon config with calculated stats for projectile creation
        // Apply player's passive damage multiplier
        const damageMultiplier = player?.passiveStats?.damageMultiplier || 1;
        const weaponConfig = {
            id: weapon.id,
            damage: stats.damage * damageMultiplier,
            projectileSpeed: stats.projectileSpeed,
            piercing: stats.piercing !== undefined ? stats.piercing : (stats.pierce !== undefined ? stats.pierce : 0),
            range: stats.range,
            // Custom projectile appearance (for scatter/seeker weapons)
            customChar: stats.projectileChar || null,
            customColor: stats.projectileColor || null,
            // Homing properties (for seeker weapons)
            isHoming: stats.isHoming || false,
            homingStrength: stats.homingStrength || 0,
            lockOnRadius: stats.lockOnRadius || 0
        };


        // Spread calculation for multiple projectiles
        const count = stats.projectileCount;

        // Use weapon-specific spread angle if defined, otherwise use default
        const spreadAngleDegrees = stats.spreadAngle !== undefined ? stats.spreadAngle : 22.5;
        const spreadAngle = spreadAngleDegrees * (Math.PI / 180);

        for (let i = 0; i < count; i++) {
            // Calculate spread offset for multiple projectiles
            let finalDirection = direction;

            if (count > 1) {
                // Calculate angle step to spread projectiles evenly across the cone
                const angleStep = spreadAngle / (count - 1);
                const startAngle = -spreadAngle / 2;
                const angleOffset = startAngle + (angleStep * i);

                const cos = Math.cos(angleOffset);
                const sin = Math.sin(angleOffset);

                // Rotate direction vector by angle offset
                const newX = direction.x * cos - direction.y * sin;
                const newY = direction.x * sin + direction.y * cos;
                const mag = Math.sqrt(newX * newX + newY * newY);

                finalDirection = {
                    x: newX / mag,
                    y: newY / mag,
                    multiply: function (s) {
                        return { x: this.x * s, y: this.y * s, magnitude: () => s };
                    }
                };
            }

            // Create projectile
            const projectile = new Projectile(
                position.x,
                position.y,
                finalDirection,
                weaponConfig
            );

            projectiles.push(projectile);

            // Stop if we hit max projectiles
            if (currentProjectileCount + projectiles.length >= this.maxProjectiles) {
                break;
            }
        }

        return projectiles;
    }


    /**
     * Finds the nearest enemy to a position
     * @param {Object} position - Position to search from
     * @param {Array} enemies - Array of enemies
     * @returns {Object|null} Nearest enemy or null if none
     */
    findNearestEnemy(position, enemies) {
        let nearest = null;
        let nearestDistSq = Infinity;

        for (const enemy of enemies) {
            if (!enemy.alive) {
                continue;
            }

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
     * Cleans up dead projectiles from array
     * @param {Array} projectiles - Array of projectiles
     * @returns {Array} Filtered array with only alive projectiles
     */
    cleanupProjectiles(projectiles) {
        return projectiles.filter(p => p.alive);
    }
}
