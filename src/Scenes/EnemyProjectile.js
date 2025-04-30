class EnemyProjectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame, pathType) {
        super(scene, x, y, texture, frame);
        this.scene = scene;
        this.pathType = pathType;
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.texture = texture;
        this.setScale = 0.5;
        this.speed = 7;
        this.angleStep = 0;
        this.curveDirection = (x < scene.game.config.width / 2) ? 1 : -1;
    }

    update(){
        switch(this.pathType){
            case "straight":
                this.y += this.speed;
                break;
            case "curved":
                if (this.y < 300){
                    this.y += this.speed; 
                } else {
                    this.y += this.speed;
                    this.x += this.curveDirection * 6;
                }
                break;
            case "sine":
                this.y += this.speed;    
                this.x += Math.sin(this.angleStep) * 5;
                this.angleStep += 0.1;
                break;
        }

        if (this.y > this.scene.game.config.height + 50){
            this.destroy();
        }
    }


}