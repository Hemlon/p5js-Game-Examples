
var players = [];
var score = [];
var message = "";
var gameWin = true;
var bgMusic;
var images = [];
var sounds = {};

function preload()
{
    sounds["shoot"] = loadSound("music/shoot");
	bgMusic = loadSound("music/starfighter");	
	images[0] = loadImage("pics/ship2.png");
}

function setup()
{
	createCanvas(650, 650);  // set size of canvas
	// add your code here ...
	background(255, 0, 0);
	   starManager.spawn(100);
   	 players[0] = new ship(images[0],100,100,0);
    	players[1] = new ship(images[0],300,300,180);
    	players[1].color = color(28, 125, 199);
    	score[0] = 0;
    	score[1] = 0;
	bgMusic.loop();
	bgMusic.play();
}

var projectile = function() {
    this.x = 0;
    this.y = 0;
    this.angle = 0;
    this.velocity = 3;
    this.size = 5;
    this.update = function() {
        this.x += this.velocity*Math.cos(this.angle*Math.PI/180);
        this.y += this.velocity*Math.sin(this.angle*Math.PI/180);
    };
    this.draw = function() {
        ellipse(this.x, this.y, this.size,this.size);
    };
};



var ship = function (img,x,y,angle) {
    this.x = x;
    this.y = y;
    this.isDead = false;
    this.shootDelayCount = 0;
    this.shootDelay = 30;
    this.angle = angle;
    this.velocity = 0;
    this.maxVelocity = 1;
    this.projectiles = [];
    this.fragments = [];
    this.size =20;
    this.velocityX=0;
    this.velocityY=0;
    this.accel = 0.05;
    this.turnRate = 4;
    this.score = 0;
    this.color = color(255, 0, 0);
    this.spherics = [];
    this.img = img;

    this.update = function() {

      this.x += this.velocityX;
      this.y += this.velocityY;

       for (var i = 0; i < this.projectiles.length; i++)
       {
        this.projectiles[i].update();
       }
       for (var i = 0; i < this.fragments.length; i++)
       {
        this.fragments[i].update();  
       }
       for (var i = 0; i < this.spherics.length;i++)
       {
        this.spherics[i].update();
       }
    
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
    this.accelerate = function() { if(!this.isDead){this.setVelocity(this.getVelocity() + this.accel);}};
    this.deaccelerate= function(){ if(!this.isDead){this.setVelocity(this.getVelocity() - this.accel);}};
    this.turnLeft= function() { if (!this.isDead){this.angle -= this.turnRate;}};
    this.turnRight= function() { if (!this.isDead){this.angle += this.turnRate;}};

    this.shoot= function() {
    if (gameWin === false) {
    if (this.isDead === false){
        if (this.shootDelayCount < this.shootDelay){
        this.shootDelayCount++;
    }
        else {
        sounds["shoot"].play();
    var bullet = new projectile();
    bullet.x = this.x+this.size/2;
    bullet.y = this.y+this.size/2;
    bullet.angle = this.angle+25;
    this.projectiles[this.projectiles.length] = bullet;
    this.shootDelayCount = 0;}
    	}
    } 
};
//applyMatrix(Math.cos(angle), Math.sin(angle), -Math.sin(angle),Math.cos(angle),0,0);
    this.draw= function() {

     fill(this.color);
     //drawTriangle(this.x,this.y,this.angle, this.size);
	
	var t = 90;
	var angle = this.angle*Math.PI/180;
     if (!this.isDead){
	translate(this.x+this.size/2, this.y+this.size/2);
	rotate(angle+t);
	translate(-this.x-this.size/2, -this.y-this.size/2);
	image(this.img, this.x, this.y,  this.size, this.size);
	translate(this.x+this.size/2, this.y+this.size/2);
	rotate(-(angle+t));
	translate(-this.x-this.size/2, -this.y-this.size/2);}
	
     for (var i = 0; i < this.projectiles.length; i++)
     {
        this.projectiles[i].draw();
     }
     for (var i = 0; i < this.fragments.length; i++)
     {
       this.fragments[i].draw();
     }
     for (var i = 0; i < this.spherics.length; i++)
     {
         this.spherics[i].draw();
     }

};


 this.explode = function() {
        var fragCount = 20;
        for (var i = 0; i < fragCount; i++){
        var fragment = new projectile();
        fragment.x = this.x;
        fragment.y = this.y;
        fragment.angle = i*360/fragCount;
        this.fragments[i] = fragment;
        }
        var sphericCount = 3;
        for (var i = 0; i < sphericCount; i++){
            var spherical = new spheric();
            spherical.x = this.x;
            spherical.y = this.y;
            spherical.delay = i * 20+ 20;
            this.spherics[i] = spherical;
        }
            
    };
    
};


var titleScreen = {
    draw: function() {
        if (gameWin === true)
        {
        textSize(20);
        fill(178, 207, 187);
        text("STAR FIGHTERS", 140,160);
        text("press Y to BEGIN", 130,190);
        textSize(12);
        fill(255, 0, 0);
        text("Red Fighter", 45,50); 
        text("Move: Arrow keys", 45,65);
        text("Shoot: Enter", 45,80);
        fill(60, 96, 214);
        text("Blue Fighter", 310,300);
        text("Move: ASDF", 310,315);
        text("Shoot: Q", 310,330);  
        }
    }
};


var star = function(x,y, color, size) {
    this.x=x;
    this.y=y;
    this.color = color;
    this.size = size;
    this.dsize = 3;
    this.angle = 0;
    this.draw = function() {
         fill(this.color, this.color.r, this.color.b, 1);
         ellipse(this.x, this.y, this.size, this.size);
         ellipse(this.x, this.y, this.size, this.size);
    };
};

var starManager = {
    stars:[],
    starMax:0,
    spawn: function(starMax) {
        this.starMax = starMax;
        for(var i = 0; i < this.starMax;i++)
        {
            var randx = math.randInt(0,400);
            var randy = math.randInt(0,400);
            var size = math.randInt(2,5);
            var colorgb = math.randInt(100,255);
            var mystar = new star(randx, randy, color(200,colorgb,colorgb), size);
            this.stars[i] = mystar;
        }
    },
    draw: function() {
        for(var i = 0; i < this.stars.length;i++)
        {
            this.stars[i].draw();
        }
    },
    
    update: function() {
        
        for(var i =0; i < this.stars.length; i++)
        {
        this.stars[i].angle++;
        if(this.stars[i].angle < Math.PI){
            this.stars[i].angle = 0;
            }
        
        this.stars[i].size += this.stars[i].dsize*Math.sin(this.stars[i].angle);
        this.draw();
        }
        
    }  
};

var gameReset = function() {
   players[0] = new ship(images[0],100,100,0);
   players[1] = new ship(images[0],300,300,180);
   players[1].color =  color(28, 125, 199);
};

var checkInput = function () {
        if (keys[RIGHT_ARROW]) 
        {
        players[0].turnRight();
        }
        if (keys[LEFT_ARROW])
        {
        players[0].turnLeft();
        }
        if (keys[UP_ARROW])
        {
         players[0].accelerate();
        }
        if (keys[DOWN_ARROW]){
       players[0].deaccelerate();
        }
        if (keys[ENTER])
        {
        players[0].shoot();
        }
        if (keys[65])
        {
        players[1].turnLeft();
        }
        if (keys[68])
        {
          players[1].turnRight();
        }
        if (keys[87])
        {
          players[1].accelerate();
        }
        if (keys[83])
        {
            players[1].deaccelerate();
        }
        if (keys[81])
        {
            players[1].shoot();  
        }
};

var specialKeys = function (){
      if (keys[89])
        {
            if (gameWin === true)
            {
                gameWin = false;
                gameReset();
            }
        }
};

function draw() {
  //  
    specialKeys();
    background(0, 0, 0);
	scale(1.5);
   starManager.draw();
    titleScreen.draw();

scale(1/1.5);

    for (var i = 0 ; i < players.length; i++)
    {
    checkInput();
    players[i].update();
    keepInbounds(players[i],0,400,0,400);
    players[i].projectiles = destroyOutOfBounds(players[i].projectiles,0,400,0,400);
    players[i].spherics = destroyFromList(players[i].spherics);
    for (var j = 0; j < players[i].projectiles.length;j++)
    {
        for (var k = 0; k < players.length;k++)
        {
          if (inBounds(players[i].projectiles[j], players[k].x-5,players[k].x+5, players[k].y -5, players[k].y + 5))
          {
              if (i !== k && gameWin === false)
              {
              gameWin = true;
              score[i]++;
              players[k].size = 0;
              players[k].isDead = true;
              players[k].explode();
              }
          }
        }
   }
     //  message = players[0].velocityX  + " " + players[0].velocityY;
	scale(1.5);
    players[i].draw();
	 scale(1/1.5);
    text(score[i],100+200*i,20);
  // 
    }
    
    text(message, 100,40);
};

keyPressed = function() {
	keys[keyCode] = true;
};

keyTyped = function()
{	
	
	
};

keyReleased = function() {
	keys[keyCode] = false;
};
