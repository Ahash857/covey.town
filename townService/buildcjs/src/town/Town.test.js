"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jest_mock_extended_1 = require("jest-mock-extended");
const nanoid_1 = require("nanoid");
const TwilioVideo_1 = __importDefault(require("../lib/TwilioVideo"));
const TestUtils_1 = require("../TestUtils");
const Town_1 = __importDefault(require("./Town"));
const mockTwilioVideo = (0, jest_mock_extended_1.mockDeep)();
jest.spyOn(TwilioVideo_1.default, 'getInstance').mockReturnValue(mockTwilioVideo);
const testingMaps = {
    twoConv: {
        tiledversion: '1.9.0',
        tileheight: 32,
        tilesets: [],
        tilewidth: 32,
        type: 'map',
        layers: [
            {
                id: 4,
                name: 'Objects',
                objects: [
                    {
                        type: 'ConversationArea',
                        height: 237,
                        id: 39,
                        name: 'Name1',
                        rotation: 0,
                        visible: true,
                        width: 326,
                        x: 40,
                        y: 120,
                    },
                    {
                        type: 'ConversationArea',
                        height: 266,
                        id: 43,
                        name: 'Name2',
                        rotation: 0,
                        visible: true,
                        width: 467,
                        x: 612,
                        y: 120,
                    },
                ],
                opacity: 1,
                type: 'objectgroup',
                visible: true,
                x: 0,
                y: 0,
            },
        ],
    },
    overlapping: {
        tiledversion: '1.9.0',
        tileheight: 32,
        tilesets: [],
        tilewidth: 32,
        type: 'map',
        layers: [
            {
                id: 4,
                name: 'Objects',
                objects: [
                    {
                        type: 'ConversationArea',
                        height: 237,
                        id: 39,
                        name: 'Name1',
                        rotation: 0,
                        visible: true,
                        width: 326,
                        x: 40,
                        y: 120,
                    },
                    {
                        type: 'ConversationArea',
                        height: 266,
                        id: 43,
                        name: 'Name2',
                        rotation: 0,
                        visible: true,
                        width: 467,
                        x: 40,
                        y: 120,
                    },
                ],
                opacity: 1,
                type: 'objectgroup',
                visible: true,
                x: 0,
                y: 0,
            },
        ],
    },
    noObjects: {
        tiledversion: '1.9.0',
        tileheight: 32,
        tilesets: [],
        tilewidth: 32,
        type: 'map',
        layers: [],
    },
    duplicateNames: {
        tiledversion: '1.9.0',
        tileheight: 32,
        tilesets: [],
        tilewidth: 32,
        type: 'map',
        layers: [
            {
                id: 4,
                name: 'Objects',
                objects: [
                    {
                        type: 'ConversationArea',
                        height: 237,
                        id: 39,
                        name: 'Name1',
                        rotation: 0,
                        visible: true,
                        width: 326,
                        x: 40,
                        y: 120,
                    },
                    {
                        type: 'ConversationArea',
                        height: 266,
                        id: 43,
                        name: 'Name1',
                        rotation: 0,
                        visible: true,
                        width: 467,
                        x: 612,
                        y: 120,
                    },
                ],
                opacity: 1,
                type: 'objectgroup',
                visible: true,
                x: 0,
                y: 0,
            },
        ],
    },
    twoViewing: {
        tiledversion: '1.9.0',
        tileheight: 32,
        tilesets: [],
        tilewidth: 32,
        type: 'map',
        layers: [
            {
                id: 4,
                name: 'Objects',
                objects: [
                    {
                        type: 'ViewingArea',
                        height: 237,
                        id: 39,
                        name: 'Name1',
                        rotation: 0,
                        visible: true,
                        width: 326,
                        x: 40,
                        y: 120,
                    },
                    {
                        type: 'ViewingArea',
                        height: 266,
                        id: 43,
                        name: 'Name2',
                        rotation: 0,
                        visible: true,
                        width: 467,
                        x: 612,
                        y: 120,
                    },
                ],
                opacity: 1,
                type: 'objectgroup',
                visible: true,
                x: 0,
                y: 0,
            },
        ],
    },
    twoConvOneViewing: {
        tiledversion: '1.9.0',
        tileheight: 32,
        tilesets: [],
        tilewidth: 32,
        type: 'map',
        layers: [
            {
                id: 4,
                name: 'Objects',
                objects: [
                    {
                        type: 'ConversationArea',
                        height: 237,
                        id: 39,
                        name: 'Name1',
                        rotation: 0,
                        visible: true,
                        width: 326,
                        x: 40,
                        y: 120,
                    },
                    {
                        type: 'ConversationArea',
                        height: 266,
                        id: 43,
                        name: 'Name2',
                        rotation: 0,
                        visible: true,
                        width: 467,
                        x: 612,
                        y: 120,
                    },
                    {
                        type: 'ViewingArea',
                        height: 237,
                        id: 54,
                        name: 'Name3',
                        properties: [
                            {
                                name: 'video',
                                type: 'string',
                                value: 'someURL',
                            },
                        ],
                        rotation: 0,
                        visible: true,
                        width: 326,
                        x: 155,
                        y: 566,
                    },
                ],
                opacity: 1,
                type: 'objectgroup',
                visible: true,
                x: 0,
                y: 0,
            },
        ],
    },
    twoConvTwoViewing: {
        tiledversion: '1.9.0',
        tileheight: 32,
        tilesets: [],
        tilewidth: 32,
        type: 'map',
        layers: [
            {
                id: 4,
                name: 'Objects',
                objects: [
                    {
                        type: 'ConversationArea',
                        height: 237,
                        id: 39,
                        name: 'Name1',
                        rotation: 0,
                        visible: true,
                        width: 326,
                        x: 40,
                        y: 120,
                    },
                    {
                        type: 'ConversationArea',
                        height: 266,
                        id: 43,
                        name: 'Name2',
                        rotation: 0,
                        visible: true,
                        width: 467,
                        x: 612,
                        y: 120,
                    },
                    {
                        type: 'ViewingArea',
                        height: 237,
                        id: 54,
                        name: 'Name3',
                        properties: [
                            {
                                name: 'video',
                                type: 'string',
                                value: 'someURL',
                            },
                        ],
                        rotation: 0,
                        visible: true,
                        width: 326,
                        x: 155,
                        y: 566,
                    },
                    {
                        type: 'ViewingArea',
                        height: 237,
                        id: 55,
                        name: 'Name4',
                        properties: [
                            {
                                name: 'video',
                                type: 'string',
                                value: 'someURL',
                            },
                        ],
                        rotation: 0,
                        visible: true,
                        width: 326,
                        x: 600,
                        y: 1200,
                    },
                ],
                opacity: 1,
                type: 'objectgroup',
                visible: true,
                x: 0,
                y: 0,
            },
        ],
    },
};
describe('Town', () => {
    const townEmitter = (0, jest_mock_extended_1.mockDeep)();
    let town;
    let player;
    let playerTestData;
    let playerID;
    beforeEach(async () => {
        town = new Town_1.default((0, nanoid_1.nanoid)(), false, (0, nanoid_1.nanoid)(), townEmitter);
        playerTestData = (0, TestUtils_1.mockPlayer)(town.townID);
        player = await town.addPlayer(playerTestData.userName, playerTestData.socket);
        playerTestData.player = player;
        playerID = player.id;
        playerTestData.moveTo(-1, -1);
        (0, jest_mock_extended_1.mockReset)(townEmitter);
    });
    it('constructor should set its properties', () => {
        const townName = `FriendlyNameTest-${(0, nanoid_1.nanoid)()}`;
        const townID = (0, nanoid_1.nanoid)();
        const testTown = new Town_1.default(townName, true, townID, townEmitter);
        expect(testTown.friendlyName).toBe(townName);
        expect(testTown.townID).toBe(townID);
        expect(testTown.isPubliclyListed).toBe(true);
    });
    describe('addPlayer', () => {
        it('should use the townID and player ID properties when requesting a video token', async () => {
            const newPlayer = (0, TestUtils_1.mockPlayer)(town.townID);
            mockTwilioVideo.getTokenForTown.mockClear();
            const newPlayerObj = await town.addPlayer(newPlayer.userName, newPlayer.socket);
            expect(mockTwilioVideo.getTokenForTown).toBeCalledTimes(1);
            expect(mockTwilioVideo.getTokenForTown).toBeCalledWith(town.townID, newPlayerObj.id);
        });
        it('should register callbacks for all client-to-server events', () => {
            const expectedEvents = [
                'disconnect',
                'chatMessage',
                'playerMovement',
                'interactableUpdate',
            ];
            expectedEvents.forEach(eachEvent => expect((0, TestUtils_1.getEventListener)(playerTestData.socket, eachEvent)).toBeDefined());
        });
        describe('[T1] interactableUpdate callback', () => {
            let interactableUpdateHandler;
            beforeEach(() => {
                town.initializeFromMap(testingMaps.twoConvTwoViewing);
                interactableUpdateHandler = (0, TestUtils_1.getEventListener)(playerTestData.socket, 'interactableUpdate');
            });
            it('Should not throw an error for any interactable area that is not a viewing area', () => {
                expect(() => interactableUpdateHandler({
                    id: 'Name1',
                    topic: (0, nanoid_1.nanoid)(),
                    occupantsByID: [],
                })).not.toThrowError();
            });
            it('Should not throw an error if there is no such viewing area', () => {
                expect(() => interactableUpdateHandler({
                    id: 'NotActuallyAnInteractable',
                    topic: (0, nanoid_1.nanoid)(),
                    occupantsByID: [],
                })).not.toThrowError();
            });
            describe('When called passing a valid viewing area', () => {
                let newArea;
                let secondPlayer;
                beforeEach(async () => {
                    newArea = {
                        id: 'Name4',
                        elapsedTimeSec: 0,
                        isPlaying: true,
                        video: (0, nanoid_1.nanoid)(),
                        occupants: [],
                        type: 'ViewingArea',
                    };
                    expect(town.addViewingArea(newArea)).toBe(true);
                    secondPlayer = (0, TestUtils_1.mockPlayer)(town.townID);
                    mockTwilioVideo.getTokenForTown.mockClear();
                    await town.addPlayer(secondPlayer.userName, secondPlayer.socket);
                    newArea.elapsedTimeSec = 100;
                    newArea.isPlaying = false;
                    (0, jest_mock_extended_1.mockClear)(townEmitter);
                    (0, jest_mock_extended_1.mockClear)(secondPlayer.socket);
                    (0, jest_mock_extended_1.mockClear)(secondPlayer.socketToRoomMock);
                    interactableUpdateHandler(newArea);
                });
                it("Should emit the interactable update to the other players in the town using the player's townEmitter, after the viewing area was successfully created", () => {
                    const updatedArea = town.getInteractable(newArea.id);
                    expect(updatedArea.toModel()).toEqual(newArea);
                });
                it('Should update the model for the viewing area', () => {
                    const lastUpdate = (0, TestUtils_1.getLastEmittedEvent)(playerTestData.socketToRoomMock, 'interactableUpdate');
                    expect(lastUpdate).toEqual(newArea);
                });
                it('Should not emit interactableUpdate events to players directly, or to the whole town', () => {
                    expect(() => (0, TestUtils_1.getLastEmittedEvent)(playerTestData.socket, 'interactableUpdate')).toThrowError();
                    expect(() => (0, TestUtils_1.getLastEmittedEvent)(townEmitter, 'interactableUpdate')).toThrowError();
                    expect(() => (0, TestUtils_1.getLastEmittedEvent)(secondPlayer.socket, 'interactableUpdate')).toThrowError();
                    expect(() => (0, TestUtils_1.getLastEmittedEvent)(secondPlayer.socketToRoomMock, 'interactableUpdate')).toThrowError();
                });
            });
        });
    });
    describe('Socket event listeners created in addPlayer', () => {
        describe('on socket disconnect', () => {
            function disconnectPlayer(playerToLeave) {
                const disconnectHandler = (0, TestUtils_1.getEventListener)(playerToLeave.socket, 'disconnect');
                disconnectHandler('unknown');
            }
            it("Invalidates the players's session token", async () => {
                const token = player.sessionToken;
                expect(town.getPlayerBySessionToken(token)).toBe(player);
                disconnectPlayer(playerTestData);
                expect(town.getPlayerBySessionToken(token)).toEqual(undefined);
            });
            it('Informs all other players of the disconnection using the broadcast emitter', () => {
                const playerToLeaveID = player.id;
                disconnectPlayer(playerTestData);
                const callToDisconnect = (0, TestUtils_1.getLastEmittedEvent)(townEmitter, 'playerDisconnect');
                expect(callToDisconnect.id).toEqual(playerToLeaveID);
            });
            it('Removes the player from any active conversation area', () => {
                town.initializeFromMap(testingMaps.twoConvOneViewing);
                playerTestData.moveTo(45, 122);
                expect(town.addConversationArea({
                    id: 'Name1',
                    topic: 'test',
                    occupants: [],
                    type: 'ConversationArea',
                })).toBeTruthy();
                const convArea = town.getInteractable('Name1');
                expect(convArea.occupantsByID).toEqual([player.id]);
                disconnectPlayer(playerTestData);
                expect(convArea.occupantsByID).toEqual([]);
                expect(town.occupancy).toBe(0);
            });
            it('Removes the player from any active viewing area', () => {
                town.initializeFromMap(testingMaps.twoConvOneViewing);
                playerTestData.moveTo(156, 567);
                expect(town.addViewingArea({
                    id: 'Name3',
                    isPlaying: true,
                    elapsedTimeSec: 0,
                    video: (0, nanoid_1.nanoid)(),
                    occupants: [],
                    type: 'ViewingArea',
                })).toBeTruthy();
                const viewingArea = town.getInteractable('Name3');
                expect(viewingArea.occupantsByID).toEqual([player.id]);
                disconnectPlayer(playerTestData);
                expect(viewingArea.occupantsByID).toEqual([]);
            });
        });
        describe('playerMovement', () => {
            const newLocation = {
                x: 100,
                y: 100,
                rotation: 'back',
                moving: true,
            };
            beforeEach(() => {
                playerTestData.moveTo(newLocation.x, newLocation.y, newLocation.rotation, newLocation.moving);
            });
            it('Emits a playerMoved event', () => {
                var _a;
                const lastEmittedMovement = (0, TestUtils_1.getLastEmittedEvent)(townEmitter, 'playerMoved');
                expect(lastEmittedMovement.id).toEqual((_a = playerTestData.player) === null || _a === void 0 ? void 0 : _a.id);
                expect(lastEmittedMovement.location).toEqual(newLocation);
            });
            it("Updates the player's location", () => {
                expect(player.location).toEqual(newLocation);
            });
        });
        describe('interactableUpdate', () => {
            let interactableUpdateCallback;
            let update;
            beforeEach(async () => {
                town.initializeFromMap(testingMaps.twoConvOneViewing);
                playerTestData.moveTo(156, 567);
                interactableUpdateCallback = (0, TestUtils_1.getEventListener)(playerTestData.socket, 'interactableUpdate');
                update = {
                    id: 'Name3',
                    isPlaying: true,
                    elapsedTimeSec: 100,
                    video: (0, nanoid_1.nanoid)(),
                    occupants: [],
                    type: 'ViewingArea',
                };
                interactableUpdateCallback(update);
            });
            it('forwards updates to others in the town', () => {
                const lastEvent = (0, TestUtils_1.getLastEmittedEvent)(playerTestData.socketToRoomMock, 'interactableUpdate');
                expect(lastEvent).toEqual(update);
            });
            it('does not forward updates to the ENTIRE town', () => {
                expect(() => (0, TestUtils_1.getLastEmittedEvent)(townEmitter, 'interactableUpdate')).toThrowError();
            });
            it('updates the local model for that interactable', () => {
                const interactable = town.getInteractable(update.id);
                expect(interactable === null || interactable === void 0 ? void 0 : interactable.toModel()).toEqual(update);
            });
        });
        it('Forwards chat messages to all players in the same town', async () => {
            const chatHandler = (0, TestUtils_1.getEventListener)(playerTestData.socket, 'chatMessage');
            const chatMessage = {
                author: player.id,
                body: 'Test message',
                dateCreated: new Date(),
                sid: 'test message id',
            };
            chatHandler(chatMessage);
            const emittedMessage = (0, TestUtils_1.getLastEmittedEvent)(townEmitter, 'chatMessage');
            expect(emittedMessage).toEqual(chatMessage);
        });
    });
    describe('addConversationArea', () => {
        beforeEach(async () => {
            town.initializeFromMap(testingMaps.twoConvOneViewing);
        });
        it('Should return false if no area exists with that ID', () => {
            expect(town.addConversationArea({
                id: (0, nanoid_1.nanoid)(),
                topic: (0, nanoid_1.nanoid)(),
                occupants: [],
                type: 'ConversationArea',
            })).toEqual(false);
        });
        it('Should return false if the requested topic is empty', () => {
            expect(town.addConversationArea({
                id: 'Name1',
                topic: '',
                occupants: [],
                type: 'ConversationArea',
            })).toEqual(false);
            expect(town.addConversationArea({
                id: 'Name1',
                topic: undefined,
                occupants: [],
                type: 'ConversationArea',
            })).toEqual(false);
        });
        it('Should return false if the area already has a topic', () => {
            expect(town.addConversationArea({
                id: 'Name1',
                topic: 'new topic',
                occupants: [],
                type: 'ConversationArea',
            })).toEqual(true);
            expect(town.addConversationArea({
                id: 'Name1',
                topic: 'new new topic',
                occupants: [],
                type: 'ConversationArea',
            })).toEqual(false);
        });
        describe('When successful', () => {
            const newTopic = 'new topic';
            beforeEach(() => {
                playerTestData.moveTo(45, 122);
                expect(town.addConversationArea({
                    id: 'Name1',
                    topic: newTopic,
                    occupants: [],
                    type: 'ConversationArea',
                })).toEqual(true);
            });
            it('Should update the local model for that area', () => {
                const convArea = town.getInteractable('Name1');
                expect(convArea.topic).toEqual(newTopic);
            });
            it('Should include any players in that area as occupants', () => {
                const convArea = town.getInteractable('Name1');
                expect(convArea.occupantsByID).toEqual([player.id]);
            });
            it('Should emit an interactableUpdate message', () => {
                const lastEmittedUpdate = (0, TestUtils_1.getLastEmittedEvent)(townEmitter, 'interactableUpdate');
                expect(lastEmittedUpdate).toEqual({
                    id: 'Name1',
                    topic: newTopic,
                    occupants: [player.id],
                    type: 'ConversationArea',
                });
            });
        });
    });
    describe('[T1] addViewingArea', () => {
        beforeEach(async () => {
            town.initializeFromMap(testingMaps.twoConvOneViewing);
        });
        it('Should return false if no area exists with that ID', () => {
            expect(town.addViewingArea({
                id: (0, nanoid_1.nanoid)(),
                isPlaying: false,
                elapsedTimeSec: 0,
                video: (0, nanoid_1.nanoid)(),
                occupants: [],
                type: 'ViewingArea',
            })).toBe(false);
        });
        it('Should return false if the requested video is empty', () => {
            expect(town.addViewingArea({
                id: 'Name3',
                isPlaying: false,
                elapsedTimeSec: 0,
                video: '',
                occupants: [],
                type: 'ViewingArea',
            })).toBe(false);
            expect(town.addViewingArea({
                id: 'Name3',
                isPlaying: false,
                elapsedTimeSec: 0,
                video: undefined,
                occupants: [],
                type: 'ViewingArea',
            })).toBe(false);
        });
        it('Should return false if the area is already active', () => {
            expect(town.addViewingArea({
                id: 'Name3',
                isPlaying: false,
                elapsedTimeSec: 0,
                video: 'test',
                occupants: [],
                type: 'ViewingArea',
            })).toBe(true);
            expect(town.addViewingArea({
                id: 'Name3',
                isPlaying: false,
                elapsedTimeSec: 0,
                video: 'test2',
                occupants: [],
                type: 'ViewingArea',
            })).toBe(false);
        });
        describe('When successful', () => {
            const newModel = {
                id: 'Name3',
                isPlaying: true,
                elapsedTimeSec: 100,
                video: (0, nanoid_1.nanoid)(),
                occupants: [playerID],
                type: 'ViewingArea',
            };
            beforeEach(() => {
                playerTestData.moveTo(160, 570);
                expect(town.addViewingArea(newModel)).toBe(true);
                newModel.occupants = [playerID];
            });
            it('Should update the local model for that area', () => {
                const viewingArea = town.getInteractable('Name3');
                expect(viewingArea.toModel()).toEqual(newModel);
            });
            it('Should emit an interactableUpdate message', () => {
                const lastEmittedUpdate = (0, TestUtils_1.getLastEmittedEvent)(townEmitter, 'interactableUpdate');
                expect(lastEmittedUpdate).toEqual(newModel);
            });
            it('Should include any players in that area as occupants', () => {
                const viewingArea = town.getInteractable('Name3');
                expect(viewingArea.occupantsByID).toEqual([player.id]);
            });
        });
    });
    describe('disconnectAllPlayers', () => {
        beforeEach(() => {
            town.disconnectAllPlayers();
        });
        it('Should emit the townClosing event', () => {
            (0, TestUtils_1.getLastEmittedEvent)(townEmitter, 'townClosing');
        });
        it("Should disconnect each players's socket", () => {
            expect(playerTestData.socket.disconnect).toBeCalledWith(true);
        });
    });
    describe('initializeFromMap', () => {
        const expectInitializingFromMapToThrowError = (map) => {
            expect(() => town.initializeFromMap(map)).toThrowError();
        };
        it('Throws an error if there is no layer called "objects"', async () => {
            expectInitializingFromMapToThrowError(testingMaps.noObjects);
        });
        it('Throws an error if there are duplicate interactable object IDs', async () => {
            expectInitializingFromMapToThrowError(testingMaps.duplicateNames);
        });
        it('Throws an error if there are overlapping objects', async () => {
            expectInitializingFromMapToThrowError(testingMaps.overlapping);
        });
        it('Creates a ConversationArea instance for each region on the map', async () => {
            town.initializeFromMap(testingMaps.twoConv);
            const conv1 = town.getInteractable('Name1');
            const conv2 = town.getInteractable('Name2');
            expect(conv1.id).toEqual('Name1');
            expect(conv1.boundingBox).toEqual({ x: 40, y: 120, height: 237, width: 326 });
            expect(conv2.id).toEqual('Name2');
            expect(conv2.boundingBox).toEqual({ x: 612, y: 120, height: 266, width: 467 });
            expect(town.interactables.length).toBe(2);
        });
        it('Creates a ViewingArea instance for each region on the map', async () => {
            town.initializeFromMap(testingMaps.twoViewing);
            const viewingArea1 = town.getInteractable('Name1');
            const viewingArea2 = town.getInteractable('Name2');
            expect(viewingArea1.id).toEqual('Name1');
            expect(viewingArea1.boundingBox).toEqual({ x: 40, y: 120, height: 237, width: 326 });
            expect(viewingArea2.id).toEqual('Name2');
            expect(viewingArea2.boundingBox).toEqual({ x: 612, y: 120, height: 266, width: 467 });
            expect(town.interactables.length).toBe(2);
        });
        describe('Updating interactable state in playerMovements', () => {
            beforeEach(async () => {
                town.initializeFromMap(testingMaps.twoConvOneViewing);
                playerTestData.moveTo(51, 121);
                expect(town.addConversationArea({
                    id: 'Name1',
                    topic: 'test',
                    occupants: [],
                    type: 'ViewingArea',
                })).toBe(true);
            });
            it('Adds a player to a new interactable and sets their conversation label, if they move into it', async () => {
                const newPlayer = (0, TestUtils_1.mockPlayer)(town.townID);
                const newPlayerObj = await town.addPlayer(newPlayer.userName, newPlayer.socket);
                newPlayer.moveTo(51, 121);
                expect(newPlayerObj.location.interactableID).toEqual('Name1');
                const lastEmittedMovement = (0, TestUtils_1.getLastEmittedEvent)(townEmitter, 'playerMoved');
                expect(lastEmittedMovement.location.interactableID).toEqual('Name1');
                const occupants = town.getInteractable('Name1').occupantsByID;
                (0, TestUtils_1.expectArraysToContainSameMembers)(occupants, [newPlayerObj.id, player.id]);
            });
            it('Removes a player from their prior interactable and sets their conversation label, if they moved outside of it', () => {
                expect(player.location.interactableID).toEqual('Name1');
                playerTestData.moveTo(0, 0);
                expect(player.location.interactableID).toBeUndefined();
            });
        });
    });
    describe('Updating town settings', () => {
        it('Emits townSettingsUpdated events when friendlyName changes', async () => {
            const newFriendlyName = (0, nanoid_1.nanoid)();
            town.friendlyName = newFriendlyName;
            expect(townEmitter.emit).toBeCalledWith('townSettingsUpdated', {
                friendlyName: newFriendlyName,
            });
        });
        it('Emits townSettingsUpdated events when isPubliclyListed changes', async () => {
            const expected = !town.isPubliclyListed;
            town.isPubliclyListed = expected;
            expect(townEmitter.emit).toBeCalledWith('townSettingsUpdated', {
                isPubliclyListed: expected,
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG93bi50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Rvd24vVG93bi50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0EsMkRBQW1GO0FBQ25GLG1DQUFnQztBQUVoQyxxRUFBNkM7QUFDN0MsNENBT3NCO0FBVXRCLGtEQUEwQjtBQUUxQixNQUFNLGVBQWUsR0FBRyxJQUFBLDZCQUFRLEdBQWUsQ0FBQztBQUNoRCxJQUFJLENBQUMsS0FBSyxDQUFDLHFCQUFXLEVBQUUsYUFBYSxDQUFDLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBS3hFLE1BQU0sV0FBVyxHQUFnQjtJQUMvQixPQUFPLEVBQUU7UUFDUCxZQUFZLEVBQUUsT0FBTztRQUNyQixVQUFVLEVBQUUsRUFBRTtRQUNkLFFBQVEsRUFBRSxFQUFFO1FBQ1osU0FBUyxFQUFFLEVBQUU7UUFDYixJQUFJLEVBQUUsS0FBSztRQUNYLE1BQU0sRUFBRTtZQUNOO2dCQUNFLEVBQUUsRUFBRSxDQUFDO2dCQUNMLElBQUksRUFBRSxTQUFTO2dCQUNmLE9BQU8sRUFBRTtvQkFDUDt3QkFDRSxJQUFJLEVBQUUsa0JBQWtCO3dCQUN4QixNQUFNLEVBQUUsR0FBRzt3QkFDWCxFQUFFLEVBQUUsRUFBRTt3QkFDTixJQUFJLEVBQUUsT0FBTzt3QkFDYixRQUFRLEVBQUUsQ0FBQzt3QkFDWCxPQUFPLEVBQUUsSUFBSTt3QkFDYixLQUFLLEVBQUUsR0FBRzt3QkFDVixDQUFDLEVBQUUsRUFBRTt3QkFDTCxDQUFDLEVBQUUsR0FBRztxQkFDUDtvQkFDRDt3QkFDRSxJQUFJLEVBQUUsa0JBQWtCO3dCQUN4QixNQUFNLEVBQUUsR0FBRzt3QkFDWCxFQUFFLEVBQUUsRUFBRTt3QkFDTixJQUFJLEVBQUUsT0FBTzt3QkFDYixRQUFRLEVBQUUsQ0FBQzt3QkFDWCxPQUFPLEVBQUUsSUFBSTt3QkFDYixLQUFLLEVBQUUsR0FBRzt3QkFDVixDQUFDLEVBQUUs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