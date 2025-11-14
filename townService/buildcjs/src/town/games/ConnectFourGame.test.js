"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const console_1 = require("console");
const InvalidParametersError_1 = require("../../lib/InvalidParametersError");
const TestUtils_1 = require("../../TestUtils");
const ConnectFourGame_1 = __importDefault(require("./ConnectFourGame"));
const logger = new console_1.Console(process.stdout, process.stderr);
function createMovesFromPattern(game, pattern, redID, yellowID, firstColor) {
    const queues = {
        Yellow: [],
        Red: [],
    };
    pattern.forEach((row, rowIdx) => {
        row.forEach((col, colIdx) => {
            if (col === 'Y') {
                queues.Yellow.push({
                    rowIdx: rowIdx,
                    colIdx: colIdx,
                });
            }
            else if (col === 'R') {
                queues.Red.push({
                    rowIdx: rowIdx,
                    colIdx: colIdx,
                });
            }
            else if (col !== '_') {
                throw new Error(`Invalid pattern: ${pattern}, expecting 2-d array of Y, R or _`);
            }
        });
    });
    const queueSorter = (a, b) => {
        function cellNumber(move) {
            return 6 * (5 - move.rowIdx) + move.colIdx;
        }
        return cellNumber(a) - cellNumber(b);
    };
    queues.Yellow.sort(queueSorter);
    queues.Red.sort(queueSorter);
    const colHeights = [5, 5, 5, 5, 5, 5, 5];
    const movesMade = [[], [], [], [], [], []];
    const makeMove = (color) => {
        const queue = queues[color];
        if (queue.length === 0)
            return;
        for (const move of queue) {
            if (move.rowIdx === colHeights[move.colIdx]) {
                game.applyMove({
                    gameID: game.id,
                    move: {
                        gamePiece: color,
                        col: move.colIdx,
                        row: move.rowIdx,
                    },
                    playerID: color === 'Red' ? redID : yellowID,
                });
                movesMade[move.rowIdx][move.colIdx] = color === 'Red' ? 'R' : 'Y';
                queues[color] = queue.filter(m => m !== move);
                colHeights[move.colIdx] -= 1;
                return;
            }
        }
        logger.table(pattern);
        logger.table(movesMade);
        throw new Error(`Unable to apply pattern: ${JSON.stringify(pattern, null, 2)}
      If this is a pattern in the autograder: are you sure that you checked for game-ending conditions? If this is a pattern you provided: please double-check your pattern - it may be invalid.`);
    };
    const gameOver = () => game.state.status === 'OVER';
    while (queues.Yellow.length > 0 || queues.Red.length > 0) {
        makeMove(firstColor);
        if (gameOver())
            return;
        makeMove(firstColor === 'Red' ? 'Yellow' : 'Red');
        if (gameOver())
            return;
    }
}
describe('ConnectFourGame', () => {
    let game;
    beforeEach(() => {
        game = new ConnectFourGame_1.default();
    });
    describe('[T1.1] _join', () => {
        it('should throw an error if the player is already in the game', () => {
            const player = (0, TestUtils_1.createPlayerForTesting)();
            game.join(player);
            expect(() => game.join(player)).toThrowError(InvalidParametersError_1.PLAYER_ALREADY_IN_GAME_MESSAGE);
            const player2 = (0, TestUtils_1.createPlayerForTesting)();
            game.join(player2);
            expect(() => game.join(player2)).toThrowError(InvalidParametersError_1.PLAYER_ALREADY_IN_GAME_MESSAGE);
        });
        it('should throw an error if the player is not in the game and the game is full', () => {
            const player1 = (0, TestUtils_1.createPlayerForTesting)();
            const player2 = (0, TestUtils_1.createPlayerForTesting)();
            const player3 = (0, TestUtils_1.createPlayerForTesting)();
            game.join(player1);
            game.join(player2);
            expect(() => game.join(player3)).toThrowError(InvalidParametersError_1.GAME_FULL_MESSAGE);
        });
        describe('if the player is not in the game and the game is not full', () => {
            describe('if the player was not the yellow in the last game', () => {
                it('should add the player as red if red is empty', () => {
                    const red = (0, TestUtils_1.createPlayerForTesting)();
                    game.join(red);
                    expect(game.state.red).toBe(red.id);
                    expect(game.state.yellow).toBeUndefined();
                    expect(game.state.redReady).toBeFalsy();
                    expect(game.state.yellowReady).toBeFalsy();
                    expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
                });
                it('should add the player as yellow if red is present', () => {
                    const red = (0, TestUtils_1.createPlayerForTesting)();
                    const yellow = (0, TestUtils_1.createPlayerForTesting)();
                    game.join(red);
                    expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
                    game.join(yellow);
                    expect(game.state.red).toBe(red.id);
                    expect(game.state.yellow).toBe(yellow.id);
                    expect(game.state.redReady).toBeFalsy();
                    expect(game.state.yellowReady).toBeFalsy();
                    expect(game.state.status).toBe('WAITING_TO_START');
                });
            });
            describe('if the player was yellow in the last game', () => {
                it('should add the player as yellow if yellow is empty', () => {
                    const red = (0, TestUtils_1.createPlayerForTesting)();
                    const yellow = (0, TestUtils_1.createPlayerForTesting)();
                    game.join(red);
                    game.join(yellow);
                    expect(game.state.red).toBe(red.id);
                    expect(game.state.yellow).toBe(yellow.id);
                    const secondGame = new ConnectFourGame_1.default(game);
                    expect(secondGame.state.red).toBeUndefined();
                    expect(secondGame.state.yellow).toBeUndefined();
                    secondGame.join(yellow);
                    expect(secondGame.state.red).toBe(undefined);
                    expect(secondGame.state.yellow).toBe(yellow.id);
                    const newRed = (0, TestUtils_1.createPlayerForTesting)();
                    secondGame.join(newRed);
                    expect(secondGame.state.red).toBe(newRed.id);
                });
            });
            it('should set the status to WAITING_TO_START if both players are present', () => {
                const red = (0, TestUtils_1.createPlayerForTesting)();
                const yellow = (0, TestUtils_1.createPlayerForTesting)();
                game.join(red);
                game.join(yellow);
                expect(game.state.status).toBe('WAITING_TO_START');
                expect(game.state.redReady).toBeFalsy();
                expect(game.state.yellowReady).toBeFalsy();
            });
        });
    });
    describe('[T1.2] _startGame', () => {
        test('if the status is not WAITING_TO_START, it throws an error', () => {
            const player = (0, TestUtils_1.createPlayerForTesting)();
            game.join(player);
            expect(() => game.startGame(player)).toThrowError(InvalidParametersError_1.GAME_NOT_STARTABLE_MESSAGE);
        });
        test('if the player is not in the game, it throws an error', () => {
            game.join((0, TestUtils_1.createPlayerForTesting)());
            game.join((0, TestUtils_1.createPlayerForTesting)());
            expect(() => game.startGame((0, TestUtils_1.createPlayerForTesting)())).toThrowError(InvalidParametersError_1.PLAYER_NOT_IN_GAME_MESSAGE);
        });
        describe('if the player is in the game', () => {
            const red = (0, TestUtils_1.createPlayerForTesting)();
            const yellow = (0, TestUtils_1.createPlayerForTesting)();
            beforeEach(() => {
                game.join(red);
                game.join(yellow);
            });
            test('if the player is red, it sets redReady to true', () => {
                game.startGame(red);
                expect(game.state.redReady).toBe(true);
                expect(game.state.yellowReady).toBeFalsy();
                expect(game.state.status).toBe('WAITING_TO_START');
            });
            test('if the player is yellow, it sets yellowReady to true', () => {
                game.startGame(yellow);
                expect(game.state.redReady).toBeFalsy();
                expect(game.state.yellowReady).toBe(true);
                expect(game.state.status).toBe('WAITING_TO_START');
            });
            test('if both players are ready, it sets the status to IN_PROGRESS', () => {
                game.startGame(red);
                game.startGame(yellow);
                expect(game.state.redReady).toBe(true);
                expect(game.state.yellowReady).toBe(true);
                expect(game.state.status).toBe('IN_PROGRESS');
            });
            test('if a player already reported ready, it does not change the status or throw an error', () => {
                game.startGame(red);
                game.startGame(red);
                expect(game.state.redReady).toBe(true);
                expect(game.state.yellowReady).toBeFalsy();
                expect(game.state.status).toBe('WAITING_TO_START');
            });
            test('if there are not any players from a prior game, it always sets the first player to red when the game starts', () => {
                game.startGame(red);
                game.startGame(yellow);
                game.leave(red);
                expect(game.state.status).toBe('OVER');
                const secondGame = new ConnectFourGame_1.default(game);
                secondGame.join(red);
                expect(secondGame.state.red).toBe(red.id);
                const newYellow = (0, TestUtils_1.createPlayerForTesting)();
                secondGame.join(newYellow);
                expect(secondGame.state.yellow).toBe(newYellow.id);
                secondGame.leave(red);
                const newRed = (0, TestUtils_1.createPlayerForTesting)();
                secondGame.join(newRed);
                secondGame.startGame(newYellow);
                secondGame.startGame(newRed);
                expect(secondGame.state.firstPlayer).toBe('Red');
            });
            test('if there are players from a prior game, it sets the first player to the player who was not first in the last game', () => {
                game.startGame(red);
                game.startGame(yellow);
                game.leave(red);
                const secondGame = new ConnectFourGame_1.default(game);
                const newRed = (0, TestUtils_1.createPlayerForTesting)();
                secondGame.join(newRed);
                secondGame.join(yellow);
                secondGame.startGame(newRed);
                secondGame.startGame(yellow);
                expect(secondGame.state.firstPlayer).toBe('Yellow');
            });
        });
    });
    describe('[T1.3] _leave', () => {
        it('should throw an error if the player is not in the game', () => {
            const player = (0, TestUtils_1.createPlayerForTesting)();
            expect(() => game.leave(player)).toThrowError(InvalidParametersError_1.PLAYER_NOT_IN_GAME_MESSAGE);
            game.join(player);
            expect(() => game.leave((0, TestUtils_1.createPlayerForTesting)())).toThrowError(InvalidParametersError_1.PLAYER_NOT_IN_GAME_MESSAGE);
        });
        describe('when the player is in the game', () => {
            describe('when the game is in progress', () => {
                test('if the player is red, it sets the winner to yellow and status to OVER', () => {
                    const red = (0, TestUtils_1.createPlayerForTesting)();
                    const yellow = (0, TestUtils_1.createPlayerForTesting)();
                    game.join(red);
                    game.join(yellow);
                    game.startGame(red);
                    game.startGame(yellow);
                    game.leave(red);
                    expect(game.state.winner).toBe(yellow.id);
                    expect(game.state.status).toBe('OVER');
                });
                test('if the player is yellow, it sets the winner to red and status to OVER', () => {
                    const red = (0, TestUtils_1.createPlayerForTesting)();
                    const yellow = (0, TestUtils_1.createPlayerForTesting)();
                    game.join(red);
                    game.join(yellow);
                    game.startGame(red);
                    game.startGame(yellow);
                    game.leave(yellow);
                    expect(game.state.winner).toBe(red.id);
                    expect(game.state.status).toBe('OVER');
                });
            });
            test('when the game is already over before the player leaves, it does not update the state', () => {
                const red = (0, TestUtils_1.createPlayerForTesting)();
                const yellow = (0, TestUtils_1.createPlayerForTesting)();
                game.join(red);
                game.join(yellow);
                game.startGame(red);
                game.startGame(yellow);
                expect(game.state.yellow).toBe(yellow.id);
                expect(game.state.red).toBe(red.id);
                game.leave(red);
                expect(game.state.status).toBe('OVER');
                const stateBeforeLeaving = { ...game.state };
                game.leave(yellow);
                expect(game.state).toEqual(stateBeforeLeaving);
            });
            describe('when the game is waiting to start, with status WAITING_TO_START', () => {
                test('if the player is red, it sets red to undefined and status to WAITING_FOR_PLAYERS', () => {
                    const red = (0, TestUtils_1.createPlayerForTesting)();
                    const yellow = (0, TestUtils_1.createPlayerForTesting)();
                    game.join(red);
                    expect(game.state.redReady).toBeFalsy();
                    game.join(yellow);
                    game.startGame(red);
                    expect(game.state.redReady).toBeTruthy();
                    game.leave(red);
                    expect(game.state.redReady).toBeFalsy();
                    expect(game.state.red).toBeUndefined();
                    expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
                });
                test('if the player is yellow, it sets yellow to undefined and status to WAITING_FOR_PLAYERS', () => {
                    const red = (0, TestUtils_1.createPlayerForTesting)();
                    const yellow = (0, TestUtils_1.createPlayerForTesting)();
                    game.join(red);
                    game.join(yellow);
                    expect(game.state.yellowReady).toBeFalsy();
                    game.startGame(yellow);
                    expect(game.state.yellowReady).toBeTruthy();
                    game.leave(yellow);
                    expect(game.state.yellowReady).toBeFalsy();
                    expect(game.state.yellow).toBeUndefined();
                    expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
                });
                test('if the player is red, and the "preferred yellow" player joins, it should add the player as red', () => {
                    const red = (0, TestUtils_1.createPlayerForTesting)();
                    const yellow = (0, TestUtils_1.createPlayerForTesting)();
                    game.join(red);
                    game.join(yellow);
                    expect(game.state.red).toBe(red.id);
                    expect(game.state.yellow).toBe(yellow.id);
                    expect(game.state.redReady).toBeFalsy();
                    expect(game.state.yellowReady).toBeFalsy();
                    expect(game.state.status).toBe('WAITING_TO_START');
                    const secondGame = new ConnectFourGame_1.default(game);
                    expect(secondGame.state.red).toBeUndefined();
                    expect(secondGame.state.yellow).toBeUndefined();
                    const newRed = (0, TestUtils_1.createPlayerForTesting)();
                    secondGame.join(newRed);
                    expect(secondGame.state.red).toBe(newRed.id);
                    const newYellow = (0, TestUtils_1.createPlayerForTesting)();
                    secondGame.join(newYellow);
                    expect(secondGame.state.yellow).toBe(newYellow.id);
                    secondGame.leave(newRed);
                    secondGame.join(yellow);
                    expect(secondGame.state.red).toBe(yellow.id);
                    expect(secondGame.state.yellow).toBe(newYellow.id);
                });
            });
            describe('when the game is waiting for players, in state WAITING_FOR_PLAYERS', () => {
                test('if the player is red, it sets red to undefined, redReady to false and status remains WAITING_FOR_PLAYERS', () => {
                    const red = (0, TestUtils_1.createPlayerForTesting)();
                    game.join(red);
                    expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
                    game.leave(red);
                    expect(game.state.red).toBeUndefined();
                    expect(game.state.redReady).toBeFalsy();
                    expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
                });
                test('if the player is yellow, it sets yellow to undefined, yellowReady to false and status remains WAITING_FOR_PLAYERS', () => {
                    const red = (0, TestUtils_1.createPlayerForTesting)();
                    const yellow = (0, TestUtils_1.createPlayerForTesting)();
                    game.join(red);
                    game.join(yellow);
                    game.leave(red);
                    const secondGame = new ConnectFourGame_1.default(game);
                    secondGame.join(yellow);
                    expect(secondGame.state.yellow).toBe(yellow.id);
                    expect(secondGame.state.status).toBe('WAITING_FOR_PLAYERS');
                    secondGame.leave(yellow);
                    expect(secondGame.state.yellow).toBeUndefined();
                    expect(secondGame.state.yellowReady).toBeFalsy();
                    expect(secondGame.state.status).toBe('WAITING_FOR_PLAYERS');
                });
            });
        });
    });
    describe('applyMove', () => {
        const red = (0, TestUtils_1.createPlayerForTesting)();
        const yellow = (0, TestUtils_1.createPlayerForTesting)();
        beforeEach(() => {
            game.join(red);
            game.join(yellow);
            game.startGame(red);
            game.startGame(yellow);
        });
        describe('[T2.1] Determining who is the first player', () => {
            test('If there is no prior game, the first player is red', () => {
                expect(game.state.firstPlayer).toEqual('Red');
            });
            test('If there is a prior game, and both players join this one, then the first player is the player who was NOT first in the last game', () => {
                expect(game.state.firstPlayer).toEqual('Red');
                const game2 = new ConnectFourGame_1.default(game);
                game2.join(red);
                game2.join(yellow);
                game2.startGame(red);
                game2.startGame(yellow);
                expect(game2.state.firstPlayer).toEqual('Yellow');
            });
            test('If there is a prior game, and only one player joins this one, then that player will be first if they were NOT first in the last game', () => {
                expect(game.state.firstPlayer).toEqual('Red');
                const game2 = new ConnectFourGame_1.default(game);
                const newPlayer = (0, TestUtils_1.createPlayerForTesting)();
                game2.join(newPlayer);
                game2.join(yellow);
                game2.startGame(newPlayer);
                game2.startGame(yellow);
                expect(game2.state.firstPlayer).toEqual('Yellow');
                const game3 = new ConnectFourGame_1.default(game2);
                const newPlayer2 = (0, TestUtils_1.createPlayerForTesting)();
                game3.join(newPlayer2);
                game3.join(yellow);
                game3.startGame(newPlayer2);
                game3.startGame(yellow);
                expect(game3.state.firstPlayer).toEqual('Red');
            });
        });
        describe('[T2.2] when given a valid move', () => {
            it.each([0, 1, 2, 3, 4, 5, 6])('should add the move to the game state in column %d and not end the game', (col) => {
                game.applyMove({
                    gameID: game.id,
                    playerID: red.id,
                    move: { gamePiece: 'Red', col: col, row: 5 },
                });
                expect(game.state.moves[0]).toEqual({
                    gamePiece: 'Red',
                    col: col,
                    row: 5,
                });
                expect(game.state.status).toBe('IN_PROGRESS');
            });
            it.each([0, 1, 2, 3, 4, 5])('should permit stacking the moves in column %d and not end the game if the move does not win', (col) => {
                for (let i = 0; i < 3; i++) {
                    game.applyMove({
                        gameID: game.id,
                        playerID: red.id,
                        move: {
                            gamePiece: 'Red',
                            col: col,
                            row: (5 - 2 * i),
                        },
                    });
                    game.applyMove({
                        gameID: game.id,
                        playerID: yellow.id,
                        move: {
                            gamePiece: 'Yellow',
                            col: col,
                            row: (4 - 2 * i),
                        },
                    });
                }
                for (let i = 0; i < 3; i++) {
                    expect(game.state.moves[2 * i]).toEqual({
                        gamePiece: 'Red',
                        col: col,
                        row: (5 - 2 * i),
                    });
                    expect(game.state.moves[2 * i + 1]).toEqual({
                        gamePiece: 'Yellow',
                        col: col,
                        row: (4 - 2 * i),
                    });
                }
                expect(game.state.status).toBe('IN_PROGRESS');
            });
        });
        describe('[T2.3] when given a move that wins the game, it ends the game and declares the winner', () => {
            test('horizontal wins in the first row', () => {
                createMovesFromPattern(game, [[], [], [], [], [], ['Y', 'Y', 'Y', 'R', 'R', 'R', 'R']], red.id, yellow.id, 'Red');
                expect(game.state.status).toBe('OVER');
                expect(game.state.winner).toBe(red.id);
                const secondGame = new ConnectFourGame_1.default(game);
                secondGame.join(red);
                secondGame.join(yellow);
                secondGame.startGame(red);
                secondGame.startGame(yellow);
                createMovesFromPattern(secondGame, [
                    [],
                    [],
                    [],
                    [],
                    ['R', 'R', 'R', 'Y', 'R', 'R', 'R'],
                    ['Y', 'Y', 'R', 'Y', 'Y', 'Y', 'Y'],
                ], red.id, yellow.id, 'Yellow');
                const thirdGame = new ConnectFourGame_1.default(secondGame);
                thirdGame.join(red);
                thirdGame.join(yellow);
                thirdGame.startGame(red);
                thirdGame.startGame(yellow);
                createMovesFromPattern(thirdGame, [[], [], [], [], ['R', 'R', 'R'], ['Y', 'Y', 'Y', 'Y', 'R', 'R', 'R']], red.id, yellow.id, 'Red');
            });
            test('horizontal wins in the top row', () => {
                const pattern = [
                    ['R', 'R', 'R', 'R', 'Y', 'Y', 'Y'],
                    ['Y', 'R', 'Y', 'Y', 'R', 'Y', 'Y'],
                    ['R', 'Y', 'Y', 'Y', 'R', 'R', 'R'],
                    ['Y', 'R', 'Y', 'Y', 'R', 'Y', 'Y'],
                    ['Y', 'R', 'R', 'R', 'Y', 'R', 'R'],
                    ['Y', 'R', 'Y', 'Y', 'R', 'R', 'R'],
                ];
                createMovesFromPattern(game, pattern, red.id, yellow.id, 'Red');
                expect(game.state.status).toBe('OVER');
                expect(game.state.winner).toBe(red.id);
            });
            test('horizontal wins right aligned', () => {
                const pattern = [
                    ['Y', 'Y', 'Y', 'R', 'R', 'R', 'R'],
                    ['Y', 'R', 'Y', 'Y', 'R', 'Y', 'Y'],
                    ['R', 'Y', 'R', 'Y', 'Y', 'R', 'R'],
                    ['Y', 'R', 'Y', 'Y', 'R', 'Y', 'Y'],
                    ['Y', 'R', 'R', 'R', 'Y', 'R', 'R'],
                    ['Y', 'R', 'Y', 'Y', 'R', 'R', 'R'],
                ];
                createMovesFromPattern(game, pattern, red.id, yellow.id, 'Red');
                expect(game.state.status).toBe('OVER');
                expect(game.state.winner).toBe(red.id);
            });
            test('vertical wins', () => {
                const pattern = [[], [], ['R'], ['R'], ['R', 'Y'], ['R', 'Y', 'Y', 'Y']];
                createMovesFromPattern(game, pattern, red.id, yellow.id, 'Red');
                expect(game.state.status).toBe('OVER');
                expect(game.state.winner).toBe(red.id);
                const secondGame = new ConnectFourGame_1.default(game);
                secondGame.join(red);
                secondGame.join(yellow);
                secondGame.startGame(red);
                secondGame.startGame(yellow);
                const secondPattern = [
                    [],
                    [],
                    ['_', '_', '_', '_', '_', 'Y'],
                    ['_', '_', '_', '_', '_', 'Y'],
                    ['_', '_', '_', '_', '_', 'Y'],
                    ['R', 'R', 'R', 'Y', 'R', 'Y'],
                ];
                createMovesFromPattern(secondGame, secondPattern, red.id, yellow.id, 'Yellow');
                expect(secondGame.state.status).toBe('OVER');
                expect(secondGame.state.winner).toBe(yellow.id);
            });
            test.each([
                {
                    board: [
                        ['_', '_', '_', '_', '_', '_', '_'],
                        ['_', '_', '_', '_', '_', '_', '_'],
                        ['_', '_', 'Y', 'R', '_', '_', '_'],
                        ['_', '_', 'R', 'R', '_', '_', '_'],
                        ['_', 'R', 'Y', 'Y', '_', '_', '_'],
                        ['R', 'R', 'Y', 'Y', '_', '_', '_'],
                    ],
                    expectedWinner: 'Red',
                },
                {
                    board: [
                        ['_', '_', '_', '_', '_', 'R', 'Y'],
                        ['_', '_', '_', '_', '_', 'Y', 'R'],
                        ['_', '_', '_', '_', 'Y', 'Y', 'R'],
                        ['_', '_', '_', 'Y', 'R', 'Y', 'R'],
                        ['_', '_', '_', 'R', 'Y', 'R', 'Y'],
                        ['_', '_', '_', 'Y', 'R', 'R', 'R'],
                    ],
                    expectedWinner: 'Yellow',
                },
                {
                    board: [
                        ['_', '_', '_', '_', '_', 'R', 'Y'],
                        ['_', '_', '_', '_', '_', 'Y', 'R'],
                        ['_', '_', '_', '_', 'R', 'Y', 'Y'],
                        ['_', '_', '_', 'Y', 'R', 'Y', 'R'],
                        ['_', '_', '_', 'R', 'Y', 'R', 'Y'],
                        ['_', '_', '_', 'Y', 'R', 'R', 'R'],
                    ],
                    expectedWinner: 'Yellow',
                },
                {
                    board: [
                        [],
                        ['Y', 'R', 'Y', 'R', 'Y'],
                        ['Y', 'R', 'R', 'Y', 'Y'],
                        ['R', 'Y', 'Y', 'Y', 'R'],
                        ['R', 'R', 'Y', 'Y', 'R'],
                        ['R', 'Y', 'Y', 'Y', 'R'],
                    ],
                    expectedWinner: 'Yellow',
                },
                {
                    board: [
                        ['_', '_', '_', '_', '_', '_', '_'],
                        ['_', '_', '_', '_', '_', '_', '_'],
                        ['_', '_', '_', 'Y', '_', '_', '_'],
                        ['_', '_', '_', 'R', 'Y', '_', '_'],
                        ['_', '_', '_', 'R', 'R', 'Y', '_'],
                        ['_', '_', '_', 'Y', 'R', 'R', 'Y'],
                    ],
                    expectedWinner: 'Yellow',
                },
            ])('diagonal wins', ({ board, expectedWinner }) => {
                createMovesFromPattern(game, board, red.id, yellow.id, 'Red');
                expect(game.state.status).toBe('OVER');
                expect(game.state.winner).toBe(expectedWinner === 'Red' ? red.id : yellow.id);
            });
        });
        describe('[T2.3] when given a move that does not win the game, it does not end it', () => {
            test('Near-win horizontally', () => {
                createMovesFromPattern(game, [
                    ['_', '_', '_', '_', '_', '_', '_'],
                    ['_', '_', '_', '_', '_', '_', '_'],
                    ['_', '_', '_', '_', '_', '_', '_'],
                    ['_', '_', '_', '_', '_', '_', '_'],
                    ['_', 'Y', 'Y', 'Y', '_', '_', '_'],
                    ['_', 'R', 'R', 'R', '_', '_', '_'],
                ], red.id, yellow.id, 'Red');
                expect(game.state.status).toBe('IN_PROGRESS');
                expect(game.state.winner).toBeUndefined();
            });
            test('Near-win vertically', () => {
                createMovesFromPattern(game, [
                    ['_', '_', '_', '_', '_', '_', '_'],
                    ['_', '_', '_', '_', '_', '_', '_'],
                    ['_', '_', '_', '_', '_', '_', '_'],
                    ['R', 'Y', '_', '_', '_', '_', '_'],
                    ['R', 'Y', '_', '_', '_', '_', '_'],
                    ['R', 'Y', '_', '_', '_', '_', '_'],
                ], red.id, yellow.id, 'Red');
                expect(game.state.status).toBe('IN_PROGRESS');
                expect(game.state.winner).toBeUndefined();
            });
            test.each([
                {
                    board: [
                        ['_', '_', '_', '_', '_', '_', '_'],
                        ['_', '_', '_', '_', '_', '_', '_'],
                        ['_', '_', '_', '_', '_', '_', '_'],
                        ['_', '_', 'R', 'Y', '_', '_', '_'],
                        ['Y', 'R', 'R', 'Y', '_', '_', '_'],
                        ['R', 'Y', 'R', 'Y', '_', '_', '_'],
                    ],
                    expectedWinner: undefined,
                },
                {
                    board: [
                        ['R', 'Y', '_', '_', '_', '_', '_'],
                        ['Y', 'R', '_', '_', '_', '_', '_'],
                        ['Y', 'R', 'Y', 'R', '_', '_', '_'],
                        ['R', 'Y', 'Y', 'R', '_', '_', '_'],
                        ['Y', 'R', 'R', 'Y', '_', '_', '_'],
                        ['R', 'Y', 'R', 'R', 'Y', '_', '_'],
                    ],
                    expectedWinner: undefined,
                },
            ])('Near-win diagonally', ({ board }) => {
                createMovesFromPattern(game, board, red.id, yellow.id, 'Red');
                expect(game.state.status).toBe('IN_PROGRESS');
                expect(game.state.winner).toBeUndefined();
            });
        });
        it('[T2.3] should declare a tie if the board is full and no one has won', () => {
            createMovesFromPattern(game, [
                ['Y', 'R', 'R', 'R', 'Y', 'R', 'Y'],
                ['Y', 'R', 'Y', 'Y', 'R', 'Y', 'Y'],
                ['R', 'Y', 'Y', 'Y', 'R', 'R', 'R'],
                ['Y', 'R', 'Y', 'Y', 'R', 'Y', 'Y'],
                ['Y', 'R', 'R', 'R', 'Y', 'R', 'R'],
                ['Y', 'R', 'Y', 'Y', 'R', 'R', 'R'],
            ], red.id, yellow.id, 'Red');
            expect(game.state.status).toBe('OVER');
            expect(game.state.winner).toBeUndefined();
        });
    });
    describe('[T2.4] when given an invalid move request', () => {
        it('throws an error if the game is not in progress', () => {
            const player = (0, TestUtils_1.createPlayerForTesting)();
            game.join(player);
            expect(() => game.applyMove({
                gameID: game.id,
                playerID: player.id,
                move: { gamePiece: 'Red', col: 0, row: 0 },
            })).toThrowError(InvalidParametersError_1.GAME_NOT_IN_PROGRESS_MESSAGE);
        });
        describe('when the game is in progress', () => {
            const red = (0, TestUtils_1.createPlayerForTesting)();
            const yellow = (0, TestUtils_1.createPlayerForTesting)();
            beforeEach(() => {
                game.join(red);
                game.join(yellow);
                game.startGame(red);
                game.startGame(yellow);
            });
            it('should throw an error if the player is not in the game', () => {
                const otherPlayer = (0, TestUtils_1.createPlayerForTesting)();
                expect(() => game.applyMove({
                    gameID: game.id,
                    playerID: otherPlayer.id,
                    move: { gamePiece: 'Red', col: 0, row: 5 },
                })).toThrowError(InvalidParametersError_1.PLAYER_NOT_IN_GAME_MESSAGE);
            });
            describe('when the player is in the game', () => {
                it('should throw an error if the player is not the active player', () => {
                    expect(() => game.applyMove({
                        gameID: game.id,
                        playerID: yellow.id,
                        move: { gamePiece: 'Yellow', col: 0, row: 5 },
                    })).toThrowError(InvalidParametersError_1.MOVE_NOT_YOUR_TURN_MESSAGE);
                    const secondGame = new ConnectFourGame_1.default(game);
                    secondGame.join(red);
                    secondGame.join(yellow);
                    secondGame.startGame(yellow);
                    secondGame.startGame(red);
                    expect(() => secondGame.applyMove({
                        gameID: secondGame.id,
                        playerID: red.id,
                        move: { gamePiece: 'Red', col: 0, row: 5 },
                    })).toThrowError(InvalidParametersError_1.MOVE_NOT_YOUR_TURN_MESSAGE);
                });
                it('should throw an error if the cell is not at the bottom of the column', () => {
                    createMovesFromPattern(game, [
                        ['_', '_', '_', '_', '_', '_'],
                        ['_', '_', '_', '_', '_', '_'],
                        ['_', '_', '_', '_', '_', '_'],
                        ['Y', '_', '_', '_', '_', '_'],
                        ['R', '_', '_', '_', '_', '_'],
                        ['R', 'Y', '_', '_', '_', '_'],
                    ], red.id, yellow.id, 'Red');
                    expect(() => game.applyMove({
                        gameID: game.id,
                        playerID: red.id,
                        move: { gamePiece: 'Red', col: 0, row: 1 },
                    })).toThrowError(InvalidParametersError_1.BOARD_POSITION_NOT_VALID_MESSAGE);
                });
                it('should throw an error if the cell is full', () => {
                    createMovesFromPattern(game, [
                        ['Y', '_', '_', '_', '_', '_'],
                        ['R', '_', '_', '_', '_', '_'],
                        ['Y', '_', '_', '_', '_', '_'],
                        ['R', '_', '_', '_', '_', '_'],
                        ['Y', '_', '_', '_', '_', '_'],
                        ['R', '_', '_', '_', '_', '_'],
                    ], red.id, yellow.id, 'Red');
                    expect(() => game.applyMove({
                        gameID: game.id,
                        playerID: red.id,
                        move: { gamePiece: 'Red', col: 0, row: 0 },
                    })).toThrowError(InvalidParametersError_1.BOARD_POSITION_NOT_VALID_MESSAGE);
                });
                it('should not change the game state', () => {
                    createMovesFromPattern(game, [
                        ['Y', '_', '_', '_', '_', '_'],
                        ['R', '_', '_', '_', '_', '_'],
                        ['Y', '_', '_', '_', '_', '_'],
                        ['R', '_', '_', '_', '_', '_'],
                        ['Y', '_', '_', '_', '_', '_'],
                        ['R', '_', '_', '_', '_', '_'],
                    ], red.id, yellow.id, 'Red');
                    expect(game.state.moves.length).toBe(6);
                    expect(() => game.applyMove({
                        gameID: game.id,
                        playerID: red.id,
                        move: { gamePiece: 'Red', col: 0, row: 0 },
                    })).toThrowError(InvalidParametersError_1.BOARD_POSITION_NOT_VALID_MESSAGE);
                    expect(game.state.moves.length).toBe(6);
                    game.applyMove({
                        gameID: game.id,
                        playerID: red.id,
                        move: { gamePiece: 'Red', col: 1, row: 5 },
                    });
                    expect(game.state.moves.length).toBe(7);
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29ubmVjdEZvdXJHYW1lLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdG93bi9nYW1lcy9Db25uZWN0Rm91ckdhbWUudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHFDQUFrQztBQUNsQyw2RUFRMEM7QUFDMUMsK0NBQXlEO0FBTXpELHdFQUFnRDtBQU9oRCxNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFvQjNELFNBQVMsc0JBQXNCLENBQzdCLElBQXFCLEVBQ3JCLE9BQW1CLEVBQ25CLEtBQWEsRUFDYixRQUFnQixFQUNoQixVQUE0QjtJQUc1QixNQUFNLE1BQU0sR0FBRztRQUNiLE1BQU0sRUFBRSxFQUFrQjtRQUMxQixHQUFHLEVBQUUsRUFBa0I7S0FDeEIsQ0FBQztJQUdGLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDOUIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUMxQixJQUFJLEdBQUcsS0FBSyxHQUFHLEVBQUU7Z0JBQ2YsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7b0JBQ2pCLE1BQU0sRUFBRSxNQUE2QjtvQkFDckMsTUFBTSxFQUFFLE1BQTZCO2lCQUN0QyxDQUFDLENBQUM7YUFDSjtpQkFBTSxJQUFJLEdBQUcsS0FBSyxHQUFHLEVBQUU7Z0JBQ3RCLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO29CQUNkLE1BQU0sRUFBRSxNQUE2QjtvQkFDckMsTUFBTSxFQUFFLE1BQTZCO2lCQUN0QyxDQUFDLENBQUM7YUFDSjtpQkFBTSxJQUFJLEdBQUcsS0FBSyxHQUFHLEVBQUU7Z0JBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLE9BQU8sb0NBQW9DLENB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