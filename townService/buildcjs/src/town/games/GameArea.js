"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const InvalidParametersError_1 = require("../../lib/InvalidParametersError");
const InteractableArea_1 = __importDefault(require("../InteractableArea"));
/**
 * A GameArea is an InteractableArea on the map that can host a game.
 * At any given point in time, there is at most one game in progress in a GameArea.
 */
class GameArea extends InteractableArea_1.default {
    constructor() {
        super(...arguments);
        this._history = [];
    }
    get game() {
        return this._game;
    }
    get history() {
        return this._history;
    }
    toModel() {
        var _a;
        return {
            id: this.id,
            game: (_a = this._game) === null || _a === void 0 ? void 0 : _a.toModel(),
            history: this._history,
            occupants: this.occupantsByID,
            type: this.getType(),
        };
    }
    get isActive() {
        return true;
    }
    remove(player) {
        if (this._game) {
            try {
                this._game.leave(player);
            }
            catch (e) {
                if (e.message === InvalidParametersError_1.PLAYER_NOT_IN_GAME_MESSAGE) {
                    // do nothing
                }
                else {
                    throw e;
                }
            }
        }
        super.remove(player);
    }
}
exports.default = GameArea;
