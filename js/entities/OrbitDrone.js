/**
 * Orbit Drone Entity - Defensive drones that orbit the player
 * Contains position, rotation, and damage logic
 * NOTE: This class has NO render() method - all rendering goes through RenderSystem
 * @module entities/OrbitDrone
 */

import { Vector2D } from '../utils/Vector2D.js';

/**
 * OrbitDrone entity class
 * Manages drone state, orbital movement around player, and collision
 */
export class OrbitDrone {
    /**
     * Creates a new OrbitDrone
     * @param {number} droneIndex - Index of this drone (for angle offset)
     * @param {number} totalDrones - Total number of drones (for spacing calculation)
     * @param {Object} config - Drone configuration from weapon
     */
    constructor(droneIndex, totalDrones, config) {
        /** @type {string} Entity type identifier */
        this.type = 'orbitDrone';

        /** @type {number} Index of this drone in the formation */
        this.droneIndex = droneIndex;

        /** @type {Vector2D} Current position (calculated from player + orbit) */
        this.position = new Vector2D(0, 0);

        /** @type {number} Current orbit angle in radians */
        this.angle = (Math.PI * 2 / totalDrones) * droneIndex;

        /** @type {number} Distance from player center */
        this.orbitRadius = config.orbitRadius;

        /** @type {number} Rotation speed in radians per second */
        this.orbitSpeed = (config.orbitSpeed * Math.PI) / 180; // Convert degrees to radians

        /** @type {number} Damage dealt on contact */
        this.damage = config.damage;

        /** @type {number} Drone Size Multiplier */
        this.size = config.size || 1.0;

        /** @type {number} Collision radius */
        this.radius = 8 * this.size;

        /** @type {string} ASCII character to render */
        this.droneChar = config.droneChar || 'o';

        /** @type {string} Color for rendering */
        this.droneColor = config.droneColor || '#00FFFF';

        /** @type {boolean} Whether drone is active */
        this.alive = true;

        /** @type {Map<number, number>} Cooldown timers per enemy (to prevent multi-hit spam) */
        this.hitCooldowns = new Map();

        /** @type {number} Cooldown duration in seconds between hits on same enemy */
        this.hitCooldownDuration = 0.5;
    }

    /**
     * Updates the drone position each frame
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {Vector2D} playerPosition - Current player position
     */
    update(deltaTime, playerPosition) {
        if (!this.alive) {
            return;
        }

        // Rotate angle
        this.angle += this.orbitSpeed * deltaTime;

        // Keep angle in 0-2PI range
        if (this.angle > Math.PI * 2) {
            this.angle -= Math.PI * 2;
        }

        // Calculate position based on player position + orbit
        this.position.x = playerPosition.x + Math.cos(this.angle) * this.orbitRadius;
        this.position.y = playerPosition.y + Math.sin(this.angle) * this.orbitRadius;

        // Update hit cooldowns
        for (const [enemyId, cooldown] of this.hitCooldowns.entries()) {
            const newCooldown = cooldown - deltaTime;
            if (newCooldown <= 0) {
                this.hitCooldowns.delete(enemyId);
            } else {
                this.hitCooldowns.set(enemyId, newCooldown);
            }
        }
    }

    /**
     * Reconfigures the drone based on new spacing/config
     * @param {number} droneIndex - New index
     * @param {number} totalDrones - New total count
     * @param {Object} config - Updated config
     */
    reconfigure(droneIndex, totalDrones, config) {
        this.droneIndex = droneIndex;
        // Smoothly transition to new angle offset
        const targetAngle = (Math.PI * 2 / totalDrones) * droneIndex;
        // Keep current rotation progress, just adjust offset
        this.angle = targetAngle + (this.angle % (Math.PI * 2 / totalDrones));

        this.orbitRadius = config.orbitRadius;
        this.orbitSpeed = (config.orbitSpeed * Math.PI) / 180;
        this.damage = config.damage;
        this.droneChar = config.droneChar || 'o';
        this.droneColor = config.droneColor || '#00FFFF';
    }

    /**
     * Checks if this drone can hit the specified enemy (not on cooldown)
     * @param {Object} enemy - Enemy to check
     * @returns {boolean} True if can hit
     */
    canHitEnemy(enemy) {
        // Use enemy object reference as key (or enemy.id if available)
        const enemyKey = enemy.id || enemy;
        return !this.hitCooldowns.has(enemyKey);
    }

    /**
     * Records a hit on an enemy (starts cooldown)
     * @param {Object} enemy - Enemy that was hit
     */
    recordHit(enemy) {
        const enemyKey = enemy.id || enemy;
        this.hitCooldowns.set(enemyKey, this.hitCooldownDuration);
    }

    /**
     * Destroys the drone
     */
    destroy() {
        this.alive = false;
        this.hitCooldowns.clear();
    }
}
