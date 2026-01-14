/**
 * Main Entry Point
 * Initializes and starts the game
 * @module main
 */

import { Game } from './core/Game.js';

// Initialize and start the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        const game = new Game();
        game.start();
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }
});
