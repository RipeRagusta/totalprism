class cultOrb extends Phaser.Physics.Arcade.Sprite
  {
    constructor(scene, x, y)
    {
      super(scene, x, y, "cultorb");
      this.speed = 200;
      this.setActive(false);
      this.setVisible(false);
    }

    fire(x, y, angle)
    {
    if(this.body) 
    {
        this.body.enable = true;
    }
      this.body.reset(x, y);
      this.setActive(true);
      this.setVisible(true);
      this.setRotation(angle);
      this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
      this.body.allowGravity = false;
      this.startX = x;
    }

    update(time, delta)
    {
      super.update(time, delta);

      if(this.y < 0 || this.y > this.scene.sys.game.config.height || this.x > this.startX + 1000 || this.x < this.startX - 1000)
      {
        this.setActive(false);
        this.setVisible(false);
        this.body.stop();
      }
    }

    collided()
    {
      this.setActive(false);
      this.setVisible(false);
      this.body.stop();
    }
  }

function cultCreator(scene, cultPositions, gameManager)
  {
        scene.cultOrbHolder = scene.physics.add.group
        ({
          classType: cultOrb,
          maxSize: 30,
          runChildUpdate: false
        });
        
        scene.physics.add.overlap(scene.player, scene.cultOrbHolder, (player, orb) =>
        {
            orb.destroy();

            if(!player.block)
            {
                if(scene.gameManager.alwaysBlock)
                {
                    canPlayAudio(scene) && scene.sound.play("block");
                    player.defenceParticles();
                    player.activateDoubleFire();
                    player.play("block", false);
                    player.successfulBlock = true;
                    player.resetShootTime = true;
                    player.resetPistolTime = true;
                    if(scene.gameManager.screenShake)
                    {
                        scene.cameras.main.shake(100, 0.005);
                    }
                }
                else
                {
                    player.health -= 10;
                    canPlayAudio(scene) && scene.sound.play("playerhurt");
                    if(player.health < 1 && !player.killed)
                    {
                        player.kill();
                        goBackALevel(scene, player.gameManager);
                    }
                }
            }
            else
            {
                canPlayAudio(scene) && scene.sound.play("block");
                player.defenceParticles();
                player.activateDoubleFire();
                player.play("block", false);
                player.successfulBlock = true;
                player.resetShootTime = true;
                player.resetPistolTime = true;
                if(scene.gameManager.screenShake)
                {
                    scene.cameras.main.shake(100, 0.005);
                }
            }
        });
        
        scene.cults = scene.physics.add.group();
        
        cultPositions.forEach(pos => 
        {
            const cultInstance = new cult(scene, pos.x, pos.y, scene.player, scene.cultOrbHolder);
            scene.cults.add(cultInstance);
        });

        scene.physics.add.collider(scene.cults, scene.cults);
        scene.physics.add.overlap(scene.cults, scene.playerBulletsHolder, (cult, bullet) =>
        {
            if(!bullet.damagedList.includes(cult.id) && !bullet.penetrationsLeft >= 1)
            {
                bullet.damagedList.push(cult.id);
                bullet.destroy();
                cult.hitFrom = bullet.fromWhat;
                cult.health -= bullet.damage;
                
                if(!cult.anims.isPlaying)
                {
                  cult.play("cultOrbHurt", false);
                }
                
                if(cult.gameManager.bloodType === "Classic" || cult.gameManager.bloodType === "Classic-Subtle")
                {
                    cult.bloodEmitter.setQuantity(4);
                }
                else if(cult.gameManager.bloodType === "Classic-V2" || cult.gameManager.bloodType === "Classic-V2-Subtle")
                {
                     cult.bloodEmitter.setQuantity(Math.max(1, Math.round(bullet.damage * 4)));
                }
                else
                {
                    cult.bloodEmitter.setQuantity(Math.max(1, Math.round(bullet.damage * 2)));
                }
                
                if(cult.gameManager.bloodType !== "Off")
                {
                    cult.bloodEmitter.emitParticleAt(cult.x, cult.y);
                }
            }
            else
            {
                if(!bullet.damagedList.includes(cult.id))
                {
                    bullet.damagedList.push(cult.id);
                    bullet.penetrationsLeft -= 1;
                    cult.hitFrom = bullet.fromWhat;
                    cult.health -= bullet.damage;
                    
                    if(!cult.anims.isPlaying)
                    {
                      cult.play("cultOrbHurt", false);
                    }
                    
                    if(cult.gameManager.bloodType === "Classic" || cult.gameManager.bloodType === "Classic-Subtle")
                    {
                        cult.bloodEmitter.setQuantity(4);
                    }
                    else if(cult.gameManager.bloodType === "Classic-V2" || cult.gameManager.bloodType === "Classic-V2-Subtle")
                    {
                         cult.bloodEmitter.setQuantity(Math.max(1, Math.round(bullet.damage * 4)));
                    }
                    else
                    {
                        cult.bloodEmitter.setQuantity(Math.max(1, Math.round(bullet.damage * 2)));
                    }
                    
                    if(cult.gameManager.bloodType !== "Off")
                    {
                        cult.bloodEmitter.emitParticleAt(cult.x, cult.y);
                    }
                    
                    bullet.damage = bullet.damage * bullet.penetrationReduction;
                }
            }
            
            if(cult.health < 1 && !cult.grantedKillReward)
            {
                cult.grantedKillReward = true;
                cult.player.successfulKill = true;
            }
        });
        
        scene.time.addEvent
        ({
            delay: 1500,
            callback: () => cultSynchro(scene, scene.cults),
            callbackScope: this,
            loop: true
        });
  }

function cultSeparation(cults, player)
  {
    let cultsWithDistancesRight = [];
    let cultsWithDistancesLeft = [];

    cults.children.entries.forEach(cult =>
    {
      let distance = Phaser.Math.Distance.Between(player.x, player.y, cult.x, cult.y);

      if(player.x < cult.x)
      {
        cultsWithDistancesRight.push
        ({
            cult: cult,
            distance: distance
        });
      }
      else
      {
        cultsWithDistancesLeft.push
        ({
            cult: cult,
            distance: distance
        });
      }
    });

    cultsWithDistancesRight.sort((a, b) =>
    {
      return a.distance - b.distance;
    });

    cultsWithDistancesLeft.sort((a, b) =>
    {
      return a.distance - b.distance;
    });

    let newDistanceAdderRight = 0;
    cultsWithDistancesRight.forEach(item =>
    {
      item.cult.distancePref = item.cult.initalDistancePref + newDistanceAdderRight;
      newDistanceAdderRight += 16;
    });

    let newDistanceAdderLeft = 0;
    cultsWithDistancesLeft.forEach(item =>
    {
      item.cult.distancePref = item.cult.initalDistancePref + newDistanceAdderLeft;
      newDistanceAdderLeft += 16;
    });
  }
  
  function cultSynchro(scene, cults)
  {
        let cultSoundPlayed = false;
        
        cults.children.entries.forEach(cult => 
        {
            if(cult.alert && cult.visible) 
            {
                let cultSoundUpdate = (anim, frame) => 
                {
                    if(cult.anims.isPlaying && cult.anims.currentAnim.key === "orbThrow" && frame.index === 2 && !cultSoundPlayed)
                    {
                        cultSoundPlayed = true;
                        canPlayAudio(scene) && scene.sound.play("orbthrow");
                    }

                    if(cultSoundPlayed)
                    {
                        cult.off(Phaser.Animations.Events.ANIMATION_UPDATE, cultSoundUpdate);
                    }
                };

                cult.on(Phaser.Animations.Events.ANIMATION_UPDATE, cultSoundUpdate);
                cult.shoot();
            }
        });
    }

  class cult extends Phaser.Physics.Arcade.Sprite
  {
    constructor(scene, x, y, player, cultOrbHolder)
    {
        super(scene, x, y, "cult");

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setActive(true);
        this.setVisible(true);
        this.health = 15;
        this.initialHealth = this.health;
        this.setBounce(0);
        this.player = player;
        this.alert = false;
        this.orbs = cultOrbHolder;
        this.gameManager = game.scene.getScene("GameManager");
        this.distancePref = 100;
        this.killed = false;
        this.grantedKillReward = false;
        
        if(this.gameManager.moreDistanceUpgrade)
        {
            this.distancePref = 150;
        }
        else if(this.gameManager.lessDistanceUpgrade)
        {
            this.distancePref = 85;
        }
        
        this.initalDistancePref = this.distancePref;
        this.distanceOffset = 1;
        this.flip = false;
        this.scene = scene;
        this.shotOnce = false;
        this.id = Phaser.Utils.String.UUID();
      
        if(!scene.anims.get("orbThrow"))
        {
            scene.anims.create
            ({
              key: "orbThrow",
              frames: [
                     { key: "cult", frame: 1 },
                     { key: "cult", frame: 2 },
                     { key: "cult", frame: 1 },
                     { key: "cult", frame: 0 }
                 ],
              frameRate: 6,
              repeat: 0
            });
        }
        
        if(!scene.anims.get("cultOrbHurt"))
        {
            scene.anims.create
            ({
                key: "cultOrbHurt",
                frames: [
                     { key: "cult", frame: 3 },
                     { key: "cult", frame: 0 }
                 ],
                frameRate: 2,
                repeat: 0
            });
        }
        
        this.createBlood();
        
        this.headEmitter = this.scene.add.particles
        (
            0, 0, 
            "headgib",
            {
                angle: { min: 270, max: 315 }, 
                speed: { min: 125, max: 150 },
                gravityY: 500,
                lifespan: { min: 1000, max: 1000 },
                quantity: 1,
                scale: { start: 1, end: 1 },
                alpha: { start: 1, end: 1 },
                rotate: { min: 0, max: 90 },
                blendMode: "NORMAL",
                frequency: -1
            }
        );

        this.ribEmitter = this.scene.add.particles
        (
            0, 0, 
            "ribcagegib",
            {
                angle: { min: 270, max: 315 }, 
                speed: { min: 75, max: 100 },
                gravityY: 500,
                lifespan: { min: 1000, max: 1000 },
                quantity: 1,
                scale: { start: 1, end: 1 },
                alpha: { start: 1, end: 0.5 },
                rotate: { min: 0, max: 90 },
                blendMode: "NORMAL",
                frequency: -1
            }
        );

        this.boneEmitter = this.scene.add.particles
        (
            0, 0, 
            "bonegib",
            {
                angle: { min: 180, max: 360 }, 
                speed: { min: 75, max: 100 },
                gravityY: 500,
                lifespan: { min: 1000, max: 1000 },
                quantity: 2,
                scale: { start: 1, end: 1 },
                alpha: { start: 1, end: 0.5 },
                rotate: { min: -180, max: 180 },
                blendMode: "NORMAL",
                frequency: -1
            }
        );
    
        this.organEmitter = this.scene.add.particles
        (
            0, 0, 
            "organgib",
            {
                angle: { min: 180, max: 360 }, 
                speed: { min: 50, max: 100 },
                gravityY: 500,
                lifespan: { min: 1000, max: 1000 },
                quantity: 4,
                scale: { start: 1, end: 1 },
                alpha: { start: 1, end: 0.5 },
                rotate: { min: -180, max: 180 },
                blendMode: "NORMAL",
                frequency: -1
            }
        );

        this.orbFrameUpdate = (anim, frame) => 
        {
            if(this.anims.isPlaying && this.anims.currentAnim.key === "orbThrow" && frame.index === 2 && !this.shotOnce)
            {
                this.shotOnce = true;
                const orb = this.orbs.get(this.x, this.y, "cultorb");

                if(orb)
                {
                    if(this.flip === false)
                    {
                        orb.fire(this.x - (this.width / 2), this.y, Phaser.Math.DegToRad(180));
                    }
                    else
                    {
                        orb.fire(this.x + (this.width / 2), this.y, Phaser.Math.DegToRad(0));
                    }
                }
            }
            else if (this.anims.isPlaying && this.anims.currentAnim.key === "orbThrow" && frame.index !== 2 && this.shotOnce) 
            {
                 this.shotOnce = false;
            }
        };   
        
        this.on(Phaser.Animations.Events.ANIMATION_UPDATE, this.orbFrameUpdate, this);

        this.on(Phaser.GameObjects.Events.DESTROY, () => 
        {
            this.off(Phaser.Animations.Events.ANIMATION_UPDATE, this.orbFrameUpdate, this);
        }, this);
    }
    

    update(time, delta)
    {
        super.update(time, delta);

        if(this.health < 1 && this.killed === false)
        {
            this.killed = true;
            canPlayAudio(this.scene) && this.scene.sound.play("hurt");
            if(this.scene.gameManager.screenShake)
            {
                this.scene.cameras.main.shake(50, 0.004);
            }
            this.kill();
        }
        else
        {
            this.checkInRange();

            if(this.alert === true || this.health < this.initialHealth)
            {
                if(this.player.x < this.x && Math.abs(this.player.x - this.x) >= this.distancePref + this.distanceOffset)
                {
                    this.setVelocityX(-110);
                }
                else if(this.player.x > this.x && Math.abs(this.player.x - this.x) >= this.distancePref + this.distanceOffset)
                {
                    this.setVelocityX(110);
                }
                else if(Math.abs(this.player.x - this.x) >= this.distancePref - this.distanceOffset && Math.abs(this.player.x - this.x) <= this.distancePref + this.distanceOffset)
                {
                    this.setVelocityX(0);
                }
                else
                {
                    if (this.player.x < this.x)
                    {
                        this.setVelocityX(110);
                    }
                    else
                    {
                        this.setVelocityX(-110);
                    }
                }

                if(this.x > this.player.x)
                {
                    this.flip = false;
                    this.setFlipX(false);
                }
                else
                {
                    this.flip = true;
                    this.setFlipX(true);
                }
            }
            else
            {
                if(this.flip === true)
                {
                    this.setFlipX(true);
                }
                else
                {
                    this.setFlipX(false);
                }
            }
        }
    }
    
    createBlood()
    {
        if(this.gameManager.bloodType === "Standard" || this.gameManager.bloodType === "Classic" || this.gameManager.bloodType === "Classic-V2")
        {
            this.bloodEmitter = this.scene.add.particles
            (
                0, 0, 
                "blood",
                {
                    angle: { min: 180, max: 360 }, 
                    speed: { min: 50, max: 150 },
                    gravityY: 500,
                    lifespan: { min: 1000, max: 1000 },
                    quantity: 10,
                    scale: { start: 1, end: 1 },
                    alpha: { start: 0.65, end: 0.5 },
                    rotate: { min: -180, max: 180 },
                    blendMode: "NORMAL",
                    frequency: -1
                }
            );
        }
        else if(this.gameManager.bloodType === "Standard-Subtle" || this.gameManager.bloodType === "Classic-Subtle" || this.gameManager.bloodType === "Classic-V2-Subtle")
        {
            this.bloodEmitter = this.scene.add.particles
            (
                0, 0, 
                "blood",
                {
                    angle: { min: 180, max: 360 }, 
                    speed: { min: 50, max: 150 },
                    gravityY: 500,
                    lifespan: { min: 500, max: 1000 },
                    quantity: 10,
                    scale: { start: 1, end: 1 },
                    alpha: { start: 0.5, end: 0 },
                    rotate: { min: -180, max: 180 },
                    blendMode: "NORMAL",
                    frequency: -1
                }
            );
        }
        else if(this.gameManager.bloodType === "Small")
        {
            this.bloodEmitter = this.scene.add.particles
            (
                0, 0, 
                "blood",
                {
                    angle: { min: 180, max: 360 }, 
                    speed: { min: 50, max: 125 },
                    gravityY: 500,
                    lifespan: { min: 1000, max: 1000 },
                    quantity: 10,
                    scale: { start: 1, end: 1 },
                    alpha: { start: 0.65, end: 0.5 },
                    rotate: { min: -180, max: 180 },
                    blendMode: "NORMAL",
                    frequency: -1
                }
            );
        }
        else
        {
            this.bloodEmitter = this.scene.add.particles
            (
                0, 0, 
                "blood",
                {
                    angle: { min: 180, max: 360 }, 
                    speed: { min: 50, max: 125 },
                    gravityY: 500,
                    lifespan: { min: 500, max: 1000 },
                    quantity: 10,
                    scale: { start: 1, end: 1 },
                    alpha: { start: 0.5, end: 0 },
                    rotate: { min: -180, max: 180 },
                    blendMode: "NORMAL",
                    frequency: -1
                }
            );
        }
    }

    checkInRange()
    {
        if(this.alert === false && Math.abs(this.player.x - this.x) <= 308)
        {
            this.alert = true;
        }
    }
    
    shoot()
    {
        this.play("orbThrow", false); 
        
    }
    
    buddha()
    {
        this.health = Number.MAX_SAFE_INTEGER;
    }
    
    kill()
    {
        this.bloodEmitter.setQuantity(15);
        if(this.gameManager.bloodType !== "Off")
        {
            this.bloodEmitter.emitParticleAt(this.x, this.y);
        }
        
        if(this.gameManager.extraGibs === "All" || this.gameManager.extraGibs === "Cultists-Only")
        {
            this.boneEmitter.emitParticleAt(this.x, this.y);
            this.organEmitter.emitParticleAt(this.x, this.y);
            this.headEmitter.emitParticleAt(this.x, this.y);
            this.ribEmitter.emitParticleAt(this.x, this.y);
        }
        
        const gameManager = this.scene.gameManager;
        if(gameManager.doubleFireUpgrade)
        {
            if(this.scene.player && this.scene.player.active)
            {
                this.scene.player.activateDoubleFire();
            } 
        }

        if(!gameManager.cheats)
        {
            let currentScore = 35;
            
            if(this.hitFrom === "pistol")
            {
                currentScore = currentScore * 4;
            }
            else if(this.hitFrom === "doubleFire")
            {
                currentScore = currentScore * 2;
            }
            
            gameManager.score += currentScore;
        }
        
        if(gameManager.gameMode === "Classic")
        {
            if(gameManager.score > gameManager.highScore)
            {
                gameManager.highScore = gameManager.score;
                if(checkStorage() === true)
                {
                    localStorage.setItem("HCHighScore", gameManager.highScore);
                }
            }
        }
        else if(gameManager.gameMode === "Standard")
        {
            if(gameManager.score > gameManager.experimentalHighScore)
            {
                gameManager.experimentalHighScore = gameManager.score;
                if(checkStorage() === true)
                {
                    localStorage.setItem("HCExperimentalHighScore", gameManager.experimentalHighScore);
                }
            }
        }
        else if(gameManager.gameMode === "Easy")
        {
            if(gameManager.score > gameManager.easyHighScore)
            {
                gameManager.easyHighScore = gameManager.score;
                if(checkStorage() === true)
                {
                    localStorage.setItem("HCEasyHighScore", gameManager.easyHighScore);
                }
            }
        }
        
        const HUD = this.scene.HUD;
        HUD.updateScore();
        HUD.updateHighScore();
        
        this.setActive(false);
        this.setVisible(false);
        this.destroy();
    }
}
  
function activateCultGroups(scene, cultGroup)
{
    scene.cults.children.entries.forEach(cult =>
    {
        if(cult.alert)
        {
            if(cultGroup.has(cult.id))
            {
                cultGroup.forEach(cultId => 
                {
                    const cultInstance = scene.cults.children.entries.find(cult => cult.id === cultId);

                    if(cultInstance && !cultInstance.alet) 
                    {
                        cultInstance.alert = true;
                    }
                });
            }
        }
    });
}
