class Lore4 extends Phaser.Scene {
    constructor() {
        super("Lore4");
    }
    create() {
        textCount = 0;
        this.cameras.main.setBackgroundColor('#000000');

        let textConfig = {
            fontFamily: 'Courier',
            fontSize: '12px',
            color: '#FFFFFF',
            stroke: '#cc99ff',
            strokeThickness: 1,
            align: 'center',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 0
        }
        //show menu text
        let centerX = game.config.width / 2;
        let centerY = game.config.height / 2;
        let textSpacer = 32;
        SPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.line1 = this.add.text(centerX, centerY - textSpacer, 'Those eyes: whose are they?', textConfig).setOrigin(0.5);
        this.line2 = this.add.text(centerX, centerY, 'Attentively watching my every movement', textConfig).setOrigin(0.5);
        this.line3 = this.add.text(centerX, centerY + textSpacer, 'I know what you all think of me.', textConfig).setOrigin(0.5);
        this.bottomtext = this.add.text(centerX, centerY*2 - textSpacer, 'PRESS [SPACE] TO CONTINUE', textConfig).setOrigin(0.5);
    }
    update() {
        if (Phaser.Input.Keyboard.JustDown(SPACE)) {
            if (textCount == 0) {
                this.line1.text = 'They cry, the water exploding against the ground';
                this.line2.text = 'As they witness what I have done again';
                this.line3.text = 'The sound of their tears reminds me of the rain.';
                
            }
            if (textCount == 1) {
                this.line1.text = '';
                this.line2.setFontStyle('italic');
                this.line2.text = 'It is going to be okay, Hiro.';
                this.line3.text = '';
               
            }
         
            if(textCount == 2){
                this.scene.start('Floor4')
            }
            textCount+=1;
        }
    }
}