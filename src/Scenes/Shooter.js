class Shooter extends Phaser.Scene {
    constructor(){
        super("shooterMaker");
        this.my = {sprite: {}};
    }

    init_game(){
        this.my = {sprite: {}};

        this.playerX = 500;
        this.playerY = 930;
        this.playerSpeed = 15;

        this.aKey = null;
        this.dKey = null;
        this.spaceKey = null;

        this.enemyGroup = null;
        this.bulletGroup = null;
        this.enemyProjectileGroup = null;
        this.playerGroup = null;

        this.bulletCooldownMax = 30;
        this.bulletCooldown = 0;

        this.playerHealth = 3;
        this.playerHealthUI = [];

        this.isInvincible = false;
        
        this.score = 0;
        this.waveScore = 0;

        this.enemyCenter = 500;
        this.enemyDirection = 1;
        this.enemySpeed = 1.5;
        
        this.enemyBulletFrequency = 450;

        this.waveData = null;
        this.enemyCount = null;
        this.waveCount = 0;
        this.waveNames = ["Wave1", "Wave2", "Wave3", "Wave4", "Wave5"];

        this.timer = 0;
        this.timerLength = 290;
        this.timerSpeed = 10
    }

    preload() {
        //Asset loading
        this.load.setPath("./assets/");
        this.load.atlasXML("vehicles", "vehicles_sheet.png", "vehicles_sheet.xml");
        this.load.image("starfield", "blue_space_background.png");

        this.load.audio("playerLaser", "sci_fi_audio/laserSmall_000.ogg");
        this.load.audio("enemyExplosion", "sci_fi_audio/explosionCrunch_000.ogg");
        this.load.audio("enemyLaser", "sci_fi_audio/laserSmall_003.ogg");
        this.load.audio("playerExplosion", "sci_fi_audio/explosionCrunch_002.ogg");

        this.load.bitmapFont('pixelfont', 'minogram_6x10.png', 'minogram_6x10.xml');

        this.load.json('waveData', 'waveSetup.json');
        
    }

    create() {
        this.init_game();
        
        let my = this.my;
        
        //Sprite setup
        this.playerGroup = this.add.group();

        this.background = this.add.tileSprite(0, 0, this.game.config.width, this.game.config.height, "starfield").setOrigin(0);
        my.player = this.physics.add.sprite(this.playerX, this.playerY, "vehicles", "playerShip1_blue.png");
        my.player.setScale(0.6);
        this.playerGroup.add(my.player);

        //Projectile.enemy group setup
        this.bulletGroup = this.physics.add.group();
        this.enemyGroup = this.physics.add.group();
        this.enemyProjectileGroup = this.physics.add.group();

        //UI Elements
        this.add.rectangle(0, 0, 2000, 230, 0x000000);
        this.add.rectangle(0, 120, 2000, 10, 0x1faef0);
        this.add.rectangle(435, 57, 300, 75, 0x525252);

        this.waveBar = this.add.rectangle(291, 25, this.timerLength, 65, 0x22ab1d).setOrigin(0,0);

        this.health1 = this.add.sprite(50, 57, "vehicles", "playerLife1_blue.png");
        this.health1.setScale(2);
        this.playerHealthUI.push(this.health1);
        this.health2 = this.add.sprite(120, 57, "vehicles", "playerLife1_blue.png");
        this.health2.setScale(2);
        this.playerHealthUI.push(this.health2);
        this.health3 = this.add.sprite(190, 57, "vehicles", "playerLife1_blue.png");
        this.health3.setScale(2);
        this.playerHealthUI.push(this.health3);

        this.scoreText = this.add.bitmapText(650, 37, 'pixelfont', 'SCORE: ' + this.score, 50); 

        //Control setup
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.physics.add.overlap(this.bulletGroup, this.enemyGroup, this.bulletEnemyCollision, null, this);
        this.physics.add.overlap(this.playerGroup, this.enemyProjectileGroup, this.playerEnemyCollision, null, this);

        //Wave setup including json reading
        this.waveData = this.cache.json.get('waveData');
        this.loadWave();
    }

    update() {
        let my = this.my;

        this.timer--;

        //Starfield scrolling
        this.background.tilePositionY -= 3;

        this.playerController(my.player);

        //Shooting code
        if (this.spaceKey.isDown && this.bulletCooldown <= 0){
            let bullet = this.physics.add.sprite(my.player.x, my.player.y, "vehicles", "laserGreen02.png");
            bullet.setScale(0.6);
            this.bulletGroup.add(bullet);
            this.sound.play("playerLaser");
            this.bulletCooldown = this.bulletCooldownMax;
        }   

        this.bulletLogic(this.bulletGroup);

        this.bulletCooldown--;

        this.enemyBullets(this.enemyGroup, this.enemyProjectileGroup);

        this.enemyMotion(this.enemyGroup);

        if (this.timer <= 0) {
            this.waveTimer(this.enemyGroup);
            this.timer = 20;
        }
    }


    //Helper Functions --------------------------------------------------------------------------------------------------------------------------------

    //bullet enemy collision
    bulletEnemyCollision(bullet, enemy){
        bullet.destroy();
        enemy.destroy();
        this.sound.play("enemyExplosion");
        if (enemy.style == 'straight') this.score += 15;
        if (enemy.style == 'curved') this.score += 20;
        if (enemy.style == 'sine') this.score += 25;
        
        this.scoreText.setText('SCORE: ' + this.score);

        //Setup for next wave
        this.enemyCount--;
        if (this.enemyCount <= 0){
            this.loadWave();
        }
    }

    playerEnemyCollision(player, bullet){
        if (this.isInvincible) return;

        bullet.destroy();
        this.sound.play("playerExplosion");
        this.playerHealth--;
        this.playerHealthUI[this.playerHealth].destroy();
        
        this.isInvincible = true;
        this.tweens.add({
            targets: player,
            alpha: 0,
            duration: 100,
            ease: 'Linear',
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                player.alpha = 1;
                this.isInvincible = false;
            }
        });

        if (this.playerHealth <= 0){
            player.destroy();
            this.scene.start('gameover', {score: this.score, condition: 'lose'});
        }
        
    }

    //Movement for player
    playerController(player){
        if (this.aKey.isDown && player.x >= 80){
            player.x -= this.playerSpeed;
        }
        if (this.dKey.isDown && player.x <= 920){
            player.x += this.playerSpeed;
        }
    }

    bulletLogic(bullet){
        bullet.getChildren().forEach(bullet => {
            bullet.y -= 40;
            if (bullet.y < 130){
                bullet.destroy();
            }
        });
    }

    //Creates paths for enemy bullets and creates them
    enemyBullets(enemy, bulletGroup){
        enemy.getChildren().forEach(enemy => {
            if (Phaser.Math.Between(0, this.enemyBulletFrequency) < 2){
                let projectile = new EnemyProjectile(this, enemy.x, enemy.y + 20, 'vehicles', 'laserRed02.png', enemy.style);
                bulletGroup.add(projectile);
                this.sound.play("enemyLaser");
            }
        }); 
        
        bulletGroup.getChildren().forEach(p => p.update());
    }

    //Side to side motion for the enemy group
    enemyMotion(enemy){
        if (this.enemyCenter > 700) this.enemyDirection = -1;
        if (this.enemyCenter < 300) this.enemyDirection = 1;
        
        enemy.getChildren().forEach(enemy => {
            enemy.x += this.enemyDirection * this.enemySpeed;
        });
        
        this.enemyCenter += this.enemyDirection * this.enemySpeed;
    }

    //Reads from waveSetup.json to get enemy types and locations, and creates the enemies
    loadWave(){
        this.winCondition();
        
        for (let enemy of this.waveData[this.waveNames[this.waveCount]].Enemies){
            this.loadEnemy(enemy.type, enemy.x, enemy.y, enemy.style, this.enemyGroup);
        }
        
        this.enemyCount += this.waveData[this.waveNames[this.waveCount]].EnemyCount;
        this.enemyCenter = 500;

        this.waveCount++;

        //change score and fix timer
        this.waveScore += this.waveBar.width;
        this.waveBar.width = this.timerLength;
        this.scoreText.setText('SCORE: ' + this.score);
    }

    //Creates enemies based off of the preset in waveSetup.json
    loadEnemy(type, x, y, bullet, group){
        let enemy = this.physics.add.sprite(x, y, "vehicles", type);
        enemy.setScale(0.6);
        enemy.style = bullet;
        group.add(enemy);
    }

    waveTimer(enemy){
        if (this.waveCount >= this.waveNames.length) return;
        
        this.waveBar.width -= this.timerSpeed;
        
        if (this.waveBar.width <= 0){
            this.waveBar.width = this.timerLength;
            enemy.getChildren().forEach(enemy => {
                enemy.y += this.waveData[this.waveNames[this.waveCount]].Rows * 75;
            });
            
            this.loadWave()
        }
    }

    winCondition(){
        if (this.waveCount >= this.waveNames.length && this.enemyCount == 0) {
            this.score += this.waveScore * 10;
            this.scene.start('gameover', {score: this.score, condition: 'win'});
        }
    }
}