let audio;
let amplitude;
let snowflakes = [];
let snowAccum = [];
let started = false;

let startButton;
let speedButton;

function preload() {
  audio = loadSound('Assets/wintertospring.wav'); // 替换路径
}

function setup() {
  createCanvas(650, 900); // 保持原画布大小
  amplitude = new p5.Amplitude();

  // 播放按钮
  startButton = createButton("▶️ 播放");
  startButton.position(width - 140, height - 70);
  startButton.style("padding", "8px");
  startButton.mousePressed(() => {
    audio.play();
    started = true;
    startButton.hide();
    speedButton.show();
  });

  // 加速按钮
  speedButton = createButton("⏩ 加速播放");
  speedButton.position(width - 140, height - 40);
  speedButton.style("padding", "8px");
  speedButton.mousePressed(() => {
    if (audio.rate() === 1) {
      audio.rate(2);
      speedButton.html("⏪ 正常速度");
    } else {
      audio.rate(1);
      speedButton.html("⏩ 加速播放");
    }
  });
  speedButton.hide();

  // 初始树
  let trunk = new Circles(width / 2, height, 80);
  trunk.generateTrunk();
  trunk.generateBranches();

  // 初始化积雪数组
  for (let b of balls) {
    snowAccum.push({ x: b.ballXPos, y: b.ballYPos, amount: 0 });
  }
}

function draw() {
  if (!started) return;

  let level = amplitude.getLevel();
  let t = audio.currentTime();

  // 背景渐变（加入粉色中间过渡，最终为淡蓝色）
  let bgColor;
  if (t < 72) {
    bgColor = color(20, 30, 50); // 冬天昏暗
  } else if (t < 77) {
    let p = map(t, 72, 77, 0, 1);
    bgColor = lerpColor(color(20, 30, 50), color(255, 220, 230), p); // 淡粉
  } else if (t < 82) {
    let p = map(t, 77, 82, 0, 1);
    bgColor = lerpColor(color(255, 220, 230), color(200, 230, 255), p); // 粉变蓝
  } else {
    bgColor = color(200, 230, 255); // 明亮春天淡蓝色
  }
  background(bgColor);

  // 冬天阶段下雪（数量随音量，速度固定）
  if (t < 72) {
    if (frameCount % 2 === 0) {
      let count = map(level, 0, 0.3, 1, 30); // 音量控制雪密度
      for (let i = 0; i < count; i++) {
        snowflakes.push({
          x: random(width),
          y: 0,
          size: random(3, 7),
          speed: 2 // 固定速度
        });
      }
    }
  }

  // 雪花运动和堆积
  for (let flake of snowflakes) {
    flake.y += flake.speed;
    ellipse(flake.x, flake.y, flake.size);

    for (let i = 0; i < balls.length; i++) {
      let b = balls[i];
      let d = dist(flake.x, flake.y, b.ballXPos, b.ballYPos);
      if (d < b.ballDiameter / 2) {
        snowAccum[i].amount = constrain(snowAccum[i].amount + 1, 0, 60);
        flake.y = height + 10;
      }
    }
  }
  snowflakes = snowflakes.filter(f => f.y < height + 5);

  // 显示雪堆积
  noStroke();
  fill(255);
  if (t < 82) {
    for (let s of snowAccum) {
      if (s.amount > 1) {
        ellipse(s.x, s.y - s.amount / 4, s.amount, s.amount / 1.8);
      }
    }
  } else {
    for (let s of snowAccum) {
      if (s.amount > 1) {
        s.amount *= 0.95; // 缓慢融化
        ellipse(s.x, s.y - s.amount / 4, s.amount, s.amount / 1.8);
      }
    }
  }

  // 显示树
  for (let ball of balls) {
    ball.display();
  }

  // 春天生长
  if (t > 82) {
    if (frameCount % int(map(level, 0, 0.3, 40, 4)) === 0) {
      growFromBranchEnds(level);
    }
  }
}

function growFromBranchEnds(level) {
  let numBranches = 4;
  let angleOffsets = [-PI/6, -PI/3, -TWO_PI/3, -(5*PI)/6];
  const seasonColor = [color(120, 255, 120), color(80, 200, 80)];

  for (let j = 0; j < numBranches; j++) {
    let start = balls[balls.length - 1 - j * 6];
    let angle = angleOffsets[j] + random(-PI/12, PI/12);
    let len = map(level, 0, 0.3, 10, 70);
    let x = start.ballXPos + cos(angle) * len;
    let y = start.ballYPos + sin(angle) * len;
    let d = random(10, 30);

    let lerpAmt = 0.8;
    let top = lerpColor(color(100, 80, 60), seasonColor[0], lerpAmt);
    let bottom = lerpColor(color(120, 100, 80), seasonColor[1], lerpAmt);

    balls.push(new Circles(x, y, d, top, bottom));
    snowAccum.push({ x, y, amount: 0 });
  }
}