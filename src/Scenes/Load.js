class Load extends Phaser.Scene {
    constructor(){
        super("loadScene");
    }

    preload(){
        this.load.setPath("./assets");

        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        this.load.image("grapple", 'tile_0007.png');

        this.load.image("tilemap_tiles", "tilemap.png");
        this.load.image("tilemap_tiles_extra", "tilemap_packed_extras.png");
        this.load.image("tilemap_tiles_background", "tilemap-backgrounds.png");
        this.load.tilemapTiledJSON("platformerLevel", "PlatformerLevel.tmj");
        this.load.tilemapTiledJSON("platformerLevelBackground", "PlatformerLevelBackground.tmj");

        this.load.audio('jumpSFX', 'Audio/jump.wav');
        this.load.audio('grappleImpact', 'Audio/impactMetal_heavy_001.ogg');
        this.load.audio('coinVFX', 'Audio/coinVFX.wav');
        this.load.audio('death', 'Audio/death.wav');

        this.load.audio('run1', 'Audio/footstep_concrete_001.ogg');
        this.load.audio('run2', 'Audio/footstep_concrete_002.ogg');
        this.load.audio('run3', 'Audio/footstep_concrete_003.ogg');
        this.load.audio('run4', 'Audio/footstep_concrete_004.ogg');

        this.load.multiatlas("kenny-particles", "kenny-particles.json");

        this.load.spritesheet("tilemap_sheet", "tilemap_packed_extras.png", {
            frameWidth: 18,
            frameHeight: 18
        });

        this.load.bitmapFont('pixelfont', 'minogram_6x10.png', 'minogram_6x10.xml');

    }

    create(){
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 4,
                end: 5,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0004.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0005.png" }
            ],
        });
        

        this.scene.start("start");
    }

    update(){

    }
}