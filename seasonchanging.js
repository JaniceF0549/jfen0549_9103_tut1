//Circles class storing information of each ball
class Circles {

  constructor(starterXPos, starterYPos, starterDiameter, colorTop, colorBottom) {
    this.ballXPos = starterXPos
    this.ballYPos = starterYPos
    this.ballDiameter = starterDiameter

    //stored random colors with min/max of browns for trunk
    this.colorTop = colorTop ?? color(random(80, 100), random(50, 70), random(40, 50));
    this.colorBottom = colorBottom ?? color(random(120, 150), random(80, 100), random(50, 80));

    this.StrokeColor = color(0)
    this.StrokeWeight = 0
    this.a = 0;
  }


  //generate trunk function, logic
  generateTrunk() {
    const segments = 3
    let y = this.ballYPos
    let x = this.ballXPos
    let prevD = this.ballDiameter

    //push initial ball
    balls.push(this)

    //logic to keep balls connected
    for (let i = 0; i < segments; i++) {
      let newD = Math.round(random(10, 80))
      //change y pos of next ball by radius of previous ball + new ball
      y -= (prevD / 2 + newD / 2)
      balls.push(new Circles(x, y, newD))
      prevD = newD

    }
  }

  generateBranches() {
    const start = balls[balls.length - 1]; // Top of the trunk
    const numBranches = 4;
    const angleOffsets = [-PI / 6, -PI / 3, -TWO_PI / 3, -(5 * PI) / 6]; // Direction spread

    const seasonColors = [
      [color(120, 255, 120), color(80, 200, 80)], // Spring (light green)
      [color(255, 230, 100), color(255, 180, 60)],  // Summer (yellow/gold)
      [color(255, 100, 0), color(150, 30, 0)],   // Autumn (orange)
      [color(120, 180, 255), color(60, 120, 200)]  // Winter (icy blue)
    ];

    for (let i = 0; i < numBranches; i++) {
      this.growBranch(start.ballXPos, start.ballYPos, 6, angleOffsets[i], seasonColors[i]);
    }
  }

  growBranch(x, y, segments, angle, colorPair) {

    let prevD = random(10, 60);

    //Starting colours for the base of the branches
    let baseTop = color(random(80, 100), random(50, 70), random(40, 50))
    let baseBottom = color(random(120, 150), random(80, 100), random(50, 80))

    for (let i = 0; i < segments; i++) {
      let newD = random(10, 60);

      let lerpAmt = sqrt(i / segments) //stronger gradient transition to colours
      // Calculate the color for this segment based on progress
      let t = i / (segments - 1); // progress from 0 to 1
      let interpolatedTop = lerpColor(baseTop, colorPair[0], lerpAmt);    // start from brown -> seasonal colour
      let interpolatedBottom = lerpColor(baseBottom, colorPair[1], lerpAmt);

      // Move in direction of angle
      x += cos(angle) * (prevD / 2 + newD / 2);
      y += sin(angle) * (prevD / 2 + newD / 2);

      let jitter = random(-PI / 10, PI / 10);
      angle += jitter; // create a wiggly path

      balls.push(new Circles(x, y, newD, interpolatedTop, interpolatedBottom));
      prevD = newD;
    }
  }

  // Draw the snow on the tree
  display(isWinter) {

    push()

    translate(this.ballXPos, this.ballYPos)

    stroke(this.StrokeColor)
    strokeWeight(this.StrokeWeight)

    // Draw the upper semicircle
    fill(this.colorTop)
    arc(0, 0, this.ballDiameter, this.ballDiameter, PI / 2, (3 * PI) / 2, PIE)

    //Draw the lower semicircle
    fill(this.colorBottom)
    arc(0, 0, this.ballDiameter, this.ballDiameter, (3 * PI) / 2, PI / 2)

    if (isWinter && bgmSound.isPlaying()) {
      fill(255, this.a);// Translucent white
      // fill(255);
      arc(0, 0, this.ballDiameter, this.ballDiameter, PI, TWO_PI)
      this.a += 1;// The snow gradually thickens
    }

    pop()

  }

}

let img;
let palette = [];
let borderColor;
let columnWidths = [];
let balls = []
// An array storing snowflake objects for simulating snow effects
let snowflakes = [];
// Used to create a graphics buffer to store graphic objects with mosaic backgrounds
let mosaicPG;
// Determine whether it is currently winter, with an initial value of true indicating winter
let isWinter = true;
// The height of snow, used to control the height of snow accumulation
let snowHeight = 0;
// Store audio objects for background music
let bgmSound;
// Custom frame counter used to control the execution frequency of certain animations
let myFrameCount = 0;
// Determine whether to enable fast playback mode, initial value of false indicates normal playback
let isFast = false;
// Use to create quick play/stop buttons
let fastButton;
// Store trunk objects for generating tree structures such as trunks and branches
let trunk;
// The scaling ratio of the tree, with an initial value of 0.5
let treeScale = 0.5;
let maskA = 100;
let fft;
let snowOffsetSize = 0;
let treeScaleOffset = 0;

function preload() {
  img = loadImage('Assets/Anwar Jalal Shemza Apple Tree.jpeg');
  bgmSound = loadSound("Assets/wintertospring.wav");
}

function setup() {
  trunk = new Circles(img.width / 2, img.height - img.height / 5.5, 50)
  trunk.generateTrunk()
  trunk.generateBranches()
  trunk.growBranch()

  fft = new p5.FFT();

  createCanvas(img.width, img.height);
  extractBackgroundPalette();

  borderColor = color(152, 182, 180); //Light gray blue border
  generateColumnWidths();
  mosaicPG = createGraphics(img.width, img.height);
  mosaicPG.noStroke();
  generateMosaicBackground();
  addTexture();
  addScratches();

  // Initialize snowflakes
  for (let i = 0; i < 50; i++) {
    snowflakes.push(new Snowflake());
  }

  // Switch to spring after 75 seconds
  bgmSound.addCue(75, function () {
    isWinter = false;
  });

  // Create a accelerate/restore button
  fastButton = createButton("Accelerate");
  fastButton.position(10, 10);
  fastButton.mousePressed(function () {
    isFast = !isFast;
    if (isFast) {
      // Accelerate playback
      bgmSound.rate(2);
      fastButton.html("Restore");
    } else {
      bgmSound.rate(1);
      fastButton.html("Accelerate");
    }
  })
}

function draw() {
  fft.analyze();
  let eMid = fft.getEnergy("mid");// Obtain intermediate frequency energy
  snowOffsetSize = map(eMid, 40, 120, 0, 15, true) //Map snowflake size
  treeScaleOffset = map(eMid, 50, 120, 0, 0.05, true) // Mapping tree scaling

  handleDraw();
  // Acceleration mode: The animation also accelerates by drawing twice
  if (isFast) {
    handleDraw()
  }
}

function handleDraw() {
  background(255);
  drawBorder();
  image(mosaicPG, 0, 0);
  drawBase()

  // trunk
  push();
  translate(width / 2, trunk.ballYPos);
  scale(treeScale); // Apply scaling
  translate(-width / 2, -trunk.ballYPos);
  for (let ball of balls) {
    ball.display(isWinter);
  }
  pop()

  //Winter Effect
  if (isWinter) {
    if (bgmSound.isPlaying()) {
      // Draw snow cover
      fill(255);
      rect(0, 555 - snowHeight, width, snowHeight);
      if (snowHeight < 30 && myFrameCount % 30 == 0) {
        snowHeight++; // Increased snow accumulation
      }
    }

    // Dim environment
    noStroke();
    fill(0, 100);
    rect(0, 0, width, height);

    // Snow falls while music is playing
    if (bgmSound.isPlaying()) {
      for (let flake of snowflakes) {
        flake.update();
        flake.display();
      }
    }
  } else {
    //Spring
    fill(255);
    rect(0, 555 - snowHeight, width, snowHeight);

    noStroke();
    fill(0, maskA);
    rect(0, 0, width, height);

    if (myFrameCount % 30 == 0) {
      // Brightening up
      if (maskA > 0) {maskA -= 5}
      // Clearing snow
      if (snowHeight > 0) {snowHeight--;}
      // The tree grows bigger
      if (treeScale < 1) {treeScale += treeScaleOffset;}
    }
  }

  myFrameCount++;
}

//Randomly sample the entire image
//Establish a backup color library
function extractBackgroundPalette() {
  let maxSamples = 50; //Maximum sampling frequency

  for (let i = 0; i < maxSamples; i++) {
    //Randomly sampled pixels
    let x = floor(random(img.width));
    let y = floor(random(img.height));
    let c = img.get(x, y);

    //Calculate saturation and brightness
    let sat = saturation(color(c));
    let bright = brightness(color(c));

    //Extract only low saturation colors as background colors
    if (sat < 40 && bright > 10 && bright < 90) {
      palette.push(color(c));
    }
  }

  //If extraction fails, use the default gray blue color scheme
  if (palette.length < 30) {
    palette = [
      color(120, 140, 160),
      color(100, 130, 150),
      color(80, 110, 130)
    ];
  }
}

//Only draw the background.
//Prevent the visual effect of apple tree generation in the code 
//from being affected by extracting too bright colors
//of apple trees from the original image
//These colors will be replaced by the colors in the color library
function getBackgroundColor(x, y) {
  let attempt = 0;
  let maxAttempts = 5;

  while (attempt < maxAttempts) {
    let c = color(img.get(x, y));
    let s = saturation(c);
    let b = brightness(c);

    if (s < 40 && b > 10 && b < 90) {
      return c; //Meet the background condition: not very bright
    }

    //Try moving around to resample first if the conditions are not met
    x = constrain(x + floor(random(-15, 15)), 0, img.width - 1);
    y = constrain(y + floor(random(-15, 15)), 0, img.height - 1);
    attempt++;
  }

  //If multiple attempts are unsuccessful
  //return a random default background color in the color library
  return random(palette);
}

//Generate random column width
function generateColumnWidths() {
  let margin = 25;
  let minWidth = 20;
  let maxWidth = 40;
  let x = margin; //Starting coordinate
  let remaining = width - 2 * margin;//Remaining available width

  columnWidths = [];

  while (remaining >= minWidth) {
    //Ensure that the last square is not too small
    let maxW = min(maxWidth, remaining);
    let w = floor(random(minWidth, maxW + 1));

    //If the remaining width is less than the minimum width, fill it directly
    if (remaining - w < minWidth) {
      w = remaining;
    }

    columnWidths.push(w); //Record column width
    x += w; //Move coordinate
    remaining -= w; //Update remaining width
  }

  //lets draw the base and trunk to the canvas
  drawBase();
  drawTrunk();

}

//Border drawing
function drawBorder() {
  background(borderColor);
  noStroke();
  fill(borderColor);
  rect(0, 0, img.width, img.height);
}

function generateMosaicBackground() {
  let margin = 25;
  let segmentHeight = 25;
  let prevRowColors = []; //Store the color of the previous row

  for (let y = margin; y < height - margin; y += segmentHeight) {
    let x = margin;
    let thisRowColors = []; //Current row color

    for (let i = 0; i < columnWidths.length; i++) {
      let segmentWidth = columnWidths[i];
      //Calculate the center coordinates of the segment and get the color
      let cx = constrain(floor(x + segmentWidth / 2), 0, img.width - 1);
      let cy = constrain(floor(y + segmentHeight / 2), 0, img.height - 1);
      let baseColor = getBackgroundColor(cx, cy);

      //Smooth processing
      //Mixing colors in the same column as the previous row
      //Make the background look softer
      if (prevRowColors.length === columnWidths.length) {
        let upperColor = prevRowColors[i];
        baseColor = lerpColor(upperColor, baseColor, random(0.3, 0.7));
      }

      mosaicPG.fill(baseColor);
      mosaicPG.rect(x, y, segmentWidth, segmentHeight);

      thisRowColors.push(baseColor); //Record the current color
      x += segmentWidth; //Move coordinate
    }

    prevRowColors = thisRowColors; //Save the color of the current line for use in the next line
  }
}

//Present the texture of the fabric based on the original image
function addTexture() {
  //Dot shaped particles on the fabric surface
  for (let i = 0; i < 30000; i++) {
    let x = random(width);
    let y = random(height);
    mosaicPG.stroke(255, 20);
    mosaicPG.point(x, y);
  }

  //Horizontal fine lines
  mosaicPG.stroke(255, 8);
  for (let y = 0; y < height; y += 5) { //Every 5 pixels, one line
    mosaicPG.line(0, y + random(-1, 1), width, y + random(-1, 1));
  }
}

function addScratches() {
  mosaicPG.stroke(255, 30);
  for (let i = 0; i < 200; i++) {
    let x1 = random(width);
    let y1 = random(height);
    let x2 = x1 + random(-30, 30);
    let y2 = y1 + random(-30, 30);
    mosaicPG.line(x1, y1, x2, y2);
  }
}

// Draw the trunk, which consists of three half-green and half-dark green circles, arranged vertically against the base.
function drawTrunk() {
  let x = width / 2; // Trunk round horizontal center
  let offsetY = 60; // To adjust the alignment
  let scale = 1.1; // To adjust the overall size

  // Calculate the bottom position of the trunk (stick to the top of the base)
  let baseTop = height - 160 * scale + offsetY;
  let r = 40 * scale;      // Circle radius (after enlargement)
  let spacing = r;         // Vertical spacing between circles (edges just touching)
  let bottomY = baseTop;   // The Y coordinate of the center of the bottom circle

  // Draw three circles, starting from the bottom and going up
  for (let i = 0; i < 3; i++) {
    let y = bottomY - i * spacing;

    stroke(0); // Add black outline
    strokeWeight(1);

    // Left half dark green
    fill('#2AA25E');
    arc(x, y, r, r, PI / 2, PI * 3 / 2, PIE);

    // Right half light green
    fill('#A8DC80');
    arc(x, y, r, r, PI * 3 / 2, PI / 2, PIE);
  }
}

// Draw the base part, which consists of 9 rectangles, each with a red and green semicircle decoration inside (except for some)
function drawBase() {
  let offsetY = 76 + 5; // Base location
  let scale = 1.1; // To adjust the overall size

  // Top edge position of base
  let baseTop = height - 160 * scale + offsetY;

  // The size of a single rectangle
  let cellW = (50 + 1) * scale;
  let cellH = (50 + 1) * scale;

  // The starting horizontal coordinate of the entire base (to center it horizontally)
  let xStart = width / 2 - (cellW * 4.5);

  for (let i = 0; i < 9; i++) {
    let x = xStart + i * cellW;

    // Set the fill color of each rectangle
    if (i === 0 || i === 8) fill('#A8DC80'); // The two outermost rectangles
    else if (i === 1 || i === 7) fill('#2AA25E'); // The second two outer rectangles
    else if (i % 2 === 0) fill('#A8DC80');      // The remaining even numbers are yellow (greenish tone now)
    else fill('#2AA25E');                       // The remaining odd numbers are orange (now dark green)

    stroke(0); // Add black outline to base rectangles
    strokeWeight(1);
    rect(x, baseTop, cellW, cellH); // Draw the base rectangle

    // Coordinates of the center point of the semicircle
    let cx = x + cellW / 2;
    let cy = baseTop + cellH / 2;

    noStroke(); // Remove stroke for inner arcs

    // The 5 rectangles in the middle draw red and green semicircles (upper and lower)
    if (i >= 2 && i <= 6) {
      fill('#2AA25E'); // Upper half green
      arc(cx, cy, cellW, cellH, PI, 0, PIE);
      fill('#C3695D'); // Lower half red
      arc(cx, cy, cellW, cellH, 0, PI, PIE);
    } else {
      // The outer upper green circle
      fill('#2AA25E');
      arc(cx, cy, cellW, cellH, PI, 0, PIE);
    }
  }
}

// Snowing
class Snowflake {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(2, 6);
    this.speed = random(1, 3);
  }

  // Update snowflake position
  update() {
    this.y += this.speed;
    if (this.y > 555 - snowHeight) { // eset beyond the bottom
      this.y = random(-100, -10);
      this.x = random(width);
    }
  }

  // Draw snowflakes
  display() {
    fill(255);
    ellipse(this.x, this.y, this.size + snowOffsetSize, this.size + snowOffsetSize);
  }
}

// Click to play music
function mousePressed() {
  if (!bgmSound.isPlaying()) {
    bgmSound.play()
  }
}
