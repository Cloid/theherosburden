class Turret extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, texture, frame){
        super(scene, x, y, texture, frame)
        scene.add.existing(this)
        
           
    }    
    shoot(){

    }

    preUpdate(){
        super.preUpdate();
        
        //Change velcocity based on direction specified
        const speed = 50;

        if(newDirection==0){
            this.setVelocity(0,-speed)
            this.flipX=false

        } else if(newDirection==1){
            this.setVelocity(0,speed)
            this.flipX=false

        } else if(newDirection==2){
            this.setVelocity(-speed,0)
            this.flipX=true

        } else if(newDirection==3){
            this.setVelocity(speed,0)
            this.flipX=false

        }


    }

    

}

