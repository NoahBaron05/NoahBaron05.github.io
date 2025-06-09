class Start extends Phaser.Scene {
    constructor() {
        super("start");
    }

    create(){
        this.add.bitmapText(config.width / 4 + 150, config.height / 4 + 150, 'pixelfont', 'Hookrush', 100);  
        this.add.bitmapText(config.width / 4 + 150, config.height / 4 + 350, 'pixelfont', 'Press S to start', 50);  
        this.add.bitmapText(config.width / 4 + 110, config.height / 4 + 450, 'pixelfont', 'Press C for controls', 50); 
        this.add.bitmapText(config.width / 4 + 110, config.height / 4 + 550, 'pixelfont', 'Press Z for credits', 50); 

        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.cKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
        this.zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    }

    update(){        
        if (this.sKey.isDown){
            this.scene.start('platformerScene', {spawnName: "spawn1", coinCount : 0, timeCount : 0});
        }
        if (this.cKey.isDown){
            this.scene.start('controlsScene');
        }
        if (this.zKey.isDown){
            this.scene.start('creditsScene');
        }
    }
}