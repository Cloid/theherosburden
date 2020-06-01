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
	scene: [Game, GameUI],
	scale:{
		zoom: 2
	}
};

let game = new Phaser.Game(config);
let keyUP, keyLEFT, keyRIGHT, keyDOWN, keyM, keyQ;
let wallSlayer = null;
let knives = null;
let knife2 = null;
let lizards = null;
let lizard2 = null;
let _health = 3;
var enemyCollide;
var playerSpeed = 100;
//var playerHearts = 4;
const sceneEvents = new Phaser.Events.EventEmitter();

//Debuff Effects
var slimed = false;
var possessed = false;
var possessedDirection = 4;
var confused = false;
var playerDead = false;