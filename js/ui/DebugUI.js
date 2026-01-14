/**
 * Debug UI - In-game debug menu for testing
 * Access with mouse click on debug button
 * @module ui/DebugUI
 */

import { WEAPON_TYPES, createWeapon } from '../config/WeaponConfig.js';
import { PassiveConfig } from '../config/PassiveConfig.js';
import { GAME_CONFIG } from '../config/GameConfig.js';

/**
 * Debug menu UI component
 */
export class DebugUI {
    /**
     * Creates a new DebugUI
     * @param {HTMLCanvasElement} canvas - The game canvas
     */
    constructor(canvas) {
        /** @type {HTMLCanvasElement} */
        this.canvas = canvas;

        /** @type {CanvasRenderingContext2D} */
        this.ctx = canvas.getContext('2d');

        /** @type {boolean} Whether debug panel is open */
        this.isOpen = false;

        /** @type {number} Current tab (0=Weapons, 1=Passives, 2=Cheats) */
        this.currentTab = 0;

        /** @type {number} Scroll offset for lists */
        this.scrollOffset = 0;

        /** @type {Array} Clickable regions for hit detection */
        this.clickRegions = [];

        // Debug button position (bottom-left corner)
        this.buttonX = 10;
        this.buttonY = canvas.height - 60;
        this.buttonWidth = 60;
        this.buttonHeight = 20;

        // Panel dimensions
        this.panelX = 10;
        this.panelY = 100;
        this.panelWidth = 280;
        this.panelHeight = 350;

        // Bind event handlers
        this._handleClick = this._handleClick.bind(this);
        this._handleWheel = this._handleWheel.bind(this);

        // Attach click listener
        canvas.addEventListener('click', this._handleClick);
        canvas.addEventListener('wheel', this._handleWheel);
    }

    /**
     * Renders the debug button and panel
     * @param {Object} game - Game instance for state access  
     */
    render(game) {
        const ctx = this.ctx;

        // Always draw debug toggle button
        this._drawDebugButton(ctx);

        // Draw panel if open
        if (this.isOpen) {
            this._drawPanel(ctx, game);
        }
    }

    /**
     * Draws the debug toggle button
     */
    _drawDebugButton(ctx) {
        ctx.save();

        // Button background
        ctx.fillStyle = this.isOpen ? '#44aa44' : '#444444';
        ctx.fillRect(this.buttonX, this.buttonY, this.buttonWidth, this.buttonHeight);

        // Button border
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.buttonX, this.buttonY, this.buttonWidth, this.buttonHeight);

        // Button text
        ctx.font = '10px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('DEBUG', this.buttonX + this.buttonWidth / 2, this.buttonY + this.buttonHeight / 2);

        ctx.restore();
    }

    /**
     * Draws the debug panel
     */
    _drawPanel(ctx, game) {
        ctx.save();
        this.clickRegions = [];

        // Panel background
        ctx.fillStyle = 'rgba(20, 20, 30, 0.95)';
        ctx.fillRect(this.panelX, this.panelY, this.panelWidth, this.panelHeight);

        // Panel border
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.panelX, this.panelY, this.panelWidth, this.panelHeight);

        // Title
        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = '#00ff00';
        ctx.textAlign = 'center';
        ctx.fillText('≡ DEBUG CONSOLE ≡', this.panelX + this.panelWidth / 2, this.panelY + 20);

        // Draw tabs
        this._drawTabs(ctx);

        // Draw content based on tab
        const contentY = this.panelY + 60;
        const contentHeight = this.panelHeight - 80;

        switch (this.currentTab) {
            case 0:
                this._drawWeaponsTab(ctx, game, contentY, contentHeight);
                break;
            case 1:
                this._drawPassivesTab(ctx, game, contentY, contentHeight);
                break;
            case 2:
                this._drawCheatsTab(ctx, game, contentY, contentHeight);
                break;
        }

        ctx.restore();
    }

    /**
     * Draws tab buttons
     */
    _drawTabs(ctx) {
        const tabs = ['Weapons', 'Passives', 'Cheats'];
        const tabWidth = 80;
        const tabHeight = 22;
        const startX = this.panelX + 15;
        const tabY = this.panelY + 35;

        tabs.forEach((tab, i) => {
            const x = startX + i * (tabWidth + 5);
            const isActive = this.currentTab === i;

            // Tab background
            ctx.fillStyle = isActive ? '#336633' : '#333333';
            ctx.fillRect(x, tabY, tabWidth, tabHeight);

            // Tab border
            ctx.strokeStyle = isActive ? '#00ff00' : '#666666';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, tabY, tabWidth, tabHeight);

            // Tab text
            ctx.font = '11px monospace';
            ctx.fillStyle = isActive ? '#00ff00' : '#aaaaaa';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(tab, x + tabWidth / 2, tabY + tabHeight / 2);

            // Register click region
            this.clickRegions.push({
                x, y: tabY, width: tabWidth, height: tabHeight,
                action: 'tab',
                data: i
            });
        });
    }

    /**
     * Draws weapons tab content
     */
    _drawWeaponsTab(ctx, game, startY, height) {
        const weapons = Object.values(WEAPON_TYPES);
        const itemHeight = 28;
        const x = this.panelX + 15;
        const width = this.panelWidth - 30;

        ctx.font = '10px monospace';

        weapons.forEach((weapon, i) => {
            const y = startY + i * itemHeight - this.scrollOffset;

            // Skip if outside visible area
            if (y < startY - itemHeight || y > startY + height) return;

            // Check if player has this weapon
            const hasWeapon = game.player.weapons.some(w => w.id === weapon.id);
            const playerWeapon = game.player.weapons.find(w => w.id === weapon.id);

            // Item background
            ctx.fillStyle = hasWeapon ? '#223322' : '#222222';
            ctx.fillRect(x, y, width, itemHeight - 2);

            // Item border
            ctx.strokeStyle = hasWeapon ? '#448844' : '#444444';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, width, itemHeight - 2);

            // Weapon name
            ctx.fillStyle = hasWeapon ? '#88ff88' : '#cccccc';
            ctx.textAlign = 'left';
            ctx.fillText(weapon.name, x + 8, y + 10);

            // Level indicator
            if (hasWeapon) {
                ctx.fillStyle = '#aaaaaa';
                ctx.fillText(`Lv.${playerWeapon.level}/${weapon.maxLevel}`, x + 8, y + 22);
            }

            // Action button
            const btnWidth = 50;
            const btnX = x + width - btnWidth - 5;
            const btnY = y + 4;
            const btnHeight = itemHeight - 10;

            ctx.fillStyle = hasWeapon ? '#335533' : '#333355';
            ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
            ctx.strokeStyle = hasWeapon ? '#66aa66' : '#6666aa';
            ctx.strokeRect(btnX, btnY, btnWidth, btnHeight);

            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(hasWeapon ? 'LVL UP' : 'ADD', btnX + btnWidth / 2, btnY + btnHeight / 2 + 3);

            // Register click region
            this.clickRegions.push({
                x: btnX, y: btnY, width: btnWidth, height: btnHeight,
                action: hasWeapon ? 'upgradeWeapon' : 'addWeapon',
                data: weapon.id
            });
        });
    }

    /**
     * Draws passives tab content
     */
    _drawPassivesTab(ctx, game, startY, height) {
        const passives = Object.values(PassiveConfig);
        const itemHeight = 28;
        const x = this.panelX + 15;
        const width = this.panelWidth - 30;

        ctx.font = '10px monospace';

        passives.forEach((passive, i) => {
            const y = startY + i * itemHeight - this.scrollOffset;

            // Skip if outside visible area
            if (y < startY - itemHeight || y > startY + height) return;

            // Check if player has this passive
            const hasPassive = game.player.passiveItems.some(p => p.id === passive.id);
            const playerPassive = game.player.passiveItems.find(p => p.id === passive.id);

            // Item background
            ctx.fillStyle = hasPassive ? '#223322' : '#222222';
            ctx.fillRect(x, y, width, itemHeight - 2);

            // Item border
            ctx.strokeStyle = hasPassive ? '#448844' : '#444444';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, width, itemHeight - 2);

            // Passive symbol and name
            ctx.fillStyle = passive.color;
            ctx.textAlign = 'left';
            ctx.fillText(passive.symbol, x + 8, y + 14);

            ctx.fillStyle = hasPassive ? '#88ff88' : '#cccccc';
            ctx.fillText(passive.name, x + 22, y + 10);

            // Level indicator
            if (hasPassive) {
                ctx.fillStyle = '#aaaaaa';
                ctx.fillText(`Lv.${playerPassive.level}/${passive.maxLevel}`, x + 22, y + 22);
            }

            // Action button
            const btnWidth = 50;
            const btnX = x + width - btnWidth - 5;
            const btnY = y + 4;
            const btnHeight = itemHeight - 10;

            ctx.fillStyle = hasPassive ? '#335533' : '#333355';
            ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
            ctx.strokeStyle = hasPassive ? '#66aa66' : '#6666aa';
            ctx.strokeRect(btnX, btnY, btnWidth, btnHeight);

            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(hasPassive ? 'LVL UP' : 'ADD', btnX + btnWidth / 2, btnY + btnHeight / 2 + 3);

            // Register click region
            this.clickRegions.push({
                x: btnX, y: btnY, width: btnWidth, height: btnHeight,
                action: hasPassive ? 'upgradePassive' : 'addPassive',
                data: passive.id
            });
        });
    }

    /**
     * Draws cheats tab content
     */
    _drawCheatsTab(ctx, game, startY, height) {
        const x = this.panelX + 15;
        const width = this.panelWidth - 30;
        let y = startY;

        ctx.font = '11px monospace';
        ctx.textAlign = 'left';

        // God Mode Toggle
        const godMode = GAME_CONFIG.DEBUG.GOD_MODE;
        ctx.fillStyle = godMode ? '#223322' : '#222222';
        ctx.fillRect(x, y, width, 30);
        ctx.strokeStyle = godMode ? '#00ff00' : '#444444';
        ctx.strokeRect(x, y, width, 30);

        ctx.fillStyle = godMode ? '#00ff00' : '#cccccc';
        ctx.fillText('God Mode', x + 10, y + 12);
        ctx.fillStyle = '#888888';
        ctx.fillText('Invincible to all damage', x + 10, y + 24);

        // Toggle indicator
        ctx.fillStyle = godMode ? '#00ff00' : '#666666';
        ctx.fillText(godMode ? '[ON]' : '[OFF]', x + width - 40, y + 18);

        this.clickRegions.push({
            x, y, width, height: 30,
            action: 'toggleGodMode',
            data: null
        });

        y += 40;

        // XP Injection buttons
        ctx.fillStyle = '#cccccc';
        ctx.fillText('Inject XP:', x + 10, y + 12);

        const xpAmounts = [10, 50, 100, 500];
        const btnWidth = 50;
        let btnX = x + 80;

        xpAmounts.forEach(amount => {
            ctx.fillStyle = '#333355';
            ctx.fillRect(btnX, y, btnWidth, 22);
            ctx.strokeStyle = '#6666aa';
            ctx.strokeRect(btnX, y, btnWidth, 22);

            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(`+${amount}`, btnX + btnWidth / 2, y + 14);

            this.clickRegions.push({
                x: btnX, y, width: btnWidth, height: 22,
                action: 'injectXP',
                data: amount
            });

            btnX += btnWidth + 5;
        });

        y += 35;

        // Level Up button
        ctx.fillStyle = '#553333';
        ctx.fillRect(x, y, width, 28);
        ctx.strokeStyle = '#aa6666';
        ctx.strokeRect(x, y, width, 28);

        ctx.fillStyle = '#ffff00';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ INSTANT LEVEL UP ⚡', x + width / 2, y + 18);

        this.clickRegions.push({
            x, y, width, height: 28,
            action: 'levelUp',
            data: null
        });

        y += 38;

        // Kill all enemies button
        ctx.fillStyle = '#553333';
        ctx.fillRect(x, y, width, 28);
        ctx.strokeStyle = '#aa6666';
        ctx.strokeRect(x, y, width, 28);

        ctx.fillStyle = '#ff4444';
        ctx.textAlign = 'center';
        ctx.fillText('💀 KILL ALL ENEMIES 💀', x + width / 2, y + 18);

        this.clickRegions.push({
            x, y, width, height: 28,
            action: 'killAllEnemies',
            data: null
        });

        y += 38;

        // Full heal button
        ctx.fillStyle = '#335533';
        ctx.fillRect(x, y, width, 28);
        ctx.strokeStyle = '#66aa66';
        ctx.strokeRect(x, y, width, 28);

        ctx.fillStyle = '#00ff00';
        ctx.textAlign = 'center';
        ctx.fillText('❤ FULL HEAL ❤', x + width / 2, y + 18);

        this.clickRegions.push({
            x, y, width, height: 28,
            action: 'fullHeal',
            data: null
        });

        y += 38;

        // Stats display
        ctx.font = '10px monospace';
        ctx.fillStyle = '#666666';
        ctx.textAlign = 'left';
        ctx.fillText(`Player Level: ${game.player.level}`, x + 10, y + 10);
        ctx.fillText(`XP: ${game.player.experience}/${game.experienceSystem.xpForLevel(game.player.level)}`, x + 10, y + 22);
        ctx.fillText(`Enemies: ${game.gameState.enemies.length}`, x + 10, y + 34);
        ctx.fillText(`Weapons: ${game.player.weapons.length}/${GAME_CONFIG.INVENTORY.MAX_WEAPONS}`, x + 130, y + 10);
        ctx.fillText(`Passives: ${game.player.passiveItems.length}/${GAME_CONFIG.INVENTORY.MAX_PASSIVES}`, x + 130, y + 22);
    }

    /**
     * Handles mouse click events
     */
    _handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Check debug button click
        if (x >= this.buttonX && x <= this.buttonX + this.buttonWidth &&
            y >= this.buttonY && y <= this.buttonY + this.buttonHeight) {
            this.isOpen = !this.isOpen;
            this.scrollOffset = 0;
            return;
        }

        // If panel is open, check click regions
        if (this.isOpen) {
            for (const region of this.clickRegions) {
                if (x >= region.x && x <= region.x + region.width &&
                    y >= region.y && y <= region.y + region.height) {
                    this._handleAction(region.action, region.data);
                    return;
                }
            }
        }
    }

    /**
     * Handles scroll wheel for lists
     */
    _handleWheel(event) {
        if (!this.isOpen) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Check if mouse is over panel
        if (x >= this.panelX && x <= this.panelX + this.panelWidth &&
            y >= this.panelY && y <= this.panelY + this.panelHeight) {
            this.scrollOffset += event.deltaY > 0 ? 30 : -30;
            this.scrollOffset = Math.max(0, this.scrollOffset);
            event.preventDefault();
        }
    }

    /**
     * Handles debug actions
     */
    _handleAction(action, data) {
        // Get game instance from window (set in main.js)
        const game = window.game;
        if (!game) return;

        switch (action) {
            case 'tab':
                this.currentTab = data;
                this.scrollOffset = 0;
                break;

            case 'addWeapon':
                game.player.addWeapon(data);
                console.log(`[DEBUG] Added weapon: ${data}`);
                break;

            case 'upgradeWeapon':
                game.player.upgradeWeapon(data);
                console.log(`[DEBUG] Upgraded weapon: ${data}`);
                break;

            case 'addPassive':
                game.player.addPassiveItem(data);
                console.log(`[DEBUG] Added passive: ${data}`);
                break;

            case 'upgradePassive':
                game.player.upgradePassiveItem(data);
                console.log(`[DEBUG] Upgraded passive: ${data}`);
                break;

            case 'toggleGodMode':
                GAME_CONFIG.DEBUG.GOD_MODE = !GAME_CONFIG.DEBUG.GOD_MODE;
                console.log(`[DEBUG] God Mode: ${GAME_CONFIG.DEBUG.GOD_MODE ? 'ON' : 'OFF'}`);
                break;

            case 'injectXP':
                game.player.experience += data;
                console.log(`[DEBUG] Injected ${data} XP`);
                break;

            case 'levelUp':
                game.experienceSystem.triggerLevelUp(game.player);
                console.log(`[DEBUG] Triggered level up`);
                break;

            case 'killAllEnemies':
                let killed = 0;
                for (const enemy of game.gameState.enemies) {
                    if (enemy.alive) {
                        enemy.alive = false;
                        enemy.health = 0;
                        killed++;
                    }
                }
                console.log(`[DEBUG] Killed ${killed} enemies`);
                break;

            case 'fullHeal':
                game.player.health = game.player.getEffectiveMaxHealth();
                console.log(`[DEBUG] Full heal`);
                break;
        }
    }

    /**
     * Cleans up event listeners
     */
    destroy() {
        this.canvas.removeEventListener('click', this._handleClick);
        this.canvas.removeEventListener('wheel', this._handleWheel);
    }
}
