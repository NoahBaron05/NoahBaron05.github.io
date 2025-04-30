class ControlsScreen extends Phaser.Scene {
    constructor() {
        super("controls");
    }

    preload(){
        this.load.setPath("./assets/");
        
        this.load.bitmapFont('pixelfont', 'minogram_6x10.png', 'minogram_6x10.xml');
        this.load.image("starfield", "blue_space_background.png");
    }
    
    create(){
        this.background = this.add.tileSprite(0, 0, this.game.config.width, this.game.config.height, "starfield").setOrigin(0);

        
        this.add.bitmapText(300, 150, 'pixelfont', 'Move Left:   A', 50);
        this.add.bitmapText(300, 250, 'pixelfont', 'Move Right:  D', 50);  
        this.add.bitmapText(300, 350, 'pixelfont', 'Shoot:   Space', 50);  
        this.add.bitmapText(175, 550, 'pixelfont', 'Created by: Noah Baron', 50);    
        this.add.bitmapText(250, 750, 'pixelfont', 'Press C to return', 50);  

        this.cKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);

    }

    update(){
        this.background.tilePositionY -= 1;
        
        if (this.cKey.isDown){
            this.scene.start('titlescreen');
        }
    }
}