"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const InvalidParametersError_1 = __importDefault(require("../lib/InvalidParametersError"));
const InteractableArea_1 = __importDefault(require("./InteractableArea"));
class ViewingArea extends InteractableArea_1.default {
    get video() {
        return this._video;
    }
    get elapsedTimeSec() {
        return this._elapsedTimeSec;
    }
    get isPlaying() {
        return this._isPlaying;
    }
    /**
     * Creates a new ViewingArea
     *
     * @param viewingArea model containing this area's starting state
     * @param coordinates the bounding box that defines this viewing area
     * @param townEmitter a broadcast emitter that can be used to emit updates to players
     */
    constructor({ id, isPlaying, elapsedTimeSec: progress, video }, coordinates, townEmitter) {
        super(id, coordinates, townEmitter);
        this._video = video;
        this._elapsedTimeSec = progress;
        this._isPlaying = isPlaying;
    }
    /**
     * Removes a player from this viewing area.
     *
     * When the last player leaves, this method clears the video of this area and
     * emits that update to all of the players
     *
     * @param player
     */
    remove(player) {
        super.remove(player);
        if (this._occupants.length === 0) {
            this._video = undefined;
            this._emitAreaChanged();
        }
    }
    /**
     * Updates the state of this ViewingArea, setting the video, isPlaying and progress properties
     *
     * @param viewingArea updated model
     */
    updateModel({ isPlaying, elapsedTimeSec: progress, video }) {
        this._video = video;
        this._isPlaying = isPlaying;
        this._elapsedTimeSec = progress;
    }
    /**
     * Convert this ViewingArea instance to a simple ViewingAreaModel suitable for
     * transporting over a socket to a client.
     */
    toModel() {
        return {
            id: this.id,
            video: this._video,
            isPlaying: this._isPlaying,
            elapsedTimeSec: this._elapsedTimeSec,
            occupants: this.occupantsByID,
            type: 'ViewingArea',
        };
    }
    /**
     * Creates a new ViewingArea object that will represent a Viewing Area object in the town map.
     * @param mapObject An ITiledMapObject that represents a rectangle in which this viewing area exists
     * @param townEmitter An emitter that can be used by this viewing area to broadcast updates to players in the town
     * @returns
     */
    static fromMapObject(mapObject, townEmitter) {
        const { name, width, height } = mapObject;
        if (!width || !height) {
            throw new Error(`Malformed viewing area ${name}`);
        }
        const rect = { x: mapObject.x, y: mapObject.y, width, height };
        return new ViewingArea({ isPlaying: false, id: name, elapsedTimeSec: 0, occupants: [] }, rect, townEmitter);
    }
    handleCommand(command) {
        if (command.type === 'ViewingAreaUpdate') {
            const viewingArea = command;
            this.updateModel(viewingArea.update);
            return {};
        }
        throw new InvalidParametersError_1.default('Unknown command type');
    }
}
exports.default = ViewingArea;
