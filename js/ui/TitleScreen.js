/**
 * Title Screen UI
 * Shows game title and start prompt
 * @module ui/TitleScreen
 */

import { playerProfile } from '../systems/PlayerProfile.js';

/**
 * Renders the title screen
 */
export class TitleScreen {
    /**
     * Creates a new TitleScreen
     */
    constructor() {
        /** @type {number} Animation timer for blinking effect */
        this.blinkTimer = 0;

        /** @type {boolean} Whether prompt is visible */
        this.showPrompt = true;

        /** @type {boolean} Whether wipe confirm is showing */
        this.showWipeConfirm = false;

        /** @type {Function|null} Callback when profile is wiped */
        this.onProfileWiped = null;
    }

    /**
     * Handle key press for wipe confirmation
     * @param {string} key - Key code pressed
     * @returns {boolean} Whether key was consumed
     */
    handleKey(key) {
        if (this.showWipeConfirm) {
            if (key === 'KeyY') {
                playerProfile.wipeProfile();
                this.showWipeConfirm = false;
                if (this.onProfileWiped) {
                    this.onProfileWiped();
                }
                return true;
            } else if (key === 'KeyN' || key === 'Escape') {
                this.showWipeConfirm = false;
                return true;
            }
        } else if (key === 'Delete' || key === 'Backspace') {
            this.showWipeConfirm = true;
            return true;
        }
        return false;
    }

    /**
     * Updates the title screen
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        this.blinkTimer += deltaTime;

        // Blink every 0.5 seconds
        if (this.blinkTimer >= 0.5) {
            this.blinkTimer = 0;
            this.showPrompt = !this.showPrompt;
        }
    }

    /**
     * Renders the title screen
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    render(ctx, width, height) {
        // Dark background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);

        // Grid pattern background
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

        // Title
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Main title with glow
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 64px monospace';
        ctx.fillText('BREACH', width / 2, height / 2 - 80);
        ctx.fillText('PROTOCOL', width / 2, height / 2 - 20);

        // Subtitle
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#00aa00';
        ctx.font = '24px monospace';
        ctx.fillText('SURVIVOR', width / 2, height / 2 + 30);

        // Reset shadow
        ctx.shadowBlur = 0;

        // Wipe confirm dialog
        if (this.showWipeConfirm) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(width / 2 - 180, height / 2 + 70, 360, 80);

            ctx.strokeStyle = '#ff3333';
            ctx.lineWidth = 2;
            ctx.strokeRect(width / 2 - 180, height / 2 + 70, 360, 80);

            ctx.fillStyle = '#ff3333';
            ctx.font = '18px monospace';
            ctx.fillText('! DELETE ALL SAVE DATA? !', width / 2, height / 2 + 95);

            ctx.fillStyle = '#ffffff';
            ctx.font = '14px monospace';
            ctx.fillText('Y - Confirm   |   N - Cancel', width / 2, height / 2 + 125);
            return;
        }

        // Start prompt (blinking)
        if (this.showPrompt) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '20px monospace';
            ctx.fillText('[ PRESS SPACE TO START ]', width / 2, height / 2 + 100);
        }

        // Player name display
        if (playerProfile.hasProfile()) {
            ctx.fillStyle = '#00ffff';
            ctx.font = '16px monospace';
            ctx.fillText(`Agent: ${playerProfile.getPlayerName()}`, width / 2, height / 2 + 140);

            // Gold display
            ctx.fillStyle = '#ffcc00';
            ctx.fillText(`Gold: ${playerProfile.getGold()}`, width / 2, height / 2 + 165);
        }

        // Controls hint
        ctx.fillStyle = '#666666';
        ctx.font = '16px monospace';
        ctx.fillText('WASD / Arrows - Move', width / 2, height - 100);
        ctx.fillText('ESC - Pause', width / 2, height - 75);

        // Delete save hint
        ctx.fillStyle = '#993333';
        ctx.font = '14px monospace';
        ctx.fillText('DEL - Delete Save', width / 2, height - 45);

        // Version
        ctx.fillStyle = '#333333';
        ctx.font = '12px monospace';
        ctx.fillText('v0.4', width - 30, height - 15);
    }
}
