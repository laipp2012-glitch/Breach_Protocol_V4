/**
 * Hub Screen UI
 * Central menu for navigating between runs
 * @module ui/HubScreen
 */

import { playerProfile } from '../systems/PlayerProfile.js';

/**
 * Main hub menu with navigation
 */
export class HubScreen {
    constructor() {
        /** @type {number} Selected menu index */
        this.selectedOption = 0;

        /** @type {Array} Menu options */
        this.options = [
            { text: 'START MISSION', action: 'start' },
            { text: 'STORAGE', action: 'storage' },
            { text: 'UPGRADES', action: 'upgrades' }
        ];

        /** @type {boolean} Showing storage submenu */
        this.showingStorage = false;

        /** @type {boolean} Showing upgrades submenu */
        this.showingUpgrades = false;

        /** @type {number} Animation timer */
        this.animTimer = 0;
    }

    /**
     * Resets hub to main menu
     */
    reset() {
        this.selectedOption = 0;
        this.showingStorage = false;
        this.showingUpgrades = false;
    }

    /**
     * Handles key input
     * @param {string} key - Key code
     * @returns {string|null} Action to take or null
     */
    handleKey(key) {
        // In submenu - ESC to close
        if (this.showingStorage || this.showingUpgrades) {
            if (key === 'Escape') {
                this.showingStorage = false;
                this.showingUpgrades = false;
            }
            return null;
        }

        // Navigate menu
        if (key === 'KeyW' || key === 'ArrowUp') {
            this.selectedOption = (this.selectedOption - 1 + this.options.length) % this.options.length;
        } else if (key === 'KeyS' || key === 'ArrowDown') {
            this.selectedOption = (this.selectedOption + 1) % this.options.length;
        } else if (key === 'Space' || key === 'Enter') {
            return this.selectOption();
        }

        return null;
    }

    /**
     * Executes selected option
     * @returns {string|null} Action or null
     */
    selectOption() {
        const action = this.options[this.selectedOption].action;

        switch (action) {
            case 'start':
                return 'start_run';

            case 'storage':
                this.showingStorage = true;
                return null;

            case 'upgrades':
                this.showingUpgrades = true;
                return null;
        }
        return null;
    }

    /**
     * Updates animation
     * @param {number} deltaTime
     */
    update(deltaTime) {
        this.animTimer += deltaTime;
    }

    /**
     * Renders the hub screen
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} width
     * @param {number} height
     */
    render(ctx, width, height) {
        const centerX = width / 2;

        // Draw submenu if active
        if (this.showingStorage) {
            this.renderStorage(ctx, width, height);
            return;
        }
        if (this.showingUpgrades) {
            this.renderUpgrades(ctx, width, height);
            return;
        }

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

        // Title
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.font = 'bold 48px monospace';
        ctx.fillStyle = '#00ffff';
        ctx.fillText('BREACH PROTOCOL', centerX, 80);

        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 10;
        ctx.font = '24px monospace';
        ctx.fillStyle = '#00ff00';
        ctx.fillText('COMMAND CENTER', centerX, 130);
        ctx.shadowBlur = 0;

        // Player name
        ctx.font = '16px monospace';
        ctx.fillStyle = '#888888';
        ctx.fillText(`Agent: ${playerProfile.getPlayerName()}`, centerX, 170);

        // Menu options
        const menuStartY = 250;
        const lineHeight = 60;

        this.options.forEach((option, i) => {
            const y = menuStartY + i * lineHeight;
            const isSelected = i === this.selectedOption;

            // Selector arrows with pulse
            if (isSelected) {
                const pulse = 0.7 + Math.sin(this.animTimer * 5) * 0.3;
                ctx.globalAlpha = pulse;
                ctx.font = 'bold 24px monospace';
                ctx.fillStyle = '#ffff00';
                ctx.fillText('▶', centerX - 140, y);
                ctx.fillText('◀', centerX + 140, y);
                ctx.globalAlpha = 1;
            }

            // Option text
            ctx.font = isSelected ? 'bold 28px monospace' : '22px monospace';
            ctx.fillStyle = isSelected ? '#ffffff' : '#666666';
            ctx.fillText(option.text, centerX, y);
        });

        // Gold display
        ctx.font = 'bold 24px monospace';
        ctx.fillStyle = '#ffcc00';
        ctx.fillText(`CREDITS: ${playerProfile.getGold()}`, centerX, height - 80);

        // Controls hint
        ctx.font = '14px monospace';
        ctx.fillStyle = '#444444';
        ctx.fillText('[W/S] Navigate   [SPACE] Select', centerX, height - 40);
    }

    /**
     * Renders storage submenu
     */
    renderStorage(ctx, width, height) {
        const centerX = width / 2;

        // Background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Title
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;
        ctx.font = 'bold 36px monospace';
        ctx.fillStyle = '#00ffff';
        ctx.fillText('STORAGE', centerX, 60);
        ctx.shadowBlur = 0;

        // Credits section
        ctx.font = '20px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('═══ CREDITS ═══', centerX, 130);

        ctx.font = 'bold 48px monospace';
        ctx.fillStyle = '#ffcc00';
        ctx.shadowColor = '#ffcc00';
        ctx.shadowBlur = 10;
        ctx.fillText(`${playerProfile.getGold()}`, centerX, 180);
        ctx.shadowBlur = 0;

        // Stats section
        const stats = playerProfile.getStats();
        const statsY = 250;
        const lineHeight = 35;

        ctx.font = '20px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('═══ STATISTICS ═══', centerX, statsY);

        ctx.font = '18px monospace';
        ctx.fillStyle = '#aaaaaa';

        ctx.fillText(`Total Runs: ${stats.totalRuns}`, centerX, statsY + lineHeight);
        ctx.fillText(`Total Kills: ${stats.totalKills}`, centerX, statsY + lineHeight * 2);

        const totalMin = Math.floor(stats.totalTimeAlive / 60);
        ctx.fillText(`Total Time: ${totalMin}m`, centerX, statsY + lineHeight * 3);

        const longestMin = Math.floor(stats.longestRun / 60);
        const longestSec = Math.floor(stats.longestRun % 60);
        ctx.fillText(`Longest Run: ${longestMin}:${longestSec.toString().padStart(2, '0')}`, centerX, statsY + lineHeight * 4);

        ctx.fillText(`Highest Level: ${stats.highestLevel}`, centerX, statsY + lineHeight * 5);

        // Back prompt
        ctx.font = '16px monospace';
        ctx.fillStyle = '#666666';
        ctx.fillText('PRESS [ESC] TO RETURN', centerX, height - 50);
    }

    /**
     * Renders upgrades placeholder submenu
     */
    renderUpgrades(ctx, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;

        // Background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Title
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;
        ctx.font = 'bold 36px monospace';
        ctx.fillStyle = '#00ffff';
        ctx.fillText('UPGRADES', centerX, 60);
        ctx.shadowBlur = 0;

        // Placeholder message
        ctx.font = 'bold 28px monospace';
        ctx.fillStyle = '#ff3333';
        ctx.fillText('SYSTEM OFFLINE', centerX, centerY - 30);

        ctx.font = '18px monospace';
        ctx.fillStyle = '#666666';
        ctx.fillText('This feature will be available', centerX, centerY + 20);
        ctx.fillText('in a future update.', centerX, centerY + 50);

        // Back prompt
        ctx.font = '16px monospace';
        ctx.fillStyle = '#666666';
        ctx.fillText('PRESS [ESC] TO RETURN', centerX, height - 50);
    }
}
