/**
 * Collision System - Handles collision detection and resolution
 * Uses spatial hashing for optimized collision detection
 * @module systems/CollisionSystem
 */

import { GAME_CONFIG } from '../config/GameConfig.js';
import { SpatialHash } from '../utils/SpatialHash.js';

/**
 * Handles collision detection between game entities
 * Uses spatial hashing to reduce O(n²) checks to O(n)
 */
export class CollisionSystem {
    /**
     * Creates a new CollisionSystem
     */
    constructor() {
        /** @type {number} Minimum push distance to separate overlapping enemies */
        this.enemySeparationStrength = 0.5;

        /** @type {SpatialHash} Spatial hash for enemies */
        this.enemyGrid = new SpatialHash(100);

        /** @type {number} Collision check counter for debugging */
        this.collisionChecksThisFrame = 0;
    }

    /**
     * Checks for circle-to-circle collision
     * @param {Object} a - First entity with position and radius
     * @param {Object} b - Second entity with position and radius
     * @returns {boolean} True if entities are colliding
     */
    checkCircleCollision(a, b) {
        this.collisionChecksThisFrame++;
        const dx = b.position.x - a.position.x;
        const dy = b.position.y - a.position.y;
        const distanceSquared = dx * dx + dy * dy;
        const radiusSum = a.radius + b.radius;
        return distanceSquared < radiusSum * radiusSum;
    }

    /**
     * Gets the overlap distance between two circles
     * @param {Object} a - First entity
     * @param {Object} b - Second entity
     * @returns {number} Overlap distance (negative if not overlapping)
     */
    getOverlapDistance(a, b) {
        const dx = b.position.x - a.position.x;
        const dy = b.position.y - a.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const radiusSum = a.radius + b.radius;
        return radiusSum - distance;
    }

    /**
     * Checks player-enemy collisions and applies damage
     * Uses spatial hash for nearby enemies
     * @param {Object} player - The player entity
     * @param {Array} enemies - Array of enemy entities (not used, uses grid)
     * @returns {Object} Collision results
     */
    checkPlayerEnemyCollisions(player, enemies) {
        const results = {
            damaged: false,
            totalDamage: 0,
            collidingEnemies: []
        };

        // Skip if god mode enabled or player is invulnerable
        if (GAME_CONFIG.DEBUG.GOD_MODE || player.invulnerable) {
            return results;
        }

        // Get nearby enemies from spatial hash
        const nearbyEnemies = this.enemyGrid.getNearby(player);

        for (const enemy of nearbyEnemies) {
            if (!enemy.alive) {
                continue;
            }

            if (this.checkCircleCollision(player, enemy)) {
                results.damaged = true;
                results.totalDamage += enemy.damage;
                results.collidingEnemies.push(enemy);
            }
        }

        // Apply damage to player if collision occurred
        if (results.damaged) {
            player.takeDamage(results.totalDamage);
        }

        return results;
    }

    /**
     * Separates overlapping enemies to prevent stacking
     * Uses spatial hash for nearby checks only
     * @param {Array} enemies - Array of enemy entities
     */
    separateEnemies(enemies) {
        // Use the already-built spatial hash
        for (const enemy of enemies) {
            if (!enemy.alive) continue;

            const nearby = this.enemyGrid.getNearby(enemy);

            for (const other of nearby) {
                if (other === enemy || !other.alive) continue;

                const overlap = this.getOverlapDistance(enemy, other);

                if (overlap > 0) {
                    // Calculate separation direction
                    const dx = other.position.x - enemy.position.x;
                    const dy = other.position.y - enemy.position.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance > 0) {
                        // Normalize direction
                        const nx = dx / distance;
                        const ny = dy / distance;

                        // Push apart by half the overlap each
                        const pushAmount = overlap * this.enemySeparationStrength * 0.5;

                        enemy.position.x -= nx * pushAmount;
                        enemy.position.y -= ny * pushAmount;
                        other.position.x += nx * pushAmount;
                        other.position.y += ny * pushAmount;
                    } else {
                        // If exactly overlapping, push in random direction
                        const angle = Math.random() * Math.PI * 2;
                        const pushAmount = overlap * this.enemySeparationStrength;

                        enemy.position.x -= Math.cos(angle) * pushAmount;
                        enemy.position.y -= Math.sin(angle) * pushAmount;
                    }
                }
            }
        }
    }

    /**
     * Checks projectile-enemy collisions using spatial hash
     * @param {Array} projectiles - Array of projectile entities
     * @param {Array} enemies - Array of enemy entities (not used, uses grid)
     * @returns {Array} Array of collision results
     */
    checkProjectileEnemyCollisions(projectiles, enemies) {
        const results = [];

        for (const projectile of projectiles) {
            if (!projectile.alive) {
                continue;
            }

            // Only check nearby enemies using spatial hash
            const nearbyEnemies = this.enemyGrid.getNearby(projectile);

            for (const enemy of nearbyEnemies) {
                if (!enemy.alive) {
                    continue;
                }

                // Check if already hit this enemy
                if (projectile.hitEnemies.has(enemy.id)) {
                    continue;
                }

                if (this.checkCircleCollision(projectile, enemy)) {
                    results.push({
                        projectile,
                        enemy,
                        damage: projectile.damage
                    });

                    // Apply damage to enemy
                    enemy.takeDamage(projectile.damage);

                    // Track this enemy as hit
                    projectile.hitEnemies.add(enemy.id);

                    // Track hit count
                    projectile.hitCount = (projectile.hitCount || 0) + 1;

                    // Deactivate projectile if it exceeded pierce count
                    if (projectile.hitCount > (projectile.piercing || 0)) {
                        projectile.alive = false;
                        break; // Stop checking other enemies if projectile is dead
                    }

                    // Continue to next enemy if piercing allowed
                    // No break here unless dead
                }
            }
        }

        return results;
    }

    /**
     * Checks enemy projectiles hitting player
     * @param {Array} enemyProjectiles - Array of enemy projectile objects
     * @param {Object} player - The player entity
     * @returns {Object} Collision results
     */
    checkEnemyProjectilePlayerCollisions(enemyProjectiles, player) {
        const results = {
            playerHit: false,
            damage: 0,
            projectilesHit: []
        };

        // Skip if god mode enabled or player is invulnerable
        if (GAME_CONFIG.DEBUG.GOD_MODE || player.invulnerable) {
            return results;
        }

        for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
            const proj = enemyProjectiles[i];

            // Create temp objects for circle collision check
            const projEntity = {
                position: proj.position,
                radius: proj.radius || 5
            };

            if (this.checkCircleCollision(projEntity, player)) {
                // Hit player
                results.playerHit = true;
                results.damage += proj.damage;
                results.projectilesHit.push(proj);

                // Mark projectile for removal by setting a flag
                proj.alive = false;
            }
        }

        // Apply damage to player if hit
        if (results.playerHit) {
            player.takeDamage(results.damage);
        }

        return results;
    }

    /**
     * Full collision update (call once per frame)
     * @param {Object} gameState - Current game state
     * @returns {Object} All collision results
     */
    update(gameState) {
        const { player, enemies, projectiles = [], orbitDrones = [], enemyProjectiles = [] } = gameState;

        // Reset collision counter
        this.collisionChecksThisFrame = 0;

        const results = {
            playerHit: false,
            playerDamage: 0,
            enemiesHit: [],
            enemiesKilled: [],
            droneHits: [],
            enemyProjectileHits: [],  // Track enemy projectile hits for effects
            collisionChecks: 0
        };

        // Build spatial hash grid for enemies
        this.enemyGrid.build(enemies);

        // Player-enemy collisions
        const playerCollisions = this.checkPlayerEnemyCollisions(player, enemies);
        results.playerHit = playerCollisions.damaged;
        results.playerDamage = playerCollisions.totalDamage;

        // Projectile-enemy collisions
        if (projectiles.length > 0) {
            const projectileCollisions = this.checkProjectileEnemyCollisions(projectiles, enemies);
            for (const collision of projectileCollisions) {
                results.enemiesHit.push(collision.enemy);
                if (!collision.enemy.alive) {
                    results.enemiesKilled.push(collision.enemy);
                }
            }
        }

        // Drone-enemy collisions
        if (orbitDrones.length > 0) {
            const droneCollisions = this.checkDroneEnemyCollisions(orbitDrones, enemies);
            for (const collision of droneCollisions) {
                results.droneHits.push(collision);
                results.enemiesHit.push(collision.enemy);
                if (!collision.enemy.alive) {
                    results.enemiesKilled.push(collision.enemy);
                }
            }
        }

        // Enemy-enemy separation
        this.separateEnemies(enemies);

        // Enemy projectile-player collisions
        if (enemyProjectiles.length > 0) {
            const enemyProjResults = this.checkEnemyProjectilePlayerCollisions(enemyProjectiles, player);
            if (enemyProjResults.playerHit) {
                results.playerHit = true;
                results.playerDamage += enemyProjResults.damage;
                results.enemyProjectileHits = enemyProjResults.projectilesHit;
            }
            // Remove hit projectiles from gameState
            gameState.enemyProjectiles = enemyProjectiles.filter(p => p.alive !== false);
        }

        // Store collision count
        results.collisionChecks = this.collisionChecksThisFrame;

        return results;
    }

    /**
     * Checks drone-enemy collisions
     * @param {Array} drones - Array of orbit drone entities
     * @param {Array} enemies - Array of enemy entities (not used, uses grid)
     * @returns {Array} Array of collision results
     */
    checkDroneEnemyCollisions(drones, enemies) {
        const results = [];

        for (const drone of drones) {
            if (!drone.alive) {
                continue;
            }

            // Only check nearby enemies using spatial hash
            const nearbyEnemies = this.enemyGrid.getNearby(drone);

            for (const enemy of nearbyEnemies) {
                if (!enemy.alive) {
                    continue;
                }

                // Check if drone can hit this enemy (not on cooldown)
                if (!drone.canHitEnemy(enemy)) {
                    continue;
                }

                if (this.checkCircleCollision(drone, enemy)) {
                    results.push({
                        drone,
                        enemy,
                        damage: drone.damage
                    });

                    // Apply damage to enemy
                    enemy.takeDamage(drone.damage);

                    // Record hit on drone (starts cooldown)
                    drone.recordHit(enemy);
                }
            }
        }

        return results;
    }

    /**
     * Gets performance statistics
     * @returns {Object} Performance stats
     */
    getStats() {
        return {
            collisionChecks: this.collisionChecksThisFrame,
            gridStats: this.enemyGrid.getStats()
        };
    }
}

