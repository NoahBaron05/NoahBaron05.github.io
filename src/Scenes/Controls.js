class Controls extends Phaser.Scene {
    constructor() {
        super("controlsScene");
    }
    
    create(){
        this.add.bitmapText(100, 200, 'pixelfont', 'Movement: WASD', 50);  
        this.add.bitmapText(100, 300, 'pixelfont', 'Jump: SPACE', 50);  
        this.add.bitmapText(100, 400, 'pixelfont', 'Grapple Hook: Mouse to aim, left click to shoot', 50); 
        this.add.bitmapText(100, 600, 'pixelfont', 'Press S to start', 50);  
        this.add.bitmapText(100, 800, 'pixelfont', 'Press T for title screen', 50); 

        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.tKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);

    }

    update(){        
        if (this.sKey.isDown){
            this.scene.start('platformerScene');
        }
        if (this.tKey.isDown){
            this.scene.start('start');
        }
    }
}