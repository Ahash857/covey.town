"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isConversationArea = exports.isViewingArea = exports.expectArraysToContainSameMembers = exports.createPlayerForTesting = exports.mockPlayer = exports.MockedPlayer = exports.getEventListener = exports.extractSessionToken = exports.getLastEmittedEvent = exports.clearEmittedEvents = exports.defaultLocation = exports.createConversationForTesting = void 0;
const jest_mock_extended_1 = require("jest-mock-extended");
const nanoid_1 = require("nanoid");
const Player_1 = __importDefault(require("./lib/Player"));
/**
 * Create a new conversation area using some random defaults
 * @param params
 * @returns
 */
function createConversationForTesting(params) {
    return {
        id: (params === null || params === void 0 ? void 0 : params.conversationID) || (0, nanoid_1.nanoid)(),
        occupants: [],
        topic: (params === null || params === void 0 ? void 0 : params.conversationTopic) || (0, nanoid_1.nanoid)(),
        type: 'ConversationArea',
    };
}
exports.createConversationForTesting = createConversationForTesting;
function defaultLocation() {
    return { x: 0, y: 0, moving: false, rotation: 'front', interactableID: undefined };
}
exports.defaultLocation = defaultLocation;
/**
 * Resets all recorded mock calls for the given emitter (optionally only for a given event name)
 * @param mockEmitter
 * @param eventName
 */
function clearEmittedEvents(mockEmitter, eventName) {
    if (!eventName) {
        mockEmitter.emit.mock.calls = [];
    }
    else {
        mockEmitter.emit.mock.calls = mockEmitter.emit.mock.calls.filter(eachCall => eachCall[0] !== eventName);
    }
}
exports.clearEmittedEvents = clearEmittedEvents;
/**
 * Given a mock emitter, retrieve the last event that was emitted of a given type, optionally skipping the most recent N events emitted
 *
 * @param emitter the emitter
 * @param eventName name of the event to use (@see ServerToClientEvents)
 * @param howFarBack optionally, how many recent events to skip, default to 0 (find most recent event emit)
 * @returns the event data that was emitted
 */
function getLastEmittedEvent(emitter, eventName, howFarBack = 0) {
    const { calls } = emitter.emit.mock;
    let nCallsToSkip = howFarBack;
    for (let i = calls.length - 1; i >= 0; i--) {
        if (calls[i][0] === eventName) {
            if (nCallsToSkip === 0) {
                const param = calls[i][1];
                return param;
            }
            nCallsToSkip--;
        }
    }
    throw new Error(`No ${eventName} could be found as emitted on this socket`);
}
exports.getLastEmittedEvent = getLastEmittedEvent;
/**
 * Given a player that has been mocked, retrieve the session token that had been passed to it when it was added to the town
 * @param player
 * @returns
 */
function extractSessionToken(player) {
    return getLastEmittedEvent(player.socket, 'initialize').sessionToken;
}
exports.extractSessionToken = extractSessionToken;
/**
 * Given a mocked CoveyTownSocket, return the first event listener that was registered for a given event
 * @param mockSocket
 * @param eventName Name of a client to server event, @see ClientToServerEvents
 * @returns the corresponding event handler for that event name
 * @throws Error if no handler was registered
 */
function getEventListener(mockSocket, eventName) {
    const ret = mockSocket.on.mock.calls.find(eachCall => eachCall[0] === eventName);
    if (ret) {
        const param = ret[1];
        if (param) {
            return param;
        }
    }
    throw new Error(`No event listener found for event ${eventName}`);
}
exports.getEventListener = getEventListener;
class MockedPlayer {
    constructor(socket, socketToRoomMock, userName, townID, player) {
        this.socket = socket;
        this.socketToRoomMock = socketToRoomMock;
        this.userName = userName;
        this.townID = townID;
        this.player = player;
    }
    moveTo(x, y, rotation = 'front', moving = false) {
        const onMovementListener = getEventListener(this.socket, 'playerMovement');
        onMovementListener({ x, y, rotation, moving });
    }
}
exports.MockedPlayer = MockedPlayer;
/**
 * Create a new mock player for a given town, NOT adding it to the town, but constructing the appropriate mock objects
 * so that we can later check various properties of the player
 *
 * @param townID
 * @returns
 */
function mockPlayer(townID) {
    const socket = (0, jest_mock_extended_1.mockDeep)();
    const userName = (0, nanoid_1.nanoid)();
    socket.handshake.auth = { userName, townID };
    const socketToRoomMock = (0, jest_mock_extended_1.mock)();
    socket.to.mockImplementation((room) => {
        if (townID === room) {
            return socketToRoomMock;
        }
        throw new Error(`Tried to broadcast to ${room} but this player is in ${townID}`);
    });
    return new MockedPlayer(socket, socketToRoomMock, userName, townID, undefined);
}
exports.mockPlayer = mockPlayer;
/**
 * Utility function to create a new player object for testing, not connected to any town
 *
 */
function createPlayerForTesting() {
    return new Player_1.default(`username${(0, nanoid_1.nanoid)()}`, (0, jest_mock_extended_1.mock)());
}
exports.createPlayerForTesting = createPlayerForTesting;
/**
 * Assert that two arrays contain the same members (by strict === equality), allowing them to appear in different orders
 * @param actual
 * @param expected
 */
function expectArraysToContainSameMembers(actual, expected) {
    expect(actual.length).toBe(expected.length);
    expected.forEach(expectedVal => expect(actual.find(actualVal => actualVal === expectedVal)).toBeDefined());
}
exports.expectArraysToContainSameMembers = expectArraysToContainSameMembers;
function isViewingArea(interactable) {
    return 'isPlaying' in interactable;
}
exports.isViewingArea = isViewingArea;
function isConversationArea(interactable) {
    return 'topic' in interactable;
}
exports.isConversationArea = isConversationArea;
