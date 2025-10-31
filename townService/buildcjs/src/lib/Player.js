"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nanoid_1 = require("nanoid");
/**
 * Each user who is connected to a town is represented by a Player object
 */
class Player {
    constructor(userName, townEmitter) {
        this.location = {
            x: 0,
            y: 0,
            moving: false,
            rotation: 'front',
        };
        this._userName = userName;
        this._id = (0, nanoid_1.nanoid)();
        this._sessionToken = (0, nanoid_1.nanoid)();
        this.townEmitter = townEmitter;
    }
    get userName() {
        return this._userName;
    }
    get id() {
        return this._id;
    }
    set videoToken(value) {
        this._videoToken = value;
    }
    get videoToken() {
        return this._videoToken;
    }
    get sessionToken() {
        return this._sessionToken;
    }
    toPlayerModel() {
        return {
            id: this._id,
            location: this.location,
            userName: this._userName,
        };
    }
}
exports.default = Player;
