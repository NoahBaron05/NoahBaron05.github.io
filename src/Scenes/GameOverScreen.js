class GameOverScreen extends Phaser.Scene {
    constructor() {
        super("gameover");
    }

    preload(){
        this.load.setPath("./assets/");
        
        this.load.bitmapFont('pixelfont', 'minogram_6x10.png', 'minogram_6x10.xml');
        this.load.image("starfield", "blue_space_background.png");
    }

    init(data) {
        this.finalScore = data.score;
        this.condition = data.condition;
    }
    
    create(){
        this.background = this.add.tileSprite(0, 0, this.game.config.width, this.game.config.height, "starfield").setOrigin(0);

        if (this.condition == 'lose') this.add.bitmapText(config.width / 4, config.height / 4, 'pixelfont', 'GAME OVER', 100);
        if (this.condition == 'win') this.add.bitmapText(config.width / 4, config.height / 4, 'pixelfont', 'YOU WON!', 100);
        
        this.add.bitmapText(config.width / 4, config.height / 4 + 150, 'pixelfont', 'SCORE: ' + this.finalScore, 100);  
        this.add.bitmapText(config.width / 4, config.height / 4 + 450, 'pixelfont', 'Press R to replay', 50);  
        this.add.bitmapText(config.width / 4, config.height / 4 + 550, 'pixelfont', 'Press T for title screen', 50); 

        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.tKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);

    }

    update(){
        this.background.tilePositionY -= 1;
        
        if (this.rKey.isDown){
            this.scene.start('shooterMaker');
        }
        if (this.tKey.isDown){
            this.scene.start('titlescreen');
        }
    }
}