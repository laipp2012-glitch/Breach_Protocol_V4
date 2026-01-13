/**
 * Effect Base Class and Specific Effect Types
 * Visual feedback effects for gameplay events
 * Refactored for stability and reliability
 * @module entities/Effect
 */

/**
 * Base Effect class - all effects extend this
 */
export class Effect {
    /**
     * Creates a new Effect
     * @param {Object} target - Entity this effect applies to
     * @param {number} duration - How long effect lasts in seconds
     */
    constructor(target, duration = 0.2) {
        /** @type {Object} Target entity */
        this.target = target;

        /** @type {number} Total duration in seconds (minimum 0.01) */
        this.duration = Math.max(duration, 0.01);

        /** @type {number} Elapsed time */
        this.elapsed = 0;

        /** @type {boolean} Whether effect is complete */
        this.completed = false;
    }

    /**
     * Updates the effect
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        if (this.completed || !this.target) {
            this.completed = true;
            return;
        }

        this.elapsed += deltaTime;
        const progress = Math.min(this.elapsed / this.duration, 1);

        this.apply(progress);

        if (this.elapsed >= this.duration) {
            this.completed = true;
            this.onComplete();
        }
    }

    /**
     * Apply effect at given progress (0-1) - override in subclasses
     * @param {number} progress - Effect progress from 0 to 1
     */
    apply(progress) {
        // Override in subclasses
    }

    /**
     * Called when effect completes - override for cleanup
     */
    onComplete() {
        // Override in subclasses
    }
}

/**
 * Scale Pulse Effect - temporarily scales entity larger
 */
export class ScalePulseEffect extends Effect {
    /**
     * Creates a ScalePulseEffect
     * @param {Object} target - Target entity
     * @param {number} duration - Duration in seconds
     * @param {number} scaleMultiplier - Max scale (e.g., 1.3 = 130%)
     */
    constructor(target, duration = 0.15, scaleMultiplier = 1.3) {
        super(target, duration);
        this.scaleMultiplier = scaleMultiplier || 1.3;
        this.originalScale = (target && target.scale) || 1;
    }

    apply(progress) {
        if (!this.target) return;

        // Ease-out cubic: quick expand, slow return
        const eased = 1 - Math.pow(1 - progress, 3);
        const scaleAmount = (this.scaleMultiplier - 1) * (1 - eased);
        this.target.scale = this.originalScale + scaleAmount;
    }

    onComplete() {
        if (this.target) {
            this.target.scale = this.originalScale;
        }
    }
}

/**
 * Flash Effect - briefly changes entity color
 */
export class FlashEffect extends Effect {
    /**
     * Creates a FlashEffect
     * @param {Object} target - Target entity
     * @param {number} duration - Duration in seconds
     * @param {string} flashColor - Flash color (hex)
     */
    constructor(target, duration = 0.2, flashColor = '#FFFFFF') {
        super(target, duration);
        this.flashColor = flashColor || '#FFFFFF';
    }

    apply(progress) {
        if (!this.target) return;

        // Linear fade out
        this.target.flashAlpha = 1 - progress;
        this.target.flashColor = this.flashColor;
    }

    onComplete() {
        if (this.target) {
            this.target.flashAlpha = 0;
            this.target.flashColor = null;
        }
    }
}

/**
 * Shake Effect - adds random offset to entity position
 */
export class ShakeEffect extends Effect {
    /**
     * Creates a ShakeEffect
     * @param {Object} target - Target entity
     * @param {number} duration - Duration in seconds
     * @param {number} intensity - Shake intensity in pixels
     */
    constructor(target, duration = 0.15, intensity = 3) {
        super(target, duration);
        this.intensity = intensity || 3;
    }

    apply(progress) {
        if (!this.target) return;

        // Decreasing intensity over time
        const currentIntensity = this.intensity * (1 - progress);
        this.target.shakeOffsetX = (Math.random() - 0.5) * 2 * currentIntensity;
        this.target.shakeOffsetY = (Math.random() - 0.5) * 2 * currentIntensity;
    }

    onComplete() {
        if (this.target) {
            this.target.shakeOffsetX = 0;
            this.target.shakeOffsetY = 0;
        }
    }
}

/**
 * Screen Shake Effect - shakes the camera
 */
export class ScreenShakeEffect extends Effect {
    /**
     * Creates a ScreenShakeEffect
     * @param {Object} camera - Camera object
     * @param {number} duration - Duration in seconds
     * @param {number} intensity - Shake intensity in pixels
     */
    constructor(camera, duration = 0.2, intensity = 5) {
        super(camera, duration);
        this.intensity = intensity || 5;
    }

    apply(progress) {
        if (!this.target) return;

        // Decreasing intensity over time
        const currentIntensity = this.intensity * (1 - progress);
        this.target.shakeOffsetX = (Math.random() - 0.5) * 2 * currentIntensity;
        this.target.shakeOffsetY = (Math.random() - 0.5) * 2 * currentIntensity;
    }

    onComplete() {
        if (this.target) {
            this.target.shakeOffsetX = 0;
            this.target.shakeOffsetY = 0;
        }
    }
}

/**
 * Knockback Effect - pushes entity in a direction
 */
export class KnockbackEffect extends Effect {
    /**
     * Creates a KnockbackEffect
     * @param {Object} target - Target entity
     * @param {Object} direction - Normalized direction vector {x, y}
     * @param {number} force - Knockback force
     * @param {number} duration - Duration in seconds
     */
    constructor(target, direction, force = 100, duration = 0.2) {
        super(target, duration);
        this.direction = direction || { x: 0, y: -1 };
        this.force = force || 100;
    }

    apply(progress) {
        if (!this.target) return;

        // Decelerating knockback
        const currentForce = this.force * (1 - progress);
        this.target.knockbackVelocityX = this.direction.x * currentForce;
        this.target.knockbackVelocityY = this.direction.y * currentForce;
    }

    onComplete() {
        if (this.target) {
            this.target.knockbackVelocityX = 0;
            this.target.knockbackVelocityY = 0;
        }
    }
}
