"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jest_mock_extended_1 = require("jest-mock-extended");
const nanoid_1 = require("nanoid");
const Player_1 = __importDefault(require("../lib/Player"));
const TestUtils_1 = require("../TestUtils");
const ViewingArea_1 = __importDefault(require("./ViewingArea"));
describe('ViewingArea', () => {
    const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
    let testArea;
    const townEmitter = (0, jest_mock_extended_1.mock)();
    let newPlayer;
    const id = (0, nanoid_1.nanoid)();
    const isPlaying = true;
    const elapsedTimeSec = 10;
    const video = (0, nanoid_1.nanoid)();
    const occupants = [];
    beforeEach(() => {
        (0, jest_mock_extended_1.mockClear)(townEmitter);
        testArea = new ViewingArea_1.default({ id, isPlaying, elapsedTimeSec, video, occupants }, testAreaBox, townEmitter);
        newPlayer = new Player_1.default((0, nanoid_1.nanoid)(), (0, jest_mock_extended_1.mock)());
        testArea.add(newPlayer);
    });
    describe('remove', () => {
        it('Removes the player from the list of occupants and emits an interactableUpdate event', () => {
            const extraPlayer = new Player_1.default((0, nanoid_1.nanoid)(), (0, jest_mock_extended_1.mock)());
            testArea.add(extraPlayer);
            testArea.remove(newPlayer);
            expect(testArea.occupantsByID).toEqual([extraPlayer.id]);
            const lastEmittedUpdate = (0, TestUtils_1.getLastEmittedEvent)(townEmitter, 'interactableUpdate');
            expect(lastEmittedUpdate).toEqual({
                id,
                isPlaying,
                elapsedTimeSec,
                video,
                occupants: [extraPlayer.id],
                type: 'ViewingArea',
            });
        });
        it("Clears the player's conversationLabel and emits an update for their location", () => {
            testArea.remove(newPlayer);
            expect(newPlayer.location.interactableID).toBeUndefined();
            const lastEmittedMovement = (0, TestUtils_1.getLastEmittedEvent)(townEmitter, 'playerMoved');
            expect(lastEmittedMovement.location.interactableID).toBeUndefined();
        });
        it('Clears the video property when the last occupant leaves', () => {
            testArea.remove(newPlayer);
            const lastEmittedUpdate = (0, TestUtils_1.getLastEmittedEvent)(townEmitter, 'interactableUpdate');
            expect(lastEmittedUpdate).toEqual({
                id,
                isPlaying,
                elapsedTimeSec,
                video: undefined,
                occupants: [],
                type: 'ViewingArea',
            });
            expect(testArea.video).toBeUndefined();
        });
    });
    describe('add', () => {
        it('Adds the player to the occupants list', () => {
            expect(testArea.occupantsByID).toEqual([newPlayer.id]);
        });
        it("Sets the player's conversationLabel and emits an update for their location", () => {
            expect(newPlayer.location.interactableID).toEqual(id);
            const lastEmittedMovement = (0, TestUtils_1.getLastEmittedEvent)(townEmitter, 'playerMoved');
            expect(lastEmittedMovement.location.interactableID).toEqual(id);
        });
    });
    test('toModel sets the ID, video, isPlaying, occupants, and elapsedTimeSec', () => {
        const model = testArea.toModel();
        expect(model).toEqual({
            id,
            video,
            elapsedTimeSec,
            isPlaying,
            occupants: [newPlayer.id],
            type: 'ViewingArea',
        });
    });
    test('updateModel sets video, isPlaying and elapsedTimeSec', () => {
        testArea.updateModel({
            id: 'ignore',
            isPlaying: false,
            elapsedTimeSec: 150,
            video: 'test2',
            occupants: [],
            type: 'ViewingArea',
        });
        expect(testArea.isPlaying).toBe(false);
        expect(testArea.id).toBe(id);
        expect(testArea.elapsedTimeSec).toBe(150);
        expect(testArea.video).toBe('test2');
    });
    describe('fromMapObject', () => {
        it('Throws an error if the width or height are missing', () => {
            expect(() => ViewingArea_1.default.fromMapObject({ id: 1, name: (0, nanoid_1.nanoid)(), visible: true, x: 0, y: 0 }, townEmitter)).toThrowError();
        });
        it('Creates a new viewing area using the provided boundingBox and id, with isPlaying defaulting to false and progress to 0, and emitter', () => {
            const x = 30;
            const y = 20;
            const width = 10;
            const height = 20;
            const name = 'name';
            const val = ViewingArea_1.default.fromMapObject({ x, y, width, height, name, id: 10, visible: true }, townEmitter);
            expect(val.boundingBox).toEqual({ x, y, width, height });
            expect(val.id).toEqual(name);
            expect(val.isPlaying).toEqual(false);
            expect(val.elapsedTimeSec).toEqual(0);
            expect(val.video).toBeUndefined();
            expect(val.occupantsByID).toEqual([]);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlld2luZ0FyZWEudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90b3duL1ZpZXdpbmdBcmVhLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwyREFBcUQ7QUFDckQsbUNBQWdDO0FBQ2hDLDJEQUFtQztBQUNuQyw0Q0FBbUQ7QUFFbkQsZ0VBQXdDO0FBRXhDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFO0lBQzNCLE1BQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDO0lBQ2hFLElBQUksUUFBcUIsQ0FBQztJQUMxQixNQUFNLFdBQVcsR0FBRyxJQUFBLHlCQUFJLEdBQWUsQ0FBQztJQUN4QyxJQUFJLFNBQWlCLENBQUM7SUFDdEIsTUFBTSxFQUFFLEdBQUcsSUFBQSxlQUFNLEdBQUUsQ0FBQztJQUNwQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUM7SUFDdkIsTUFBTSxjQUFjLEdBQUcsRUFBRSxDQUFDO0lBQzFCLE1BQU0sS0FBSyxHQUFHLElBQUEsZUFBTSxHQUFFLENBQUM7SUFDdkIsTUFBTSxTQUFTLEdBQWUsRUFBRSxDQUFDO0lBRWpDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDZCxJQUFBLDhCQUFTLEVBQUMsV0FBVyxDQUFDLENBQUM7UUFDdkIsUUFBUSxHQUFHLElBQUkscUJBQVcsQ0FDeEIsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEVBQ25ELFdBQVcsRUFDWCxXQUFXLENBQ1osQ0FBQztRQUNGLFNBQVMsR0FBRyxJQUFJLGdCQUFNLENBQUMsSUFBQSxlQUFNLEdBQUUsRUFBRSxJQUFBLHlCQUFJLEdBQWUsQ0FBQyxDQUFDO1FBQ3RELFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxD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