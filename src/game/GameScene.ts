import Phaser from "phaser";
import { buildTextures } from "./pixels";
import { controls, gameBus } from "./state";

const TILE = 64;
const WORLD_W = 40 * TILE;
const WORLD_H = 760;
const GROUND_Y = 660;
const SPAWN = { x: 120, y: 520 };

type Seg = [startTile: number, endTile: number];

const GROUND: Seg[] = [
  [0, 7],
  [9, 15],
  [17, 25],
  [27, 40],
];

const PLATFORMS: Array<[x: number, y: number, tiles: number]> = [
  [4, 540, 3],
  [8.5, 430, 2],
  [12, 520, 3],
  [16, 400, 2],
  [19, 500, 4],
  [23.5, 380, 2],
  [27, 470, 3],
  [31, 360, 3],
  [35, 480, 3],
];

const COINS: Array<[number, number]> = [
  [3, 600],
  [4.2, 480],
  [5, 480],
  [5.8, 480],
  [8.8, 370],
  [9.6, 370],
  [12.4, 460],
  [13.2, 460],
  [16.4, 340],
  [19.5, 440],
  [20.5, 440],
  [21.5, 440],
  [24, 320],
  [27.5, 410],
  [28.5, 410],
  [31.5, 300],
  [32.5, 300],
  [35.5, 420],
  [36.5, 420],
  [38, 600],
];

const CRYSTALS: Array<[number, number]> = [
  [8.9, 330],
  [16.5, 300],
  [23.9, 280],
  [31.9, 250],
  [38.5, 590],
];

const MONSTERS: Array<[x: number, y: number, range: number]> = [
  [5.5, 600, 140],
  [11.5, 600, 120],
  [20, 440, 150],
  [24, 600, 180],
  [30, 600, 200],
  [35.8, 420, 110],
];

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private monsters!: Phaser.Physics.Arcade.Group;
  private solids!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private score = 0;
  private lives = 3;
  private crystalsFound = 0;
  private invulnerableUntil = 0;
  private finished = false;

  constructor() {
    super("game");
  }

  preload() {
    buildTextures(this);
  }

  create() {
    this.score = 0;
    this.lives = 3;
    this.crystalsFound = 0;
    this.finished = false;
    this.invulnerableUntil = 0;

    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);

    this.buildBackground();
    this.buildAnimations();

    this.solids = this.physics.add.staticGroup();

    for (const [start, end] of GROUND) {
      const width = (end - start) * TILE;
      if (width <= 0) continue;
      const tile = this.add
        .tileSprite(start * TILE, GROUND_Y, width, WORLD_H - GROUND_Y, "ground")
        .setOrigin(0, 0);
      const body = this.add.rectangle(
        start * TILE + width / 2,
        GROUND_Y + 16,
        width,
        32,
      );
      this.solids.add(body);
      tile.setDepth(3);
    }

    for (const [tx, y, tiles] of PLATFORMS) {
      const width = tiles * TILE;
      this.add
        .tileSprite(tx * TILE, y, width, 24, "platform")
        .setOrigin(0, 0)
        .setDepth(3);
      const body = this.add.rectangle(tx * TILE + width / 2, y + 8, width, 16);
      this.solids.add(body);
    }

    const coins = this.physics.add.staticGroup();
    for (const [tx, y] of COINS) {
      const coin = coins.create(tx * TILE, y, "coin-a") as Phaser.Physics.Arcade.Sprite;
      coin.setDepth(4);
      coin.anims.play("coin-spin");
      this.tweens.add({
        targets: coin,
        y: y - 8,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    const crystals = this.physics.add.staticGroup();
    for (const [tx, y] of CRYSTALS) {
      const gem = crystals.create(tx * TILE, y, "crystal") as Phaser.Physics.Arcade.Sprite;
      gem.setDepth(4);
      this.tweens.add({
        targets: gem,
        y: y - 14,
        duration: 1300,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      this.tweens.add({
        targets: gem,
        scale: 1.12,
        duration: 700,
        yoyo: true,
        repeat: -1,
      });
    }

    this.monsters = this.physics.add.group({ allowGravity: false, immovable: true });
    for (const [tx, y, range] of MONSTERS) {
      const monster = this.monsters.create(
        tx * TILE,
        y,
        "monster-a",
      ) as Phaser.Physics.Arcade.Sprite;
      monster.setDepth(4);
      monster.anims.play("monster-float");
      monster.setData("dir", 1);
      this.tweens.add({
        targets: monster,
        x: tx * TILE + range,
        duration: 1600 + range * 4,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
        onYoyo: () => monster.setFlipX(true),
        onRepeat: () => monster.setFlipX(false),
      });
    }

    this.player = this.physics.add.sprite(SPAWN.x, SPAWN.y, "parth-idle");
    this.player.setDepth(5);
    this.player.setCollideWorldBounds(false);
    this.player.body?.setSize(28, 44);
    this.player.setOffset(7, 4);

    this.physics.add.collider(this.player, this.solids);
    this.physics.add.overlap(this.player, coins, (_p, obj) => {
      const coin = obj as Phaser.Physics.Arcade.Sprite;
      coin.disableBody(true, true);
      this.score += 10;
      this.emitState();
      this.pop(coin.x, coin.y, 0xffc94a);
    });
    this.physics.add.overlap(this.player, crystals, (_p, obj) => {
      const gem = obj as Phaser.Physics.Arcade.Sprite;
      gem.disableBody(true, true);
      this.score += 50;
      this.crystalsFound += 1;
      this.emitState();
      this.pop(gem.x, gem.y, 0x49c9f5);
      if (this.crystalsFound >= CRYSTALS.length) this.finish("victory");
    });
    this.physics.add.overlap(this.player, this.monsters, () => this.hurt());

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.35);
    this.cameras.main.setRoundPixels(true);
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.emitState();
  }

  private buildBackground() {
    const g = this.add.graphics().setScrollFactor(0).setDepth(0);
    g.fillGradientStyle(0x151129, 0x151129, 0x2a1f45, 0x3a2a55, 1);
    g.fillRect(0, 0, 1200, WORLD_H);

    const moon = this.add.circle(820, 170, 54, 0xfdf1c7, 0.92).setScrollFactor(0).setDepth(1);
    this.tweens.add({ targets: moon, alpha: 0.7, duration: 2600, yoyo: true, repeat: -1 });

    for (let i = 0; i < 70; i++) {
      const star = this.add
        .rectangle(
          Phaser.Math.Between(0, 1200),
          Phaser.Math.Between(0, 420),
          2,
          2,
          0xffffff,
          Phaser.Math.FloatBetween(0.3, 1),
        )
        .setScrollFactor(0)
        .setDepth(1);
      this.tweens.add({
        targets: star,
        alpha: 0.15,
        duration: Phaser.Math.Between(900, 2600),
        yoyo: true,
        repeat: -1,
      });
    }

    const hills = this.add.graphics().setScrollFactor(0.25).setDepth(2);
    hills.fillStyle(0x241c3d, 1);
    for (let i = 0; i < 10; i++) {
      hills.fillTriangle(i * 340 - 100, GROUND_Y + 40, i * 340 + 90, 320, i * 340 + 280, GROUND_Y + 40);
    }
    const hills2 = this.add.graphics().setScrollFactor(0.5).setDepth(2);
    hills2.fillStyle(0x2e2450, 1);
    for (let i = 0; i < 12; i++) {
      hills2.fillTriangle(i * 260 - 60, GROUND_Y + 60, i * 260 + 80, 430, i * 260 + 220, GROUND_Y + 60);
    }
  }

  private buildAnimations() {
    if (!this.anims.exists("parth-run")) {
      this.anims.create({
        key: "parth-run",
        frames: [{ key: "parth-run-a" }, { key: "parth-idle" }, { key: "parth-run-b" }],
        frameRate: 10,
        repeat: -1,
      });
      this.anims.create({
        key: "coin-spin",
        frames: [{ key: "coin-a" }, { key: "coin-b" }],
        frameRate: 6,
        repeat: -1,
      });
      this.anims.create({
        key: "monster-float",
        frames: [{ key: "monster-a" }, { key: "monster-b" }],
        frameRate: 4,
        repeat: -1,
      });
    }
  }

  private pop(x: number, y: number, color: number) {
    for (let i = 0; i < 8; i++) {
      const bit = this.add.rectangle(x, y, 5, 5, color).setDepth(6);
      this.tweens.add({
        targets: bit,
        x: x + Phaser.Math.Between(-46, 46),
        y: y + Phaser.Math.Between(-52, 10),
        alpha: 0,
        duration: 480,
        onComplete: () => bit.destroy(),
      });
    }
  }

  private hurt() {
    if (this.finished || this.time.now < this.invulnerableUntil) return;
    this.invulnerableUntil = this.time.now + 1400;
    this.lives -= 1;
    this.emitState();
    this.cameras.main.shake(180, 0.01);
    this.pop(this.player.x, this.player.y, 0xef5f78);
    if (this.lives <= 0) {
      this.finish("gameover");
      return;
    }
    this.player.setPosition(SPAWN.x, SPAWN.y);
    this.player.setVelocity(0, 0);
    this.tweens.add({
      targets: this.player,
      alpha: 0.25,
      duration: 160,
      yoyo: true,
      repeat: 4,
      onComplete: () => this.player.setAlpha(1),
    });
  }

  private finish(status: "gameover" | "victory") {
    this.finished = true;
    this.emitState(status);
    this.time.delayedCall(60, () => this.scene.pause());
  }

  private emitState(status?: "gameover" | "victory") {
    gameBus.emit("state", {
      score: this.score,
      lives: Math.max(0, this.lives),
      crystals: this.crystalsFound,
      totalCrystals: CRYSTALS.length,
      status,
    });
  }

  override update() {
    if (this.finished) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down || body.touching.down;
    const left = controls.left || this.cursors.left.isDown;
    const right = controls.right || this.cursors.right.isDown;
    const jump = controls.jump || this.cursors.up.isDown || this.cursors.space.isDown;

    if (left) {
      this.player.setVelocityX(-230);
      this.player.setFlipX(true);
    } else if (right) {
      this.player.setVelocityX(230);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    if (jump && onGround) {
      this.player.setVelocityY(-620);
    }

    if (!onGround) {
      this.player.setTexture("parth-jump");
      this.player.anims.stop();
    } else if (left || right) {
      if (this.player.anims.currentAnim?.key !== "parth-run") {
        this.player.anims.play("parth-run", true);
      }
    } else {
      this.player.anims.stop();
      this.player.setTexture("parth-idle");
    }

    if (this.player.x < 8) this.player.setX(8);
    if (this.player.x > WORLD_W - 8) this.player.setX(WORLD_W - 8);
    if (this.player.y > WORLD_H + 60) this.hurt();
  }
}

export const GAME_SIZE = { width: 960, height: WORLD_H };
