class Intro1 extends Phaser.Scene {
    constructor() {
        super("Intro1");
    }

    preload() {
        this.load.tilemapTiledJSON('dungeon', 'assests/tiles/intro1.json');
        //this.load.image('tiles', 'assests/tiles/dungeon_tiles.png');
        this.load.spritesheet('player', 'assests/character/player.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('slime', 'assests/enemies/slime.png', {
            frameWidth: 32,
            frameHeight: 32
        });



    }

    create() {
        this.clean;
        lastKnife=false;
        this.anims.create({
            key: 'slime-idle',
            frames: this.anims.generateFrameNames('slime', { start: 0, end: 16 }),
            repeat: -1,
            frameRate: 10
        })

        //Setting-up Overlay for alignment effects
        this.overlay = new Phaser.GameObjects.Graphics(this);
        this.overlay.clear();
        this.overlay.setDepth(100);
        this.add.existing(this.overlay);
        this.gotHit = false;

        knives = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            maxSize: 1
        })

        //Setting-Up Keys
        keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        keyDOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

        //Creating the Map using Tile-Set from Tiled
        const map = this.make.tilemap({ key: 'dungeon' });
        const tileset = map.addTilesetImage('dungeon_tiles', 'tiles');
        map.createStaticLayer('Floor', tileset)
        wallSlayer = map.createStaticLayer('Wall', tileset);
        this.door = map.createStaticLayer('Door', tileset);
        wallSlayer.setCollisionByProperty({ collides: true });
        this.door.setCollisionByProperty({ collides: true });


        // const debugGraphics = this.add.graphics().setAlpha(0.7);
        // wallSlayer.renderDebug(debugGraphics, {
        //     tileColor: null,
        //     collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255),
        //     faceColor: new Phaser.Display.Color(40, 39, 37, 255)
        // })

        //Create player class to be controlled
        this.Faune = new Faune(this, 95, 160, 'player');
        this.physics.world.enable([this.Faune]);
        this.Faune.body.setSize(this.Faune.width * 0.5, this.Faune.height * 0.8);
        this.cameras.main.startFollow(this.Faune, true)
        this.createPlayerAnims();
        this.Faune.anims.play('faune-idle-down');
        this.physics.add.collider(this.Faune, wallSlayer);
        this.physics.add.collider(this.Faune, this.door, this.NextLevel, undefined, this);


        //Create slimes group to be grabbed later with Slimes layer in Tiled
        this.slimes = this.physics.add.group({
            classType: Slime,
            createCallback: (go) => {
                var slimeGo = go;
                slimeGo.body.onCollide = true;
            }
        })
        //Create slimes fomr Slimes layer in Tiled
        const slimesLayer = map.getObjectLayer('Slime');
        slimesLayer.objects.forEach(slimeObj => {
            this.slimes.get(slimeObj.x, slimeObj.y, 'slime');
        })

        //Add Colliders with Slimes, Wall, Knives, and Player.
        this.physics.add.collider(this.slimes, wallSlayer);
        this.physics.add.collider(this.slimes, this.Faune, this.handleCollision, undefined, this);
        this.physics.add.collider(this.slimes, knives, this.handleKniveSlimeCollision, undefined, this);
        this.physics.add.collider(knives, wallSlayer, this.handleKniveWallCollision, undefined, this);





    }

    update() {

        if (Phaser.Input.Keyboard.JustDown(keyP) ) {
            this.NextLevel();
        }

        //Invunerabilty for the player after getting hit
        if (playerInv == true) {
            ++this.dmgcd;
            this.Faune.setTint(Math.random);
            if (this.dmgcd > 40) {
                this.Faune.setTint(0xffffff);
                this.dmgcd = 0;
                playerInv = false;
            }
        }

        //Color change for being hit
        if (this.hit > 0) {
            this.Faune.setTint(0xff0000)
            ++this.hit;
            if (this.hit > 10) {
                this.hit = 0
                this.Faune.setTint(0xffffff)
            }
            return
        }

        //Knife CD after pressing a button
        if (this.knifecd > 0) {
            ++this.knifecd;
            if (this.knifecd > 25) {
                this.knifecd = 0;
                knives.killAndHide(knife2);
                knife2.destroy();
                lastKnife = false;
            }
        }

        //Ability to throw knife
        if (Phaser.Input.Keyboard.JustDown(keyQ) && lastKnife == false) {
            lastKnife = true;
            this.throwKnive();
            this.knifecd = 1;
            return;
        }

        //Player Movement
        //Player Movement and Debuffs Logic
        if (playerDead == false) {
            if (possessed == false) {
                if (confused == false) {
                    if (keyLEFT.isDown) {
                        this.Faune.anims.play('faune-lef-side', true)
                        this.Faune.setVelocity(-playerSpeed, 0)

                        flipped = true;
                        walk.play();
                    } else if (keyRIGHT.isDown) {
                        this.Faune.anims.play('faune-run-side', true)
                        this.Faune.setVelocity(playerSpeed, 0)
                        flipped = false;
                        walk.play();
                    } else if (keyDOWN.isDown) {
                        this.Faune.anims.play('faune-run-down', true);
                        this.Faune.setVelocity(0, playerSpeed);
                        flipped = false;
                        walk.play();
                    } else if (keyUP.isDown) {
                        this.Faune.anims.play('faune-run-up', true);
                        this.Faune.setVelocity(0, -playerSpeed);
                        flipped = false;
                        walk.play();
                    } else {

                        const parts = this.Faune.anims.currentAnim.key.split('-');
                        parts[1] = 'idle';
                        if(flipped){
                            this.Faune.anims.play('faune-left-idle-side', true)
                        } else{
                            this.Faune.play(parts.join('-'))
                        }
                        this.Faune.setVelocity(0, 0)
                        walk.pause();
                    }
                }
                else if (confused == true) {
                    if (keyRIGHT.isDown) {
                        this.Faune.anims.play('faune-lef-side', true)
                        this.Faune.setVelocity(-playerSpeed, 0);
                        flipped = false;

                    } else if (keyLEFT.isDown) {
                        this.Faune.anims.play('faune-run-side', true)
                        this.Faune.setVelocity(playerSpeed, 0)
                        flipped = true;


                    } else if (keyUP.isDown) {
                        this.Faune.anims.play('faune-run-down', true)
                        this.Faune.setVelocity(0, playerSpeed)
                        flipped = false;
                    } else if (keyDOWN.isDown) {
                        this.Faune.anims.play('faune-run-up', true)
                        this.Faune.setVelocity(0, -playerSpeed)
                        flipped = false;
                    } else {
                        const parts = this.Faune.anims.currentAnim.key.split('-');
                        parts[1] = 'idle';
                        if(flipped){
                            this.Faune.anims.play('faune-left-idle-side', true)
                        } else{
                            this.Faune.play(parts.join('-'))
                        }
                        this.Faune.setVelocity(0, 0)
                        walk.pause();
                    }
                }
            }

        //Else the player is dead
        } else {
            this.Faune.setVelocity(0, 0);
            myMusic.pause();
            this.physics.world.colliders.destroy();
            this.physics.add.collider(this.slimes, wallSlayer);

            let textConfig = {
                fontFamily: 'Courier',
                fontSize: '20px',
                color: '#FFFFFF',
                stroke: '#cc99ff',
                strokeThickness: 1,
                align: 'center',
                padding: {
                    top: 5,
                    bottom: 5,
                },
                fixedWidth: 0
            }
            let centerX = this.cameras.main.midPoint.x;
            let centerY = this.cameras.main.midPoint.y;
            this.add.text(centerX - 100, centerY + 100, 'Press [ R ] to start', textConfig);
            if (Phaser.Input.Keyboard.JustDown(keyR)) {
                playerDead = false;
                _health = 3;
                _maxHealth = 3;
                this.clean();
                //sceneEvents.emit('reset-game');
                this.scene.start('Start');
            }
        }
    }

    createPlayerAnims() {
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
            frames: this.anims.generateFrameNames('player', { start: 37, end: 37 }),
            repeat: -1,
            frameRate: 15
        })

        this.anims.create({
            key: 'faune-left-idle-side',
            frames: this.anims.generateFrameNames('player', { start: 33, end: 33 }),
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
            key: 'faune-lef-side',
            frames: this.anims.generateFrameNames('player', { start: 30, end: 36 }),
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
    }

    throwKnive() {
        if (!knives) {
            return;
        }
        knife2 = knives.get(this.Faune.x, this.Faune.y, 'knife');
        if (!knife2) {
            return;
        }
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
                if (flipped) {
                    vec.x = -1
                } else {
                    vec.x = 1;
                }
                break;
        }
        const angle = vec.angle();
        //Faune
        knife2.setActive(true);
        knife2.setVisible(true);
        knife2.setRotation(angle);
        knife2.setVelocity(vec.x * 300, vec.y * 300)
        this.sound.play('throw');
    }

    //Slime Effect debuff function
    slimeEffect() {
        //If already Slimed, don't do anything
        if (slimed == false) {
            console.log('slimed');
            slimed = true;
            playerSpeed = 75;
            //create green rectangle to overlay screen
            this.overlay.fillStyle(0x00FF00, 0.2)
            this.overlay.fillRect(-1200, -1200, 2400, 2400);
            this.sound.play('bubble');
            //create timer for when the overlay will clear
            var slimeTime = this.time.addEvent({
                delay: 2000,                // 2 seconds
                callback: this.clean,
                callbackScope: this,
                loop: false
            });
        }
    }

    //Clean all Debuff-Effects
    clean() {
        this.overlay.clear();
        console.log('Cleared Effect');
        slimed = false;
        possessed = false;
        confused = false;
        playerSpeed = 100;
        god = false;
    }

    //Increase the Health
    increaseHealth() {
        if (this.healthUpgrade.alpha != 0.5) {
            this.healthUpgrade.setAlpha(0.5);
            console.log('health upgraded');
            _maxHealth += 1;
            _health = _maxHealth;
            sceneEvents.emit('player-health-gained');
            this.healthUpgrade.destroy();
            console.log('Max Health is now: ' + _health);
            this.sound.play('secret');
        }
    }

    //Replenish the health
    replenishHealth() {
        if (this.healthUpgrade2.alpha != 0.5) {
            this.healthUpgrade2.setAlpha(0.5);
            console.log('health replenished');
            _health = _maxHealth;
            sceneEvents.emit('player-health-replenished');
            this.healthUpgrade2.destroy();
            console.log('Replenished Health. Health is now: ' + _health);
            this.sound.play('pickup');
        }
    }

    //Handle the enemy collision
    handleCollision(enemy) {
        //console.log(enemy)
        //this.scene.start('Floor1');       
        if (playerDead == false && playerInv == false && god == false) {
            playerInv = true;
            this.dmgcd = 0;
            const dx = this.Faune.x - enemy.x
            const dy = this.Faune.y - enemy.y
            const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200)
            this.Faune.handleDamage(dir)

            this.Faune.setVelocity(dir.x, dir.y)
            this.hit = 1

            GameUI.handlePlayerHealthChanged;
            this.slimeEffect();
            //this.possessedEffect();
            //this.confusedEffect();
            sceneEvents.emit('player-health-changed')
            god = true;
            var notGod = this.time.addEvent({
                delay: 2000,                // 2 seconds
                callback: this.notGod,
                callbackScope: this,
            });
        } else {
            //this.physics.world.removeCollider(enemyCollide);
            return;
        }

    }

    //Handles Knife Wall Collision
    handleKniveWallCollision() {
        knives.killAndHide(knife2);
        lastKnife = false;
        knife2.destroy();
    }

    //Handles Slime Collision
    handleKniveSlimeCollision(enemy) {
        knives.killAndHide(knife2);
        lastKnife = false;
        // lizards.killAndHide(lizard2);
        //lizards.killAndHide(this.lizard3);
        enemy.destroy();
        this.sound.play('slimeNoise');
        knife2.destroy();

    }

    //Slimes Effect
    slimeEffect() {
        //If already Slimed, don't do anything
        if (slimed == false) {
            slimed = true;
            playerSpeed = 75;
            //create green rectangle to overlay screen
            this.overlay.fillStyle(0x00FF00, 0.2)
            this.overlay.fillRect(-1200, -1200, 2400, 2400);
            this.sound.play('bubble');
            //create timer for when the overlay will clear
            var slimeTime = this.time.addEvent({
                delay: 2000,                // 2 seconds
                callback: this.clean,
                callbackScope: this,
                loop: false
            });
        }
    }

    //Move onto NextLevel after colliding with door
    NextLevel() {
        //console.log('Next '); 
        if(god == false){
            this.clean();
            this.sound.play('door');
            this.scene.start('Lore1');
        }
    }
    
    //Damage Knockback
    notGod() {
        god = false;
    }
}

