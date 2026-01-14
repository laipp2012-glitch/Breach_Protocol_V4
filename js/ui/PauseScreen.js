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

        /** @type {boolean} Showing abort confirmation */
        this.showAbortConfirm = false;
    }

    /**
     * Updates the pause screen
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        this.timer += deltaTime;
    }

    /**
     * Handles key input
     * @param {string} key - Key code
     * @returns {string|null} Action: 'resume', 'abort', or null
     */
    handleKey(key) {
        if (this.showAbortConfirm) {
            if (key === 'KeyY') {
                this.showAbortConfirm = false;
                return 'abort';
            } else if (key === 'KeyN' || key === 'Escape') {
                this.showAbortConfirm = false;
                return null;
            }
            return null;
        }

        if (key === 'Escape') {
            return 'resume';
        } else if (key === 'KeyQ') {
            this.showAbortConfirm = true;
            return null;
        }

        return null;
    }

    /**
     * Resets pause screen state
     */
    reset() {
        this.showAbortConfirm = false;
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
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, width, height);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Abort confirmation dialog
        if (this.showAbortConfirm) {
            ctx.shadowColor = '#ff3333';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#ff3333';
            ctx.font = 'bold 32px monospace';
            ctx.fillText('ABORT MISSION?', width / 2, height / 2 - 60);
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#ffcc00';
            ctx.font = '18px monospace';
            ctx.fillText('All progress in this run will be lost.', width / 2, height / 2 - 10);
            ctx.fillText('No gold will be earned.', width / 2, height / 2 + 20);

            ctx.font = '20px monospace';
            ctx.fillStyle = '#ff6666';
            ctx.fillText('[ Y ] Abort', width / 2, height / 2 + 70);
            ctx.fillStyle = '#66ff66';
            ctx.fillText('[ N ] Cancel', width / 2, height / 2 + 105);
            return;
        }

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
        ctx.fillText('[ Q ] Abort Mission', width / 2, height / 2 + 95);
    }
}
