/**
 * Level-Up UI - Displays upgrade choices when player levels up
 * @module ui/LevelUpUI
 */

import { GAME_CONFIG } from '../config/GameConfig.js';

/**
 * Handles rendering and input for the level-up screen
 */
export class LevelUpUI {
    /**
     * Creates a new LevelUpUI
     * @param {HTMLCanvasElement} canvas - The game canvas
     */
    constructor(canvas) {
        /** @type {HTMLCanvasElement} */
        this.canvas = canvas;

        /** @type {CanvasRenderingContext2D} */
        this.ctx = canvas.getContext('2d');

        /** @type {Array} Current upgrade options */
        this.options = [];

        /** @type {number} Currently highlighted option (-1 = none) */
        this.selectedIndex = -1;

        /** @type {boolean} Whether UI is visible */
        this.visible = false;

        /** @type {Function} Callback when option is selected */
        this.onSelect = null;

        // Bind event handlers
        this._handleKeyDown = this._handleKeyDown.bind(this);
        this._handleClick = this._handleClick.bind(this);
        this._handleMouseMove = this._handleMouseMove.bind(this);
    }

    /**
     * Shows the level-up UI with options
     * @param {Array} options - Array of upgrade options
     * @param {Function} onSelect - Callback when option selected (index)
     */
    show(options, onSelect) {
        this.options = options;
        this.onSelect = onSelect;
        this.selectedIndex = -1;
        this.visible = true;

        // Add event listeners
        window.addEventListener('keydown', this._handleKeyDown);
        this.canvas.addEventListener('click', this._handleClick);
        this.canvas.addEventListener('mousemove', this._handleMouseMove);
    }

    /**
     * Hides the level-up UI
     */
    hide() {
        this.visible = false;
        this.options = [];
        this.onSelect = null;

        // Remove event listeners
        window.removeEventListener('keydown', this._handleKeyDown);
        this.canvas.removeEventListener('click', this._handleClick);
        this.canvas.removeEventListener('mousemove', this._handleMouseMove);
    }

    /**
     * Renders the level-up UI
     */
    render() {
        if (!this.visible) return;

        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, width, height);

        // Title
        ctx.save();
        ctx.font = '32px monospace';
        ctx.fillStyle = '#ffff00';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('LEVEL UP!', width / 2, 80);

        ctx.font = '16px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Choose an upgrade:', width / 2, 120);

        // Option boxes
        const boxWidth = 220;
        const boxHeight = 120;
        const startX = (width - (boxWidth * 3 + 40)) / 2;
        const startY = 180;

        this.optionRects = []; // Store for click detection

        for (let i = 0; i < this.options.length; i++) {
            const option = this.options[i];
            const x = startX + i * (boxWidth + 20);
            const y = startY;

            this.optionRects.push({ x, y, width: boxWidth, height: boxHeight });

            // Box background
            const isHovered = this.selectedIndex === i;
            ctx.fillStyle = isHovered ? '#333366' : '#222244';
            ctx.fillRect(x, y, boxWidth, boxHeight);

            // Box border
            ctx.strokeStyle = isHovered ? '#ffff00' : '#4444aa';
            ctx.lineWidth = isHovered ? 3 : 2;
            ctx.strokeRect(x, y, boxWidth, boxHeight);

            // Option number
            ctx.font = '24px monospace';
            ctx.fillStyle = '#00ffff';
            ctx.textAlign = 'center';
            ctx.fillText(`[${i + 1}]`, x + boxWidth / 2, y + 30);

            // Option name
            ctx.font = '14px monospace';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(option.name, x + boxWidth / 2, y + 60);

            // Option description (wrap if needed)
            ctx.font = '11px monospace';
            ctx.fillStyle = '#aaaaaa';
            const desc = option.description || '';
            if (desc.length > 28) {
                ctx.fillText(desc.substring(0, 28), x + boxWidth / 2, y + 85);
                ctx.fillText(desc.substring(28), x + boxWidth / 2, y + 100);
            } else {
                ctx.fillText(desc, x + boxWidth / 2, y + 90);
            }
        }

        // Instructions
        ctx.font = '14px monospace';
        ctx.fillStyle = '#888888';
        ctx.fillText('Press 1, 2, or 3 to select (or click)', width / 2, height - 50);

        ctx.restore();
    }

    /**
     * Handles keyboard input
     * @param {KeyboardEvent} event
     * @private
     */
    _handleKeyDown(event) {
        if (!this.visible) return;

        let index = -1;

        if (event.code === 'Digit1' || event.code === 'Numpad1') {
            index = 0;
        } else if (event.code === 'Digit2' || event.code === 'Numpad2') {
            index = 1;
        } else if (event.code === 'Digit3' || event.code === 'Numpad3') {
            index = 2;
        }

        if (index >= 0 && index < this.options.length) {
            event.preventDefault();
            this._selectOption(index);
        }
    }

    /**
     * Handles mouse clicks
     * @param {MouseEvent} event
     * @private
     */
    _handleClick(event) {
        if (!this.visible || !this.optionRects) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        for (let i = 0; i < this.optionRects.length; i++) {
            const box = this.optionRects[i];
            if (x >= box.x && x <= box.x + box.width &&
                y >= box.y && y <= box.y + box.height) {
                this._selectOption(i);
                break;
            }
        }
    }

    /**
     * Handles mouse movement for hover effect
     * @param {MouseEvent} event
     * @private
     */
    _handleMouseMove(event) {
        if (!this.visible || !this.optionRects) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        this.selectedIndex = -1;

        for (let i = 0; i < this.optionRects.length; i++) {
            const box = this.optionRects[i];
            if (x >= box.x && x <= box.x + box.width &&
                y >= box.y && y <= box.y + box.height) {
                this.selectedIndex = i;
                break;
            }
        }
    }

    /**
     * Selects an upgrade option
     * @param {number} index - Option index
     * @private
     */
    _selectOption(index) {
        if (this.onSelect) {
            this.onSelect(index);
        }
        this.hide();
    }
}
