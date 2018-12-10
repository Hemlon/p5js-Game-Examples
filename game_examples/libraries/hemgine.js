var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
        Mouse = Matter.Mouse,
	Body = Matter.Body,
	MouseConstraint = Matter.MouseConstraint;
	Events = Matter.Events;

var keys = {};
var letters = {};
var mouseClicked = {};
var showCollisions = false;

var delayObject = function(delay)
{
	this.delay = delay;
	this.delayCount =0;
};


var genID = function(startingLetter)
{
              return startingLetter + (Math.round(Math.random()*10000,0)).toString();
};


var viewCam= function(x,y) {
	this.x = x;
	this.y = y;
};

var math = {
    upper: function(value, limit) { 
        if(value > limit) {
            return limit;      
        }
        else {
        return value;
        }
    },

    lower: function(value, limit) {
        if (value < limit) {
            return limit;
        }
        else {
            return value;
        }
    },

    between: function (value, lowlimit, upplimit) {
        value = this.upper(value, upplimit);
        value = this.lower(value, lowlimit);
        return value;
    },

    randInt: function (low, high) {return Math.round(low+Math.random()*   (high-low),0);},
    toRad: function (angle) {return angle*Math.PI/180;}
};


var vector = function (angle, maxMag) {
        this.x = 0;
        this.y = 0;
        this.magnitude = maxMag;
        this.angle = angle;
        this.maxMag = maxMag;
   
            
        this.resolve = function () {            
                this.x = math.between(this.x + this.magnitude*Math.cos(this.angle*Math.PI/180), -this.maxMag, this.maxMag);
                this.y = math.between(this.y + this.magnitude*Math.sin(this.angle*Math.PI/180), -this.maxMag, this.maxMag);
                this.magnitude = 0;
               
        
        };
        
        this.resolve();
        
        this.set = function (angle, strength)
        {
              //  console.log(angle + " " + strength);
                this.angle = angle;
                this.magnitude = this.magnitude + strength;
                // console.log(this.magnitude);
                this.resolve();
        };
        
        this.reset = function ()
        {
        this.x  = 0;
        this.y = 0;
        }

}

var motion = {
        angle: 0,
	freq: 0,
	set: function(object, angle, speed)
	{
	  	object.x += speed *Math.cos(angle*Math.PI/180);
		object.y -= speed *Math.sin(angle*Math.PI/180);
	},

	follow: function(follower, x,y, speed) {
		var angle = -1*direction(follower, x, y);
		if (!inBounds(follower, x-1,x+1,y-1,y+1))
			this.set(follower,angle,speed);
	},
	
	away: function(awayer, x,y,speed)
	{
		var angle = -1*direction(awayer, x, y) - 180;
		this.set(awayer,angle,speed);
	},

	circular: function(object, speed, ang)
	{	this.angle += ang;
		if (this.angle >= 360) this.angle = 0;
		this.set(object, this.angle, speed);
	},

	bop: function(object, amp, freq)
	{		
		this.freq += freq;
		if (this.freq >=360) this.freq = 0;
		object.y += amp*Math.sin(this.freq* Math.PI/180);
	},
        
        move: function(object,damping)
        {
                     var isMoving = false;
                object.x += object.velocity.x;
    		object.y -= object.velocity.y;
    		object.velocity.x *= damping;
    		object.velocity.y *= damping;
                if (Math.abs(object.velocity.x) < 0.01 && Math.abs(object.velocity.y) < 0.01)
                        isMoving = false;
                else
                        isMoving = true;
                        
                return isMoving;
        }
        
};

var keepInbounds = function(object, xmin, xmax, ymin, ymax){
    if (object.x < xmin) {object.x = xmax;}
    else if(object.x > xmax)  {object.x = xmin;}
    if (object.y < ymin) {object.y = ymax;}
    else if (object.y > ymax) {object.y = ymin;}
};

var destroyFromList = function(itemList) 
{
     var count = itemList.length;
    for (var i = 0 ; i < count; i++)
   {
        if (itemList[i].toBeDestroyed === true)
        {        
            itemList.splice(i, 1);
            i--;
            count--;
        }
    }
    return itemList;  
};

var inBounds = function(object, xmin, xmax, ymin, ymax){
    var inside = false;
    if(object.x >= xmin && object.x <=xmax)
    {
        if(object.y >= ymin && object.y <= ymax)
        {
            inside = true;
        }
    }
    return inside;
};

var objectCollide = function(obj, obj1)
{
	if(checkInBounds(obj, obj1) || checkInBounds(obj1, obj))
		return true;

	return false;
}

var checkInBounds = function(temp, temp1)
{
	var points = [];
	
	points[0] = {x:temp.x, y:temp.y};
	points[1] = {x:temp.x, y:temp.y+temp.height};
	points[2] = {x:temp.x+temp.width, y:temp.y};
	points[3] = {x:temp.x+temp.width, y:temp.y+temp.height};
	
	for (var i = 0 ; i < points.length ; i++)
	{
		if(inBounds(points[i], temp1.x, temp1.x + temp1.width, temp1.y , temp1.y + temp1.height))
		{
			return true;
		}
	}
	
	return false;
}


var destroyOutOfBounds = function(itemList, xmin, xmax, ymin, ymax){
    for (var i = 0 ; i < itemList.length; i++)
    {
        if (inBounds(itemList[i], xmin, xmax, ymin, ymax) === false)
        {
            itemList[i].toBeDestroyed = true;
        }
        else
        {
            itemList[i].toBeDestroyed = false;
        }
    }
    
    return itemList;
};

var direction = function (from, x,y){
	dy =  y - from.y;
	dx = x - from.x;
	var angle = 0;
	if(dx !== 0)
	{
	     angle = Math.atan(dy/dx)*180/Math.PI;
	}
	if (dx < 0)
		angle = 180 + angle;
	return angle;
};


var collide = function(object, object2)
{
	return inBounds(object, object2.x - object2.size/2, object2.x + object2.size/2,object2.y - object2.size/2, object2.y + object2.size/2);
};

var collideCenter = function(object, object2)
{
	return inBounds(object, object2.x - object2.width/2, object2.x + object2.width/2,object2.y - object2.height/2, object2.y + object2.height/2);
};


var pointInBounds = function(x,y,bounds)
{
        return inBounds({x:x,y:y}, bounds.x, bounds.x + bounds.width, bounds.y, bounds.y + bounds.height);
};


var bgObjects = function(assets, room, width, height, blockSize)
{	
	this.assets = assets;
	this.room = room;
	this.width = width;
	this.height = height;
	this.name = "";

	this.blockSize = blockSize;
	this.draw = function()
	{	
           		 for (var i = 0 ; i < this.height; i++) 
            		{
               	 	for (var j = 0; j < this.width; j++)
               	 	{
                   		var picIndex = this.room[this.width*i + j];
                   		image(this.assets[picIndex], j*this.blockSize, i*this.blockSize,this.blockSize,this.blockSize);
                		}
          		  }	
	};
};

var drawManager = {
    drawCount:0,
    drawList:[],
    depth:[],

    draw: function() {

    var keys = Object.keys(this.drawList);

    for(var i = 0; i < keys.length; i++)
    {
       	this.depth[i] = this.drawList[keys[i]].depth;
    }

  	 keys = insertionSort(this.depth, keys);
    	 var index = 0;

   		while (this.drawList[keys[index]] != undefined)
    		{  
       			this.drawList[keys[index]].draw();
        			index++;
   		}
   
    }
};


var mazeBgObjects =function(assets, room, width, height, blockSize) 
{	
	this.assets = assets;
	this.room = room;
	this.width = width;
	this.height = height;
	this.name = "";
	this.blockSize = blockSize;

           		for (var i = 0 ; i < this.height; i++) 
            		{
               	 	for (var j = 0; j < this.width; j++)
               	 	{
                   		var picIndex = this.room[this.width*i + j];
                                this.name = "B" + (this.width*i+j).toString();
                   		drawManager.drawList[this.name] = new gameObject(this.assets[picIndex],j*this.blockSize, i*this.blockSize, this.blockSize, this.blockSize, i*this.blockSize);
                		}
          		}
		
};

var gameObject = function(img,x,y,width,height, depth) {
 	this.img = img;
 	this.x = x;
 	this.y = y;
 	this.width = width;
 	this.height = height;
 	this.depth = depth;
 	this.toBeDestroyed = false;
 	this.visible = true;
 	this.draw = function() {
    		if (this.visible == true)
     		image(this.img, this.x, this.y,this.width, this.height);
 	};
};


function spawnObjects(objectList, object, objectWidth, width, height, delay)
{
        	if (delay.delayCount < delay.delay)
        		{
           		delay.delayCount++;
        		}
                 else {
        		var x = math.randInt(0,width)*objectWidth;
                        var y = math.randInt(0,height)*objectWidth;
        		objectList[objectList.length] = new object(x,y,objectWidth);
          		delay.delayCount= 0;
       	 }
};

var delayControl = function(delay) {

	this.alert= false;
	this.delay = delay;
	this.delayCount = 0;

	this.run = function() {
		if (this.delayCount < this.delay)
		{
			this.delayCount += 1;
			this.alert = false;
		}
		else
		{
			this.delayCount = 0;
			this.alert = true;
		}
	};

	this.reset = function () {
		this.delayCount = 0;
		this.alert = false;
	};

	this.setDelay = function (delay) {
		this.delay = delay;
	};

};

var animation = function(img, totalframes,framewidth, frameheight) {

	this.offset = 0;
	this.currentFrame = 0;
	this.spriteSheet = loadImage(img);
	this.frameWidth = framewidth;
	this.frameHeight = frameheight;
	this.endFrame = totalframes;
	this.x = 0;
	this.y = 0;
        this.width = framewidth;
        this.height = frameheight;    
	this.on = true;
	this.delayControl = new delayControl(1);
	this.framePic = this.spriteSheet.get(this.offset + this.currentFrame*this.frameWidth, 0, this.frameWidth, this.frameHeight);
	
	this.setFrame = function (frameNumber) {
		this.currentFrame = frameNumber;
		this.framePic = this.spriteSheet.get(this.offset + this.currentFrame*this.frameWidth, 0, this.frameWidth, this.frameHeight);
		image(this.framePic,this.x,this.y, this.width, this.height);
	};

	this.animate = function(x,y,framerate) {	
		this.x = x;
		this.y = y;
                this.setFrame(this.currentFrame);
		this.delayControl.setDelay(framerate);
		
		if (this.on) {
			this.delayControl.run();		
			}
		else
		{
			this.delayControl.reset();
		}

		if (this.delayControl.alert)
		{
			this.currentFrame += 1;
			if (this.currentFrame >= this.endFrame)
			{
				this.currentFrame = 0;
			} 
		
			this.framePic = this.spriteSheet.get(this.offset + this.currentFrame*this.frameWidth, 0, this.frameWidth, this.frameHeight);
		}
                
                
		image(this.framePic,this.x,this.y, this.width, this.height);

	};

	this.stop = function() {
		this.on = false;

	};
	this.start = function() {
		this.on = true;

	};
       
};

animation.prototype.setSize = function(width, height)
{
        this.width = width;
        this.height = height;
}


var inBoundsOf = function(x,y, obj) {
        if (x < obj.x + obj.width && x > obj.x && y > obj.y && y < obj.y + obj.height)
        {  
                return true;
        }
        else
        { 
                return false;
        }
};

var drawTextRect = function(x,y,width, height, label, textSize, backcolor, forecolor)
{
         push();
         this.font = "Comic Sans MS";
         fill(backcolor);
         rect(x,y,width,height);
         fill(forecolor);
         textAlign(CENTER,CENTER);
         textFont(this.font, textSize);
         text(label,x, y, width, height);
         pop();
         
};

var buttonRect = function(msg, x,y, width, height)
{
      this.bound = new bound(x,y,width, height);
      this.visible = true;
      this.onClick = null;
      this.text = msg;
      this.backColor = color(200,200,200);
      this.foreColor = color(0,0,0);
      this.textSize = 10;
      
      this.update = function() 
      {
             
           if(this.visible)
           {
                    drawTextRect(this.bound.x, this.bound.y, this.bound.width, this.bound.height, this.text, this.textSize, this.backColor, this.foreColor);    
           }
      };
      
      this.click = function()
      {
              if(inBoundsOf(mouseX, mouseY, this.bound))
              {
                   if (this.action && this.visible)
                      this.action();
              }
      };
      
      
}



var drawButtons = function(button)
{
     for (var i =0;i < button.length ;i++)
     {
         drawTextRect(button[i].x, button[i].y, button[i].width, button[i].height, button[i].label, button[i].textSize, button[i].backColor, button[i].foreColor);
     }
};

var drawTextBoxes = function(textBox) {
    var white = color(255, 255, 255);
    var grey = color(207, 207, 207);
    for (var i = 0 ; i < textBox.length; i++) {
     if (textBox[i].isFocused)
    {
        drawTextRect(textBox[i].x,textBox[i].y,textBox[i].width,textBox[i].height,textBox[i].label, button[i].textSize,white, textBox[i].foreColor);
    }
    else if (!textBox[i].isFocused)
    {
        drawTextRect(textBox[i].x,textBox[i].y,textBox[i].width,textBox[i].height,textBox[i].label, button[i].textSize,textBox[i].backColor, textBox[i].foreColor);
    }
    }
};

function textBoxFunction(textBox) {

    for (var i = 0; i < textBox.length; i++)
    {
    if (textBox[i].isFocused)
        {   
     if (keyCode === BACKSPACE){
        textBox[i].label = textBox[i].label.substring(0,textBox[i].label.length-1);
     }
     else if (keyCode === ENTER) {
         textBox[i].enter();
    }
     else
    {
    var chr = key;//String.fromCharCode(key);
    textBox[i].label += chr;
    }
    	keyCode = "";
    }
    }
};

function textBoxFocus(textBox)
{
 	for (var j = 0 ; j < textBox.length; j++)
  	 {	
         		textBox[j].isFocused = false;
        		if (inBoundsOf(mouseX, mouseY, textBox[j]))
			{
           		textBox[j].clicked();
        			}
	}
};

var textBox = function(x,y,text,backcolor, forecolor)
{
	this.x = x;
	this.y = y;
	this.height = 50;
	this.width = 200;
	this.textSize = 30;
	this.label = text;
	this.backColor = backcolor;
	this.foreColor = forecolor;
	this.isFocused = false;
	this.clicked = function() {this.isFocused=true;};
	this.enter = function() {};
};

var button = function(x,y,text,backcolor, forecolor)
{
	this.x = x;
	this.y = y;
	this.height = 50;
	this.width = 200;
	this.textSize = 30;
	this.label = text;
	this.backColor = backcolor;
	this.foreColor = forecolor;
	this.isFocused = false;
	this.clicked = function() {this.isFocused=true;};
	this.enter = function() {};	
};


var animatedText =  function (sometext, framerate,x,y, spacing) {
		this.chars = sometext.split('');
		this.delaycontrol = new delayControl(framerate);
		this.currentChar = 0;
		this.isFinished = false;
		this.x = x;
		this.y = y;
		this.message = "";
                this.color = null;
                this.font = null;
                this.style = "NORMAL";
                this.size = null;
                this.delay = 0;
		this.run = function () {
			this.delaycontrol.run();

			if( !this.isFinished)
                        {
                                if (this.size)
                                        textSize(this.size);
                                if (this.font)
                                        textFont(this.font);
                                textStyle(this.style);
                                if(this.color!=null)
                                        fill(this.color.r, this.color.g, this.color.b);
				text(this.message, this.x + this.currentChar,this.y);
                        }

			if (this.delaycontrol.alert)
			{		
				if (this.currentChar >= this.chars.length)
				{
				this.isFinished = true;
				}
				else
				{
                                
				this.message += this.chars[this.currentChar];
				this.x += 8;
				this.currentChar+=1;
				}
			}
		};

		this.show = function () {
			if (this.isFinished)
                        {
                                if (this.color)
                                        fill(this.color.r, this.color.g, this.color.b);
				text(this.message , this.x, this.y);                
                        }
		}
};

animatedText.prototype.setColor = function(r,g,b)
{
        this.color = {r:r,g:g,b:b};
}

animatedText.prototype.setStyle = function(style)
{
        this.style = style;
}

animatedText.prototype.setFont = function(font)
{
        this.font = font;
}

animatedText.prototype.setSize = function(size)
{
        this.size = size;
}

animatedText.prototype.setDelay = function (delay)
{
        this.delay = delay;
}

var animateAllText = {
	currentText:0,
        delay: new delayControl(0),
        reset: function()
        {
                this.currentText = 0;
  
        },
	run: function(animatedTexts) 
	{
		for (var i = 0; i < animatedTexts.length ; i++)
		{
                        animatedTexts[i].show();
                        
		}

		if (animatedTexts[this.currentText].isFinished && this.currentText < animatedTexts.length-1)
                {
                        this.currentText +=1;
                        this.delay.reset();
                        this.delay.setDelay(animatedTexts[this.currentText].delay);
		}
                else
                {
                        
                        if (this.delay.alert)
                        {
                                animatedTexts[this.currentText].run();
                        }
                        else
                        {
                                this.delay.run();
                        }
                }
	}
};
	

var bound = function(x,y,width, height) {
    this.x=x;
    this.y=y;
    this.height=height;
    this.width=width;
    
    this.draw = function(x,y) {
        if (showCollisions){
                stroke(255,0,0);
        	noFill();
        	rect(x, y,this.width, this.height);}
    };
};


var insertionSort = function(A,B) {
 var key = 0; var item = 0; var j = 0;
   for (var i = 1; i < A.length; i++)
   {
       key = A[i];
       item = B[i];
       j = i-1;
 
       while (j >= 0 && A[j] > key)
       {
           A[j+1] = A[j];
           B[j+1] = B[j];
           j = j-1;
       }
       
       A[j+1] = key;
       B[j+1] = item;
   }
   return B;
};


var spheric = function() {
    this.x = 0;
    this.y = 0;
    this.radius = 0;
    this.velocity = 3;
    this.color = color(0, 0, 0);
    this.delayCount = 0;
    this.delay = 0;
    this.toBeDestroyed = false;
    this.draw = function() {
         stroke(204, 151, 37);
        fill(255, 255, 255,0);
         ellipse(this.x, this.y, this.radius*2, this.radius*2);
         stroke(0, 0, 0);
    };
    this.update = function() {
        if (this.delayCount < this.delay) {
            this.delayCount++;
        }
        else
        {
          this.radius += this.velocity;  
        }
        if (this.radius > 200)
        {
            this.toBeDestroyed = true;
        }
    };
};


var mazeBgCollisions = {
    bounds: [],
    base: [],
    side: [],
    leftSide: [],
    thick: 8,
    boundHeight: 16,
    sideHeight:3,
    blockSize:30,
    create: function(blockSize) {
        var prev = 0; var boundaryWidth = 0; var boundCount = 0;
        var current = -1; var locx= 0 ; var locy = 0; var makeIt = false;
        this.blockSize = blockSize;
        
        for (var i = 0; i < roomHeight; i++)
        {
            prev = 0;
            
            for (var j =0; j < roomWidth; j++)
            { 
                current = roomArrangement[(roomWidth)*i + j];
                
                if (current >= 1 && prev <= 0)
                {
                    boundaryWidth = 0;
                    locx = i;
                    locy = j;
                }
                 else if (current >= 1  && prev >= 1)
                {
                    boundaryWidth += 1;
                }
                else if(current <= 0 && prev >= 1)
                {
                    boundaryWidth += 1;
                   // console.log(locx + " " + locy + " " + boundaryWidth);
                    this.makeIt(locx, locy, boundaryWidth,boundCount);
                    boundCount++;
                }
                
                prev = current;
                
            }
            
            if(current >= 1)
            {
            boundaryWidth++;
          //  console.log(locx + " " + locy + " " + boundaryWidth);
            this.makeIt(locx, locy, boundaryWidth,boundCount);
            boundCount++;
            }
           
        }
        
        for (var i = 0; i < this.bounds.length; i++)
        {
            this.base[i] = new bound(this.bounds[i].x, this.bounds[i].y+this.bounds[i].height, this.bounds[i].width+this.thick, this.thick);
            this.side[i] = new bound(this.bounds[i].x + this.bounds[i].width, this.bounds[i].y-this.sideHeight/2*this.thick-6, this.thick+3,this.bounds[i].height+this.sideHeight*this.thick);
            this.leftSide[i] = new bound(this.bounds[i].x-this.thick+4, this.bounds[i].y-this.sideHeight/2*this.thick-6,2*this.thick,this.bounds[i].height+this.sideHeight*this.thick);
        }
        
    },
    
    makeIt: function(locx, locy, boundaryWidth, boundCount) {
            
	    this.bounds[boundCount] = new bound(locy*this.blockSize-this.thick-15,locx*this.blockSize+4,boundaryWidth*this.blockSize+10,this.boundHeight);
                   boundaryWidth=0;
                   locx = 0;
                   locy = 0;
    },


    draw: function() {
        for (var i = 0; i < this.bounds.length;i++)
         {
            var b = this.bounds[i];
            b.color = color(255, 0, 0);
            b.draw(b.x,b.y);
         }
         
         for (var i = 0; i < this.base.length;i++)
         {
              var b = this.base[i];
              b.color = color(255, 252, 224);
              b.draw(b.x,b.y);
         }
         
         for (var i = 0; i < this.side.length; i++)
         {
             var b = this.side[i];
             b.draw(b.x, b.y);
             b = this.leftSide[i];
             b.color = color(7, 7, 168);
             b.draw(b.x,b.y);
         }
    },
    
};



var checkMazeBgCollisions = function(player, collisions)
{
        	var c = collisions.bounds;
                var isCollided = false;
          
      		for (var i = 0 ; i < c.length;i++)
                        {
       			 if (inBounds(player, c[i].x, c[i].x+c[i].width, c[i].y-player.size, c[i].y + c[i].height))
           			 {
                		player.velocityY = 0;
                		player.y = c[i].y - player.size;
                                isCollided =  true;
           		 	}
                        }
       
        	c = collisions.base;
                
        	for(var i= 0 ; i < c.length;i++)
                        {
        			if (inBounds(player, c[i].x, c[i].x+c[i].width, c[i].y, c[i].y+c[i].height))
                		{
                		player.velocityY = 0;
                		player.y = c[i].y + c[i].height;
                                isCollided =  true;
                                }   
        		}
                
       		c = collisions.side;
                
        	for (var i = 0 ;  i< c.length;i++) 
                        {
                		if (inBounds(player, c[i].x, c[i].x+c[i].width, c[i].y, c[i].y+c[i].height))
                		{
                		player.velocityX = 0;
                		player.x = c[i].x + c[i].width;
                                isCollided =  true;
                		}   
                        }
                
        	c = collisions.leftSide;
        	for (var i = 0 ;  i< c.length;i++) 
                        {
        			if (inBounds(player, c[i].x, c[i].x+c[i].width, c[i].y, c[i].y+c[i].height))
        			{
                                 player.velocityX = 0;
                                 player.x = c[i].x;
                                 isCollided =  true;
        			}   
                        }	
                return isCollided;
}


var bgCollisions = {
    bounds: [],
    base: [],
    side: [],
    leftSide: [],
    addBounds: function(bound) {
	this.bounds[this.bounds.length] = bound;
	},
    create: function() {
 
        for (var i = 0; i < this.bounds.length; i++)
        {
            this.base[i] = new bound(this.bounds[i].x, this.bounds[i].y+10, this.bounds[i].width, this.bounds[i].height+20);
            this.side[i] = new bound(this.bounds[i].x + this.bounds[i].width-9, this.bounds[i].y+1, 20,25);
            this.leftSide[i] = new bound(this.bounds[i].x-12, this.bounds[i].y+1, 20,25);
        }
        
        this.leftSide.splice(this.bounds.length, 1);
        this.side.splice(this.bounds.length,1); 
    },
    
    draw: function() {
    
       if(showCollisions){
        for (var i = 0; i < this.bounds.length;i++)
         {
            var b = this.bounds[i];
            b.draw(b.x,b.y);
         }
         
         for (var i = 0; i < this.base.length;i++)
         {
              var b = this.base[i];
              b.color = color(156, 29, 29);
              b.draw(b.x, b.y);
         }
         
         for (var i = 0; i < this.side.length; i++)
         {
                 var b = this.side[i];
             b.draw(b.x,b.y);
             b = this.leftSide[i];
             b.draw(b.x,b.y);
         }
         }
    },
    
};

var checkBgCollisions = function(obj)
{
                       
        for (var i =0; i < bgCollisions.bounds.length;i++)
       	{
       		var c = bgCollisions.bounds[i];
        	obj.isInAir = 0;
				
			if (!inBounds(obj, c.x, c.x+c.width, c.y-obj.height, c.y + c.height + obj.velocity.y))
        		{   
          	 		obj.velocity.y += obj.gravity; 	
        		}
                        else //touch the ground
        		{ 
          			obj.y = c.y-obj.height;
           			obj.canJump = true;
           			obj.velocity.y = 0;
					
                                if(obj.isJumping === true)
						{
							obj.velocity.set(270,obj.jumpStrength);
                			obj.y -= 2;
						}	
			}    
		}
		
        var c = bgCollisions.base;
		
        for(var i= 0; i < c.length;i++)
		{
        	if (inBounds(obj, c[i].x, c[i].x+c[i].width, c[i].y, c[i].y+c[i].height))
              	{
					obj.velocity.y = 0.5;
                	obj.canJump = false;
                	obj.velocity.y += obj.gravity;
                }   
        }     
		
        c = bgCollisions.side;
		
        for (var i = 0 ;  i< c.length;i++) 
		{
			if (inBounds(obj, c[i].x, c[i].x+c[i].width, c[i].y, c[i].y+c[i].height))
                {                  
                	obj.velocity.x = 0;
              		obj.x = c[i].x + c[i].width;
					obj.canJump = false;
                	obj.velocity.y += obj.gravity;
                }   
       }	
	   
       c = bgCollisions.leftSide;
	   
       for (var i = 0 ;  i< c.length;i++) 
	   {
			if (inBounds(obj, c[i].x, c[i].x+c[i].width, c[i].y, c[i].y+c[i].height))
                {                  
                obj.velocity.x = 0;
                obj.x = c[i].x;
                obj.canJump = false;
                obj.velocity.y += obj.gravity;
                }   
       } 


};


var gameDuration = {
    gameTime:0, 
    duration: 60,
    interval: 1000,
set: function(duration, interval) {
    this.gameTime = 0;
    this.duration = duration;
    this.interval = interval;
},
update: function(callback) {
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
        callback();
        this.gameTime = this.interval + 10;
   }
   
}
},
draw: function(font, fontsize,color, x,y) {
       textFont(font);
       textSize(fontsize);
       fill(color);
       text(this.duration, x,y); 
}
};

var drawTriangle = function(centreX, centreY, ang, size) {
var angles = [];
var angle = ang;
angles[0] = angle ;
angles[1] = angle + 120;
angles[2] = angle - 120;
var p = [];
for (var i = 0 ; i < 3; i++)
{
    p[2*i] = size*Math.cos(angles[i]*Math.PI/180);
    p[2*i+1] = -size*Math.sin(angles[i]*Math.PI/180);
}
triangle(centreX + 1.5*p[0], centreY + 1.5*p[1], centreX + p[2], centreY + p[3], centreX + p[4], centreY + p[5]);
};

function bodyManager()
{
	this.bodies = [];
	this.hashBodies = {};
};

bodyManager.prototype.add = function(gameobj)
{
	this.bodies[this.bodies.length] = gameobj;
	this.hashBodies[gameobj.name] = this.bodies.length-1;
};

bodyManager.prototype.get = function(name)
{
	return this.bodies[this.hashBodies[name]];
}

bodyManager.prototype.draw = function()
{
       this.bodies.forEach((obj, index) => {
		if(obj.visible)
			obj.draw();
	});
	
}

bodyManager.prototype.addBodies = function(world)
{
        this.bodies.forEach((body, index) => {
			World.add(world, body.body);
	});
}



function drawMouseConstraint(mouse)
{
	if (showCollisions)
        {
		if (mouse.body)
		{
		var pos = mouse.body.position;
		var m = mouse.mouse.position;
		stroke(34,45,123);
		line(pos.x, pos.y, m.x, m.y);
                ellipse(mouse.body.position.x, mouse.body.position.y, 20,20);
		}
	}
        
}
        
var drawMousePos = {
	view: new viewCam(0,0),
	draw: function () {text(Math.round(mouseX+this.view.x,0) + ", " + Math.round(mouseY+this.view.y,0), mouseX+this.view.x,mouseY+this.view.y);},
	setView : function(view) {
		this.view = view;
	}
};

function drawBound(obj)
{
	if (showCollisions)
	{
	stroke(255,0,0);
        noFill();
	rect(obj.x, obj.y, obj.width, obj.height);
	}
};

function drawBoundUpdate(obj)
{
        obj.bound.x = obj.x;
	obj.bound.y = obj.y;
        
         if (showCollisions){
                stroke(255, 0, 0);
                noFill();	
		rect(obj.bound.x, obj.bound.y, obj.bound.width, obj.bound.height);
	} 
}

function teleportToMouse(object, viewport)
{
	if (mouseButton == LEFT){
		object.x = mouseX+viewport.x;
		object.y = mouseY+viewport.y;
		object.velocity.y = 0;
		mouseButton = 0;
	}
};

function updatePlatformer(obj)
{
        obj.x += obj.velocity.x;
	obj.y += obj.velocity.y;
	obj.velocity.x *= obj.damping;
	obj.isInAir = false;
       	checkBgCollisions(obj);//check background collisions
        obj.isJumping = false;
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
                            bulletManager.create();
                            this.delayCount = 0;
                        }
                    this.durationCount++;
                }
            }
        
    }
        
};

var calcAngle = function (x1,y1,x2,y2) {
        var dir = 0;
        
        if (x2 < x1)
        
             {dir = -180;}

        
        return (Math.atan((y2-y1)/(x1-x2))*180/Math.PI+dir);
};

var spawnManager = function (delay) {

    this.length=0;
    this.delay=50;
    this.delayCount=0;
    this.gameObj=[];
    this.delay = delay;
	
    this.spawn = function(obj) {	
        if (this.delayCount < this.delay){
                    this.delayCount++;
        }
        else 
	{
                this.gameObj[this.length] = obj;
		this.length++;
		this.delayCount=0;
        }
        
	
        
    };
    
        this.destroyOutOfBounds = function(xmin, xmax, ymin, ymax) {
			this.gameObj = destroyOutOfBounds(this.gameObj,xmin,xmax,ymin,ymax);
			this.length = this.gameObj.length;
    };
    
	this.update=function() {
		for (var i = 0; i < this.gameObj.length;i++)
		{
			this.gameObj[i].update();
		}
    };
    
    this.destroyFromList = function()
    {
        this.gameObj = destroyFromList(this.gameObj);
	this.length = this.gameObj.length;
    }
};

var collisionManager = function () {
        this.offset = 5;
    this.check = function(list1, list2) {
        for (var i = 0; i < list1.length; i++)
        {
            for (var j = 0; j < list2.length; j++)
            {
                if (inBounds(list1[i],list2[j].bound.x-this.offset, list2[j].bound.x + list2[j].bound.width+this.offset, list2[j].bound.y-this.offset, list2[j].bound.y + list2[j].bound.height+this.offset))
                {

                        return [list1[i],list2[j]];
                }
            }
        } 
		return null;
    }	
};


function dialog() {
        this.currentSpeak = 0;
        this.isFinished = false;
        this.delay = new delayControl(100);
        
        this.run = function (speak, x,y)
        {
                if (!this.isFinished)
                {
      
                text(speak[this.currentSpeak], x, y);
			this.delay.run();
			if (this.delay.alert)
			{
				if (this.currentSpeak < speak.length-1)
				{
					this.currentSpeak += 1;
		
				}
				else
				{
					this.isFinished = true;
					this.currentSpeak = 0;				
				}
			}
                }
                else
                {
                        this.reset();
                }
        }
        this.reset = function() {
                this.currentSpeak = 0;
                this.isFinished = false;
        }
 };
 
 dialog.prototype.setDelay = function(delay) {
         this.delay = new delayControl(delay);
 };
 
 
 
