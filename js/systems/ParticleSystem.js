/**
 * Particle System - Manages all particles for visual effects
 * Refactored for stability, performance and reliability
 * @module systems/ParticleSystem
 */

import { Particle } from '../entities/Particle.js';

/**
 * Manages spawning, updating, and rendering particles
 */
export class ParticleSystem {
    /**
     * Creates a new ParticleSystem
     * @param {number} maxParticles - Maximum particles allowed
     */
    constructor(maxParticles = 500) {
        /** @type {Array<Particle>} Active particles */
        this.particles = [];

        /** @type {number} Maximum particles */
        this.maxParticles = maxParticles;

        /** @type {boolean} Whether system is enabled */
        this.enabled = true;
    }

    /**
     * Spawns particles at a position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} config - Spawn configuration
     */
    spawn(x, y, config = {}) {
        if (!this.enabled) return;

        // Validate position
        if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
            return;
        }

        const count = Math.min(config.count || 5, 50); // Cap per-spawn to prevent burst issues
        const color = config.color || '#FFFFFF';
        const size = config.size || 12;
        const speedMin = Array.isArray(config.speed) ? config.speed[0] : (config.speed || 50);
        const speedMax = Array.isArray(config.speed) ? config.speed[1] : (config.speed || 100);
        const lifetime = config.lifetime || 0.5;
        const gravity = config.gravity || 0;
        const spread = config.spread !== undefined ? config.spread : 360;
        const direction = config.direction !== undefined ? config.direction : null;
        const char = config.char || null;

        for (let i = 0; i < count; i++) {
            // Don't exceed max particles
            if (this.particles.length >= this.maxParticles) {
                // Remove oldest particles to make room
                this.particles.shift();
            }

            // Calculate velocity angle
            let angle;
            if (direction !== null) {
                // Spread around a specific direction
                const halfSpread = (spread / 2) * (Math.PI / 180);
                const baseAngle = direction * (Math.PI / 180);
                angle = baseAngle + (Math.random() - 0.5) * 2 * halfSpread;
            } else {
                // Random direction within spread (centered upward for spread < 360)
                if (spread >= 360) {
                    // Full circle
                    angle = Math.random() * Math.PI * 2;
                } else {
                    // Partial spread centered around upward (-90 degrees)
                    const spreadRad = spread * (Math.PI / 180);
                    angle = -Math.PI / 2 + (Math.random() - 0.5) * spreadRad;
                }
            }

            const speed = speedMin + Math.random() * (speedMax - speedMin);
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;

            const particle = new Particle(x, y, velocityX, velocityY, {
                lifetime,
                color,
                size,
                gravity,
                char
            });

            this.particles.push(particle);
        }
    }

    /**
     * Updates all particles
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        if (!this.enabled || this.particles.length === 0) return;

        // Update and filter in one pass for performance
        let writeIndex = 0;
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            particle.update(deltaTime);

            if (particle.alive) {
                this.particles[writeIndex] = particle;
                writeIndex++;
            }
        }
        this.particles.length = writeIndex;
    }

    /**
     * Gets all active particles for rendering
     * @returns {Array<Particle>} Active particles
     */
    getParticles() {
        return this.particles;
    }

    /**
     * Clears all particles
     */
    clear() {
        this.particles = [];
    }

    /**
     * Gets particle count
     * @returns {number} Number of active particles
     */
    getCount() {
        return this.particles.length;
    }

    /**
     * Gets system statistics
     * @returns {Object} Stats object
     */
    getStats() {
        return {
            activeParticles: this.particles.length,
            maxParticles: this.maxParticles,
            enabled: this.enabled
        };
    }
}
