/**
 * Pause Screen UI
 * Shows pause overlay and options
 * @module ui/PauseScreen
 */

/**
 * Renders the pause screen overlay
 */
export class PauseScreen {
    /**
     * Creates a new PauseScreen
     */
    constructor() {
        /** @type {number} Animation timer */
        this.timer = 0;
    }

    /**
     * Updates the pause screen
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        this.timer += deltaTime;
    }

    /**
     * Renders the pause screen
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {Object} stats - Current game stats
     */
    render(ctx, width, height, stats = {}) {
        // Semi-transparent dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, width, height);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // PAUSED title with glow
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 56px monospace';
        ctx.fillText('PAUSED', width / 2, height / 2 - 60);

        ctx.shadowBlur = 0;

        // Stats
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '18px monospace';
        const level = stats.level || 1;
        const time = stats.time || 0;
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        ctx.fillText(`Level ${level}  |  Time ${timeStr}`, width / 2, height / 2);

        // Options
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px monospace';
        ctx.fillText('[ ESC ] Resume', width / 2, height / 2 + 60);

        ctx.fillStyle = '#ff6666';
        ctx.fillText('[ R ] Restart', width / 2, height / 2 + 95);
    }
}
