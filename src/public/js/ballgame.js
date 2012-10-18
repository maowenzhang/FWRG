
$(function() {
canvasApp();
});

function canvasSupport(){
	return Modernizr.canvas;
}
function canvasApp(){
	if(!canvasSupport()){
		return;
	}else{
		var theCanvas=document.getElementById("canvas");
		var context=theCanvas.getContext("2d");
	}
	
	// multiple bounce balls
	//var ball = {x:tempX, y:tempY, radius:tempRadius, speed:tempSpeed, angle:tempAngle, xunits:tempXunits, yunits:tempYunits};
	
	var ballNumberElement = document.getElementById("textBox");
	ballNumberElement.addEventListener('keyup', textBoxChanged, false);
	
	var canvasWidthElement = document.getElementById("canvasWidth");
	canvasWidthElement.addEventListener('change', canvasWidthChanged, false);
	
	var canvasHeightElement = document.getElementById("canvasHeight");
	canvasHeightElement.addEventListener('change', canvasHeightChanged, false);
	
	function canvasWidthChanged(e)
	{
		var target = e.target;
		theCanvas.width = target.value;
		drawScreen();
	}
	
	function canvasHeightChanged(e)
	{
		var target = e.target;
		theCanvas.height = target.value;
		drawScreen();
	}
	
	var numBalls = 100;
	var maxSize = 8;
	var minSize = 5;
	var maxSpeed = maxSize+5;
	var balls;
	
	var tempBall;
	var tempX;
	var tempY;
	var tempRadius;
	var tempSpeed;
	var tempAngle;
	var tempXunits;
	var tempYunits;
	
	function textBoxChanged(e){
		var target = e.target;		
		numBalls = target.value;
		generateBalls();
		drawScreen();
	}
	
	function generateBalls(){
		balls = new Array();
		for(var i = 0; i < numBalls; ++i){
			tempRadius = Math.floor(Math.random()*maxSize)+minSize;
			tempX = tempRadius*2 + (Math.floor(Math.random()*theCanvas.width)-tempRadius*2);
			tempY = tempRadius*2 + (Math.floor(Math.random()*theCanvas.height)-tempRadius*2);
			tempSpeed = maxSpeed - tempRadius;
			tempAngle = Math.floor(Math.random()*360);
			tempRadians = tempAngle*Math.PI/180;
			tempXunits = Math.cos(tempRadians)*tempSpeed;
			tempYunits = Math.sin(tempRadians)*tempSpeed;
		
			tempBall = {x:tempX, y:tempY, radius:tempRadius, speed:tempSpeed, angle:tempAngle, xunits:tempXunits, yunits:tempYunits};
			balls.push(tempBall);		
		}
	}	
	
	function drawScreen(){
	    //make change here
		context.fillStyle = "#EEEEEE";
		context.fillRect(0, 0, theCanvas.width, theCanvas.height);
		
		context.strokeStyle = "#000000";
		context.strokeRect(1, 1, theCanvas.width, theCanvas.height);
		
		var ball;
		
		for(var i = 0; i < balls.length; i++){
			ball = balls[i];
			
			ball.x += ball.xunits;
			ball.y += ball.yunits;
			
			if(ball.x + ball.radius > theCanvas.width)
				ball.x = theCanvas.width - ball.radius;
			else if(ball.x - ball.radius < 0)
				ball.x = ball.radius;
			else if(ball.y + ball.radius > theCanvas.height)
				ball.y = theCanvas.height - ball.radius;
			else if(ball.y - ball.radius < 0)
				ball.y = ball.radius;
		
			context.fillStyle = "#000000";
			context.beginPath();		
			context.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2, true);
			context.closePath();
			context.fill();
		
			if(ball.x == theCanvas.width - ball.radius || ball.x == ball.radius)
			{
				ball.angle = 180 - ball.angle;
				updateBall(ball);
			}
			else if(ball.y == theCanvas.height - ball.radius || ball.y == ball.radius)
			{
				ball.angle = 360 - ball.angle;
				updateBall(ball);
			}
		}
	}
	
	function updateBall(ball){
		ball.radians = ball.angle * Math.PI/180;
		ball.xunits = Math.cos(ball.radians)*ball.speed;
		ball.yunits = Math.sin(ball.radians)*ball.speed;
	}
	
	generateBalls();
	setInterval(drawScreen, 33);
}