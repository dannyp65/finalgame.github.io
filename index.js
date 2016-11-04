var sketchProc=function(processingInstance){ with (processingInstance){
size(400, 400); 
frameRate(60);


//ProgramCodeGoesHere
//frameRate(10);
var gameState = 0;
var mountains = [[],[],[],[],[],[]]; 
var a=random(1500);
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
        gameState = 2;
    }
    if( (mouseX > 140) && (mouseX < 260) && (mouseY > 200) && (mouseY < 240) && (gameState === 0)){
        gameState = 1;
    }
    if( (mouseX > 180) && (mouseX < 220) && (mouseY > 345) && (mouseY < 370) && (gameState === 1)){
        gameState = 0;
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
        
   }

    

};



}};
