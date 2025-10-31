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
const tiled_map_type_guard_1 = require("@jonbell/tiled-map-type-guard");
const fs = __importStar(require("fs/promises"));
const nanoid_1 = require("nanoid");
const Town_1 = __importDefault(require("../town/Town"));
function passwordMatches(provided, expected) {
    if (provided === expected) {
        return true;
    }
    if (process.env.MASTER_TOWN_PASSWORD && process.env.MASTER_TOWN_PASWORD === provided) {
        return true;
    }
    return false;
}
const friendlyNanoID = (0, nanoid_1.customAlphabet)('1234567890ABCDEF', 8);
class TownsStore {
    static initializeTownsStore(emitterFactory) {
        TownsStore._instance = new TownsStore(emitterFactory);
    }
    /**
     * Retrieve the singleton TownsStore.
     *
     * There is only a single instance of the TownsStore - it follows the singleton pattern
     */
    static getInstance() {
        if (TownsStore._instance === undefined) {
            throw new Error('TownsStore must be initialized before getInstance is called');
        }
        return TownsStore._instance;
    }
    constructor(emitterFactory) {
        this._towns = [];
        this._emitterFactory = emitterFactory;
    }
    /**
     * Given a town ID, fetch the town model
     *
     * @param townID town ID to fetch
     * @returns the existing town controller, or undefined if there is no such town ID
     */
    getTownByID(townID) {
        return this._towns.find(town => town.townID === townID);
    }
    /**
     * @returns List of all publicly visible towns
     */
    getTowns() {
        return this._towns
            .filter(townController => townController.isPubliclyListed)
            .map(townController => ({
            townID: townController.townID,
            friendlyName: townController.friendlyName,
            currentOccupancy: townController.occupancy,
            maximumOccupancy: townController.capacity,
        }));
    }
    /**
     * Creates a new town, registering it in the Town Store, and returning that new town
     * @param friendlyName
     * @param isPubliclyListed
     * @returns the new town controller
     */
    async createTown(friendlyName, isPubliclyListed, mapFile = '../frontend/public/assets/tilemaps/indoors.json') {
        if (friendlyName.length === 0) {
            throw new Error('FriendlyName must be specified');
        }
        const townID = process.env.DEMO_TOWN_ID === friendlyName ? friendlyName : friendlyNanoID();
        const newTown = new Town_1.default(friendlyName, isPubliclyListed, townID, this._emitterFactory(townID));
        const data = JSON.parse(await fs.readFile(mapFile, 'utf-8'));
        const map = tiled_map_type_guard_1.ITiledMap.parse(data);
        newTown.initializeFromMap(map);
        this._towns.push(newTown);
        return newTown;
    }
    /**
     * Updates an existing town. Validates that the provided password is valid
     * @param townID
     * @param townUpdatePassword
     * @param friendlyName
     * @param makePublic
     * @returns true upon success, or false otherwise
     */
    updateTown(townID, townUpdatePassword, friendlyName, makePublic) {
        const existingTown = this.getTownByID(townID);
        if (existingTown && passwordMatches(townUpdatePassword, existingTown.townUpdatePassword)) {
            if (friendlyName !== undefined) {
                if (friendlyName.length === 0) {
                    return false;
                }
                existingTown.friendlyName = friendlyName;
            }
            if (makePublic !== undefined) {
                existingTown.isPubliclyListed = makePublic;
            }
            return true;
        }
        return false;
    }
    /**
     * Deletes a given town from this towns store, destroying the town controller in the process.
     * Checks that the password is valid before deletion
     * @param townID
     * @param townUpdatePassword
     * @returns true if the town exists and is successfully deleted, false otherwise
     */
    deleteTown(townID, townUpdatePassword) {
        const existingTown = this.getTownByID(townID);
        if (existingTown && passwordMatches(townUpdatePassword, existingTown.townUpdatePassword)) {
            this._towns = this._towns.filter(town => town !== existingTown);
            existingTown.disconnectAllPlayers();
            return true;
        }
        return false;
    }
}
exports.default = TownsStore;
