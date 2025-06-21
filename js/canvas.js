// ripple.js

const rippleCanvas = document.getElementById("ripple-canvas");
const ctx = rippleCanvas.getContext("2d");

function resizeCanvas() {
  rippleCanvas.width = window.innerWidth;
  rippleCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let bolts = [];
const boltSpawnRate = 5500; // ms between bolts
const boltSegmentDelay = 60; // ms between new segments (slows it down)
const boltMaxLength = 25; // total segments
const boltForkChance = 0.1;

function createBolt(startX, startY) {
  return {
    x: startX,
    y: startY,
    segments: [{ x: startX, y: startY }],
    angle: Math.PI / 2 + (Math.random() - 0.5) * 0.6,
    timer: 0,
    segmentDelay: boltSegmentDelay,
    maxSegments: boltMaxLength,
    forks: [],
    opacity: 1
  };
}

function updateBolt(bolt, deltaTime) {
  bolt.timer += deltaTime;
  if (bolt.timer >= bolt.segmentDelay && bolt.segments.length < bolt.maxSegments) {
    bolt.timer = 0;
    const last = bolt.segments[bolt.segments.length - 1];
    const angle = bolt.angle + (Math.random() - 0.5) * 0.5;
    const length = 12 + Math.random() * 20;
    const newX = last.x + Math.cos(angle) * length;
    const newY = last.y + Math.sin(angle) * length;

    bolt.segments.push({ x: newX, y: newY });

    // Forking
    if (Math.random() < boltForkChance) {
      const fork = createBolt(newX, newY);
      fork.angle = angle + (Math.random() - 0.5);
      fork.maxSegments = 10 + Math.floor(Math.random() * 10);
      bolts.push(fork);
    }
  }

  bolt.opacity -= deltaTime / 5000;
}

function drawBolt(bolt) {
  ctx.beginPath();
  ctx.moveTo(bolt.segments[0].x, bolt.segments[0].y);
  for (let i = 1; i < bolt.segments.length; i++) {
    ctx.lineTo(bolt.segments[i].x, bolt.segments[i].y);
  }
  ctx.strokeStyle = `rgba(0, 255, 255, ${Math.min(bolt.opacity, 1)})`;
  ctx.shadowColor = 'rgba(0, 255, 255, 1)';
  ctx.shadowBlur = 25;
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

let lastTime = performance.now();
function animate() {
  const now = performance.now();
  const deltaTime = now - lastTime;
  lastTime = now;

  ctx.clearRect(0, 0, rippleCanvas.width, rippleCanvas.height);

  bolts.forEach(update => updateBolt(update, deltaTime));
  bolts.forEach(draw => drawBolt(draw));

  updateLineRunes(deltaTime);
  drawLineRunes();

  bolts = bolts.filter(b => {
    if (b.opacity <= 0) return false;

    const lastSeg = b.segments[b.segments.length - 1];
    const buffer = 100;

    const isOnScreen = (
      lastSeg.x >= -buffer &&
      lastSeg.x <= rippleCanvas.width + buffer &&
      lastSeg.y >= -buffer &&
      lastSeg.y <= rippleCanvas.height + buffer
    );

    return isOnScreen;
  });

  requestAnimationFrame(animate);
}


// --- Line Runes System ---
const lineRunes = [];
const runeChars = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᛃ','ᛇ','ᛉ','ᛏ','ᛒ','ᛞ','ᛟ'];
const runeCount = 7;
const runeSpacing = 28; // space between each rune in px

for (let i = 0; i < runeCount; i++) {
  lineRunes.push({
    char: runeChars[Math.floor(Math.random() * runeChars.length)],
    alpha: 1,
    fadingOut: false,
    timer: Math.random() * 3000 + 2000 // ms before it flickers to a new rune
  });
}

function updateLineRunes(deltaTime) {
  lineRunes.forEach(rune => {
    rune.timer -= deltaTime;

    if (rune.timer <= 0 && !rune.fadingOut) {
      rune.fadingOut = true;
    }

    if (rune.fadingOut) {
      rune.alpha -= deltaTime / 300;
      if (rune.alpha <= 0) {
        rune.char = runeChars[Math.floor(Math.random() * runeChars.length)];
        rune.fadingOut = false;
        rune.alpha = 0;
        rune.timer = Math.random() * 3000 + 2000;
      }
    } else if (rune.alpha < 1) {
      rune.alpha += deltaTime / 300;
    }

    rune.alpha = Math.max(0, Math.min(1, rune.alpha));
  });
}

function drawLineRunes() {
  const album = document.querySelector(".album-art img");
  const bounds = album.getBoundingClientRect();
  const canvasBounds = rippleCanvas.getBoundingClientRect();
  const centerX = (bounds.left + bounds.right) / 2 - canvasBounds.left;
  const y = bounds.top - canvasBounds.top - 20; // line height above album art

  const totalWidth = (runeCount - 1) * runeSpacing;
  const startX = centerX - totalWidth / 2;

  ctx.font = "22px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  lineRunes.forEach((rune, i) => {
    const x = startX + i * runeSpacing;
    ctx.fillStyle = `rgba(0, 255, 255, ${rune.alpha})`;
    ctx.shadowColor = `rgba(0, 255, 255, ${rune.alpha})`;
    ctx.shadowBlur = 10;
    ctx.fillText(rune.char, x, y);
  });
}



setInterval(() => {
  const x = Math.random() * rippleCanvas.width;
  const bolt = createBolt(x, 0);
  bolts.push(bolt);
}, boltSpawnRate);

animate();
