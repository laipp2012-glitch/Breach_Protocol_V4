/**
 * Game configuration constants
 * Centralized configuration to avoid magic numbers
 * @module config/GameConfig
 */

export const GAME_CONFIG = {
    // Canvas dimensions (viewport size)
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,

    // World dimensions (total playable area)
    WORLD: {
        WIDTH: 4000,
        HEIGHT: 4000
    },

    // Camera settings
    CAMERA: {
        SMOOTHING: 0.1,          // Camera lerp factor (0 = no follow, 1 = instant)
        DEAD_ZONE: 0             // Pixels player can move before camera follows
    },

    // Target frame rate
    TARGET_FPS: 60,

    // Player settings
    PLAYER: {
        SPEED: 140,          // Pixels per second
        RADIUS: 14,          // Collision radius
        MAX_HEALTH: 100,
        INVULNERABLE_DURATION: 1.0  // Seconds of invulnerability after damage
    },

    // Inventory limits
    INVENTORY: {
        MAX_WEAPONS: 6,      // Maximum weapons player can hold
        MAX_PASSIVES: 6      // Maximum passive items player can hold
    },

    // Spawn system settings
    SPAWN: {
        BASE_RATE: 1,        // Enemies per second at start
        MAX_RATE: 10,        // Maximum enemies per second
        MAX_ENEMIES: 500,    // Maximum enemies on screen
        MARGIN: 50           // Pixels outside camera view for spawn
    },

    // Colors (for ASCII rendering)
    COLORS: {
        PLAYER: '#00ff00',           // Green
        PLAYER_DAMAGED: '#ff0000',   // Red flash when damaged
        ENEMY_BASIC: '#ff0000',      // Red
        ENEMY_TANK: '#ff4444',       // Dark red
        ENEMY_FAST: '#ff8800',       // Orange
        ENEMY_RANGER: '#FF6600',     // Orange (ranger)
        ENEMY_SWARM: '#9900FF',      // Purple (swarm)
        ENEMY_SWARM_MINI: '#CC66FF', // Light purple (swarm mini)
        PROJECTILE: '#ffff00',       // Yellow (Magic Wand)
        PROJECTILE_KNIFE: '#cccccc', // Silver (Knife)
        PROJECTILE_GARLIC: '#88ff88',// Light green (Garlic aura)
        PROJECTILE_SCATTER: '#FFA500',// Orange (Scatter pellets)
        PROJECTILE_SEEKER: '#FF00FF', // Magenta (Seeker missiles)
        XP_GEM: '#00ffff',           // Cyan
        HEALTH_PICKUP: '#00ff00',    // Green
        BACKGROUND: '#0a0a0a',       // Very dark
        GRID: '#1a1a1a'              // Subtle grid lines
    },

    // Font settings for ASCII rendering
    FONTS: {
        PLAYER: '20px monospace',
        ENEMY: '16px monospace',
        ENEMY_TANK: '20px monospace',
        ENEMY_FAST: '14px monospace',
        ENEMY_RANGER: '16px monospace',
        ENEMY_SWARM: '18px monospace',
        ENEMY_SWARM_MINI: '12px monospace',
        PROJECTILE: '12px monospace',
        PICKUP: '14px monospace',
        PICKUP_LARGE: '16px monospace',
        HUD: '14px monospace'
    },

    // ASCII characters
    ASCII: {
        PLAYER: '@',
        ENEMY_BASIC: 'E',
        ENEMY_TANK: 'T',
        ENEMY_FAST: 'F',
        ENEMY_RANGER: 'R',
        ENEMY_SWARM: 'S',
        ENEMY_SWARM_MINI: 's',
        PROJECTILE: '*',           // Magic Wand projectile
        PROJECTILE_KNIFE: '/',     // Knife projectile
        PROJECTILE_GARLIC: '◎',    // Garlic aura
        PROJECTILE_SCATTER: '.',    // Scatter pellet
        PROJECTILE_SEEKER: '>',      // Seeker missile
        XP_GEM_SMALL: '$',
        XP_GEM_LARGE: '◆',
        HEALTH_PICKUP: '+'
    },

    // Background grid settings
    GRID: {
        SIZE: 50,            // Grid cell size in pixels
        LINE_WIDTH: 1
    },

    // Debug settings
    DEBUG: {
        SHOW_FPS: true,
        SHOW_HITBOXES: false,
        LOG_PERFORMANCE: false,
        GOD_MODE: false          // Set to true to disable player damage (for testing)
    }
};

// Freeze the config to prevent accidental modification
Object.freeze(GAME_CONFIG);
Object.freeze(GAME_CONFIG.WORLD);
Object.freeze(GAME_CONFIG.CAMERA);
Object.freeze(GAME_CONFIG.PLAYER);
Object.freeze(GAME_CONFIG.INVENTORY);
Object.freeze(GAME_CONFIG.SPAWN);
Object.freeze(GAME_CONFIG.COLORS);
Object.freeze(GAME_CONFIG.FONTS);
Object.freeze(GAME_CONFIG.ASCII);
Object.freeze(GAME_CONFIG.GRID);
Object.freeze(GAME_CONFIG.DEBUG);
