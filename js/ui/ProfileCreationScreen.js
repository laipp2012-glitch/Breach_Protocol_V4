/**
 * Profile Creation Screen UI
 * Allows player to enter character name and manage save data
 * @module ui/ProfileCreationScreen
 */

import { playerProfile } from '../systems/PlayerProfile.js';

/**
 * Renders the profile creation screen
 */
export class ProfileCreationScreen {
    /**
     * Creates a new ProfileCreationScreen
     */
    constructor() {
        /** @type {string} Current input text */
        this.inputText = '';

        /** @type {number} Cursor blink timer */
        this.cursorTimer = 0;

        /** @type {boolean} Whether cursor is visible */
        this.showCursor = true;

        /** @type {number} Max name length */
        this.maxLength = 12;

        /** @type {boolean} Whether wipe confirm is showing */
        this.showWipeConfirm = false;

        /** @type {Function|null} Callback when profile is created */
        this.onProfileCreated = null;

        /** @type {boolean} Whether keyboard is bound */
        this.keysBound = false;

        /** @type {Function} Bound keydown handler */
        this.handleKeyDown = this._handleKeyDown.bind(this);
    }

    /**
     * Bind keyboard input
     */
    bindKeys() {
        if (!this.keysBound) {
            document.addEventListener('keydown', this.handleKeyDown);
            this.keysBound = true;
        }
    }

    /**
     * Unbind keyboard input
     */
    unbindKeys() {
        if (this.keysBound) {
            document.removeEventListener('keydown', this.handleKeyDown);
            this.keysBound = false;
        }
    }

    /**
     * Handle keydown events
     * @param {KeyboardEvent} e
     * @private
     */
    _handleKeyDown(e) {
        // Handle wipe confirm mode
        if (this.showWipeConfirm) {
            if (e.key === 'y' || e.key === 'Y') {
                playerProfile.wipeProfile();
                this.showWipeConfirm = false;
                this.inputText = '';
            } else if (e.key === 'n' || e.key === 'N' || e.key === 'Escape') {
                this.showWipeConfirm = false;
            }
            return;
        }

        // Handle name input
        if (e.key === 'Enter') {
            if (this.inputText.trim().length > 0) {
                this.createProfile();
            }
        } else if (e.key === 'Backspace') {
            this.inputText = this.inputText.slice(0, -1);
        } else if (e.key === 'Delete') {
            // Trigger wipe save confirmation
            if (playerProfile.hasProfile()) {
                this.showWipeConfirm = true;
            }
        } else if (e.key.length === 1 && this.inputText.length < this.maxLength) {
            // Only allow alphanumeric and some special chars
            if (/^[a-zA-Z0-9_\-]$/.test(e.key)) {
                this.inputText += e.key;
            }
        }
    }

    /**
     * Create profile and trigger callback
     * @private
     */
    createProfile() {
        playerProfile.createProfile(this.inputText.trim());
        this.unbindKeys();
        if (this.onProfileCreated) {
            this.onProfileCreated();
        }
    }

    /**
     * Updates the screen
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        this.cursorTimer += deltaTime;
        if (this.cursorTimer >= 0.5) {
            this.cursorTimer = 0;
            this.showCursor = !this.showCursor;
        }
    }

    /**
     * Renders the profile creation screen
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    render(ctx, width, height) {
        // Dark background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);

        // Grid pattern
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Header
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 36px monospace';
        ctx.fillText('SYSTEM ACCESS', width / 2, height / 2 - 120);

        ctx.shadowBlur = 0;

        // Wipe confirm dialog
        if (this.showWipeConfirm) {
            ctx.fillStyle = '#ff3333';
            ctx.font = '20px monospace';
            ctx.fillText('! WIPE ALL SAVE DATA? !', width / 2, height / 2 - 40);

            ctx.fillStyle = '#ffffff';
            ctx.font = '16px monospace';
            ctx.fillText('Press Y to confirm, N to cancel', width / 2, height / 2);
            return;
        }

        // Input label
        ctx.fillStyle = '#00aa00';
        ctx.font = '18px monospace';
        ctx.fillText('ENTER CALLSIGN:', width / 2, height / 2 - 50);

        // Input box
        const boxWidth = 280;
        const boxHeight = 40;
        const boxX = (width - boxWidth) / 2;
        const boxY = height / 2 - 20;

        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        ctx.fillStyle = '#111';
        ctx.fillRect(boxX + 2, boxY + 2, boxWidth - 4, boxHeight - 4);

        // Input text
        ctx.fillStyle = '#00ff00';
        ctx.font = '24px monospace';
        ctx.textAlign = 'left';
        const displayText = this.inputText + (this.showCursor ? '_' : ' ');
        ctx.fillText(displayText, boxX + 12, boxY + boxHeight / 2 + 2);

        ctx.textAlign = 'center';

        // Instructions
        ctx.fillStyle = '#666666';
        ctx.font = '14px monospace';
        ctx.fillText('Press ENTER to confirm', width / 2, height / 2 + 50);

        // Wipe save hint (only if profile exists)
        if (playerProfile.hasProfile()) {
            ctx.fillStyle = '#993333';
            ctx.fillText('DEL - Wipe Save', width / 2, height / 2 + 80);

            // Show existing profile info
            ctx.fillStyle = '#555555';
            ctx.font = '12px monospace';
            const stats = playerProfile.getStats();
            ctx.fillText(
                `Current: ${playerProfile.getPlayerName()} | Gold: ${playerProfile.getGold()} | Runs: ${stats.totalRuns}`,
                width / 2, height - 40
            );
        }

        // Version
        ctx.fillStyle = '#333333';
        ctx.font = '12px monospace';
        ctx.fillText('v0.4', width - 30, height - 15);
    }
}
