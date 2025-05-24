class Start extends Phaser.Scene {
    constructor() {
        super("start");
    }

    create(){
        this.add.bitmapText(config.width / 4 + 150, config.height / 4 + 150, 'pixelfont', 'Hookrush', 100);  
        this.add.bitmapText(config.width / 4 + 150, config.height / 4 + 450, 'pixelfont', 'Press S to start', 50);  
        this.add.bitmapText(config.width / 4 + 110, config.height / 4 + 550, 'pixelfont', 'Press C for controls', 50); 

        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.cKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);

    }

    update(){        
        if (this.sKey.isDown){
            this.scene.start('platformerScene');
        }
        if (this.cKey.isDown){
            this.scene.start('controlsScene');
        }
    }
}