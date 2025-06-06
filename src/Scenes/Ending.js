class Ending extends Phaser.Scene {
    constructor() {
        super("ending");
    }

    init(data){
        this.type = data.type;
    }

    create(){
        this.lastTime = parseInt(localStorage.getItem('lastRunTime') || '0');
        this.lastCoins = parseInt(localStorage.getItem('lastRunCoins') || '0');
        const bestTime = parseInt(localStorage.getItem('bestTime') || '0');
        const bestCoins = parseInt(localStorage.getItem('bestCoins') || '0');

        const formatTime = (timeInSec) => {
            const m = Math.floor(timeInSec / 60);
            const s = timeInSec % 60;
            return `${m}:${s.toString().padStart(2, '0')}`;
        };

        if (this.type == "complete"){
            this.add.bitmapText(300, 75, 'pixelfont', 'You Beat The Level!', 100);  
            this.add.bitmapText(500, 250, 'pixelfont', 'Your Coins: ' + this.lastCoins, 50);
            this.add.bitmapText(500, 350, 'pixelfont', `Your Time: ${formatTime(this.lastTime)}`, 50);  
 
            this.add.bitmapText(500, 700, 'pixelfont', 'Press R to play next level', 50);  
            
        } else if (this.type == "won"){
            this.add.bitmapText(500, 75, 'pixelfont', 'You Won!', 100);  
            this.add.bitmapText(500, 250, 'pixelfont', 'Your Coins: ' + this.lastCoins, 50);
            this.add.bitmapText(500, 350, 'pixelfont', `Your Time: ${formatTime(this.lastTime)}`, 50);  
            this.add.bitmapText(500, 450, 'pixelfont', 'Best Coins: ' + bestCoins, 50);  
            this.add.bitmapText(500, 550, 'pixelfont', `Best Time: ${formatTime(bestTime)}`, 50);  
            this.add.bitmapText(500, 800, 'pixelfont', 'Press T for title screen', 50); 

        }

        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.tKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);
    }

    update(){        
        if (this.rKey.isDown && this.type == "complete"){
            this.scene.start('platformerScene', {spawnName: "spawn2", coinCount : this.lastCoins, timeCount : this.lastTime});
        }
        if (this.tKey.isDown){
            this.scene.start('start');
        }
    }
}