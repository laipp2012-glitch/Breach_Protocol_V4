/**
 * Abstract Renderer Interface
 * Defines the contract for all renderer implementations
 * This abstraction allows swapping between ASCII, Sprite, or any other rendering method
 * @module renderers/IRenderer
 */

/**
 * Abstract base class for renderers
 * All rendering implementations must extend this class
 */
export class IRenderer {
    /**
     * Draws the player entity
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} radius - Player collision radius
     * @param {Object} state - Player state object
     * @param {boolean} [state.damaged] - Whether player is currently in damaged state
     * @param {boolean} [state.invulnerable] - Whether player is invulnerable
     * @throws {Error} Must be implemented by subclass
     */
    drawPlayer(ctx, x, y, radius, state) {
        throw new Error('IRenderer.drawPlayer() must be implemented by subclass');
    }

    /**
     * Draws an enemy entity
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} radius - Enemy collision radius
     * @param {string} type - Enemy type ('basic', 'tank', 'fast', etc.)
     * @param {number} healthPercent - Current health as percentage (0-1)
     * @throws {Error} Must be implemented by subclass
     */
    drawEnemy(ctx, x, y, radius, type, healthPercent) {
        throw new Error('IRenderer.drawEnemy() must be implemented by subclass');
    }

    /**
     * Draws a projectile entity
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} radius - Projectile radius
     * @param {string} type - Projectile type
     * @param {string|null} customChar - Optional custom character override
     * @param {string|null} customColor - Optional custom color override
     * @throws {Error} Must be implemented by subclass
     */
    drawProjectile(ctx, x, y, radius, type, customChar = null, customColor = null) {
        throw new Error('IRenderer.drawProjectile() must be implemented by subclass');
    }

    /**
     * Draws a pickup entity (XP gems, health, etc.)
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} radius - Pickup collision radius
     * @param {string} type - Pickup type ('xp', 'health', etc.)
     * @param {number} value - Value of the pickup
     * @throws {Error} Must be implemented by subclass
     */
    drawPickup(ctx, x, y, radius, type, value) {
        throw new Error('IRenderer.drawPickup() must be implemented by subclass');
    }

    /**
     * Draws an orbit drone entity
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} drone - Drone entity with droneChar and droneColor
     */
    drawOrbitDrone(ctx, x, y, drone) {
        // Default implementation - simple circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = drone.droneColor || '#00FFFF';
        ctx.fill();
        ctx.restore();
    }

    /**
     * Draws a mine entity
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} mine - Mine entity with getColor() and getScale() methods
     */
    drawMine(ctx, x, y, mine) {
        // Default implementation - simple asterisk
        ctx.save();
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = mine.getColor ? mine.getColor() : '#FF00FF';
        ctx.fillText('*', x, y);
        ctx.restore();
    }


    /**
     * Draws a particle effect
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} type - Particle type ('death', 'damage', 'levelup', etc.)
     * @param {number} progress - Animation progress (0-1)
     * @param {Object} [data] - Additional particle data
     * @throws {Error} Must be implemented by subclass
     */
    drawParticle(ctx, x, y, type, progress, data) {
        throw new Error('IRenderer.drawParticle() must be implemented by subclass');
    }

    /**
     * Draws the background
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {Object} [camera] - Camera offset for parallax effects
     */
    drawBackground(ctx, width, height, camera = { x: 0, y: 0 }) {
        // Default implementation - dark background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);
    }

    /**
     * Draws damage number floating text
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} damage - Damage value to display
     * @param {number} progress - Animation progress (0-1)
     */
    drawDamageNumber(ctx, x, y, damage, progress) {
        // Default implementation - can be overridden
        ctx.save();
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(255, 255, 255, ${1 - progress})`;
        ctx.fillText(`-${damage}`, x, y - progress * 30);
        ctx.restore();
    }
}
