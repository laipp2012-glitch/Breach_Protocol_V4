/**
 * Effect Configuration - Preset effect combinations for game events
 * TUNABLE: Adjust these values to change game feel
 * @module config/EffectConfig
 */

/**
 * Preset effect configurations for common game events
 * 
 * PARTICLE OPTIONS:
 * - count: Number of particles to spawn
 * - char: ASCII character (null = circle dot)
 * - color: Particle color (hex)
 * - size: Font size for ASCII, or radius*4 for circles
 * - speed: [min, max] speed range in pixels/sec
 * - lifetime: How long particles live (seconds)
 * - gravity: Downward acceleration (negative = upward)
 * - spread: Angle spread in degrees (360 = all directions)
 * - direction: Optional base direction in degrees (0 = right, 90 = down)
 * 
 * EFFECT OPTIONS:
 * - scalePulse: { duration, scale } - Briefly grow entity
 * - flash: { duration, color } - Flash overlay color
 * - screenShake: { duration, intensity } - Camera shake
 */
export const EFFECT_PRESETS = {
    /**
     * Enemy hit by projectile - quick feedback
     */
    ENEMY_HIT: {
        effects: ['scalePulse', 'flash'],
        scalePulse: {
            duration: 0.1,    // Quick pulse
            scale: 1.2        // 20% bigger
        },
        flash: {
            duration: 0.1,    // Quick flash
            color: '#FFFFFF'  // White flash
        },
        particles: {
            count: 3,         // Few particles
            char: 'G',        // Small dot character
            color: '#FF4444', // Red
            size: 10,         // Font size
            speed: [20, 50],  // Slow particles
            lifetime: 0.25,   // Short lived
            gravity: 0,       // No gravity
            spread: 120       // Narrow spread behind hit
        }
    },

    /**
     * Enemy death - satisfying burst
     */
    ENEMY_DEATH: {
        effects: ['scalePulse'],
        scalePulse: {
            duration: 0.15,
            scale: 1.4
        },
        particles: {
            count: 6,           // Medium burst
            char: '*',          // Asterisk explosion
            color: '#FF0000',   // Bright red
            size: 12,           // Medium size
            speed: [60, 120],   // Fast burst
            lifetime: 0.4,      // Visible but brief
            gravity: 100,       // Fall down
            spread: 360         // All directions
        }
    },

    /**
     * Player takes damage - impactful
     */
    PLAYER_HIT: {
        effects: ['screenShake', 'flash'],
        screenShake: {
            duration: 0.12,
            intensity: 6
        },
        flash: {
            duration: 0.1,
            color: '#FF0000'
        }
    },

    /**
     * Player levels up - celebration
     */
    LEVEL_UP: {
        effects: ['scalePulse'],
        scalePulse: {
            duration: 0.3,
            scale: 1.3
        },
        particles: {
            count: 12,
            char: '+',          // Plus signs rising
            color: '#FFD700',   // Gold
            size: 14,
            speed: [80, 150],
            lifetime: 0.8,
            gravity: -80,       // Float upward
            spread: 360
        }
    },

    /**
     * XP gem collected
     */
    XP_COLLECT: {
        effects: [],
        particles: {
            count: 2,
            char: '·',
            color: '#00FFFF',
            size: 8,
            speed: [15, 30],
            lifetime: 0.2,
            gravity: -20,
            spread: 360
        }
    },

    /**
     * Health pickup collected
     */
    HEALTH_COLLECT: {
        effects: ['scalePulse'],
        scalePulse: {
            duration: 0.15,
            scale: 1.4
        },
        particles: {
            count: 4,
            char: '+',
            color: '#00FF00',
            size: 12,
            speed: [30, 60],
            lifetime: 0.4,
            gravity: -50,
            spread: 360
        }
    }
};

/**
 * Gets a preset by name
 * @param {string} name - Preset name
 * @returns {Object|null} Preset config or null
 */
export function getEffectPreset(name) {
    return EFFECT_PRESETS[name] || null;
}
