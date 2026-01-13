/**
 * Render System - Coordinates rendering of all game entities
 * Uses the Renderer abstraction to draw entities without knowing render details
 * Implements off-screen culling for performance
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

        /** @type {number} Culling margin (pixels outside viewport to still render) */
        this.cullMargin = 50;

        /** @type {number} Entities culled this frame */
        this.culledCount = 0;

        /** @type {number} Entities rendered this frame */
        this.renderedCount = 0;
    }

    /**
     * Sets a new renderer (for swapping between ASCII/Sprite)
     * @param {import('../renderers/IRenderer.js').IRenderer} renderer - The new renderer
     */
    setRenderer(renderer) {
        this.renderer = renderer;
    }

    /**
     * Checks if a position is visible on screen (with margin)
     * @param {number} x - World X position
     * @param {number} y - World Y position
     * @param {Object} camera - Camera position
     * @param {number} width - Viewport width
     * @param {number} height - Viewport height
     * @returns {boolean} True if visible
     */
    isVisible(x, y, camera, width, height) {
        return x >= camera.x - this.cullMargin &&
            x <= camera.x + width + this.cullMargin &&
            y >= camera.y - this.cullMargin &&
            y <= camera.y + height + this.cullMargin;
    }

    /**
     * Renders all game entities
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Camera} camera - Camera offset
     * @param {Object} gameState - Current game state with all entities
     */
    render(ctx, camera, gameState) {
        const {
            pickups = [],
            projectiles = [],
            enemies = [],
            particles = [],
            damageNumbers = [],
            player
        } = gameState;

        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        // Reset counters
        this.culledCount = 0;
        this.renderedCount = 0;

        // 1. Draw background
        this.renderer.drawBackground(ctx, width, height, camera);

        // 2. Save context for camera transform
        ctx.save();
        ctx.translate(-camera.x, -camera.y);

        // 3. Draw pickups (bottom layer) - with culling
        for (const pickup of pickups) {
            if (pickup.alive !== false) {
                if (this.isVisible(pickup.position.x, pickup.position.y, camera, width, height)) {
                    this.renderer.drawPickup(
                        ctx,
                        pickup.position.x,
                        pickup.position.y,
                        pickup.radius || 8,
                        pickup.pickupType || 'xp',
                        pickup.value || 1
                    );
                    this.renderedCount++;
                } else {
                    this.culledCount++;
                }
            }
        }

        // 4. Draw projectiles - with culling
        for (const projectile of projectiles) {
            if (projectile.alive !== false) {
                if (this.isVisible(projectile.position.x, projectile.position.y, camera, width, height)) {
                    this.renderer.drawProjectile(
                        ctx,
                        projectile.position.x,
                        projectile.position.y,
                        projectile.radius || 4,
                        projectile.weaponType || 'default'
                    );
                    this.renderedCount++;
                } else {
                    this.culledCount++;
                }
            }
        }

        // 5. Draw enemies (sorted by Y for depth) - with culling
        const visibleEnemies = enemies.filter(e =>
            e.alive !== false &&
            this.isVisible(e.position.x, e.position.y, camera, width, height)
        );
        const sortedEnemies = visibleEnemies.sort((a, b) => a.position.y - b.position.y);
        this.culledCount += enemies.filter(e => e.alive !== false).length - visibleEnemies.length;

        for (const enemy of sortedEnemies) {
            const healthPercent = enemy.maxHealth > 0 ? enemy.health / enemy.maxHealth : 1;
            // Include effect properties for juice system
            const effectOptions = {
                scale: enemy.scale || 1,
                flashAlpha: enemy.flashAlpha || 0,
                flashColor: enemy.flashColor || '#FFFFFF',
                shakeOffsetX: enemy.shakeOffsetX || 0,
                shakeOffsetY: enemy.shakeOffsetY || 0
            };
            this.renderer.drawEnemy(
                ctx,
                enemy.position.x + effectOptions.shakeOffsetX,
                enemy.position.y + effectOptions.shakeOffsetY,
                enemy.radius || 12,
                enemy.enemyType || 'basic',
                healthPercent,
                effectOptions
            );
            this.renderedCount++;
        }

        // 5b. Draw garlic aura (before player, so it appears behind)
        if (gameState.garlicAura) {
            const aura = gameState.garlicAura;
            // Draw aura as a semi-transparent circle with pulsing effect
            ctx.beginPath();
            ctx.arc(aura.x, aura.y, aura.radius, 0, Math.PI * 2);
            ctx.strokeStyle = '#90EE90'; // Light green
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.6;
            ctx.stroke();

            // Inner glow
            ctx.beginPath();
            ctx.arc(aura.x, aura.y, aura.radius * 0.7, 0, Math.PI * 2);
            ctx.strokeStyle = '#98FB98';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;
            ctx.stroke();

            ctx.globalAlpha = 1;
            this.renderedCount++;
        }

        // 6. Draw player (on top of enemies) - always visible
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
            this.renderedCount++;
        }

        // 7. Draw particles (top layer) - with culling
        for (const particle of particles) {
            if (particle.alive !== false) {
                // Support both position object and direct x/y (from ParticleSystem)
                const px = particle.position ? particle.position.x : particle.x;
                const py = particle.position ? particle.position.y : particle.y;

                if (this.isVisible(px, py, camera, width, height)) {
                    const opacity = particle.getOpacity ? particle.getOpacity() : 1;
                    ctx.globalAlpha = opacity;

                    // Check if particle has ASCII character
                    if (particle.char) {
                        // Render as ASCII character
                        ctx.font = `${particle.size}px monospace`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = particle.color;
                        ctx.fillText(particle.char, px, py);
                    } else if (particle.color && particle.size !== undefined) {
                        // Render as circle
                        ctx.beginPath();
                        ctx.arc(px, py, particle.size / 4, 0, Math.PI * 2);
                        ctx.fillStyle = particle.color;
                        ctx.fill();
                    } else {
                        // Legacy particle rendering via renderer
                        this.renderer.drawParticle(
                            ctx,
                            px,
                            py,
                            particle.type || 'default',
                            particle.progress || 0,
                            particle.data || {}
                        );
                    }

                    ctx.globalAlpha = 1;
                    this.renderedCount++;
                } else {
                    this.culledCount++;
                }
            }
        }

        // 8. Draw damage numbers (top-most layer) - with culling
        for (const dmgNum of damageNumbers) {
            if (dmgNum.alive) {
                if (this.isVisible(dmgNum.x, dmgNum.y, camera, width, height)) {
                    this.renderer.drawDamageNumber(
                        ctx,
                        dmgNum.x,
                        dmgNum.y,
                        dmgNum.value,
                        dmgNum.color,
                        dmgNum.opacity,
                        dmgNum.scale
                    );
                    this.renderedCount++;
                } else {
                    this.culledCount++;
                }
            }
        }

        // 9. Restore context
        ctx.restore();
    }

    /**
     * Gets rendering statistics
     * @returns {Object} Render stats
     */
    getStats() {
        return {
            rendered: this.renderedCount,
            culled: this.culledCount
        };
    }

    /**
     * Renders debug overlay (hitboxes, etc.)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} camera - Camera offset
     * @param {Object} gameState - Game state
     */
    renderDebug(ctx, camera, gameState) {
        const { enemies = [], player, projectiles = [] } = gameState;

        ctx.save();
        ctx.translate(-camera.x, -camera.y);

        // Draw player hitbox
        if (player) {
            ctx.beginPath();
            ctx.arc(player.position.x, player.position.y, player.radius || 16, 0, Math.PI * 2);
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Draw enemy hitboxes
        for (const enemy of enemies) {
            if (enemy.alive !== false) {
                ctx.beginPath();
                ctx.arc(enemy.position.x, enemy.position.y, enemy.radius || 12, 0, Math.PI * 2);
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }

        // Draw projectile hitboxes
        for (const proj of projectiles) {
            if (proj.alive !== false) {
                ctx.beginPath();
                ctx.arc(proj.position.x, proj.position.y, proj.radius || 4, 0, Math.PI * 2);
                ctx.strokeStyle = '#ffff00';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }

        ctx.restore();
    }
}
