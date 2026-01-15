/**
 * Game State Constants
 * Defines all possible game states
 * @module core/GameState
 */

/**
 * Game state enumeration
 * @readonly
 * @enum {string}
 */
export const GAME_STATE = {
    /** Profile creation - first time setup */
    PROFILE_CREATION: 'profile_creation',

    /** Loading transition screen */
    LOADING: 'loading',

    /** Hub menu - central navigation */
    HUB: 'hub',

    /** Loadout selection - pre-run equipment choice */
    LOADOUT: 'loadout',

    /** Title screen - waiting for player to start */
    TITLE: 'title',

    /** Active gameplay */
    PLAYING: 'playing',

    /** Game is paused */
    PAUSED: 'paused',

    /** Showing rewards/results screen */
    REWARDS: 'rewards',

    /** Player has died */
    GAME_OVER: 'gameover'
};

Object.freeze(GAME_STATE);
