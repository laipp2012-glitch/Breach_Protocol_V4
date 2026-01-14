/**
 * Rewards Screen UI
 * Shows end-of-run results and grants gold for successful extractions
 * @module ui/RewardsScreen
 */

import { playerProfile } from '../systems/PlayerProfile.js';

/**
 * End-of-run rewards and stats display
 */
export class RewardsScreen {
    constructor() {
        /** @type {Object|null} Run data */
        this.runData = null;

        /** @type {number} Animation timer */
        this.animTimer = 0;

        /** @type {boolean} Whether prompt is visible */
        this.showPrompt = true;
    }

    /**
     * Shows the rewards screen with run data
     * @param {Object} runData - Run results
     * @param {boolean} runData.extracted - Whether player extracted
     * @param {number} runData.extractionTime - Time of extraction (if extracted)
     * @param {number} runData.timeSurvived - Total time survived
     * @param {number} runData.level - Player level reached
     * @param {number} runData.kills - Enemies killed
     */
    show(runData) {
        this.runData = { ...runData };

        // Calculate and grant gold if extracted
        if (runData.extracted) {
            const goldEarned = this.calculateGold(runData.extractionTime);
            playerProfile.addGold(goldEarned);
            this.runData.goldEarned = goldEarned;
        } else {
            this.runData.goldEarned = 0;
        }

        // Record run stats
        playerProfile.recordRun(
            runData.kills,
            runData.timeSurvived,
            runData.level
        );

        console.log('Rewards screen:', this.runData);
    }

    /**
     * Calculates gold based on extraction time
     * @param {number} extractionTime - Time of extraction in seconds
     * @returns {number} Gold earned
     */
    calculateGold(extractionTime) {
        if (extractionTime < 130) {         // ~2:00
            return 50;
        } else if (extractionTime < 220) {  // ~3:30
            return 100;
        } else {                            // ~5:00+
            return 200;
        }
    }

    /**
     * Handles key input
     * @param {string} key - Key code
     * @returns {boolean} Whether to continue (transition to title)
     */
    handleKey(key) {
        if (key === 'Space' || key === 'KeyR') {
            return true;
        }
        return false;
    }

    /**
     * Updates animation
     * @param {number} deltaTime
     */
    update(deltaTime) {
        this.animTimer += deltaTime;
        if (this.animTimer >= 0.5) {
            this.animTimer = 0;
            this.showPrompt = !this.showPrompt;
        }
    }

    /**
     * Renders the rewards screen
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    render(ctx, width, height) {
        if (!this.runData) return;

        const centerX = width / 2;

        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, width, height);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Title
        const title = this.runData.extracted ? 'EXTRACTION SUCCESSFUL' : 'SIGNAL LOST';
        const titleColor = this.runData.extracted ? '#00ff00' : '#ff3333';

        ctx.shadowColor = titleColor;
        ctx.shadowBlur = 20;
        ctx.font = 'bold 36px monospace';
        ctx.fillStyle = titleColor;
        ctx.fillText(title, centerX, 80);
        ctx.shadowBlur = 0;

        // Mission Report header
        ctx.font = '20px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('═══ MISSION REPORT ═══', centerX, 150);

        // Stats
        const statsY = 200;
        const lineHeight = 35;
        ctx.font = '18px monospace';
        ctx.fillStyle = '#aaaaaa';

        // Time survived
        const minutes = Math.floor(this.runData.timeSurvived / 60);
        const seconds = Math.floor(this.runData.timeSurvived % 60);
        ctx.fillText(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`, centerX, statsY);

        // Level
        ctx.fillText(`Level Reached: ${this.runData.level}`, centerX, statsY + lineHeight);

        // Kills
        ctx.fillText(`Enemies Eliminated: ${this.runData.kills}`, centerX, statsY + lineHeight * 2);

        // Gold earned (larger, highlighted)
        const goldY = statsY + lineHeight * 3.5;
        const goldColor = this.runData.goldEarned > 0 ? '#ffcc00' : '#ff3333';
        ctx.font = 'bold 28px monospace';
        ctx.fillStyle = goldColor;
        ctx.shadowColor = goldColor;
        ctx.shadowBlur = 10;
        ctx.fillText(`Gold Earned: ${this.runData.goldEarned}`, centerX, goldY);
        ctx.shadowBlur = 0;

        // Total gold
        ctx.font = '20px monospace';
        ctx.fillStyle = '#00ffff';
        ctx.fillText(`Total Gold: ${playerProfile.getGold()}`, centerX, goldY + 45);

        // Continue prompt (blinking)
        if (this.showPrompt) {
            ctx.font = '16px monospace';
            ctx.fillStyle = '#666666';
            ctx.fillText('PRESS [SPACE] TO CONTINUE', centerX, height - 60);
        }
    }
}
