import assert from 'assert';
import Phaser from 'phaser';
import PlayerController, { MOVEMENT_SPEED } from '../../classes/PlayerController';
import TownController from '../../classes/TownController';
import { PlayerLocation } from '../../types/CoveyTownSocket';
import { Callback } from '../VideoCall/VideoFrontend/types';
import Interactable from './Interactable';
import ConversationArea from './interactables/ConversationArea';
import GameArea from './interactables/GameArea';
import Transporter from './interactables/Transporter';
import ViewingArea from './interactables/ViewingArea';

// Still not sure what the right type is here... "Interactable" doesn't do it
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function interactableTypeForObjectType(type: string): any {
  if (type === 'ConversationArea') {
    return ConversationArea;
  } else if (type === 'Transporter') {
    return Transporter;
  } else if (type === 'ViewingArea') {
    return ViewingArea;
  } else if (type === 'GameArea') {
    return GameArea;
  } else {
    throw new Error(`Unknown object type: ${type}`);
  }
}

// Original inspiration and code from:
// https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6
export default class TownGameScene extends Phaser.Scene {
  private _pendingOverlapExits = new Map<Interactable, () => void>();

  addOverlapExit(interactable: Interactable, callback: () => void) {
    this._pendingOverlapExits.set(interactable, callback);
  }

  private _players: PlayerController[] = [];

  private _interactables: Interactable[] = [];

  private _cursors: Phaser.Types.Input.Keyboard.CursorKeys[] = [];

  private _cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;

  /*
   * A "captured" key doesn't send events to the browser - they are trapped by Phaser
   * When pausing the game, we uncapture all keys, and when resuming, we re-capture them.
   * This is the list of keys that are currently captured by Phaser.
   */
  private _previouslyCapturedKeys: number[] = [];

  private _lastLocation?: PlayerLocation;

  private _ready = false;

  private _paused = false;

  public coveyTownController: TownController;

  private _onGameReadyListeners: Callback[] = [];
  private _emoteMenuContainer?: Phaser.GameObjects.Container;
  private _isEmoteMenuOpen = false;
  private _emoteMenuCooldownMs = 5000; // 1 second between opens
  private _lastEmoteMenuOpenTime = 0;
  private _emoteMenuOffsetX = 190;
  private _emoteMenuOffsetY = 120;
  private _activeEmotes: {
    sprite: Phaser.GameObjects.Sprite;
    player: PlayerController;
    offsetX: number;
    offsetY: number;
  }[] = [];


  private _emoteAnimations: Record<string, string> = {
    //TODO: add other emotes here
    'mimimi-spritesheet': 'mimimiAnim',
    'laugh-spritesheet' : 'laughAnim',
  };
  /**
   * Layers that the player can collide with.
   */
  private _collidingLayers: Phaser.Tilemaps.TilemapLayer[] = [];

  private _gameIsReady = new Promise<void>(resolve => {
    if (this._ready) {
      resolve();
    } else {
      this._onGameReadyListeners.push(resolve);
    }
  });

  public get gameIsReady() {
    return this._gameIsReady;
  }

  public get cursorKeys() {
    const ret = this._cursorKeys;
    if (!ret) {
      throw new Error('Unable to access cursors before game scene is loaded');
    }
    return ret;
  }

  private _resourcePathPrefix: string;

  constructor(coveyTownController: TownController, resourcePathPrefix = '') {
    super('TownGameScene');
    this._resourcePathPrefix = resourcePathPrefix;
    this.coveyTownController = coveyTownController;
    this._players = this.coveyTownController.players;
  }

  preload() {
    this.load.image(
      'Room_Builder_32x32',
      this._resourcePathPrefix + '/assets/tilesets/Room_Builder_32x32.png',
    );
    this.load.image(
      '22_Museum_32x32',
      this._resourcePathPrefix + '/assets/tilesets/22_Museum_32x32.png',
    );
    this.load.image(
      '5_Classroom_and_library_32x32',
      this._resourcePathPrefix + '/assets/tilesets/5_Classroom_and_library_32x32.png',
    );
    this.load.image(
      '12_Kitchen_32x32',
      this._resourcePathPrefix + '/assets/tilesets/12_Kitchen_32x32.png',
    );
    this.load.image(
      '1_Generic_32x32',
      this._resourcePathPrefix + '/assets/tilesets/1_Generic_32x32.png',
    );
    this.load.image(
      '13_Conference_Hall_32x32',
      this._resourcePathPrefix + '/assets/tilesets/13_Conference_Hall_32x32.png',
    );
    this.load.image(
      '14_Basement_32x32',
      this._resourcePathPrefix + '/assets/tilesets/14_Basement_32x32.png',
    );
    this.load.image(
      '16_Grocery_store_32x32',
      this._resourcePathPrefix + '/assets/tilesets/16_Grocery_store_32x32.png',
    );
    this.load.image(
      'emoteMenu',
      this._resourcePathPrefix + '/assets/emotes/emote-menu.png',
    );
    this.load.image(
      'mimimi-static',
      this._resourcePathPrefix + '/assets/emotes/mimimi-static.png',
    );
    this.load.image(
      'laugh-static',
      this._resourcePathPrefix + '/assets/emotes/laugh-static.png',
    );
    this.load.spritesheet(
      'mimimi-spritesheet',
      this._resourcePathPrefix + '/assets/emotes/spritesheets/mimimi.png',
      {
        frameWidth: 354,
        frameHeight: 266,
      },
    );
    this.load.spritesheet(
      'laugh-spritesheet',
      this._resourcePathPrefix + '/assets/emotes/spritesheets/laugh-spritesheet.png',
      {
        frameWidth: 480,
        frameHeight: 480,
      },
    );
    this.load.tilemapTiledJSON('map', this._resourcePathPrefix + '/assets/tilemaps/indoors.json');
    this.load.atlas(
      'atlas',
      this._resourcePathPrefix + '/assets/atlas/atlas.png',
      this._resourcePathPrefix + '/assets/atlas/atlas.json',
    );

    // load the pet atlas
    this.load.atlas(
      'cat_atlas_key',
      this._resourcePathPrefix + '/assets/sprites/cat_atlas.png',
      this._resourcePathPrefix + '/assets/sprites/cat_atlas.json',
    );
  }

  updatePlayers(players: PlayerController[]) {
    //Make sure that each player has sprites
    players.map(eachPlayer => this.createPlayerSprites(eachPlayer));

    // Remove disconnected players from board
    const disconnectedPlayers = this._players.filter(
      player => !players.find(p => p.id === player.id),
    );

    disconnectedPlayers.forEach(disconnectedPlayer => {
      if (disconnectedPlayer.gameObjects) {
        // FIX: Include petSprite in destructuring so it's defined
        const { sprite, label, petSprite } = disconnectedPlayer.gameObjects;
        if (sprite && label) {
          sprite.destroy();
          label.destroy();
          if(petSprite) { // Now petSprite is defined and can be destroyed
            petSprite.destroy();
          }
        }
      }
    });
    // Remove disconnected players from list
    this._players = players;
  }

  getNewMovementDirection() {
    if (this._cursors.find(keySet => keySet.left?.isDown)) {
      return 'left';
    }
    if (this._cursors.find(keySet => keySet.right?.isDown)) {
      return 'right';
    }
    if (this._cursors.find(keySet => keySet.down?.isDown)) {
      return 'front';
    }
    if (this._cursors.find(keySet => keySet.up?.isDown)) {
      return 'back';
    }
    return undefined;
  }

  moveOurPlayerTo(destination: Partial<PlayerLocation>) {
    const gameObjects = this.coveyTownController.ourPlayer.gameObjects;
    if (!gameObjects) {
      throw new Error('Unable to move player without game objects created first');
    }
    if (!this._lastLocation) {
      this._lastLocation = { moving: false, rotation: 'front', x: 0, y: 0 };
    }
    if (destination.x !== undefined) {
      gameObjects.sprite.x = destination.x;
      this._lastLocation.x = destination.x;
    }
    if (destination.y !== undefined) {
      gameObjects.sprite.y = destination.y;
      this._lastLocation.y = destination.y;
    }
    if (destination.moving !== undefined) {
      this._lastLocation.moving = destination.moving;
    }
    if (destination.rotation !== undefined) {
      this._lastLocation.rotation = destination.rotation;
    }
    this.coveyTownController.emitMovement(this._lastLocation);
  }

  update() {
    if (this._paused) {
      return;
    }
    const gameObjects = this.coveyTownController.ourPlayer.gameObjects;
    if (gameObjects && this._cursors) {
      const prevVelocity = gameObjects.sprite.body.velocity.clone();
      const body = gameObjects.sprite.body as Phaser.Physics.Arcade.Body;

      // Stop any previous movement from the last frame
      body.setVelocity(0);

      const primaryDirection = this.getNewMovementDirection();
      const isMoving = primaryDirection !== undefined;

      switch (primaryDirection) {
        case 'left':
          body.setVelocityX(-MOVEMENT_SPEED);
          gameObjects.sprite.anims.play('misa-left-walk', true);

          // Play the left walking animation
          if (gameObjects.petSprite) {
            gameObjects.petSprite.anims.play('cat-walk-left', true);
          }
          break;
        case 'right':
          body.setVelocityX(MOVEMENT_SPEED);
          gameObjects.sprite.anims.play('misa-right-walk', true);

          // Play the right walking animation
          if (gameObjects.petSprite) {
            gameObjects.petSprite.anims.play('cat-walk-right', true);
          }
          break;
        case 'front':
          body.setVelocityY(MOVEMENT_SPEED);
          gameObjects.sprite.anims.play('misa-front-walk', true);

          // Play the front walking animation
          if (gameObjects.petSprite) {
            gameObjects.petSprite.anims.play('cat-walk-front', true);
          }
          break;
        case 'back':
          body.setVelocityY(-MOVEMENT_SPEED);
          gameObjects.sprite.anims.play('misa-back-walk', true);

          // Play the back walking animation
          if (gameObjects.petSprite) {
            gameObjects.petSprite.anims.play('cat-walk-back', true);
          }
          break;
        default:
          // Not moving
          gameObjects.sprite.anims.stop();
          // If we were moving, pick and idle frame to use
          if (prevVelocity.x < 0) {
            gameObjects.sprite.setTexture('atlas', 'misa-left');
          } else if (prevVelocity.x > 0) {
            gameObjects.sprite.setTexture('atlas', 'misa-right');
          } else if (prevVelocity.y < 0) {
            gameObjects.sprite.setTexture('atlas', 'misa-back');
          } else if (prevVelocity.y > 0) gameObjects.sprite.setTexture('atlas', 'misa-front');

          // Start pet idle animation
          if (gameObjects.petSprite) {
              gameObjects.petSprite.anims.play('cat-idle', true);
          }

          break;
      }

      // Normalize and scale the velocity so that player can't move faster along a diagonal
      gameObjects.sprite.body.velocity.normalize().scale(MOVEMENT_SPEED);

      if (gameObjects.petSprite) {
        // Pet Position: Offset set to place the sprite lower-left of player
        gameObjects.petSprite.setX(gameObjects.sprite.getBounds().centerX - 25);
        gameObjects.petSprite.setY(gameObjects.sprite.getBounds().centerY + 15);
        gameObjects.petSprite.setVisible(gameObjects.sprite.visible);

      }

      // const isMoving = primaryDirection !== undefined; // Re-use the existing `isMoving` variable
      gameObjects.label.setX(body.x);
      gameObjects.label.setY(body.y - 20);
      const x = gameObjects.sprite.getBounds().centerX;
      const y = gameObjects.sprite.getBounds().centerY;
      //Move the sprite
      if (
        !this._lastLocation ||
        (isMoving && this._lastLocation.rotation !== primaryDirection) ||
        this._lastLocation.moving !== isMoving
      ) {
        if (!this._lastLocation) {
          this._lastLocation = {
            x,
            y,
            rotation: primaryDirection || 'front',
            moving: isMoving,
          };
        }
        this._lastLocation.x = x;
        this._lastLocation.y = y;
        this._lastLocation.rotation = primaryDirection || this._lastLocation.rotation || 'front';
        this._lastLocation.moving = isMoving;
        this._pendingOverlapExits.forEach((cb, interactable) => {
          if (
            !Phaser.Geom.Rectangle.Overlaps(
              interactable.getBounds(),
              gameObjects.sprite.getBounds(),
            )
          ) {
            this._pendingOverlapExits.delete(interactable);
            cb();
          }
        });
        this.coveyTownController.emitMovement(this._lastLocation);
      }

      //Update the location for the labels of all of the other players
      for (const player of this._players) {
        if (player.gameObjects?.label && player.gameObjects?.sprite.body) {
          player.gameObjects.label.setX(player.gameObjects.sprite.body.x);
          player.gameObjects.label.setY(player.gameObjects.sprite.body.y - 20);

          if (player.gameObjects.petSprite) {
            // Other Player Pet Position Update
            player.gameObjects.petSprite.setX(player.gameObjects.sprite.getBounds().centerX - 25);
            player.gameObjects.petSprite.setY(player.gameObjects.sprite.getBounds().centerY + 15);

            // Control animation based on player movement state
            if (!player.location.moving) {
               player.gameObjects.petSprite.anims.play('cat-idle', true);
            } else {
               // Player is moving: Play the corresponding directional walk animation.
               const petAnimKey = `cat-walk-${player.location.rotation}`;
               player.gameObjects.petSprite.anims.play(petAnimKey, true);
            }
          }
        }
      }

      if (this._isEmoteMenuOpen && this._emoteMenuContainer) {
        const ourPlayer = this.coveyTownController.ourPlayer;
        const sprite = ourPlayer.gameObjects?.sprite;
        const body = sprite?.body as Phaser.Physics.Arcade.Body | undefined;

        if (body) {
          this._emoteMenuContainer.x = body.x + this._emoteMenuOffsetX;
          this._emoteMenuContainer.y = body.y + this._emoteMenuOffsetY;
        }
      }

      for (const emote of this._activeEmotes) {
        const playerSprite = emote.player.gameObjects?.sprite;
        const body = playerSprite?.body as Phaser.Physics.Arcade.Body | undefined;
        if (!playerSprite || !body || !emote.sprite.active) {
          continue;
        }

        const centerX = body.x + body.width / 2;
        const centerY = body.y + body.height / 2;

        emote.sprite.setPosition(
          centerX + emote.offsetX,
          centerY + emote.offsetY,
        );
      }
    }
  }

  private _map?: Phaser.Tilemaps.Tilemap;

  public get map(): Phaser.Tilemaps.Tilemap {
    const map = this._map;
    if (!map) {
      throw new Error('Cannot access map before it is initialized');
    }
    return map;
  }

  getInteractables(): Interactable[] {
    const typedObjects = this.map.filterObjects('Objects', obj => obj.type !== '');
    assert(typedObjects);
    const gameObjects = this.map.createFromObjects(
      'Objects',
      typedObjects.map(obj => ({
        id: obj.id,
        classType: interactableTypeForObjectType(obj.type),
      })),
    );

    return gameObjects as Interactable[];
  }

  create() {
    this._map = this.make.tilemap({ key: 'map' });

    /* Parameters are the name you gave the tileset in Tiled and then the key of the
      tileset image in Phaser's cache (i.e. the name you used in preload)
    */
    const tileset = [
      'Room_Builder_32x32',
      '22_Museum_32x32',
      '5_Classroom_and_library_32x32',
      '12_Kitchen_32x32',
      '1_Generic_32x32',
      '13_Conference_Hall_32x32',
      '14_Basement_32x32',
      '16_Grocery_store_32x32', // Typos fixed here
    ].map(v => {
      const ret = this.map.addTilesetImage(v);
      assert(ret);
      return ret;
    });

    this._collidingLayers = [];
    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const belowLayer = this.map.createLayer('Below Player', tileset, 0, 0);
    assert(belowLayer);
    belowLayer.setDepth(-10);
    const wallsLayer = this.map.createLayer('Walls', tileset, 0, 0);
    const onTheWallsLayer = this.map.createLayer('On The Walls', tileset, 0, 0);
    assert(wallsLayer);
    assert(onTheWallsLayer);
    wallsLayer.setCollisionByProperty({ collides: true });
    onTheWallsLayer.setCollisionByProperty({ collides: true });

    const worldLayer = this.map.createLayer('World', tileset, 0, 0);
    assert(worldLayer);
    worldLayer.setCollisionByProperty({ collides: true });
    const aboveLayer = this.map.createLayer('Above Player', tileset, 0, 0);
    assert(aboveLayer);
    aboveLayer.setCollisionByProperty({ collides: true });

    const veryAboveLayer = this.map.createLayer('Very Above Player', tileset, 0, 0);
    assert(veryAboveLayer);
    /* By default, everything gets depth sorted on the screen in the order we created things.
         Here, we want the "Above Player" layer to sit on top of the player, so we explicitly give
         it a depth. Higher depths will sit on top of lower depth objects.
         */
    worldLayer.setDepth(5);
    aboveLayer.setDepth(10);
    veryAboveLayer.setDepth(15);

    // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
    // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
    const spawnPoint = this.map.findObject(
      'Objects',
      obj => obj.name === 'Spawn Point',
    ) as unknown as Phaser.GameObjects.Components.Transform;

    const labels = this.map.filterObjects('Objects', obj => obj.name === 'label');
    labels?.forEach(label => {
      if (label.x && label.y) {
        this.add.text(label.x, label.y, label.text.text, {
          color: '#FFFFFF',
          backgroundColor: '#000000',
        });
      }
    });
    assert(this.input.keyboard);
    this._cursorKeys = this.input.keyboard.createCursorKeys();
    this._cursors.push(this._cursorKeys);
    this._cursors.push(
      this.input.keyboard.addKeys(
        {
          up: Phaser.Input.Keyboard.KeyCodes.W,
          down: Phaser.Input.Keyboard.KeyCodes.S,
          left: Phaser.Input.Keyboard.KeyCodes.A,
          right: Phaser.Input.Keyboard.KeyCodes.D,
        },
        false,
      ) as Phaser.Types.Input.Keyboard.CursorKeys,
    );
    this._cursors.push(
      this.input.keyboard.addKeys(
        {
          up: Phaser.Input.Keyboard.KeyCodes.H,
          down: Phaser.Input.Keyboard.KeyCodes.J,
          left: Phaser.Input.Keyboard.KeyCodes.K,
          right: Phaser.Input.Keyboard.KeyCodes.L,
        },
        false,
      ) as Phaser.Types.Input.Keyboard.CursorKeys,
    );
    // Capture presses of the "E" key to trigger an emote.
    // The server rebroadcasts the event to every client
    const keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    keyE.on('down', () => {
      this.coveyTownController.toggleEmoteMenu();
    });
    // Listen for emote broadcasts from the TownController and display the effect
    // above the correct player's sprite.
    this.coveyTownController.addListener('emote', data => {
      this.showEmote(data.playerID, data.emoteID);
    });
    this.coveyTownController.addListener('toggleEmoteMenu', () => {
      this.toggleEmoteMenu();
    });

    // Create a sprite with physics enabled via the physics system. The image used for the sprite
    // has a bit of whitespace, so I'm using setSize & setOffset to control the size of the
    // player's body.
    const sprite = this.physics.add
      .sprite(spawnPoint.x, spawnPoint.y, 'atlas', 'misa-front')
      .setSize(30, 40)
      .setOffset(0, 24)
      .setDepth(6);

    // Local player pet creation
    const petSprite = this.add
      .sprite(spawnPoint.x - 25, spawnPoint.y + 15, 'cat_atlas_key')
      .setScale(1.0)
      .setDepth(6)
      .play('cat-idle');


    const label = this.add
      .text(spawnPoint.x, spawnPoint.y - 20, '(You)', {
        font: '18px monospace',
        color: '#000000',
        // padding: {x: 20, y: 10},
        backgroundColor: '#ffffff',
      })
      .setDepth(6);
    this.coveyTownController.ourPlayer.gameObjects = {
      sprite,
      label,
      // Need to include petSprite here to avoid errors in update/updatePlayers
      petSprite,
      locationManagedByGameScene: true,
    };

    this._interactables = this.getInteractables();

    this.moveOurPlayerTo({ rotation: 'front', moving: false, x: spawnPoint.x, y: spawnPoint.y });

    // Watch the player and worldLayer for collisions, for the duration of the scene:
    this._collidingLayers.push(worldLayer);
    this._collidingLayers.push(wallsLayer);
    this._collidingLayers.push(aboveLayer);
    this._collidingLayers.push(onTheWallsLayer);
    this._collidingLayers.forEach(layer => this.physics.add.collider(sprite, layer));

    // Create the player's walking animations from the texture atlas. These are stored in the global
    // animation manager so any sprite can access them.
    const { anims } = this;

    // Pet idle animation
    anims.create({
      key: 'cat-idle',
      // Subtle front pose for standing (Frames 0-1)
      frames: anims.generateFrameNames('cat_atlas_key', { prefix: 'cat-front-', start: 0, end: 1 }),
      frameRate: 3,
      repeat: -1,
    });

    // Pet walking animations
    anims.create({
      key: 'cat-walk-front',
      frames: anims.generateFrameNames('cat_atlas_key', { prefix: 'cat-front-', start: 2, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'cat-walk-left',
      frames: anims.generateFrameNames('cat_atlas_key', { prefix: 'cat-left-', start: 2, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'cat-walk-right',
      frames: anims.generateFrameNames('cat_atlas_key', { prefix: 'cat-right-', start: 2, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'cat-walk-back',
      frames: anims.generateFrameNames('cat_atlas_key', { prefix: 'cat-back-', start: 2, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });


    anims.create({
      key: 'misa-left-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-left-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-right-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-right-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-front-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-front-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-back-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-back-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'mimimiAnim',
      frames: this.anims.generateFrameNumbers('mimimi-spritesheet', {
        start: 0,
        end: 72,
       }),
       frameRate: 30, 
       repeat: 0,
    });
    this.anims.create({
      key: 'laughAnim',
      frames: this.anims.generateFrameNumbers('laugh-spritesheet', {
        start: 0,
        end: 71,
       }),
       frameRate: 30, 
       repeat: 0,
    });
    

    const camera = this.cameras.main;
    camera.startFollow(this.coveyTownController.ourPlayer.gameObjects.sprite);
    camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    // Help text that has a "fixed" position on the screen
    this.add
      .text(16, 16, `Arrow keys to move`, {
        font: '18px monospace',
        color: '#000000',
        padding: {
          x: 20,
          y: 10,
        },
        backgroundColor: '#ffffff',
      })
      .setScrollFactor(0)
      .setDepth(30);

    this._ready = true;
    this.updatePlayers(this.coveyTownController.players);
    // Call any listeners that are waiting for the game to be initialized
    this._onGameReadyListeners.forEach(listener => listener());
    this._onGameReadyListeners = [];
    this.coveyTownController.addListener('playersChanged', players => this.updatePlayers(players));
  }

  private applyHoverEffect(
    icon: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite,
    sinkOffset = 6,
    scaleMultiplier = 1.08,
  ) {
    
    const baseY = icon.y;
    const baseScaleX = icon.scaleX;
    const baseScaleY = icon.scaleY;

    icon.on('pointerover', () => {
      this.tweens.add({
        targets: icon,
        y: baseY + sinkOffset, // "sink" down a bit
        scaleX: baseScaleX * scaleMultiplier,
        scaleY: baseScaleY * scaleMultiplier,
        duration: 120,
        ease: 'Quad.easeOut',
      });
    });

    icon.on('pointerout', () => {
      this.tweens.add({
        targets: icon,
        y: baseY, // go back to original Y
        scaleX: baseScaleX,
        scaleY: baseScaleY,
        duration: 120,
        ease: 'Quad.easeOut',
      });
    });
  }
  private toggleEmoteMenu() {
    if (this._isEmoteMenuOpen) {
      this.closeEmoteMenu();
      return;
    }

    const now = this.time.now; 
    if (now - this._lastEmoteMenuOpenTime < this._emoteMenuCooldownMs) {
      return;
    }

    this._lastEmoteMenuOpenTime = now;
    this.openEmoteMenu();
  }

  private _emoteList = [
    { id: 'mimimi-spritesheet', icon: 'mimimi-static' },
    { id: 'laugh-spritesheet', icon: 'laugh-static' },
  
  ];
  private openEmoteMenu() {
    this._isEmoteMenuOpen = true;

    const ourPlayer = this.coveyTownController.ourPlayer;
    const playerSprite = ourPlayer.gameObjects?.sprite;
    if (!playerSprite) {
      return;
    }

    const menuX = playerSprite.x + this._emoteMenuOffsetX;
    const menuY = playerSprite.y + this._emoteMenuOffsetY;

    const bg = this.add.image(0, 0, 'emoteMenu').setScale(0.8);

    const container = this.add.container(menuX, menuY, [bg]).setDepth(100);

    const spacingX = 110;
    const totalEmotes = this._emoteList.length;
    const startX = -((totalEmotes - 1) * spacingX) / 2;

    this._emoteList.forEach((emoteDef, index) => {
      const x = startX + index * spacingX;

      const icon = this.add
        .image(x, 0, emoteDef.icon)
        .setScale(0.4)
        .setInteractive({ useHandCursor: true });

      this.applyHoverEffect(icon);

      icon.on('pointerout', () => {
        this.tweens.add({
          targets: icon,
          y: icon.y - 6,
          scale: 0.4,
          duration: 120,
          ease: 'Quad.easeOut',
        });
      });

      icon.on('pointerup', () => {
        this.handleEmoteSelection(emoteDef.id);
      });

      container.add(icon);
    });

    bg.setInteractive();
    bg.on('pointerup', () => {
      this.closeEmoteMenu();
    });

    this._emoteMenuContainer = container;
  }

  private closeEmoteMenu() {
    this._isEmoteMenuOpen = false;
    if (this._emoteMenuContainer) {
      this._emoteMenuContainer.destroy(true);
      this._emoteMenuContainer = undefined;
    }
  }

  private handleEmoteSelection(emoteID: string) {
    this.coveyTownController.emitEmote(emoteID);
    this.closeEmoteMenu();
  }

  private showEmote(playerID: string, emoteID: string) {
    const player = this.coveyTownController.getPlayer(playerID);
    if (!player.gameObjects) return;

    const playerSprite = player.gameObjects.sprite;
    const body = playerSprite.body as Phaser.Physics.Arcade.Body | undefined;
    if (!body) return;

    const offsetX = 70;
    const offsetY = -50;

    const centerX = body.x + body.width / 2;
    const centerY = body.y + body.height / 2;

    const emoteSprite = this.add
      .sprite(centerX + offsetX, centerY + offsetY, emoteID, 0)
      .setDepth(50)
      .setScale(0.35);

    const animKey = this._emoteAnimations[emoteID] ?? 'mimimiAnim';
    emoteSprite.play(animKey);

    this._activeEmotes.push({ sprite: emoteSprite, player, offsetX, offsetY });

    emoteSprite.on('animationcomplete', () => {
      emoteSprite.destroy();
      
      this._activeEmotes = this._activeEmotes.filter(e => e.sprite !== emoteSprite);
    });
  }



  createPlayerSprites(player: PlayerController) {
    if (!player.gameObjects) {
      const sprite = this.physics.add
        .sprite(player.location.x, player.location.y, 'atlas', 'misa-front')
        .setSize(30, 40)
        .setOffset(0, 24);

      // Other player pet creation
      const petSprite = this.add
        .sprite(player.location.x - 25, player.location.y + 15, 'cat_atlas_key')
        .setScale(1.0)
        .setDepth(6)
        .play('cat-idle');

      const label = this.add.text(
        player.location.x,
        player.location.y - 20,
        player === this.coveyTownController.ourPlayer ? '(You)' : player.userName,
        {
          font: '18px monospace',
          color: '#000000',
          // padding: {x: 20, y: 10},
          backgroundColor: '#ffffff',
        },
      );
      player.gameObjects = {
        sprite,
        label,
        petSprite, // Include petSprite here
        locationManagedByGameScene: false,
      };
      this._collidingLayers.forEach(layer => this.physics.add.collider(sprite, layer));
    }
  }

  pause() {
    if (!this._paused) {
      this._paused = true;
      const gameObjects = this.coveyTownController.ourPlayer.gameObjects;
      if (gameObjects) {
        gameObjects.sprite.anims.stop();
        const body = gameObjects.sprite.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0);
      }
      assert(this.input.keyboard);
      this._previouslyCapturedKeys = this.input.keyboard.getCaptures();
      this.input.keyboard.clearCaptures();
    }
  }

  resume() {
    if (this._paused) {
      this._paused = false;
      if (this.input && this.input.keyboard) {
        this.input.keyboard.addCapture(this._previouslyCapturedKeys);
      }
      this._previouslyCapturedKeys = [];
    }
  }
}
