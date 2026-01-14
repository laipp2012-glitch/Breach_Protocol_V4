/**
 * Enemy Entity - Enemy characters that chase the player
 * Contains position, movement, and health logic
 * NOTE: This class has NO render() method - all rendering goes through RenderSystem
 * @module entities/Enemy
 */

import { Vector2D } from '../utils/Vector2D.js';

/**
 * Enemy entity class
 * Manages enemy state, movement toward player, and health
 */
export class Enemy {
    /**
     * Creates a new Enemy at the specified position
     * @param {number} x - Initial X position
     * @param {number} y - Initial Y position
     * @param {Object} config - Enemy type configuration
     */
    constructor(x, y, config) {
        /** @type {string} Entity type identifier */
        this.type = 'enemy';

        /** @type {string} Enemy type (basic, tank, fast) */
        this.enemyType = config.id;

        /** @type {Vector2D} Current position */
        this.position = new Vector2D(x, y);

        /** @type {Vector2D} Current velocity */
        this.velocity = new Vector2D(0, 0);

        /** @type {number} Movement speed in pixels per second */
        this.speed = config.speed;

        /** @type {number} Collision radius */
        this.radius = config.radius;

        /** @type {number} Current health */
        this.health = config.health;

        /** @type {number} Maximum health */
        this.maxHealth = config.health;

        /** @type {number} Damage dealt to player on collision */
        this.damage = config.damage;

        /** @type {number} XP dropped on death */
        this.xpValue = config.xpValue;

        /** @type {boolean} Whether enemy is alive */
        this.alive = true;

        /** @type {boolean} Whether enemy is in death animation */
        this.dying = false;

        /** @type {number} Death animation timer */
        this.deathTimer = 0;

        /** @type {number} Duration of death animation */
        this.deathDuration = 0.1;  // 0.4s death animation

        /** @type {boolean} Whether enemy was recently damaged (for flash effect) */
        this.damaged = false;

        /** @type {number} Damage flash timer */
        this.damageFlashTimer = 0;

        // Effect properties (for juice system)
        /** @type {number} Scale multiplier for effects */
        this.scale = 1;
        /** @type {number} Flash overlay opacity */
        this.flashAlpha = 0;
        /** @type {string|null} Flash overlay color */
        this.flashColor = null;
        /** @type {number} Shake X offset */
        this.shakeOffsetX = 0;
        /** @type {number} Shake Y offset */
        this.shakeOffsetY = 0;
        /** @type {number} Knockback X velocity */
        this.knockbackVelocityX = 0;
        /** @type {number} Knockback Y velocity */
        this.knockbackVelocityY = 0;

        // Ranger-specific properties (for ranged enemies)
        /** @type {number} Preferred distance to maintain from player */
        this.preferredDistance = config.preferredDistance || 0;
        /** @type {number} Distance at which to retreat from player */
        this.retreatDistance = config.retreatDistance || 0;
        /** @type {number} Maximum range at which to detect and shoot player */
        this.detectionRange = config.detectionRange || 0;
        /** @type {number} Projectile speed */
        this.projectileSpeed = config.projectileSpeed || 0;
        /** @type {number} Projectile damage */
        this.projectileDamage = config.projectileDamage || 0;
        /** @type {string} Projectile character */
        this.projectileChar = config.projectileChar || '*';
        /** @type {string} Projectile color */
        this.projectileColor = config.projectileColor || '#FF6600';
        /** @type {number} Projectile lifetime in seconds */
        this.projectileLifetime = config.projectileLifetime || 2;
        /** @type {number} Fire rate (shots per second) */
        this.fireRate = config.fireRate || 0;
        /** @type {number} Last time enemy fired a projectile */
        this.lastFireTime = 0;

        // Swarm-specific properties (for spawner enemies)
        /** @type {boolean} Whether to spawn minions on death */
        this.spawnOnDeath = config.spawnOnDeath || false;
        /** @type {number} Number of minions to spawn */
        this.spawnCount = config.spawnCount || 0;
        /** @type {string} Type of enemy to spawn */
        this.spawnType = config.spawnType || null;
        /** @type {number|null} Time when spawn burst started (for mini enemies) */
        this.spawnBurstTime = null;

        // Add slight speed variation for visual interest
        this.speed *= 0.9 + Math.random() * 0.2; // ±10% speed variation
    }

    /**
     * Updates the enemy each frame
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {Vector2D} playerPosition - Current player position
     * @param {Object} gameState - Game state for projectile spawning (optional, required for rangers)
     */
    update(deltaTime, playerPosition, gameState = null) {
        if (!this.alive) {
            return;
        }

        // Calculate direction to player
        const direction = playerPosition.subtract(this.position);
        const distance = direction.magnitude();

        // Handle spawn burst for newly spawned mini enemies
        if (this.spawnBurstTime !== null) {
            const currentTime = performance.now() / 1000;
            const burstDuration = 0.3;  // 0.3s burst before normal AI
            const elapsed = currentTime - this.spawnBurstTime;

            if (elapsed < burstDuration) {
                // Keep burst velocity, decay slightly
                this.velocity = new Vector2D(
                    this.velocity.x * 0.98,
                    this.velocity.y * 0.98
                );
                // Grow scale from 0.8 to 1.0
                this.scale = 0.8 + (elapsed / burstDuration) * 0.2;
            } else {
                // Switch to normal AI
                this.spawnBurstTime = null;
                this.scale = 1;
            }
        }

        // Ranger AI: kiting behavior
        if (this.enemyType === 'ranger') {
            // BEHAVIOR 1: Retreat if too close
            if (distance < this.retreatDistance) {
                // Move AWAY from player
                const dx = this.position.x - playerPosition.x;
                const dy = this.position.y - playerPosition.y;
                const length = Math.sqrt(dx * dx + dy * dy);

                if (length > 0) {
                    this.velocity = new Vector2D(
                        (dx / length) * this.speed,
                        (dy / length) * this.speed
                    );
                }
            }
            // BEHAVIOR 2: Approach if too far
            else if (distance > this.preferredDistance + 20) {
                // Move toward player (normal chase)
                if (distance > 1) {
                    const normalizedDir = direction.normalize();
                    this.velocity = normalizedDir.multiply(this.speed);
                }
            }
            // BEHAVIOR 3: Hold position (within good range)
            else {
                this.velocity = new Vector2D(
                    this.velocity.x * 0.9,
                    this.velocity.y * 0.9
                );
            }

            // BEHAVIOR 4: Shoot at player if within detection range
            if (distance < this.detectionRange && gameState) {
                const currentTime = performance.now() / 1000;
                if (currentTime - this.lastFireTime >= (1 / this.fireRate)) {
                    this.fireProjectile(playerPosition, gameState);
                    this.lastFireTime = currentTime;
                }
            }
        } else {
            // Standard enemy AI: chase player
            if (distance > 1) {
                const normalizedDir = direction.normalize();
                this.velocity = normalizedDir.multiply(this.speed);
            } else {
                this.velocity = new Vector2D(0, 0);
            }
        }

        // Apply velocity to position
        this.position = this.position.add(this.velocity.multiply(deltaTime));

        // Apply knockback velocity (from effects)
        if (this.knockbackVelocityX !== 0 || this.knockbackVelocityY !== 0) {
            this.position.x += this.knockbackVelocityX * deltaTime;
            this.position.y += this.knockbackVelocityY * deltaTime;
        }

        // Update damage flash timer
        if (this.damaged) {
            this.damageFlashTimer -= deltaTime;
            if (this.damageFlashTimer <= 0) {
                this.damaged = false;
                this.damageFlashTimer = 0;
            }
        }
    }

    /**
     * Fires a projectile toward the player (for ranger enemies)
     * @param {Vector2D} playerPosition - Target position
     * @param {Object} gameState - Game state to add projectile to
     */
    fireProjectile(playerPosition, gameState) {
        // Calculate direction to player
        const dx = playerPosition.x - this.position.x;
        const dy = playerPosition.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) return;

        // Create projectile
        const projectile = {
            position: { x: this.position.x, y: this.position.y },
            velocity: {
                x: (dx / distance) * this.projectileSpeed,
                y: (dy / distance) * this.projectileSpeed
            },
            damage: this.projectileDamage,
            char: this.projectileChar,
            color: this.projectileColor,
            lifetime: 0,
            maxLifetime: this.projectileLifetime,
            radius: 5,
            isEnemyProjectile: true  // Flag to distinguish from player projectiles
        };

        // Ensure enemyProjectiles array exists
        if (!gameState.enemyProjectiles) {
            gameState.enemyProjectiles = [];
        }
        gameState.enemyProjectiles.push(projectile);
    }

    /**
     * Spawns minion enemies in a circle pattern (for swarm enemies)
     * @param {Object} gameState - Game state to add minions to
     * @param {Object} ENEMY_TYPES - Enemy type definitions
     * @returns {Array} Array of spawned enemy objects (to be added to game)
     */
    spawnMinions(gameState, ENEMY_TYPES) {
        if (!this.spawnOnDeath || !this.spawnType || this.spawnCount <= 0) {
            return [];
        }

        // Get spawn config
        const spawnKey = this.spawnType.toUpperCase();
        const spawnConfig = ENEMY_TYPES[spawnKey];
        if (!spawnConfig) {
            console.warn(`Unknown spawn type: ${this.spawnType}`);
            return [];
        }

        const spawnedEnemies = [];
        const angleStep = (Math.PI * 2) / this.spawnCount;
        const spawnRadius = 40;  // Spawn 40px away from death point
        const burstSpeed = 100;  // Initial outward velocity

        for (let i = 0; i < this.spawnCount; i++) {
            const angle = angleStep * i;
            const spawnX = this.position.x + Math.cos(angle) * spawnRadius;
            const spawnY = this.position.y + Math.sin(angle) * spawnRadius;

            // Create new mini enemy
            const miniEnemy = new Enemy(spawnX, spawnY, spawnConfig);

            // Add initial burst velocity (outward from death point)
            miniEnemy.velocity = new Vector2D(
                Math.cos(angle) * burstSpeed,
                Math.sin(angle) * burstSpeed
            );

            // Mark spawn time for burst behavior
            miniEnemy.spawnBurstTime = performance.now() / 1000;

            // Slightly smaller scale that grows
            miniEnemy.scale = 0.8;

            spawnedEnemies.push(miniEnemy);
        }

        return spawnedEnemies;
    }

    /**
     * Applies damage to the enemy
     * @param {number} amount - Amount of damage to apply
     * @returns {boolean} True if enemy died from this damage
     */
    takeDamage(amount) {
        if (!this.alive || this.dying) {
            return false;
        }

        this.health -= amount;
        this.damaged = true;
        this.damageFlashTimer = 0.1; // 100ms flash
        this.lastDamageTaken = amount; // Track for damage numbers

        if (this.health <= 0) {
            this.health = 0;
            // Don't set alive=false yet, start death animation
            return true;
        }

        return false;
    }

    /**
     * Starts the death animation sequence
     * Enemy stays visible during this time for visual feedback
     */
    startDeathAnimation() {
        if (this.dying) return;  // Already dying

        this.dying = true;
        this.deathTimer = this.deathDuration;
    }

    /**
     * Updates death animation timer
     * @param {number} deltaTime - Time since last frame
     * @returns {boolean} True if death animation is complete
     */
    updateDeathAnimation(deltaTime) {
        if (!this.dying) return false;

        this.deathTimer -= deltaTime;

        // Fade out during death
        const progress = 1 - (this.deathTimer / this.deathDuration);
        this.scale = 1 + progress * 0.5;  // Grow slightly
        this.flashAlpha = 1 - progress;    // Fade flash
        this.flashColor = '#FFFFFF';

        if (this.deathTimer <= 0) {
            this.alive = false;  // Now fully dead
            return true;
        }
        return false;
    }

    /**
     * Gets the health percentage
     * @returns {number} Health as percentage (0-1)
     */
    getHealthPercent() {
        return this.health / this.maxHealth;
    }

    /**
     * Pushes enemy away from a point (for separation)
     * @param {Vector2D} point - Point to push away from
     * @param {number} strength - Push strength
     */
    pushFrom(point, strength) {
        const direction = this.position.subtract(point);
        const distance = direction.magnitude();

        if (distance > 0 && distance < this.radius * 2) {
            const pushDir = direction.normalize();
            const pushAmount = (this.radius * 2 - distance) * strength;
            this.position = this.position.add(pushDir.multiply(pushAmount));
        }
    }
}
