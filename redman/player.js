function createPlayer(scene)
{
    let player = new Player(scene, 0, 0);
    return player;
}

class Player extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y, playerBulletsHolder)
    {
        super(scene, x, y, "redman");
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setActive(true);
        this.setVisible(true);
        this.scene = scene;
        this.gameManager = game.scene.getScene("GameManager");
        
        
        this.setCollideWorldBounds(true);
        
        this.keys = scene.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.SPACE,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });
    }
    
    preUpdate(time, delta)
    {
        const speed = 66;
        const jumpVelocity = -100;
    
        if(this.keys.left.isDown) 
        {
            this.setVelocityX(-speed);
        } 
        else if(this.keys.right.isDown) 
        {
            this.setVelocityX(speed);
        } 
        else 
        {
            this.setVelocityX(0);
        }

        if(this.keys.up.isDown && this.body.touching.down) 
        {
            this.setVelocityY(jumpVelocity);
        }
    }
   
    
    checkMovement()
    {
        
    }
    
    update()
    {
        
    }
    
    checkFlip()
    {
        
    }
}