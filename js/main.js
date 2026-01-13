/**
 * Main Entry Point
 * Initializes and starts the game
 * @module main
 */

import { GameLoop } from './core/GameLoop.js';
import { Camera } from './core/Camera.js';
import { Player } from './entities/Player.js';
import { DamageNumber } from './entities/DamageNumber.js';
import { InputSystem } from './systems/InputSystem.js';
import { RenderSystem } from './systems/RenderSystem.js';
import { SpawnSystem } from './systems/SpawnSystem.js';
import { CollisionSystem } from './systems/CollisionSystem.js';
import { WeaponSystem } from './systems/WeaponSystem.js';
import { ExperienceSystem } from './systems/ExperienceSystem.js';
import { EffectSystem } from './systems/EffectSystem.js';
import { ParticleSystem } from './systems/ParticleSystem.js';
import { ASCIIRenderer } from './renderers/ASCIIRenderer.js';
import { LevelUpUI } from './ui/LevelUpUI.js';
import { GAME_CONFIG } from './config/GameConfig.js';
import { createWeapon } from './config/WeaponConfig.js';
import { EFFECT_PRESETS } from './config/EffectConfig.js';

/**
 * Main game class that coordinates all systems
 */
class Game {
    /**
     * Creates and initializes the game
     */
    constructor() {
        // Get canvas and context
        /** @type {HTMLCanvasElement} */
        this.canvas = document.getElementById('gameCanvas');

        if (!this.canvas) {
            throw new Error('Canvas element not found! Make sure #gameCanvas exists.');
        }

        /** @type {CanvasRenderingContext2D} */
        this.ctx = this.canvas.getContext('2d');

        // Set canvas dimensions
        this.canvas.width = GAME_CONFIG.CANVAS_WIDTH;
        this.canvas.height = GAME_CONFIG.CANVAS_HEIGHT;

        // Initialize player at center of WORLD (not canvas)
        /** @type {Player} */
        this.player = new Player(
            GAME_CONFIG.WORLD.WIDTH / 2,
            GAME_CONFIG.WORLD.HEIGHT / 2
        );

        // Initialize systems
        /** @type {InputSystem} */
        this.inputSystem = new InputSystem();

        // Initialize renderer (ASCII for MVP)
        /** @type {ASCIIRenderer} */
        this.renderer = new ASCIIRenderer();

        /** @type {RenderSystem} */
        this.renderSystem = new RenderSystem(this.renderer);

        /** @type {SpawnSystem} */
        this.spawnSystem = new SpawnSystem(this.canvas.width, this.canvas.height);

        /** @type {CollisionSystem} */
        this.collisionSystem = new CollisionSystem();

        /** @type {WeaponSystem} */
        this.weaponSystem = new WeaponSystem();

        // Give player starting weapon (Magic Wand only - other weapons via level up)
        const startingWeapon = createWeapon('magic_wand');
        if (startingWeapon) {
            this.player.weapons.push(startingWeapon);
        }

        /** @type {ExperienceSystem} */
        this.experienceSystem = new ExperienceSystem(this.handleLevelUp.bind(this));

        /** @type {EffectSystem} */
        this.effectSystem = new EffectSystem();

        /** @type {ParticleSystem} */
        this.particleSystem = new ParticleSystem(500);

        /** @type {LevelUpUI} */
        this.levelUpUI = new LevelUpUI(this.canvas);

        // Camera - follows player through the world
        /** @type {Camera} */
        this.camera = new Camera(this.canvas.width, this.canvas.height);
        this.camera.centerOn(this.player.position);

        // Game state
        /** @type {Object} */
        this.gameState = {
            player: this.player,
            enemies: [],
            projectiles: [],
            pickups: [],
            particles: [],
            damageNumbers: []
        };

        // Create game loop with update callback
        /** @type {GameLoop} */
        this.gameLoop = new GameLoop(this.update.bind(this));

        // Debug: expose game instance to window for testing
        if (GAME_CONFIG.DEBUG.SHOW_FPS) {
            window.game = this;
        }

        console.log('Vampire Survivors Clone - Phase 4 Initialized');
        console.log('Controls: WASD or Arrow Keys to move');
        console.log('Kill enemies to collect XP and level up!');
    }

    /**
     * Main update function called every frame
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        // Skip game updates during level-up (pause effect)
        if (this.experienceSystem.isLevelingUp) {
            this.renderSystem.render(this.ctx, this.camera.getPosition(), this.gameState);
            this.levelUpUI.render();
            return;
        }

        // 1. Get input
        const inputVector = this.inputSystem.getMovementVector();

        // 2. Update player (using WORLD bounds, not canvas)
        this.player.update(
            deltaTime,
            inputVector,
            GAME_CONFIG.WORLD.WIDTH,
            GAME_CONFIG.WORLD.HEIGHT
        );

        // 3. Update camera to follow player
        this.camera.update(this.player.position, deltaTime);

        // 4. Spawn enemies (at camera edges)
        const newEnemies = this.spawnSystem.update(deltaTime, this.gameState.enemies, this.camera);
        this.gameState.enemies.push(...newEnemies);

        // 4. Update enemies
        for (const enemy of this.gameState.enemies) {
            if (enemy.alive) {
                enemy.update(deltaTime, this.player.position);
            }
        }

        // 5. Update weapons and projectiles
        const weaponResult = this.weaponSystem.update(
            deltaTime,
            this.player,
            this.gameState.enemies,
            this.gameState.projectiles
        );
        this.gameState.projectiles.push(...weaponResult.newProjectiles);

        // 5b. Handle garlic aura hits (damage numbers + effects)
        for (const hit of weaponResult.auraHits) {
            // Damage number for aura damage (green tint for garlic)
            const dmgNum = new DamageNumber();
            const offsetX = (Math.random() - 0.5) * 30;
            const offsetY = -5 - Math.random() * 10;
            dmgNum.init(
                hit.enemy.position.x + offsetX,
                hit.enemy.position.y + offsetY,
                Math.ceil(hit.damage)
            );
            dmgNum.color = '#90EE90'; // Light green for garlic
            this.gameState.damageNumbers.push(dmgNum);

            // Apply hit effect (smaller than projectile hit)
            this.effectSystem.scalePulse(hit.enemy, 0.08, 1.1);
        }

        // 6. Check collisions (includes projectile-enemy)
        const collisionResults = this.collisionSystem.update(this.gameState);

        // 6b. Spawn damage numbers and effects for enemies hit
        for (const enemy of collisionResults.enemiesHit) {
            // Damage number
            const dmgNum = new DamageNumber();
            const offsetX = (Math.random() - 0.5) * 50;
            const offsetY = -5 - Math.random() * 15;
            dmgNum.init(
                enemy.position.x + offsetX,
                enemy.position.y + offsetY,
                Math.ceil(enemy.lastDamageTaken || 5)
            );
            this.gameState.damageNumbers.push(dmgNum);

            // Apply ENEMY_HIT effects (scale pulse, flash, particles)
            this.effectSystem.applyPreset(
                EFFECT_PRESETS.ENEMY_HIT,
                enemy,
                this.particleSystem
            );
        }

        // 7. Spawn XP pickups and death effects from dead enemies
        const deadEnemies = this.gameState.enemies.filter(e => !e.alive);
        for (const enemy of deadEnemies) {
            const pickups = this.experienceSystem.spawnPickupsFromEnemy(enemy);
            this.gameState.pickups.push(...pickups);

            // Apply ENEMY_DEATH effects (particles burst)
            this.effectSystem.applyPreset(
                EFFECT_PRESETS.ENEMY_DEATH,
                enemy,
                this.particleSystem
            );
        }

        // 8. Remove dead entities
        this.gameState.enemies = this.gameState.enemies.filter(e => e.alive);
        this.gameState.projectiles = this.gameState.projectiles.filter(p => p.alive);

        // 9. Update XP/pickups (handles collection and level-up)
        this.experienceSystem.update(deltaTime, this.player, this.gameState.pickups);
        this.gameState.pickups = this.gameState.pickups.filter(p => p.alive);

        // 9b. Update damage numbers
        for (const dmgNum of this.gameState.damageNumbers) {
            dmgNum.update(deltaTime);
        }
        this.gameState.damageNumbers = this.gameState.damageNumbers.filter(d => d.alive);

        // 9c. Update effects and particles
        this.effectSystem.update(deltaTime);
        this.particleSystem.update(deltaTime);

        // 10. Check game over
        if (!this.player.isAlive()) {
            this.handleGameOver();
        }

        // 11. Render everything (include particles and garlic aura in gameState for rendering)
        const renderState = {
            ...this.gameState,
            particles: this.particleSystem.getParticles(),
            garlicAura: this.weaponSystem.getGarlicAura(this.player)
        };
        this.renderSystem.render(this.ctx, this.camera.getPosition(), renderState);

        // 12. Draw HUD (or level-up UI if leveling)
        if (this.experienceSystem.isLevelingUp) {
            this.levelUpUI.render();
        } else {
            this.drawHUD();
        }

        // 13. Draw debug info if enabled
        if (GAME_CONFIG.DEBUG.SHOW_HITBOXES) {
            this.renderSystem.renderDebug(this.ctx, this.camera.getPosition(), this.gameState);
        }
    }

    /**
     * Draws the heads-up display (HUD)
     * @private
     */
    drawHUD() {
        this.ctx.save();

        this.ctx.font = GAME_CONFIG.FONTS.HUD;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';

        // FPS and debug info (top-left)
        if (GAME_CONFIG.DEBUG.SHOW_FPS) {
            const fps = this.gameLoop.getFPS();
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(`FPS: ${fps}`, 10, 10);
            this.ctx.fillText(`Enemies: ${this.gameState.enemies.length}`, 10, 26);
            this.ctx.fillText(`Projectiles: ${this.gameState.projectiles.length}`, 10, 42);
            this.ctx.fillText(`Time: ${this.spawnSystem.getFormattedTime()}`, 10, 58);

            // Show god mode indicator
            if (GAME_CONFIG.DEBUG.GOD_MODE) {
                this.ctx.fillStyle = '#ffff00';
                this.ctx.fillText('GOD MODE', 10, 74);
            }

            // Show player position in world
            this.ctx.fillStyle = '#888888';
            this.ctx.fillText(
                `Pos: ${Math.floor(this.player.position.x)}, ${Math.floor(this.player.position.y)}`,
                10, 90
            );
        }

        // Health bar (top-center)
        const healthPercent = this.player.getHealthPercent();
        const barWidth = 200;
        const barHeight = 16;
        const barX = (this.canvas.width - barWidth) / 2;
        const barY = 10;

        // Background
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);

        // Health fill
        this.ctx.fillStyle = healthPercent > 0.3 ? '#00ff00' : '#ff0000';
        this.ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

        // Border
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);

        // Health text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `HP: ${Math.ceil(this.player.health)}/${this.player.maxHealth}`,
            this.canvas.width / 2,
            barY + barHeight + 4
        );

        // XP bar (below health bar)
        const xpProgress = this.experienceSystem.getXPProgress(this.player);
        const xpBarY = barY + barHeight + 24;
        const xpBarHeight = 10;

        // XP background
        this.ctx.fillStyle = '#222222';
        this.ctx.fillRect(barX, xpBarY, barWidth, xpBarHeight);

        // XP fill
        this.ctx.fillStyle = '#00ffff';
        this.ctx.fillRect(barX, xpBarY, barWidth * xpProgress.percent, xpBarHeight);

        // XP border
        this.ctx.strokeStyle = '#666666';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(barX, xpBarY, barWidth, xpBarHeight);

        // Level text (right of XP bar)
        this.ctx.font = '12px monospace';
        this.ctx.fillStyle = '#00ffff';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Lv.${this.player.level}`, barX + barWidth + 10, xpBarY + 2);

        // Player Stats Panel (right side)
        this.drawPlayerStats();

        this.ctx.restore();
    }

    /**
     * Draws player stats panel on the right side of the HUD
     * @private
     */
    drawPlayerStats() {
        const statsX = this.canvas.width - 150;
        const statsY = 10;
        const lineHeight = 14;

        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';

        // Stats header
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillText('─ STATS ─', statsX, statsY);

        // Core stats
        this.ctx.fillStyle = '#aaaaaa';
        let y = statsY + lineHeight + 4;

        // Speed
        this.ctx.fillText(`SPD: ${this.player.speed}`, statsX, y);
        y += lineHeight;

        // Max Health
        this.ctx.fillText(`HP:  ${this.player.maxHealth}`, statsX, y);
        y += lineHeight;

        // Pickup radius
        this.ctx.fillText(`MAG: ${this.player.pickupRadius}`, statsX, y);
        y += lineHeight;

        // Damage multiplier
        const dmgMult = this.player.damageMultiplier || 1;
        this.ctx.fillText(`DMG: ${Math.round(dmgMult * 100)}%`, statsX, y);
        y += lineHeight;

        // Attack speed multiplier
        const atkMult = this.player.attackSpeedMultiplier || 1;
        this.ctx.fillText(`ATK: ${Math.round(atkMult * 100)}%`, statsX, y);
        y += lineHeight + 6;

        // Weapons header
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillText('─ WEAPONS ─', statsX, y);
        y += lineHeight + 4;

        // List weapons
        this.ctx.fillStyle = '#88ff88';
        for (const weapon of this.player.weapons) {
            const lvlText = weapon.level > 1 ? ` Lv.${weapon.level}` : '';
            this.ctx.fillText(`${weapon.name}${lvlText}`, statsX, y);
            y += lineHeight;
        }
    }

    /**
     * Handles game over state
     * @private
     */
    handleGameOver() {
        this.gameLoop.pause();

        // Draw game over screen
        this.ctx.save();

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.font = '48px monospace';
        this.ctx.fillStyle = '#ff0000';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 30);

        this.ctx.font = '20px monospace';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(
            `Survived: ${this.spawnSystem.getFormattedTime()}`,
            this.canvas.width / 2,
            this.canvas.height / 2 + 20
        );

        this.ctx.font = '16px monospace';
        this.ctx.fillText(
            'Press R to restart',
            this.canvas.width / 2,
            this.canvas.height / 2 + 60
        );

        this.ctx.restore();

        // Listen for restart
        const handleRestart = (e) => {
            if (e.code === 'KeyR') {
                window.removeEventListener('keydown', handleRestart);
                this.restart();
            }
        };
        window.addEventListener('keydown', handleRestart);
    }

    /**
     * Handles level-up event - shows upgrade choices
     * @param {Array} options - Available upgrade options
     * @private
     */
    handleLevelUp(options) {
        this.levelUpUI.show(options, (selectedIndex) => {
            this.experienceSystem.selectUpgrade(
                selectedIndex,
                this.player,
                createWeapon
            );
        });
    }

    /**
     * Restarts the game
     */
    restart() {
        // Reset player to center of WORLD
        this.player.reset(
            GAME_CONFIG.WORLD.WIDTH / 2,
            GAME_CONFIG.WORLD.HEIGHT / 2
        );

        // Give player starting weapon again (Magic Wand only)
        const startingWeapon = createWeapon('magic_wand');
        if (startingWeapon) {
            this.player.weapons.push(startingWeapon);
        }

        // Clear entities
        this.gameState.enemies = [];
        this.gameState.projectiles = [];
        this.gameState.pickups = [];
        this.gameState.particles = [];
        this.gameState.damageNumbers = [];

        // Reset systems
        this.spawnSystem.reset();
        this.experienceSystem.isLevelingUp = false;
        this.effectSystem.clear();
        this.particleSystem.clear();

        // Reset camera to center on player
        this.camera.centerOn(this.player.position);

        // Resume game loop
        this.gameLoop.resume();

        console.log('Game restarted!');
    }

    /**
     * Starts the game
     */
    start() {
        this.gameLoop.start();
        console.log('Game started!');
    }

    /**
     * Stops the game
     */
    stop() {
        this.gameLoop.stop();
        this.inputSystem.destroy();
        console.log('Game stopped.');
    }

    /**
     * Pauses the game
     */
    pause() {
        this.gameLoop.pause();
    }

    /**
     * Resumes the game
     */
    resume() {
        this.gameLoop.resume();
    }
}

// Initialize and start the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        const game = new Game();
        game.start();
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }
});
