/**
 * Damage Number Entity - Floating damage text
 * Displays damage dealt and floats upward before disappearing
 * @module entities/DamageNumber
 */

/**
 * Floating damage number that rises and fades
 */
export class DamageNumber {
    /**
     * Creates a new DamageNumber
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} value - Damage value to display
     * @param {string} color - Text color
     */
    constructor(x = 0, y = 0, value = 0, color = '#ffffff') {
        /** @type {string} Entity type */
        this.type = 'damageNumber';

        /** @type {number} X position */
        this.x = x;

        /** @type {number} Y position */
        this.y = y;

        /** @type {number} Starting Y for animation */
        this.startY = y;

        /** @type {number} Damage value */
        this.value = value;

        /** @type {string} Display color */
        this.color = color;

        /** @type {number} Lifetime in seconds */
        this.lifetime = 0.8;

        /** @type {number} Time alive */
        this.age = 0;

        /** @type {number} Float speed (pixels per second) */
        this.floatSpeed = 50;

        /** @type {boolean} Whether still active */
        this.alive = true;

        /** @type {number} Opacity (0-1) */
        this.opacity = 1;

        /** @type {number} Scale for critical hits */
        this.scale = 1;
    }

    /**
     * Initializes/resets the damage number (for pooling)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} value - Damage value
     * @param {boolean} isCritical - Whether this is a critical hit
     */
    init(x, y, value, isCritical = false) {
        this.x = x;
        this.y = y;
        this.startY = y;
        this.value = value;
        this.age = 0;
        this.alive = true;
        this.opacity = 1;

        // Critical hits are bigger and yellow
        if (isCritical) {
            this.color = '#ffff00';
            this.scale = 1.5;
        } else {
            this.color = '#ffffff';
            this.scale = 1;
        }
    }

    /**
     * Updates the damage number each frame
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        if (!this.alive) return;

        this.age += deltaTime;

        // Float upward
        this.y = this.startY - (this.age * this.floatSpeed);

        // Fade out in the last half of lifetime
        if (this.age > this.lifetime * 0.5) {
            this.opacity = 1 - ((this.age - this.lifetime * 0.5) / (this.lifetime * 0.5));
        }

        // Die after lifetime
        if (this.age >= this.lifetime) {
            this.alive = false;
        }
    }

    /**
     * Resets for pool reuse
     */
    reset() {
        this.alive = false;
        this.age = 0;
        this.opacity = 1;
        this.value = 0;
    }
}
