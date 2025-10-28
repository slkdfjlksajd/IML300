function preload() {
  pondBG = loadImage('pond.jpg');
  pondSketch = loadImage('pond copy.jpg');
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