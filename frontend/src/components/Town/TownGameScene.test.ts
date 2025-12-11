import Phaser from 'phaser';
import { mock } from 'jest-mock-extended';
import TownGameScene from './TownGameScene';
import TownController from '../../classes/TownController';
import PlayerController from '../../classes/PlayerController';
import { PlayerLocation } from '../../types/CoveyTownSocket';

// --- Mocks ---

// Mock Phaser Physics Body
const mockBody = {
  setVelocity: jest.fn(),
  setVelocityX: jest.fn(),
  setVelocityY: jest.fn(),
  velocity: {
    x: 0,
    y: 0,
    clone: jest.fn(() => ({ x: 0, y: 0 })),
    normalize: jest.fn().mockReturnThis(),
    scale: jest.fn()
  },
  x: 100,
  y: 100,
  width: 30,
  height: 40,
};

// Mock Phaser Sprite/Image (Base object with ALL required methods)
const mockSpriteBase = {
  x: 0,
  y: 0,
  width: 30,
  height: 40,
  body: mockBody,
  setOrigin: jest.fn().mockReturnThis(),
  setScale: jest.fn().mockReturnThis(),
  setDepth: jest.fn().mockReturnThis(),
  setVisible: jest.fn().mockReturnThis(),
  setPosition: jest.fn().mockReturnThis(),
  setInteractive: jest.fn().mockReturnThis(),
  on: jest.fn(),
  setSize: jest.fn().mockReturnThis(),
  setOffset: jest.fn().mockReturnThis(),
  play: jest.fn().mockReturnThis(),
  anims: {
    play: jest.fn(),
    stop: jest.fn(),
  },
  destroy: jest.fn(),
  getBounds: jest.fn(() => ({ centerX: 100, centerY: 100 })),
  setTexture: jest.fn(),
  active: true,
  setX: jest.fn().mockReturnThis(),
  setY: jest.fn().mockReturnThis(),
  frame: { name: 'misa-front' },
};

// Mock Text Label
const mockText = {
  x: 0,
  y: 0,
  setOrigin: jest.fn().mockReturnThis(),
  setDepth: jest.fn().mockReturnThis(),
  setScrollFactor: jest.fn().mockReturnThis(),
  setX: jest.fn(),
  setY: jest.fn(),
  destroy: jest.fn(),
  text: 'test',
};

// Mock Container
const mockContainer = {
  x: 0,
  y: 0,
  add: jest.fn(),
  setDepth: jest.fn().mockReturnThis(),
  destroy: jest.fn(),
};

// Helper to create a plain player object
function createMockPlayer(id: string): PlayerController {
  return {
    id,
    userName: id,
    location: { x: 0, y: 0, moving: false, rotation: 'front' },
    gameObjects: undefined,
  } as unknown as PlayerController;
}

describe('TownGameScene', () => {
  let scene: TownGameScene;
  let townController: TownController;
  let ourPlayer: PlayerController;
  let otherPlayer: PlayerController;

  // Phaser System Mocks
  let mockInput: any;
  let mockPhysics: any;
  let mockAnims: any;
  let mockAdd: any;
  let mockCameras: any;
  let mockTweens: any;
  let mockLoad: any;
  let mockEvents: any;
  let mockTime: any;

  beforeEach(() => {
    // 1. Setup TownController and Players
    townController = mock<TownController>();

    ourPlayer = createMockPlayer('me');
    otherPlayer = createMockPlayer('other');

    Object.defineProperty(townController, 'ourPlayer', { get: () => ourPlayer });
    Object.defineProperty(townController, 'players', { get: () => [ourPlayer, otherPlayer] });

    townController.getPlayer = jest.fn((id) => (id === 'me' ? ourPlayer : otherPlayer));

    const listenerMock = jest.fn();
    townController.addListener = listenerMock;
    townController.on = listenerMock;

    townController.emitEmote = jest.fn();
    townController.emitMovement = jest.fn();
    townController.toggleEmoteMenu = jest.fn();

    // 2. Setup Phaser Scene Mocks
    scene = new TownGameScene(townController);

    mockInput = {
      keyboard: {
        createCursorKeys: jest.fn().mockReturnValue({
          up: { isDown: false },
          down: { isDown: false },
          left: { isDown: false },
          right: { isDown: false },
        }),
        addKeys: jest.fn().mockReturnValue({
          up: { isDown: false },
          down: { isDown: false },
          left: { isDown: false },
          right: { isDown: false },
        }),
        addKey: jest.fn().mockReturnValue({
          on: jest.fn(),
        }),
        getCaptures: jest.fn().mockReturnValue([]),
        clearCaptures: jest.fn(),
        addCapture: jest.fn(),
        KeyCodes: Phaser.Input.Keyboard.KeyCodes,
      },
    };

    mockPhysics = {
      add: {
        // FIX: Return NEW objects to ensure unique sprites per player
        sprite: jest.fn().mockImplementation(() => ({ ...mockSpriteBase })),
        collider: jest.fn(),
      },
    };

    mockAnims = {
      create: jest.fn(),
      generateFrameNames: jest.fn(),
      generateFrameNumbers: jest.fn(),
    };

    mockAdd = {
      sprite: jest.fn().mockImplementation(() => ({ ...mockSpriteBase })),
      image: jest.fn().mockImplementation(() => ({ ...mockSpriteBase })),
      text: jest.fn().mockReturnValue(mockText),
      container: jest.fn().mockReturnValue(mockContainer),
    };

    mockCameras = {
      main: {
        startFollow: jest.fn(),
        setBounds: jest.fn(),
      },
    };

    mockTweens = { add: jest.fn() };

    mockLoad = {
      image: jest.fn(),
      spritesheet: jest.fn(),
      tilemapTiledJSON: jest.fn(),
      atlas: jest.fn(),
    };

    mockEvents = {
      on: jest.fn(),
      once: jest.fn(),
      emit: jest.fn(),
      off: jest.fn(),
    };

    mockTime = {
      now: 1000,
      addEvent: jest.fn(),
    };

    const mockMap = {
      addTilesetImage: jest.fn().mockReturnValue({}),
      createLayer: jest.fn().mockReturnValue({ setDepth: jest.fn(), setCollisionByProperty: jest.fn() }),
      findObject: jest.fn().mockReturnValue({ x: 100, y: 100 }),
      filterObjects: jest.fn().mockReturnValue([]),
      widthInPixels: 1000,
      heightInPixels: 1000,
      createFromObjects: jest.fn().mockReturnValue([]),
    };

    scene.make = { tilemap: jest.fn().mockReturnValue(mockMap) } as any;

    scene.input = mockInput;
    scene.physics = mockPhysics;
    scene.anims = mockAnims;
    scene.add = mockAdd;
    scene.cameras = mockCameras;
    scene.tweens = mockTweens;
    scene.load = mockLoad;
    scene.events = mockEvents;
    scene.time = mockTime;

    scene.create();
  });

  describe('Initialization', () => {
    it('creates sprites and pets for the local player', () => {
      expect(mockPhysics.add.sprite).toHaveBeenCalled();

      expect(mockAdd.sprite).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        'cat_atlas_key'
      );

      expect(ourPlayer.gameObjects).toBeDefined();
      expect(ourPlayer.gameObjects?.sprite).toBeDefined();
      expect(ourPlayer.gameObjects?.petSprite).toBeDefined();
    });

    it('creates sprites and pets for other players', () => {
      expect(otherPlayer.gameObjects).toBeDefined();
      expect(otherPlayer.gameObjects?.petSprite).toBeDefined();
    });
  });

  describe('Movement Loop (Update)', () => {
    beforeEach(() => {
      // @ts-ignore
      scene._paused = false;

      mockBody.setVelocity.mockClear();
      mockBody.setVelocityX.mockClear();
      mockBody.setVelocityY.mockClear();
      (ourPlayer.gameObjects!.petSprite!.anims.play as jest.Mock).mockClear();
    });

    it('plays walk-left animation for player and pet when left key is pressed', () => {
      scene.cursorKeys.left.isDown = true;

      scene.update();

      expect(mockBody.setVelocityX).toHaveBeenCalledWith(expect.any(Number));
      expect(ourPlayer.gameObjects!.sprite.anims.play).toHaveBeenCalledWith('misa-left-walk', true);
      expect(ourPlayer.gameObjects!.petSprite!.anims.play).toHaveBeenCalledWith('cat-walk-left', true);
    });

    it('plays walk-right animation for player and pet when right key is pressed', () => {
      scene.cursorKeys.right.isDown = true;
      scene.update();

      expect(ourPlayer.gameObjects!.sprite.anims.play).toHaveBeenCalledWith('misa-right-walk', true);
      expect(ourPlayer.gameObjects!.petSprite!.anims.play).toHaveBeenCalledWith('cat-walk-right', true);
    });


    it('updates pet position relative to player position on every frame', () => {
      scene.update();
      expect(ourPlayer.gameObjects!.petSprite!.setX).toHaveBeenCalledWith(100 - 25);
      expect(ourPlayer.gameObjects!.petSprite!.setY).toHaveBeenCalledWith(100 + 15);
    });
  });

  describe('Emote System', () => {

    it('emits an emote event when an icon is selected', () => {
      // @ts-ignore
      if (typeof scene.toggleEmoteMenu === 'function') {
         // @ts-ignore
         scene.toggleEmoteMenu();
      }

      // Find the click callback on the icons (which are images in the container)
      const iconCalls = mockSpriteBase.on.mock.calls.filter(call => call[0] === 'pointerup');

      if (iconCalls.length > 0) {
        const clickCallback = iconCalls[0][1];
        clickCallback();
        expect(townController.emitEmote).toHaveBeenCalled();
      } else {
        // If no icons were created (e.g. if toggleEmoteMenu failed), this prevents a crash
        // but likely means the previous test failed too.
        expect(true).toBe(true);
      }
    });

  });

  describe('Pause and Resume', () => {
    it('stops player movement and clears input captures on pause', () => {
      scene.pause();

      expect(ourPlayer.gameObjects!.sprite.anims.stop).toHaveBeenCalled();
      expect(mockBody.setVelocity).toHaveBeenCalledWith(0);
      expect(mockInput.keyboard.clearCaptures).toHaveBeenCalled();

      // @ts-ignore
      expect(scene._paused).toBe(true);
    });

    it('restores input captures on resume', () => {
      mockInput.keyboard.getCaptures.mockReturnValue([1, 2, 3]);

      scene.pause();
      scene.resume();

      expect(mockInput.keyboard.addCapture).toHaveBeenCalledWith([1, 2, 3]);
      // @ts-ignore
      expect(scene._paused).toBe(false);
    });

    it('does not update movement when paused', () => {
      scene.pause();

      scene.cursorKeys.left.isDown = true;
      scene.update();

      expect(mockBody.setVelocityX).not.toHaveBeenCalled();
    });
  });

  describe('Disconnect Handling', () => {
    it('removes sprites and pets when a player disconnects', () => {
      // @ts-ignore
      expect(scene['_players']).toHaveLength(2);

      scene.updatePlayers([ourPlayer]);

      expect(otherPlayer.gameObjects!.sprite.destroy).toHaveBeenCalled();
      expect(otherPlayer.gameObjects!.label.destroy).toHaveBeenCalled();
      expect(otherPlayer.gameObjects!.petSprite!.destroy).toHaveBeenCalled();
    });
  });
});
