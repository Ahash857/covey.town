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
const Game_1 = __importDefault(require("./Game"));
/**
 * A TicTacToeGame is a Game that implements the rules of Tic Tac Toe.
 * @see https://en.wikipedia.org/wiki/Tic-tac-toe
 */
class TicTacToeGame extends Game_1.default {
    constructor() {
        super({
            moves: [],
            status: 'WAITING_TO_START',
        });
    }
    get _board() {
        const { moves } = this.state;
        const board = [
            ['', '', ''],
            ['', '', ''],
            ['', '', ''],
        ];
        for (const move of moves) {
            board[move.row][move.col] = move.gamePiece;
        }
        return board;
    }
    _checkForGameEnding() {
        const board = this._board;
        // A game ends when there are 3 in a row
        // Check for 3 in a row or column
        for (let i = 0; i < 3; i++) {
            if (board[i][0] !== '' && board[i][0] === board[i][1] && board[i][0] === board[i][2]) {
                this.state = {
                    ...this.state,
                    status: 'OVER',
                    winner: board[i][0] === 'X' ? this.state.x : this.state.o,
                };
                return;
            }
            if (board[0][i] !== '' && board[0][i] === board[1][i] && board[0][i] === board[2][i]) {
                this.state = {
                    ...this.state,
                    status: 'OVER',
                    winner: board[0][i] === 'X' ? this.state.x : this.state.o,
                };
                return;
            }
        }
        // Check for 3 in a diagonal
        if (board[0][0] !== '' && board[0][0] === board[1][1] && board[0][0] === board[2][2]) {
            this.state = {
                ...this.state,
                status: 'OVER',
                winner: board[0][0] === 'X' ? this.state.x : this.state.o,
            };
            return;
        }
        // Check for 3 in the other diagonal
        if (board[0][2] !== '' && board[0][2] === board[1][1] && board[0][2] === board[2][0]) {
            this.state = {
                ...this.state,
                status: 'OVER',
                winner: board[0][2] === 'X' ? this.state.x : this.state.o,
            };
            return;
        }
        // Check for no more moves
        if (this.state.moves.length === 9) {
            this.state = {
                ...this.state,
                status: 'OVER',
                winner: undefined,
            };
        }
    }
    _validateMove(move) {
        // A move is valid if the space is empty
        for (const m of this.state.moves) {
            if (m.col === move.col && m.row === move.row) {
                throw new InvalidParametersError_1.default(InvalidParametersError_1.BOARD_POSITION_NOT_EMPTY_MESSAGE);
            }
        }
        // A move is only valid if it is the player's turn
        if (move.gamePiece === 'X' && this.state.moves.length % 2 === 1) {
            throw new InvalidParametersError_1.default(InvalidParametersError_1.MOVE_NOT_YOUR_TURN_MESSAGE);
        }
        else if (move.gamePiece === 'O' && this.state.moves.length % 2 === 0) {
            throw new InvalidParametersError_1.default(InvalidParametersError_1.MOVE_NOT_YOUR_TURN_MESSAGE);
        }
        // A move is valid only if game is in progress
        if (this.state.status !== 'IN_PROGRESS') {
            throw new InvalidParametersError_1.default(InvalidParametersError_1.GAME_NOT_IN_PROGRESS_MESSAGE);
        }
    }
    _applyMove(move) {
        this.state = {
            ...this.state,
            moves: [...this.state.moves, move],
        };
        this._checkForGameEnding();
    }
    /*
     * Applies a player's move to the game.
     * Uses the player's ID to determine which game piece they are using (ignores move.gamePiece)
     * Validates the move before applying it. If the move is invalid, throws an InvalidParametersError with
     * the error message specified below.
     * A move is invalid if:
     *    - The move is out of bounds (not in the 3x3 grid - use MOVE_OUT_OF_BOUNDS_MESSAGE)
     *    - The move is on a space that is already occupied (use BOARD_POSITION_NOT_EMPTY_MESSAGE)
     *    - The move is not the player's turn (MOVE_NOT_YOUR_TURN_MESSAGE)
     *    - The game is not in progress (GAME_NOT_IN_PROGRESS_MESSAGE)
     *
     * If the move is valid, applies the move to the game and updates the game state.
     *
     * If the move ends the game, updates the game's state.
     * If the move results in a tie, updates the game's state to set the status to OVER and sets winner to undefined.
     * If the move results in a win, updates the game's state to set the status to OVER and sets the winner to the player who made the move.
     * A player wins if they have 3 in a row (horizontally, vertically, or diagonally).
     *
     * @param move The move to apply to the game
     * @throws InvalidParametersError if the move is invalid
     */
    applyMove(move) {
        let gamePiece;
        if (move.playerID === this.state.x) {
            gamePiece = 'X';
        }
        else {
            gamePiece = 'O';
        }
        const cleanMove = {
            gamePiece,
            col: move.move.col,
            row: move.move.row,
        };
        this._validateMove(cleanMove);
        this._applyMove(cleanMove);
    }
    /**
     * Adds a player to the game.
     * Updates the game's state to reflect the new player.
     * If the game is now full (has two players), updates the game's state to set the status to IN_PROGRESS.
     *
     * @param player The player to join the game
     * @throws InvalidParametersError if the player is already in the game (PLAYER_ALREADY_IN_GAME_MESSAGE)
     *  or the game is full (GAME_FULL_MESSAGE)
     */
    _join(player) {
        if (this.state.x === player.id || this.state.o === player.id) {
            throw new InvalidParametersError_1.default(InvalidParametersError_1.PLAYER_ALREADY_IN_GAME_MESSAGE);
        }
        if (!this.state.x) {
            this.state = {
                ...this.state,
                x: player.id,
            };
        }
        else if (!this.state.o) {
            this.state = {
                ...this.state,
                o: player.id,
            };
        }
        else {
            throw new InvalidParametersError_1.default(InvalidParametersError_1.GAME_FULL_MESSAGE);
        }
        if (this.state.x && this.state.o) {
            this.state = {
                ...this.state,
                status: 'IN_PROGRESS',
            };
        }
    }
    /**
     * Removes a player from the game.
     * Updates the game's state to reflect the player leaving.
     * If the game has two players in it at the time of call to this method,
     *   updates the game's status to OVER and sets the winner to the other player.
     * If the game does not yet have two players in it at the time of call to this method,
     *   updates the game's status to WAITING_TO_START.
     *
     * @param player The player to remove from the game
     * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
     */
    _leave(player) {
        if (this.state.x !== player.id && this.state.o !== player.id) {
            throw new InvalidParametersError_1.default(InvalidParametersError_1.PLAYER_NOT_IN_GAME_MESSAGE);
        }
        // Handles case where the game has not started yet
        if (this.state.o === undefined) {
            this.state = {
                moves: [],
                status: 'WAITING_TO_START',
            };
            return;
        }
        if (this.state.x === player.id) {
            this.state = {
                ...this.state,
                status: 'OVER',
                winner: this.state.o,
            };
        }
        else {
            this.state = {
                ...this.state,
                status: 'OVER',
                winner: this.state.x,
            };
        }
    }
}
exports.default = TicTacToeGame;
