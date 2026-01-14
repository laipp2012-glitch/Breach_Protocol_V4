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
    drawEnemy(ctx, x, y, radius, type, healthPercent, effectOptions = {}) {
        ctx.save();

        // Select character and appearance based on enemy type
        let char, baseFont, color;
        let baseFontSize;

        switch (type) {
            case 'tank':
                char = GAME_CONFIG.ASCII.ENEMY_TANK;
                baseFontSize = 20;
                color = GAME_CONFIG.COLORS.ENEMY_TANK;
                break;
            case 'fast':
                char = GAME_CONFIG.ASCII.ENEMY_FAST;
                baseFontSize = 14;
                color = GAME_CONFIG.COLORS.ENEMY_FAST;
                break;
            case 'ranger':
                char = GAME_CONFIG.ASCII.ENEMY_RANGER;
                baseFontSize = 16;
                color = GAME_CONFIG.COLORS.ENEMY_RANGER;
                break;
            case 'swarm':
                char = GAME_CONFIG.ASCII.ENEMY_SWARM;
                baseFontSize = 18;
                color = GAME_CONFIG.COLORS.ENEMY_SWARM;
                break;
            case 'swarm_mini':
                char = GAME_CONFIG.ASCII.ENEMY_SWARM_MINI;
                baseFontSize = 12;
                color = GAME_CONFIG.COLORS.ENEMY_SWARM_MINI;
                break;
            case 'basic':
            default:
                char = GAME_CONFIG.ASCII.ENEMY_BASIC;
                baseFontSize = 16;
                color = GAME_CONFIG.COLORS.ENEMY_BASIC;
                break;
        }

        // Apply scale effect
        const scale = effectOptions.scale || 1;
        const scaledFontSize = Math.round(baseFontSize * scale);

        ctx.font = `${scaledFontSize}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = color;

        ctx.fillText(char, x, y);

        // Apply flash effect overlay
        const flashAlpha = effectOptions.flashAlpha || 0;
        if (flashAlpha > 0) {
            ctx.globalAlpha = flashAlpha;
            ctx.fillStyle = effectOptions.flashColor || '#FFFFFF';
            ctx.fillText(char, x, y);
            ctx.globalAlpha = 1;
        }

        ctx.restore();
    }

    /**
     * Draws a projectile as an ASCII character
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} radius - Projectile radius
     * @param {string} type - Projectile/weapon type
     * @param {string|null} customChar - Optional custom character override
     * @param {string|null} customColor - Optional custom color override
     */
    drawProjectile(ctx, x, y, radius, type, customChar = null, customColor = null) {
        ctx.save();

        let char, color;

        // Use custom character and color if provided (for weapons like Scatter)
        if (customChar && customColor) {
            char = customChar;
            color = customColor;
        } else {
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
                case 'scatter':
                    char = GAME_CONFIG.ASCII.PROJECTILE_SCATTER;
                    color = GAME_CONFIG.COLORS.PROJECTILE_SCATTER;
                    break;
                case 'seeker':
                    char = GAME_CONFIG.ASCII.PROJECTILE_SEEKER;
                    color = GAME_CONFIG.COLORS.PROJECTILE_SEEKER;
                    break;
                case 'magic_wand':
                default:
                    char = GAME_CONFIG.ASCII.PROJECTILE;
                    color = GAME_CONFIG.COLORS.PROJECTILE;
                    break;

            }
        }

        ctx.font = GAME_CONFIG.FONTS.PROJECTILE;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = color;

        ctx.fillText(char, x, y);

        ctx.restore();
    }


    /**
     * Draws an orbit drone
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} drone - Drone entity
     */
    drawOrbitDrone(ctx, x, y, drone) {
        ctx.save();

        const char = drone.droneChar || 'o';
        const color = drone.droneColor || '#00FFFF';

        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = color;

        ctx.fillText(char, x, y);

        ctx.restore();
    }

    /**
     * Draws a mine with armed/unarmed visual state
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} mine - Mine entity
     */
    drawMine(ctx, x, y, mine) {
        ctx.save();

        const char = mine.mineChar || '*';
        const color = mine.getColor();
        const scale = mine.getScale();

        // Calculate scaled font size
        const baseFontSize = 16;
        const scaledSize = Math.round(baseFontSize * scale);

        ctx.font = `${scaledSize}px monospace`;
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
     * @param {number} value - Damage value
     * @param {string} color - Text color
     * @param {number} opacity - Text opacity (0-1)
     * @param {number} scale - Text scale
     */
    drawDamageNumber(ctx, x, y, value, color = '#ffffff', opacity = 1, scale = 1) {
        ctx.save();

        const fontSize = Math.floor(14 * scale);
        ctx.font = `bold ${fontSize}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Convert hex color to rgba with opacity
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;

        ctx.fillText(`${value}`, x, y);

        ctx.restore();
    }
}
