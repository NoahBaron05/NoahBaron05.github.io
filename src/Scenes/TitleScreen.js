class TitleScreen extends Phaser.Scene {
    constructor() {
        super("titlescreen");
    }

    preload(){
        this.load.setPath("./assets/");
        
        this.load.bitmapFont('pixelfont', 'minogram_6x10.png', 'minogram_6x10.xml');
        this.load.atlasXML("vehicles", "vehicles_sheet.png", "vehicles_sheet.xml");
        this.load.image("starfield", "blue_space_background.png");
    }
    
    create(){
        this.background = this.add.tileSprite(0, 0, this.game.config.width, this.game.config.height, "starfield").setOrigin(0);

        this.add.bitmapText(150, config.height / 4, 'pixelfont', 'SPACE ATTACK!', 100);
 
        this.add.bitmapText(275, 600, 'pixelfont', 'Press S to play', 50).setOrigin(0,0);  
        this.add.bitmapText(200, 750, 'pixelfont', 'Press C for controls', 50).setOrigin(0,0); 

        this.main = this.add.sprite(500, 470, "vehicles", "playerShip1_blue.png");

        this.enemy1 = this.add.sprite(200, 150, "vehicles", "enemyRed1.png");
        this.enemy2 = this.add.sprite(500, 100, "vehicles", "enemyGreen5.png");
        this.enemy3 = this.add.sprite(800, 150, "vehicles", "enemyBlack4.png");

        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

        this.cKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);

        this.currentAngle = this.main.angle;

        this.rotationSpeed = 1;

    }

    update(){
        this.background.tilePositionY -= 1;
        
        if (this.sKey.isDown){
            this.scene.start('shooterMaker');
        }
        if (this.cKey.isDown){
            this.scene.start('controls');
        }

        if (this.main.angle < -45) this.rotationSpeed = 1;
        if (this.main.angle > 45) this.rotationSpeed = -1;

        this.main.angle += this.rotationSpeed;
        this.enemy1.angle += this.rotationSpeed;
        this.enemy2.angle += this.rotationSpeed;
        this.enemy3.angle += this.rotationSpeed;
    }
}