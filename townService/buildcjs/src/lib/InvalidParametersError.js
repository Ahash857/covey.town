"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAYER_ALREADY_IN_GAME_MESSAGE = exports.PLAYER_NOT_IN_GAME_MESSAGE = exports.BOARD_POSITION_NOT_VALID_MESSAGE = exports.MOVE_NOT_YOUR_TURN_MESSAGE = exports.BOARD_POSITION_NOT_EMPTY_MESSAGE = exports.GAME_NOT_STARTABLE_MESSAGE = exports.GAME_ID_MISSMATCH_MESSAGE = exports.GAME_OVER_MESSAGE = exports.GAME_NOT_IN_PROGRESS_MESSAGE = exports.GAME_FULL_MESSAGE = exports.INVALID_COMMAND_MESSAGE = exports.INVALID_MOVE_MESSAGE = void 0;
exports.INVALID_MOVE_MESSAGE = 'Invalid move';
exports.INVALID_COMMAND_MESSAGE = 'Invalid command';
exports.GAME_FULL_MESSAGE = 'Game is full';
exports.GAME_NOT_IN_PROGRESS_MESSAGE = 'Game is not in progress';
exports.GAME_OVER_MESSAGE = 'Game is over';
exports.GAME_ID_MISSMATCH_MESSAGE = 'Game ID mismatch';
exports.GAME_NOT_STARTABLE_MESSAGE = 'Game is not startable';
exports.BOARD_POSITION_NOT_EMPTY_MESSAGE = 'Board position is not empty';
exports.MOVE_NOT_YOUR_TURN_MESSAGE = 'Not your turn';
exports.BOARD_POSITION_NOT_VALID_MESSAGE = 'Board position is not valid';
exports.PLAYER_NOT_IN_GAME_MESSAGE = 'Player is not in this game';
exports.PLAYER_ALREADY_IN_GAME_MESSAGE = 'Player is already in this game';
class InvalidParametersError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
    }
}
exports.default = InvalidParametersError;
