/**
 * Loadout Screen UI
 * Pre-run weapon and passive selection with mouse support
 * @module ui/LoadoutScreen
 */

import { WEAPON_TYPES } from '../config/WeaponConfig.js';
import { PassiveConfig } from '../config/PassiveConfig.js';

/**
 * Loadout selection before starting a run
 */
export class LoadoutScreen {
    constructor() {
        /** @type {string} Active category */
        this.selectedCategory = 'weapon';

        /** @type {number} Weapon selection index */
        this.selectedWeaponIndex = 0;

        /** @type {number} Passive selection index */
        this.selectedPassiveIndex = 0;

        /** @type {Array} Available starting weapons */
        this.weaponOptions = [
            {
                id: 'magic_wand',
                name: 'Magic Wand',
                symbol: WEAPON_TYPES.MAGIC_WAND.symbol,
                color: WEAPON_TYPES.MAGIC_WAND.color,
                desc: 'Auto-targets nearest enemy'
            },
            {
                id: 'knife',
                name: 'Throwing Knife',
                symbol: WEAPON_TYPES.KNIFE.symbol,
                color: WEAPON_TYPES.KNIFE.color,
                desc: 'Fires in movement direction'
            },
            {
                id: 'garlic',
                name: 'Garlic Aura',
                symbol: WEAPON_TYPES.GARLIC.symbol,
                color: WEAPON_TYPES.GARLIC.color,
                desc: 'Damage field around player'
            }
        ];

        /** @type {Array} Available starting passives */
        this.passiveOptions = [
            {
                id: 'wings',
                name: 'Wings',
                symbol: PassiveConfig.WINGS.symbol,
                color: PassiveConfig.WINGS.color,
                desc: '+15% Movement Speed'
            },
            {
                id: 'vigor',
                name: 'Vigor',
                symbol: PassiveConfig.VIGOR.symbol,
                color: PassiveConfig.VIGOR.color,
                desc: '+30 Max Health'
            }
        ];

        /** @type {number} Animation timer */
        this.animTimer = 0;

        /** @type {Array} Weapon hitboxes for mouse */
        this.weaponHitboxes = [];

        /** @type {Array} Passive hitboxes for mouse */
        this.passiveHitboxes = [];

        /** @type {{x: number, y: number, width: number, height: number}|null} Confirm button */
        this.confirmButton = null;

        /** @type {{x: number, y: number, width: number, height: number}|null} Cancel button */
        this.cancelButton = null;

        /** @type {number} Hovered button */
        this.hoveredButton = null;
    }

    /**
     * Resets loadout screen state
     */
    reset() {
        this.selectedCategory = 'weapon';
        this.selectedWeaponIndex = 0;
        this.selectedPassiveIndex = 0;
        this.hoveredButton = null;
    }

    /**
     * Handles mouse click
     * @param {number} mouseX
     * @param {number} mouseY
     * @returns {Object|string|null}
     */
    handleClick(mouseX, mouseY) {
        // Check weapon options
        for (let i = 0; i < this.weaponHitboxes.length; i++) {
            const hb = this.weaponHitboxes[i];
            if (mouseX >= hb.x && mouseX <= hb.x + hb.width &&
                mouseY >= hb.y && mouseY <= hb.y + hb.height) {
                this.selectedCategory = 'weapon';
                this.selectedWeaponIndex = i;
                return null;
            }
        }

        // Check passive options
        for (let i = 0; i < this.passiveHitboxes.length; i++) {
            const hb = this.passiveHitboxes[i];
            if (mouseX >= hb.x && mouseX <= hb.x + hb.width &&
                mouseY >= hb.y && mouseY <= hb.y + hb.height) {
                this.selectedCategory = 'passive';
                this.selectedPassiveIndex = i;
                return null;
            }
        }

        // Check confirm button
        if (this.confirmButton) {
            const cb = this.confirmButton;
            if (mouseX >= cb.x && mouseX <= cb.x + cb.width &&
                mouseY >= cb.y && mouseY <= cb.y + cb.height) {
                return this.confirmLoadout();
            }
        }

        // Check cancel button
        if (this.cancelButton) {
            const cb = this.cancelButton;
            if (mouseX >= cb.x && mouseX <= cb.x + cb.width &&
                mouseY >= cb.y && mouseY <= cb.y + cb.height) {
                return 'cancel';
            }
        }

        return null;
    }

    /**
     * Handles key input
     * @param {string} key - Key code
     * @returns {Object|string|null} Loadout object, 'cancel', or null
     */
    handleKey(key) {
        // Tab to switch category
        if (key === 'Tab') {
            this.selectedCategory = this.selectedCategory === 'weapon' ? 'passive' : 'weapon';
            return null;
        }

        // Navigate left/right
        if (key === 'KeyA' || key === 'ArrowLeft') {
            this.navigateLeft();
            return null;
        }
        if (key === 'KeyD' || key === 'ArrowRight') {
            this.navigateRight();
            return null;
        }

        // Confirm selection
        if (key === 'Space' || key === 'Enter') {
            return this.confirmLoadout();
        }

        // Cancel
        if (key === 'Escape') {
            return 'cancel';
        }

        return null;
    }

    navigateLeft() {
        if (this.selectedCategory === 'weapon') {
            this.selectedWeaponIndex = (this.selectedWeaponIndex - 1 + this.weaponOptions.length) % this.weaponOptions.length;
        } else {
            this.selectedPassiveIndex = (this.selectedPassiveIndex - 1 + this.passiveOptions.length) % this.passiveOptions.length;
        }
    }

    navigateRight() {
        if (this.selectedCategory === 'weapon') {
            this.selectedWeaponIndex = (this.selectedWeaponIndex + 1) % this.weaponOptions.length;
        } else {
            this.selectedPassiveIndex = (this.selectedPassiveIndex + 1) % this.passiveOptions.length;
        }
    }

    confirmLoadout() {
        const weapon = this.weaponOptions[this.selectedWeaponIndex];
        const passive = this.passiveOptions[this.selectedPassiveIndex];

        console.log('Loadout confirmed:', weapon.id, passive.id);

        return {
            weaponId: weapon.id,
            passiveId: passive.id
        };
    }

    /**
     * Updates animation
     * @param {number} deltaTime
     */
    update(deltaTime) {
        this.animTimer += deltaTime;
    }

    /**
     * Renders the loadout screen
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} width
     * @param {number} height
     */
    render(ctx, width, height) {
        const centerX = width / 2;

        // Reset hitboxes
        this.weaponHitboxes = [];
        this.passiveHitboxes = [];

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
        ctx.font = 'bold 36px monospace';
        ctx.fillStyle = '#00ffff';
        ctx.fillText('MISSION LOADOUT', centerX, 50);
        ctx.shadowBlur = 0;

        ctx.font = '16px monospace';
        ctx.fillStyle = '#666666';
        ctx.fillText('Select your starting equipment', centerX, 85);

        // Weapon selection
        this.renderWeaponSelection(ctx, centerX, 140, width);

        // Passive selection
        this.renderPassiveSelection(ctx, centerX, 340, width);

        // Buttons
        this.renderButtons(ctx, centerX, height);

        // Controls hint
        ctx.font = '12px monospace';
        ctx.fillStyle = '#333333';
        ctx.fillText('[TAB] Switch   [A/D] Navigate   [SPACE] Confirm   [ESC] Cancel', centerX, height - 15);
    }

    renderWeaponSelection(ctx, centerX, startY, width) {
        const isActive = this.selectedCategory === 'weapon';
        const headerColor = isActive ? '#ffff00' : '#555555';

        // Header
        ctx.font = 'bold 24px monospace';
        ctx.fillStyle = headerColor;
        ctx.fillText('WEAPON', centerX, startY);

        // Options
        const spacing = 200;
        const baseX = centerX - spacing;

        this.weaponOptions.forEach((weapon, i) => {
            const x = baseX + i * spacing;
            const y = startY + 80;
            const isSelected = i === this.selectedWeaponIndex;

            // Store hitbox
            this.weaponHitboxes.push({ x: x - 80, y: y - 50, width: 160, height: 110 });

            // Brackets for selected item
            if (isSelected) {
                ctx.font = 'bold 48px monospace';
                ctx.fillStyle = '#ffff00';
                ctx.fillText('[', x - 55, y - 5);
                ctx.fillText(']', x + 55, y - 5);
            }

            // Symbol
            ctx.font = 'bold 36px monospace';
            ctx.fillStyle = weapon.color;
            ctx.fillText(weapon.symbol, x, y - 10);

            // Name
            ctx.font = '14px monospace';
            ctx.fillStyle = isSelected ? '#ffffff' : '#666666';
            ctx.fillText(weapon.name, x, y + 35);

            // Description
            ctx.font = '11px monospace';
            ctx.fillStyle = isSelected ? '#aaaaaa' : '#444444';
            ctx.fillText(weapon.desc, x, y + 55);
        });
    }

    renderPassiveSelection(ctx, centerX, startY, width) {
        const isActive = this.selectedCategory === 'passive';
        const headerColor = isActive ? '#ffff00' : '#555555';

        // Header
        ctx.font = 'bold 24px monospace';
        ctx.fillStyle = headerColor;
        ctx.fillText('PASSIVE', centerX, startY);

        // Options
        const spacing = 200;
        const baseX = centerX - spacing / 2;

        this.passiveOptions.forEach((passive, i) => {
            const x = baseX + i * spacing;
            const y = startY + 80;
            const isSelected = i === this.selectedPassiveIndex;

            // Store hitbox
            this.passiveHitboxes.push({ x: x - 80, y: y - 50, width: 160, height: 110 });

            // Brackets for selected item
            if (isSelected) {
                ctx.font = 'bold 48px monospace';
                ctx.fillStyle = '#ffff00';
                ctx.fillText('[', x - 55, y - 5);
                ctx.fillText(']', x + 55, y - 5);
            }

            // Symbol
            ctx.font = 'bold 36px monospace';
            ctx.fillStyle = passive.color;
            ctx.fillText(passive.symbol, x, y - 10);

            // Name
            ctx.font = '14px monospace';
            ctx.fillStyle = isSelected ? '#ffffff' : '#666666';
            ctx.fillText(passive.name, x, y + 35);

            // Description
            ctx.font = '11px monospace';
            ctx.fillStyle = isSelected ? '#aaaaaa' : '#444444';
            ctx.fillText(passive.desc, x, y + 55);
        });
    }

    renderButtons(ctx, centerX, height) {
        const buttonY = height - 60;
        const buttonWidth = 150;
        const buttonHeight = 30;

        // Confirm button
        const confirmX = centerX - 90;
        this.confirmButton = { x: confirmX - buttonWidth / 2, y: buttonY - buttonHeight / 2, width: buttonWidth, height: buttonHeight };

        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.confirmButton.x, this.confirmButton.y, buttonWidth, buttonHeight);
        ctx.font = '16px monospace';
        ctx.fillStyle = '#00ff00';
        ctx.fillText('[ CONFIRM ]', confirmX, buttonY);

        // Cancel button
        const cancelX = centerX + 90;
        this.cancelButton = { x: cancelX - buttonWidth / 2, y: buttonY - buttonHeight / 2, width: buttonWidth, height: buttonHeight };

        ctx.strokeStyle = '#ff6666';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.cancelButton.x, this.cancelButton.y, buttonWidth, buttonHeight);
        ctx.fillStyle = '#ff6666';
        ctx.fillText('[ CANCEL ]', cancelX, buttonY);
    }
}
