class Ending extends Phaser.Scene {
    constructor() {
        super("ending");
    }
    
    create(){
        this.add.bitmapText(config.width / 4 + 150, config.height / 4 + 150, 'pixelfont', 'You Won!', 100);  
        this.add.bitmapText(config.width / 4 + 120, config.height / 4 + 450, 'pixelfont', 'Press R to replay', 50);  
        this.add.bitmapText(config.width / 4 + 40, config.height / 4 + 550, 'pixelfont', 'Press T for title screen', 50); 

        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.tKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);

    }

    update(){        
        if (this.rKey.isDown){
            this.scene.start('platformerScene');
        }
        if (this.tKey.isDown){
            this.scene.start('start');
        }
    }
}