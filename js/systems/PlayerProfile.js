/**
 * Player Profile System
 * Persistent player data storage using localStorage
 * @module systems/PlayerProfile
 */

const STORAGE_KEY = 'breachProtocolProfile';

/**
 * Manages persistent player data across game sessions
 */
class PlayerProfile {
    constructor() {
        /** @type {Object} Profile data */
        this.data = {
            playerName: '',
            gold: 0,
            stats: {
                totalRuns: 0,
                totalKills: 0,
                totalTimeAlive: 0,
                longestRun: 0,
                highestLevel: 0
            }
        };

        this.load();
    }

    /**
     * Load profile from localStorage
     */
    load() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                this.data = JSON.parse(saved);
                console.log('Profile loaded:', this.data.playerName);
            } else {
                console.log('No profile found');
            }
        } catch (e) {
            console.warn('localStorage unavailable, using in-memory profile');
        }
    }

    /**
     * Save profile to localStorage
     */
    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.warn('Could not save profile');
        }
    }

    /**
     * Check if a profile exists
     * @returns {boolean}
     */
    hasProfile() {
        return this.data.playerName.length > 0;
    }

    /**
     * Create a new profile with player name
     * @param {string} name - Player name
     */
    createProfile(name) {
        this.data.playerName = name.trim();
        this.data.gold = 0;
        this.data.stats = {
            totalRuns: 0,
            totalKills: 0,
            totalTimeAlive: 0,
            longestRun: 0,
            highestLevel: 0
        };
        this.save();
        console.log('Profile created:', this.data.playerName);
    }

    /**
     * Get player name
     * @returns {string}
     */
    getPlayerName() {
        return this.data.playerName;
    }

    /**
     * Add gold to profile
     * @param {number} amount
     */
    addGold(amount) {
        this.data.gold += amount;
        this.save();
    }

    /**
     * Spend gold (for future shop)
     * @param {number} amount
     * @returns {boolean} Whether spend was successful
     */
    spendGold(amount) {
        if (this.data.gold >= amount) {
            this.data.gold -= amount;
            this.save();
            return true;
        }
        return false;
    }

    /**
     * Get current gold
     * @returns {number}
     */
    getGold() {
        return this.data.gold;
    }

    /**
     * Get player stats
     * @returns {Object}
     */
    getStats() {
        return this.data.stats;
    }

    /**
     * Record stats after a run
     * @param {number} kills
     * @param {number} timeAlive
     * @param {number} level
     */
    recordRun(kills, timeAlive, level) {
        this.data.stats.totalRuns++;
        this.data.stats.totalKills += kills;
        this.data.stats.totalTimeAlive += timeAlive;
        this.data.stats.longestRun = Math.max(this.data.stats.longestRun, timeAlive);
        this.data.stats.highestLevel = Math.max(this.data.stats.highestLevel, level);
        this.save();
    }

    /**
     * Wipe all profile data
     */
    wipeProfile() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            // Ignore
        }
        this.data = {
            playerName: '',
            gold: 0,
            stats: {
                totalRuns: 0,
                totalKills: 0,
                totalTimeAlive: 0,
                longestRun: 0,
                highestLevel: 0
            }
        };
        console.log('Profile wiped');
    }

    /**
     * Reset profile (alias for wipeProfile, for debug)
     */
    reset() {
        this.wipeProfile();
    }
}

// Export as singleton
export const playerProfile = new PlayerProfile();
