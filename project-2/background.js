function preload() {
  pondBG = loadImage('assets/pond.jpg');
  pondSketch = loadImage('assets/pondSketch.jpg');
  ambience = loadSound('assets/lakeambienceCut.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(pondBG);
  drawingContext.save();
  rect(0,0,mouseX, height);
  drawingContext.clip();
  //imageMode(CENTER);
  image(pondSketch,0,0,width, height);
  drawingContext.restore();
}

