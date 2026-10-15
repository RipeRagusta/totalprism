function createPlayer(scene) 
{
    scene.playerBulletsHolder = scene.physics.add.group
    ({
      classType: playerBullet,
      maxSize: 360,
      runChildUpdate: false
    });
        
    let player = new Player(scene, 0, 0, scene.playerBulletsHolder);
    return player;
}

class playerBullet extends Phaser.GameObjects.Sprite
{
    constructor(scene, x, y, texture)
    {
        super(scene, x, y, texture);
        this.setActive(false);
        this.setVisible(false);
        this.scene = scene;
    }

    fire(x, y, angle, damage, velocity = 400, penetrations = 0, penetrationReduction = 0.5, fromWhat)
    {
        this.startX = x;
        this.setOrigin(0, 0);
        this.setActive(true);
        this.setVisible(true);
        this.setRotation(angle);
        this.damage = damage;
        this.speed = velocity;
        this.damagedList = [];
        this.penetrationsLeft = penetrations;
        this.penetrationReduction = penetrationReduction;
        this.fromWhat = fromWhat;
       
        
        this.setPosition(x, y);
        this.velocityX = Math.cos(angle) * velocity;
        this.velocityY = Math.sin(angle) * velocity;
        
    }

    preUpdate(time, delta)
    {
        if (!this.active) return;

        const dt = delta / 1000;

        this.x += this.velocityX * dt;
        this.y += this.velocityY * dt;
    } 
}

class Player extends Phaser.GameObjects.Container 
{
    constructor(scene, x, y, bulletHolder) 
    {
        const legs = scene.add.sprite(8, 12, "legsanimated", 0).setOrigin(0.5, 0.5);
        const torso = scene.add.sprite(10, 4, "torsoanimated").setOrigin(0.5, 0.5);
     
        super(scene, x, y, [legs, torso]);
        this.bulletHolder = bulletHolder;
        this.scene = scene;
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(16, 16);

        this.gameManager = game.scene.getScene("GameManager");
        this.legs = legs;
        this.torso = torso;
        
        this.torsoOffsets = 
        [
            { x: 8, y: 7 },   //idle
            { x: 10, y: 6},  //transition
            { x: 10, y: 6},
            { x: 11, y: 5 },
            { x: 10, y: 4 },
        ];
        
        this.lastPlayerShot = 0;
        this.fireRate = 500;
        
        this.blockRate = 750;
        this.lastPlayerBlock = 0;
        
        this.mouseRef = scene.input;
        
        this.firemode = null;
    }
    
    torsoUpdatePositionToLegs() 
    {
        const textureFrame = Number(this.legs.frame.name);

        const offset = this.torsoOffsets[textureFrame];

        if(offset) 
        {
            this.torso.setPosition(offset.x, offset.y);
        }
        
        /*if(this.torsoState === "block")
        {
            this.torso.setPosition(10, 5);
        }*/
    }

    preUpdate(time, delta) 
    {
        this.checkMovement();
        this.setState(time);
        this.executeTorsoState(this.torsoState);
        this.torsoUpdatePositionToLegs();
    }

    checkMovement() 
    {
        const speed = 66;

        if(this.gameManager.isActionActive("walkLeft")) 
        {
            this.body.setVelocityX(-speed);
            this.legs.play("legs-walk", true);
        } 
        else if (this.gameManager.isActionActive("walkRight"))
        {
            
            this.body.setVelocityX(speed);
            this.legs.play("legs-walk", true);
        } 
        else 
        {
            this.body.setVelocityX(0);
            this.legs.play("legs-idle", true);
        }
    }
    
    executeTorsoState(torsoState)
    {
        switch(torsoState)
        {
            case "aimforward":
                this.torso.setFrame(0);
                break;
                
            case "block":
                this.torso.setFrame(2);
                break;
                
            case "pump":
                this.torso.setFrame(1);
                break;   
        }
    }
    
    setState(time)
    {
        if(this.gameManager.isActionActive("useShotgun") && time > this.lastPlayerShot + this.fireRate)
        {
            this.mouseRef.mouse.disableContextMenu();
            
            this.torsoState = "pump";
            this.lastPlayerShot = time;
            return;
        }
        
        if(this.gameManager.isActionActive("block") && time > this.lastPlayerBlock + this.blockRate)
        {
            this.torsoState = "block";
            return;
        }
        
        
        
        if(time > this.lastPlayerShot + this.fireRate)
        {
            this.torsoState = "aimforward";
        }
    }
    
    /*checkShooting(time)
    {
        if(this.gameManager.isActionActive("useShotgun") && time > this.lastPlayerShot + this.fireRate)
        {
            this.mouseRef.mouse.disableContextMenu();
            
            this.torsoState = "pump";
            this.lastPlayerShot = time;
        }
        else if(time > this.lastPlayerShot + this.fireRate)
        {
            this.torsoState = "aimforward";
        }
    }
    
    shoot()
    {
        
    }*/
    
    /*shoot()
    {
        const fireConfig = this.gameManager.fireModeConfig[this.fireMode];
        
        let offset = -(fireConfig.spread / 2);

        for (let i = 0; i < fireConfig.pelletCount; i++)
        {
            const pelletType = this.doubleFire ? fireConfig.doublePelletType : fireConfig.normalPelletType;
            
            const bullet = this.bullets.get(this.x, this.y, pelletType);

            if(bullet)
            {
                let currentPenetrations = fireConfig.penetrations;
                
                if(this.gameManager.highVelocityUpgrade)
                {
                    currentPenetrations += 1;
                }
                
                let currentPenetrationReduction = fireConfig.penetrationReduction;
                
                this.damagePerShot = this.baseDamage * fireConfig.damage;
                
                if(this.flip === false)
                {
                  bullet.fire(this.x + 8, this.y - 2, this.aimAngle + Phaser.Math.DegToRad(offset), this.damagePerShot, fireConfig.pelletVelocity, currentPenetrations, currentPenetrationReduction, this.doubleFire ? "doubleFire" : "shotgun");
                }
                else
                {
                  bullet.fire(this.x - 8, this.y - 1, this.aimAngle + Phaser.Math.DegToRad(offset), this.damagePerShot, fireConfig.pelletVelocity, currentPenetrations, currentPenetrationReduction, this.doubleFire ? "doubleFire" : "shotgun");
                }

                offset += fireConfig.spreadIncrement;
            }
        }
        
        if(!this.firedFirstShot)
        {
            this.scene.sound.play(fireConfig.sound);
            this.firedFirstShot = true;
        }
        else
        {
            canPlayAudio(this.scene) && this.scene.sound.play(fireConfig.sound);
        }
        
        this.shotgunEmitters[fireConfig.shellEmitter].emitParticleAt(this.x, this.y);
    }*/
}

 

/*class Player extends Phaser.Physics.Arcade.Sprite 
{
    constructor(scene, x, y) 
    {
        super(scene, x, y, null);
        
        this.scene = scene;
        this.gameManager = game.scene.getScene("GameManager");
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setSize(16, 16);
        this.setAlpha(0); 

        this.visuals = scene.add.container(this.x, this.Y);
        
        this.legs = scene.add.image(0, 0 + 5, "legs");
        this.torso = scene.add.image(0, 0 - 3, "torso");
        
        this.visuals.add([this.legs, this.torso]);
        
        this.keys = scene.input.keyboard.addKeys
        ({
            up: Phaser.Input.Keyboard.KeyCodes.SPACE,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
    }
    
    updateLegs()
    {
        
    }
 
    updateTorso()
    {
        
    }
    
    preUpdate(time, delta)
    {
        super.preUpdate(time, delta);
        this.checkMovement();
        this.visuals.setPosition(this.x, this.y);
    }
   
    checkMovement() 
    {
        const speed = 66;
        
        if(this.gameManager.isActionActive("walkLeft"))
        {
            this.setVelocityX(-speed);
        }
        else if(this.gameManager.isActionActive("walkRight"))
        {
            this.setVelocityX(speed);
        }
        else
        {
            this.setVelocityX(0);
        }
    }
    
    update() 
    {
        
    }7
}*/
