/**
 * Loading Screen UI
 * Shows a progress bar during transitions
 * @module ui/LoadingScreen
 */

/**
 * Loading screen with progress bar
 */
export class LoadingScreen {
    constructor() {
        /** @type {number} Progress (0-1) */
        this.progress = 0;

        /** @type {number} Duration in seconds */
        this.duration = 1.0;

        /** @type {number} Timer */
        this.timer = 0;

        /** @type {string} Loading message */
        this.message = 'INITIALIZING SYSTEMS...';

        /** @type {Function|null} Callback when complete */
        this.onComplete = null;

        /** @type {boolean} Whether complete */
        this.complete = false;
    }

    /**
     * Starts the loading screen
     * @param {string} message - Message to display
     * @param {number} duration - Duration in seconds
     */
    start(message = 'LOADING...', duration = 1.0) {
        this.message = message;
        this.duration = duration;
        this.timer = 0;
        this.progress = 0;
        this.complete = false;
    }

    /**
     * Updates the loading screen
     * @param {number} deltaTime
     * @returns {boolean} True if complete
     */
    update(deltaTime) {
        if (this.complete) return true;

        this.timer += deltaTime;
        this.progress = Math.min(1, this.timer / this.duration);

        if (this.progress >= 1) {
            this.complete = true;
            if (this.onComplete) {
                this.onComplete();
            }
            return true;
        }

        return false;
    }

    /**
     * Renders the loading screen
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} width
     * @param {number} height
     */
    render(ctx, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;

        // Background
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

        // Message
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 10;
        ctx.font = '20px monospace';
        ctx.fillStyle = '#00ff00';
        ctx.fillText(this.message, centerX, centerY - 40);
        ctx.shadowBlur = 0;

        // Progress bar background
        const barWidth = 300;
        const barHeight = 20;
        const barX = centerX - barWidth / 2;
        const barY = centerY;

        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // Progress bar fill
        const fillWidth = barWidth * this.progress;
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(barX + 2, barY + 2, fillWidth - 4, barHeight - 4);

        // Percentage
        ctx.font = '16px monospace';
        ctx.fillStyle = '#00ff00';
        ctx.fillText(`${Math.floor(this.progress * 100)}%`, centerX, centerY + 50);
    }
}
