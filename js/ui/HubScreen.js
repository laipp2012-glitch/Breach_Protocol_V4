/**
 * Hub Screen UI
 * Central menu for navigating between runs with mouse support
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
            { text: 'UPGRADES', action: 'upgrades' },
            { text: 'WIPE SAVE', action: 'wipe', color: '#ff6666' }
        ];

        /** @type {boolean} Showing storage submenu */
        this.showingStorage = false;

        /** @type {boolean} Showing upgrades submenu */
        this.showingUpgrades = false;

        /** @type {boolean} Showing wipe confirmation */
        this.showingWipeConfirm = false;

        /** @type {number} Animation timer */
        this.animTimer = 0;

        /** @type {Array} Menu option hitboxes */
        this.optionHitboxes = [];

        /** @type {{x: number, y: number, width: number, height: number}|null} Back button */
        this.backButton = null;

        /** @type {{x: number, y: number, width: number, height: number}|null} Confirm wipe button */
        this.confirmWipeButton = null;

        /** @type {{x: number, y: number, width: number, height: number}|null} Cancel wipe button */
        this.cancelWipeButton = null;

        /** @type {Function|null} Callback when profile is wiped */
        this.onProfileWiped = null;
    }

    /**
     * Resets hub to main menu
     */
    reset() {
        this.selectedOption = 0;
        this.showingStorage = false;
        this.showingUpgrades = false;
        this.showingWipeConfirm = false;
    }

    /**
     * Handles mouse click
     * @param {number} mouseX
     * @param {number} mouseY
     * @returns {string|null}
     */
    handleClick(mouseX, mouseY) {
        // Wipe confirmation dialog
        if (this.showingWipeConfirm) {
            if (this.confirmWipeButton) {
                const b = this.confirmWipeButton;
                if (mouseX >= b.x && mouseX <= b.x + b.width &&
                    mouseY >= b.y && mouseY <= b.y + b.height) {
                    playerProfile.wipeProfile();
                    this.showingWipeConfirm = false;
                    if (this.onProfileWiped) {
                        this.onProfileWiped();
                    }
                    return 'profile_wiped';
                }
            }
            if (this.cancelWipeButton) {
                const b = this.cancelWipeButton;
                if (mouseX >= b.x && mouseX <= b.x + b.width &&
                    mouseY >= b.y && mouseY <= b.y + b.height) {
                    this.showingWipeConfirm = false;
                    return null;
                }
            }
            return null;
        }

        // In submenu - check back button
        if (this.showingStorage || this.showingUpgrades) {
            if (this.backButton) {
                const b = this.backButton;
                if (mouseX >= b.x && mouseX <= b.x + b.width &&
                    mouseY >= b.y && mouseY <= b.y + b.height) {
                    this.showingStorage = false;
                    this.showingUpgrades = false;
                    return null;
                }
            }
            return null;
        }

        // Check menu options
        for (let i = 0; i < this.optionHitboxes.length; i++) {
            const hb = this.optionHitboxes[i];
            if (mouseX >= hb.x && mouseX <= hb.x + hb.width &&
                mouseY >= hb.y && mouseY <= hb.y + hb.height) {
                this.selectedOption = i;
                return this.selectOption();
            }
        }

        return null;
    }

    /**
     * Handles key input
     * @param {string} key - Key code
     * @returns {string|null} Action to take or null
     */
    handleKey(key) {
        // Wipe confirmation dialog
        if (this.showingWipeConfirm) {
            if (key === 'KeyY') {
                playerProfile.wipeProfile();
                this.showingWipeConfirm = false;
                if (this.onProfileWiped) {
                    this.onProfileWiped();
                }
                return 'profile_wiped';
            } else if (key === 'KeyN' || key === 'Escape') {
                this.showingWipeConfirm = false;
            }
            return null;
        }

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

            case 'wipe':
                this.showingWipeConfirm = true;
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

        // Reset hitboxes
        this.optionHitboxes = [];
        this.backButton = null;
        this.confirmWipeButton = null;
        this.cancelWipeButton = null;

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
        const lineHeight = 50;

        this.options.forEach((option, i) => {
            const y = menuStartY + i * lineHeight;
            const isSelected = i === this.selectedOption;

            // Store hitbox
            this.optionHitboxes.push({
                x: centerX - 150,
                y: y - 20,
                width: 300,
                height: 40
            });

            // Option text with brackets for selected
            const optionColor = option.color || (isSelected ? '#ffff00' : '#666666');
            if (isSelected) {
                ctx.font = 'bold 24px monospace';
                ctx.fillStyle = '#ffff00';
                ctx.fillText(`[ ${option.text} ]`, centerX, y);
            } else {
                ctx.font = '20px monospace';
                ctx.fillStyle = optionColor;
                ctx.fillText(option.text, centerX, y);
            }
        });

        // Gold display
        ctx.font = 'bold 24px monospace';
        ctx.fillStyle = '#ffcc00';
        ctx.fillText(`CREDITS: ${playerProfile.getGold()}`, centerX, height - 80);

        // Controls hint
        ctx.font = '12px monospace';
        ctx.fillStyle = '#333333';
        ctx.fillText('[W/S] Navigate   [SPACE] Select   or click options', centerX, height - 40);

        // Wipe confirmation overlay
        if (this.showingWipeConfirm) {
            this.renderWipeConfirm(ctx, width, height);
        }
    }

    /**
     * Renders wipe confirmation dialog
     */
    renderWipeConfirm(ctx, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;

        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, width, height);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Warning title
        ctx.shadowColor = '#ff3333';
        ctx.shadowBlur = 20;
        ctx.font = 'bold 32px monospace';
        ctx.fillStyle = '#ff3333';
        ctx.fillText('⚠ WIPE ALL DATA? ⚠', centerX, centerY - 80);
        ctx.shadowBlur = 0;

        // Warning text
        ctx.font = '18px monospace';
        ctx.fillStyle = '#ffcc00';
        ctx.fillText('This will permanently delete:', centerX, centerY - 30);

        ctx.font = '16px monospace';
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText('• Your character name', centerX, centerY + 5);
        ctx.fillText('• All accumulated gold', centerX, centerY + 30);
        ctx.fillText('• All statistics', centerX, centerY + 55);

        ctx.font = 'bold 18px monospace';
        ctx.fillStyle = '#ff6666';
        ctx.fillText('THIS CANNOT BE UNDONE!', centerX, centerY + 95);

        // Buttons
        const buttonY = centerY + 150;
        const buttonWidth = 120;
        const buttonHeight = 35;

        // Confirm button
        const confirmX = centerX - 80;
        this.confirmWipeButton = { x: confirmX - buttonWidth / 2, y: buttonY - buttonHeight / 2, width: buttonWidth, height: buttonHeight };

        ctx.strokeStyle = '#ff3333';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.confirmWipeButton.x, this.confirmWipeButton.y, buttonWidth, buttonHeight);
        ctx.font = '16px monospace';
        ctx.fillStyle = '#ff3333';
        ctx.fillText('[ Y ] WIPE', confirmX, buttonY);

        // Cancel button
        const cancelX = centerX + 80;
        this.cancelWipeButton = { x: cancelX - buttonWidth / 2, y: buttonY - buttonHeight / 2, width: buttonWidth, height: buttonHeight };

        ctx.strokeStyle = '#66ff66';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.cancelWipeButton.x, this.cancelWipeButton.y, buttonWidth, buttonHeight);
        ctx.fillStyle = '#66ff66';
        ctx.fillText('[ N ] CANCEL', cancelX, buttonY);
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

        // Back button
        const buttonY = height - 60;
        const buttonWidth = 150;
        const buttonHeight = 30;
        this.backButton = { x: centerX - buttonWidth / 2, y: buttonY - buttonHeight / 2, width: buttonWidth, height: buttonHeight };

        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.backButton.x, this.backButton.y, buttonWidth, buttonHeight);
        ctx.font = '16px monospace';
        ctx.fillStyle = '#888888';
        ctx.fillText('[ BACK ]', centerX, buttonY);

        ctx.font = '12px monospace';
        ctx.fillStyle = '#333333';
        ctx.fillText('Press ESC or click', centerX, height - 25);
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

        // Back button
        const buttonY = height - 60;
        const buttonWidth = 150;
        const buttonHeight = 30;
        this.backButton = { x: centerX - buttonWidth / 2, y: buttonY - buttonHeight / 2, width: buttonWidth, height: buttonHeight };

        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.backButton.x, this.backButton.y, buttonWidth, buttonHeight);
        ctx.font = '16px monospace';
        ctx.fillStyle = '#888888';
        ctx.fillText('[ BACK ]', centerX, buttonY);

        ctx.font = '12px monospace';
        ctx.fillStyle = '#333333';
        ctx.fillText('Press ESC or click', centerX, height - 25);
    }
}
