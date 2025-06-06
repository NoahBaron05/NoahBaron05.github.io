class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init(data){
        this.spawnName = data.spawnName;
        this.coinCounter = data.coinCount;
        this.levelTime = data.timeCount;
    }

    values(){
        this.ACCELERATION = 500;
        this.DRAG = 1500;
        this.physics.world.gravity.y = 2000;
        this.JUMP_VELOCITY = 1100;
        this.RUN_VELOCITY = 400;
        this.FALL_ACCELERATION = 200;
        this.MAX_FALL_VELOCITY = 1800;
        this.FALL_MULTIPLIER = 2;
        this.hasJumped = false;

        this.isGrappling = false;
        this.grappleSpeed = 1200;
        this.grappleTarget = new Phaser.Math.Vector2();
        this.grappleLanded = false;
        this.MAX_GRAPPLE_DISTANCE = 750;

        this.runSounds = ['run1', 'run2', 'run3', 'run4'];
        this.runCounter = 0;

        this.lastRunSoundTime = 0;
        this.runSoundCooldown = 250;

        this.PARTICLE_VELOCITY = 50;
        this.wasInAir = false;

        this.facingLeft = false;

        this.dead = false;

        this.input.enabled = true;

        this.groundEnemySpeed = 200;
        this.groundEnemySpeedFast = 300;

        this.airEnemySpeed = 150;
        this.airEnemySpeedFast = 300;
        this.chaseDistance = 800;
        this.closeDistance = 400;
    }

    create() {
        this.values();
        
        // Map creation ------------------------------------------------------------------------------------------------------------------------------
        this.map = this.add.tilemap("platformerLevel", 18, 18, 500, 500);
        this.backGround = this.add.tilemap("platformerLevelBackground", 24, 24, 500, 500);

        this.tileset = this.map.addTilesetImage("Level 1", "tilemap_tiles");
        this.tilesetExtras = this.map.addTilesetImage("Level 1 Extras", "tilemap_tiles_extra");
        this.tilesetBackground = this.backGround.addTilesetImage("BackgroundTiles", "tilemap_tiles_background")
        this.backLayer = this.backGround.createLayer("Background", [this.tilesetBackground], 0, -1900);
        this.backLayer.setScale(2.0);
        this.groundLayer = this.map.createLayer("Tile Layer 1", [this.tileset, this.tilesetExtras], 0, 0);
        this.groundLayer.setScale(2.0).setDepth(4);
        this.platformLayer = this.map.createLayer("Platforms", [this.tileset, this.tilesetExtras], 576, 1152);
        this.platformLayer.setScale(2.0).setDepth(5);
        this.acidLayer = this.map.createLayer("Acid", [this.tileset, this.tilesetExtras], 1152, 4032);
        this.acidLayer.setScale(2.0).setDepth(6);
        this.grappleLayer = this.map.createLayer("GrappleCollider", [this.tileset, this.tilesetExtras], 576, 1152);
        this.grappleLayer.setScale(2.0);        
        this.edgeLayer = this.map.createLayer("EdgeTile", [this.tileset, this.tilesetExtras], 576, 1152);
        this.edgeLayer.setScale(2.0);
        this.edgeLayer.setVisible(false);

        this.groundLayer.setCollisionByProperty({ collides: true });

        this.platformLayer.setCollisionByProperty({ oneWay: true });
        this.grappleLayer.setCollisionByProperty({ oneWay: true });
        this.acidLayer.setCollisionByProperty({ death : true });
        this.edgeLayer.setCollisionByProperty({ collides : true , edge : true});

        // Enable collisions only from the top
        this.platformLayer.forEachTile(tile => {
            if (tile && tile.properties.oneWay) {
                tile.setCollision(false, false, true, false);
            }
        });

        //Player creation ----------------------------------------------------------------------------------------------------------------------------
        const spawnPoint = this.map.findObject("Objects", obj => obj.name === this.spawnName);
        const spawnX = (spawnPoint.x) * 2;
        const spawnY = (spawnPoint.y) * 2;
        
        my.sprite.player = this.physics.add.sprite(spawnX, spawnY, "platformer_characters", "tile_0002.png").setScale(SCALE).setDepth(12);
        my.sprite.player.setDepth(15);
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        this.physics.add.collider(my.sprite.player, this.platformLayer);
        this.physics.add.collider(my.sprite.player, this.acidLayer, () => {
            this.playerDied();
        });
        
        //Controls/camera ----------------------------------------------------------------------------------------------------------------------------
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels * 2, this.map.heightInPixels * 2);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); 
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(1);

        //Enemy Creation ------------------------------------------------------------------------------------------------------------------------------
        
        this.enemyGroup1 = this.physics.add.group();
        this.physics.add.collider(this.enemyGroup1, this.groundLayer);
        this.physics.add.collider(this.enemyGroup1, this.platformLayer);
        this.physics.add.collider(this.enemyGroup1, this.edgeLayer);

        this.physics.add.collider(my.sprite.player, this.enemyGroup1, (player, enemy) => {
            this.playerDied();
        });

        this.enemyGroup2 = this.physics.add.group({allowGravity : false});
        this.physics.add.collider(this.enemyGroup2, this.groundLayer);
        this.physics.add.collider(this.enemyGroup2, this.platformLayer);

        this.physics.add.collider(my.sprite.player, this.enemyGroup2, (player, enemy) => {
            this.playerDied();
        });

        const enemyObjects = this.map.getObjectLayer("Enemies").objects;

        enemyObjects.forEach((obj) => {
            const x = (obj.x) * 2;
            const y = (obj.y) * 2;
            const enemyType = obj.name;

            if (enemyType == 'ground'){
                let enemy = this.physics.add.sprite(x, y, 'enemyGround').setScale(2);
                this.enemyGroup1.add(enemy);
            } else if (enemyType == 'flying'){
                let enemy = this.physics.add.sprite(x, y, 'enemyGround').setScale(2);
                enemy.anims.play('enemyFly');
                this.enemyGroup2.add(enemy);
                enemy.body.allowGravity = false;
            }
        });


        //Grapple hook --------------------------------------------------------------------------------------------------------------------------------
        my.sprite.grapple = this.physics.add.sprite(my.sprite.player.body.x, my.sprite.player.body.y, "grapple").setScale(2);
        my.sprite.grapple.visible = false;
        my.sprite.grapple.body.setAllowGravity(false);
        my.sprite.grapple.body.setImmovable(true);
        this.physics.add.collider(my.sprite.grapple, this.groundLayer, () => {
            this.grappleLanded = true;
            this.sound.play('grappleImpact');
            my.sprite.grapple.body.setVelocity(0);
        });

        this.physics.add.collider(my.sprite.grapple, this.grappleLayer, () => {
            this.grappleLanded = true;
            this.sound.play('grappleImpact');
            my.sprite.grapple.body.setVelocity(0);
        });

        this.grappleLine = this.add.graphics();
        this.grappleLine.setDepth(10);

        //Prevents right click from popping up the menu in the browser
        game.canvas.oncontextmenu = function (e) { e.preventDefault(); }

        //Shooting Setup --------------------------------------------------------------------------------------------------------------------------------
        this.bulletGroup = this.physics.add.group();

        //Check pointer and instantiate objects for both grapple and bullets
        this.mouseDown = this.input.on('pointerdown', (pointer) => {
            const worldX = pointer.worldX;
            const worldY = pointer.worldY;

            if (pointer.button == 2){
                this.grappleTarget.set(worldX, worldY);
                my.sprite.grapple.setPosition(my.sprite.player.x, my.sprite.player.y);
                my.sprite.grapple.visible = true;
                my.sprite.grapple.body.setVelocity(0);
                this.physics.moveTo(my.sprite.grapple, worldX, worldY, 3000);

                this.isGrappling = true;
                this.grappleLanded = false;
            }
            if (pointer.button == 0){
                let bullet = this.physics.add.sprite(my.sprite.player.body.x + 25, my.sprite.player.body.y + 25, "bullet").setDepth(15).setScale(0.05);

                this.bulletGroup.add(bullet);
                bullet.body.setAllowGravity(false);

                const angle = Phaser.Math.Angle.Between(bullet.x, bullet.y, worldX, worldY);
                bullet.setRotation(angle);
                
                this.physics.moveTo(bullet, worldX, worldY, 3000);
                this.sound.play("shot");
            }
        });

        //Bullet collision handler --------------------------------------------------------------------------------------

        //Bullet collisions
        this.physics.add.collider(this.bulletGroup, this.groundLayer, (bullet, tile) => {
            bullet.destroy();
        });

        this.physics.add.collider(this.bulletGroup, this.enemyGroup1, (bullet, enemy) => {
            this.enemyDeath(enemy);
            bullet.destroy();
        });

        this.physics.add.collider(this.bulletGroup, this.enemyGroup2, (bullet, enemy) => {
            this.enemyDeath(enemy);
            bullet.destroy();
        });

        // Coin setup ----------------------------------------------------------------------------------------------------
        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });

        this.coins.forEach(coin => {
            coin.setScale(1.5);
            coin.x = (coin.x) * 2;
            coin.y = (coin.y) * 2;
            coin.setDepth(30);
        });

        const coinConfig = {
            frame: "star_04.png",
            scale : {start : 0, end : 0.5},
            lifespan : 100,
            alpha : {start : 1, end : 0},
            stopAfter : 3,
        }

        this.coinText = this.add.bitmapText(900, 50, 'pixelfont', 'Coins: ' + this.coinCounter, 60).setDepth(100).setScrollFactor(0);
        
        this.coinBg = this.add.graphics();
        this.coinBg.fillStyle(0x000000, 0.5); // White, 50% transparent
        this.coinBg.fillRoundedRect(-30, 0, 350, 56, 10);
        this.coinBg.setDepth(99).setScrollFactor(0);

        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.coinGroup = this.add.group(this.coins);
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy();
            let coinVFX = this.add.particles(obj2.x, obj2.y, "kenny-particles", coinConfig);
            this.sound.play('coinVFX');
            this.coinCounter++;
            this.coinText.setText('Coins: ' + this.coinCounter);
        });


        //Walking particle effects setup -----------------------------------------------------
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            random: false,
            scale: {start: 0.02, end: 0.05},
            maxAliveParticles: 32,
            lifespan: 100,
            gravityY: -400,
            alpha: {start: 1, end: 0.1},
        });

        my.vfx.walking.stop();

        //Grapple particle effects setup -----------------------------------------------------
        my.vfx.grapple = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            random: true,
            scale: {start: 0.03, end: 0.1},
            maxAliveParticles: 50,
            lifespan: 350,
            gravityY: -400,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.grapple.stop();

        //Landing particle effects setup -----------------------------------------------------
        my.vfx.landing = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            lifespan: { min: 200, max: 400 },
            speed: { min: 50, max: 150 },
            angle: { min: 240, max: 300 },
            scale: { start: 0.05, end: 0.01, random: true },
            alpha: { start: 1, end: 0 },
            gravityY: 300,
            quantity: 10,
            x : {steps : 10, start: -30, end : 30}
        });

        my.vfx.landing.stop();


        // Timer setup --------------------------------------------------------------------------------------------------------------------------

        this.timeText = this.add.bitmapText(20, 20, 'pixelfont', 'Time: 0:0' + this.levelTime, 60).setDepth(100).setScrollFactor(0);

        this.time.addEvent({
            delay : 1000,
            callback : () => {
                this.levelTime++;
                const minutes = Math.floor(this.levelTime / 60);
                const seconds = this.levelTime % 60;
                const paddedSeconds = seconds.toString().padStart(2, '0');
                this.timeText.setText(`Time: ${minutes}:${paddedSeconds}`);
            },
            loop : true
        });

        this.timeBg = this.add.graphics().fillStyle(0x000000, 0.5).fillRoundedRect(-10, 20, 350, 56, 10).setDepth(99).setScrollFactor(0);
    }

    update() {
        this.playerMovement();

        this.grappleLogic();

        this.endingCondition();

        this.updateCoinTextPosition();

        this.enemyMovementGround();

        this.flyingEnemyMovement();
    }

    //Movement -----------------------------------------------------------------------------------------------------------------------------------
    playerMovement(){
        if (this.dead) return;
        //Left running ---------------------------------------------------------------------------------------------------------------------------
        if(this.aKey.isDown) {
            if (my.sprite.player.body.velocity.x > -this.RUN_VELOCITY) {
                my.sprite.player.body.setVelocityX(-this.RUN_VELOCITY);
            }
            my.sprite.player.resetFlip();
            this.facingLeft = true;
            my.sprite.player.anims.play('walk', true);
            this.runAudio();

            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            //Particle effects
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            } else {
                my.vfx.walking.stop();
            }

        //Right running ---------------------------------------------------------------------------------------------------------------------------
        } else if(this.dKey.isDown) {
            if (my.sprite.player.body.velocity.x < this.RUN_VELOCITY) {
                my.sprite.player.body.setVelocityX(this.RUN_VELOCITY);
            }
            my.sprite.player.body.setVelocityX(this.RUN_VELOCITY);
            my.sprite.player.setFlip(true, false);
            this.facingLeft = false;
            my.sprite.player.anims.play('walk', true);
            this.runAudio();
            
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-40, my.sprite.player.displayHeight/2-5, false);

            //Particle effects
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            } else {
                my.vfx.walking.stop();
            }
        
        // Stopped ---------------------------------------------------------------------------------------------------------------------------------
        } else {
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setDrag(this.DRAG);
            
            my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();
        }

        //Jumping movement ------------------------------------------------------------------------------------------------------------------------
        if(!my.sprite.player.body.blocked.down) {
            this.wasInAir = true;
            my.sprite.player.anims.play('jump');
            if (my.sprite.player.body.velocity.y < 0){
                my.sprite.player.body.setAccelerationY(this.FALL_ACCELERATION);
            }
            else if (my.sprite.player.body.velocity.y > 0){
                my.sprite.player.body.setAccelerationY(this.FALL_ACCELERATION * this.FALL_MULTIPLIER);
                if (my.sprite.player.body.velocity.y > this.MAX_FALL_VELOCITY){
                    my.sprite.player.body.setVelocityY(this.MAX_FALL_VELOCITY);
                    my.sprite.player.body.setAccelerationY(0);
                }
            }
        } else { //Landing particle effects --------------------------------------------------------------------------------------------------------
            if (this.wasInAir){
                this.wasInAir = false; 
                my.vfx.landing.startFollow(my.sprite.player, 0, my.sprite.player.displayHeight / 2, false);
                my.vfx.landing.start();
                this.time.delayedCall(100, () => {my.vfx.landing.stop();});
            }
            my.sprite.player.body.setAccelerationY(0);
            this.hasJumped = false;
        }

        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            my.sprite.player.body.setVelocityY(-this.JUMP_VELOCITY);
            this.sound.play('jumpSFX');
            my.vfx.landing.emitParticleAt(my.sprite.player.x, my.sprite.player.y + my.sprite.player.displayHeight / 2);
            this.hasJumped = true;
        }

        if (!this.dead && my.sprite.player.body.velocity.y < 0 && this.spaceKey.isUp && this.hasJumped) {
            my.sprite.player.body.setVelocityY(my.sprite.player.body.velocity.y * 0.5);
        }

        // -----------------------------------------------------------------------------------------------------------------------------------------
    }

    runAudio(){
        const now = this.time.now;
        if (now - this.lastRunSoundTime < this.runSoundCooldown || !my.sprite.player.body.blocked.down) return;

        this.lastRunSoundTime = now;

        this.sound.play(this.runSounds[this.runCounter], {volume : 0.3});

        this.runCounter = (this.runCounter + 1) % this.runSounds.length;
    }

    grappleLogic(){
        this.grappleLine.clear();
        if (this.isGrappling){
            if (my.sprite.player.body.velocity.x > 0){
                my.vfx.grapple.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-40, my.sprite.player.displayHeight/2-5, false);

                if (this.facingLeft){
                    my.sprite.player.setFlip(true, false);
                    this.facingLeft = false;
                }
            } else {
                my.vfx.grapple.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

                if (!this.facingLeft){
                    my.sprite.player.resetFlip();
                    this.facingLeft = true;
                }
            }
            
            my.vfx.grapple.start();
            const grappleDistance = Phaser.Math.Distance.Between(my.sprite.player.x, my.sprite.player.y, my.sprite.grapple.x, my.sprite.grapple.y);
            if (grappleDistance > this.MAX_GRAPPLE_DISTANCE){
                this.cancelGrapple();
            }

            if (this.grappleLanded) {
                this.physics.moveToObject(my.sprite.player, my.sprite.grapple, this.grappleSpeed);

                const distance = Phaser.Math.Distance.Between(my.sprite.player.x, my.sprite.player.y, my.sprite.grapple.x, my.sprite.grapple.y);

                if (distance < 30) {
                    this.cancelGrapple();
                }
            } else {
                const vx = my.sprite.grapple.body.velocity.x;
                const vy = my.sprite.grapple.body.velocity.y;
                const angle = Math.atan2(vx, -vy);

                my.sprite.grapple.rotation = angle;
            }

            //Grapple visuals
            this.grappleLine.lineStyle(4, 0x96410f, 1);
            this.grappleLine.moveTo(my.sprite.player.x, my.sprite.player.y);
            this.grappleLine.lineTo(my.sprite.grapple.x, my.sprite.grapple.y);
            this.grappleLine.strokePath();

            this.hasJumped = false;
        }

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.grappleLanded){
            this.cancelGrapple();
            this.sound.play('jumpSFX');
        }
    }

    cancelGrapple(){
        this.grappleLine.clear();
        this.isGrappling = false;
        this.grappleLanded = false;
        my.sprite.grapple.body.setVelocity(0);
        my.sprite.grapple.visible = false;
        my.vfx.grapple.stop();
    }

    updateCoinTextPosition() {
        const cam = this.cameras.main;
        this.coinText.x = cam.width - this.coinText.width - 20;
        this.coinText.y = 20;
        this.coinBg.x = cam.width - this.coinText.width - 20;
        this.coinBg.y = 20;
    }
    
    playerDied(){
        if (this.dead) return;
        this.input.enabled = false;
        this.dead = true;
        this.sound.play('death');
        this.cameras.main.shake(250, 0.01);
        my.sprite.player.setVelocity(0);
        my.sprite.player.visible = false;
        this.cancelGrapple();
        this.time.delayedCall(1000, () => {
            this.scene.start("platformerScene");
        });
    }

    endingCondition(){
        const tileBelow = this.groundLayer.getTileAtWorldXY(my.sprite.player.x, my.sprite.player.y + my.sprite.player.height / 2, true);
        if (tileBelow && tileBelow.index == 244){
            const bestTime = localStorage.getItem('bestTime');
            const bestCoins = localStorage.getItem('bestCoins');

            // Always store current run for display
            localStorage.setItem('lastRunTime', this.levelTime);
            localStorage.setItem('lastRunCoins', this.coinCounter);

            if (this.spawnName == "spawn1"){
                this.scene.start("ending", {type : "complete"});
            }

            if (this.spawnName == "spawn2"){
                if ((bestTime === null || this.levelTime < parseInt(bestTime)) && (bestCoins === null || this.coinCounter > parseInt(bestCoins))) {
                    localStorage.setItem('bestTime', this.levelTime);
                    localStorage.setItem('bestCoins', this.coinCounter);
                }
                this.scene.start("ending", {type : "won"});
            }
            
        }
    }

    //Enemy Logic
    enemyMovementGround(){
        this.enemyGroup1.children.iterate((enemy) => {
            if (!enemy.body.blocked.down) return;

            if (!enemy.patrolDirection) {
                enemy.patrolDirection = 1;
            }

            const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, my.sprite.player.body.x, my.sprite.player.body.y);

            if (distance <= this.closeDistance){
                enemy.setVelocityX(this.groundEnemySpeedFast * enemy.patrolDirection);
            } else {
                enemy.setVelocityX(this.groundEnemySpeed * enemy.patrolDirection);
            }

            enemy.setFlipX(enemy.patrolDirection > 0);

            const hitWall = (enemy.patrolDirection === 1 && enemy.body.blocked.right) || (enemy.patrolDirection === -1 && enemy.body.blocked.left);

            if (hitWall) {
                enemy.patrolDirection *= -1;
            }

            enemy.anims.play('enemyWalk', true);
        });
    }

    enemyDeath(enemy){
        this.sound.play('enemyHurt');
        enemy.destroy();
    }

    flyingEnemyMovement(){
        this.enemyGroup2.children.iterate((enemy) => {
            const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, my.sprite.player.body.x, my.sprite.player.body.y);

            if (this.closeDistance < distance && distance <= this.chaseDistance){
                this.physics.moveToObject(enemy, my.sprite.player, this.airEnemySpeed);
                enemy.setFlipX(enemy.body.velocity.x > 0);
            } else if (distance <= this.closeDistance){
                this.physics.moveToObject(enemy, my.sprite.player, this.airEnemySpeedFast);
                enemy.setFlipX(enemy.body.velocity.x > 0);
            } else {
                enemy.setVelocity(0);
            }         
        });
    }
}