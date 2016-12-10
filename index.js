var sketchProc=function(processingInstance){ with (processingInstance){
size(400, 400); 
frameRate(60);


//ProgramCodeGoesHere
angleMode = "radians";
var adeg = TWO_PI/360;
var keyArray = [];
var gameState = 0;
var curFrame = frameCount;
var GameTurn = 0;
var gamelevel = 3;
var mountains = [[],[],[],[],[],[]]; 
var a=random(1500);
var gravity = new PVector(0, 0.3);
var shootForce = new PVector(1,-1);
var wind = new PVector(1, 0);
var windSpeed = 0;
var balls = [];
var wincheck = 0;
var monteCarlo = function() {
    var v1 = random(150, 255);
    var v2 = random(150, 255);
    while (v2 > v1) {
        v1 = random(150, 255);
        v2 = random(150, 255);
    }
    return(v1);
};
for (var i=0; i<=5; i++) {
    for (var j=0; j<=40; j++) {
        var n = noise(a);
        mountains[i][j] = map(n,0,1,0,400-i*50);
        a += 0.025;  // ruggedness
    }
}

var drawSky = function(size){
     // sky
    var n1 = a;  
    for (var x=0; x<=400; x+=8) {
        var n2 = 0;
        for (var y=-200; y<=size; y+=8) {
            var c = map(noise(n1,n2),0,1,0,255);
            fill(179, 191, c+13,150);
            rect(x,y,8,8);
            n2 += 0.05; // step size in noise
        }
        n1 += 0.02; // step size in noise
    }
    a -= 0.01;  // speed of clouds
    fill(232, 220, 54, 200);
    ellipse(30, 50,30,30);
    fill(232, 220, 54, 150);
    ellipse(30, 50,35,35);
    fill(232, 220, 54, 100);
    ellipse(30, 50,40,40);
    fill(232, 220, 54, 50);
    ellipse(30, 50,45,45);
    fill(232, 220, 54, 25);
    ellipse(30, 50,50,50);
};
var drawmount = function(){
    for ( var x=0; x<=5; x++) {
        for (var y=0; y<=40; y++) {
            fill(20 + x*5, 20+x*10, 100);
            // draw quads of width 10 pixels
            quad(y*10,mountains[x][y]+x*55,(y+1)*10,mountains[x][y+1]+(x)*55,(y+1)*10,400,y*10,400);
        }
    }
};

// Snow Objects and Functions
var particleObj = function(x, y) {
    this.position = new PVector(x, y);
    this.velocity = new PVector(random(-0.05, 0.05), random(0.5, 2));
    this.size = random(1, 2);
    this.position.y -= (18 - this.size);
    this.c1 = monteCarlo();
    this.timeLeft = 400;
};
var particles = [];
particleObj.prototype.move = function() {
    this.position.add(this.velocity);
    this.timeLeft--;
};
particleObj.prototype.draw = function() {
    noStroke();
    fill(this.c1, this.c1, this.c1, this.timeLeft);
    ellipse(this.position.x, this.position.y, this.size, this.size*2);
};

// Define Ojects 
var makeFall = function() {
    if (particles.length < 400) {
        particles.push(new particleObj(random(0,400), -200));
        particles.push(new particleObj(random(0,400), -200));
    }
    for (var i=0; i<particles.length; i++) {
        if ((particles[i].timeLeft > 0) && (particles[i].position.y < 400)) {
            particles[i].draw();
            particles[i].move();
        }
        else {
            particles.splice(i, 1);
        }
    }
};
var waitState = function(){
    this.turn = 0;
};
var moveState = function() {
    this.step = 0;
    this.numMove = 0;
};
var angleState = function() {
    this.angle = 0;
};
var shootState = function(){
    this.angle = 0;
};
var ballObj = function(x, y, z, type) {
    this.pos = new PVector(x,y);
    this.velocity = new PVector(4,-5);
    this.acceleration = new PVector(0, 0);
    this.aAcc = 0;
    this.own =z;
    this.aVelocity = 0;
    this.angle = 0;
    this.size = 200;
    this.mass = this.size / 5;
    this.Bshoot = false;
    this.hit = false;
    this.range = false;
    this.type = type;
};
var uObj = function(x,y){
    this.moves = 100;
    this.pos = new PVector(x,y);
    this.sangle = 280*adeg;
    this.turn = 0;
    this.health = 100;
    this.Ushoot = 0;
    this.type = 1;
    this.bullet = new ballObj(x,y,1,this.type);
    this.power = 0;
    
};
var powerObj = function(x,y){
    this.x = x;
    this.y = y; 
    this.drag = false;

    
};
var NPCObj = function(x,y, turnNum){
    this.pos = new PVector(x,y);
    this.bullet = new ballObj(x,y,2,2);
    this.sangle = 260*adeg;
    this.myTurn = turnNum;
    this.Nshoot = 0;
    this.NPCState = [new waitState(), new moveState(), new angleState(), new shootState()];
    this.turnAngle = 0;
    this.curState = 0;
    this.numMoves = 0;
    this.dir = 0;
    this.step = 0;
    this.step1 = 0;
    this.step2 =0;
    this.goFirst = 0;
    this.v0 = 0;
    this.health = 100;
};
// Declare new Objects
var exObj = function(x, y) {
    this.position = new PVector(x, y);
    this.velocity = new PVector(random(0, TWO_PI), random(-0.4, 0.4));
    this.size = random(1, 15);
    this.c1 = random(155, 255);
    this.c2 = random(0, 255);
    this.timeLeft = 120;
};
var power = new powerObj(250,380);
var user =  new uObj(round(random(100, 350)),round(random(100, 350)));
var ball = new ballObj(100,100);
//var NPC = [new NPCObj(320, 180, 2), new NPCObj(320, 250, 3), new NPCObj(200, 250, 4)];
var NPC = [];
var explode = [];
var makeNPC = function(){
    if(gamelevel === 1){
        var a = 100;
        for(var i = 0; i < 2; i++){
            var xcor = round(random(20, 380));
            NPC.push(new NPCObj(xcor, a, i+1));
            a = a + round(random(40, 100));
        }
    }
    else if (gamelevel === 2){
        var a = 100;
        for(var i = 0; i < 4; i++){
            var xcor = round(random(20, 380));
            NPC.push(new NPCObj(xcor, a, i+1));
            a = a + round(random(40, 60));
        }
    }
    else if (gamelevel === 3){
        var a = 100;
        for(var i = 0; i < 6; i++){
            var xcor = round(random(20, 380));
            NPC.push(new NPCObj(xcor, a, i+1));
            a = a + round(random(30, 40));
        }
    }
};
//explode functions
exObj.prototype.move = function() {
    var v = new PVector(this.velocity.y*cos(this.velocity.x),
    this.velocity.y*sin(this.velocity.x));
    this.position.add(v);   
    this.timeLeft--;
};
var makeExplosion = function(x, y) {
    for (var i=0; i<300; i++) {
        explode.push(new exObj(x, y));
    }
};
exObj.prototype.draw = function() {
    noStroke();
    fill(this.c1, this.c2, 0, this.timeLeft);
    ellipse(this.position.x, this.position.y, this.size, this.size);
};
// Button function
var dcircle = function(x, y, s, r, b, g, z) {
    s -= z;
    var fs = s - z;
    for(var i = 0; i < s; i ++) {
        noFill();
        stroke(r - (i * 1.5 - fs), b - (i * 1.5 - fs), g - (i * 1.5 - fs));
        ellipse(x, y, i, i);
    }
};

// All Draw Function
uObj.prototype.draw = function() {
    this.bullet.draw();
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
    
    strokeWeight(3);
    stroke(161, 156, 156);
    line(this.pos.x - 25, this.pos.y - 15, this.pos.x +25 , this.pos.y-15);
    stroke(250, 37, 73);

    line(this.pos.x - 25, this.pos.y - 15, this.pos.x - 25 + this.health/2, this.pos.y-15);
    //line(this.pos.x, this.pos.y, this.pos.x + xadd,this.pos.y + yadd);
    fill(245, 175, 35);
    noStroke();
    triangle(xadd1, yadd1, xadd2, yadd2, xadd3, yadd3);
};
NPCObj.prototype.draw = function() {
    if(this.health > 0){
    this.bullet.draw();
    this.bullet.updateposition();
    noStroke();
    fill(168, 168, 168);
    ellipse(this.pos.x, this.pos.y,40, 10);
    fill(36, 36, 36);
    ellipse(this.pos.x, this.pos.y,20, 5);
    fill(8, 6, 1, 150);
    arc(this.pos.x, this.pos.y,20, 20, 180*adeg, 360*adeg);
    
    
    var xadd1 = this.pos.x + 30*cos(this.sangle);
    var yadd1 = this.pos.y + 30*sin(this.sangle);
    var xadd2 = this.pos.x + 25*cos(this.sangle + 15*adeg );
    var yadd2 = this.pos.y + 25*sin(this.sangle + 15*adeg);
    var xadd3 = this.pos.x + 25*cos(this.sangle - 15*adeg);
    var yadd3 = this.pos.y + 25*sin(this.sangle - 15*adeg);
    fill(0, 0, 0);
    noStroke();
    fill(245, 175, 35);
    triangle(xadd1, yadd1, xadd2, yadd2, xadd3, yadd3);
    strokeWeight(2);
    stroke(255, 0, 0);
    strokeWeight(3);
    stroke(161, 156, 156);
    line(this.pos.x - 25, this.pos.y - 15, this.pos.x +25 , this.pos.y-15);
    stroke(162, 235, 120);
    line(this.pos.x - 25, this.pos.y - 15, this.pos.x - 25 + this.health/2, this.pos.y-15);
    
    //line(this.pos.x, this.pos.y, this.pos.x + xadd,this.pos.y + yadd);
    }
};
ballObj.prototype.draw = function() {
    
    if(this.Bshoot){
        if(this.type === 1){
            noStroke();
            fill(255, 238, 0);
            pushMatrix();
            translate(this.pos.x, this.pos.y);
            rotate(this.angle);
            ellipse(0, 5, 5, 5);
            ellipse(0, -5, 5, 5);
            popMatrix();
        }
        else if ( this.type === 2){
            noStroke();
            var ang = this.velocity.heading();
            pushMatrix();
            translate(this.pos.x, this.pos.y);
            rotate(ang);
            fill(209, 202, 202);
            ellipse(0, 0, 20, 10);
            fill(0, 0, 0);
            arc(-10,5, 10, 10,50*adeg, -50*adeg);
           // ellipse(0, -5, 5, 5);
            popMatrix();
        }
    }
};
powerObj.prototype.draw = function() {
    var w = this.x - 90;
    var pwer = 4.3 - 0.0125*(power.x-100);
    fill(0, 111, 255);
    noStroke();
    fill(150, 148, 148);
    rect(90,370,210,20, 20);
    noStroke();
    fill(30, 112, 235);
    rect(90,370,w,20, 10);
    fill(113, 166, 240);
    rect(90,371,w,10, 20);
    fill(232, 225, 232);
    ellipse(this.x, this.y, 30, 30);
    fill(173, 166, 168);
    arc(this.x, this.y, 30, 30, 0, 180*adeg);
    dcircle(this.x, this.y, 45, 196, 24, 25, 19);
    stroke(245, 245, 245);
    line(95, 397, 295, 397);
    stroke(0, 207, 222);
    if(user.moves > 0){
        line(95, 397, user.moves*2 + 95 , 397);
    }
    noStroke();
    fill(222, 219, 222);
    ellipse(360,385, 88,88);
    fill(179, 173, 173);
    arc(360, 385, 88,88, 0, 180*adeg);
    fill(235, 38, 94);
    dcircle(360, 385, 100, 192, 30, 30, 20);
    var pow = round((this.x - 100)/2);
    var str = pow.toString();
    fill(235, 38, 94);
    rect(60, 370, 25, 20, 5);
    
    var f = createFont("tohoma");
    textFont(f);
    textSize(25);
    fill(0, 0, 0);
    text("FIRE", 328, 370, 60,50);
    fill(196, 196, 196);
    text("FIRE", 330, 369, 60,50);
    textSize(12);
    text(str, 63, 375, 60, 60);
   // text(pwer, 100, 100, 50, 50);
};

// user Object functions
uObj.prototype.move =function(){
    this.bullet.updateposition();
    if(this.turn === GameTurn ){
     if((keyArray[LEFT] === 1) && (this.pos.x > 35) && (this.moves > 0)){
            this.moves = this.moves -1;
            this.pos.x= this.pos.x -1;
    }
       
    if((keyArray[RIGHT] === 1) && (this.pos.x <780) && (this.moves > 0)){
        this.moves = this.moves -1;
        this.pos.x= this.pos.x +1;
    }
    if((keyArray[DOWN] === 1) && (this.pos.y > 20)){
        if(this.sangle < 360*adeg){
            this.sangle= this.sangle + 1*adeg;
        }
    }
      
    if((keyArray[UP] === 1) && (this.pos.y <380)){
        if(this.sangle > 180*adeg){
            this.sangle= this.sangle - 1*adeg;
        }
    }
    }
    
   
};
uObj.prototype.handleShoot = function(mx, my){
    if( (mx > 320) && (mx < 400) && (my > 340) && (my < 400) && (gameState === 2) && (this.turn === GameTurn)){
        if( this.bullet.Bshoot === false){
        var pwer = 4.3 - 0.0125*(power.x-100);
        this.bullet.pos.x = this.pos.x;
        this.bullet.pos.y = this.pos.y;
        var xadd1 = 30*cos(this.sangle);
        var yadd1 = 30*sin(this.sangle);
        this.bullet.velocity = new PVector(xadd1, yadd1);
        this.bullet.velocity.div(pwer);
        this.bullet.release = false;
        this.bullet.Bshoot = true;
        this.Ushoot = true; 
        }
        
    }
    

};
uObj.prototype.changeTurn = function(){
    if((GameTurn === 0) && (this.Ushoot === true) && (this.bullet.range === true)){
        this.Ushoot = false;
        this.bullet.range = false;
        GameTurn++;
    }
};
// NPC Function
NPCObj.prototype.handleShoot = function(mx, my){
    if(this.myTurn === GameTurn){
        if( this.bullet.Bshoot === false){
        var pwer = 4.3 - 0.0125*(power.x-100);
        this.bullet.pos.x = this.pos.x;
        this.bullet.pos.y = this.pos.y;
        var xadd1 =   30*cos(this.sangle);
        var yadd1 =   30*sin(this.sangle);
        this.bullet.velocity = new PVector(xadd1, yadd1);
        this.bullet.velocity.div(2);
        this.bullet.release = false;
        this.bullet.Bshoot = true;
        this.Nshoot = true;
        }
        
    }
    

};
NPCObj.prototype.changeState = function(x){
    this.curState = x;
};
NPCObj.prototype.computeVel = function(xf, yf){
    if(this.myTurn === GameTurn){
        if( this.bullet.Bshoot === false){
            var ang = 360*adeg - this.sangle;
            var top = 0.5*gravity.y*((xf - this.pos.x)*(xf - this.pos.x));
            var under = -yf + this.pos.y - (tan(this.sangle)*(xf- this.pos.x));
            var dev = top/under;
            if( dev < 0){
                var ab = abs(dev);
                this.v0 = (sqrt(ab))/cos(ang);
            }
            else if( dev > 0){
                this.v0 = (sqrt(dev))/cos(ang);
            }
            else{
                this.v0 = random(0, 12);
            }
            if( abs(this.v0) > 70){
                this.v0 = random(0, 12);
            }
            this.bullet.pos.x = this.pos.x;
            this.bullet.pos.y = this.pos.y;
            var xadd1 =  abs(this.v0)*cos(this.sangle);
            var yadd1 =   abs(this.v0)*sin(this.sangle);
            this.bullet.velocity = new PVector(xadd1, yadd1);

            this.bullet.Bshoot = true;
            this.Nshoot = true;  
        }
        
    }
};
//State Machine
waitState.prototype.execute = function(me){
    if(GameTurn === me.myTurn){
        me.step1 = round(random(10, 50));
        me.step2 = round(random(5, 30));
        me.step = round(random(5, 30));
        me.goFirst = round(random(1, 2));
        me.numMoves =round(random(0, 2)) ;
        me.dir = round(random(1, 2));
        me.Nshoot = false;
        me.bullet.range = false;
        me.bullet.pos.x = me.pos.x;
        me.bullet.pos.y = me.pos.y;
        me.bullet.Bshoot = false;
        me.changeState(1);
    }
};
moveState.prototype.execute = function(me){
    if(me.health <= 0){
        me.changeState(3);
    }
    if(me.numMoves === 0){
        if(me.pos.x > user.pos.x){
            me.turnAngle = round(random(0, 30))*adeg + 180*adeg ;
        }
        else{
            me.turnAngle = round(random(0, 30))*adeg + 270*adeg;
        }
        me.changeState(2);
    }
    if((me.step > 0) && (me.pos.x > 20) && (me.pos.x < 380) && ((me.step1 > 0) || (me.step2 > 0) )){
        if( me.numMoves === 1){
            if( me.dir === 1){
                me.pos.x--;
                me.step--;
            }
            else{
                me.pos.x++;
                me.step--;
            }
        }
        else if( me.numMoves === 2){
            if( me.goFirst === 1 ){
                me.pos.x++;
                me.step1--;
                if(me.step1 < 0){
                    me.goFirst = 2;
                }
            }
            else{
                me.pos.x--;
                me.step2--;
                if(me.step2 < 0){
                    me.goFirst = 1;
                }
            }
        }
    }
    else{
        if(me.pos.x > user.pos.x){
            me.turnAngle = round(random(0, 30))*adeg + 180*adeg ;
        }
        else{
            me.turnAngle = round(random(0, 30))*adeg + 270*adeg;
        }
        me.changeState(2);
    }
    fill(232, 0, 0);
    //textSize(15);
    //text(me.v0, me.pos.x, me.pos.y + 40, 20, 20);
    //text(me.turnAngle, me.pos.x, me.pos.y + 50, 20, 20);
    //text(me.sangle, me.pos.x, me.pos.y + 60, 20, 20);
};
angleState.prototype.execute = function(me){
    if(me.health <= 0){
        me.changeState(3);
    }
    if( me.sangle > (me.turnAngle+ 5*adeg)){
        me.sangle = me.sangle - adeg;
    }
    else if( me.sangle < (me.turnAngle - 5*adeg)){
        me.sangle = me.sangle + adeg;
    }
    else{
      //  me.computeVel(user.pos.x, user.pos.x);
        if((me.Nshoot === true)&& (me.bullet.range === true)){
            me.changeState(3);
        }
        else if(me.bullet.Bshoot === false) {
            me.computeVel(user.pos.x, user.pos.x);
        }
    }
    
    //fill(232, 0, 0);
    //textSize(15);
    //text(me.Nshoot, me.pos.x, me.pos.y + 30, 10, 10);
   // text(me.bullet.range, me.pos.x, me.pos.y + 20, 10, 10);
   // text(me.bullet.Bshoot, me.pos.x, me.pos.y + 8, 10, 10);
  //  text(me.v0, me.pos.x, me.pos.y + 40, 20, 20);
  //  text(me.turnAngle, me.pos.x, me.pos.y + 50, 20, 20);
  //  text(me.sangle, me.pos.x, me.pos.y + 60, 20, 20);

};
shootState.prototype.execute = function(me){
    if(GameTurn >= NPC.length){
        user.bullet.pos.x = user.pos.x;
        user.bullet.pos.y = user.pos.y;
        user.bullet.range = false;
        user.moves = 100;
        GameTurn = 0;
        me.changeState(0);
    }
    else{
        GameTurn++;
        me.changeState(0);
    }
    
};
//Ball Object Functions
ballObj.prototype.applyForce = function(force) {
    var f = PVector.div(force, this.mass);
    this.acceleration.add(f);
};
ballObj.prototype.checkBall = function(){
    if(this.pos.y > 400){
        this.range = true;
        this.Bshoot = false;
    }
    if(this.Bshoot === true){
        for(var i = 0; i < NPC.length; i++){
            var dis = dist(this.pos.x, this.pos.y, NPC[i].pos.x, NPC[i].pos.y);
            if((dis < 20) && (this.own ===1) && (NPC[i].health > 0) ){
                makeExplosion(this.pos.x, this.pos.y);
                NPC[i].health = NPC[i].health - 20;
                this.Bshoot = false;
                this.range = true;
            }
        }
        var dis2 = dist(this.pos.x, this.pos.y, user.pos.x, user.pos.y);
        if((dis2 < 20) && (this.own ===2)){
            makeExplosion(this.pos.x, this.pos.y);
            if(gamelevel === 1){
                user.health = user.health - 20;
            }
            else{
                user.health = user.health - 30;
            }
            this.Bshoot = false;
            this.range = true;
        }
    }
};
ballObj.prototype.updateposition = function() {
    this.checkBall();
    if(this.Bshoot){
        var gravityForce = PVector.mult(gravity, this.mass);
        this.applyForce(gravityForce);
       // var windForce = PVector.mult(wind, this.mass);
      //  windForce.mult(windSpeed);
      //  this.applyForce(windForce);
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

//Power Object Functions
powerObj.prototype.handleClick = function(mx, my){
    if( dist(mx,my, this.x, this.y) <25){
        this.drag = true;
    }
    else{
        this.drag = false;
    }
    
};
powerObj.prototype.handleDrag = function(mx,my){
    if(this.drag ){
        if(mx < 100){
            this.x = 100;
        }
        else if( mx > 300){
            this.x = 300;
        }
        else{
            this.x = mx;
        }
    }
};
powerObj.prototype.stopDragging = function(mx, my){
    this.drag = false;
    user.power = this.x - 100;
};

//Mouse Functions
mousePressed = function(){
    power.handleClick(mouseX, mouseY);
    user.handleShoot(mouseX,mouseY);
    if( (mouseX > 140) && (mouseX < 260) && (mouseY > 130) && (mouseY < 170)){
        if(gameState === 0){
            gameState = 3; // start game
        }
        else if (gameState === 3){
            gamelevel = 1; // level easy
            makeNPC();
            gameState = 2; // game play
        }
    }
    if( (mouseX > 140) && (mouseX < 260) && (mouseY > 200) && (mouseY < 240)){
        if(gameState === 0){
            gameState = 1; // instruction
        }
        else if (gameState === 3){
            gamelevel = 2; // medium
            makeNPC();
            gameState = 2; // game play
        }

    }
    if( (mouseX > 140) && (mouseX < 260) && (mouseY > 270) && (mouseY < 310)){
        if (gameState === 3){
            gamelevel = 3; // medium
            makeNPC();
            gameState = 2; // game play
        }

    }
    if( (mouseX > 180) && (mouseX < 220) && (mouseY > 345) && (mouseY < 370) && (gameState === 1)){
        gameState = 0; // go back to main menu from instruction menu
    }
};
mouseDragged = function(){
    power.handleDrag(mouseX, mouseY);

};
mouseReleased = function() {
    power.stopDragging(mouseX, mouseY);
};

// Other functions

var drawExplosion = function(){
    for (var i=0; i<explode.length; i++) {
        if (explode[i].timeLeft > 0) {
            explode[i].draw();
            explode[i].move();
        }
        else {
            explode.splice(i, 1);
        }
    }
    
};
var makeExplosion = function(x, y) {
    for (var i=0; i<100; i++) {
        explode.push(new exObj(x, y));
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
var makewind = function(){
    if (curFrame < frameCount-180) {
        curFrame = frameCount;
        windSpeed = random(-0.03, 0.03);
    }
    noStroke();
   
    fill(255, 255, 255);
    rect(305, 5, 90, 30, 5);
    fill(0, 0, 0);
    stroke(0, 0, 0);
    
    if(windSpeed < 0){
        triangle(340, 15, 340, 25, 330,20);
        line(340, 20, 380, 20);
        textSize(10);
        text(windSpeed*100, 310, 15, 10, 10);
    }
    else{
        triangle(380, 15, 380, 25, 390,20);
        line(340, 20, 380, 20);
        textSize(10);
        text(windSpeed*100, 310, 15, 10, 10);
    }
};
var state0 = function(){
    noStroke();
    fill(33, 32, 33);
    rect( 138, 132, 120, 40);
    rect( 138, 203, 120, 40);
    fill(175, 233, 247);
    rect( 140, 130, 120, 40);
    rect( 140, 200, 120, 40);
    textSize(25);
    fill(64, 57, 57);
    text("START",166,163);
    text("HINT",176,234);
    fill(235, 40, 128);
    text("START",167,161);
    text("HINT",178,232);
    
    fill(235, 235, 235);
    textSize(15);
    text("DEV:NHAN PHAM", 152, 383, 300, 200);
    textSize(40);
    var f = createFont("impact");
    textFont(f);
    fill(0, 0, 0);
    text("PLANETS INVADER", 63, 53, 400, 100);
    fill(189, 0, 0);
    text("PLANETS INVADER", 65, 50, 400, 100);
};
var state3 = function(){
    
    noStroke();
    fill(33, 32, 33);
    rect( 138, 132, 120, 40);
    rect( 138, 203, 120, 40);
    rect( 138, 273, 120, 40);
    fill(175, 233, 247);
    rect( 140, 130, 120, 40);
    rect( 140, 200, 120, 40);
    rect( 140, 270, 120, 40);
    textSize(25);
    fill(64, 57, 57);
    text("EASY",176,163);
    text("MEDIUM",158,234);
    text("HARD",172,301);
    fill(235, 40, 128);
    text("EASY",177,161);
    text("MEDIUM",159,232);
    text("HARD",173,299);
    fill(235, 235, 235);
    textSize(15);
    text("DEV:NHAN PHAM", 152, 383, 300, 200);
    textSize(40);
    var f = createFont("impact");
    textFont(f);
    fill(0, 0, 0);
    text("PLANETS INVADER", 63, 53, 400, 100);
    fill(189, 0, 0);
    text("PLANETS INVADER", 65, 50, 400, 100);
};
var welcomeMove = function(){
    user.draw();
    if( user.pos.x < 0){
        user.pos.x = 400;
    }
    if(user.pos.x > 400){
        user.pos.x = 0;
    }
    user.pos.x++;
};
var draw = function() {
   background(242, 119, 154);
    noStroke();
    
    switch(gameState){
       case 0 : // start screen
            drawSky(250);
            drawmount();
            welcomeMove();
            makeFall();
            state0();
           break;
        case 1:
            drawSky(250);
            drawmount();
            makeFall();
            instruction();
        break;
        case 2:
            noStroke();
            if( user.bullet.pos.y < 20){
                pushMatrix();
                translate(0, 200);
                drawSky(250);
                drawmount();
                user.draw();
                user.move();
                user.changeTurn();
                for (var i=0; i<NPC.length; i++) {
                    //if(NPC[i].bullet.pos.y < 20){
                   //     pushMatrix();
                    //    translate(0, 200);
                   //     NPC[i].draw();
                    //    NPC[i].NPCState[NPC[i].curState].execute(NPC[i]);
                    //    popMatrix();
                    //}
                   // else{
                        NPC[i].draw();
                        NPC[i].NPCState[NPC[i].curState].execute(NPC[i]);
                   // }
                }
                drawExplosion();
                popMatrix();
            }
            else{
                drawSky(250);
                drawmount();
                user.draw();
                user.move();
                user.changeTurn();
                for (var i=0; i<NPC.length; i++) {
                        NPC[i].draw();
                        NPC[i].NPCState[NPC[i].curState].execute(NPC[i]);
                }
                drawExplosion();
            }
            power.draw();
            makewind();
            var check = 0;
            for (var i=0; i<NPC.length; i++) {
                if(NPC[i].health <= 0){
                    check++;
                }
                if(check === NPC.length){
                    gameState = 4;
                }
            }
            if(user.health  <= 0){
                gameState = 5;
            }
        break;
        case 3: // chose level
            drawSky(250);
            drawmount();
            welcomeMove();
            makeFall();
            state3();
            break;
        case 4: // game win
            drawSky(250);
            drawmount();
            makeFall();
            textSize(40);
            var f = createFont("impact");
            textFont(f);
            fill(0, 0, 0);
            text("MISSION FAIL", 93, 103, 400, 100);
            fill(189, 0, 0);
            text("MISSION FAIL", 100, 100, 400, 100);
            break;
        case 5: // game lose
            drawSky(250);
            drawmount();
            makeFall();
            if (curFrame < frameCount-15) {
                curFrame = frameCount;
                makeExplosion(random(20, 380), random(30,380));
        
            }
            drawExplosion();
            textSize(40);
            var f = createFont("impact");
            textFont(f);
            fill(0, 0, 0);
            text("MISSION ACCOMPLISH", 39, 103, 400, 100);
            fill(189, 0, 0);
            text("MISSION ACCOMPLISH", 33, 100, 400, 100);
            
            break;
            
            
   }
    makeFall();
};









}};
