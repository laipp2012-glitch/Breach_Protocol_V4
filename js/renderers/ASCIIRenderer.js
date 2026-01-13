/**
 * ASCII Renderer Implementation
 * Renders all game entities using ASCII characters
 * This is the MVP renderer for Phases 1-6
 * @module renderers/ASCIIRenderer
 */

import { IRenderer } from './IRenderer.js';
import { GAME_CONFIG } from '../config/GameConfig.js';

/**
 * ASCII-based renderer that draws entities as text characters
 * @extends IRenderer
 */
export class ASCIIRenderer extends IRenderer {
    /**
     * Creates a new ASCIIRenderer instance
     */
    constructor() {
        super();
    }

    /**
     * Draws the player as the @ symbol
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} radius - Player radius
     * @param {Object} state - Player state
     */
    drawPlayer(ctx, x, y, radius, state) {
        ctx.save();

        ctx.font = GAME_CONFIG.FONTS.PLAYER;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Flash red when damaged, otherwise green
        if (state.damaged || state.invulnerable) {
            // Flicker effect when invulnerable
            const visible = state.invulnerable ? Math.floor(Date.now() / 100) % 2 === 0 : true;
            ctx.fillStyle = visible ? GAME_CONFIG.COLORS.PLAYER_DAMAGED : 'transparent';
        } else {
            ctx.fillStyle = GAME_CONFIG.COLORS.PLAYER;
        }

        ctx.fillText(GAME_CONFIG.ASCII.PLAYER, x, y);

        ctx.restore();
    }

    /**
     * Draws an enemy with type-specific character
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} radius - Enemy radius
     * @param {string} type - Enemy type
     * @param {number} healthPercent - Health percentage (0-1)
     */
    drawEnemy(ctx, x, y, radius, type, healthPercent) {
        ctx.save();

        // Select character and appearance based on enemy type
        let char, font, color;

        switch (type) {
            case 'tank':
                char = GAME_CONFIG.ASCII.ENEMY_TANK;
                font = GAME_CONFIG.FONTS.ENEMY_TANK;
                color = GAME_CONFIG.COLORS.ENEMY_TANK;
                break;
            case 'fast':
                char = GAME_CONFIG.ASCII.ENEMY_FAST;
                font = GAME_CONFIG.FONTS.ENEMY_FAST;
                color = GAME_CONFIG.COLORS.ENEMY_FAST;
                break;
            case 'basic':
            default:
                char = GAME_CONFIG.ASCII.ENEMY_BASIC;
                font = GAME_CONFIG.FONTS.ENEMY;
                color = GAME_CONFIG.COLORS.ENEMY_BASIC;
                break;
        }

        ctx.font = font;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = color;

        ctx.fillText(char, x, y);

        ctx.restore();
    }

    /**
     * Draws a projectile as an ASCII character
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} radius - Projectile radius
     * @param {string} type - Projectile/weapon type
     */
    drawProjectile(ctx, x, y, radius, type) {
        ctx.save();

        let char, color;

        // Select character and color based on weapon type
        switch (type) {
            case 'knife':
                char = GAME_CONFIG.ASCII.PROJECTILE_KNIFE;
                color = GAME_CONFIG.COLORS.PROJECTILE_KNIFE;
                break;
            case 'garlic':
                char = GAME_CONFIG.ASCII.PROJECTILE_GARLIC;
                color = GAME_CONFIG.COLORS.PROJECTILE_GARLIC;
                break;
            case 'magic_wand':
            default:
                char = GAME_CONFIG.ASCII.PROJECTILE;
                color = GAME_CONFIG.COLORS.PROJECTILE;
                break;
        }

        ctx.font = GAME_CONFIG.FONTS.PROJECTILE;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = color;

        ctx.fillText(char, x, y);

        ctx.restore();
    }

    /**
     * Draws a pickup (XP gem, health, etc.)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} radius - Pickup radius
     * @param {string} type - Pickup type
     * @param {number} value - Pickup value
     */
    drawPickup(ctx, x, y, radius, type, value) {
        ctx.save();

        let char, color, font;

        switch (type) {
            case 'health':
                char = GAME_CONFIG.ASCII.HEALTH_PICKUP;
                color = GAME_CONFIG.COLORS.HEALTH_PICKUP;
                font = GAME_CONFIG.FONTS.PICKUP;
                break;
            case 'xp':
            default:
                // Use larger character for higher value XP
                char = value > 5 ? GAME_CONFIG.ASCII.XP_GEM_LARGE : GAME_CONFIG.ASCII.XP_GEM_SMALL;
                color = GAME_CONFIG.COLORS.XP_GEM;
                font = value > 5 ? GAME_CONFIG.FONTS.PICKUP_LARGE : GAME_CONFIG.FONTS.PICKUP;
                break;
        }

        ctx.font = font;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = color;

        ctx.fillText(char, x, y);

        ctx.restore();
    }

    /**
     * Draws a particle effect
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} type - Particle type
     * @param {number} progress - Animation progress (0-1)
     * @param {Object} data - Additional particle data
     */
    drawParticle(ctx, x, y, type, progress, data = {}) {
        ctx.save();

        const alpha = 1 - progress;

        switch (type) {
            case 'death':
                // Expanding X pattern
                ctx.font = `${12 + progress * 10}px monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
                ctx.fillText('X', x, y);
                break;

            case 'damage':
                // Float up damage number
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.fillText(`-${data.amount || 0}`, x, y - progress * 30);
                break;

            case 'xp_collect':
                // Small sparkle effect
                ctx.font = `${8 + progress * 6}px monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
                ctx.fillText('+', x, y - progress * 20);
                break;

            default:
                // Generic fade out
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.fillText('*', x, y);
        }

        ctx.restore();
    }

    /**
     * Draws the background with a subtle grid pattern
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {Object} camera - Camera offset
     */
    drawBackground(ctx, width, height, camera = { x: 0, y: 0 }) {
        // Dark background fill
        ctx.fillStyle = GAME_CONFIG.COLORS.BACKGROUND;
        ctx.fillRect(0, 0, width, height);

        // Draw subtle grid
        ctx.strokeStyle = GAME_CONFIG.COLORS.GRID;
        ctx.lineWidth = GAME_CONFIG.GRID.LINE_WIDTH;

        const gridSize = GAME_CONFIG.GRID.SIZE;

        // Calculate grid offset based on camera position for parallax effect
        const offsetX = -(camera.x % gridSize);
        const offsetY = -(camera.y % gridSize);

        // Vertical lines
        for (let x = offsetX; x <= width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Horizontal lines
        for (let y = offsetY; y <= height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }

    /**
     * Draws damage number floating text
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} damage - Damage value
     * @param {number} progress - Animation progress
     */
    drawDamageNumber(ctx, x, y, damage, progress) {
        ctx.save();

        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const alpha = 1 - progress;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;

        ctx.fillText(`-${damage}`, x, y - progress * 30);

        ctx.restore();
    }
}
