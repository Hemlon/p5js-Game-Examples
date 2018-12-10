var engine;
var world;
var mouse;
var gameObjs;
var bodyName = null;

var gameObj = function(name, x,y, width, height, isStatic, shape)
{
	this.name = name;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.visible = true;
	this.shape = shape;
	
	if(this.shape == "RECT")
		this.body = Bodies.rectangle(this.x, this.y, this.width,this.height, {isStatic:isStatic});
	else
		this.body = Bodies.circle(this.x, this.y, this.width/2,{isStatic:isStatic});
	
	this.push = function (force)
	{
		var e = this.body;
		Body.applyForce(e,e.position, {x:force.x,y:force.y});
	}
	
	this.draw = function ()
	{
		fill(245,34,123);	
		push();
		rectMode(CENTER);
		translate(this.body.position.x,this.body.position.y);
		rotate(this.body.angle);	
		if(this.shape == "CIRCLE")
			ellipse(0, 0, this.width, this.height);
		else
			rect(0,0,this.width, this.height);
		pop();
	}
};

var sprite = function(name, x,y, size, img, frameCount, animspd, isStatic, shape)
{
	gameObj.call(this, name, x,y,size, size, isStatic, shape);
	this.animation = new animation(img, frameCount, size, size);
	this.animSpeed = animspd;
	
	this.draw = function ()
	{
		fill(245,34,123);	
		push();
		rectMode(CENTER);
		translate(this.body.position.x,this.body.position.y);
		rotate(this.body.angle);
		this.animation.animate(-this.width/2, -this.height/2, this.animSpeed);
		
		if(showCollisions)
		{
			noFill();
			stroke(234,245,323);
			rect(0,0, this.width, this.height);
		}
		
		pop();	
	};
};

var level1 = function() {
	
	this.preload = function()
	{
		gameObjs = new bodyManager(); //physics body manager	
	//add  ball
		gameObjs.add(new sprite("ball",150,50,44,"pics/coin_anim.png",10, 2,false,"CIRCLE")); 
		var ball = gameObjs.get("ball").body;
		ball.restitution = 0.9; //how bouncey the ball is 
		ball.friction = 0; //how much friction
	
		gameObjs.add(new gameObj("box", 200,100,50,50,false, "RECT"));
		gameObjs.add(new gameObj("ground",400,310,810,60, true, "RECT")); 
	//add more gameObjects here	
	};

	this.setup = function()
	{
		engine = Engine.create();
		world = engine.world;
		var canvasmouse = Mouse.create(canvas.elt);
		canvasmouse.pixelRatio = pixelDensity();
		mouse = MouseConstraint.create(engine, {mouse:canvasmouse});	
		gameObjs.addBodies(world);
		World.add(world, mouse);	
	};

	this.draw = function()
	{
		showCollisions = true;
		background(0,0,0);
		Engine.update(engine);
		gameObjs.draw();
		drawMouseConstraint(mouse);
	};
	
};

var getClickedBodyName = function()
{
	var name = null;
	gameObjs.bodies.forEach((obj, index)=>{
		var pos = obj.body.position;
		var s = dist(pos.x, pos.y, mouseX, mouseY);
		if (Math.abs(s) < obj.height/2) 
		{		
			name = obj.name;
		}				
	});
	
	return name;
}



function mousePressed() //when mouse pressed find the body user clicked on
{
	bodyName = getClickedBodyName();
	if(bodyName)
		mouse.body = gameObjs.get(bodyName).body;	
}

function mouseDragged() //pull when dragging
{
	if (bodyName)
		mousePull(bodyName, 0.1);
}

function mouseReleased() //unregister body when mosue released
{
	bodyName  = null;
}
	
function mousePull(name,strength)
{
	var ebody = gameObjs.get(name);
	var epos = ebody.body.position;
	mouse.body = ebody.body;
	var angle = direction(epos, mouseX, mouseY);
	var distance = dist(epos.x,epos.y, mouseX, mouseY)/1000*strength;
	var v = {x:distance*Math.cos(angle*Math.PI/180), y: distance*Math.sin(angle*Math.PI/180)}
	ebody.push(v);
}
