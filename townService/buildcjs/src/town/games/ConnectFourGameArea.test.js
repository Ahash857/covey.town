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
const nanoid_1 = require("nanoid");
const jest_mock_extended_1 = require("jest-mock-extended");
const ConnectFourGameArea_1 = __importDefault(require("./ConnectFourGameArea"));
const ConnectFourGameModule = __importStar(require("./ConnectFourGame"));
const Game_1 = __importDefault(require("./Game"));
const TestUtils_1 = require("../../TestUtils");
const InvalidParametersError_1 = require("../../lib/InvalidParametersError");
class TestingGame extends Game_1.default {
    constructor(priorGame) {
        super({
            moves: [],
            status: 'WAITING_TO_START',
            firstPlayer: 'Red',
        });
    }
    applyMove(move) { }
    endGame(winner) {
        this.state = {
            ...this.state,
            status: 'OVER',
            winner,
        };
    }
    startGame(player) {
        if (this.state.red === player.id)
            this.state.redReady = true;
        else
            this.state.yellowReady = true;
    }
    _join(player) {
        if (this.state.red)
            this.state.yellow = player.id;
        else
            this.state.red = player.id;
        this._players.push(player);
    }
    _leave(player) { }
}
describe('ConnectFourGameArea', () => {
    let gameArea;
    let red;
    let yellow;
    let interactableUpdateSpy;
    const gameConstructorSpy = jest.spyOn(ConnectFourGameModule, 'default');
    let game;
    beforeEach(() => {
        gameConstructorSpy.mockClear();
        game = new TestingGame();
        gameConstructorSpy.mockReturnValue(game);
        red = (0, TestUtils_1.createPlayerForTesting)();
        yellow = (0, TestUtils_1.createPlayerForTesting)();
        gameArea = new ConnectFourGameArea_1.default((0, nanoid_1.nanoid)(), { x: 0, y: 0, width: 100, height: 100 }, (0, jest_mock_extended_1.mock)());
        gameArea.add(red);
        game.join(red);
        gameArea.add(yellow);
        game.join(yellow);
        interactableUpdateSpy = jest.spyOn(gameArea, '_emitAreaChanged');
    });
    describe('[T3.1] JoinGame command', () => {
        test('when there is no existing game, it should create a new game and call _emitAreaChanged', () => {
            expect(gameArea.game).toBeUndefined();
            const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, red);
            expect(gameArea.game).toBeDefined();
            expect(gameID).toEqual(game.id);
            expect(interactableUpdateSpy).toHaveBeenCalled();
        });
        test('when there is a game that just ended, it should create a new game and call _emitAreaChanged', () => {
            expect(gameArea.game).toBeUndefined();
            gameConstructorSpy.mockClear();
            const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, red);
            expect(gameArea.game).toBeDefined();
            expect(gameID).toEqual(game.id);
            expect(interactableUpdateSpy).toHaveBeenCalled();
            expect(gameConstructorSpy).toHaveBeenCalledTimes(1);
            game.endGame();
            gameConstructorSpy.mockClear();
            const { gameID: newGameID } = gameArea.handleCommand({ type: 'JoinGame' }, red);
            expect(gameArea.game).toBeDefined();
            expect(newGameID).toEqual(game.id);
            expect(interactableUpdateSpy).toHaveBeenCalled();
            expect(gameConstructorSpy).toHaveBeenCalledTimes(1);
        });
        describe('when there is a game in progress', () => {
            it('should call join on the game and call _emitAreaChanged', () => {
                const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, red);
                if (!game) {
                    throw new Error('Game was not created by the first call to join');
                }
                expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
                const joinSpy = jest.spyOn(game, 'join');
                const gameID2 = gameArea.handleCommand({ type: 'JoinGame' }, yellow).gameID;
                expect(joinSpy).toHaveBeenCalledWith(yellow);
                expect(gameID).toEqual(gameID2);
                expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
            });
            it('should not call _emitAreaChanged if the game throws an error', () => {
                gameArea.handleCommand({ type: 'JoinGame' }, red);
                if (!game) {
                    throw new Error('Game was not created by the first call to join');
                }
                interactableUpdateSpy.mockClear();
                const joinSpy = jest.spyOn(game, 'join').mockImplementationOnce(() => {
                    throw new Error('Test Error');
                });
                expect(() => gameArea.handleCommand({ type: 'JoinGame' }, yellow)).toThrowError('Test Error');
                expect(joinSpy).toHaveBeenCalledWith(yellow);
                expect(interactableUpdateSpy).not.toHaveBeenCalled();
            });
        });
    });
    describe('[T3.2] StartGame command', () => {
        it('when there is no game, it should throw an error and not call _emitAreaChanged', () => {
            expect(() => gameArea.handleCommand({ type: 'StartGame', gameID: (0, nanoid_1.nanoid)() }, red)).toThrowError(InvalidParametersError_1.GAME_NOT_IN_PROGRESS_MESSAGE);
        });
        describe('when there is a game in progress', () => {
            it('should call startGame on the game and call _emitAreaChanged', () => {
                const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, red);
                interactableUpdateSpy.mockClear();
                gameArea.handleCommand({ type: 'StartGame', gameID }, yellow);
                expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
            });
            it('should not call _emitAreaChanged if the game throws an error', () => {
                gameArea.handleCommand({ type: 'JoinGame' }, red);
                if (!game) {
                    throw new Error('Game was not created by the first call to join');
                }
                interactableUpdateSpy.mockClear();
                const startSpy = jest.spyOn(game, 'startGame').mockImplementationOnce(() => {
                    throw new Error('Test Error');
                });
                expect(() => gameArea.handleCommand({ type: 'StartGame', gameID: game.id }, yellow)).toThrowError('Test Error');
                expect(startSpy).toHaveBeenCalledWith(yellow);
                expect(interactableUpdateSpy).not.toHaveBeenCalled();
            });
            test('when the game ID mismatches, it should throw an error and not call _emitAreaChanged', () => {
                gameArea.handleCommand({ type: 'JoinGame' }, red);
                if (!game) {
                    throw new Error('Game was not created by the first call to join');
                }
                expect(() => gameArea.handleCommand({ type: 'StartGame', gameID: (0, nanoid_1.nanoid)() }, red)).toThrowError(InvalidParametersError_1.GAME_ID_MISSMATCH_MESSAGE);
            });
        });
    });
    describe('[T3.3] GameMove command', () => {
        it('should throw an error if there is no game in progress and not call _emitAreaChanged', () => {
            interactableUpdateSpy.mockClear();
            expect(() => gameArea.handleCommand({ type: 'GameMove', move: { col: 0, row: 0, gamePiece: 'X' }, gameID: (0, nanoid_1.nanoid)() }, red)).toThrowError(InvalidParametersError_1.GAME_NOT_IN_PROGRESS_MESSAGE);
            expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
        describe('when there is a game in progress', () => {
            let gameID;
            beforeEach(() => {
                gameID = gameArea.handleCommand({ type: 'JoinGame' }, red).gameID;
                gameArea.handleCommand({ type: 'JoinGame' }, yellow);
                interactableUpdateSpy.mockClear();
            });
            it('should throw an error if the gameID does not match the game and not call _emitAreaChanged', () => {
                expect(() => gameArea.handleCommand({ type: 'GameMove', move: { col: 0, row: 0, gamePiece: 'Yellow' }, gameID: (0, nanoid_1.nanoid)() }, red)).toThrowError(InvalidParametersError_1.GAME_ID_MISSMATCH_MESSAGE);
            });
            it('should call applyMove on the game and call _emitAreaChanged', () => {
                const move = { col: 0, row: 0, gamePiece: 'Red' };
                const applyMoveSpy = jest.spyOn(game, 'applyMove');
                gameArea.handleCommand({ type: 'GameMove', move, gameID }, red);
                expect(applyMoveSpy).toHaveBeenCalledWith({
                    gameID: game.id,
                    playerID: red.id,
                    move: {
                        ...move,
                        gamePiece: 'Red',
                    },
                });
                expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
            });
            it('should not call _emitAreaChanged if the game throws an error', () => {
                const move = { col: 0, row: 0, gamePiece: 'Red' };
                const applyMoveSpy = jest.spyOn(game, 'applyMove');
                applyMoveSpy.mockImplementationOnce(() => {
                    throw new Error('Test Error');
                });
                expect(() => gameArea.handleCommand({ type: 'GameMove', move, gameID }, red)).toThrowError('Test Error');
                expect(applyMoveSpy).toHaveBeenCalledWith({
                    gameID: game.id,
                    playerID: red.id,
                    move: {
                        ...move,
                        gamePiece: 'Red',
                    },
                });
                expect(interactableUpdateSpy).not.toHaveBeenCalled();
            });
            describe('when the game ends', () => {
                test.each(['Red', 'Yellow'])('when the game is won by %p', (winner) => {
                    const finalMove = { col: 0, row: 0, gamePiece: 'Red' };
                    jest.spyOn(game, 'applyMove').mockImplementationOnce(() => {
                        game.endGame(winner === 'Red' ? red.id : yellow.id);
                    });
                    gameArea.handleCommand({ type: 'GameMove', move: finalMove, gameID }, red);
                    expect(game.state.status).toEqual('OVER');
                    expect(gameArea.history.length).toEqual(1);
                    const winningUsername = winner === 'Red' ? red.userName : yellow.userName;
                    const losingUsername = winner === 'Red' ? yellow.userName : red.userName;
                    expect(gameArea.history[0]).toEqual({
                        gameID: game.id,
                        scores: {
                            [winningUsername]: 1,
                            [losingUsername]: 0,
                        },
                    });
                    expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
                });
                test('when the game results in a tie', () => {
                    const finalMove = { col: 0, row: 0, gamePiece: 'Red' };
                    jest.spyOn(game, 'applyMove').mockImplementationOnce(() => {
                        game.endGame();
                    });
                    gameArea.handleCommand({ type: 'GameMove', move: finalMove, gameID }, red);
                    expect(game.state.status).toEqual('OVER');
                    expect(gameArea.history.length).toEqual(1);
                    expect(gameArea.history[0]).toEqual({
                        gameID: game.id,
                        scores: {
                            [red.userName]: 0,
                            [yellow.userName]: 0,
                        },
                    });
                    expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
                });
            });
        });
    });
    describe('[T3.4] LeaveGame command', () => {
        it('should throw an error if there is no game in progress and not call _emitAreaChanged', () => {
            expect(() => gameArea.handleCommand({ type: 'LeaveGame', gameID: (0, nanoid_1.nanoid)() }, red)).toThrowError(InvalidParametersError_1.GAME_NOT_IN_PROGRESS_MESSAGE);
            expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
        describe('when there is a game in progress', () => {
            it('should throw an error if the gameID does not match the game and not call _emitAreaChanged', () => {
                gameArea.handleCommand({ type: 'JoinGame' }, red);
                interactableUpdateSpy.mockClear();
                expect(() => gameArea.handleCommand({ type: 'LeaveGame', gameID: (0, nanoid_1.nanoid)() }, red)).toThrowError(InvalidParametersError_1.GAME_ID_MISSMATCH_MESSAGE);
                expect(interactableUpdateSpy).not.toHaveBeenCalled();
            });
            it('should call leave on the game and call _emitAreaChanged', () => {
                const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, red);
                if (!game) {
                    throw new Error('Game was not created by the first call to join');
                }
                expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
                const leaveSpy = jest.spyOn(game, 'leave');
                gameArea.handleCommand({ type: 'LeaveGame', gameID }, red);
                expect(leaveSpy).toHaveBeenCalledWith(red);
                expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
            });
            it('should not call _emitAreaChanged if the game throws an error', () => {
                gameArea.handleCommand({ type: 'JoinGame' }, red);
                if (!game) {
                    throw new Error('Game was not created by the first call to join');
                }
                interactableUpdateSpy.mockClear();
                const leaveSpy = jest.spyOn(game, 'leave').mockImplementationOnce(() => {
                    throw new Error('Test Error');
                });
                expect(() => gameArea.handleCommand({ type: 'LeaveGame', gameID: game.id }, red)).toThrowError('Test Error');
                expect(leaveSpy).toHaveBeenCalledWith(red);
                expect(interactableUpdateSpy).not.toHaveBeenCalled();
            });
            test.each(['Red', 'Yellow'])('when the game is won by %p, it updates the history', (playerThatWins) => {
                const leavingPlayer = playerThatWins === 'Red' ? yellow : red;
                const winningPlayer = playerThatWins === 'Red' ? red : yellow;
                const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, red);
                gameArea.handleCommand({ type: 'JoinGame' }, yellow);
                interactableUpdateSpy.mockClear();
                jest.spyOn(game, 'leave').mockImplementationOnce(() => {
                    game.endGame(winningPlayer.id);
                });
                gameArea.handleCommand({ type: 'LeaveGame', gameID }, leavingPlayer);
                expect(game.state.status).toEqual('OVER');
                expect(gameArea.history.length).toEqual(1);
                const winningUsername = winningPlayer.userName;
                const losingUsername = leavingPlayer.userName;
                expect(gameArea.history[0]).toEqual({
                    gameID: game.id,
                    scores: {
                        [winningUsername]: 1,
                        [losingUsername]: 0,
                    },
                });
                expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
            });
        });
    });
    test('[T3.5] When given an invalid command it should throw an error', () => {
        expect(() => gameArea.handleCommand({ type: 'InvalidCommand' }, red)).toThrowError(InvalidParametersError_1.INVALID_COMMAND_MESSAGE);
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29ubmVjdEZvdXJHYW1lQXJlYS50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3Rvd24vZ2FtZXMvQ29ubmVjdEZvdXJHYW1lQXJlYS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBZ0M7QUFDaEMsMkRBQTBDO0FBVzFDLGdGQUF3RDtBQUN4RCx5RUFBMkQ7QUFDM0Qsa0RBQTBCO0FBQzFCLCtDQUF5RDtBQUN6RCw2RUFJMEM7QUFFMUMsTUFBTSxXQUFZLFNBQVEsY0FBMkM7SUFDbkUsWUFBbUIsU0FBMkI7UUFDNUMsS0FBSyxDQUFDO1lBQ0osS0FBSyxFQUFFLEVBQUU7WUFDVCxNQUFNLEVBQUUsa0JBQWtCO1lBQzFCLFdBQVcsRUFBRSxLQUFLO1NBQ25CLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTSxTQUFTLENBQUMsSUFBK0IsSUFBUyxDQUFDO0lBRW5ELE9BQU8sQ0FBQyxNQUFlO1FBQzVCLElBQUksQ0FBQyxLQUFLLEdBQUc7WUFDWCxHQUFHLElBQUksQ0FBQyxLQUFLO1lBQ2IsTUFBTSxFQUFFLE1BQU07WUFDZCxNQUFNO1NBQ1AsQ0FBQztJQUNKLENBQUM7SUFFTSxTQUFTLENBQUMsTUFBYztRQUM3QixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLE1BQU0sQ0FBQyxFQUFFO1lBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDOztZQUN4RCxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7SUFDckMsQ0FBQztJQUVTLEtBQUssQ0FBQyxNQUFjO1FBQzVCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHO1lBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQzs7WUFDN0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFH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