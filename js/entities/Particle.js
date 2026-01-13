/**
 * Particle Entity - Simple particle for visual effects
 * Supports both circle rendering and ASCII character rendering
 * @module entities/Particle
 */

/**
 * Simple particle for visual effects
 */
export class Particle {
    /**
     * Creates a new Particle
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} velocityX - X velocity
     * @param {number} velocityY - Y velocity
     * @param {Object} config - Particle configuration
     */
    constructor(x, y, velocityX, velocityY, config = {}) {
        /** @type {number} X position */
        this.x = x;

        /** @type {number} Y position */
        this.y = y;

        /** @type {number} X velocity */
        this.velocityX = velocityX;

        /** @type {number} Y velocity */
        this.velocityY = velocityY;

        /** @type {number} Lifetime in seconds */
        this.lifetime = config.lifetime || 0.5;

        /** @type {number} Elapsed time */
        this.elapsed = 0;

        /** @type {string} Particle color */
        this.color = config.color || '#FFFFFF';

        /** @type {number} Particle size (font size for ASCII, radius for circles) */
        this.size = config.size || 12;

        /** @type {number} Gravity (downward acceleration) */
        this.gravity = config.gravity || 0;

        /** @type {boolean} Whether particle is alive */
        this.alive = true;

        /** @type {string|null} ASCII character to render (null = circle) */
        this.char = config.char || null;
    }

    /**
     * Updates the particle
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        if (!this.alive) return;

        this.elapsed += deltaTime;

        // Apply gravity
        this.velocityY += this.gravity * deltaTime;

        // Update position
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;

        // Check if dead
        if (this.elapsed >= this.lifetime) {
            this.alive = false;
        }
    }

    /**
     * Gets the particle's opacity based on lifetime
     * @returns {number} Opacity from 0 to 1
     */
    getOpacity() {
        return Math.max(0, 1 - (this.elapsed / this.lifetime));
    }

    /**
     * Resets particle for pool reuse
     * @param {number} x - New X position
     * @param {number} y - New Y position
     * @param {number} velocityX - New X velocity
     * @param {number} velocityY - New Y velocity
     * @param {Object} config - New configuration
     */
    reset(x, y, velocityX, velocityY, config = {}) {
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.lifetime = config.lifetime || 0.5;
        this.elapsed = 0;
        this.color = config.color || '#FFFFFF';
        this.size = config.size || 12;
        this.gravity = config.gravity || 0;
        this.char = config.char || null;
        this.alive = true;
    }
}
