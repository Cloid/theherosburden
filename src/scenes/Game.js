let hit = 0

class Game extends Phaser.Scene {
    constructor() {
        super("Game");
    }

    preload() {
        this.load.image('tiles', 'assests/tiles/dungeon_tiles.png');
        this.load.image('ui-heart-empty', 'assests/ui/ui_heart_empty.png');
        this.load.image('ui-heart-full', 'assests/ui/ui_heart_full.png');
        this.load.image('knife', 'assests/weapon/knife.png');
        this.load.tilemapTiledJSON('dungeon', 'assests/tiles/dungeon1.json');
        this.load.atlas('faune', 'assests/character/faune.png', 'assests/character/faune.json');
        this.load.atlas('lizard', 'assests/enemies/lizard.png', 'assests/enemies/lizard.json');
        this.load.spritesheet('player', 'assests/character/player.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('slime', 'assests/enemies/slime.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('turret', 'assests/enemies/turretEnemy.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('healthUpgrade', 'assests/ui/heartAnimation.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        //this.load.image('faune', 'assests/character/faune.png')


    }

    create() {
        this.scene.run('game-ui')
        //Play music
        myMusic.play();
        myMusic.loop = true;
        //Overlay to be used for DOT
        this.overlay = new Phaser.GameObjects.Graphics(this);
        this.overlay.clear();
        this.overlay.setDepth(100);
        this.add.existing(this.overlay);

        knives = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image
        })


        //Basic keyboard commands, may need to change to the cursor key configuration
        keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        keyDOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        //keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);


        //Adding Tiled's layers to the world
        const map = this.make.tilemap({ key: 'dungeon' })
        const tileset = map.addTilesetImage('dungeon', 'tiles')
        map.createStaticLayer('Ground', tileset)
        wallSlayer = map.createStaticLayer('Walls', tileset)
        wallSlayer.setCollisionByProperty({ collides: true })


        const debugGraphics = this.add.graphics().setAlpha(0.7)
        wallSlayer.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255),
            faceColor: new Phaser.Display.Color(40, 39, 37, 255)
        })

        //Adding Player 'Faune' to in-game, adds physics, sets Hitbox, collider with wall, and camera follow respectively
        this.Faune = new Faune(this, 50, 100, 'player')
        this.physics.world.enable([this.Faune]);
        this.Faune.body.setSize(this.Faune.width * 0.5, this.Faune.height * 0.8)
        this.physics.add.collider(this.Faune, wallSlayer);
        this.cameras.main.startFollow(this.Faune, true)

        //Atlas Anims for Faune (Player)
        this.anims.create({
            key: 'faune-idle-down',
            frames: this.anims.generateFrameNames('player', { start: 0, end: 0 }),
            repeat: -1,
            frameRate: 15
        })

        this.anims.create({
            key: 'faune-idle-up',
            frames: this.anims.generateFrameNames('player', { start: 21, end: 21 }),
            repeat: -1,
            frameRate: 15
        })

        this.anims.create({
            key: 'faune-idle-side',
            frames: this.anims.generateFrameNames('player', { start: 37, end: 44 }),
            repeat: -1,
            frameRate: 15
        })

        this.anims.create({
            key: 'faune-run-down',
            frames: this.anims.generateFrameNames('player', { start: 13, end: 20 }),
            repeat: -1,
            frameRate: 15
        })

        this.anims.create({
            key: 'faune-run-up',
            frames: this.anims.generateFrameNames('player', { start: 21, end: 28 }),
            repeat: -1,
            frameRate: 15
        })

        this.anims.create({
            key: 'faune-run-side',
            frames: this.anims.generateFrameNames('player', { start: 37, end: 44 }),
            repeat: -1,
            frameRate: 15
        })

        this.anims.create({
            key: 'faune-faint',
            frames: this.anims.generateFrameNames('player', { start: 1, end: 12 }),
            frameRate: 15
        })
        //Starts the idle animation
        this.Faune.anims.play('faune-idle-down');

        //Declares Slime (Enemy)
        this.slime = new Slime(this, 150, 100, 'slime');
        this.physics.world.enable([this.slime]);
        this.physics.add.collider(this.slime, wallSlayer, this.slime.updateMovement, undefined, this);
        enemyCollide = this.physics.add.collider(this.slime, this.Faune, this.handleCollision, undefined, this);

        //Knive collision
        //this.physics.add.collider(knives,wallSlayer);
        this.physics.add.collider(knives, this.slime, this.handleKniveEnemyCollision, undefined, this);
        this.physics.add.collider(knives, wallSlayer, this.handleKniveWallCollision, undefined, this);

        //this.physics.add.collider(knives,wallSlayer);

        //slime anims
        this.anims.create({
            key: 'slime-idle',
            frames: this.anims.generateFrameNames('slime', { start: 0, end: 16 }),
            repeat: -1,
            frameRate: 10
        })
        /*
                //Declares Turret (Enemy)
                this.turret = new Turret(this, 150, 100, 'turret');
                this.physics.world.enable([this.turret]);
                this.physics.add.collider(this.turret, wallSlayer, this.turret.updateMovement, undefined, this);
                enemyCollide = this.physics.add.collider(this.turret, this.Faune, this.handleCollision, undefined, this);
                this.turret.body.setSize(this.turret.width * 0.5, this.turret.height * 0.9);
                //turret anims
                this.anims.create({
                    key: 'turret-idle',
                    frames: this.anims.generateFrameNames('turret', { start: 0, end: 3 }),
                    repeat: -1,
                    frameRate: 10
                })
                this.anims.create({
                    key: 'turret-turn',
                    frames: this.anims.generateFrameNames('turret', { start: 4, end: 6 }),
                    repeat: -1,
                    frameRate: 10
                })
        
                */
        /*
            this.anims.create({
                key: 'lizard-run',
                frames: this.anims.generateFrameNames('lizard', {start: 0,end: 3, prefix: 'lizard_m_run_anim_f', suffix: '.png'}),
                repeat: -1,
                frameRate: 10
            })
    */
        this.slime.anims.play('slime-idle');
        //this.turret.anims.play('turret-idle');

        // lizards = this.physics.add.group({
        //     classType: Lizard,
        // })

        // this.physics.world.enable([lizards]);
        // this.physics.add.collider(lizards, wallSlayer, lizards.updateMovement, undefined, this);
        // this.physics.add.collider(knives, lizards, this.handleKniveEnemyCollision, undefined, this);
        // this.physics.add.collider(lizards, this.Faune, this.handleCollision, undefined, this);
        // lizard2 = lizards.get(100,100,'lizard');
        // lizard2.setActive(true);
        // lizard2.setVisible(true);

        // var lizard3 = lizards.get(100,150,'lizard');
        // lizard3.setActive(true);
        // lizard3.setVisible(true);



        this.healthUpgrade = new Upgrade(this, 50, 50, 'healthUpgrade').setAlpha(1);
        this.anims.create({
            key: 'heart-idle',
            frames: this.anims.generateFrameNames('healthUpgrade', { start: 0, end: 10 }),
            repeat: -1,
            frameRate: 10
        })
        this.healthUpgrade.anims.play('heart-idle');
    }


    handleCollision(enemy) {
        //console.log('i ran')
        if (playerDead == false) {
            const dx = this.Faune.x - this.slime.x
            const dy = this.Faune.y - this.slime.y
            const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200)
            this.Faune.handleDamage(dir)

            this.Faune.setVelocity(dir.x, dir.y)
            this.hit = 1

            GameUI.handlePlayerHealthChanged;
            //this.slimeEffect();
            //this.possessedEffect();
            this.confusedEffect();
            sceneEvents.emit('player-health-changed')
        } else {
            this.physics.world.removeCollider(enemyCollide);
            return;
        }

    }

    throwKnive() {
        const parts = this.Faune.anims.currentAnim.key.split('-');
        const direction = parts[2];
        const vec = new Phaser.Math.Vector2(0, 0);
        switch (direction) {
            case 'up':
                vec.y = -1;
                break;
            case 'down':
                vec.y = 1;
                break;
            default:
            case 'side':
                if (this.Faune.flipX) {
                    vec.x = -1
                } else {
                    vec.x = 1;
                }
                break;

        }

        const angle = vec.angle();
        //Faune
        knife2 = knives.get(this.Faune.x, this.Faune.y, 'knife');
        knife2.setActive(true);
        knife2.setVisible(true);
        knife2.setRotation(angle);
        knife2.setVelocity(vec.x * 300, vec.y * 300)

    }

    handleKniveWallCollision() {
        knives.killAndHide(knife2);
    }

    handleKniveEnemyCollision() {
        knives.killAndHide(knife2);
        // lizards.killAndHide(lizard2);
        //lizards.killAndHide(this.lizard3);
        this.slime.destroy();

    }



    update() {

        //console.log(this.hit)

        //this.physics.world.collide(this.Lizard, this.Faune);


        if (Phaser.Input.Keyboard.JustDown(keyQ)) {
            this.throwKnive();
            return;
        }

        if (this.hit > 0) {
            this.Faune.setTint(0xff0000)
            ++this.hit
            if (this.hit > 10) {
                this.hit = 0
                this.Faune.setTint(0xffffff)
            }
            return
        }




        if (playerDead == false) {
            if (possessed == false) {
                if (confused == false) {
                    if (keyLEFT.isDown) {
                        this.Faune.anims.play('faune-run-side', true)
                        this.Faune.setVelocity(-playerSpeed, 0)

                        this.Faune.flipX = true;

                    } else if (keyRIGHT.isDown) {
                        this.Faune.anims.play('faune-run-side', true)
                        this.Faune.setVelocity(playerSpeed, 0)
                        this.Faune.flipX = false;


                    } else if (keyDOWN.isDown) {
                        this.Faune.anims.play('faune-run-down', true)
                        this.Faune.setVelocity(0, playerSpeed)
                    } else if (keyUP.isDown) {
                        this.Faune.anims.play('faune-run-up', true)
                        this.Faune.setVelocity(0, -playerSpeed)
                    } else {

                        const parts = this.Faune.anims.currentAnim.key.split('-')
                        parts[1] = 'idle'
                        this.Faune.play(parts.join('-'))
                        this.Faune.setVelocity(0, 0)
                    }
                }
                else if (confused == true) {
                    if (keyRIGHT.isDown) {
                        this.Faune.anims.play('faune-run-side', true)
                        this.Faune.setVelocity(-playerSpeed, 0)

                        this.Faune.flipX = true;

                    } else if (keyLEFT.isDown) {
                        this.Faune.anims.play('faune-run-side', true)
                        this.Faune.setVelocity(playerSpeed, 0)
                        this.Faune.flipX = false;


                    } else if (keyUP.isDown) {
                        this.Faune.anims.play('faune-run-down', true)
                        this.Faune.setVelocity(0, playerSpeed)
                    } else if (keyDOWN.isDown) {
                        this.Faune.anims.play('faune-run-up', true)
                        this.Faune.setVelocity(0, -playerSpeed)
                    } else {

                        const parts = this.Faune.anims.currentAnim.key.split('-')
                        parts[1] = 'idle'
                        this.Faune.play(parts.join('-'))
                        this.Faune.setVelocity(0, 0)
                    }
                }
            }
        } else {
            this.Faune.setVelocity(0, 0)
            myMusic.pause();
        }

        if (this.slime) {
            return;
        } else {
            this.slime.update()
        }


    }

    slimeEffect() {
        //If already Slimed, don't do anything
        if (slimed == false) {
            console.log('slimed');
            slimed = true;
            playerSpeed = 75;
            //create green rectangle to overlay screen
            this.overlay.fillStyle(0x00FF00, 0.2)
            this.overlay.fillRect(-1200, -1200, 2400, 2400);
            //create timer for when the overlay will clear
            var slimeTime = this.time.addEvent({
                delay: 2000,                // 2 seconds
                callback: this.clean,
                callbackScope: this,
                loop: false
            });
        }
    }

    possessedEffect() {
        //If already under control, dont do anything
        if (possessed == false) {
            console.log('taken');
            possessed = true;
            //create gray rectangle to overlay screen
            this.overlay.fillStyle(0x7575a3, 0.2)
            this.overlay.fillRect(-1200, -1200, 2400, 2400);
            this.possessedMove = this.time.addEvent({
                delay: 500,
                callback: () => {
                    possessedDirection = this.updatePossesed()
                },
                repeat: 8
            })

            var possessedTime = this.time.addEvent({
                delay: 4000,                // 2 seconds
                callback: this.clean,
                callbackScope: this,
                loop: false
            });
        }
    }

    confusedEffect() {
        //If already under control, dont do anything
        if (confused == false) {
            console.log('confused');
            confused = true;
            //create gray rectangle to overlay screen
            this.overlay.fillStyle(0xF8E522, 0.2)
            this.overlay.fillRect(-1200, -1200, 2400, 2400);

            var confusedTime = this.time.addEvent({
                delay: 10000,                // 2 seconds
                callback: this.clean,
                callbackScope: this,
                loop: false
            });
        }
    }
    //clean overlay
    clean() {
        this.overlay.clear();
        console.log('Cleared Effect');
        slimed = false;
        possessed = false;
        confused = false;
        playerSpeed = 100;
    }

    updatePossesed() {
        console.log('updated movement');
        possessedDirection = Phaser.Math.Between(0, 3);
        if (playerDead == false) {
            if (possessedDirection == 0) {
                this.Faune.anims.play('faune-run-side', true);
                this.Faune.setVelocity(-playerSpeed, 0);
                this.Faune.flipX = true;

            } else if (possessedDirection == 1) {
                this.Faune.anims.play('faune-run-side', true);
                this.Faune.setVelocity(playerSpeed, 0);
                this.Faune.flipX = false;

            } else if (possessedDirection == 2) {
                this.Faune.anims.play('faune-run-down', true);
                this.Faune.setVelocity(0, playerSpeed);

            } else if (possessedDirection == 3) {
                this.Faune.anims.play('faune-run-up', true);
                this.Faune.setVelocity(0, -playerSpeed);

            }
        }
        return possessedDirection;
    }



}