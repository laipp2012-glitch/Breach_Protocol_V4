/**
 * Title Screen UI
 * Shows game title and start prompt
 * @module ui/TitleScreen
 */

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

        // Start prompt (blinking)
        if (this.showPrompt) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '20px monospace';
            ctx.fillText('[ PRESS SPACE TO START ]', width / 2, height / 2 + 100);
        }

        // Controls hint
        ctx.fillStyle = '#666666';
        ctx.font = '16px monospace';
        ctx.fillText('WASD / Arrows - Move', width / 2, height - 80);
        ctx.fillText('ESC - Pause', width / 2, height - 55);

        // Version
        ctx.fillStyle = '#333333';
        ctx.font = '12px monospace';
        ctx.fillText('v0.4', width - 30, height - 15);
    }
}
