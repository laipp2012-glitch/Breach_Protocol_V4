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

        /** @type {{x: number, y: number}} Mouse position */
        this.mousePosition = { x: 0, y: 0 };

        /** @type {boolean} Mouse was clicked this frame */
        this.mouseClicked = false;

        /** @type {HTMLCanvasElement|null} Canvas for mouse position */
        this.canvas = null;

        // Bind event handlers
        this._handleKeyDown = this._handleKeyDown.bind(this);
        this._handleKeyUp = this._handleKeyUp.bind(this);
        this._handleBlur = this._handleBlur.bind(this);
        this._handleMouseMove = this._handleMouseMove.bind(this);
        this._handleMouseClick = this._handleMouseClick.bind(this);

        // Add event listeners
        window.addEventListener('keydown', this._handleKeyDown);
        window.addEventListener('keyup', this._handleKeyUp);
        window.addEventListener('blur', this._handleBlur);
        window.addEventListener('mousemove', this._handleMouseMove);
        window.addEventListener('click', this._handleMouseClick);
    }

    /**
     * Sets the canvas for mouse position calculations
     * @param {HTMLCanvasElement} canvas
     */
    setCanvas(canvas) {
        this.canvas = canvas;
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
            'KeyE',
            'Tab'
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

    /**
     * Handles mouse move events
     * @param {MouseEvent} event
     * @private
     */
    _handleMouseMove(event) {
        if (this.canvas) {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePosition.x = event.clientX - rect.left;
            this.mousePosition.y = event.clientY - rect.top;
        } else {
            this.mousePosition.x = event.clientX;
            this.mousePosition.y = event.clientY;
        }
    }

    /**
     * Handles mouse click events
     * @param {MouseEvent} event
     * @private
     */
    _handleMouseClick(event) {
        this._handleMouseMove(event);
        this.mouseClicked = true;
    }

    /**
     * Gets current mouse position
     * @returns {{x: number, y: number}}
     */
    getMousePosition() {
        return this.mousePosition;
    }

    /**
     * Checks if mouse was clicked this frame (consumes click)
     * @returns {boolean}
     */
    isMouseClicked() {
        if (this.mouseClicked) {
            this.mouseClicked = false;
            return true;
        }
        return false;
    }
}
