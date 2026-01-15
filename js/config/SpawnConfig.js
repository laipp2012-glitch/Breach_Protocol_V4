/**
 * Spawn Configuration
 * Controls enemy wave spawning, timing, and difficulty progression
 * @module config/SpawnConfig
 */

/**
 * Spawn system configuration
 * @type {Object}
 */
export const SPAWN_CONFIG = {
    /**
     * General spawn settings
     */
    GENERAL: {
        /** Maximum enemies allowed on screen */
        MAX_ENEMIES: 150,

        /** Spawn margin outside viewport (pixels) */
        SPAWN_MARGIN: 10,

        /** Continuous spawn interval (seconds) - spawns 1 enemy */
        CONTINUOUS_INTERVAL: 1.5
    },

    /**
     * Wave phases - time-based difficulty progression
     * Each phase defines spawn behavior for a time bracket
     */
    PHASES: [
        {
            /** Phase name for debugging */
            name: 'Early Game',
            /** Start time in seconds (0:00) */
            startTime: 0,
            /** End time in seconds (2:30) */
            endTime: 150,
            /** Wave settings for this phase */
            wave: {
                /** Seconds between waves */
                interval: 5,
                /** Enemies per wave */
                size: 7,
                /** Minimum spawn directions (1-4) */
                minDirections: 1,
                /** Maximum spawn directions (1-4) */
                maxDirections: 3
            },
            /** Enemy types available (by ID) */
            enemyTypes: ['basic']
        },
        {
            name: 'Mid Game',
            startTime: 120,
            endTime: 210,
            wave: {
                interval: 8,
                size: 20,
                minDirections: 2,
                maxDirections: 3
            },
            enemyTypes: ['basic', 'fast']
        },
        {
            name: 'Late Game',
            startTime: 210,
            endTime: Infinity,
            wave: {
                interval: 6,
                size: 25,
                minDirections: 3,
                maxDirections: 4
            },
            enemyTypes: ['basic', 'fast', 'ranger']
        }
    ],

    /**
     * Enemy unlock times (seconds)
     * When each enemy type becomes available
     */
    ENEMY_UNLOCK_TIMES: {
        basic: 0,     // Always available
        fast: 90,     // 1:30
        ranger: 180   // 3:00
    },

    /**
     * Extraction wave settings
     * Massive wave spawned when extraction point appears
     */
    EXTRACTION_WAVE: {
        /** Enable/disable extraction wave spawn */
        ENABLED: true,
        /** Number of enemies to spawn */
        ENEMY_COUNT: 40,
        /** Spawn from all 4 directions */
        DIRECTIONS: 4,
        /** Enemy types to spawn (uses all available at current time if empty) */
        ENEMY_TYPES: []
    }
};

/**
 * Gets the current spawn phase based on game time
 * @param {number} gameTime - Current game time in seconds
 * @returns {Object} Current phase configuration
 */
export function getCurrentPhase(gameTime) {
    for (const phase of SPAWN_CONFIG.PHASES) {
        if (gameTime >= phase.startTime && gameTime < phase.endTime) {
            return phase;
        }
    }
    // Fallback to last phase
    return SPAWN_CONFIG.PHASES[SPAWN_CONFIG.PHASES.length - 1];
}

/**
 * Gets wave parameters for current game time
 * @param {number} gameTime - Current game time in seconds
 * @returns {{interval: number, size: number, minDirections: number, maxDirections: number}}
 */
export function getWaveParams(gameTime) {
    const phase = getCurrentPhase(gameTime);
    return { ...phase.wave };
}

/**
 * Gets available enemy types for current game time
 * @param {number} gameTime - Current game time in seconds
 * @returns {Array<string>} Array of enemy type IDs
 */
export function getAvailableEnemies(gameTime) {
    const unlockTimes = SPAWN_CONFIG.ENEMY_UNLOCK_TIMES;
    return Object.keys(unlockTimes).filter(type => gameTime >= unlockTimes[type]);
}

// Freeze config
Object.freeze(SPAWN_CONFIG);
Object.freeze(SPAWN_CONFIG.GENERAL);
Object.freeze(SPAWN_CONFIG.ENEMY_UNLOCK_TIMES);
Object.freeze(SPAWN_CONFIG.EXTRACTION_WAVE);
SPAWN_CONFIG.PHASES.forEach(phase => {
    Object.freeze(phase);
    Object.freeze(phase.wave);
    Object.freeze(phase.enemyTypes);
});
