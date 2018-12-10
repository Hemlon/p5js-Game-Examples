var score = [];
var keys = {};

var message = "";
var gameWin = false;
var isPaused = false;
showCollision = false;
var images = [];
var bgm;

function preload()
{
    images[0] = loadImage("pics/pokemon.png");
        bgm = loadSound("music/bobble");
        
};


function setup()
{
        createCanvas(400,400);
      
        
        score[0] = 0;
        bgm.play();
        gameDuration.reset(180,10);
};


var gameDuration = {
    gameTime:0, 
    duration: 60,
    interval: 1000,
reset: function(duration, interval) {
    this.gameTime = 0;
    this.duration = duration;
    this.interval = interval;
},
update: function() {
    this.gameTime++;
if (this.gameTime > this.interval)
{
     this.gameTime = 0;
   if (this.duration > 0)
   {
       this.duration--;
   }
   else
   {
        gameWin = true;
        isPaused = true;
        this.gameTime = this.interval+ 10;
   }
   
}
},
draw: function() {
       text(this.duration, 300,30); 
}
};


var spheric = function(x,y,velocity, delay) {
    this.x = x;
    this.y = y;
    this.radius = 0;
    this.velocity = velocity;
    this.color = color(255, 60, 0);
    this.delayCount = 0;
    this.delay = delay;
    this.maxSize = 60;
    this.toBeDestroyed = false;
    this.draw = function() {
         stroke(this.color);
        fill(242, 234, 242,0);
         ellipse(this.x, this.y, this.radius*2, this.radius*2);
    };
    this.update = function() {
        if (this.delayCount < this.delay) {
            this.delayCount++;
        }
        else
        {
          this.radius += this.velocity;  
          if (this.radius>this.maxSize)
          {
              this.toBeDestroyed = true;
          }
        }
        if (this.radius > 200)
        {
            this.toBeDestroyed = true;
        }
        this.draw();
    };
};


var enemy = function (img, x,y,velocity,scale, mypoints) {
    this.c = y;
    this.x =x;
    this.y =y;
    this.points = mypoints;
    this.velocity = velocity;
    this.scale = scale;
    this.angle = 0;
    this.collisionWidth = 30;
    this.collisionOffsetY = 10;
    this.isDead = false;
    this.toBeDestroyed = false;
    this.image = img;
    this.deaccelerate = 0.9;
    this.draw = function() {
         //image(this.image, this.x, this.y, 100*this.scale,100*this.scale);
       //  pushMatrix();
         //scale(1,-1);
         image(this.image, this.x, this.y, 100*this.scale,100*this.scale);
          if (showCollision === true){
           stroke(255, 0, 0);
             fill(255, 0, 0,0);
               rect(this.x,this.collisionOffsetY + this.y,this.collisionWidth*this.scale,this.collisionWidth*this.scale);}
         //rotate(Math.PI);
      //   popMatrix();
    };
    this.update = function() {
        //var flip = -1;
       // if(this.toBeDestroyed === false)
        
           //console.replaceLine("hello");
        this.angle++;
        if (this.angle > 360) {this.angle = 0;}
        this.c = this.y + 20*Math.sin(this.angle*Math.PI/18*0.3);
        
        //else
        if (this.isDead === true) {
           // console.writeLine("hit");
          //  flip = -1;
            this.deaccelerate += 0.1;
            this.y +=this.deaccelerate;
        }
     
        this.x += this.velocity;
        this.draw();
       
    };
    
};

var spawnManager = {
    length:0,
    delay:50,
    delayCount:0,
    enemies:[],
    offsetX: 400,
    spawn : function() {
        if (this.delayCount < this.delay){
            this.delayCount++;
        }
        else 
        {
        var choice = math.randInt(0,100);
      //  var randX = math.randInt(1,3)*50;
        var randY = math.randInt(1,5)*20+100;
        var scale = 200;
        switch (true){
                case (choice > 0 && choice <= 50): this.enemies[this.length] = new enemy(images[0],this.offsetX,randY,-1,randY/scale, 10); break;
                case (choice > 50 && choice <= 75): this.enemies[this.length] = new enemy(images[0],this.offsetX,randY,-3,randY/scale, 20); this.enemies[this.length].collisionOffsetY = 33;break;
                case (choice > 75 && choice <= 100): this.enemies[this.length] = new enemy(images[0],this.offsetX,randY,-5,randY/scale, 100); this.enemies[this.length].collisionOffsetY = 40;break;
            }
       // this.length = this.enemies.length + 1;
        this.length++;
        this.delayCount=0;
        }
    },
     destroyOutOfBounds: function() {
        this.enemies = destroyOutOfBounds(this.enemies,-100,500,0,400);
        this.length= this.enemies.length;
    },
update:function() {
      this.spawn();
       this.destroyOutOfBounds();
           
       //    this.enemies.sort(function(a,b) {return (a.scale - b.scale);});
    for (var i = 0; i < this.enemies.length;i++)
    {
        this.enemies[i].update();
       // keepInbounds(enemies[i],0,400,0,400);
    }
        }

};


var bullet = function(destx, desty) {
    this.x =200;
    this.y = 400;
    this.angle = 0;
    this.velocity = 10;
    this.destX = destx;
    this.destY = desty;
    this.size = 60;
    this.dsize = 1.8;
    this.calcAngle = function (x1,y1,x2,y2) {
        var dir = 1;
        if (x1 > x2)
        {dir = 0;}
        else
        {dir = -180;}
        
      return Math.atan((y2-y1)/(x2-x1))*180/Math.PI+dir;
  };
    this.angle = this.calcAngle(destx,desty, this.x, this.y);
    this.update = function() 
    {
     this.x += this.velocity*Math.cos(this.angle*Math.PI/180);
     this.y += this.velocity*Math.sin(this.angle*Math.PI/180);
     this.size -= this. dsize;
     this.draw();
    };
  
    this.draw = function() {
        fill(255, 0, 0);
         ellipse(this.x,this.y, this.size, this.size);
    };
 
};

var bulletManager = {
    bullets:[],
    bulletCount:0,
    create: function() {
       
           this.bullets[this.bulletCount] = new bullet(mouseX, mouseY);
           this.bulletCount++;
       
    },
    update: function() {
           
          this.bullets = destroyOutOfBounds(this.bullets,0,400,0,400);
          this.bulletCount = this.bullets.length;
         //  message = this.bulletCount;
          for (var i = 0 ; i < this.bullets.length;i++)
          {
              this.bullets[i].update();
          }
         
    }
    
};

var collisionManager = {
    width:20,
    shockwave:[],
    update: function() {
        for (var i = 0; i < bulletManager.bullets.length; i++)
        {
            for (var j = 0; j < spawnManager.enemies.length; j++)
            {
               // drawBounds(spawnManager.enemies[j].x,spawnManager.enemies[j].y, spawnManager.enemies[j].x+spawnManager.enemies[j].scale*this.width, spawnManager.enemies[j].y+spawnManager.enemies[j].scale*this.width);
       
                if (inBounds(bulletManager.bullets[i], spawnManager.enemies[j].x, spawnManager.enemies[j].x + spawnManager.enemies[j].scale*spawnManager.enemies[j].collisionWidth, spawnManager.enemies[j].collisionOffsetY + spawnManager.enemies[j].y, spawnManager.enemies[j].collisionOffsetY + spawnManager.enemies[j].y + spawnManager.enemies[j].scale*spawnManager.enemies[j].collisionWidth))
                {
                  // console.writeLine("score");
                   // console.replaceLine("hello me");
                   if (spawnManager.enemies[j].isDead === false)
                   {
                    spawnManager.enemies[j].isDead = true;
                    spawnManager.enemies[j].toBeDestroyed = true;
                    bulletManager.bullets[i].toBeDestroyed = true;
                    score[0]+=spawnManager.enemies[j].points;
                        for (var k = 0 ; k < 3; k++)
                        {
                        this.shockwave[k] = new spheric(bulletManager.bullets[i].x, bulletManager.bullets[i].y, 3, k*5);
                        }
                   }
                }
            }
        } 
       // spawnManager.enemies = destroyFromList(spawnManager.enemies);
       // spawnManager.length = spawnManager.enemies.length;
             for (var i = 0 ; i < this.shockwave.length; i++)
                        {
                            this.shockwave[i].update();
                        }
        bulletManager.bullets = destroyFromList(bulletManager.bullets);
        bulletManager.bulletCount = bulletManager.bullets.length;
       this.shockwave = destroyFromList(this.shockwave);
     
    }
};

var shake = {
    delayCount: 0,
    angle : 0,
    startShake: true,
    reset: function () {
       this. delayCount = 0;
        this.startShake = true;
    },
    update : function (object,mag, period, delay) {
  //  var startShake = false;
    if (this.delayCount < delay)
    {
     this.delayCount++;
 //     message = this.delayCount;
    }
    else
    {
       this.startShake = false;
    }
    
   if (this.startShake === true)
   {
        this.angle++;
        if (this.angle > 360)
        {
        this.angle = 0;
        }
        
        for (var i = 0; i < object.length;i++)
        {
            object[i].y += mag*Math.sin(period*this.angle*Math.PI/180);
           // message = "fsdfs";
        }
      //  this.delayCount = 0;
    }   
    }  
};

var rapidFire = {
    isRapid: false,
    duration:0,
    durationCount:0,
    delay:10,
    delayCount:0,
    on: function (duration) {
        this.isRapid = true;
        this.duration = duration;
        this.durationCount = 0;
    },
    off: function() {
        this.isRapid = false;
    },
    update: function() {
        if (this.isRapid===true)
            {
                if (this.durationCount < this.duration)
                {
                    if (this.delayCount < this.delay)
                        {
                            this.delayCount++;
                        }
                    else
                        {
                            shake.reset();
                            bulletManager.create();
                            this.delayCount = 0;
                        }
                    this.durationCount++;
                }
            }
        
    }
        
};


var followMouse = {
    c:0,
    update: function() {
    stroke(0, 0, 0);
    fill(3, 3, 3,0);
    for (var i = 0; i < 3 ; i++)
    {
    ellipse(mouseX, this.c+mouseY,20+i*10,20+i*10);
    }
    line(mouseX,this.c+mouseY+30, mouseX, mouseY-30);
    line(mouseX-30, this.c+mouseY, mouseX+30, mouseY);
    }
};


var gameReset = function() {
};

var specialKeys = function (){
      if (letters.y)
        {
            if (gameWin === true)
            {
                gameWin = false;
                gameReset();            
            }
        }
};


function draw() {

 
   if (isPaused === false){
   
    background(200, 240, 255);
    collisionManager.update();
    spawnManager.update();
 //   for (var i =0;i < spawnManager.enemies.length;i++) {
    gameDuration.update();
    shake.update(spawnManager.enemies,3,20,20);
    rapidFire.update();
   
    followMouse.update();
     bulletManager.update();
    fill(255, 0, 0);
    stroke(255, 0, 0);
    gameDuration.draw();
    text(message, 100,40);
    text("SCORE: " + score[0], 100,20);
   }
   


};

function keyPressed() {

  keys[keyCode] = true;
  letters[key] = true;
};

function keyReleased() {
      keys[keyCode] = false; 
      letters[key] = false;
    
};

function mousePressed() {
    if (mouseButton === LEFT)
    {
        bulletManager.create();
       rapidFire.on(1000);
    }
};

function mouseReleased() {
    rapidFire.off();
};

