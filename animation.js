let audio;
let fft;
let snowflakes = [];
let snowAccum = [];
let started = false;

let startButton;
let speedButton;

function preload() {
  audio = loadSound('Assets/wintertospring.wav'); 
  img = loadImage('Assets/Anwar Jalal Shemza Apple Tree.jpeg'); 
}

function setup() {
  createCanvas(img.width, img.height); 
  fft = new p5.FFT();

  // Play button
  startButton = createButton("▶️ Play");
  startButton.position(width - 140, height - 70);
  startButton.style("padding", "8px");
  startButton.mousePressed(() => {
    audio.play();
    started = true;
    startButton.hide();
    speedButton.show();
  });

  // Accelerate button
  speedButton = createButton("⏩ Accelerate");
  speedButton.position(width - 140, height - 40);
  speedButton.style("padding", "8px");
  speedButton.mousePressed(() => {
    if (audio.rate() === 1) {
      audio.rate(2);
      speedButton.html("⏪ Restore");
    } else {
      audio.rate(1);
      speedButton.html("⏩ Accelerate");
    }
  });
  speedButton.hide();

  // The initial part of creating a tree
  let trunk = new Circles(width / 2, height, 80);
  trunk.generateTrunk();
  trunk.generateBranches();

  // Initialize the snow array and create snow data for each branch node
  for (let b of balls) {
    snowAccum.push({ x: b.ballXPos, y: b.ballYPos, amount: 0 });
  }
}

function draw() {
  if (!started) return;

  let spectrum = fft.analyze();
  let bassEnergy = fft.getEnergy(20, 100);     // Control the density of snowflakes
  let trebleEnergy = fft.getEnergy(200, 500);  // Control growth rate
  let t = audio.currentTime();

  // Background gradient (with a transition between pink and light blue)
  let bgColor;
  if (t < 72) {
    bgColor = color(20, 30, 50); // Dim in winter
  } else if (t < 77) {
    let p = map(t, 72, 77, 0, 1);
    bgColor = lerpColor(color(20, 30, 50), color(255, 220, 230), p); //Transition to Pink
  } else if (t < 82) {
    let p = map(t, 77, 82, 0, 1);
    bgColor = lerpColor(color(255, 220, 230), color(200, 230, 255), p); //Transition to light blue
  } else {
    bgColor = color(200, 230, 255); // Bright Spring: Light Blue
  }
  background(bgColor);

  // Snowfall in winter 
  if (t < 72) {
    if (frameCount % 5 === 0) {
      let snowDensity = map(bassEnergy, 0, 255, 1, 30);
      //Determine snowflake density based on low-frequency energy
      for (let i = 0; i < snowDensity; i++) {
        snowflakes.push({
          x: random(width),
          y: 0,
          size: random(3, 7),
          speed: 2 
        });
      }
    }
  }

  // Snowflake movement and accumulation
  for (let flake of snowflakes) {
    flake.y += flake.speed;//Snowflakes falling
    ellipse(flake.x, flake.y, flake.size);

    //Check if snowflakes fall on tree branches
    for (let i = 0; i < balls.length; i++) {
      let b = balls[i];
      let d = dist(flake.x, flake.y, b.ballXPos, b.ballYPos);//Calculate distance
      if (d < b.ballDiameter / 2) { ////If it falls within the range of tree branches
        snowAccum[i].amount = constrain(snowAccum[i].amount + 1, 0, 60); ////Increase snow accumulation
        flake.y = height + 10;
      }
    }
  }
  //Remove snowflakes that exceed the screen
  snowflakes = snowflakes.filter(f => f.y < height + 5);

  // Display snow accumulation
  noStroke();
  fill(255);
  if (t < 72) {
    for (let s of snowAccum) {
      if (s.amount > 1) {
        ellipse(s.x, s.y - s.amount / 4, s.amount, s.amount / 1.8);
      }
    }
  } else {
    for (let s of snowAccum) {
      if (s.amount > 1) {
        s.amount *= 0.95; // Slowly melting
        ellipse(s.x, s.y - s.amount / 4, s.amount, s.amount / 1.8);
      }
    }
  }

  // Display tree
  for (let ball of balls) {
    ball.display();
  }

  // Spring
  if (t > 82) {
    //Control growth rate based on high-frequency energy (the higher the energy, the faster the growth)
    if (frameCount % int(map(trebleEnergy, 0, 255, 40, 4)) === 0) {
      growFromBranchEnds(trebleEnergy / 128);  // Growing new branches from the end of the branch
    }
  }
}

function growFromBranchEnds(level) {
  let numBranches = 2; //2 new branches grow each time
  let angleOffsets = [-PI/6, -PI/3, -TWO_PI/3, -(5*PI)/6];
  const seasonColor = [color(120, 255, 120), color(80, 200, 80)];

  for (let j = 0; j < numBranches; j++) {
    // Start growing from the ends of the last 4 branches
    let start = balls[balls.length - 1 - j * 6];
    let angle = angleOffsets[j] + random(-PI/12, PI/12);
    //Determine branch length based on high-frequency audio energy
    let len = map(level, 0, 1, 10, 70);
    //Calculate the position of new branches
    let x = start.ballXPos + cos(angle) * len;
    let y = start.ballYPos + sin(angle) * len;
    let d = random(10, 30);

    //Color transition
    let lerpAmt = 0.8;
    let top = lerpColor(color(100, 80, 60), seasonColor[0], lerpAmt);
    let bottom = lerpColor(color(120, 100, 80), seasonColor[1], lerpAmt);

    //Create a new branch and add it to the array
    balls.push(new Circles(x, y, d, top, bottom));
  }
}
