var images = {};
var players = [];
var message = "";
var gameWin = true;
var roomWidth = 13;
var roomHeight = 12;
var objectWidth = 30;
var isPaused = false;
var currencies=  [];
var bg;
var bgm;
var sound = {};

var imageAssets = [];

var roomArrangement = [
                    0,0,0,0,0,0,0,0,0,0,0,0,0,
                    1,1,1,1,1,1,1,1,1,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,1,1,1,1,1,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,
                    1,1,1,1,1,1,1,1,0,0,0,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,
                    0,0,0,0,1,1,1,1,1,1,1,0,0,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,
                    1,1,1,1,1,1,1,0,0,0,1,1,1,
                    0,0,0,0,0,0,0,0,0,0,0,0,0,
                    1,1,1,1,1,1,1,1,1,1,1,1,1
                    ];

var roomCollisions = roomArrangement.splice();   


function preload() {
        bgm = loadSound("music/mario");
        sound["jump"] = loadSound("music/jump");
        sound["ping"] = loadSound("music/up");
	images["boy"] = loadImage("pics/boy.png");
	images["gem"] = loadImage("pics/gem.png");
	images["wood"] = loadImage("pics/woodblock.png");
	images["blank"] = loadImage("pics/blank.png");
	imageAssets[0] = images["blank"]; 
	imageAssets[1] = images["wood"]; 
};

function setup() {
	createCanvas(400,400);	
    	gameDuration.set(60,100);

    	players[0] = new player(100,90,0);
    	players[1] = new player(300,300,180);
    	players[0].score = 0;
    	players[1].score = 0;

	 bg = new bgObjects(imageAssets, roomArrangement, roomWidth, roomHeight, objectWidth);
	 bgCollisions.addBounds(new bound(0,50,270,8));
        
	 bgCollisions.addBounds(new bound(240,110,150,8));
        
	 bgCollisions.addBounds(new bound(0,170,240,8));
        
	 bgCollisions.addBounds(new bound(120,230,210,8));
        
	 bgCollisions.addBounds(new bound(0,290,210,8));
        
	 bgCollisions.addBounds(new bound(300,290,90,8));
        
	 bgCollisions.addBounds(new bound(0,350,390,8));
	 bgCollisions.create();
         bgm.play();
          sound["jump"].setVolume(0.5);
};

var gameReset = function() {
   	players[0] = new player(100,100,0);
   	players[1] = new player(300,300,180);
   	players[1].color =  color(28, 125, 199);
};

var checkInput = function () {
        if (keys[RIGHT_ARROW]) 
        {
            players[0].angle = 0;
            players[0].accelerate();
        }
        if (keys[LEFT_ARROW])
        {
            players[0].angle = 180;
            players[0].accelerate();
        }
        if (keys[UP_ARROW])
        {
            players[0].jump();
         
        }
        if (keys[65])
        {
        players[1].angle = 180;
        players[1].accelerate();
        }
        if (keys[68])
        {
        players[1].angle = 0;
        players[1].accelerate();
        }
        if (keys[87])
        {
        players[1].jump();
        
        }

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
    if(letters.z)
    {
        isPaused = true;
    }
    if(letters.x)
    {
        isPaused = false;
    }
};

var curDel = new delayObject(100);

var stopGame = function(){
gameWin= true; isPaused = true;};

function draw() {
    specialKeys();
    if (isPaused === false)
    {
    background(145, 239, 255);
    bg.draw();
    bgCollisions.draw();
    currencies = destroyFromList(currencies);
    spawnObjects(currencies, currency, 30, 10,10, curDel);

    for (var i = 0; i < currencies.length; i++)
    {
        currencies[i].draw();
    }

    for (var i = 0 ; i < players.length; i++)
    {
    checkInput();
    players[i].update();
    keepInbounds(players[i],15,400,0,400);
    players[i].draw();   stroke(255, 0, 0);
    fill(255, 0, 0);
    text(players[i].score, 100+100*i , 380);
    }
     gameDuration.update(stopGame);
     gameDuration.draw("arial", 15, "blue", 10,20);
    }
};

var currency = function(x,y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.toBeDestroyed = false;
    this.image = images["gem"]; //getImage("cute/GemOrange");
    this.draw  = function() {
        stroke(255, 0, 0);
        fill(255, 0, 0,0);
        if (showCollisions){
        rect(this.x, this.y, this.size, this.size);}
        image(this.image, this.x, this.y-this.size/2, this.size, 1.5*this.size);
    };
};

var spawnCurrency = {
    delayCount:0,
    delay:0,
    currencyCount: 0,
    create: function(delay) {
        this.delay = delay;
    },
    update: function() {
        if (this.delayCount < this.delay)
        {
            this.delayCount++;
        }

        else {
        var x = math.randInt(0,roomWidth)*objectWidth;
        var y = math.randInt(0,roomHeight)*objectWidth;
        currencies[this.currencyCount] = new currency(x,y,objectWidth);
          this.delayCount = 0;
        }
    } 
};



var player = function (x,y,angle) {
    this.name = "P" + (Math.round(Math.random()*10000,0)).toString();		
    this.x = x;
    this.y = y;
    this.isDead = false;
    this.angle = angle;
    this.velocity = 0;
    this.maxVelocity = 4;
    this.size = 30;
    this.velocityX=0;
    this.velocityY=0;
    this.accel = 0.2;
    this.score = 0;
    this.gravity =0.02;
    this.isGravity = true;
    this.damping = 0.9;
    this.jumpStrength = -4;
    this.score = 0;
    this.depth = 0;
    this.bound = new bound(this.x, this.y, this.size, this.size);
    this.image = images["boy"];
    this.isJumping = false;
    this.canJump = false;
    this.isInAir = true;
    this.isJumpSound = false;

    this.update = function() {

    	 this.x += this.velocityX;
   	 this.y += this.velocityY;
    	 this.velocityX *= this.damping;
   	 this.isInAir = 0;

       for (var i =0; i < bgCollisions.bounds.length;i++)
       {
        var c = bgCollisions.bounds[i];

        this.isInAir = 0;

       	 if (!inBounds(this, c.x, c.x+c.width, c.y, c.y + c.height + this.velocityY))
        	{   
          	 	this.velocityY += this.gravity; 	
        	}
        	else //touch the ground
        	{ 
          		 this.y = c.y;
           		 this.canJump = true;
           		 this.velocityY = 0;
                            this.isJumpSound= false;
            		if(this.isJumping === true)
           		{
                		this.y -= 2;
                		this.velocityY = -4.5;
                                if(!this.isJumpSound)
                                        {
                                       
                                        sound["jump"].play();
                                        this.isJumpSound = true;
                                        }
                                   
           		}
       	 } 
     

        }

        var c = bgCollisions.base;
        for(var i= 0; i < c.length;i++){
        if (inBounds(this, c[i].x, c[i].x+c[i].width, c[i].y, c[i].y+c[i].height))
              	{
               this.velocityY = 0;
               	// this.isJumping = false;
                this.canJump = false;
                this.velocityY += this.gravity;
                }   
       }
                
        c = bgCollisions.side;
        for (var i = 0 ;  i< c.length;i++) {
        if (inBounds(this, c[i].x, c[i].x+c[i].width, c[i].y, c[i].y+c[i].height))
                {                  
                	this.velocityX = 0;
              		this.x = c[i].x + c[i].width;
               	// this.isJumping = false;
               	this.canJump = false;
                	this.velocityY += this.gravity;
                }   
       }
                
       c = bgCollisions.leftSide;
       for (var i = 0 ;  i< c.length;i++) {
       if (inBounds(this, c[i].x, c[i].x+c[i].width, c[i].y, c[i].y+c[i].height))
                {                  
                this.velocityX = 0;
                this.x = c[i].x;
                this.canJump = false;
                this.velocityY += this.gravity;
                }   
       }
       
       this.isJumping = false;
  
       for (var i = 0; i < currencies.length; i++)
       {
           if (collide(this.bound, currencies[i])===true)
           {
               currencies[i].toBeDestroyed = true;
               this.score++;
               sound["ping"].play();
           }
       }

        this.bound.x = this.x-10;
        this.bound.y = this.y-30;
    };
      
    this.jump = function() {
        if(this.canJump === true){
        this.isJumping = true;}
    };

    this.resolveVelocity=function() {
    	this.velocityX = math.between(this.velocityX + this.velocity*Math.cos(this.angle*Math.PI/180), -this.maxVelocity, this.maxVelocity);
    	this.velocityY = math.between(this.velocityY + this.velocity*Math.sin(this.angle*Math.PI/180), -this.maxVelocity, this.maxVelocity);
    	this.velocity = 0;
     };

    this.setVelocity= function(value) {
    	this.velocity = value;
    	this.resolveVelocity();
     };

    this.getVelocity = function() {return this.velocity;};
    this.accelerate = function()  { if(!this.isDead){this.setVelocity(this.getVelocity() + this.accel);}};
    this.deaccelerate= function() { if(!this.isDead){this.setVelocity(this.getVelocity() - this.accel);}};

    this.draw= function() {
    	if (showCollisions) {
     		stroke(255, 0, 0);
     		fill(0,4,0);//fill(this.color);
     		rect(this.bound.x, this.bound.y, this.bound.width, this.bound.height);
	}
    		image(this.image, this.x-10, this.y-50, this.size,this.size*2);
     };

 
};


keyPressed = function() {
  	keys[keyCode] = true;
  	letters[key] = true;
};

keyReleased = function() {
     	keys[keyCode] = false; 
      	letters[key] = false; 
};