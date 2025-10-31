"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jest_mock_extended_1 = require("jest-mock-extended");
const nanoid_1 = require("nanoid");
const Player_1 = __importDefault(require("../lib/Player"));
const TestUtils_1 = require("../TestUtils");
const ConversationArea_1 = __importDefault(require("./ConversationArea"));
describe('ConversationArea', () => {
    const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
    let testArea;
    const townEmitter = (0, jest_mock_extended_1.mock)();
    const topic = (0, nanoid_1.nanoid)();
    const id = (0, nanoid_1.nanoid)();
    let newPlayer;
    beforeEach(() => {
        (0, jest_mock_extended_1.mockClear)(townEmitter);
        testArea = new ConversationArea_1.default({ topic, id, occupants: [] }, testAreaBox, townEmitter);
        newPlayer = new Player_1.default((0, nanoid_1.nanoid)(), (0, jest_mock_extended_1.mock)());
        testArea.add(newPlayer);
    });
    describe('add', () => {
        it('Adds the player to the occupants list and emits an interactableUpdate event', () => {
            expect(testArea.occupantsByID).toEqual([newPlayer.id]);
            const lastEmittedUpdate = (0, TestUtils_1.getLastEmittedEvent)(townEmitter, 'interactableUpdate');
            expect(lastEmittedUpdate).toEqual({
                topic,
                id,
                occupants: [newPlayer.id],
                type: 'ConversationArea',
            });
        });
        it("Sets the player's conversationLabel and emits an update for their location", () => {
            expect(newPlayer.location.interactableID).toEqual(id);
            const lastEmittedMovement = (0, TestUtils_1.getLastEmittedEvent)(townEmitter, 'playerMoved');
            expect(lastEmittedMovement.location.interactableID).toEqual(id);
        });
    });
    describe('remove', () => {
        it('Removes the player from the list of occupants and emits an interactableUpdate event', () => {
            const extraPlayer = new Player_1.default((0, nanoid_1.nanoid)(), (0, jest_mock_extended_1.mock)());
            testArea.add(extraPlayer);
            testArea.remove(newPlayer);
            expect(testArea.occupantsByID).toEqual([extraPlayer.id]);
            const lastEmittedUpdate = (0, TestUtils_1.getLastEmittedEvent)(townEmitter, 'interactableUpdate');
            expect(lastEmittedUpdate).toEqual({
                topic,
                id,
                occupants: [extraPlayer.id],
                type: 'ConversationArea',
            });
        });
        it("Clears the player's conversationLabel and emits an update for their location", () => {
            testArea.remove(newPlayer);
            expect(newPlayer.location.interactableID).toBeUndefined();
            const lastEmittedMovement = (0, TestUtils_1.getLastEmittedEvent)(townEmitter, 'playerMoved');
            expect(lastEmittedMovement.location.interactableID).toBeUndefined();
        });
        it('Clears the topic of the conversation area when the last occupant leaves', () => {
            testArea.remove(newPlayer);
            const lastEmittedUpdate = (0, TestUtils_1.getLastEmittedEvent)(townEmitter, 'interactableUpdate');
            expect(lastEmittedUpdate).toEqual({
                topic: undefined,
                id,
                occupants: [],
                type: 'ConversationArea',
            });
            expect(testArea.topic).toBeUndefined();
        });
    });
    test('toModel sets the ID, topic and occupants and sets no other properties', () => {
        const model = testArea.toModel();
        expect(model).toEqual({
            id,
            topic,
            occupants: [newPlayer.id],
            type: 'ConversationArea',
        });
    });
    describe('fromMapObject', () => {
        it('Throws an error if the width or height are missing', () => {
            expect(() => ConversationArea_1.default.fromMapObject({ id: 1, name: (0, nanoid_1.nanoid)(), visible: true, x: 0, y: 0 }, townEmitter)).toThrowError();
        });
        it('Creates a new conversation area using the provided boundingBox and id, with an empty occupants list', () => {
            const x = 30;
            const y = 20;
            const width = 10;
            const height = 20;
            const name = 'name';
            const val = ConversationArea_1.default.fromMapObject({ x, y, width, height, name, id: 10, visible: true }, townEmitter);
            expect(val.boundingBox).toEqual({ x, y, width, height });
            expect(val.id).toEqual(name);
            expect(val.topic).toBeUndefined();
            expect(val.occupantsByID).toEqual([]);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udmVyc2F0aW9uQXJlYS50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Rvd24vQ29udmVyc2F0aW9uQXJlYS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkRBQXFEO0FBQ3JELG1DQUFnQztBQUNoQywyREFBbUM7QUFDbkMsNENBQW1EO0FBRW5ELDBFQUFrRDtBQUVsRCxRQUFRLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO0lBQ2hDLE1BQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDO0lBQ2hFLElBQUksUUFBMEIsQ0FBQztJQUMvQixNQUFNLFdBQVcsR0FBRyxJQUFBLHlCQUFJLEdBQWUsQ0FBQztJQUN4QyxNQUFNLEtBQUssR0FBRyxJQUFBLGVBQU0sR0FBRSxDQUFDO0lBQ3ZCLE1BQU0sRUFBRSxHQUFHLElBQUEsZUFBTSxHQUFFLENBQUM7SUFDcEIsSUFBSSxTQUFpQixDQUFDO0lBRXRCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDZCxJQUFBLDhCQUFTLEVBQUMsV0FBVyxDQUFDLENBQUM7UUFDdkIsUUFBUSxHQUFHLElBQUksMEJBQWdCLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDeEYsU0FBUyxHQUFHLElBQUksZ0JBQU0sQ0FBQyxJQUFBLGVBQU0sR0FBRSxFQUFFLElBQUEseUJBQUksR0FBZSxDQUFDLENBQUM7UUFDdEQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMxQixDQUFDLENBQUMsQ0FBQztJQUNILFFBQVEsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFO1FBQ25CLEVBQUUsQ0FBQyw2RUFBNkUsRUFB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