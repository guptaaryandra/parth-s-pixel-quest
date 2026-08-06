import Phaser from "phaser";
import { buildTextures } from "./pixels";
import { controls, gameBus } from "./state";
import { buildLayout, getLevel, TOTAL_LEVELS } from "./levels";
import { sfx } from "./audio";
import { addCoins, hasPower, loadShop, outfitColors, type ShopState } from "./shop";

const TILE = 64;
const WORLD_H = 720;
const GROUND_Y = 620;
const SPAWN = { x: 120, y: 520 };

export type SceneInit = { level?: number; score?: number; lives?: number };

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private monsters!: Phaser.Physics.Arcade.Group;
  private lurkers!: Phaser.Physics.Arcade.Group;
  private flyers!: Phaser.Physics.Arcade.Group;
  private coins!: Phaser.Physics.Arcade.StaticGroup;

  private solids!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private score = 0;
  private lives = 3;
  private maxLives = 3;
  private levelIndex = 0;
  private crystalsFound = 0;
  private totalCrystals = 5;
  private worldWidth = 40 * TILE;
  private invulnerableUntil = 0;
  private finished = false;
  private wasOnGround = true;

  // Shop-driven perks
  private shop: ShopState = { coins: 0, owned: ["default"], outfit: "default" };
  private runSpeed = 230;
  private maxJumps = 1;
  private jumpsLeft = 1;
  private jumpWasDown = false;
  private magnet = false;
  private shielded = false;
  private shieldRing: Phaser.GameObjects.Arc | undefined;
  private wallet = 0;
  /** Coins picked up during this run — shown in the HUD, resets on death. */
  private runCoins = 0;

  constructor() {
    super("game");
  }

  init(data: SceneInit) {
    this.levelIndex = data.level ?? 0;
    this.score = data.score ?? 0;
    this.shop = loadShop();
    this.wallet = this.shop.coins;
    this.runCoins = 0;
    this.maxLives = 3 + (hasPower(this.shop, "extra-heart") ? 1 : 0);
    this.lives = data.lives ?? this.maxLives;
    this.runSpeed = hasPower(this.shop, "swift-boots") ? 300 : 230;
    this.maxJumps = hasPower(this.shop, "double-jump") ? 2 : 1;
    this.magnet = hasPower(this.shop, "magnet");
    this.shielded = hasPower(this.shop, "shield");
  }

  preload() {
    buildTextures(this, outfitColors(this.shop.outfit));
  }

  create() {
    const cfg = getLevel(this.levelIndex);
    const layout = buildLayout(cfg, GROUND_Y);
    this.crystalsFound = 0;
    this.totalCrystals = layout.crystals.length;
    this.finished = false;
    this.invulnerableUntil = 0;
    this.jumpsLeft = this.maxJumps;
    this.worldWidth = cfg.tiles * TILE;


    this.physics.world.setBounds(0, 0, this.worldWidth, WORLD_H);
    this.cameras.main.setBounds(0, 0, this.worldWidth, WORLD_H);

    this.buildBackground(cfg.palette);
    this.buildAnimations();

    this.solids = this.physics.add.staticGroup();

    for (const [start, end] of layout.ground) {
      const width = (end - start) * TILE;
      if (width <= 0) continue;
      const tile = this.add
        .tileSprite(start * TILE, GROUND_Y, width, WORLD_H - GROUND_Y, "ground")
        .setOrigin(0, 0);
      const body = this.add.rectangle(start * TILE + width / 2, GROUND_Y + 16, width, 32);
      this.solids.add(body);
      tile.setDepth(3);
    }

    for (const [tx, y, tiles] of layout.platforms) {
      const width = tiles * TILE;
      this.add.tileSprite(tx * TILE, y, width, 24, "platform").setOrigin(0, 0).setDepth(3);
      const body = this.add.rectangle(tx * TILE + width / 2, y + 8, width, 16);
      this.solids.add(body);
    }

    const coins = this.physics.add.staticGroup();
    this.coins = coins;
    for (const [tx, y] of layout.coins) {
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
    for (const [tx, y] of layout.crystals) {
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
      this.tweens.add({ targets: gem, scale: 1.12, duration: 700, yoyo: true, repeat: -1 });
    }

    this.monsters = this.physics.add.group({ allowGravity: false, immovable: true });
    const speedUp = Math.max(0.35, 1 - this.levelIndex * 0.014);
    for (const [tx, y, range] of layout.monsters) {
      const monster = this.monsters.create(tx * TILE, y, "monster-a") as Phaser.Physics.Arcade.Sprite;
      monster.setDepth(4);
      monster.anims.play("monster-float");
      this.tweens.add({
        targets: monster,
        x: tx * TILE + range,
        duration: (1600 + range * 4) * speedUp,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
        onYoyo: () => monster.setFlipX(true),
        onRepeat: () => monster.setFlipX(false),
      });
    }

    // Surprise pop-up obstacles: only a sliver of head shows until Parth gets close.
    this.lurkers = this.physics.add.group({ allowGravity: false, immovable: true });
    const addLurker = (x: number, surfaceY: number, clip: boolean) => {
      const lurker = this.lurkers.create(x, surfaceY + 14, "lurker") as Phaser.Physics.Arcade.Sprite;
      lurker.setDepth(clip ? 4 : 2);
      lurker.setData("popped", false);
      lurker.setData("homeY", surfaceY + 14);
      lurker.setData("popY", surfaceY - 24);
      lurker.setData("clip", clip);
      lurker.body?.setSize(30, 24);
      if (clip) lurker.setCrop(0, 0, 42, 12);
    };
    for (const tx of layout.lurkers) addLurker(tx * TILE, GROUND_Y + 2, false);
    for (const [tx, y] of layout.platformLurkers) addLurker(tx * TILE, y, true);

    // Flying monsters sweeping the air.
    this.flyers = this.physics.add.group({ allowGravity: false, immovable: true });
    for (const [tx, y, range] of layout.flyers) {
      const flyer = this.flyers.create(tx * TILE, y, "flyer-a") as Phaser.Physics.Arcade.Sprite;
      flyer.setDepth(4);
      flyer.anims.play("flyer-flap");
      flyer.body?.setSize(34, 22);
      this.tweens.add({
        targets: flyer,
        x: tx * TILE + range,
        duration: (1500 + range * 5) * speedUp,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
        onYoyo: () => flyer.setFlipX(true),
        onRepeat: () => flyer.setFlipX(false),
      });
      this.tweens.add({
        targets: flyer,
        y: y + Phaser.Math.Between(28, 60),
        duration: Phaser.Math.Between(900, 1600),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }




    this.player = this.physics.add.sprite(SPAWN.x, SPAWN.y, "parth-idle");
    this.player.setDepth(5);
    this.player.setCollideWorldBounds(false);
    this.player.body?.setSize(28, 44);
    this.player.setOffset(7, 4);

    if (this.shielded) this.addShieldRing();

    this.physics.add.collider(this.player, this.solids);
    this.physics.add.overlap(this.player, coins, (_p, obj) => {
      const coin = obj as Phaser.Physics.Arcade.Sprite;
      coin.disableBody(true, true);
      this.score += 10;
      this.wallet = addCoins(1).coins;
      this.runCoins += 1;
      sfx.coin();
      this.emitState();
      this.pop(coin.x, coin.y, 0xffc94a);
    });

    this.physics.add.overlap(this.player, crystals, (_p, obj) => {
      const gem = obj as Phaser.Physics.Arcade.Sprite;
      gem.disableBody(true, true);
      this.score += 50;
      this.crystalsFound += 1;
      sfx.crystal();
      this.emitState();
      this.pop(gem.x, gem.y, 0x49c9f5);
      if (this.crystalsFound >= this.totalCrystals) {
        this.score += 100 * (this.levelIndex + 1);
        this.finish(this.levelIndex + 1 >= TOTAL_LEVELS ? "victory" : "levelclear");
      }
    });
    this.physics.add.overlap(this.player, this.monsters, () => this.hurt());
    this.physics.add.overlap(this.player, this.flyers, () => this.hurt());
    this.physics.add.overlap(this.player, this.lurkers, (_p, obj) => {
      if ((obj as Phaser.Physics.Arcade.Sprite).getData("popped")) this.hurt();
    });


    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.applyZoom();
    this.scale.on("resize", this.applyZoom, this);
    this.events.once("shutdown", () => this.scale.off("resize", this.applyZoom, this));
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.fadeIn(320, 0, 0, 0);
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.emitState();
  }

  /**
   * Fills the canvas without stretching: the canvas keeps the device aspect
   * ratio and we zoom just enough that the view never shows past the world.
   */
  private applyZoom() {
    const { width, height } = this.scale.gameSize;
    if (!width || !height) return;
    const zoom = Math.max(1.35, height / WORLD_H, width / 1600);
    this.cameras.main.setZoom(zoom);
  }

  private buildBackground(palette: ReturnType<typeof getLevel>["palette"]) {
    const g = this.add.graphics().setScrollFactor(0).setDepth(0);
    g.fillGradientStyle(palette.skyTop, palette.skyTop, palette.skyBottom, palette.skyBottom, 1);
    g.fillRect(0, 0, 1200, WORLD_H);

    const moon = this.add.circle(1060, 210, 54, palette.moon, 0.92).setScrollFactor(0).setDepth(1);
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
    hills.fillStyle(palette.hillFar, 1);
    for (let i = 0; i < 14; i++) {
      hills.fillTriangle(
        i * 340 - 100,
        GROUND_Y + 40,
        i * 340 + 90,
        320,
        i * 340 + 280,
        GROUND_Y + 40,
      );
    }
    const hills2 = this.add.graphics().setScrollFactor(0.5).setDepth(2);
    hills2.fillStyle(palette.hillNear, 1);
    for (let i = 0; i < 16; i++) {
      hills2.fillTriangle(
        i * 260 - 60,
        GROUND_Y + 60,
        i * 260 + 80,
        430,
        i * 260 + 220,
        GROUND_Y + 60,
      );
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
      this.anims.create({
        key: "flyer-flap",
        frames: [{ key: "flyer-a" }, { key: "flyer-b" }],
        frameRate: 8,
        repeat: -1,
      });
    }
  }

  /** Quick squash-and-stretch pop on Parth for jumps and landings. */
  private stretch(sx: number, sy: number) {
    this.tweens.killTweensOf(this.player);
    this.player.setScale(sx, sy);
    this.tweens.add({
      targets: this.player,
      scaleX: 1,
      scaleY: 1,
      duration: 160,
      ease: "Quad.easeOut",
    });
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

  /** Aura shield perk: a glowing ring that soaks the first hit of the level. */
  private addShieldRing() {
    this.shieldRing = this.add.circle(this.player.x, this.player.y, 32, 0x7de1ff, 0.18).setDepth(4);
    this.shieldRing.setStrokeStyle(2, 0x7de1ff, 0.8);
    this.tweens.add({
      targets: this.shieldRing,
      scale: 1.12,
      alpha: 0.5,
      duration: 900,
      yoyo: true,
      repeat: -1,
    });
  }

  /** Coin magnet perk: pulls nearby coins toward Parth. */
  private updateMagnet() {
    if (!this.magnet) return;
    for (const obj of this.coins.getChildren()) {
      const coin = obj as Phaser.Physics.Arcade.Sprite;
      if (!coin.active) continue;
      const d = Phaser.Math.Distance.Between(coin.x, coin.y, this.player.x, this.player.y);
      if (d > 170 || d < 4) continue;
      const t = 0.14;
      coin.setPosition(
        coin.x + (this.player.x - coin.x) * t,
        coin.y + (this.player.y - coin.y) * t,
      );
      coin.body?.reset(coin.x, coin.y);
    }
  }

  private hurt() {
    if (this.finished || this.time.now < this.invulnerableUntil) return;
    if (this.shielded) {
      this.shielded = false;
      this.invulnerableUntil = this.time.now + 1200;
      this.shieldRing?.destroy();
      this.shieldRing = undefined;
      sfx.hurt();
      this.pop(this.player.x, this.player.y, 0x7de1ff);
      this.emitState();
      return;
    }
    this.invulnerableUntil = this.time.now + 1400;
    this.lives -= 1;
    sfx.hurt();
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

  private finish(status: "levelclear" | "gameover" | "victory") {
    this.finished = true;
    if (status === "gameover") sfx.gameOver();
    else if (status === "victory") sfx.victory();
    else sfx.levelClear();
    this.emitState(status);
    this.time.delayedCall(60, () => this.scene.pause());
  }

  private emitState(status?: "levelclear" | "gameover" | "victory") {
    gameBus.emit("state", {
      score: this.score,
      lives: Math.max(0, this.lives),
      maxLives: this.maxLives,
      crystals: this.crystalsFound,
      totalCrystals: this.totalCrystals,
      level: this.levelIndex + 1,
      totalLevels: TOTAL_LEVELS,
      wallet: this.wallet,
      runCoins: this.runCoins,
      shielded: this.shielded,
      status,
    });
  }


  private updateLurkers() {
    for (const obj of this.lurkers.getChildren()) {
      const l = obj as Phaser.Physics.Arcade.Sprite;
      const clip = l.getData("clip") as boolean;
      const popY = l.getData("popY") as number;
      const dist = Math.abs(l.x - this.player.x);
      const dy = Math.abs(popY - this.player.y);
      const near = dist < 150 && (!clip || dy < 120);
      const far = dist > 320 || (clip && dy > 220);
      const popped = l.getData("popped") as boolean;
      if (!popped && near) {
        l.setData("popped", true);
        if (clip) l.setCrop();
        sfx.hurt();
        this.tweens.add({
          targets: l,
          y: popY,
          duration: 200,
          ease: "Back.easeOut",
        });
      } else if (popped && far) {
        l.setData("popped", false);
        this.tweens.add({
          targets: l,
          y: l.getData("homeY") as number,
          duration: 300,
          ease: "Sine.easeIn",
          onComplete: () => {
            if (clip) l.setCrop(0, 0, 42, 12);
          },
        });
      }
    }
  }

  override update() {
    if (this.finished) return;
    this.updateLurkers();

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down || body.touching.down;
    const left = controls.left || this.cursors.left.isDown;
    const right = controls.right || this.cursors.right.isDown;
    const jump = controls.jump || this.cursors.up.isDown || this.cursors.space.isDown;

    if (left) {
      this.player.setVelocityX(-this.runSpeed);
      this.player.setFlipX(true);
    } else if (right) {
      this.player.setVelocityX(this.runSpeed);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    if (onGround) this.jumpsLeft = this.maxJumps;
    const jumpPressed = jump && !this.jumpWasDown;
    this.jumpWasDown = jump;
    // Holding the jump button keeps hopping: on the ground a held button is
    // enough, while extra mid-air jumps still need a fresh press.
    const canJump = onGround ? jump : jumpPressed;
    if (canJump && this.jumpsLeft > 0) {
      this.jumpsLeft -= 1;
      this.player.setVelocityY(-680);
      this.stretch(0.82, 1.2);
      sfx.jump();
    }

    this.updateMagnet();
    this.shieldRing?.setPosition(this.player.x, this.player.y);

    if (onGround && !this.wasOnGround) {
      sfx.land();
      this.stretch(1.2, 0.8);
    }
    this.wasOnGround = onGround;


    if (!onGround) {
      this.player.setTexture("parth-jump");
      this.player.anims.stop();
      // Lean into the arc: nose up on the way up, down on the way down.
      this.player.setAngle(Phaser.Math.Clamp(body.velocity.y * 0.02, -8, 8) * (this.player.flipX ? -1 : 1));
    } else if (left || right) {
      if (this.player.anims.currentAnim?.key !== "parth-run") {
        this.player.anims.play("parth-run", true);
      }
      // Bouncy run: gentle body tilt plus a subtle stride bob.
      this.player.setAngle(Math.sin(this.time.now / 70) * 3);
      this.player.setScale(1, 1 + Math.sin(this.time.now / 70) * 0.04);
    } else {
      this.player.anims.stop();
      this.player.setTexture("parth-idle");
      this.player.setAngle(0);
      // Idle breathing.
      this.player.setScale(1, 1 + Math.sin(this.time.now / 320) * 0.03);
    }


    if (this.player.x < 8) this.player.setX(8);
    if (this.player.x > this.worldWidth - 8) this.player.setX(this.worldWidth - 8);
    if (this.player.y > WORLD_H + 60) this.hurt();
  }
}

export const GAME_SIZE = { width: 1280, height: WORLD_H };
