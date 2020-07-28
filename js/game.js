// create canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

// background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
    bgReady = true;
};
bgImage.src = "images/background2.png";

// wall image
var wallReady = false;
var wallImage = new Image();
wallImage.onload = function () {
    wallReady = true;
};
wallImage.src = "images/wall.png";

// daemon image
var daemonReady = false;
var daemonImage = new Image();
daemonImage.onload = function () {
    daemonReady = true;
};
daemonImage.src = "images/daemon.png";

// blue image
var blueReady = false;
var blueImage = new Image();
blueImage.onload = function () {
    heroReady = true;
};
blueImage.src = "images/blue.png";

// red image
var redReady = false;
var redImage = new Image();
redImage.onload = function () {
    redReady = true;
};
redImage.src = "images/red.png";

/*****************************************************************
 *
 *  Object/method definitions
 *
 *****************************************************************/

function Vector(x, y, z) { // define vector object
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0; // x, y and z positions
};

Vector.prototype = { // define a load of methods for vectors
negative: function() {
    return new Vector(-this.x, -this.y, -this.z);
},
add: function(v) {
    if (v instanceof Vector) return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
    else return new Vector(this.x + v, this.y + v, this.z + v);
},
subtract: function(v) {
    if (v instanceof Vector) return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
    else return new Vector(this.x - v, this.y - v, this.z - v);
},
multiply: function(v) {
    if (v instanceof Vector) return new Vector(this.x * v.x, this.y * v.y, this.z * v.z);
    else return new Vector(this.x * v, this.y * v, this.z * v);
},
divide: function(v) {
    if (v instanceof Vector) return new Vector(this.x / v.x, this.y / v.y, this.z / v.z);
    else return new Vector(this.x / v, this.y / v, this.z / v);
},
equals: function(v) {
    return this.x == v.x && this.y == v.y && this.z == v.z;
},
dot: function(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
},
cross: function(v) {
    return new Vector(
                      this.y * v.z - this.z * v.y,
                      this.z * v.x - this.x * v.z,
                      this.x * v.y - this.y * v.x
                      );
},
length: function() {
    return Math.sqrt(this.dot(this));
},
unit: function() {
    return this.divide(this.length());
},
min: function() {
    return Math.min(Math.min(this.x, this.y), this.z);
},
max: function() {
    return Math.max(Math.max(this.x, this.y), this.z);
},
toAngles: function() {
    return {
    theta: Math.atan2(this.z, this.x),
    phi: Math.asin(this.y / this.length())
    };
},
angleTo: function(a) {
    return Math.acos(this.dot(a) / (this.length() * a.length()));
},
toArray: function(n) {
    return [this.x, this.y, this.z].slice(0, n || 3);
},
clone: function() {
    return new Vector(this.x, this.y, this.z);
},
init: function(x, y, z) {
    this.x = x; this.y = y; this.z = z;
    return this;
}
}; // finished with vectors

var particle = function(p,v,c) { // define particle object
    this.p = p; // position
    this.v = v; // velocity
    this.c = c; // particle type
};

/*****************************************************************
 *
 *  Variable/function definitions
 *
 *****************************************************************/

var totalV = 0;

var left = 0;
var right = 0;

var S = 0;

var TOTAL = 3;

var WALL = -1;

var mouseClickX = 0;
var mouseClickY = 0;

document.addEventListener("click",mouseClickHandler, false);
document.addEventListener("touchstart",touchHandler, false);

function touchHandler(e) {
    /*mouseClickX = (e.changedTouches.clientX);
    mouseClickY = (e.changedTouches.clientY);
    if(0<=mouseClickX && mouseClickX<=canvas.width && 0<=mouseClickY && mouseClickY<=canvas.height) {
        WALL = -WALL;
    }
    e.preventDefault();*/
    WALL = -WALL;
}

function mouseClickHandler(e) {
    /*
    mouseClickX = (e.changedTouches.clientX);
    mouseClickY = (e.changedTouches.clientY);
    if(0<=mouseClickX && mouseClickX<=canvas.width && 0<=mouseClickY && mouseClickY<=canvas.height) {
        WALL = -WALL;
    }
    */
    WALL = -WALL;
}

var plist = []; // define list of particles

var init = function () { // initalise
    
    for (var i = 0; i < TOTAL; i++){
        var xn = 32 + (Math.random() * (canvas.width - 64));
        var yn = 32 + (Math.random() * (canvas.height - 64));
        var vx = -3 +6*Math.random();
        var vy = -3 +6*Math.random();
        plist.push(new particle(new Vector(xn,yn,0),new Vector(vx,vy,0),1));
    }
    for (var i = 0; i < TOTAL; i++){
        var xn = 32 + (Math.random() * (canvas.width - 64));
        var yn = 32 + (Math.random() * (canvas.height - 64));
        var vx = -3 +6*Math.random();
        var vy = -3 +6*Math.random();
        plist.push(new particle(new Vector(xn,yn,0),new Vector(vx,vy,0),0));
    } // populate plist with 6 particles... 3 of type 1 and 3 of type 0
    // particles are randomly distributed with random velocity vectors.
};


var update = function (modifier) { // update game objects
    
    for (var i = 0; i < plist.length; i++ ){ //iterate through particles
        for (var j = i+1; j< plist.length; j++){ // compare to *other* particles
            if (
                i!=j // if the particles are not the same...
                && plist[i].p.subtract(plist[j].p).length() < 20 // and they are 'touching'
                ){
                v1 = plist[i].v.clone();
                x1 = plist[i].p.clone();
                v2 = plist[j].v.clone();
                x2 = plist[j].p.clone(); // create temporary variables for the position and velocity of particle 1 and 2
                
                plist[i].v = v1.subtract( x1.subtract(x2).multiply( (v1.subtract(v2).dot(x1.subtract(x2)))/(x1.subtract(x2).length()*x1.subtract(x2).length()) ) ); // vector calculation

                plist[j].v = v2.subtract( x2.subtract(x1).multiply( (v2.subtract(v1).dot(x2.subtract(x1)))/(x2.subtract(x1).length()*x2.subtract(x1).length()) ) ); // vector calculation
            }
        }
    }
    
    left = 0;
    right = 0;
    
    for (var i = 0; i < plist.length; i++ ){ // iterate through particles
        
        plist[i].p = plist[i].p.add(plist[i].v.multiply(1)); // update the position
        // N.B. currently, speed is not NOT locked framerate
        
        if(plist[i].p.x <= canvas.width/2 && plist[i].c == 1){
            left += 1;
        }
        if(plist[i].p.x <= canvas.width/2 && plist[i].c == 0){
            right += 1;
        }
        
        if(plist[i].p.x-16 <= 32){
            plist[i].v = new Vector(-plist[i].v.x,plist[i].v.y,0);
            plist[i].p = new Vector(33+16,plist[i].p.y,0)
        }
        if(plist[i].p.y-16 <= 32){
            plist[i].v = new Vector(plist[i].v.x,-plist[i].v.y,0);
            plist[i].p = new Vector(plist[i].p.x,33+16,0)
        }
        if(plist[i].p.x+16 >= (canvas.width-32)){
            plist[i].v = new Vector(-plist[i].v.x,plist[i].v.y,0);
            plist[i].p = new Vector(canvas.width-32-16,plist[i].p.y,0);
        }
        if(plist[i].p.y+16 >= (canvas.height-32)){
            plist[i].v = new Vector(plist[i].v.x,-plist[i].v.y,0);
            plist[i].p = new Vector(plist[i].p.x,canvas.height-32-16,0);
        } // if the particle goes off screen, bounce it back
        if(WALL > 0){
            if(plist[i].p.x+16 >= (canvas.width/2)-16
               && plist[i].p.x-16 <= (canvas.width/2)+16){
                plist[i].v = new Vector(-plist[i].v.x,plist[i].v.y,0);
            }
            if(plist[i].p.x >= (canvas.width/2)-16
                 && plist[i].p.x <= (canvas.width/2)+16){
                if(plist[i].p.x >= (canvas.width/2)){
                    plist[i].p = new Vector((canvas.width/2) + 33,plist[i].p.y,0);
                    plist[i].v = new Vector(-plist[i].v.x,plist[i].v.y,0);
                }
                if(plist[i].p.x <= (canvas.width/2)){
                    plist[i].p = new Vector((canvas.width/2) - 33,plist[i].p.y,0);
                    plist[i].v = new Vector(-plist[i].v.x,plist[i].v.y,0);
                }
            }
        }
    }
    
    S=0;
    
    if(left != 0){
        S += -1.0*((left/TOTAL) * Math.log(left/TOTAL));
    }
    if(TOTAL-left != 0){
        S += -1.0*(((TOTAL-left)/TOTAL) * Math.log((TOTAL - left)/TOTAL));
    }
    if(right != 0){
        S += -1.0*(((right)/TOTAL) * Math.log((right)/TOTAL) );
    }
    if(TOTAL-right != 0){
        S += -1.0*(((TOTAL - right)/TOTAL) * Math.log((TOTAL - right)/TOTAL));
    }
    if(TOTAL-right == 0 && TOTAL - left == 0){
        S = -1.0*(Math.log(1.0 / (2.0*TOTAL)));
    }
    if(left == 0 && right == 0){
        S = -1.0*(Math.log(1.0 / (2.0*TOTAL)));
    }
    
};

// Draw everything
var render = function () {
    if (bgReady) {
        ctx.drawImage(bgImage, 0, 0);
    }
                   
    for (var i = 0; i < plist.length; i++ ){ // iterate through particles
        if(plist[i].c == 1){
            ctx.drawImage(blueImage, plist[i].p.x-16, plist[i].p.y-16); // draw type 1 as hero
        }
        else{
            ctx.drawImage(redImage, plist[i].p.x-16, plist[i].p.y-16); // draw type 2 as monster
        }
    }
    
    if(WALL > 0){
        ctx.drawImage(wallImage,(canvas.width/2)-15,34);
    }
    
    ctx.drawImage(daemonImage,(canvas.width/2)-16,0);
    
    //ctx.clearRect((canvas.width/2)-5,0,10,canvas.height);
    
    ctx.fillStyle = "white";
    ctx.font = "24px Helvetica";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Entropy = " + S.toFixed(2), canvas.width/2 + 20, 0);
    
};

//main game loop
var main = function () {
    var now = Date.now(); // set time
    var delta = now - then; // framerate
    

    update(delta / 1000); // update
    render(); // draw
    
    then = now; // advance time
    
    requestAnimationFrame(main);
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

/*****************************************************************
 *
 *  Executable
 *
 *****************************************************************/

// play
var then = Date.now();
init();
main();
