"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const InvalidParametersError_1 = __importDefault(require("../lib/InvalidParametersError"));
const InteractableArea_1 = __importDefault(require("./InteractableArea"));
class ConversationArea extends InteractableArea_1.default {
    /** The conversation area is "active" when there are players inside of it  */
    get isActive() {
        return this._occupants.length > 0;
    }
    /**
     * Creates a new ConversationArea
     *
     * @param conversationAreaModel model containing this area's current topic and its ID
     * @param coordinates  the bounding box that defines this conversation area
     * @param townEmitter a broadcast emitter that can be used to emit updates to players
     */
    constructor({ topic, id }, coordinates, townEmitter) {
        super(id, coordinates, townEmitter);
        this.topic = topic;
    }
    /**
     * Removes a player from this conversation area.
     *
     * Extends the base behavior of InteractableArea to set the topic of this ConversationArea to undefined and
     * emit an update to other players in the town when the last player leaves.
     *
     * @param player
     */
    remove(player) {
        super.remove(player);
        if (this._occupants.length === 0) {
            this.topic = undefined;
            this._emitAreaChanged();
        }
    }
    /**
     * Convert this ConversationArea instance to a simple ConversationAreaModel suitable for
     * transporting over a socket to a client.
     */
    toModel() {
        return {
            id: this.id,
            occupants: this.occupantsByID,
            topic: this.topic,
            type: 'ConversationArea',
        };
    }
    /**
     * Creates a new ConversationArea object that will represent a Conversation Area object in the town map.
     * @param mapObject An ITiledMapObject that represents a rectangle in which this conversation area exists
     * @param broadcastEmitter An emitter that can be used by this conversation area to broadcast updates
     * @returns
     */
    static fromMapObject(mapObject, broadcastEmitter) {
        const { name, width, height } = mapObject;
        if (!width || !height) {
            throw new Error(`Malformed viewing area ${name}`);
        }
        const rect = { x: mapObject.x, y: mapObject.y, width, height };
        return new ConversationArea({ id: name, occupants: [] }, rect, broadcastEmitter);
    }
    handleCommand() {
        throw new InvalidParametersError_1.default('Unknown command type');
    }
}
exports.default = ConversationArea;
