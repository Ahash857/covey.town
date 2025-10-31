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
const jest_mock_extended_1 = require("jest-mock-extended");
const nanoid_1 = require("nanoid");
const TestUtils_1 = require("../../TestUtils");
const InvalidParametersError_1 = require("../../lib/InvalidParametersError");
const TicTacToeGameArea_1 = __importDefault(require("./TicTacToeGameArea"));
const TicTacToeGameModule = __importStar(require("./TicTacToeGame"));
const Game_1 = __importDefault(require("./Game"));
class TestingGame extends Game_1.default {
    constructor() {
        super({
            moves: [],
            status: 'WAITING_TO_START',
        });
    }
    applyMove() { }
    endGame(winner) {
        this.state = {
            ...this.state,
            status: 'OVER',
            winner,
        };
    }
    _join(player) {
        if (this.state.x) {
            this.state.o = player.id;
        }
        else {
            this.state.x = player.id;
        }
        this._players.push(player);
    }
    _leave() { }
}
describe('TicTacToeGameArea', () => {
    let gameArea;
    let player1;
    let player2;
    let interactableUpdateSpy;
    let game;
    beforeEach(() => {
        const gameConstructorSpy = jest.spyOn(TicTacToeGameModule, 'default');
        game = new TestingGame();
        gameConstructorSpy.mockReturnValue(game);
        player1 = (0, TestUtils_1.createPlayerForTesting)();
        player2 = (0, TestUtils_1.createPlayerForTesting)();
        gameArea = new TicTacToeGameArea_1.default((0, nanoid_1.nanoid)(), { x: 0, y: 0, width: 100, height: 100 }, (0, jest_mock_extended_1.mock)());
        gameArea.add(player1);
        gameArea.add(player2);
        interactableUpdateSpy = jest.spyOn(gameArea, '_emitAreaChanged');
    });
    describe('handleCommand', () => {
        describe('[T3.1] when given a JoinGame command', () => {
            describe('when there is no game in progress', () => {
                it('should create a new game and call _emitAreaChanged', () => {
                    const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
                    expect(gameID).toBeDefined();
                    if (!game) {
                        throw new Error('Game was not created by the first call to join');
                    }
                    expect(gameID).toEqual(game.id);
                    expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
                });
            });
            describe('when there is a game in progress', () => {
                it('should dispatch the join command to the game and call _emitAreaChanged', () => {
                    const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
                    if (!game) {
                        throw new Error('Game was not created by the first call to join');
                    }
                    expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
                    const joinSpy = jest.spyOn(game, 'join');
                    const gameID2 = gameArea.handleCommand({ type: 'JoinGame' }, player2).gameID;
                    expect(joinSpy).toHaveBeenCalledWith(player2);
                    expect(gameID).toEqual(gameID2);
                    expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
                });
                it('should not call _emitAreaChanged if the game throws an error', () => {
                    gameArea.handleCommand({ type: 'JoinGame' }, player1);
                    if (!game) {
                        throw new Error('Game was not created by the first call to join');
                    }
                    interactableUpdateSpy.mockClear();
                    const joinSpy = jest.spyOn(game, 'join').mockImplementationOnce(() => {
                        throw new Error('Test Error');
                    });
                    expect(() => gameArea.handleCommand({ type: 'JoinGame' }, player2)).toThrowError('Test Error');
                    expect(joinSpy).toHaveBeenCalledWith(player2);
                    expect(interactableUpdateSpy).not.toHaveBeenCalled();
                });
            });
        });
        describe('[T3.2] when given a GameMove command', () => {
            it('should throw an error when there is no game in progress', () => {
                expect(() => gameArea.handleCommand({ type: 'GameMove', move: { col: 0, row: 0, gamePiece: 'X' }, gameID: (0, nanoid_1.nanoid)() }, player1)).toThrowError(InvalidParametersError_1.GAME_NOT_IN_PROGRESS_MESSAGE);
            });
            describe('when there is a game in progress', () => {
                let gameID;
                beforeEach(() => {
                    gameID = gameArea.handleCommand({ type: 'JoinGame' }, player1).gameID;
                    gameArea.handleCommand({ type: 'JoinGame' }, player2);
                    interactableUpdateSpy.mockClear();
                });
                it('should throw an error when the game ID does not match', () => {
                    expect(() => gameArea.handleCommand({ type: 'GameMove', move: { col: 0, row: 0, gamePiece: 'X' }, gameID: (0, nanoid_1.nanoid)() }, player1)).toThrowError(InvalidParametersError_1.GAME_ID_MISSMATCH_MESSAGE);
                });
                it('should dispatch the move to the game and call _emitAreaChanged', () => {
                    const move = { col: 0, row: 0, gamePiece: 'X' };
                    const applyMoveSpy = jest.spyOn(game, 'applyMove');
                    gameArea.handleCommand({ type: 'GameMove', move, gameID }, player1);
                    expect(applyMoveSpy).toHaveBeenCalledWith({
                        gameID: game.id,
                        playerID: player1.id,
                        move: {
                            ...move,
                            gamePiece: 'X',
                        },
                    });
                    expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
                });
                it('should not call _emitAreaChanged if the game throws an error', () => {
                    const move = { col: 0, row: 0, gamePiece: 'X' };
                    const applyMoveSpy = jest.spyOn(game, 'applyMove').mockImplementationOnce(() => {
                        throw new Error('Test Error');
                    });
                    expect(() => gameArea.handleCommand({ type: 'GameMove', move, gameID }, player1)).toThrowError('Test Error');
                    expect(applyMoveSpy).toHaveBeenCalledWith({
                        gameID: game.id,
                        playerID: player1.id,
                        move: {
                            ...move,
                            gamePiece: 'X',
                        },
                    });
                    expect(interactableUpdateSpy).not.toHaveBeenCalled();
                });
                describe('when the game is over, it records a new row in the history and calls _emitAreaChanged', () => {
                    test('when X wins', () => {
                        const move = { col: 0, row: 0, gamePiece: 'X' };
                        jest.spyOn(game, 'applyMove').mockImplementationOnce(() => {
                            game.endGame(player1.id);
                        });
                        gameArea.handleCommand({ type: 'GameMove', move, gameID }, player1);
                        expect(game.state.status).toEqual('OVER');
                        expect(gameArea.history.length).toEqual(1);
                        expect(gameArea.history[0]).toEqual({
                            gameID: game.id,
                            scores: {
                                [player1.userName]: 1,
                                [player2.userName]: 0,
                            },
                        });
                        expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
                    });
                    test('when O wins', () => {
                        const move = { col: 0, row: 0, gamePiece: 'O' };
                        jest.spyOn(game, 'applyMove').mockImplementationOnce(() => {
                            game.endGame(player2.id);
                        });
                        gameArea.handleCommand({ type: 'GameMove', move, gameID }, player2);
                        expect(game.state.status).toEqual('OVER');
                        expect(gameArea.history.length).toEqual(1);
                        expect(gameArea.history[0]).toEqual({
                            gameID: game.id,
                            scores: {
                                [player1.userName]: 0,
                                [player2.userName]: 1,
                            },
                        });
                        expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
                    });
                    test('when there is a tie', () => {
                        const move = { col: 0, row: 0, gamePiece: 'X' };
                        jest.spyOn(game, 'applyMove').mockImplementationOnce(() => {
                            game.endGame();
                        });
                        gameArea.handleCommand({ type: 'GameMove', move, gameID }, player1);
                        expect(game.state.status).toEqual('OVER');
                        expect(gameArea.history.length).toEqual(1);
                        expect(gameArea.history[0]).toEqual({
                            gameID: game.id,
                            scores: {
                                [player1.userName]: 0,
                                [player2.userName]: 0,
                            },
                        });
                        expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
                    });
                });
            });
        });
        describe('[T3.3] when given a LeaveGame command', () => {
            describe('when there is no game in progress', () => {
                it('should throw an error', () => {
                    expect(() => gameArea.handleCommand({ type: 'LeaveGame', gameID: (0, nanoid_1.nanoid)() }, player1)).toThrowError(InvalidParametersError_1.GAME_NOT_IN_PROGRESS_MESSAGE);
                    expect(interactableUpdateSpy).not.toHaveBeenCalled();
                });
            });
            describe('when there is a game in progress', () => {
                it('should throw an error when the game ID does not match', () => {
                    gameArea.handleCommand({ type: 'JoinGame' }, player1);
                    interactableUpdateSpy.mockClear();
                    expect(() => gameArea.handleCommand({ type: 'LeaveGame', gameID: (0, nanoid_1.nanoid)() }, player1)).toThrowError(InvalidParametersError_1.GAME_ID_MISSMATCH_MESSAGE);
                    expect(interactableUpdateSpy).not.toHaveBeenCalled();
                });
                it('should dispatch the leave command to the game and call _emitAreaChanged', () => {
                    const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
                    if (!game) {
                        throw new Error('Game was not created by the first call to join');
                    }
                    expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
                    const leaveSpy = jest.spyOn(game, 'leave');
                    gameArea.handleCommand({ type: 'LeaveGame', gameID }, player1);
                    expect(leaveSpy).toHaveBeenCalledWith(player1);
                    expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
                });
                it('should not call _emitAreaChanged if the game throws an error', () => {
                    gameArea.handleCommand({ type: 'JoinGame' }, player1);
                    if (!game) {
                        throw new Error('Game was not created by the first call to join');
                    }
                    interactableUpdateSpy.mockClear();
                    const leaveSpy = jest.spyOn(game, 'leave').mockImplementationOnce(() => {
                        throw new Error('Test Error');
                    });
                    expect(() => gameArea.handleCommand({ type: 'LeaveGame', gameID: game.id }, player1)).toThrowError('Test Error');
                    expect(leaveSpy).toHaveBeenCalledWith(player1);
                    expect(interactableUpdateSpy).not.toHaveBeenCalled();
                });
                it('should update the history if the game is over', () => {
                    const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
                    gameArea.handleCommand({ type: 'JoinGame' }, player2);
                    interactableUpdateSpy.mockClear();
                    jest.spyOn(game, 'leave').mockImplementationOnce(() => {
                        game.endGame(player1.id);
                    });
                    gameArea.handleCommand({ type: 'LeaveGame', gameID }, player1);
                    expect(game.state.status).toEqual('OVER');
                    expect(gameArea.history.length).toEqual(1);
                    expect(gameArea.history[0]).toEqual({
                        gameID: game.id,
                        scores: {
                            [player1.userName]: 1,
                            [player2.userName]: 0,
                        },
                    });
                    expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
                });
            });
        });
        describe('[T3.4] when given an invalid command', () => {
            it('should throw an error', () => {
                expect(() => gameArea.handleCommand({ type: 'InvalidCommand' }, player1)).toThrowError(InvalidParametersError_1.INVALID_COMMAND_MESSAGE);
                expect(interactableUpdateSpy).not.toHaveBeenCalled();
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGljVGFjVG9lR2FtZUFyZWEudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90b3duL2dhbWVzL1RpY1RhY1RvZUdhbWVBcmVhLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJEQUEwQztBQUMxQyxtQ0FBZ0M7QUFDaEMsK0NBQXlEO0FBQ3pELDZFQUkwQztBQVExQyw0RUFBb0Q7QUFDcEQscUVBQXVEO0FBQ3ZELGtEQUEwQjtBQUUxQixNQUFNLFdBQVksU0FBUSxjQUF1QztJQUMvRDtRQUNFLEtBQUssQ0FBQztZQUNKLEtBQUssRUFBRSxFQUFFO1lBQ1QsTUFBTSxFQUFFLGtCQUFrQjtTQUMzQixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU0sU0FBUyxLQUFVLENBQUM7SUFFcEIsT0FBTyxDQUFDLE1BQWU7UUFDNUIsSUFBSSxDQUFDLEtBQUssR0FBRztZQUNYLEdBQUcsSUFBSSxDQUFDLEtBQUs7WUFDYixNQUFNLEVBQUUsTUFBTTtZQUNkLE1BQU07U0FDUCxDQUFDO0lBQ0osQ0FBQztJQUVTLEtBQUssQ0FBQyxNQUFjO1FBQzVCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDaEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQztTQUMxQjthQUFNO1lBQ0wsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQztTQUMxQjtRQUNELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFUyxNQUFNLEtBQVUsQ0FBQztDQUM1QjtBQUNELFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7SUFDakMsSUFBSSxRQUEyQixDQUFDO0lBQ2hDLElBQUksT0FBZSxDQUFDO0lBQ3BCLElBQUksT0FB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