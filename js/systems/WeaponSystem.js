/**
 * Weapon System - Manages weapon firing and projectile creation
 * Handles cooldowns, targeting, and auto-firing
 * @module systems/WeaponSystem
 */

import { Projectile } from '../entities/Projectile.js';
import { getWeaponStats } from '../config/WeaponConfig.js';

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
    }

    /**
     * Updates all weapons and projectiles
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {Object} player - The player entity
     * @param {Array} enemies - Array of enemy entities
     * @param {Array} projectiles - Array of active projectiles
     * @returns {Array} Array of new projectiles spawned this frame
     */
    update(deltaTime, player, enemies, projectiles) {
        const newProjectiles = [];

        // Update each weapon the player has
        for (const weapon of player.weapons) {
            // Reduce cooldown
            weapon.cooldown -= deltaTime;

            // Check if weapon can fire
            if (weapon.cooldown <= 0) {
                // Get effective stats (includes level bonuses)
                const stats = getWeaponStats(weapon);

                // Find nearest enemy
                const target = this.findNearestEnemy(player.position, enemies);

                if (target) {
                    // Calculate direction to target
                    const direction = target.position.subtract(player.position).normalize();

                    // Fire projectiles
                    const projectilesFired = this.fireWeapon(
                        player.position,
                        direction,
                        weapon,
                        stats,
                        projectiles.length + newProjectiles.length
                    );

                    newProjectiles.push(...projectilesFired);

                    // Reset cooldown
                    weapon.cooldown = 1 / stats.attackSpeed;
                }
            }
        }

        // Update all existing projectiles
        for (const projectile of projectiles) {
            projectile.update(deltaTime);
        }

        return newProjectiles;
    }

    /**
     * Fires a weapon, creating projectiles
     * @param {Object} position - Starting position
     * @param {Object} direction - Normalized direction vector
     * @param {Object} weapon - Weapon being fired
     * @param {Object} stats - Calculated weapon stats
     * @param {number} currentProjectileCount - Current number of active projectiles
     * @returns {Array} Array of created projectiles
     */
    fireWeapon(position, direction, weapon, stats, currentProjectileCount) {
        const projectiles = [];

        // Check if we can spawn more projectiles
        if (currentProjectileCount >= this.maxProjectiles) {
            return projectiles;
        }

        // Create weapon config with calculated stats for projectile creation
        const weaponConfig = {
            id: weapon.id,
            damage: stats.damage,
            projectileSpeed: stats.projectileSpeed,
            piercing: stats.piercing,
            range: stats.range
        };

        // Spread calculation for multiple projectiles
        const count = stats.projectileCount;
        const spreadAngle = Math.PI / 8; // 22.5 degrees spread

        for (let i = 0; i < count; i++) {
            // Calculate spread offset for multiple projectiles
            let finalDirection = direction;

            if (count > 1) {
                // Spread projectiles in an arc
                const angleOffset = spreadAngle * (i - (count - 1) / 2);
                const cos = Math.cos(angleOffset);
                const sin = Math.sin(angleOffset);

                finalDirection = {
                    x: direction.x * cos - direction.y * sin,
                    y: direction.x * sin + direction.y * cos,
                    multiply: (s) => ({ x: finalDirection.x * s, y: finalDirection.y * s }),
                    normalize: () => finalDirection
                };

                // Create proper Vector2D-like object
                const mag = Math.sqrt(finalDirection.x ** 2 + finalDirection.y ** 2);
                finalDirection = {
                    x: finalDirection.x / mag,
                    y: finalDirection.y / mag,
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
