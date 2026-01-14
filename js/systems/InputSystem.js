/**
 * Input System - Handles keyboard input for player movement
 * Tracks pressed keys and provides movement vectors
 * @module systems/InputSystem
 */

import { Vector2D } from '../utils/Vector2D.js';

/**
 * Key codes for movement controls
 * @constant {Object}
 */
const MOVEMENT_KEYS = {
    UP: ['KeyW', 'ArrowUp'],
    DOWN: ['KeyS', 'ArrowDown'],
    LEFT: ['KeyA', 'ArrowLeft'],
    RIGHT: ['KeyD', 'ArrowRight']
};

/**
 * Handles keyboard input and provides movement vectors
 */
export class InputSystem {
    /**
     * Creates a new InputSystem and starts listening for keyboard events
     */
    constructor() {
        /** @type {Set<string>} Currently pressed key codes */
        this.pressedKeys = new Set();

        /** @type {boolean} Whether the input system is active */
        this.active = true;

        // Bind event handlers
        this._handleKeyDown = this._handleKeyDown.bind(this);
        this._handleKeyUp = this._handleKeyUp.bind(this);
        this._handleBlur = this._handleBlur.bind(this);

        // Add event listeners
        window.addEventListener('keydown', this._handleKeyDown);
        window.addEventListener('keyup', this._handleKeyUp);
        window.addEventListener('blur', this._handleBlur);
    }

    /**
     * Gets a normalized movement vector based on currently pressed keys
     * @returns {Vector2D} Normalized movement vector (-1 to 1 on each axis)
     */
    getMovementVector() {
        if (!this.active) {
            return Vector2D.zero();
        }

        let x = 0;
        let y = 0;

        // Check each direction
        if (this._isDirectionPressed('UP')) {
            y -= 1;
        }
        if (this._isDirectionPressed('DOWN')) {
            y += 1;
        }
        if (this._isDirectionPressed('LEFT')) {
            x -= 1;
        }
        if (this._isDirectionPressed('RIGHT')) {
            x += 1;
        }

        // Create vector and normalize for diagonal movement
        const moveVector = new Vector2D(x, y);

        // Only normalize if we have diagonal input (magnitude > 1)
        if (moveVector.magnitude() > 1) {
            return moveVector.normalize();
        }

        return moveVector;
    }

    /**
     * Checks if a specific key is currently pressed
     * @param {string} keyCode - The key code to check (e.g., 'KeyW', 'Space')
     * @returns {boolean} True if the key is pressed
     */
    isKeyPressed(keyCode) {
        return this.pressedKeys.has(keyCode);
    }

    /**
     * Checks if any of the keys for a direction are pressed
     * @param {string} direction - Direction to check ('UP', 'DOWN', 'LEFT', 'RIGHT')
     * @returns {boolean} True if direction is pressed
     * @private
     */
    _isDirectionPressed(direction) {
        const keys = MOVEMENT_KEYS[direction] || [];
        return keys.some(key => this.pressedKeys.has(key));
    }

    /**
     * Enables input processing
     */
    enable() {
        this.active = true;
    }

    /**
     * Disables input processing (returns zero movement)
     */
    disable() {
        this.active = false;
    }

    /**
     * Clears all pressed keys (useful when pausing)
     */
    clearKeys() {
        this.pressedKeys.clear();
    }

    /**
     * Removes all event listeners (call when destroying)
     */
    destroy() {
        window.removeEventListener('keydown', this._handleKeyDown);
        window.removeEventListener('keyup', this._handleKeyUp);
        window.removeEventListener('blur', this._handleBlur);
        this.pressedKeys.clear();
    }

    /**
     * Handles keydown events
     * @param {KeyboardEvent} event - The keyboard event
     * @private
     */
    _handleKeyDown(event) {
        // Prevent default for game keys to avoid scrolling
        const gameKeys = [
            ...MOVEMENT_KEYS.UP,
            ...MOVEMENT_KEYS.DOWN,
            ...MOVEMENT_KEYS.LEFT,
            ...MOVEMENT_KEYS.RIGHT,
            'Space',
            'Escape',
            'KeyE'
        ];

        if (gameKeys.includes(event.code)) {
            event.preventDefault();
        }

        this.pressedKeys.add(event.code);
    }

    /**
     * Handles keyup events
     * @param {KeyboardEvent} event - The keyboard event
     * @private
     */
    _handleKeyUp(event) {
        this.pressedKeys.delete(event.code);
    }

    /**
     * Handles window blur (clear all keys when window loses focus)
     * @private
     */
    _handleBlur() {
        this.pressedKeys.clear();
    }
}
