"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ConnectFourGameArea_1 = __importDefault(require("./ConnectFourGameArea"));
const TicTacToeGameArea_1 = __importDefault(require("./TicTacToeGameArea"));
/**
 * Creates a new GameArea from a map object
 * @param mapObject the map object to create the game area from
 * @param broadcastEmitter a broadcast emitter that can be used to emit updates to players
 * @returns the interactable area
 * @throws an error if the map object is malformed
 */
function GameAreaFactory(mapObject, broadcastEmitter) {
    var _a, _b;
    const { name, width, height } = mapObject;
    if (!width || !height) {
        throw new Error(`Malformed viewing area ${name}`);
    }
    const rect = { x: mapObject.x, y: mapObject.y, width, height };
    const gameType = (_b = (_a = mapObject.properties) === null || _a === void 0 ? void 0 : _a.find(prop => prop.name === 'type')) === null || _b === void 0 ? void 0 : _b.value;
    if (gameType === 'TicTacToe') {
        return new TicTacToeGameArea_1.default(name, rect, broadcastEmitter);
    }
    if (gameType === 'ConnectFour') {
        return new ConnectFourGameArea_1.default(name, rect, broadcastEmitter);
    }
    throw new Error(`Unknown game area type ${mapObject.class}`);
}
exports.default = GameAreaFactory;
