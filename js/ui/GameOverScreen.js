/**
 * Game Over Screen UI
 * Shows final stats and restart options
 * @module ui/GameOverScreen
 */

/**
 * Renders the game over screen
 */
export class GameOverScreen {
    /**
     * Creates a new GameOverScreen
     */
    constructor() {
        /** @type {number} Animation timer */
        this.timer = 0;

        /** @type {boolean} Prompt blink state */
        this.showPrompt = true;
    }

    /**
     * Updates the game over screen
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        this.timer += deltaTime;

        // Blink every 0.6 seconds
        if (this.timer >= 1) {
            this.timer = 0;
            this.showPrompt = !this.showPrompt;
        }
    }

    /**
     * Renders the game over screen
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {Object} stats - Final game stats
     */
    render(ctx, width, height, stats = {}) {
        // Dark background with red tint
        ctx.fillStyle = '#140000f2';
        ctx.fillRect(0, 0, width, height);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // GAME OVER title with red glow
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 25;
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 64px monospace';
        ctx.fillText('GAME OVER', width / 2, height / 2 - 100);

        ctx.shadowBlur = 0;

        // Stats box
        const boxY = height / 2 - 20;
        ctx.strokeStyle = '#140000f2';
        ctx.lineWidth = 2;
        ctx.strokeRect(width / 2 - 150, boxY - 40, 300, 120);

        // Stats
        ctx.fillStyle = '#888888';
        ctx.font = '16px monospace';
        ctx.fillText('FINAL STATS', width / 2, boxY - 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '20px monospace';

        const level = stats.level || 1;
        const time = stats.time || 0;
        const kills = stats.kills || 0;
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        ctx.fillText(`Level: ${level}`, width / 2, boxY + 15);
        ctx.fillText(`Time: ${timeStr}`, width / 2, boxY + 45);
        ctx.fillText(`Kills: ${kills}`, width / 2, boxY + 75);

        // Restart prompt (blinking)
        if (this.showPrompt) {
            ctx.fillStyle = '#00ff00';
            ctx.font = '20px monospace';
            ctx.fillText('[ PRESS R TO RESTART ]', width / 2, height / 2 + 120);

            ctx.fillStyle = '#666666';
            ctx.font = '16px monospace';
            ctx.fillText('[ SPACE ] Return to Title', width / 2, height / 2 + 155);
        }
    }
}
