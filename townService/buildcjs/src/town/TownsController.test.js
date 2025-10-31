"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const jest_mock_extended_1 = require("jest-mock-extended");
const nanoid_1 = require("nanoid");
const TownsStore_1 = __importDefault(require("../lib/TownsStore"));
const TestUtils_1 = require("../TestUtils");
const TownsController_1 = require("./TownsController");
function expectTownListMatches(towns, town) {
    const matching = towns.find(townInfo => townInfo.townID === town.townID);
    if (town.isPubliclyListed) {
        expect(matching).toBeDefined();
        (0, assert_1.default)(matching);
        expect(matching.friendlyName).toBe(town.friendlyName);
    }
    else {
        expect(matching).toBeUndefined();
    }
}
const broadcastEmitter = jest.fn();
describe('TownsController integration tests', () => {
    let controller;
    const createdTownEmitters = new Map();
    async function createTownForTesting(friendlyNameToUse, isPublic = false) {
        const friendlyName = friendlyNameToUse !== undefined
            ? friendlyNameToUse
            : `${isPublic ? 'Public' : 'Private'}TestingTown=${(0, nanoid_1.nanoid)()}`;
        const ret = await controller.createTown({
            friendlyName,
            isPubliclyListed: isPublic,
            mapFile: 'testData/indoors.json',
        });
        return {
            friendlyName,
            isPubliclyListed: isPublic,
            townID: ret.townID,
            townUpdatePassword: ret.townUpdatePassword,
        };
    }
    function getBroadcastEmitterForTownID(townID) {
        const ret = createdTownEmitters.get(townID);
        if (!ret) {
            throw new Error(`Could not find broadcast emitter for ${townID}`);
        }
        return ret;
    }
    beforeAll(() => {
        process.env.TWILIO_API_AUTH_TOKEN = 'testing';
        process.env.TWILIO_ACCOUNT_SID = 'ACtesting';
        process.env.TWILIO_API_KEY_SID = 'testing';
        process.env.TWILIO_API_KEY_SECRET = 'testing';
    });
    beforeEach(async () => {
        createdTownEmitters.clear();
        broadcastEmitter.mockImplementation((townID) => {
            const mockRoomEmitter = (0, jest_mock_extended_1.mockDeep)();
            createdTownEmitters.set(townID, mockRoomEmitter);
            return mockRoomEmitter;
        });
        TownsStore_1.default.initializeTownsStore(broadcastEmitter);
        controller = new TownsController_1.TownsController();
    });
    describe('createTown', () => {
        it('Allows for multiple towns with the same friendlyName', async () => {
            const firstTown = await createTownForTesting();
            const secondTown = await createTownForTesting(firstTown.friendlyName);
            expect(firstTown.townID).not.toBe(secondTown.townID);
        });
        it('Prohibits a blank friendlyName', async () => {
            await expect(createTownForTesting('')).rejects.toThrowError();
        });
    });
    describe('listTowns', () => {
        it('Lists public towns, but not private towns', async () => {
            const pubTown1 = await createTownForTesting(undefined, true);
            const privTown1 = await createTownForTesting(undefined, false);
            const pubTown2 = await createTownForTesting(undefined, true);
            const privTown2 = await createTownForTesting(undefined, false);
            const towns = await controller.listTowns();
            expectTownListMatches(towns, pubTown1);
            expectTownListMatches(towns, pubTown2);
            expectTownListMatches(towns, privTown1);
            expectTownListMatches(towns, privTown2);
        });
        it('Allows for multiple towns with the same friendlyName', async () => {
            const pubTown1 = await createTownForTesting(undefined, true);
            const privTown1 = await createTownForTesting(pubTown1.friendlyName, false);
            const pubTown2 = await createTownForTesting(pubTown1.friendlyName, true);
            const privTown2 = await createTownForTesting(pubTown1.friendlyName, false);
            const towns = await controller.listTowns();
            expectTownListMatches(towns, pubTown1);
            expectTownListMatches(towns, pubTown2);
            expectTownListMatches(towns, privTown1);
            expectTownListMatches(towns, privTown2);
        });
    });
    describe('deleteTown', () => {
        it('Throws an error if the password is invalid', async () => {
            const { townID } = await createTownForTesting(undefined, true);
            await expect(controller.deleteTown(townID, (0, nanoid_1.nanoid)())).rejects.toThrowError();
        });
        it('Throws an error if the townID is invalid', async () => {
            const { townUpdatePassword } = await createTownForTesting(undefined, true);
            await expect(controller.deleteTown((0, nanoid_1.nanoid)(), townUpdatePassword)).rejects.toThrowError();
        });
        it('Deletes a town if given a valid password and town, no longer allowing it to be joined or listed', async () => {
            const { townID, townUpdatePassword } = await createTownForTesting(undefined, true);
            await controller.deleteTown(townID, townUpdatePassword);
            const { socket } = (0, TestUtils_1.mockPlayer)(townID);
            await controller.joinTown(socket);
            expect(socket.emit).not.toHaveBeenCalled();
            expect(socket.disconnect).toHaveBeenCalled();
            const listedTowns = await controller.listTowns();
            if (listedTowns.find(r => r.townID === townID)) {
                fail('Expected the deleted town to no longer be listed');
            }
        });
        it('Informs all players when a town is destroyed using the broadcast emitter and then disconnects them', async () => {
            const town = await createTownForTesting();
            const players = await Promise.all([...Array(10)].map(async () => {
                const player = (0, TestUtils_1.mockPlayer)(town.townID);
                await controller.joinTown(player.socket);
                return player;
            }));
            const townEmitter = getBroadcastEmitterForTownID(town.townID);
            await controller.deleteTown(town.townID, town.townUpdatePassword);
            (0, TestUtils_1.getLastEmittedEvent)(townEmitter, 'townClosing');
            players.forEach(eachPlayer => expect(eachPlayer.socket.disconnect).toBeCalledWith(true));
        });
    });
    describe('updateTown', () => {
        it('Checks the password before updating any values', async () => {
            const pubTown1 = await createTownForTesting(undefined, true);
            expectTownListMatches(await controller.listTowns(), pubTown1);
            await expect(controller.updateTown(pubTown1.townID, `${pubTown1.townUpdatePassword}*`, {
                friendlyName: 'broken',
                isPubliclyListed: false,
            })).rejects.toThrowError();
            expectTownListMatches(await controller.listTowns(), pubTown1);
        });
        it('Updates the friendlyName and visbility as requested', async () => {
            const pubTown1 = await createTownForTesting(undefined, false);
            expectTownListMatches(await controller.listTowns(), pubTown1);
            await controller.updateTown(pubTown1.townID, pubTown1.townUpdatePassword, {
                friendlyName: 'newName',
                isPubliclyListed: true,
            });
            pubTown1.friendlyName = 'newName';
            pubTown1.isPubliclyListed = true;
            expectTownListMatches(await controller.listTowns(), pubTown1);
        });
        it('Should fail if the townID does not exist', async () => {
            await expect(controller.updateTown((0, nanoid_1.nanoid)(), (0, nanoid_1.nanoid)(), { friendlyName: 'test', isPubliclyListed: true })).rejects.toThrow();
        });
    });
    describe('joinTown', () => {
        it('Disconnects the socket if the town does not exist', async () => {
            await createTownForTesting(undefined, true);
            const { socket } = (0, TestUtils_1.mockPlayer)((0, nanoid_1.nanoid)());
            await controller.joinTown(socket);
            expect(socket.emit).not.toHaveBeenCalled();
            expect(socket.disconnect).toHaveBeenCalled();
        });
        it('Admits a user to a valid public or private town and sends back initial data', async () => {
            const joinAndCheckInitialData = async (publiclyListed) => {
                const town = await createTownForTesting(undefined, publiclyListed);
                const player = (0, TestUtils_1.mockPlayer)(town.townID);
                await controller.joinTown(player.socket);
                expect(player.socket.emit).toHaveBeenCalled();
                expect(player.socket.disconnect).not.toHaveBeenCalled();
                const initialData = (0, TestUtils_1.getLastEmittedEvent)(player.socket, 'initialize');
                expect(initialData.friendlyName).toEqual(town.friendlyName);
                expect(initialData.isPubliclyListed).toEqual(publiclyListed);
                expect(initialData.interactables.length).toBeGreaterThan(0);
                expect(initialData.providerVideoToken).toBeDefined();
                expect(initialData.sessionToken).toBeDefined();
                expect(initialData.currentPlayers.length).toBe(1);
                expect(initialData.currentPlayers[0].userName).toEqual(player.userName);
                expect(initialData.currentPlayers[0].id).toEqual(initialData.userID);
            };
            await joinAndCheckInitialData(true);
            await joinAndCheckInitialData(false);
        });
        it('Includes active conversation areas in the initial join data', async () => {
            var _a;
            const town = await createTownForTesting(undefined, true);
            const player = (0, TestUtils_1.mockPlayer)(town.townID);
            await controller.joinTown(player.socket);
            const initialData = (0, TestUtils_1.getLastEmittedEvent)(player.socket, 'initialize');
            const conversationArea = (0, TestUtils_1.createConversationForTesting)({
                boundingBox: { x: 10, y: 10, width: 1, height: 1 },
                conversationID: (_a = initialData.interactables.find(eachInteractable => (0, TestUtils_1.isConversationArea)(eachInteractable))) === null || _a === void 0 ? void 0 : _a.id,
            });
            await controller.createConversationArea(town.townID, (0, TestUtils_1.extractSessionToken)(player), conversationArea);
            const player2 = (0, TestUtils_1.mockPlayer)(town.townID);
            await controller.joinTown(player2.socket);
            const initialData2 = (0, TestUtils_1.getLastEmittedEvent)(player2.socket, 'initialize');
            const createdArea = initialData2.interactables.find(eachInteractable => eachInteractable.id === conversationArea.id);
            expect(createdArea.topic).toEqual(conversationArea.topic);
            expect(initialData2.interactables.length).toEqual(initialData.interactables.length);
        });
    });
    describe('Interactables', () => {
        let testingTown;
        let player;
        let sessionToken;
        let interactables;
        beforeEach(async () => {
            testingTown = await createTownForTesting(undefined, true);
            player = (0, TestUtils_1.mockPlayer)(testingTown.townID);
            await controller.joinTown(player.socket);
            const initialData = (0, TestUtils_1.getLastEmittedEvent)(player.socket, 'initialize');
            sessionToken = initialData.sessionToken;
            interactables = initialData.interactables;
        });
        describe('Create Conversation Area', () => {
            it('Executes without error when creating a new conversation', async () => {
                var _a;
                await controller.createConversationArea(testingTown.townID, sessionToken, (0, TestUtils_1.createConversationForTesting)({
                    conversationID: (_a = interactables.find(TestUtils_1.isConversationArea)) === null || _a === void 0 ? void 0 : _a.id,
                }));
            });
            it('Returns an error message if the town ID is invalid', async () => {
                await expect(controller.createConversationArea((0, nanoid_1.nanoid)(), sessionToken, (0, TestUtils_1.createConversationForTesting)())).rejects.toThrow();
            });
            it('Checks for a valid session token before creating a conversation area', async () => {
                const conversationArea = (0, TestUtils_1.createConversationForTesting)();
                const invalidSessionToken = (0, nanoid_1.nanoid)();
                await expect(controller.createConversationArea(testingTown.townID, invalidSessionToken, conversationArea)).rejects.toThrow();
            });
            it('Returns an error message if addConversation returns false', async () => {
                const conversationArea = (0, TestUtils_1.createConversationForTesting)();
                await expect(controller.createConversationArea(testingTown.townID, sessionToken, conversationArea)).rejects.toThrow();
            });
        });
        describe('[T1] Create Viewing Area', () => {
            it('Executes without error when creating a new viewing area', async () => {
                const viewingArea = interactables.find(TestUtils_1.isViewingArea);
                if (!viewingArea) {
                    fail('Expected at least one viewing area to be returned in the initial join data');
                }
                else {
                    const newViewingArea = {
                        elapsedTimeSec: 100,
                        id: viewingArea.id,
                        video: (0, nanoid_1.nanoid)(),
                        isPlaying: true,
                        occupants: [],
                        type: 'ViewingArea',
                    };
                    await controller.createViewingArea(testingTown.townID, sessionToken, newViewingArea);
                    const townEmitter = getBroadcastEmitterForTownID(testingTown.townID);
                    const updateMessage = (0, TestUtils_1.getLastEmittedEvent)(townEmitter, 'interactableUpdate');
                    if ((0, TestUtils_1.isViewingArea)(updateMessage)) {
                        expect(updateMessage).toEqual(newViewingArea);
                    }
                    else {
                        fail('Expected an interactableUpdate to be dispatched with the new viewing area');
                    }
                }
            });
            it('Returns an error message if the town ID is invalid', async () => {
                const viewingArea = interactables.find(TestUtils_1.isViewingArea);
                const newViewingArea = {
                    elapsedTimeSec: 100,
                    id: viewingArea.id,
                    video: (0, nanoid_1.nanoid)(),
                    isPlaying: true,
                    occupants: [],
                    type: 'ViewingArea',
                };
                await expect(controller.createViewingArea((0, nanoid_1.nanoid)(), sessionToken, newViewingArea)).rejects.toThrow();
            });
            it('Checks for a valid session token before creating a viewing area', async () => {
                const invalidSessionToken = (0, nanoid_1.nanoid)();
                const viewingArea = interactables.find(TestUtils_1.isViewingArea);
                const newViewingArea = {
                    elapsedTimeSec: 100,
                    id: viewingArea.id,
                    video: (0, nanoid_1.nanoid)(),
                    isPlaying: true,
                    occupants: [],
                    type: 'ViewingArea',
                };
                await expect(controller.createViewingArea(testingTown.townID, invalidSessionToken, newViewingArea)).rejects.toThrow();
            });
            it('Returns an error message if addViewingArea returns false', async () => {
                const viewingArea = interactables.find(TestUtils_1.isViewingArea);
                viewingArea.id = (0, nanoid_1.nanoid)();
                await expect(controller.createViewingArea(testingTown.townID, sessionToken, viewingArea)).rejects.toThrow();
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG93bnNDb250cm9sbGVyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdG93bi9Ub3duc0NvbnRyb2xsZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLG9EQUE0QjtBQUM1QiwyREFBNkQ7QUFDN0QsbUNBQWdDO0FBR2hDLG1FQUEyQztBQUMzQyw0Q0FRc0I7QUFDdEIsdURBQW9EO0FBU3BELFNBQVMscUJBQXFCLENBQUMsS0FBYSxFQUFFLElBQWtCO0lBQzlELE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN6RSxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtRQUN6QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0IsSUFBQSxnQkFBTSxFQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUN2RDtTQUFNO1FBQ0wsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO0tBQ2xDO0FBQ0gsQ0FBQztBQUVELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQ25DLFFBQVEsQ0FBQyxtQ0FBbUMsRUFBRSxHQUFHLEVBQUU7SUFDakQsSUFBSSxVQUEyQixDQUFDO0lBRWhDLE1BQU0sbUJBQW1CLEdBQTRDLElBQUksR0FBRyxFQUFFLENBQUM7SUFDL0UsS0FBSyxVQUFVLG9CQUFvQixDQUNqQyxpQkFBMEIsRUFDMUIsUUFBUSxHQUFHLEtBQUs7UUFFaEIsTUFBTSxZQUFZLEdBQ2hCLGlCQUFpQixLQUFLLFNBQVM7WUFDN0IsQ0FBQyxDQUFDLGlCQUFp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