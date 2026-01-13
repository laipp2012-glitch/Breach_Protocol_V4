/**
 * Game Loop module - handles the main update cycle at 60 FPS
 * Uses requestAnimationFrame for smooth, efficient rendering
 * @module core/GameLoop
 */

import { GAME_CONFIG } from '../config/GameConfig.js';

/**
 * Main game loop class that manages frame timing and updates
 */
export class GameLoop {
    /**
     * Creates a new GameLoop instance
     * @param {Function} updateCallback - Function to call each frame with deltaTime
     */
    constructor(updateCallback) {
        /** @type {Function} */
        this.updateCallback = updateCallback;

        /** @type {boolean} */
        this.running = false;

        /** @type {boolean} */
        this.paused = false;

        /** @type {number|null} */
        this.animationFrameId = null;

        /** @type {number} */
        this.lastTime = 0;

        /** @type {number} */
        this.deltaTime = 0;

        // FPS tracking
        /** @type {number} */
        this.fps = 0;

        /** @type {number} */
        this.frameCount = 0;

        /** @type {number} */
        this.fpsTimer = 0;

        /** @type {number} - Maximum delta time to prevent physics explosions */
        this.maxDeltaTime = 1 / 30; // Cap at 30 FPS minimum

        // Bind methods for event handlers
        this._loop = this._loop.bind(this);
        this._handleVisibilityChange = this._handleVisibilityChange.bind(this);
    }

    /**
     * Starts the game loop
     */
    start() {
        if (this.running) {
            return;
        }

        this.running = true;
        this.paused = false;
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.fpsTimer = 0;

        // Add visibility change listener to pause when tab is hidden
        document.addEventListener('visibilitychange', this._handleVisibilityChange);

        // Start the loop
        this.animationFrameId = requestAnimationFrame(this._loop);

        if (GAME_CONFIG.DEBUG.SHOW_FPS) {
            console.log('GameLoop: Started');
        }
    }

    /**
     * Stops the game loop completely
     */
    stop() {
        this.running = false;
        this.paused = false;

        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        document.removeEventListener('visibilitychange', this._handleVisibilityChange);

        if (GAME_CONFIG.DEBUG.SHOW_FPS) {
            console.log('GameLoop: Stopped');
        }
    }

    /**
     * Pauses the game loop (keeps running but doesn't update game logic)
     */
    pause() {
        if (!this.running || this.paused) {
            return;
        }
        this.paused = true;

        if (GAME_CONFIG.DEBUG.SHOW_FPS) {
            console.log('GameLoop: Paused');
        }
    }

    /**
     * Resumes the game loop from pause
     */
    resume() {
        if (!this.running || !this.paused) {
            return;
        }
        this.paused = false;
        this.lastTime = performance.now(); // Reset time to avoid large deltaTime spike

        if (GAME_CONFIG.DEBUG.SHOW_FPS) {
            console.log('GameLoop: Resumed');
        }
    }

    /**
     * Toggles pause state
     * @returns {boolean} The new paused state
     */
    togglePause() {
        if (this.paused) {
            this.resume();
        } else {
            this.pause();
        }
        return this.paused;
    }

    /**
     * Gets the current FPS
     * @returns {number} Current frames per second
     */
    getFPS() {
        return Math.round(this.fps);
    }

    /**
     * Checks if the game loop is running
     * @returns {boolean} True if running
     */
    isRunning() {
        return this.running;
    }

    /**
     * Checks if the game loop is paused
     * @returns {boolean} True if paused
     */
    isPaused() {
        return this.paused;
    }

    /**
     * Internal loop function called by requestAnimationFrame
     * @param {number} currentTime - Current timestamp from performance.now()
     * @private
     */
    _loop(currentTime) {
        // Schedule next frame first for consistent timing
        if (this.running) {
            this.animationFrameId = requestAnimationFrame(this._loop);
        }

        // Calculate delta time in seconds
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Cap delta time to prevent physics issues after long pauses
        if (this.deltaTime > this.maxDeltaTime) {
            this.deltaTime = this.maxDeltaTime;
        }

        // Update FPS counter
        this.frameCount++;
        this.fpsTimer += this.deltaTime;
        if (this.fpsTimer >= 1.0) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsTimer = 0;

            if (GAME_CONFIG.DEBUG.LOG_PERFORMANCE) {
                console.log(`FPS: ${this.fps}`);
            }
        }

        // Skip update if paused
        if (this.paused) {
            return;
        }

        // Call the update callback with delta time
        if (this.updateCallback) {
            this.updateCallback(this.deltaTime);
        }
    }

    /**
     * Handles browser tab visibility changes
     * @private
     */
    _handleVisibilityChange() {
        if (document.hidden) {
            this.pause();
        } else {
            this.resume();
        }
    }
}
