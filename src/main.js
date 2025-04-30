// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    width: 1000,
    height: 1000,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [TitleScreen, Shooter, ControlsScreen, GameOverScreen],
    fps: {forceSetTimeOut: true, target: 60}
}

// Global variable to hold sprites
var my = {sprite: {}};

const game = new Phaser.Game(config);