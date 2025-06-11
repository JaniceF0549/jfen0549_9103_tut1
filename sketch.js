let img;
let palette = [];
let borderColor;
let columnWidths = [];
let balls = []


function preload() {
  img = loadImage('Assets/Anwar Jalal Shemza Apple Tree.jpeg'); 
}

function setup() {
  let trunk = new Circles(img.width/2, img.height - img.height/5.5, 50)
  trunk.generateTrunk()
  trunk.generateBranches()
  trunk.growBranch()

  createCanvas(img.width, img.height);
  extractBackgroundPalette();

  borderColor = color(152, 182, 180); //Light gray blue border
  generateColumnWidths();

  drawBorder();
  drawMosaicBackground();
  addTexture();
  addScratches();
  drawBase()
}

function draw() {
  for (let ball of balls) {
    ball.display();
    }

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

function drawMosaicBackground() {
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

      fill(baseColor);
      rect(x, y, segmentWidth, segmentHeight);
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
    stroke(255, 20);
    point(x, y);
  }

  //Horizontal fine lines
  stroke(255, 8);
  for (let y = 0; y < height; y += 5) { //Every 5 pixels, one line
    line(0, y + random(-1, 1), width, y + random(-1, 1));
  }
}

function addScratches() {
  stroke(255, 30);
  for (let i = 0; i < 200; i++) {
    let x1 = random(width);
    let y1 = random(height);
    let x2 = x1 + random(-30, 30);
    let y2 = y1 + random(-30, 30);
    line(x1, y1, x2, y2);
  }
}