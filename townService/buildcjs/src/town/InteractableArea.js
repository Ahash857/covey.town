"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAYER_SPRITE_HEIGHT = exports.PLAYER_SPRITE_WIDTH = void 0;
exports.PLAYER_SPRITE_WIDTH = 32;
exports.PLAYER_SPRITE_HEIGHT = 64;
class InteractableArea {
    get id() {
        return this._id;
    }
    get occupants() {
        return this._occupants;
    }
    get occupantsByID() {
        return this._occupants.map(eachPlayer => eachPlayer.id);
    }
    get isActive() {
        return this.occupants.length > 0;
    }
    get boundingBox() {
        return { x: this._x, y: this._y, width: this._width, height: this._height };
    }
    /**
     * Constructs a new InteractableArea
     * @param id Unique ID for this area
     * @param boundingBox The rectangular coordinates that define this InteractableArea, where (x,y) specify the top-left corner
     * @param townEmitter An emitter that can be used to broadcast events to players in this town
     */
    constructor(id, { x, y, width, height }, townEmitter) {
        /* The current set of players in this area. Maintained by the InteractableArea class. */
        this._occupants = [];
        this._id = id;
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this._townEmitter = townEmitter;
    }
    /**
     * Adds a new player to this interactable area.
     *
     * Adds the player to this area's occupants array, sets the player's interactableID, informs players in the town
     * that the player's interactableID has changed, and informs players in the town that the area has changed.
     *
     * Assumes that the player specified is a member of this town.
     *
     * @param player Player to add
     */
    add(player) {
        this._occupants.push(player);
        player.location.interactableID = this.id;
        this._townEmitter.emit('playerMoved', player.toPlayerModel());
        this._emitAreaChanged();
    }
    /**
     * Removes a player from this interactable area.
     *
     * Removes the player from this area's occupants array, clears the player's interactableID, informs players in the town
     * that the player's interactableID has changed, and informs players in the town that the area has changed
     *
     * Assumes that the player specified is an occupant of this interactable area
     *
     * @param player Player to remove
     */
    remove(player) {
        this._occupants = this._occupants.filter(eachPlayer => eachPlayer !== player);
        player.location.interactableID = undefined;
        this._townEmitter.emit('playerMoved', player.toPlayerModel());
        this._emitAreaChanged();
    }
    /**
     * Given a list of players, adds all of the players that are within this interactable area
     *
     * @param allPlayers list of players to examine and potentially add to this interactable area
     */
    addPlayersWithinBounds(allPlayers) {
        allPlayers
            .filter(eachPlayer => this.contains(eachPlayer.location))
            .forEach(eachContainedPlayer => this.add(eachContainedPlayer));
    }
    /**
     * Tests if a player location is contained within this InteractableArea.
     *
     * This interactable area contains a PlayerLocation if any part of the player is within any part of this area.
     * A PlayerLocation specifies only the center (x,y) coordinate of the player; the width and height of the player
     * are PLAYER_SPRITE_WIDTH and PLAYER_SPRITE_HEIGHT, respectively
     *
     * @param location location to check
     *
     * @returns true if location is within this area
     */
    contains(location) {
        return (location.x + exports.PLAYER_SPRITE_WIDTH / 2 > this._x &&
            location.x - exports.PLAYER_SPRITE_WIDTH / 2 < this._x + this._width &&
            location.y + exports.PLAYER_SPRITE_HEIGHT / 2 > this._y &&
            location.y - exports.PLAYER_SPRITE_HEIGHT / 2 < this._y + this._height);
    }
    /**
     * Tests if another InteractableArea overlaps with this one. Two InteractableArea's overlap if it is possible for one player
     * to overlap with both of them simultaneously. That is: There is an overlap if the rectangles of the two InteractableAreas
     * overlap, where the rectangles are expanded by PLAYER_SPRITE_WIDTH/2 in each X dimension and PLAYER_SPRITE_HEIGHT/2 in each Y
     * dimension.
     *
     * @param otherInteractable interactable to checko
     *
     * @returns true if a player could be contained within both InteractableAreas simultaneously
     */
    overlaps(otherInteractable) {
        const toRectPoints = ({ _x, _y, _width, _height }) => ({
            x1: _x - exports.PLAYER_SPRITE_WIDTH / 2,
            x2: _x + _width + exports.PLAYER_SPRITE_WIDTH / 2,
            y1: _y - exports.PLAYER_SPRITE_HEIGHT / 2,
            y2: _y + _height + exports.PLAYER_SPRITE_HEIGHT / 2,
        });
        const rect1 = toRectPoints(this);
        const rect2 = toRectPoints(otherInteractable);
        const noOverlap = rect1.x1 >= rect2.x2 || rect2.x1 >= rect1.x2 || rect1.y1 >= rect2.y2 || rect2.y1 >= rect1.y2;
        return !noOverlap;
    }
    /**
     * Emits an event to the players in the town notifying them that this InteractableArea has changed, passing
     * the model for this InteractableArea in that event.
     */
    _emitAreaChanged() {
        this._townEmitter.emit('interactableUpdate', this.toModel());
    }
}
exports.default = InteractableArea;
