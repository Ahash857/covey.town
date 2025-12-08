import { mock, MockProxy } from 'jest-mock-extended';
import TownGameScene from './TownGameScene'; 
import TownController from '../../classes/TownController'; 
import PlayerController from '../../classes/PlayerController'; 
import Phaser from 'phaser';

// We need to fake the game engine because Jest runs in a terminal, not a browser
jest.mock('phaser', () => {
  return {
    GameObjects: {
      Container: jest.fn(),
      Sprite: jest.fn(),
      Text: jest.fn(),
      Image: jest.fn(),
    },
    Scene: jest.fn(),
    Math: {
      // We must implement Linear interpolation for the vector math to work in tests
      Linear: (p0: number, p1: number, t: number) => p0 + (p1 - p0) * t,
    },
    Input: {
      Keyboard: {
        KeyCodes: {},
      },
    },
    Geom: {
      Rectangle: {
        Overlaps: jest.fn().mockReturnValue(false),
      }
    },
    Scenes: {
      Events: {
        DESTROY: 'destroy',
      }
    }
  };
});

describe('TownGameScene', () => {
  let townController: MockProxy<TownController>;
  let gameScene: TownGameScene;
  let ourPlayer: MockProxy<PlayerController>;
  
  // Mocks for the specific game objects we interact with
  let mockSprite: any;
  let mockPetSprite: any;
  let addTextSpy: jest.Mock;

  beforeEach(() => {
    townController = mock<TownController>();
    ourPlayer = mock<PlayerController>();
    
    // 1. Setup the Player and Pet Sprites
    mockSprite = { 
      x: 0, 
      y: 0, 
      body: { 
        x: 0, 
        y: 0, 
        velocity: { clone: () => ({ x: 0, y: 0 }) }, 
        setVelocity: jest.fn(), 
        setVelocityX: jest.fn(), 
        setVelocityY: jest.fn(), 
        normalize: () => ({ scale: jest.fn() }) 
      }, 
      getBounds: () => ({ centerX: 0, centerY: 0 }), 
      anims: { play: jest.fn(), stop: jest.fn() }, 
      setTexture: jest.fn(), 
      setSize: jest.fn(), 
      setOffset: jest.fn(), 
      setDepth: jest.fn(), 
      visible: true,
      width: 30,
      height: 40,
    };

    mockPetSprite = { 
      x: 0, 
      y: 0, 
      setX: jest.fn(), 
      setY: jest.fn(), 
      setVisible: jest.fn(), 
      play: jest.fn(), 
      anims: { play: jest.fn() }, 
      destroy: jest.fn(),
      active: true,
    };
    
    // Attach these sprites to the player controller
    ourPlayer.gameObjects = {
      sprite: mockSprite,
      label: mock<Phaser.GameObjects.Text>(),
      petSprite: mockPetSprite,
      locationManagedByGameScene: true,
    };

    // Link player to controller
    Object.defineProperty(townController, 'ourPlayer', { get: () => ourPlayer });
    Object.defineProperty(townController, 'players', { get: () => [ourPlayer] });

    // 2. Instantiate the Scene
    gameScene = new TownGameScene(townController);
    
    // 3. Inject Phaser Internals (Simulate the engine)
    addTextSpy = jest.fn().mockReturnValue({ 
      setDepth: jest.fn().mockReturnThis(), 
      setOrigin: jest.fn().mockReturnThis(), 
      destroy: jest.fn(),
      y: 0,
    });

    // We manually attach these properties because we aren't running the real Phaser boot process
    (gameScene as any).sys = { isActive: () => true }; // Important: Makes the "Zombie Check" pass
    (gameScene as any).events = { once: jest.fn(), on: jest.fn() };
    (gameScene as any).add = { 
        text: addTextSpy,
        sprite: jest.fn().mockReturnValue(mockPetSprite),
        image: jest.fn().mockReturnValue({ setScale: jest.fn(), setInteractive: jest.fn(), on: jest.fn() }),
        container: jest.fn().mockReturnValue({ setDepth: jest.fn(), add: jest.fn() }),
    };
    (gameScene as any).physics = { add: { sprite: jest.fn().mockReturnValue(mockSprite), collider: jest.fn() } };
    (gameScene as any).tweens = { add: jest.fn() };
    (gameScene as any).input = { keyboard: { createCursorKeys: jest.fn().mockReturnValue({}), addKeys: jest.fn(), addCapture: jest.fn(), clearCaptures: jest.fn(), getCaptures: jest.fn() } };
    (gameScene as any).cameras = { main: { startFollow: jest.fn(), setBounds: jest.fn() } };
    (gameScene as any).make = { tilemap: jest.fn().mockReturnValue({ addTilesetImage: jest.fn(), createLayer: jest.fn().mockReturnValue({ setDepth: jest.fn(), setCollisionByProperty: jest.fn() }), widthInPixels: 800, heightInPixels: 600, findObject: jest.fn().mockReturnValue({ x: 100, y: 100 }), filterObjects: jest.fn() }) };
    (gameScene as any).load = { image: jest.fn(), spritesheet: jest.fn(), tilemapTiledJSON: jest.fn(), atlas: jest.fn() };
    (gameScene as any).anims = { create: jest.fn(), generateFrameNames: jest.fn(), generateFrameNumbers: jest.fn() };
    (gameScene as any).time = { now: 1000 };
    
    // 4. Initialize the scene (Attach listeners)
    gameScene.create();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Pet Guiding Logic', () => {
    it('should start guiding when "pet-guide-to" event is dispatched', () => {
      // 1. Dispatch the event
      const targetX = 500;
      const targetY = 500;
      const guideEvent = new CustomEvent('pet-guide-to', { detail: { x: targetX, y: targetY } });
      window.dispatchEvent(guideEvent);

      // 2. Setup positions
      // Player is at (0,0)
      mockSprite.body.x = 0;
      mockSprite.body.y = 0;
      // Pet is at (0,0)
      mockPetSprite.x = 0;
      mockPetSprite.y = 0;
      
      // 3. Run the game loop once
      gameScene.update();

      // 4. Verification
      // The pet should have moved.
      expect(mockPetSprite.setX).toHaveBeenCalled();
      expect(mockPetSprite.setY).toHaveBeenCalled();
      
      // Check Direction: If target is (500,500), pet should move positively
      const newX = mockPetSprite.setX.mock.calls[0][0];
      const newY = mockPetSprite.setY.mock.calls[0][0];
      
      // It should move towards the target
      expect(newX).toBeGreaterThan(0);
      expect(newY).toBeGreaterThan(0);
      
      // It should play the walking animation
      expect(mockPetSprite.anims.play).toHaveBeenCalledWith('cat-walk-right', true);
    });

    it('should stop guiding and show "We are here!" when close to target', () => {
      // 1. Start guiding to a specific point
      const targetX = 100;
      const targetY = 100;
      window.dispatchEvent(new CustomEvent('pet-guide-to', { detail: { x: targetX, y: targetY } }));

      // 2. Move player VERY close to target (within the 150px threshold)
      // Distance here is roughly 14px, which is < 150
      mockSprite.body.x = 90;
      mockSprite.body.y = 90;
      
      // 3. Run update
      gameScene.update();

      // 4. Verification
      // The "We are here!" text should be created
      expect(addTextSpy).toHaveBeenCalledWith(
        expect.any(Number), // x position
        expect.any(Number), // y position
        "We are here!",     // The expected text
        expect.any(Object)  // style object
      );

      // The fade-out tween should be added
      expect((gameScene as any).tweens.add).toHaveBeenCalled();
    });

    it('should stay in "Heel" position if no guide event is active', () => {
      // 1. Ensure NO event is dispatched
      
      // 2. Setup player position
      mockSprite.getBounds = () => ({ centerX: 100, centerY: 100 });
      
      // 3. Run update
      gameScene.update();

      // 4. Verification
      // Standard heel logic: centerX - 25, centerY + 15
      // 100 - 25 = 75
      // 100 + 15 = 115
      expect(mockPetSprite.setX).toHaveBeenCalledWith(75);
      expect(mockPetSprite.setY).toHaveBeenCalledWith(115);
      
      // Should play idle animation
      expect(mockPetSprite.anims.play).toHaveBeenCalledWith('cat-idle', true);
    });
    
    it('should remove the event listener when the scene is destroyed', () => {
        const removeSpy = jest.spyOn(window, 'removeEventListener');
        
        // 1. Manually trigger the destroy event handler
        // Since we can't easily trigger the real Phaser event emitter in a mock,
        // we grab the callback passed to `this.events.once('destroy', callback)`
        // and execute it.
        
        const destroyCallback = (gameScene as any).events.once.mock.calls.find(
            (call: any[]) => call[0] === 'destroy' || call[0] === Phaser.Scenes.Events.DESTROY
        )[1];

        // Execute the cleanup function
        destroyCallback();

        // 2. Verify cleanup happened
        expect(removeSpy).toHaveBeenCalledWith('pet-guide-to', expect.any(Function));
    });
  });
});