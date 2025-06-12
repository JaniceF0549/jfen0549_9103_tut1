let audio;
let amplitude;
let snowflakes = [];
let snowAccum = [];
let started = false;

let startButton;
let speedButton;

function preload() {
  audio = loadSound('Assets/wintertospring.wav'); 
}

function setup() {
  createCanvas(650, 900); 
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

  // 1. 背景渐变
  if (t < 72) {
    background(20, 30, 50); // 冬天昏暗
  } else if (t < 82) {
    let p = map(t, 72, 82, 0, 1);
    let col = lerpColor(color(20, 30, 50), color(245, 250, 255), p);
    background(col);
  } else {
    background(245, 250, 255); // 春天明亮
  }

  // 2. 冬天雪花生成
  if (t < 72) {
    if (frameCount % 3 === 0) {
      let count = map(level, 0, 0.3, 2, 10);
      for (let i = 0; i < count; i++) {
        snowflakes.push({
          x: random(width),
          y: 0,
          size: random(2, 5),
          speed: random(1, 2)
        });
      }
    }
  }

  // 3. 雪花运动和堆积逻辑
  for (let flake of snowflakes) {
    flake.y += flake.speed;
    ellipse(flake.x, flake.y, flake.size);

    // 判断是否撞击 balls 上
    for (let i = 0; i < balls.length; i++) {
      let b = balls[i];
      let d = dist(flake.x, flake.y, b.ballXPos, b.ballYPos);
      if (d < b.ballDiameter / 2) {
        snowAccum[i].amount = constrain(snowAccum[i].amount + 0.5, 0, 20);
        flake.y = height + 10;
      }
    }
  }

  // 清除出界雪花
  snowflakes = snowflakes.filter(f => f.y < height + 5);

  // 4. 雪融化阶段
  if (t >= 72 && t < 82) {
    let fade = map(t, 72, 82, 0, 1);
    for (let s of snowAccum) {
      s.amount *= (1 - fade);
    }
  }

  // 5. 雪堆积显示
  noStroke();
  fill(255);
  for (let s of snowAccum) {
    if (s.amount > 1) {
      ellipse(s.x, s.y - 5, s.amount, s.amount / 2);
    }
  }

  // 6. 显示树
  for (let ball of balls) {
    ball.display();
  }

  // 7. 春天：音量驱动新生长
  if (t > 82 && frameCount % int(map(level, 0, 0.3, 60, 5)) === 0) {
    growNewBranchSegment(level);
  }
}

// 音量驱动生成新的小段树枝
function growNewBranchSegment(level) {
  let last = balls[balls.length - 1];
  let angle = random(-PI / 6, PI / 6);
  let len = map(level, 0, 0.3, 10, 50);
  let x = last.ballXPos + cos(angle) * len;
  let y = last.ballYPos - sin(angle) * len;
  let d = random(10, 30);
  let top = color(100, 200, 100);
  let bottom = color(80, 180, 80);

  balls.push(new Circles(x, y, d, top, bottom));
  snowAccum.push({ x, y, amount: 0 });
}