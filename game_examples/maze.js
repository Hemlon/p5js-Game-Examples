showCollisions = false;
var players = [];
var images = {};
var bgImages = [];
var roomWidth = 13;
var roomHeight = 12;
var objectWidth = 30;
var isPaused = false;
var currencies =  [];
var bg;
var message = "";
var gameWin = true;
var bgm;
var sounds = {};

var delCashFlag = false;
var roomArrangement = [
                    1,0,1,1,1,1,1,1,1,1,1,0,1,
                    1,0,0,0,0,0,0,0,0,0,1,0,1,
                    1,0,1,1,1,1,1,1,1,0,1,0,1,
                    0,0,0,0,0,0,1,0,1,1,1,0,0,
                    1,0,1,1,1,0,1,0,0,0,0,0,1,
                    1,0,1,0,0,0,1,1,0,1,1,1,1,
                    1,1,0,0,1,0,1,0,0,0,0,0,1,
                    1,0,0,1,1,0,1,1,1,1,1,0,1,
                    1,0,1,0,0,0,0,0,1,0,0,0,1,
                    1,0,1,1,1,1,1,0,1,0,1,1,1,
                    1,0,0,0,1,0,0,0,0,0,0,0,1,
                    1,0,1,1,1,1,1,1,1,1,1,0,1
                    ];

var roomCollisions = roomArrangement.splice();


function preload()
{
    bgm = loadSound("music/chicken");
    sounds["ping"] = loadSound("music/up");
	images["boy"] = loadImage("pics/boy.png");
	images["gem"] = loadImage("pics/gem.png");
	bgImages[0] = loadImage("pics/blank.png");
	bgImages[1] = loadImage("pics/wall.png");
	bg = new mazeBgObjects(bgImages, roomArrangement, roomWidth, roomHeight, objectWidth);
};


function setup()
{	
	createCanvas(400,400);
	background(255,255,255);
    mazeBgCollisions.create(objectWidth);
	laySomeCash.start();
	gameDuration.set(60,100);
	players[0] = new  mazePlayer(30,50,0);
	players[1] = new  mazePlayer(330,50,0);
	players[0].score = 0;
	players[1].score = 0;
    bgm.play();
};


var delFromDrawList = function (drawList, list){
    for (var i = 0;  i < list.length ; i++)
    {
        if (list[i].toBeDestroyed === true)
        {
           delete drawList[list[i].name];
        }
    }
    delCashFlag = false;
    return drawList;
};


var currency = function(x,y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.toBeDestroyed = false;
    this.depth = 0;
    this.name = "C" + (Math.round(Math.random()*100000,0)).toString();
    this.img = images["gem"]; 
    this.draw  = function() {
        stroke(255, 0, 0);
        fill(255, 0, 0,0);
        if (showCollisions){
        rect(this.x, this.y, this.size, this.size);}
        image(this.img, this.x, this.y-this.size/2, this.size, 1.5*this.size);
    };
};


var laySomeCash = {
    start: function() {     
        for (var i = 0 ; i < 11; i++)
        {
            for(var j = 0 ; j < 11 ; j++)
            {
                 currencies.push(new currency(30*i+30,j*30+60,30));
            }
        }
        
        for (var i = 0 ; i < currencies.length; i++)
        {
             drawManager.drawList[currencies[i].name] = currencies[i];
        }   
    }
};

var mazePlayer = function (x,y,angle) {
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
    this.damping = 0.8;
    this.jumpStrength = -4;
    this.depth = 0;
    this.score = 0;
    this.bound = new bound(this.x, this.y, this.size, this.size);
    this.img = images["boy"];
    this.isCollide = false;
    
    this.update = function() {

       this.x += this.velocityX;
       this.y += this.velocityY;

       this.velocityX *= this.damping;
       this.velocityY *= this.damping;

       var c = mazeBgCollisions.bounds;
       for (var i =0; i < c.length;i++)
       {
        if (inBounds(this, c[i].x, c[i].x+c[i].width, c[i].y-this.size, c[i].y + c[i].height))
            {
                this.velocityY = 0;
                this.y = c[i].y- this.size;
            }
       }
       
        var c = mazeBgCollisions.base;
        for(var i= 0; i < c.length;i++){
        if (inBounds(this, c[i].x, c[i].x+c[i].width, c[i].y, c[i].y+c[i].height))
                {
                this.velocityY = 0;
                this.y = c[i].y + c[i].height;
                }   
        }
                
        c = mazeBgCollisions.side;
        for (var i = 0 ;  i< c.length;i++) {
                if (inBounds(this, c[i].x, c[i].x+c[i].width, c[i].y, c[i].y+c[i].height))
                {
                this.velocityX = 0;
                this.x = c[i].x + c[i].width;
                }   
                }
                
        c = mazeBgCollisions.leftSide;
        for (var i = 0 ;  i< c.length;i++) {
        if (inBounds(this, c[i].x, c[i].x+c[i].width, c[i].y, c[i].y+c[i].height))
        {
        this.velocityX = 0;
        this.x = c[i].x;
        }   
        }
       
       for (var i = 0; i < currencies.length; i++)
       {
           if (collide(this.bound, currencies[i]))
           {
                delCashFlag = true;
               currencies[i].toBeDestroyed = true;
               this.score++;
               sounds["ping"].play();
           }
       }

             this.bound.x = this.x-10;
             this.bound.y = this.y;

     this.depth = this.y;
     drawManager.drawList[this.name] = this;
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
    this.accelerate = function() 
    { if(!this.isDead){this.setVelocity(this.getVelocity() + this.accel);}};
    this.deaccelerate= function()
    { if(!this.isDead){this.setVelocity(this.getVelocity() - this.accel);}};

    this.draw= function() {
   	 if (showCollisions) {
    	 this.depth = this.y;
     		stroke(255, 0, 0);
     rect(this.bound.x, this.bound.y, this.bound.width, this.bound.height);}
     image(this.img, this.x, this.y-20, this.size,this.size*2);
};
   
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
            players[0].angle = 270;
            players[0].accelerate();
        }
        if (keys[DOWN_ARROW])
        {
            players[0].angle = 90;
            players[0].accelerate();          
        }

        if (letters.a)
        {
        players[1].angle = 180;
        players[1].accelerate();
        }
        if (letters.d)
        {
        players[1].angle = 0;
        players[1].accelerate();
        }
        if (letters.w)
        {
        players[1].angle = 270;
        players[1].accelerate();
        }
        if (letters.s)
        {
        players[1].angle = 90;
        players[1].accelerate(); 
        }
};

var specialKeys = function (){
    if(letters.y)
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
    if(letters.c)
    {
        showCollisions = !showCollisions;
    }
};


var endGame = function(){
	gameWin = true;
	isPaused = true;
};

draw = function() {
    specialKeys();
    if (isPaused === false)
   {
    background(145, 239, 255);

    drawManager.draw();

    mazeBgCollisions.draw();
    
	checkMazeBgCollisions(mazePlayer, mazeBgCollisions);
	
   if (delCashFlag == true) {
    	drawManager.drawList = delFromDrawList(drawManager.drawList, currencies);
    	currencies = destroyFromList(currencies); 
    }
    
    for (var i = 0 ; i < players.length; i++)
    {
   	 checkInput();
  	 players[i].update();
     keepInbounds(players[i],15,400,0,400);
   	 stroke(255, 0, 0);
   	 fill(255, 0, 0);
   	 text(players[i].score, 100+100*i , 380);
  }

     gameDuration.update(endGame);
     gameDuration.draw("arial", 15, "blue", 10,20);
     text(message, 100,300);
    }

};


keyPressed = function() {
  keys[keyCode] = true;
  letters[key] = true;
};
keyReleased = function() {
      keys[keyCode] = false; 
      letters[key] = false;
    
};

