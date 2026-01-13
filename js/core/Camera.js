/**
 * Camera System - Follows player and handles world-to-screen transforms
 * @module core/Camera
 */

import { GAME_CONFIG } from '../config/GameConfig.js';

/**
 * Camera class that follows the player and provides world-to-screen transformations
 */
export class Camera {
    /**
     * Creates a new Camera
     * @param {number} viewportWidth - Width of the viewport (canvas)
     * @param {number} viewportHeight - Height of the viewport (canvas)
     */
    constructor(viewportWidth, viewportHeight) {
        /** @type {number} Viewport width */
        this.viewportWidth = viewportWidth;

        /** @type {number} Viewport height */
        this.viewportHeight = viewportHeight;

        /** @type {number} Camera X position (top-left of viewport in world space) */
        this.x = 0;

        /** @type {number} Camera Y position (top-left of viewport in world space) */
        this.y = 0;

        /** @type {number} Target X position (for smooth following) */
        this.targetX = 0;

        /** @type {number} Target Y position */
        this.targetY = 0;

        /** @type {number} Smoothing factor (0 = no follow, 1 = instant) */
        this.smoothing = GAME_CONFIG.CAMERA.SMOOTHING;

        /** @type {number} World width */
        this.worldWidth = GAME_CONFIG.WORLD.WIDTH;

        /** @type {number} World height */
        this.worldHeight = GAME_CONFIG.WORLD.HEIGHT;

        // Screen shake effect properties
        /** @type {number} Shake X offset */
        this.shakeOffsetX = 0;
        /** @type {number} Shake Y offset */
        this.shakeOffsetY = 0;
    }

    /**
     * Updates the camera to follow a target position
     * @param {Object} targetPosition - Position to follow (usually player)
     * @param {number} deltaTime - Time since last frame
     */
    update(targetPosition, deltaTime = 0) {
        // Calculate where camera should be (center on target)
        this.targetX = targetPosition.x - this.viewportWidth / 2;
        this.targetY = targetPosition.y - this.viewportHeight / 2;

        // Clamp target to world bounds
        this.targetX = Math.max(0, Math.min(this.worldWidth - this.viewportWidth, this.targetX));
        this.targetY = Math.max(0, Math.min(this.worldHeight - this.viewportHeight, this.targetY));

        // Smooth follow using lerp
        const lerpFactor = 1 - Math.pow(1 - this.smoothing, deltaTime * 60);
        this.x += (this.targetX - this.x) * lerpFactor;
        this.y += (this.targetY - this.y) * lerpFactor;

        // Clamp camera to world bounds
        this.x = Math.max(0, Math.min(this.worldWidth - this.viewportWidth, this.x));
        this.y = Math.max(0, Math.min(this.worldHeight - this.viewportHeight, this.y));
    }

    /**
     * Immediately centers camera on a position (no smoothing)
     * @param {Object} position - Position to center on
     */
    centerOn(position) {
        this.x = position.x - this.viewportWidth / 2;
        this.y = position.y - this.viewportHeight / 2;

        // Clamp to world bounds
        this.x = Math.max(0, Math.min(this.worldWidth - this.viewportWidth, this.x));
        this.y = Math.max(0, Math.min(this.worldHeight - this.viewportHeight, this.y));

        this.targetX = this.x;
        this.targetY = this.y;
    }

    /**
     * Converts world position to screen position
     * @param {number} worldX - X position in world space
     * @param {number} worldY - Y position in world space
     * @returns {{x: number, y: number}} Screen position
     */
    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.x,
            y: worldY - this.y
        };
    }

    /**
     * Converts screen position to world position
     * @param {number} screenX - X position on screen
     * @param {number} screenY - Y position on screen
     * @returns {{x: number, y: number}} World position
     */
    screenToWorld(screenX, screenY) {
        return {
            x: screenX + this.x,
            y: screenY + this.y
        };
    }

    /**
     * Checks if a world position is visible on screen
     * @param {number} worldX - X position in world
     * @param {number} worldY - Y position in world
     * @param {number} margin - Extra margin around viewport
     * @returns {boolean} True if visible
     */
    isVisible(worldX, worldY, margin = 50) {
        return worldX >= this.x - margin &&
            worldX <= this.x + this.viewportWidth + margin &&
            worldY >= this.y - margin &&
            worldY <= this.y + this.viewportHeight + margin;
    }

    /**
     * Gets the visible bounds in world space
     * @param {number} margin - Extra margin
     * @returns {{left: number, right: number, top: number, bottom: number}}
     */
    getVisibleBounds(margin = 0) {
        return {
            left: this.x - margin,
            right: this.x + this.viewportWidth + margin,
            top: this.y - margin,
            bottom: this.y + this.viewportHeight + margin
        };
    }

    /**
     * Gets camera position as object (for RenderSystem compatibility)
     * Includes shake offset for screen shake effects
     * @returns {{x: number, y: number}}
     */
    getPosition() {
        return {
            x: this.x + this.shakeOffsetX,
            y: this.y + this.shakeOffsetY
        };
    }

    /**
     * Resets camera to center of world
     */
    reset() {
        const centerX = this.worldWidth / 2;
        const centerY = this.worldHeight / 2;
        this.centerOn({ x: centerX, y: centerY });
    }
}
