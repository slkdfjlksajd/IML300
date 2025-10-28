function preload() {
  pondBG = loadImage('assets/pond.jpg', 
    // Success callback
    () => console.log('pondBG loaded successfully'),
    // Error callback
    (err) => console.error('Error loading pondBG:', err)
  );
  pondSketch = loadImage('assets/pondSketch.jpg',
    // Success callback
    () => console.log('pondSketch loaded successfully'),
    // Error callback
    (err) => console.error('Error loading pondSketch:', err)
  );
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
  image(pondSketch,windowWidth/2,windowHeight/2,width, height);
  drawingContext.restore();
}

