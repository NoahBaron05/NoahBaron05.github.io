class Credits extends Phaser.Scene {
    constructor() {
        super("creditsScene");
    }
    
    create(){
        this.add.bitmapText(100, 200, 'pixelfont', 'Created by Noah Baron', 50);  
        this.add.bitmapText(100, 300, 'pixelfont', 'All audio and art assets by Kenney Assets', 50);  

        this.add.bitmapText(100, 700, 'pixelfont', 'Press S to start', 50);  
        this.add.bitmapText(100, 800, 'pixelfont', 'Press T for title screen', 50); 

        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.tKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);

    }

    update(){        
        if (this.sKey.isDown){
            this.scene.start('platformerScene', {spawnName: "spawn1", coinCount : 0, timeCount : 0});
        }
        if (this.tKey.isDown){
            this.scene.start('start');
        }
    }
}