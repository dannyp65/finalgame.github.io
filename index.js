var sketchProc=function(processingInstance){ with (processingInstance){
size(400, 400); 
frameRate(60);


//ProgramCodeGoesHere
//frameRate(10);
//frameRate(10);
angleMode = "radians";
var adeg = TWO_PI/360;
var keyArray = [];
var gameState = 0;
var mountains = [[],[],[],[],[],[]]; 
var a=random(1500);
var gravity = new PVector(0, 0.2);
var shootForce = new PVector(1,-1);
var wind = new PVector(1, 0);
var windSpeed = 0;
var balls = [];
for (var i=0; i<=5; i++) {
    for (var j=0; j<=40; j++) {
        var n = noise(a);
        mountains[i][j] = map(n,0,1,0,400-i*50);
        a += 0.025;  // ruggedness
    }
}

var drawSky = function(){
     // sky
    var n1 = a;  
    for (var x=0; x<=400; x+=8) {
        var n2 = 0;
        for (var y=0; y<=250; y+=8) {
            var c = map(noise(n1,n2),0,1,0,255);
            fill(179, 194, c+80,150);
            rect(x,y,8,8);
            n2 += 0.05; // step size in noise
        }
        n1 += 0.02; // step size in noise
    }
    a -= 0.01;  // speed of clouds
    fill(232, 220, 54, 200);
    ellipse(30, 50,30,30);
};
var drawmount = function(){
    for ( var x=0; x<=5; x++) {
        for (var y=0; y<=40; y++) {
            fill(20 + x*5, 20+x*10, 0);
            // draw quads of width 10 pixels
            quad(y*10,mountains[x][y]+x*55,(y+1)*10,mountains[x][y+1]+(x)*55,(y+1)*10,400,y*10,400);
        }
    }
};

var uObj = function(x,y){
    this.pos = new PVector(x,y);
    this.sangle = 280*adeg;
    this.turn = 1;
    this.shoot = 0;
};
var ballObj = function(x, y) {
    this.pos = new PVector(x,y);
    this.velocity = new PVector(4,-5);
    this.acceleration = new PVector(0, 0);
    this.aAcc = 0;
    this.aVelocity = 0;
    this.angle = 0;
    this.size = 200;
    this.mass = this.size / 5;
    this.drag = false;
    this.released = false;
    this.shoot = false;
  //  this.hit = 0;
    //this.run = 0;
};
var powerObj = function(x,y){
    this.x = x;
    this.y = y; 
    
};
var power = new powerObj(100,380);
var user =  new uObj(100,300);
var ball = new ballObj(100,100);

uObj.prototype.draw = function() {
    fill(168, 168, 168);
    ellipse(this.pos.x, this.pos.y,40, 10);
    fill(36, 36, 36);
    ellipse(this.pos.x, this.pos.y,20, 5);
    fill(30, 229, 247, 70);
    arc(this.pos.x, this.pos.y,20, 20, 180*adeg, 360*adeg);
    strokeWeight(2);
    stroke(255, 0, 0);
    var xadd1 = this.pos.x + 30*cos(this.sangle);
    var yadd1 = this.pos.y + 30*sin(this.sangle);
    var xadd2 = this.pos.x + 25*cos(this.sangle + 15*adeg );
    var yadd2 = this.pos.y + 25*sin(this.sangle + 15*adeg);
    var xadd3 = this.pos.x + 25*cos(this.sangle - 15*adeg);
    var yadd3 = this.pos.y + 25*sin(this.sangle - 15*adeg);
    fill(0, 0, 0);
    triangle(xadd1, yadd1, xadd2, yadd2, xadd3, yadd3);
    //line(this.pos.x, this.pos.y, this.pos.x + xadd,this.pos.y + yadd);
};

powerObj.prototype.draw = function() {
    fill(0, 111, 255);
    line(100, 380, 300, 380);
    noStroke();
    ellipse(this.x, this.y, 20, 20);
    rect(320,360, 70,30, 6);
    fill(252, 252, 252);
    text("SHOOT", 330, 370, 50,30);
    
    
};
uObj.prototype.move =function(){
     if((keyArray[LEFT] === 1) && (this.pos.x > 35)){
            this.pos.x= this.pos.x -3;
    }
       
    if((keyArray[RIGHT] === 1) && (this.pos.x <780)){
            this.pos.x= this.pos.x +3;
    }
    if((keyArray[UP] === 1) && (this.pos.y > 20)){
        if(this.sangle < 360*adeg){
            this.sangle= this.sangle + 1*adeg;
        }
    }
      
    if((keyArray[DOWN] === 1) && (this.pos.y <380)){
        if(this.sangle > 180*adeg){
            this.sangle= this.sangle - 1*adeg;
        }
    }
    
   
};
ballObj.prototype.draw = function() {
    
    if(this.shoot){
        ellipse(this.pos.x, this.pos.y, 10, 10);
     //   noStroke();
   //     fill(250, 35, 114);
    //    pushMatrix();
    //    translate(this.pos.x, this.pos.y);
    //    rotate(this.angle);
    //    ellipse(0, 0,this.size, this.size);
    //    popMatrix();
    }
};
ballObj.prototype.applyForce = function(force) {
    var f = PVector.div(force, this.mass);
    this.acceleration.add(f);
};

ballObj.prototype.updateposition = function() {
    if(this.shoot){
        var gravityForce = PVector.mult(gravity, this.mass);
        this.applyForce(gravityForce);
       // this.computeBump();
      //  this.applyForce(this.bumpForce);
      //  this.bumpForce.set(0, 0);
        var windForce = PVector.mult(wind, this.mass);
        windForce.mult(windSpeed);
        this.applyForce(windForce);
        var airFriction = PVector.mult(this.velocity,-0.02);
        this.applyForce(airFriction);
    
        this.velocity.add(this.acceleration);
        this.pos.add(this.velocity);
   
        
    
        this.acceleration.set(0, 0);
        this.aAcc = this.velocity.mag()/16;	
        if (this.velocity.x < 0) {
            this.aAcc = -this.aAcc;
        }
        this.aVelocity += this.aAcc;
        this.aVelocity *= 0.98; // drag
        if((this.velocity.x === 0) && (this.velocity.y === 0 )){
            this.angle = 0;
        }
        else{
            this.angle += this.aVelocity*adeg;
        }
    
    }
 
};
var state0 = function(){
    fill(175, 233, 247);
    noStroke();
    rect( 140, 130, 120, 40);
    rect( 140, 200, 120, 40);
    fill(235, 40, 128);
    textSize(25);
    text("START",160,158);
    text("HINT",170,228);
    fill(235, 235, 235);
    textSize(15);
    text("DEV:NHAN PHAM", 130, 380, 300, 200);
};
var mouseClicked = function(){
    
    if( (mouseX > 140) && (mouseX < 260) && (mouseY > 130) && (mouseY < 170) && (gameState === 0)){
        gameState = 2; // start game
    }
    if( (mouseX > 140) && (mouseX < 260) && (mouseY > 200) && (mouseY < 240) && (gameState === 0)){
        gameState = 1; // instruction
    }
    if( (mouseX > 180) && (mouseX < 220) && (mouseY > 345) && (mouseY < 370) && (gameState === 1)){
        gameState = 0; // go back to main menu from instruction menu
    }
    if( (mouseX > 100) && (mouseX < 300) && (mouseY > 370) && (mouseY < 390) && (gameState === 2) && (user.turn === 0)){
        power.x = mouseX;
        //power.y = mouseY;
    }
    if( (mouseX > 320) && (mouseX < 390) && (mouseY > 360) && (mouseY < 390) && (gameState === 2) && (user.turn === 1)){
        if(balls.length > 1){
            balls.slice(0,balls.length);
        }
        balls.push(new ballObj(user.pos.x, user.pos.y));
        user.shoot = 1;
        var xadd1 = user.pos.x + 30*cos(user.sangle);
        var yadd1 = user.pos.y + 30*sin(user.sangle);
        
       // balls[1].pos.x = user.pos.x;
      //  ball[0].pos.y = user.pos.y;
        balls[0].velocity = new PVector(xadd1-user.pos.x, yadd1 -  user.pos.y);
        //ball.velocity = new PVector(1, 3);
        balls[0].velocity.div(3);
        balls[0].shoot = true;
        balls[0].release = false;
        text("something", 200, 200,40, 40);
        //user.shoot = 0;
    }
 
};

var instruction = function(){
    fill(175, 233, 247);
    noStroke();
    rect( 75, 130, 250, 250);
    fill(235, 40, 128);
    textSize(15);
    text("In this game, you will try to shoot your enemies, and try to take all of their health to win. If you out of health, you will lose and the game is over. Mind the wind when you shoot.", 80, 140, 240, 100);
    
    text("Move Around:",160,250);
    text("Using Left/Right Key",140,270);
    text("Change shooting Angle:",130,300);
    text("Using UP/DOWN Key",135,320);
    fill(8, 8, 8);
    text("BACK",180,360);

};
var keyPressed = function() {
    keyArray[keyCode] = 1;
};
var keyReleased = function() {
    keyArray[keyCode] = 0;
};

var draw = function() {
    background(3, 102, 242);
    noStroke();
    
    drawSky();
    drawmount();

    // mountains
    switch(gameState){
       case 0 : // start screen
           state0();
           break;
        case 1:
            instruction();
        break;
        case 2:
            user.draw();
            user.move();
            power.draw();
            for (var i=0; i<balls.length; i++) {
                balls[i].updateposition();
                balls[i].draw();
            }
            ball.updateposition();
            ball.draw();
            
        break;
        
   }

    

};





}};
