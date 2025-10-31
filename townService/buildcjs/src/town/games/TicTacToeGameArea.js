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
const assert_1 = __importDefault(require("assert"));
const InvalidParametersError_1 = __importStar(require("../../lib/InvalidParametersError"));
const GameArea_1 = __importDefault(require("./GameArea"));
const TicTacToeGame_1 = __importDefault(require("./TicTacToeGame"));
/**
 * A TicTacToeGameArea is a GameArea that hosts a TicTacToeGame.
 * @see TicTacToeGame
 * @see GameArea
 */
class TicTacToeGameArea extends GameArea_1.default {
    getType() {
        return 'TicTacToeArea';
    }
    _stateUpdated(updatedState) {
        var _a, _b, _c;
        if (updatedState.state.status === 'OVER') {
            // If we haven't yet recorded the outcome, do so now.
            const gameID = (_a = this._game) === null || _a === void 0 ? void 0 : _a.id;
            if (gameID && !this._history.find(eachResult => eachResult.gameID === gameID)) {
                const { x, o } = updatedState.state;
                if (x && o) {
                    const xName = ((_b = this._occupants.find(eachPlayer => eachPlayer.id === x)) === null || _b === void 0 ? void 0 : _b.userName) || x;
                    const oName = ((_c = this._occupants.find(eachPlayer => eachPlayer.id === o)) === null || _c === void 0 ? void 0 : _c.userName) || o;
                    this._history.push({
                        gameID,
                        scores: {
                            [xName]: updatedState.state.winner === x ? 1 : 0,
                            [oName]: updatedState.state.winner === o ? 1 : 0,
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
     * - GameMove (applies a move to the game)
     * - LeaveGame (leaves the game)
     *
     * If the command ended the game, records the outcome in this._history
     * If the command is successful (does not throw an error), calls this._emitAreaChanged (necessary
     *  to notify any listeners of a state update, including any change to history)
     * If the command is unsuccessful (throws an error), the error is propagated to the caller
     *
     * @see InteractableCommand
     *
     * @param command command to handle
     * @param player player making the request
     * @returns response to the command, @see InteractableCommandResponse
     * @throws InvalidParametersError if the command is not supported or is invalid. Invalid commands:
     *  - LeaveGame and GameMove: No game in progress (GAME_NOT_IN_PROGRESS_MESSAGE),
     *        or gameID does not match the game in progress (GAME_ID_MISSMATCH_MESSAGE)
     *  - Any command besides LeaveGame, GameMove and JoinGame: INVALID_COMMAND_MESSAGE
     */
    handleCommand(command, player) {
        var _a, _b;
        if (command.type === 'GameMove') {
            const game = this._game;
            if (!game) {
                throw new InvalidParametersError_1.default(InvalidParametersError_1.GAME_NOT_IN_PROGRESS_MESSAGE);
            }
            if (((_a = this._game) === null || _a === void 0 ? void 0 : _a.id) !== command.gameID) {
                throw new InvalidParametersError_1.default(InvalidParametersError_1.GAME_ID_MISSMATCH_MESSAGE);
            }
            (0, assert_1.default)(command.move.gamePiece === 'X' || command.move.gamePiece === 'O', 'Invalid game piece');
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
                game = new TicTacToeGame_1.default();
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
        throw new InvalidParametersError_1.default(InvalidParametersError_1.INVALID_COMMAND_MESSAGE);
    }
}
exports.default = TicTacToeGameArea;
