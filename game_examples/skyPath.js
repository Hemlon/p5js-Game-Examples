var bg;
showCollisions = false;
var fullscene = false;
var hero;
var images = [];
var viewport;
var anim = [];
var bgMusic;
var story = [];

function preload()
{
	bg = loadImage("pics/background.png");
	bgMusic = loadSound("music/Tricky Jumps");	
	npcMan = new npc();
	anim[0] = new animation("pics/main idle.png", 4, 16,16);
	anim[1] = new animation("pics/main idle left.png", 4,16,16);
	anim[2] = new animation("pics/main walking.png", 12,16,16);
	anim[3] = new animation("pics/main walking left.png", 12,16,16);
	anim[4] = new animation("pics/main jump.png", 13, 16,16);
	anim[5] = new animation("pics/main jump left.png", 13,16,16);
	anim[6] = new animation("pics/main running.png", 6,16,16);
	anim[7] = new animation("pics/main running left.png", 6,16,16);
	anim[8] = new animation("pics/main slide.png", 2,16,16);
	anim[9] = new animation("pics/main slide left.png", 2,16,16);
	images[0] = loadImage("pics/water.png");
	
	
};

function setup()
{
	if (fullscene)
		createCanvas(1250,630);
	else
		createCanvas(600,400);

	noSmooth();	
	bgCollisions.addBounds(new bound(310,415, 300,5));
	bgCollisions.addBounds(new bound(120,415,150,5));
	bgCollisions.addBounds(new bound(790,415,150,5));
	bgCollisions.addBounds(new bound(650,512,90,5));
	bgCollisions.addBounds(new bound(565,350, 30,5));
	bgCollisions.addBounds(new bound(230,225,250,5));
	bgCollisions.addBounds(new bound(435,290,120,5));
	bgCollisions.addBounds(new bound(750,320,250,5));
	bgCollisions.addBounds(new bound(610,285,100,5));
	bgCollisions.create();
	hero = new platformer(340,400,0);
	hero.image["idleRight"] = anim[0];
	hero.image["idleLeft"] = anim[1];
	hero.image["walkRight"] = anim[2];
	hero.image["walkLeft"] = anim[3];
	hero.image["jumpRight"] = anim[4];
	hero.image["jumpLeft"] = anim[5];
	hero.image["runRight"] = anim[6];
	hero.image["runLeft"] = anim[7];
	hero.image["slideRight"] = anim[8];
	hero.image["slideLeft"] = anim[9];		
	viewport = new viewCam(0, 0);
	drawMousePos.setView(viewport);
	bgMusic.loop();
	bgMusic.play();
	
	var storyHeight = 200;
		story[0] = new animatedText("The great winds will arrive soon...", 0,30,storyHeight + 50,5);
		story[1] = new animatedText("we must round up the people of Atlon", 0,40,storyHeight + 70,5);	
		story[2] = new animatedText("find the key and take the portal", 0,30,storyHeight + 90,5);
		story[2].setDelay(100);
		story[3] = new animatedText("and hurry...", 0,100,storyHeight + 110,5);		
		story[4] = new animatedText("we do not have much time left...", 0,20,storyHeight + 150,5);
		story[4].setDelay(100);
		animateAllText.reset();
};

var t = 0;
var rr = [];
var pp = [];
var bgControl= new delayControl(40);
var drawit = false;
var dy = 0;

var drawMousePos = {
	view: new viewCam(),
	draw: function () {text(Math.round(mouseX+this.view.x,0) + ", " + Math.round(mouseY+this.view.x,0), mouseX+this.view.x,mouseY+this.view.y);},
	setView : function(view) {
		this.view = view;
	}
};

function draw()
{	
	checkInput();	
	if(!fullscene)
		motion.follow(viewport, hero.x-150-hero.size, hero.y-200,2);

	translate(-viewport.x, -viewport.y);
		image(bg, 0,0);
		bgControl.run();
		if (bgControl.alert)
			{
				drawit = !drawit;
				bgControl.reset();
			}
		if(drawit)
		image(images[0], 382, 274);

		if (mouseButton == LEFT){
			hero.x = mouseX+viewport.x;
			hero.y = mouseY+viewport.y;
			hero.velocityY = 0;
			mouseButton = 0;
		}

		bgCollisions.draw();		
		hero.draw();
		
		stroke(255,255,255,170*Math.sin(t)-100);
		strokeWeight(30);
		
		t=t+0.03;
		if (t > 2*Math.PI)
			{
			t=0;
				for(var i = 0 ; i < 8 ;i++)
				{
				rr[i] = math.randInt(300,500);
				pp[i] = math.randInt(300,500);
				}
			}

		noFill();
		bezier(0, rr[0]+rr[1]*Math.sin(t), 500, rr[2]-rr[3]*Math.sin(t-Math.PI/3), 900, rr[4]-rr[5]*Math.sin(-t+Math.PI/4), 1350,  rr[6]+rr[7]*Math.cos(t));
		bezier(0, pp[0]+pp[1]*Math.sin(t), 300, pp[2]-pp[3]*Math.sin(t-Math.PI/3), 700, pp[4]-pp[5]*Math.sin(-t+Math.PI/4), 1250,  pp[6]+pp[7]*Math.sin(t));
		strokeWeight(1);
		npcMan.update();
		fill(0,0,0);
		drawMousePos.draw();
	
		
	translate(viewport.x, viewport.y);
	
		stroke('black');
		fill('white');
		animateAllText.run(story);

};


var npc = function() {
	
	this.bound = new bound(520, 250,20,40);
	this.talk = true;
	this.delay = new delayControl(100);
	this.speak = [];
	this.speak[0] = "why are you still here?";
	this.speak[1] = "you should hurry!";
	this.dialog = new dialog();
	this.currentSpeak = 0;
	this.update = function() {
		
		drawBound(this.bound);
		if (this.talk)
		{
			
			fill(0,0,0);
			noStroke();
			this.dialog.run(this.speak, this.bound.x, this.bound.y);
			if (this.dialog.isFinished)
			{
				console.log("npc speaking");
					this.dialog.reset();
					this.talk = false;
			}
		}
	}
}


var checkInput = function (){	
	if (keys[RIGHT_ARROW])
	{
		hero.angle = 0;
        hero.accelerate();
	}
	if (keys[LEFT_ARROW])
	{
		hero.angle = 180;
        hero.accelerate();
	}
	if(keys[UP_ARROW])
	{
		hero.jump();
	}
		if(keys[65])
	{
		console.log("DSD");
	     if (objectCollide(hero.bound, npcMan.bound))
			 npcMan.talk = true;
	}
};

var keyPressed = function()
{
	keys[keyCode] = true;
}

var keyReleased = function()
{
	keys[keyCode] = false;
}


var platformer = function (x,y,angle) {
    this.name = "P" + (Math.round(Math.random()*10000,0)).toString();		
    this.x = x;
    this.y = y;
    this.animSpeed = 20;
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
    this.damping = 0.95;
    this.jumpStrength = 5;
    this.animationSeq = "idleRight";
    this.depth = 0;
    this.bound = new bound(this.x, this.y, this.size, this.size);
    this.image = {};
    this.isJumping = false;
    this.canJump = false;
    this.isInAir = true;
    this.visible = true;
	this.hpMax = 100;
	this.hpCurrent = 100;
	this.hpAnim = 10;
	this.mpMax = 50;
	this.mpCurrent = 50;
	this.mpAnim = 0;
	this.mpRate = 0.1;
	this.hpRate = 0.4;


    this.draw = function() {
    this.x += this.velocityX;
   	this.y += this.velocityY;
    this.velocityX *= this.damping;


       	for (var i =0; i < bgCollisions.bounds.length;i++)
       	{
       	var c = bgCollisions.bounds[i];
    
		if (!inBounds(this, c.x, c.x+c.width, c.y, c.y + c.height + this.velocityY))
        		{   
          	 		this.velocityY += this.gravity; 	
        		}
        		else //touch the ground
        		{ 
          			this.y = c.y;
           			this.canJump = true;
           			this.velocityY = 0;
					this.isInAir = false;
            		if(this.isJumping === true)
           			{
                			this.y -= 2;
                			this.velocityY = -this.jumpStrength;
							this.isInAir = true;
							this.image["jumpRight"].currentFrame =0 ;
							this.image["jumpLeft"].currentFrame = 0;
           			}
       	 	} 
        	}
        	var c = bgCollisions.base;
        	for(var i= 0; i < c.length;i++){
        	if (inBounds(this, c[i].x, c[i].x+c[i].width, c[i].y, c[i].y+c[i].height))
              	{
					this.velocityY = 0.5;
                	this.canJump = false;
                	this.velocityY += this.gravity;
                }   
       }              
        c = bgCollisions.side;
        for (var i = 0 ;  i< c.length;i++) 
 	{
       	 if (inBounds(this, c[i].x, c[i].x+c[i].width, c[i].y, c[i].y+c[i].height))
                {                  
                	this.velocityX = 0;
              		this.x = c[i].x + c[i].width;
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

 
       this.bound.x = this.x;
       this.bound.y = this.y-this.size;

		if (this.angle == 0 && !this.isInAir)
		{		
			this.animationSeq = "idleRight";
			this.animSpeed = 10;
			if (Math.abs(this.velocityX) > 0.05)
			{
				this.animationSeq = "walkRight";
				this.animSpeed = 10;
				if(keys[RIGHT_ARROW] && Math.abs(this.velocityX) > 3)
				{	
					this.animationSeq = "runRight";
					this.animSpeed = 3;
				}
				
				if(!keys[RIGHT_ARROW] && Math.abs(this.velocityX) > 1)
					this.animationSeq = "slideRight"	
			}

		}

	if (this.angle == 180 && !this.isInAir)
		{		
			this.animationSeq = "idleLeft";
			this.animSpeed = 10;

			if (Math.abs(this.velocityX) > 0.05)
			{
				this.animationSeq = "walkLeft";
				this.animSpeed = 10;

				if(keys[LEFT_ARROW] && Math.abs(this.velocityX) > 3)
				{	
					this.animationSeq = "runLeft";
					this.animSpeed = 3;
				}
				
				if(!keys[LEFT_ARROW] && Math.abs(this.velocityX) > 1)
					this.animationSeq = "slideLeft"	
			}

		}


		if (this.isInAir)
		{
				if (this.angle == 0)
					this.animationSeq = "jumpRight";
				else
					this.animationSeq = "jumpLeft";
				this.animSpeed = 8;
		}

		if( this.hpAnim < this.hpCurrent)
		this.hpAnim = math.between(this.hpAnim + this.hpRate, 0, this.hpCurrent);

		if( this.mpAnim < this.mpCurrent)
		this.mpAnim = math.between(this.mpAnim + this.mpRate, 0, this.mpCurrent);
		
		this.isJumping = false;

      	 if (showCollisions) 
	{
     		stroke(255, 0, 0);
     		rect(this.bound.x, this.bound.y, this.bound.width, this.bound.height);
	}

	if(this.visible)
       	 {	
			this.image[this.animationSeq].setSize(this.size, this.size);
			this.image[this.animationSeq].animate(this.x,this.y-this.size,this.animSpeed);		
			hbar(this,6,-45,20,5,this.hpCurrent, this.hpAnim, this.hpMax);
			mbar(this,6,-40,20,5,this.mpCurrent, this.mpAnim, this.mpMax);		
      	 }
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

};


function hbar(obj, hbarxoff, hbaryoff, hbarlen, hbarwid,  current, anim, max)
{
			fill(0,0,0);
			rect(obj.x + hbarxoff, obj.y + hbaryoff, hbarlen, hbarwid);
			fill(255,200,200);
			rect(obj.x + hbarxoff, obj.y + hbaryoff, hbarlen*current/max, hbarwid);
			fill(255, 0,0);
			rect(obj.x + hbarxoff, obj.y + hbaryoff, hbarlen*anim/max, hbarwid);
}

function mbar(obj, hbarxoff, hbaryoff, hbarlen, hbarwid,  current, anim, max)
{
			fill(0,0,0);
			rect(obj.x + hbarxoff, obj.y + hbaryoff, hbarlen, hbarwid);
			fill(200,200,255);
			rect(obj.x + hbarxoff, obj.y + hbaryoff, hbarlen*current/max, hbarwid);
			fill(0, 0,255);
			rect(obj.x + hbarxoff, obj.y + hbaryoff, hbarlen*anim/max, hbarwid);
}
