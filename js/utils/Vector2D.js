/**
 * 2D Vector utility class for game math operations
 * @module utils/Vector2D
 */

/**
 * Represents a 2D vector with x and y components
 */
export class Vector2D {
    /**
     * Creates a new Vector2D instance
     * @param {number} [x=0] - The x component
     * @param {number} [y=0] - The y component
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * Adds another vector to this vector
     * @param {Vector2D} v - The vector to add
     * @returns {Vector2D} A new vector with the result
     */
    add(v) {
        return new Vector2D(this.x + v.x, this.y + v.y);
    }

    /**
     * Subtracts another vector from this vector
     * @param {Vector2D} v - The vector to subtract
     * @returns {Vector2D} A new vector with the result
     */
    subtract(v) {
        return new Vector2D(this.x - v.x, this.y - v.y);
    }

    /**
     * Multiplies this vector by a scalar value
     * @param {number} scalar - The scalar to multiply by
     * @returns {Vector2D} A new vector with the result
     */
    multiply(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }

    /**
     * Divides this vector by a scalar value
     * @param {number} scalar - The scalar to divide by
     * @returns {Vector2D} A new vector with the result
     */
    divide(scalar) {
        if (scalar === 0) {
            return new Vector2D(0, 0);
        }
        return new Vector2D(this.x / scalar, this.y / scalar);
    }

    /**
     * Calculates the magnitude (length) of this vector
     * @returns {number} The magnitude
     */
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Calculates the squared magnitude (avoids sqrt for performance)
     * @returns {number} The squared magnitude
     */
    magnitudeSquared() {
        return this.x * this.x + this.y * this.y;
    }

    /**
     * Returns a normalized (unit length) version of this vector
     * @returns {Vector2D} A new normalized vector
     */
    normalize() {
        const mag = this.magnitude();
        if (mag === 0) {
            return new Vector2D(0, 0);
        }
        return new Vector2D(this.x / mag, this.y / mag);
    }

    /**
     * Calculates the distance to another vector
     * @param {Vector2D} v - The other vector
     * @returns {number} The distance
     */
    distanceTo(v) {
        const dx = v.x - this.x;
        const dy = v.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculates the squared distance to another vector (avoids sqrt)
     * @param {Vector2D} v - The other vector
     * @returns {number} The squared distance
     */
    distanceToSquared(v) {
        const dx = v.x - this.x;
        const dy = v.y - this.y;
        return dx * dx + dy * dy;
    }

    /**
     * Calculates the dot product with another vector
     * @param {Vector2D} v - The other vector
     * @returns {number} The dot product
     */
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    /**
     * Creates a copy of this vector
     * @returns {Vector2D} A new vector with the same values
     */
    clone() {
        return new Vector2D(this.x, this.y);
    }

    /**
     * Sets the x and y components of this vector
     * @param {number} x - The new x component
     * @param {number} y - The new y component
     * @returns {Vector2D} This vector for chaining
     */
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * Checks if this vector equals another vector
     * @param {Vector2D} v - The vector to compare
     * @returns {boolean} True if vectors are equal
     */
    equals(v) {
        return this.x === v.x && this.y === v.y;
    }

    /**
     * Returns a string representation of this vector
     * @returns {string} String in format "Vector2D(x, y)"
     */
    toString() {
        return `Vector2D(${this.x}, ${this.y})`;
    }

    // Static factory methods

    /**
     * Creates a zero vector (0, 0)
     * @returns {Vector2D} A new zero vector
     */
    static zero() {
        return new Vector2D(0, 0);
    }

    /**
     * Creates a unit vector pointing up (0, -1)
     * @returns {Vector2D} A new up vector
     */
    static up() {
        return new Vector2D(0, -1);
    }

    /**
     * Creates a unit vector pointing down (0, 1)
     * @returns {Vector2D} A new down vector
     */
    static down() {
        return new Vector2D(0, 1);
    }

    /**
     * Creates a unit vector pointing left (-1, 0)
     * @returns {Vector2D} A new left vector
     */
    static left() {
        return new Vector2D(-1, 0);
    }

    /**
     * Creates a unit vector pointing right (1, 0)
     * @returns {Vector2D} A new right vector
     */
    static right() {
        return new Vector2D(1, 0);
    }

    /**
     * Creates a vector from an angle (in radians)
     * @param {number} angle - The angle in radians
     * @returns {Vector2D} A new unit vector in that direction
     */
    static fromAngle(angle) {
        return new Vector2D(Math.cos(angle), Math.sin(angle));
    }

    /**
     * Linearly interpolates between two vectors
     * @param {Vector2D} a - Start vector
     * @param {Vector2D} b - End vector
     * @param {number} t - Interpolation factor (0-1)
     * @returns {Vector2D} The interpolated vector
     */
    static lerp(a, b, t) {
        const clampedT = Math.max(0, Math.min(1, t));
        return new Vector2D(
            a.x + (b.x - a.x) * clampedT,
            a.y + (b.y - a.y) * clampedT
        );
    }
}
