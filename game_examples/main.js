var backcolor; 
var imageAssets = [];
var scenes = [];
var buttons = [];
var currentScene = 0;
var texts = [];
var textBoxes = [];
var animationList = {};
var viewport;

var movingText = function(x,y) {
	this.x = x;
	this.y = y;
	this.update = function() {
		fill(32,24,244);
		text("GREETINGS", this.x,this.y);
	};
};

function preload()
{
	imageAssets[0] = loadImage('pics/blank.png');
	imageAssets[1] = loadImage('pics/woodblock.png');
	preloadScene1();
}

function setup() {
	createCanvas(400,400);
	buttons[0] = new button (0,300, "Play", color(204,32,33), color(23,33,255));
	buttons[0].clicked = function () {		
		currentScene = 1;
		resizeCanvas(500,500);
		bgmusic.loop();
		bgmusic.play();
	};

	background(0,0,0);
	texts[0] = new animatedText("WELCOME TO OUR", 5, 50,130, 20);
	texts[1] = new animatedText("AWESOME GAME", 5,120,160, 20);
	p = new movingText(190,40);
	backcolor = color(234,54,44);
	initScene1();
};

titlePage = function ()
{
	background(0,0,0);
	fill(255,255,255);
	textFont("Comic Sans MS", 30,30);
	fill(43,434,23);
	p.update();
	motion.circular(p,2,5);
	animateAllText.run(texts);
	drawButtons(buttons);

};

scenes[0] = new scene("title", titlePage);
scenes[1] = new scene("second", scene1);

function draw() {
	scenes[currentScene].run(); 
};


function mousePressed()
{
	buttonFocus(buttons);
	textBoxFocus(textBoxes);
};

function mouseReleased()
{

};

function mouseMoved()
{	
	
};

function keyReleased()
{
	keyReleasedFunction();
	player1.isMoving = false;
};



//no need to touch beyond this point unless otherwise stated

function keyPressed()
{
	keyPressedFunction();
};

function keyTyped()
{
	textBoxFunction(textBoxes);
}

