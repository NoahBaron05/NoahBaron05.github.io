// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x : 0, y : 0},
            debug: false,
            tileBias: 64
        }
    },
    fps: {forceSetTimeOut: true, target: 60},
    width: 1440,
    height: 900,
    scene: [Load, Start, Controls, Platformer, Ending]
}

var cursors;
const SCALE = 2.0;
var my = {sprite: {}, vfx : {}};

const game = new Phaser.Game(config);