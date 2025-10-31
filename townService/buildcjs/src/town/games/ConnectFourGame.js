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
function getOtherPlayerColor(color) {
    if (color === 'Yellow') {
        return 'Red';
    }
    return 'Yellow';
}
/**
 * A ConnectFourGame is a Game that implements the rules of Connect Four.
 * @see https://en.wikipedia.org/wiki/Connect_Four
 */
class ConnectFourGame extends Game_1.default {
    /**
     * Creates a new ConnectFourGame.
     * @param priorGame If provided, the new game will be created such that if either player
     * from the prior game joins, they will be the same color. When the game begins, the default
     * first player is red, but if either player from the prior game joins the new game
     * (and clicks "start"), the first player will be the other color.
     */
    constructor(priorGame) {
        super({
            moves: [],
            status: 'WAITING_FOR_PLAYERS',
            firstPlayer: getOtherPlayerColor((priorGame === null || priorGame === void 0 ? void 0 : priorGame.state.firstPlayer) || 'Yellow'),
        });
        this._preferredRed = priorGame === null || priorGame === void 0 ? void 0 : priorGame.state.red;
        this._preferredYellow = priorGame === null || priorGame === void 0 ? void 0 : priorGame.state.yellow;
    }
    /**
     * Indicates that a player is ready to start the game.
     *
     * Updates the game state to indicate that the player is ready to start the game.
     *
     * If both players are ready, the game will start.
     *
     * The first player (red or yellow) is determined as follows:
     *   - If neither player was in the last game in this area (or there was no prior game), the first player is red.
     *   - If at least one player was in the last game in this area, then the first player will be the other color from last game.
     *   - If a player from the last game *left* the game and then joined this one, they will be treated as a new player (not given the same color by preference).   *
     *
     * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
     * @throws InvalidParametersError if the game is not in the WAITING_TO_START state (GAME_NOT_STARTABLE_MESSAGE)
     *
     * @param player The player who is ready to start the game
     */
    startGame(player) {
        if (this.state.status !== 'WAITING_TO_START') {
            throw new InvalidParametersError_1.default(InvalidParametersError_1.GAME_NOT_STARTABLE_MESSAGE);
        }
        if (this.state.red !== player.id && this.state.yellow !== player.id) {
            throw new InvalidParametersError_1.default(InvalidParametersError_1.PLAYER_NOT_IN_GAME_MESSAGE);
        }
        if (this.state.red === player.id) {
            this.state.redReady = true;
        }
        if (this.state.yellow === player.id) {
            this.state.yellowReady = true;
        }
        // if none of the players from the last game are in this game, then the first player is red
        if (!(this._preferredRed === this.state.red || this._preferredYellow === this.state.yellow)) {
            this.state.firstPlayer = 'Red';
        }
        this.state = {
            ...this.state,
            status: this.state.redReady && this.state.yellowReady ? 'IN_PROGRESS' : 'WAITING_TO_START',
        };
    }
    /**
     * Joins a player to the game.
     * - Assigns the player to a color (red or yellow). If the player was in the prior game, then attempts
     * to reuse the same color if it is not in use. Otherwise, assigns the player to the first
     * available color (red, then yellow).
     * - If both players are now assigned, updates the game status to WAITING_TO_START.
     *
     * @throws InvalidParametersError if the player is already in the game (PLAYER_ALREADY_IN_GAME_MESSAGE)
     * @throws InvalidParametersError if the game is full (GAME_FULL_MESSAGE)
     *
     * @param player the player to join the game
     */
    _join(player) {
        if (this.state.yellow === player.id || this.state.red === player.id) {
            throw new InvalidParametersError_1.default(InvalidParametersError_1.PLAYER_ALREADY_IN_GAME_MESSAGE);
        }
        if (this._preferredRed === player.id && !this.state.red) {
            this.state = {
                ...this.state,
                status: 'WAITING_FOR_PLAYERS',
                red: player.id,
            };
        }
        else if (this._preferredYellow === player.id && !this.state.yellow) {
            this.state = {
                ...this.state,
                status: 'WAITING_FOR_PLAYERS',
                yellow: player.id,
            };
        }
        else if (!this.state.red) {
            this.state = {
                ...this.state,
                status: 'WAITING_FOR_PLAYERS',
                red: player.id,
            };
        }
        else if (!this.state.yellow) {
            this.state = {
                ...this.state,
                status: 'WAITING_FOR_PLAYERS',
                yellow: player.id,
            };
        }
        else {
            throw new InvalidParametersError_1.default(InvalidParametersError_1.GAME_FULL_MESSAGE);
        }
        if (this.state.red && this.state.yellow) {
            this.state.status = 'WAITING_TO_START';
        }
    }
    /**
     * Removes a player from the game.
     * Updates the game's state to reflect the player leaving.
     *
     * If the game state is currently "IN_PROGRESS", updates the game's status to OVER and sets the winner to the other player.
     *
     * If the game state is currently "WAITING_TO_START", updates the game's status to WAITING_FOR_PLAYERS.
     *
     * If the game state is currently "WAITING_FOR_PLAYERS" or "OVER", the game state is unchanged.
     *
     * @param player The player to remove from the game
     * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
     */
    _leave(player) {
        if (this.state.status === 'OVER') {
            return;
        }
        const removePlayer = (playerID) => {
            if (this.state.red === playerID) {
                this.state = {
                    ...this.state,
                    red: undefined,
                    redReady: false,
                };
                return 'Red';
            }
            if (this.state.yellow === playerID) {
                this.state = {
                    ...this.state,
                    yellow: undefined,
                    yellowReady: false,
                };
                return 'Yellow';
            }
            throw new InvalidParametersError_1.default(InvalidParametersError_1.PLAYER_NOT_IN_GAME_MESSAGE);
        };
        const color = removePlayer(player.id);
        switch (this.state.status) {
            case 'WAITING_TO_START':
            case 'WAITING_FOR_PLAYERS':
                // no-ops: nothing needs to happen here
                this.state.status = 'WAITING_FOR_PLAYERS';
                break;
            case 'IN_PROGRESS':
                this.state = {
                    ...this.state,
                    status: 'OVER',
                    winner: color === 'Red' ? this.state.yellow : this.state.red,
                };
                break;
            default:
                // This behavior can be undefined :)
                throw new Error(`Unexpected game status: ${this.state.status}`);
        }
    }
    /**
     * Ensures that "move" is valid given the current state of the game
     * Follows the rules of "Connect Four"
     * @param move
     */
    _validateMove(move) {
        // A move is invalid if the player is not the current player
        let nextPlayer;
        if (this.state.firstPlayer === 'Red') {
            nextPlayer = this.state.moves.length % 2 === 0 ? 'Red' : 'Yellow';
        }
        else {
            nextPlayer = this.state.moves.length % 2 === 0 ? 'Yellow' : 'Red';
        }
        if (move.gamePiece !== nextPlayer) {
            throw new InvalidParametersError_1.default(InvalidParametersError_1.MOVE_NOT_YOUR_TURN_MESSAGE);
        }
        // A move is invalid if the column is full
        const numMovesInCol = this.state.moves.filter(m => m.col === move.col).length;
        if (numMovesInCol === 6) {
            throw new InvalidParametersError_1.default(InvalidParametersError_1.BOARD_POSITION_NOT_VALID_MESSAGE);
        }
        // A move is invalid if it is not at the bottom of the column
        if (move.row !== 5 - numMovesInCol) {
            throw new InvalidParametersError_1.default(InvalidParametersError_1.BOARD_POSITION_NOT_VALID_MESSAGE);
        }
    }
    _applyMove(move) {
        const checkForTie = (moves) => 
        // If the board is full and there is no winner, by definition it's a tie!
        moves.length === 42;
        const checkForWin = (moves) => {
            // Check for a win in the column
            // TESTING NOTE: should check for cases where moves come out of order! The code created by co-pilot doesn't work in that case :)
            const board = new Array(6);
            for (let i = 0; i < board.length; i += 1) {
                board[i] = new Array(7).fill(undefined);
            }
            // Convert moves to board
            for (const eachMove of moves) {
                board[eachMove.row][eachMove.col] = eachMove.gamePiece;
            }
            // Check for win in a row
            for (let row = 0; row < board.length; row += 1) {
                let numInARow = 1;
                for (let col = 1; col < board[row].length; col += 1) {
                    if (board[row][col] && board[row][col] === board[row][col - 1]) {
                        numInARow += 1;
                    }
                    else {
                        numInARow = 1;
                    }
                    if (numInARow === 4) {
                        return true;
                    }
                }
            }
            // Check for a win in a column
            for (let col = 0; col < board[0].length; col += 1) {
                // Iterate through columns
                let numInARow = 1;
                for (let row = 1; row < board.length; row += 1) {
                    // Iterate through rows
                    if (board[row][col] && board[row][col] === board[row - 1][col]) {
                        numInARow += 1;
                    }
                    else {
                        numInARow = 1;
                    }
                    if (numInARow === 4) {
                        return true;
                    }
                }
            }
            // Check for a win in a diagonal from top left to bottom right
            for (let row = 0; row < board.length; row += 1) {
                for (let col = 0; col < board[row].length; col += 1) {
                    if (row + 3 < board.length &&
                        col + 3 < board[row].length &&
                        board[row][col] &&
                        board[row][col] === board[row + 1][col + 1] &&
                        board[row][col] === board[row + 2][col + 2] &&
                        board[row][col] === board[row + 3][col + 3]) {
                        return true;
                    }
                }
            }
            // Check for a win in a diagonal from bottom left to top right
            for (let row = 0; row < board.length; row += 1) {
                for (let col = 0; col < board[row].length; col += 1) {
                    if (row + 3 < board.length &&
                        col - 3 >= 0 &&
                        board[row][col] &&
                        board[row][col] === board[row + 1][col - 1] &&
                        board[row][col] === board[row + 2][col - 2] &&
                        board[row][col] === board[row + 3][col - 3]) {
                        return true;
                    }
                }
            }
            // Check for a win in a diagonal from bottom right to top left
            return false;
        };
        const newMoves = [...this.state.moves, move];
        const newState = {
            ...this.state,
            moves: newMoves,
        };
        if (checkForWin(newMoves)) {
            newState.status = 'OVER';
            newState.winner = move.gamePiece === 'Red' ? this.state.red : this.state.yellow;
        }
        else if (checkForTie(newMoves)) {
            newState.winner = undefined;
            newState.status = 'OVER';
        }
        this.state = newState;
    }
    /**
     * Applies a move to the game.
     * Uses the player's ID to determine which color they are playing as (ignores move.gamePiece).
     *
     * Validates the move, and if it is valid, applies it to the game state.
     *
     * If the move ends the game, updates the game state to reflect the end of the game,
     * setting the status to "OVER" and the winner to the player who won (or "undefined" if it was a tie)
     *
     * @param move The move to attempt to apply
     *
     * @throws InvalidParametersError if the game is not in progress (GAME_NOT_IN_PROGRESS_MESSAGE)
     * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
     * @throws INvalidParametersError if the move is not the player's turn (MOVE_NOT_YOUR_TURN_MESSAGE)
     * @throws InvalidParametersError if the move is invalid per the rules of Connect Four (BOARD_POSITION_NOT_VALID_MESSAGE)
     *
     */
    applyMove(move) {
        if (this.state.status !== 'IN_PROGRESS') {
            throw new InvalidParametersError_1.default(InvalidParametersError_1.GAME_NOT_IN_PROGRESS_MESSAGE);
        }
        let gamePiece;
        if (move.playerID === this.state.red) {
            gamePiece = 'Red';
        }
        else if (move.playerID === this.state.yellow) {
            gamePiece = 'Yellow';
        }
        else {
            throw new InvalidParametersError_1.default(InvalidParametersError_1.PLAYER_NOT_IN_GAME_MESSAGE);
        }
        const newMove = {
            gamePiece,
            col: move.move.col,
            row: move.move.row,
        };
        this._validateMove(newMove);
        this._applyMove(newMove);
    }
}
exports.default = ConnectFourGame;
