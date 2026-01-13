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
    /** Title screen - waiting for player to start */
    TITLE: 'title',

    /** Active gameplay */
    PLAYING: 'playing',

    /** Game is paused */
    PAUSED: 'paused',

    /** Player has died */
    GAME_OVER: 'gameover'
};

Object.freeze(GAME_STATE);
