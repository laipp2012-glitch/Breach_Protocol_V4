/**
 * Object Pool - Reusable object pooling for performance
 * Reduces garbage collection by reusing objects instead of creating new ones
 * @module utils/ObjectPool
 */

/**
 * Generic object pool for reusing objects
 * @template T
 */
export class ObjectPool {
    /**
     * Creates a new object pool
     * @param {Function} factory - Function that creates new objects
     * @param {Function} reset - Function that resets an object for reuse
     * @param {number} initialSize - Initial pool size
     */
    constructor(factory, reset, initialSize = 50) {
        /** @type {Function} Factory function */
        this.factory = factory;

        /** @type {Function} Reset function */
        this.reset = reset;

        /** @type {Array<T>} Pool of available objects */
        this.pool = [];

        /** @type {number} Total objects created */
        this.totalCreated = 0;

        /** @type {number} Objects currently in use */
        this.activeCount = 0;

        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.factory());
            this.totalCreated++;
        }
    }

    /**
     * Gets an object from the pool (creates new if empty)
     * @returns {T} Object from pool
     */
    get() {
        this.activeCount++;

        if (this.pool.length > 0) {
            return this.pool.pop();
        }

        // Pool empty, create new object
        this.totalCreated++;
        return this.factory();
    }

    /**
     * Returns an object to the pool for reuse
     * @param {T} obj - Object to return
     */
    release(obj) {
        this.reset(obj);
        this.pool.push(obj);
        this.activeCount--;
    }

    /**
     * Releases multiple objects at once
     * @param {Array<T>} objects - Objects to release
     */
    releaseAll(objects) {
        for (const obj of objects) {
            this.release(obj);
        }
    }

    /**
     * Gets pool statistics
     * @returns {Object} Pool stats
     */
    getStats() {
        return {
            available: this.pool.length,
            active: this.activeCount,
            totalCreated: this.totalCreated
        };
    }

    /**
     * Clears the pool
     */
    clear() {
        this.pool = [];
        this.activeCount = 0;
    }
}
