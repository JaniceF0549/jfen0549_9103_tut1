let audio;
let amplitude;
let snowflakes = [];
let petals = [];
let started = false;
let transitionProgress = 0;

let startButton;
let speedButton;

function preload() {
  // 替换为你自己的音频路径
  audio = loadSound('Assets/wintertospring.wav');
}

function setup() {
  createCanvas(800, 600);
  amplitude = new p5.Amplitude();

  // 创建播放按钮（右下角）
  startButton = createButton("▶️ 播放《四季》");
  startButton.position(width - 160, height - 70);
  startButton.style("padding", "8px 12px");
  startButton.style("font-size", "14px");
  startButton.mousePressed(startExperience);

  // 创建加速播放按钮（右下角）
  speedButton = createButton("⏩ 加速播放");
  speedButton.position(width - 160, height - 40);
  speedButton.style("padding", "8px 12px");
  speedButton.style("font-size", "14px");
  speedButton.mousePressed(toggleSpeed);
  speedButton.hide(); // 初始隐藏

  // 初始化一棵树
  let trunk = new Circles(width / 2, height, 80);
  trunk.generateTrunk();
  trunk.generateBranches();
}

function startExperience() {
  if (audio && audio.isLoaded()) {
    audio.play();
    started = true;
    startButton.hide();
    speedButton.show();
  }
}

function toggleSpeed() {
  if (audio && audio.isPlaying()) {
    if (audio.rate() === 1) {
      audio.rate(2);
      speedButton.html("⏪ 正常速度");
    } else {
      audio.rate(1);
      speedButton.html("⏩ 加速播放");
    }
  }
}

function draw() {
  background(255); // 将被背景函数覆盖

  if (!started) return;

  let level = amplitude.getLevel();
  let currentTime = audio.currentTime();

  if (currentTime < 72) {
    drawWinterBackground(level);
  } else if (currentTime >= 75) {
    drawSpringBackground(level);
  } else {
    transitionProgress = map(currentTime, 72, 75, 0, 1);
    drawSeasonTransition(level, transitionProgress);
  }

  // 显示 Circles 所有对象
  for (let ball of balls) {
    ball.display();
  }
}

// ========== 背景绘制部分 ==========

function drawWinterBackground(level) {
  background(30, 40, 70);

  if (frameCount % 3 === 0) {
    let count = map(level, 0, 0.3, 1, 5);
    for (let i = 0; i < count; i++) {
      snowflakes.push({
        x: random(width),
        y: 0,
        size: random(2, 5),
        speed: random(0.5, 2),
        drift: random(-0.5, 0.5)
      });
    }
  }

  noStroke();
  fill(255, 240);
  for (let flake of snowflakes) {
    ellipse(flake.x, flake.y, flake.size);
    flake.y += flake.speed;
    flake.x += flake.drift;
  }

  snowflakes = snowflakes.filter(flake => flake.y < height);
}

function drawSpringBackground(level) {
  background(180, 240, 200);

  if (frameCount % 4 === 0) {
    let count = map(level, 0, 0.3, 1, 4);
    for (let i = 0; i < count; i++) {
      petals.push({
        x: random(width),
        y: 0,
        size: random(3, 6),
        speed: random(1, 2),
        drift: random(-0.3, 0.3)
      });
    }
  }

  noStroke();
  fill(255, 150, 180, 180);
  for (let p of petals) {
    ellipse(p.x, p.y, p.size, p.size * 0.7);
    p.y += p.speed;
    p.x += p.drift;
  }

  petals = petals.filter(p => p.y < height);
}

function drawSeasonTransition(level, t) {
  let from = color(30, 40, 70);
  let to = color(180, 240, 200);
  background(lerpColor(from, to, t));

  drawWinterBackground(level * (1 - t));
  drawSpringBackground(level * t);
}