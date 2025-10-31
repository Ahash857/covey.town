"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const InvalidParametersError_1 = __importStar(require("../../lib/InvalidParametersError"));
const ConnectFourGame_1 = __importDefault(require("./ConnectFourGame"));
const GameArea_1 = __importDefault(require("./GameArea"));
/**
 * The ConnectFourGameArea class is responsible for managing the state of a single game area for Connect Four.
 * Responsibilty for managing the state of the game itself is delegated to the ConnectFourGame class.
 *
 * @see ConnectFourGame
 * @see GameArea
 */
class ConnectFourGameArea extends GameArea_1.default {
    getType() {
        return 'ConnectFourArea';
    }
    _stateUpdated(updatedState) {
        var _a, _b, _c;
        if (updatedState.state.status === 'OVER') {
            // If we haven't yet recorded the outcome, do so now.
            const gameID = (_a = this._game) === null || _a === void 0 ? void 0 : _a.id;
            if (gameID && !this._history.find(eachResult => eachResult.gameID === gameID)) {
                const { red, yellow } = updatedState.state;
                if (red && yellow) {
                    const redName = ((_b = this._occupants.find(eachPlayer => eachPlayer.id === red)) === null || _b === void 0 ? void 0 : _b.userName) || red;
                    const yellowName = ((_c = this._occupants.find(eachPlayer => eachPlayer.id === yellow)) === null || _c === void 0 ? void 0 : _c.userName) || yellow;
                    this._history.push({
                        gameID,
                        scores: {
                            [redName]: updatedState.state.winner === red ? 1 : 0,
                            [yellowName]: updatedState.state.winner === yellow ? 1 : 0,
                        },
                    });
                }
            }
        }
        this._emitAreaChanged();
    }
    /**
     * Handle a command from a player in this game area.
     * Supported commands:
     * - JoinGame (joins the game `this._game`, or creates a new one if none is in progress)
     * - StartGame (indicates that the player is ready to start the game)
     * - GameMove (applies a move to the game)
     * - LeaveGame (leaves the game)
     *
     * If the command ended the game, records the outcome in this._history
     * If the command is successful (does not throw an error), calls this._emitAreaChanged (necessary
     * to notify any listeners of a state update, including any change to history)
     * If the command is unsuccessful (throws an error), the error is propagated to the caller
     *
     * @see InteractableCommand
     *
     * @param command command to handle
     * @param player player making the request
     * @returns response to the command, @see InteractableCommandResponse
     * @throws InvalidParametersError if the command is not supported or is invalid.
     * Invalid commands:
     * - GameMove, StartGame and LeaveGame: if the game is not in progress (GAME_NOT_IN_PROGRESS_MESSAGE) or if the game ID does not match the game in progress (GAME_ID_MISSMATCH_MESSAGE)
     * - Any command besides JoinGame, GameMove, StartGame and LeaveGame: INVALID_COMMAND_MESSAGE
     */
    handleCommand(command, player) {
        var _a, _b, _c;
        if (command.type === 'GameMove') {
            const game = this._game;
            if (!game) {
                throw new InvalidParametersError_1.default(InvalidParametersError_1.GAME_NOT_IN_PROGRESS_MESSAGE);
            }
            if (((_a = this._game) === null || _a === void 0 ? void 0 : _a.id) !== command.gameID) {
                throw new InvalidParametersError_1.default(InvalidParametersError_1.GAME_ID_MISSMATCH_MESSAGE);
            }
            if (command.move.gamePiece !== 'Red' && command.move.gamePiece !== 'Yellow') {
                throw new InvalidParametersError_1.default('Invalid game piece');
            }
            game.applyMove({
                gameID: command.gameID,
                playerID: player.id,
                move: command.move,
            });
            this._stateUpdated(game.toModel());
            return undefined;
        }
        if (command.type === 'JoinGame') {
            let game = this._game;
            if (!game || game.state.status === 'OVER') {
                // No game in progress, make a new one
                game = new ConnectFourGame_1.default(this._game);
                this._game = game;
            }
            game.join(player);
            this._stateUpdated(game.toModel());
            return { gameID: game.id };
        }
        if (command.type === 'LeaveGame') {
            const game = this._game;
            if (!game) {
                throw new InvalidParametersError_1.default(InvalidParametersError_1.GAME_NOT_IN_PROGRESS_MESSAGE);
            }
            if (((_b = this._game) === null || _b === void 0 ? void 0 : _b.id) !== command.gameID) {
                throw new InvalidParametersError_1.default(InvalidParametersError_1.GAME_ID_MISSMATCH_MESSAGE);
            }
            game.leave(player);
            this._stateUpdated(game.toModel());
            return undefined;
        }
        if (command.type === 'StartGame') {
            const game = this._game;
            if (!game) {
                throw new InvalidParametersError_1.default(InvalidParametersError_1.GAME_NOT_IN_PROGRESS_MESSAGE);
            }
            if (((_c = this._game) === null || _c === void 0 ? void 0 : _c.id) !== command.gameID) {
                throw new InvalidParametersError_1.default(InvalidParametersError_1.GAME_ID_MISSMATCH_MESSAGE);
            }
            game.startGame(player);
            this._stateUpdated(game.toModel());
            return undefined;
        }
        throw new InvalidParametersError_1.default(InvalidParametersError_1.INVALID_COMMAND_MESSAGE);
    }
}
exports.default = ConnectFourGameArea;
