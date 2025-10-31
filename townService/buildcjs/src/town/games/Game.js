"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nanoid_1 = require("nanoid");
/**
 * This class is the base class for all games. It is responsible for managing the
 * state of the game. @see GameArea
 */
class Game {
    /**
     * Creates a new Game instance.
     * @param initialState State to initialize the game with.
     * @param emitAreaChanged A callback to invoke when the state of the game changes. This is used to notify clients.
     */
    constructor(initialState) {
        this._players = [];
        this.id = (0, nanoid_1.nanoid)();
        this._state = initialState;
    }
    get state() {
        return this._state;
    }
    set state(newState) {
        this._state = newState;
    }
    /**
     * Attempt to join a game.
     * @param player The player to join the game.
     * @throws InvalidParametersError if the player can not join the game
     */
    join(player) {
        this._join(player);
        this._players.push(player);
    }
    /**
     * Attempt to leave a game.
     * @param player The player to leave the game.
     * @throws InvalidParametersError if the player can not leave the game
     */
    leave(player) {
        this._leave(player);
        this._players = this._players.filter(p => p.id !== player.id);
    }
    toModel() {
        return {
            state: this._state,
            id: this.id,
            result: this._result,
            players: this._players.map(player => player.id),
        };
    }
}
exports.default = Game;
