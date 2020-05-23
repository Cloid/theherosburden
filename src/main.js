let config = {
    type: Phaser.AUTO,
    width: 400,
    height: 250,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
        }
    },
	scene: [Game],
	scale:{
		zoom: 2
	}
};

let game = new Phaser.Game(config);
let keyUP, keyLEFT, keyRIGHT, keyDOWN;
let wallSlayer = null;