/**
 * Spatial Hash Grid - Optimizes collision detection
 * Divides the world into cells and only checks collisions between entities in adjacent cells
 * Reduces collision checks from O(n²) to O(n)
 * @module utils/SpatialHash
 */

/**
 * Spatial hash grid for efficient proximity queries
 */
export class SpatialHash {
    /**
     * Creates a new SpatialHash
     * @param {number} cellSize - Size of each grid cell in pixels
     */
    constructor(cellSize = 100) {
        /** @type {number} Cell size in pixels */
        this.cellSize = cellSize;

        /** @type {Map<string, Array>} Grid cells - key is "x,y", value is entity array */
        this.grid = new Map();

        /** @type {number} Number of entities in the grid */
        this.entityCount = 0;

        /** @type {number} Number of cells with entities */
        this.cellCount = 0;
    }

    /**
     * Clears all entities from the grid
     */
    clear() {
        this.grid.clear();
        this.entityCount = 0;
        this.cellCount = 0;
    }

    /**
     * Gets the cell key for a position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {string} Cell key
     */
    getCellKey(x, y) {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        return `${cellX},${cellY}`;
    }

    /**
     * Gets the cell coordinates for a position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {{cellX: number, cellY: number}} Cell coordinates
     */
    getCellCoords(x, y) {
        return {
            cellX: Math.floor(x / this.cellSize),
            cellY: Math.floor(y / this.cellSize)
        };
    }

    /**
     * Inserts an entity into the grid
     * @param {Object} entity - Entity with position property
     */
    insert(entity) {
        if (!entity.position) {
            return;
        }

        const key = this.getCellKey(entity.position.x, entity.position.y);

        if (!this.grid.has(key)) {
            this.grid.set(key, []);
            this.cellCount++;
        }

        this.grid.get(key).push(entity);
        this.entityCount++;
    }

    /**
     * Gets all entities near a given entity (in same and adjacent cells)
     * @param {Object} entity - Entity to query around
     * @param {number} radius - Optional search radius (adds extra cells)
     * @returns {Array} Array of nearby entities
     */
    getNearby(entity, radius = 0) {
        if (!entity.position) {
            return [];
        }

        const { cellX, cellY } = this.getCellCoords(entity.position.x, entity.position.y);
        const nearby = [];

        // Calculate how many extra cells to check based on radius
        const extraCells = Math.ceil(radius / this.cellSize);
        const range = 1 + extraCells;

        // Check this cell + adjacent cells
        for (let dx = -range; dx <= range; dx++) {
            for (let dy = -range; dy <= range; dy++) {
                const key = `${cellX + dx},${cellY + dy}`;
                if (this.grid.has(key)) {
                    nearby.push(...this.grid.get(key));
                }
            }
        }

        return nearby;
    }

    /**
     * Gets all entities in a specific area
     * @param {number} x - Center X
     * @param {number} y - Center Y
     * @param {number} width - Area width
     * @param {number} height - Area height
     * @returns {Array} Entities in the area
     */
    getInArea(x, y, width, height) {
        const minCellX = Math.floor((x - width / 2) / this.cellSize);
        const maxCellX = Math.floor((x + width / 2) / this.cellSize);
        const minCellY = Math.floor((y - height / 2) / this.cellSize);
        const maxCellY = Math.floor((y + height / 2) / this.cellSize);

        const entities = [];

        for (let cx = minCellX; cx <= maxCellX; cx++) {
            for (let cy = minCellY; cy <= maxCellY; cy++) {
                const key = `${cx},${cy}`;
                if (this.grid.has(key)) {
                    entities.push(...this.grid.get(key));
                }
            }
        }

        return entities;
    }

    /**
     * Builds the grid from an array of entities
     * @param {Array} entities - Array of entities to insert
     */
    build(entities) {
        this.clear();
        for (const entity of entities) {
            if (entity.alive !== false) {  // Skip dead entities
                this.insert(entity);
            }
        }
    }

    /**
     * Gets statistics about the grid
     * @returns {Object} Grid statistics
     */
    getStats() {
        return {
            entityCount: this.entityCount,
            cellCount: this.cellCount,
            cellSize: this.cellSize,
            avgEntitiesPerCell: this.cellCount > 0 ? this.entityCount / this.cellCount : 0
        };
    }
}
