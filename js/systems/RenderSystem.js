/**
 * Render System - Coordinates rendering of all game entities
 * Uses the Renderer abstraction to draw entities without knowing render details
 * @module systems/RenderSystem
 */

/**
 * @typedef {Object} Camera
 * @property {number} x - Camera X offset
 * @property {number} y - Camera Y offset
 */

/**
 * Coordinates rendering of all entities through a renderer implementation
 */
export class RenderSystem {
    /**
     * Creates a new RenderSystem
     * @param {import('../renderers/IRenderer.js').IRenderer} renderer - The renderer to use
     */
    constructor(renderer) {
        /** @type {import('../renderers/IRenderer.js').IRenderer} */
        this.renderer = renderer;
    }

    /**
     * Sets a new renderer (for swapping between ASCII/Sprite)
     * @param {import('../renderers/IRenderer.js').IRenderer} renderer - The new renderer
     */
    setRenderer(renderer) {
        this.renderer = renderer;
    }

    /**
     * Renders all game entities
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Camera} camera - Camera offset
     * @param {Object} gameState - Current game state with all entities
     * @param {Array} gameState.pickups - Array of pickup entities
     * @param {Array} gameState.projectiles - Array of projectile entities
     * @param {Array} gameState.enemies - Array of enemy entities
     * @param {Array} gameState.particles - Array of particle effects
     * @param {Object} gameState.player - The player entity
     */
    render(ctx, camera, gameState) {
        const { pickups = [], projectiles = [], enemies = [], particles = [], player } = gameState;

        // 1. Draw background
        this.renderer.drawBackground(ctx, ctx.canvas.width, ctx.canvas.height, camera);

        // 2. Save context for camera transform
        ctx.save();
        ctx.translate(-camera.x, -camera.y);

        // 3. Draw pickups (bottom layer)
        for (const pickup of pickups) {
            if (pickup.alive !== false) {
                this.renderer.drawPickup(
                    ctx,
                    pickup.position.x,
                    pickup.position.y,
                    pickup.radius || 8,
                    pickup.type || 'xp',
                    pickup.value || 1
                );
            }
        }

        // 4. Draw projectiles
        for (const projectile of projectiles) {
            if (projectile.alive !== false) {
                this.renderer.drawProjectile(
                    ctx,
                    projectile.position.x,
                    projectile.position.y,
                    projectile.radius || 4,
                    projectile.weaponType || 'default'
                );
            }
        }

        // 5. Draw enemies (sorted by Y for depth)
        const sortedEnemies = [...enemies].sort((a, b) => a.position.y - b.position.y);
        for (const enemy of sortedEnemies) {
            if (enemy.alive !== false) {
                const healthPercent = enemy.maxHealth > 0 ? enemy.health / enemy.maxHealth : 1;
                this.renderer.drawEnemy(
                    ctx,
                    enemy.position.x,
                    enemy.position.y,
                    enemy.radius || 12,
                    enemy.enemyType || 'basic',
                    healthPercent
                );
            }
        }

        // 6. Draw player (on top of enemies)
        if (player) {
            this.renderer.drawPlayer(
                ctx,
                player.position.x,
                player.position.y,
                player.radius || 16,
                {
                    damaged: player.damaged || false,
                    invulnerable: player.invulnerable || false
                }
            );
        }

        // 7. Draw particles (top layer)
        for (const particle of particles) {
            if (particle.alive !== false) {
                this.renderer.drawParticle(
                    ctx,
                    particle.position.x,
                    particle.position.y,
                    particle.type || 'default',
                    particle.progress || 0,
                    particle.data || {}
                );
            }
        }

        // 8. Restore context
        ctx.restore();
    }

    /**
     * Renders a single entity (useful for debugging or specific effects)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} entity - The entity to render
     */
    renderEntity(ctx, entity) {
        switch (entity.type) {
            case 'player':
                this.renderer.drawPlayer(
                    ctx,
                    entity.position.x,
                    entity.position.y,
                    entity.radius || 16,
                    { damaged: entity.damaged, invulnerable: entity.invulnerable }
                );
                break;
            case 'enemy':
                this.renderer.drawEnemy(
                    ctx,
                    entity.position.x,
                    entity.position.y,
                    entity.radius || 12,
                    entity.enemyType || 'basic',
                    entity.health / entity.maxHealth
                );
                break;
            case 'projectile':
                this.renderer.drawProjectile(
                    ctx,
                    entity.position.x,
                    entity.position.y,
                    entity.radius || 4,
                    entity.weaponType || 'default'
                );
                break;
            case 'pickup':
                this.renderer.drawPickup(
                    ctx,
                    entity.position.x,
                    entity.position.y,
                    entity.radius || 8,
                    entity.pickupType || 'xp',
                    entity.value || 1
                );
                break;
            default:
                console.warn(`Unknown entity type: ${entity.type}`);
        }
    }

    /**
     * Renders debug information (hitboxes, etc.)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} camera - Camera offset
     * @param {Object} gameState - Current game state
     */
    renderDebug(ctx, camera, gameState) {
        ctx.save();
        ctx.translate(-camera.x, -camera.y);

        ctx.strokeStyle = 'rgba(255, 0, 255, 0.5)';
        ctx.lineWidth = 1;

        // Draw player hitbox
        if (gameState.player) {
            ctx.beginPath();
            ctx.arc(
                gameState.player.position.x,
                gameState.player.position.y,
                gameState.player.radius || 16,
                0,
                Math.PI * 2
            );
            ctx.stroke();
        }

        // Draw enemy hitboxes
        for (const enemy of gameState.enemies || []) {
            if (enemy.alive !== false) {
                ctx.beginPath();
                ctx.arc(
                    enemy.position.x,
                    enemy.position.y,
                    enemy.radius || 12,
                    0,
                    Math.PI * 2
                );
                ctx.stroke();
            }
        }

        ctx.restore();
    }
}
