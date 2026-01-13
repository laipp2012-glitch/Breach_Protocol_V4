/**
 * Effect System - Manages all active visual effects
 * Refactored for stability, performance and reliability
 * @module systems/EffectSystem
 */

import {
    ScalePulseEffect,
    FlashEffect,
    ShakeEffect,
    ScreenShakeEffect,
    KnockbackEffect
} from '../entities/Effect.js';

/**
 * Manages all active visual effects
 */
export class EffectSystem {
    /**
     * Creates a new EffectSystem
     * @param {number} maxEffects - Maximum concurrent effects allowed
     */
    constructor(maxEffects = 200) {
        /** @type {Array} Active effects */
        this.effects = [];

        /** @type {number} Maximum effects to prevent memory issues */
        this.maxEffects = maxEffects;

        /** @type {boolean} Whether effects are enabled */
        this.enabled = true;
    }

    /**
     * Updates all active effects
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        if (!this.enabled || this.effects.length === 0) return;

        // Update all effects (iterate backwards for safe removal)
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.update(deltaTime);

            // Remove completed effects immediately
            if (effect.completed) {
                this.effects.splice(i, 1);
            }
        }
    }

    /**
     * Adds an effect to be managed
     * @param {Effect} effect - Effect to add
     */
    addEffect(effect) {
        if (!this.enabled) return;

        // Enforce max effects limit
        if (this.effects.length >= this.maxEffects) {
            // Remove oldest effect
            const oldest = this.effects.shift();
            if (oldest && !oldest.completed) {
                oldest.onComplete();
            }
        }

        this.effects.push(effect);
    }

    /**
     * Creates and adds a scale pulse effect
     * @param {Object} target - Target entity
     * @param {number} duration - Duration
     * @param {number} scale - Scale multiplier
     */
    scalePulse(target, duration = 0.15, scale = 1.3) {
        if (!target) return;
        this.addEffect(new ScalePulseEffect(target, duration, scale));
    }

    /**
     * Creates and adds a flash effect
     * @param {Object} target - Target entity
     * @param {number} duration - Duration
     * @param {string} color - Flash color
     */
    flash(target, duration = 0.2, color = '#FFFFFF') {
        if (!target) return;
        this.addEffect(new FlashEffect(target, duration, color));
    }

    /**
     * Creates and adds a shake effect
     * @param {Object} target - Target entity
     * @param {number} duration - Duration
     * @param {number} intensity - Shake intensity
     */
    shake(target, duration = 0.15, intensity = 3) {
        if (!target) return;
        this.addEffect(new ShakeEffect(target, duration, intensity));
    }

    /**
     * Creates and adds a screen shake effect
     * @param {Object} camera - Camera object
     * @param {number} duration - Duration
     * @param {number} intensity - Shake intensity
     */
    screenShake(camera, duration = 0.2, intensity = 5) {
        if (!camera) return;
        this.addEffect(new ScreenShakeEffect(camera, duration, intensity));
    }

    /**
     * Creates and adds a knockback effect
     * @param {Object} target - Target entity
     * @param {Object} direction - Direction vector
     * @param {number} force - Knockback force
     * @param {number} duration - Duration
     */
    knockback(target, direction, force = 100, duration = 0.2) {
        if (!target || !direction) return;
        this.addEffect(new KnockbackEffect(target, direction, force, duration));
    }

    /**
     * Applies a preset effect configuration
     * @param {Object} preset - Effect preset config
     * @param {Object} target - Target entity
     * @param {Object} particleSystem - Particle system for spawning particles
     * @param {Object} camera - Camera for screen shake
     */
    applyPreset(preset, target, particleSystem = null, camera = null) {
        if (!this.enabled || !preset || !target) return;

        const effects = preset.effects || [];

        for (const effectType of effects) {
            switch (effectType) {
                case 'scalePulse':
                    if (preset.scalePulse) {
                        this.scalePulse(target, preset.scalePulse.duration, preset.scalePulse.scale);
                    }
                    break;

                case 'flash':
                    if (preset.flash) {
                        this.flash(target, preset.flash.duration, preset.flash.color);
                    }
                    break;

                case 'shake':
                    if (preset.shake) {
                        this.shake(target, preset.shake.duration, preset.shake.intensity);
                    }
                    break;

                case 'screenShake':
                    if (camera && preset.screenShake) {
                        this.screenShake(camera, preset.screenShake.duration, preset.screenShake.intensity);
                    }
                    break;
            }
        }

        // Spawn particles if configured
        if (particleSystem && preset.particles) {
            // Get position from target (support both {position: {x,y}} and {x,y})
            const pos = target.position || target;
            if (pos && typeof pos.x === 'number' && typeof pos.y === 'number') {
                particleSystem.spawn(pos.x, pos.y, preset.particles);
            }
        }
    }

    /**
     * Clears all active effects and restores entity states
     */
    clear() {
        // Complete all effects to restore entity states
        for (const effect of this.effects) {
            if (!effect.completed) {
                effect.onComplete();
            }
        }
        this.effects = [];
    }

    /**
     * Gets active effect count
     * @returns {number} Number of active effects
     */
    getCount() {
        return this.effects.length;
    }

    /**
     * Gets system statistics
     * @returns {Object} Stats object
     */
    getStats() {
        return {
            activeEffects: this.effects.length,
            maxEffects: this.maxEffects,
            enabled: this.enabled
        };
    }
}
