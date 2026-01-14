/**
 * Core Game Controller
 * Orchestrates initialization and main loop
 * @module core/Game
 */

import { GameLoop } from './GameLoop.js';
import { Camera } from './Camera.js';
import { GAME_STATE } from './GameState.js';
import { Player } from '../entities/Player.js';
import { DamageNumber } from '../entities/DamageNumber.js';
import { InputSystem } from '../systems/InputSystem.js';
import { RenderSystem } from '../systems/RenderSystem.js';
import { SpawnSystem } from '../systems/SpawnSystem.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { WeaponSystem } from '../systems/WeaponSystem.js';
import { ExperienceSystem } from '../systems/ExperienceSystem.js';
import { EffectSystem } from '../systems/EffectSystem.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';
import { ExtractionSystem } from '../systems/ExtractionSystem.js';
import { ASCIIRenderer } from '../renderers/ASCIIRenderer.js';
import { LevelUpUI } from '../ui/LevelUpUI.js';
import { TitleScreen } from '../ui/TitleScreen.js';
import { PauseScreen } from '../ui/PauseScreen.js';
import { GameOverScreen } from '../ui/GameOverScreen.js';
import { ProfileCreationScreen } from '../ui/ProfileCreationScreen.js';
import { RewardsScreen } from '../ui/RewardsScreen.js';
import { HubScreen } from '../ui/HubScreen.js';
import { DebugUI } from '../ui/DebugUI.js';
import { playerProfile } from '../systems/PlayerProfile.js';
import { GAME_CONFIG } from '../config/GameConfig.js';
import { createWeapon } from '../config/WeaponConfig.js';
import { EFFECT_PRESETS } from '../config/EffectConfig.js';
import { ENEMY_TYPES } from '../config/EnemyConfig.js';
import { getPassiveConfig } from '../config/PassiveConfig.js';

/**
 * Main game class that coordinates all systems
 */
export class Game {
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

        /** @type {ExtractionSystem} */
        this.extractionSystem = new ExtractionSystem();

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
            damageNumbers: [],
            orbitDrones: [],
            activeMines: [],
            enemyProjectiles: []  // Projectiles fired by enemies (rangers)
        };

        // Game state management - start at HUB if profile exists, otherwise profile creation
        /** @type {string} Current game state */
        this.currentState = playerProfile.hasProfile() ? GAME_STATE.HUB : GAME_STATE.PROFILE_CREATION;

        /** @type {number} Total game time in seconds */
        this.gameTime = 0;

        /** @type {number} Total enemies killed */
        this.killCount = 0;

        // UI Screens
        /** @type {TitleScreen} */
        this.titleScreen = new TitleScreen();

        /** @type {PauseScreen} */
        this.pauseScreen = new PauseScreen();

        /** @type {GameOverScreen} */
        this.gameOverScreen = new GameOverScreen();

        /** @type {ProfileCreationScreen} */
        this.profileCreationScreen = new ProfileCreationScreen();
        this.profileCreationScreen.onProfileCreated = () => {
            this.currentState = GAME_STATE.HUB; // Go to hub after creating profile
        };

        // Set up title screen wipe callback
        this.titleScreen.onProfileWiped = () => {
            this.currentState = GAME_STATE.PROFILE_CREATION;
        };

        /** @type {RewardsScreen} */
        this.rewardsScreen = new RewardsScreen();

        /** @type {HubScreen} */
        this.hubScreen = new HubScreen();

        /** @type {DebugUI} */
        this.debugUI = new DebugUI(this.canvas);

        // Create game loop with update callback
        /** @type {GameLoop} */
        this.gameLoop = new GameLoop(this.update.bind(this));

        // Expose game instance to window for debug UI
        window.game = this;

        // Debug commands for PlayerProfile
        window.viewProfile = () => console.log(playerProfile.data);
        window.addGold = (amount) => {
            playerProfile.addGold(amount);
            console.log(`Added ${amount} gold. Total: ${playerProfile.getGold()}`);
        };
        window.resetProfile = () => playerProfile.reset();

        console.log('Breach Protocol - Initialized');
        console.log('Player Profile:', playerProfile.hasProfile() ? playerProfile.getPlayerName() : 'None');
    }

    /**
     * Main update function called every frame
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        // Handle different game states
        switch (this.currentState) {
            case GAME_STATE.PROFILE_CREATION:
                this.profileCreationScreen.bindKeys();
                this.profileCreationScreen.update(deltaTime);
                this.profileCreationScreen.render(this.ctx, this.canvas.width, this.canvas.height);
                return;

            case GAME_STATE.HUB:
                this.hubScreen.update(deltaTime);
                // Handle navigation keys
                for (const key of ['KeyW', 'KeyS', 'ArrowUp', 'ArrowDown', 'Space', 'Enter', 'Escape']) {
                    if (this.inputSystem.isKeyPressed(key)) {
                        this.inputSystem.pressedKeys.delete(key);
                        const action = this.hubScreen.handleKey(key);
                        if (action === 'start_run') {
                            this.startGame();
                        }
                    }
                }
                this.hubScreen.render(this.ctx, this.canvas.width, this.canvas.height);
                return;

            case GAME_STATE.TITLE:
                this.titleScreen.update(deltaTime);
                // Check for wipe save keys (DEL, Y, N)
                for (const key of ['Delete', 'Backspace', 'KeyY', 'KeyN', 'Escape']) {
                    if (this.inputSystem.isKeyPressed(key)) {
                        const consumed = this.titleScreen.handleKey(key);
                        if (consumed) {
                            this.inputSystem.pressedKeys.delete(key);
                        }
                    }
                }
                // Check for SPACE key to start game (only if not in confirm dialog)
                if (this.inputSystem.isKeyPressed('Space') && !this.titleScreen.showWipeConfirm) {
                    this.inputSystem.pressedKeys.delete('Space'); // Consume key
                    this.startGame();
                }
                // Render title screen
                this.titleScreen.render(this.ctx, this.canvas.width, this.canvas.height);
                this.debugUI.render(this); // Debug UI also on title
                return; // Don't run game logic

            case GAME_STATE.PAUSED:
                this.pauseScreen.update(deltaTime);
                // Handle pause screen keys
                for (const key of ['Escape', 'KeyQ', 'KeyY', 'KeyN']) {
                    if (this.inputSystem.isKeyPressed(key)) {
                        this.inputSystem.pressedKeys.delete(key);
                        const action = this.pauseScreen.handleKey(key);
                        if (action === 'resume') {
                            this.resumeGame();
                        } else if (action === 'abort') {
                            this.goToHub(); // Abort returns to hub with no rewards
                        }
                    }
                }
                // Render frozen game state + pause overlay
                {
                    const pausedRenderState = {
                        ...this.gameState,
                        particles: this.particleSystem.getParticles(),
                        garlicAura: this.weaponSystem.getGarlicAura(this.player)
                    };
                    this.renderSystem.render(this.ctx, this.camera.getPosition(), pausedRenderState);
                    this.drawHUD();
                    this.pauseScreen.render(this.ctx, this.canvas.width, this.canvas.height, {
                        level: this.player.level,
                        time: this.gameTime
                    });
                }
                return; // Don't run game logic

            case GAME_STATE.REWARDS:
                this.rewardsScreen.update(deltaTime);
                // Check for SPACE to continue
                if (this.inputSystem.isKeyPressed('Space')) {
                    this.inputSystem.pressedKeys.delete('Space');
                    if (this.rewardsScreen.handleKey('Space')) {
                        this.goToHub(); // Go to hub after rewards
                    }
                }
                // Render frozen game state + rewards overlay
                {
                    const rewardsRenderState = {
                        ...this.gameState,
                        particles: this.particleSystem.getParticles(),
                        garlicAura: this.weaponSystem.getGarlicAura(this.player)
                    };
                    this.renderSystem.render(this.ctx, this.camera.getPosition(), rewardsRenderState);
                    this.rewardsScreen.render(this.ctx, this.canvas.width, this.canvas.height);
                }
                return; // Don't run game logic

            case GAME_STATE.GAME_OVER:
                this.gameOverScreen.update(deltaTime);
                // Check for R to restart run (go directly to playing)
                if (this.inputSystem.isKeyPressed('KeyR')) {
                    this.inputSystem.pressedKeys.delete('KeyR'); // Consume key
                    this.restartRun();
                }
                // Check for SPACE to return to title
                if (this.inputSystem.isKeyPressed('Space')) {
                    this.inputSystem.pressedKeys.delete('Space'); // Consume key
                    this.returnToTitle();
                }
                // Render death state + game over overlay
                {
                    const gameOverRenderState = {
                        ...this.gameState,
                        particles: this.particleSystem.getParticles(),
                        garlicAura: this.weaponSystem.getGarlicAura(this.player)
                    };
                    this.renderSystem.render(this.ctx, this.camera.getPosition(), gameOverRenderState);
                    this.gameOverScreen.render(this.ctx, this.canvas.width, this.canvas.height, {
                        level: this.player.level,
                        time: this.gameTime,
                        kills: this.killCount
                    });
                }
                return; // Don't run game logic

            case GAME_STATE.PLAYING:
                // Continue to game logic below
                break;
        }

        // === PLAYING STATE - Game Logic ===

        // Check for ESC to pause
        if (this.inputSystem.isKeyPressed('Escape')) {
            this.inputSystem.pressedKeys.delete('Escape'); // Consume key
            this.pauseGame();
            return;
        }

        // Track game time
        this.gameTime += deltaTime;

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

        // 2b. Apply passive health regeneration
        this.player.applyRegeneration(deltaTime);

        // 3. Update camera to follow player
        this.camera.update(this.player.position, deltaTime);

        // 4. Spawn enemies (at camera edges)
        const newEnemies = this.spawnSystem.update(deltaTime, this.gameState.enemies, this.camera);
        this.gameState.enemies.push(...newEnemies);

        // 4. Update enemies (pass gameState for ranger projectile firing)
        for (const enemy of this.gameState.enemies) {
            if (enemy.alive) {
                enemy.update(deltaTime, this.player.position, this.gameState);
            }
        }

        // 4b. Update enemy projectiles (movement and expiration)
        this.gameState.enemyProjectiles = this.gameState.enemyProjectiles.filter(proj => {
            proj.lifetime += deltaTime;
            proj.position.x += proj.velocity.x * deltaTime;
            proj.position.y += proj.velocity.y * deltaTime;

            // Remove if expired
            return proj.lifetime < proj.maxLifetime;
        });

        // 5. Update weapons and projectiles
        const weaponResult = this.weaponSystem.update(
            deltaTime,
            this.player,
            this.gameState.enemies,
            this.gameState.projectiles
        );
        this.gameState.projectiles.push(...weaponResult.newProjectiles);
        // Update orbit drones reference from weapon system
        this.gameState.orbitDrones = weaponResult.orbitDrones || [];
        // Update active mines from weapon system
        this.gameState.activeMines = weaponResult.activeMines || [];

        // 5b. Handle mine explosions (damage enemies and spawn effects)
        for (const explosion of weaponResult.mineExplosions || []) {
            // Damage all enemies in blast radius
            for (const hit of explosion.affectedEnemies) {
                hit.enemy.takeDamage(explosion.damage);
                hit.enemy.lastDamageTaken = explosion.damage;

                // Damage number (magenta for mines)
                const dmgNum = new DamageNumber();
                const offsetX = (Math.random() - 0.5) * 30;
                const offsetY = -5 - Math.random() * 10;
                dmgNum.init(
                    hit.enemy.position.x + offsetX,
                    hit.enemy.position.y + offsetY,
                    Math.ceil(explosion.damage)
                );
                dmgNum.color = '#FF00FF'; // Magenta for mine explosion
                this.gameState.damageNumbers.push(dmgNum);

                // Apply hit effect
                this.effectSystem.applyPreset(
                    EFFECT_PRESETS.ENEMY_HIT,
                    hit.enemy,
                    this.particleSystem
                );
            }

            // Spawn circular explosion effect - fill blast radius with particles
            const particleCount = 40; // Number of particles in explosion
            const radius = explosion.radius;

            for (let i = 0; i < particleCount; i++) {
                // Random position within circle (uniform distribution)
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.sqrt(Math.random()) * radius; // sqrt for uniform distribution
                const px = explosion.position.x + Math.cos(angle) * dist;
                const py = explosion.position.y + Math.sin(angle) * dist;

                this.particleSystem.spawn(px, py, {
                    count: 1,
                    color: '#FF00FF',
                    speed: [5, 20], // Very slow - mostly stationary
                    lifetime: 0.5,
                    spread: 360,
                    size: 14,
                    char: '*'
                });
            }

            // Also spawn ring outline particles for extra effect
            const ringCount = 20;
            for (let i = 0; i < ringCount; i++) {
                const angle = (i / ringCount) * Math.PI * 2;
                const px = explosion.position.x + Math.cos(angle) * radius;
                const py = explosion.position.y + Math.sin(angle) * radius;

                this.particleSystem.spawn(px, py, {
                    count: 1,
                    color: '#FF88FF',
                    speed: [30, 60],
                    lifetime: 0.4,
                    direction: angle * (180 / Math.PI), // Outward
                    spread: 30,
                    size: 12,
                    char: '*'
                });
            }
        }

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

        // 6. Check collisions (includes projectile-enemy and drone-enemy)
        const collisionResults = this.collisionSystem.update(this.gameState);

        // 6b2. Handle drone hit effects
        for (const hit of collisionResults.droneHits) {
            // Damage number for drone damage (cyan tint)
            const dmgNum = new DamageNumber();
            const offsetX = (Math.random() - 0.5) * 30;
            const offsetY = -5 - Math.random() * 10;
            dmgNum.init(
                hit.enemy.position.x + offsetX,
                hit.enemy.position.y + offsetY,
                Math.ceil(hit.damage)
            );
            dmgNum.color = '#00FFFF'; // Cyan for drone
            this.gameState.damageNumbers.push(dmgNum);

            // Apply ENEMY_HIT effects (same as projectile hits)
            this.effectSystem.applyPreset(
                EFFECT_PRESETS.ENEMY_HIT,
                hit.enemy,
                this.particleSystem
            );
        }

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
        // 7. Start death animation for newly killed enemies (health <= 0 but not yet dying)
        const newlyKilledEnemies = this.gameState.enemies.filter(e => e.health <= 0 && !e.dying && e.alive);
        for (const enemy of newlyKilledEnemies) {
            // Start death animation (enemy stays visible during this)
            enemy.startDeathAnimation();

            // Apply ENEMY_DEATH effects (flash, scale during death)
            this.effectSystem.applyPreset(
                EFFECT_PRESETS.ENEMY_DEATH,
                enemy,
                this.particleSystem
            );
        }

        // 7b. Update dying enemies and handle death completion
        for (const enemy of this.gameState.enemies) {
            if (enemy.dying) {
                const deathComplete = enemy.updateDeathAnimation(deltaTime);

                if (deathComplete) {
                    // Death animation finished - spawn XP and effects
                    const pickups = this.experienceSystem.spawnPickupsFromEnemy(enemy);
                    this.gameState.pickups.push(...pickups);

                    // Handle swarm spawn-on-death
                    if (enemy.spawnOnDeath) {
                        // Spawn minion enemies
                        const minions = enemy.spawnMinions(this.gameState, ENEMY_TYPES);
                        this.gameState.enemies.push(...minions);

                        // Purple particle burst for swarm death
                        this.particleSystem.spawn(enemy.position.x, enemy.position.y, {
                            count: 12,
                            color: '#9900FF',
                            speed: [60, 120],
                            lifetime: 0.5,
                            spread: 360,
                            size: 14,
                            char: '*'
                        });
                    }
                }
            }
        }

        // 8. Remove dead entities (alive=false after death animation completes) and track kills
        const enemyCountBefore = this.gameState.enemies.length;
        this.gameState.enemies = this.gameState.enemies.filter(e => e.alive);
        const enemiesKilled = enemyCountBefore - this.gameState.enemies.length;
        this.killCount += enemiesKilled;
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

        // 10. Check game over (death)
        if (!this.player.isAlive()) {
            const runData = {
                extracted: false,
                timeSurvived: this.gameTime,
                level: this.player.level,
                kills: this.killCount
            };
            this.rewardsScreen.show(runData);
            this.currentState = GAME_STATE.REWARDS;
            console.log('Player died - showing rewards');
        }

        // 10b. Update extraction system (check for extraction)
        const extractionResult = this.extractionSystem.update(
            deltaTime,
            this.gameTime,
            this.player,
            this.inputSystem
        );
        if (extractionResult.extracted) {
            const runData = {
                extracted: true,
                extractionTime: this.gameTime,
                timeSurvived: this.gameTime,
                level: this.player.level,
                kills: this.killCount
            };
            this.rewardsScreen.show(runData);
            this.currentState = GAME_STATE.REWARDS;
            console.log('Player extracted - showing rewards');
        }

        // 11. Render based on current state
        switch (this.currentState) {
            case GAME_STATE.TITLE:
                this.titleScreen.render(this.ctx, this.canvas.width, this.canvas.height);
                break;

            case GAME_STATE.PAUSED:
                // Render game first (frozen state)
                const pausedRenderState = {
                    ...this.gameState,
                    particles: this.particleSystem.getParticles(),
                    garlicAura: this.weaponSystem.getGarlicAura(this.player)
                };
                this.renderSystem.render(this.ctx, this.camera.getPosition(), pausedRenderState);
                this.drawHUD();
                // Then overlay pause screen
                this.pauseScreen.render(this.ctx, this.canvas.width, this.canvas.height, {
                    level: this.player.level,
                    time: this.gameTime
                });
                break;

            case GAME_STATE.GAME_OVER:
                // Render game first (death state)
                const gameOverRenderState = {
                    ...this.gameState,
                    particles: this.particleSystem.getParticles(),
                    garlicAura: this.weaponSystem.getGarlicAura(this.player)
                };
                this.renderSystem.render(this.ctx, this.camera.getPosition(), gameOverRenderState);
                // Then overlay game over screen
                this.gameOverScreen.render(this.ctx, this.canvas.width, this.canvas.height, {
                    level: this.player.level,
                    time: this.gameTime,
                    kills: this.killCount
                });
                break;

            case GAME_STATE.PLAYING:
            default:
                // Normal gameplay rendering
                const renderState = {
                    ...this.gameState,
                    particles: this.particleSystem.getParticles(),
                    garlicAura: this.weaponSystem.getGarlicAura(this.player)
                };
                this.renderSystem.render(this.ctx, this.camera.getPosition(), renderState);

                // Render extraction points (after game world, before HUD)
                this.extractionSystem.render(this.ctx, this.camera.getPosition());

                // Draw HUD or level-up UI
                if (this.experienceSystem.isLevelingUp) {
                    this.levelUpUI.render();
                } else {
                    this.drawHUD();
                }

                // Draw debug UI (always on top)
                this.debugUI.render(this);
                break;
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

        // Health text (show effective max health with passive bonuses)
        const effectiveMaxHealth = this.player.getEffectiveMaxHealth();
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `HP: ${Math.ceil(this.player.health)}/${effectiveMaxHealth}`,
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

        // Kill count and Time (bottom left)
        this.ctx.font = '14px monospace';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'left';
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = Math.floor(this.gameTime % 60);
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        this.ctx.fillText(`Time: ${timeStr}`, 15, this.canvas.height - 35);
        this.ctx.fillStyle = '#ff6666';
        this.ctx.fillText(`Kills: ${this.killCount}`, 15, this.canvas.height - 18);

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

        // Core stats (using passive-enhanced values)
        this.ctx.fillStyle = '#aaaaaa';
        let y = statsY + lineHeight + 4;

        // Speed (with passive multiplier)
        const speedMult = this.player.passiveStats?.speedMultiplier || 1;
        const effectiveSpeed = Math.round(this.player.baseSpeed * speedMult);
        this.ctx.fillText(`SPD: ${effectiveSpeed}`, statsX, y);
        y += lineHeight;

        // Max Health (with passive bonus)
        const effectiveMaxHealth = this.player.getEffectiveMaxHealth();
        this.ctx.fillText(`HP:  ${effectiveMaxHealth}`, statsX, y);
        y += lineHeight;

        // Pickup radius (with passive bonus)
        const effectivePickup = this.player.getEffectivePickupRadius();
        this.ctx.fillText(`MAG: ${effectivePickup}`, statsX, y);
        y += lineHeight;

        // Damage multiplier (from passives)
        const dmgMult = this.player.passiveStats?.damageMultiplier || 1;
        this.ctx.fillText(`DMG: ${Math.round(dmgMult * 100)}%`, statsX, y);
        y += lineHeight;

        // Cooldown multiplier (from passives) - show as Cooldown Reduction
        // passiveStats.cooldownMultiplier is e.g. -0.4 (40% reduction)
        const cdr = -(this.player.passiveStats?.cooldownMultiplier || 0);
        const cdrPercent = Math.round(cdr * 100);
        // Cap visual display if needed, but showing actual value is good
        this.ctx.fillText(`CDR: ${cdrPercent}%`, statsX, y);
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

        // Passives header (if player has any)
        if (this.player.passiveItems.length > 0) {
            y += 6;
            this.ctx.fillStyle = '#ffff00';
            this.ctx.fillText('─ PASSIVES ─', statsX, y);
            y += lineHeight + 4;

            // List passives with their symbols
            for (const passive of this.player.passiveItems) {
                const config = getPassiveConfig(passive.id);
                if (config) {
                    this.ctx.fillStyle = config.color;
                    const lvlText = passive.level > 1 ? ` Lv.${passive.level}` : '';
                    this.ctx.fillText(`${config.symbol} ${config.name}${lvlText}`, statsX, y);
                    y += lineHeight;
                }
            }
        }

        // Inventory Slot Indicators
        y += 10;
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillText('─ SLOTS ─', statsX, y);
        y += lineHeight + 4;

        const maxWeapons = GAME_CONFIG.INVENTORY.MAX_WEAPONS;
        const maxPassives = GAME_CONFIG.INVENTORY.MAX_PASSIVES;
        const slotSize = 14;
        const slotGap = 3;

        // Weapon slots
        this.ctx.fillStyle = '#aaaaaa';
        this.ctx.fillText('W:', statsX, y);
        for (let i = 0; i < maxWeapons; i++) {
            const slotX = statsX + 25 + i * (slotSize + slotGap);
            const slotY = y - 2;

            // Draw slot background/border
            this.ctx.strokeStyle = '#444444';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(slotX, slotY, slotSize, slotSize);

            if (i < this.player.weapons.length) {
                const weapon = this.player.weapons[i];
                // Render weapon symbol or default

                const symbol = weapon.symbol || '?';
                const color = weapon.color || '#ffffff';

                this.ctx.fillStyle = color;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                // Adjust font for small slot
                this.ctx.font = '10px monospace';
                this.ctx.fillText(symbol, slotX + slotSize / 2, slotY + slotSize / 2 + 1);

                // Restore font
                this.ctx.font = GAME_CONFIG.FONTS.HUD;
                this.ctx.textAlign = 'left';
                this.ctx.textBaseline = 'top';
            }
        }
        y += lineHeight + 2;

        // Passive slots
        this.ctx.fillStyle = '#aaaaaa';
        this.ctx.fillText('P:', statsX, y);
        for (let i = 0; i < maxPassives; i++) {
            const slotX = statsX + 25 + i * (slotSize + slotGap);
            const slotY = y - 2;

            // Draw slot border
            this.ctx.strokeStyle = '#444444';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(slotX, slotY, slotSize, slotSize);

            if (i < this.player.passiveItems.length) {
                const passive = this.player.passiveItems[i];
                const config = getPassiveConfig(passive.id);

                if (config) {
                    this.ctx.fillStyle = config.color;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.font = '10px monospace';
                    this.ctx.fillText(config.symbol, slotX + slotSize / 2, slotY + slotSize / 2 + 1);

                    // Restore font
                    this.ctx.font = GAME_CONFIG.FONTS.HUD;
                    this.ctx.textAlign = 'left';
                    this.ctx.textBaseline = 'top';
                }
            }
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
        this.gameState.orbitDrones = [];
        this.gameState.activeMines = [];
        this.gameState.enemyProjectiles = [];

        // Reset systems
        this.spawnSystem.reset();
        this.experienceSystem.isLevelingUp = false;
        this.effectSystem.clear();
        this.particleSystem.clear();
        // Clear weapon system drones and mines
        this.weaponSystem.orbitDrones = [];
        this.weaponSystem.activeMines = [];
        this.weaponSystem.lastDroneCount = 0;
        this.weaponSystem.lastDroneLevel = 0;

        // Reset camera to center on player
        this.camera.centerOn(this.player.position);

        // Reset extraction system
        this.extractionSystem.reset();

        // Reset game metrics
        this.gameTime = 0;
        this.killCount = 0;

        // Return to title screen
        this.currentState = GAME_STATE.TITLE;
        this.titleScreen = new TitleScreen();

        // Resume game loop
        this.gameLoop.resume();

        console.log('Game restarted - returning to title screen');
    }

    /**
     * Restarts the run and goes directly to playing (used from game over)
     */
    restartRun() {
        // Call restart to reset everything
        this.restart();
        // But then immediately start playing
        this.currentState = GAME_STATE.PLAYING;
        this.gameTime = 0;
        this.killCount = 0;
        console.log('Run restarted - playing immediately!');
    }

    /**
     * Starts the game from title screen
     */
    startGame() {
        this.currentState = GAME_STATE.PLAYING;
        // Reset stats
        this.gameTime = 0;
        this.killCount = 0;
        // Reset extraction system for new run
        this.extractionSystem.reset();
        console.log('Game started!');
    }

    /**
     * Pauses the game (from PLAYING to PAUSED)
     */
    pauseGame() {
        if (this.currentState === GAME_STATE.PLAYING) {
            this.currentState = GAME_STATE.PAUSED;
            console.log('Game paused');
        }
    }

    /**
     * Resumes the game (from PAUSED to PLAYING)
     */
    resumeGame() {
        if (this.currentState === GAME_STATE.PAUSED) {
            this.currentState = GAME_STATE.PLAYING;
            console.log('Game resumed');
        }
    }

    /**
     * Returns to title screen (with full game reset)
     */
    returnToTitle() {
        // Call restart which resets everything and goes to title
        this.restart();
        console.log('Returned to title');
    }

    /**
     * Goes to hub screen (after rewards, resetting game state)
     */
    goToHub() {
        // Reset player to center of WORLD
        this.player.reset(
            GAME_CONFIG.WORLD.WIDTH / 2,
            GAME_CONFIG.WORLD.HEIGHT / 2
        );

        // Give player starting weapon again
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
        this.gameState.orbitDrones = [];
        this.gameState.activeMines = [];
        this.gameState.enemyProjectiles = [];

        // Reset systems
        this.spawnSystem.reset();
        this.experienceSystem.isLevelingUp = false;
        this.effectSystem.clear();
        this.particleSystem.clear();
        this.weaponSystem.orbitDrones = [];
        this.weaponSystem.activeMines = [];
        this.weaponSystem.lastDroneCount = 0;
        this.weaponSystem.lastDroneLevel = 0;
        this.extractionSystem.reset();

        // Reset camera
        this.camera.centerOn(this.player.position);

        // Reset UI screen states
        this.pauseScreen.reset();
        this.hubScreen.reset();

        // Go to hub
        this.currentState = GAME_STATE.HUB;
        console.log('Returned to hub');
    }

    /**
     * Starts the game
     */
    start() {
        this.gameLoop.start();
        console.log('Game loop started!');
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
     * Pauses the game loop
     */
    pause() {
        this.gameLoop.pause();
    }

    /**
     * Resumes the game loop
     */
    resume() {
        this.gameLoop.resume();
    }
}
