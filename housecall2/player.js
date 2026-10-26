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
        const legs = scene.add.sprite(8, 11, "legsanimated", 0).setOrigin(0.5, 0.5);
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
        
        
        this.speed = 100;
        
        this.torsoOffsets = 
        {
            aimForward:
            {
                idle: 
                {
                    0: { x: 8, y: 6 }
                },

                walkRight:
                {
                    3: { x: 10, y: 5},  
                    4: { x: 10, y: 5},
                    5: { x: 11, y: 4 },
                    6: { x: 10, y: 3 }
                },
                
                walkLeft:
                {
                    3: { x: 10, y: 5},  
                    4: { x: 10, y: 5},
                    5: { x: 11, y: 4 },
                    6: { x: 10, y: 3 }
                }
            },
            block:
            {
                idle: 
                {
                    0: { x: 6, y: 7 }
                },

                walkRight:
                {
                    3: { x: 8, y: 6},  
                    4: { x: 8, y: 6},
                    5: { x: 9, y: 5 },
                    6: { x: 8, y: 4 }
                },
                
                walkLeft:
                {
                    3: { x: 8, y: 6},  
                    4: { x: 8, y: 6},
                    5: { x: 9, y: 5 },
                    6: { x: 8, y: 4 }
                }
            },
            pump:
            {
                idle: 
                {
                    0: { x: 8, y: 6 }
                },

                walkRight:
                {
                    3: { x: 10, y: 5},  
                    4: { x: 10, y: 5},
                    5: { x: 11, y: 4 },
                    6: { x: 10, y: 3 }
                },
                
                walkLeft:
                {
                    3: { x: 10, y: 5},  
                    4: { x: 10, y: 5},
                    5: { x: 11, y: 4 },
                    6: { x: 10, y: 3 }
                }
            }
        };
        
        
 
        
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
        const torsoOffsets = this.torsoOffsets[this.torsoState];
        if (!torsoOffsets) return;
        const offset = torsoOffsets[this.legState][textureFrame];
        
        if (!offset) return;

        this.torso.setPosition(offset.x, offset.y);
    }

    preUpdate(time, delta) 
    {
        this.setLegState();
        this.executeLegState(this.legState);
        this.setTorsoState(time);
        this.executeTorsoState(this.torsoState);
        this.torsoUpdatePositionToLegs();
    }

    setLegState() 
    {
        const speed = 66;

        if(this.gameManager.isActionActive("walkLeft")) 
        {
            this.legState = "walkLeft";
        } 
        else if(this.gameManager.isActionActive("walkRight"))
        {
            this.legState = "walkRight";
        } 
        else 
        {
            this.legState = "idle";
        }
    }
    
    executeLegState(legState)
    {
        switch(legState)
        {
            case "walkRight":
                this.body.setVelocityX(this.speed);
                this.legs.play("legs-walk", true);
                break;
                
            case "walkLeft":
                this.body.setVelocityX(-this.speed);
                this.legs.play("legs-walk", true);
                break;
                
            case "idle":
                this.body.setVelocityX(0);
                this.legs.play("legs-idle", true);
                break;
        }
    }
    
    executeTorsoState(torsoState)
    {
        switch(torsoState)
        {
            case "aimForward":
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
    
    setTorsoState(time)
    {
        if(this.gameManager.isActionActive("useShotgun") && time > this.lastPlayerShot + this.fireRate)
        {
            this.mouseRef.mouse.disableContextMenu();
            
            this.torsoState = "pump";
            this.lastPlayerShot = time;

        }
        else if(time > this.lastPlayerShot + this.fireRate)
        {
                this.torsoState = "aimForward";
        }
        
        if(this.gameManager.isActionActive("block") && time > this.lastPlayerBlock + this.blockRate)
        {
            this.torsoState = "block";
            return;
        }        
        
        
    }
}