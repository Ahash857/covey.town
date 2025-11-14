"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TownsController = void 0;
const assert_1 = __importDefault(require("assert"));
const tsoa_1 = require("tsoa");
const InvalidParametersError_1 = __importDefault(require("../lib/InvalidParametersError"));
const TownsStore_1 = __importDefault(require("../lib/TownsStore"));
/**
 * This is the town route
 */
let TownsController = class TownsController extends tsoa_1.Controller {
    constructor() {
        super(...arguments);
        this._townsStore = TownsStore_1.default.getInstance();
    }
    /**
     * List all towns that are set to be publicly available
     *
     * @returns list of towns
     */
    async listTowns() {
        return this._townsStore.getTowns();
    }
    /**
     * Create a new town
     *
     * @param request The public-facing information for the new town
     * @example request {"friendlyName": "My testing town public name", "isPubliclyListed": true}
     * @returns The ID of the newly created town, and a secret password that will be needed to update or delete this town.
     */
    async createTown(request) {
        const { townID, townUpdatePassword } = await this._townsStore.createTown(request.friendlyName, request.isPubliclyListed, request.mapFile);
        return {
            townID,
            townUpdatePassword,
        };
    }
    /**
     * Updates an existing town's settings by ID
     *
     * @param townID  town to update
     * @param townUpdatePassword  town update password, must match the password returned by createTown
     * @param requestBody The updated settings
     */
    async updateTown(townID, townUpdatePassword, requestBody) {
        const success = this._townsStore.updateTown(townID, townUpdatePassword, requestBody.friendlyName, requestBody.isPubliclyListed);
        if (!success) {
            throw new InvalidParametersError_1.default('Invalid password or update values specified');
        }
    }
    /**
     * Deletes a town
     * @param townID ID of the town to delete
     * @param townUpdatePassword town update password, must match the password returned by createTown
     */
    async deleteTown(townID, townUpdatePassword) {
        const success = this._townsStore.deleteTown(townID, townUpdatePassword);
        if (!success) {
            throw new InvalidParametersError_1.default('Invalid password or update values specified');
        }
    }
    /**
     * Creates a conversation area in a given town
     * @param townID ID of the town in which to create the new conversation area
     * @param sessionToken session token of the player making the request, must match the session token returned when the player joined the town
     * @param requestBody The new conversation area to create
     */
    async createConversationArea(townID, sessionToken, requestBody) {
        const town = this._townsStore.getTownByID(townID);
        if (!(town === null || town === void 0 ? void 0 : town.getPlayerBySessionToken(sessionToken))) {
            throw new InvalidParametersError_1.default('Invalid values specified');
        }
        const success = town.addConversationArea({ ...requestBody, type: 'ConversationArea' });
        if (!success) {
            throw new InvalidParametersError_1.default('Invalid values specified');
        }
    }
    /**
     * Creates a viewing area in a given town
     *
     * @param townID ID of the town in which to create the new viewing area
     * @param sessionToken session token of the player making the request, must
     *        match the session token returned when the player joined the town
     * @param requestBody The new viewing area to create
     *
     * @throws InvalidParametersError if the session token is not valid, or if the
     *          viewing area could not be created
     */
    async createViewingArea(townID, sessionToken, requestBody) {
        const town = this._townsStore.getTownByID(townID);
        if (!town) {
            throw new InvalidParametersError_1.default('Invalid values specified');
        }
        if (!(town === null || town === void 0 ? void 0 : town.getPlayerBySessionToken(sessionToken))) {
            throw new InvalidParametersError_1.default('Invalid values specified');
        }
        const success = town.addViewingArea({ ...requestBody, type: 'ViewingArea' });
        if (!success) {
            throw new InvalidParametersError_1.default('Invalid values specified');
        }
    }
    /**
     * Retrieves up to the first 200 chat messages for a given town, optionally filtered by interactableID
     * @param townID town to retrieve messages for
     * @param sessionToken a valid session token for a player in the town
     * @param interactableID optional interactableID to filter messages by
     * @returns list of chat messages
     */
    async getChatMessages(townID, sessionToken, interactableID) {
        const town = this._townsStore.getTownByID(townID);
        if (!town) {
            throw new InvalidParametersError_1.default('Invalid values specified');
        }
        const player = town.getPlayerBySessionToken(sessionToken);
        if (!player) {
            throw new InvalidParametersError_1.default('Invalid values specified');
        }
        const messages = town.getChatMessages(interactableID);
        return messages;
    }
    /**
     * Connects a client's socket to the requested town, or disconnects the socket if no such town exists
     *
     * @param socket A new socket connection, with the userName and townID parameters of the socket's
     * auth object configured with the desired townID to join and username to use
     *
     */
    async joinTown(socket) {
        // Parse the client's requested username from the connection
        const { userName, townID } = socket.handshake.auth;
        const town = this._townsStore.getTownByID(townID);
        if (!town) {
            socket.disconnect(true);
            return;
        }
        // Connect the client to the socket.io broadcast room for this town
        socket.join(town.townID);
        const newPlayer = await town.addPlayer(userName, socket);
        (0, assert_1.default)(newPlayer.videoToken);
        socket.emit('initialize', {
            userID: newPlayer.id,
            sessionToken: newPlayer.sessionToken,
            providerVideoToken: newPlayer.videoToken,
            currentPlayers: town.players.map(eachPlayer => eachPlayer.toPlayerModel()),
            friendlyName: town.friendlyName,
            isPubliclyListed: town.isPubliclyListed,
            interactables: town.interactables.map(eachInteractable => eachInteractable.toModel()),
        });
    }
};
__decorate([
    (0, tsoa_1.Get)()
], TownsController.prototype, "listTowns", null);
__decorate([
    (0, tsoa_1.Example)({ townID: 'stringID', townUpdatePassword: 'secretPassword' }),
    (0, tsoa_1.Post)(),
    __param(0, (0, tsoa_1.Body)())
], TownsController.prototype, "createTown", null);
__decorate([
    (0, tsoa_1.Patch)('{townID}'),
    (0, tsoa_1.Response)(400, 'Invalid password or update values specified'),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Header)('X-CoveyTown-Password')),
    __param(2, (0, tsoa_1.Body)())
], TownsController.prototype, "updateTown", null);
__decorate([
    (0, tsoa_1.Delete)('{townID}'),
    (0, tsoa_1.Response)(400, 'Invalid password or update values specified'),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Header)('X-CoveyTown-Password'))
], TownsController.prototype, "deleteTown", null);
__decorate([
    (0, tsoa_1.Post)('{townID}/conversationArea'),
    (0, tsoa_1.Response)(400, 'Invalid values specified'),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Header)('X-Session-Token')),
    __param(2, (0, tsoa_1.Body)())
], TownsController.prototype, "createConversationArea", null);
__decorate([
    (0, tsoa_1.Post)('{townID}/viewingArea'),
    (0, tsoa_1.Response)(400, 'Invalid values specified'),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Header)('X-Session-Token')),
    __param(2, (0, tsoa_1.Body)())
], TownsController.prototype, "createViewingArea", null);
__decorate([
    (0, tsoa_1.Get)('{townID}/chatMessages'),
    (0, tsoa_1.Response)(400, 'Invalid values specified'),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Header)('X-Session-Token')),
    __param(2, (0, tsoa_1.Query)())
], TownsController.prototype, "getChatMessages", null);
TownsController = __decorate([
    (0, tsoa_1.Route)('towns'),
    (0, tsoa_1.Tags)('towns')
    // TSOA (which we use to generate the REST API from this file) does not support default exports, so the controller can't be a default export.
    // eslint-disable-next-line import/prefer-default-export
], TownsController);
exports.TownsController = TownsController;
