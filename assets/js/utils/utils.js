import { gameOverHighScore, gameOverMenu, gameOverScore, pauseMenu } from "../setup.js";
import memory from "./memory.js";

export function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

export function getRandomNZeroInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  let random = Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled)
  if (random === 0) {
    random = min;
  }

  return random;
}

export function distanceBetween(obj, obj2) {
  return [Math.sqrt((obj.x - obj2.x) ** 2 + (obj.y - obj2.y) ** 2), (obj.x - obj2.x), (obj.y - obj2.y)];
}

export function angleBetween(obj, obj2) {
  return Math.atan2((obj.y - obj2.y), (obj.x - obj2.x))
}

export const randomColor = () => `hsl(${Math.random() * 360}, 50%, 50%)`;

export function radToDeg(rad) {
  return rad * 180 / Math.PI;
}

export function degToRad(deg) {
  return deg * Math.PI / 180;
}

export function getRandomCharacters() {
  let char = '';
  for (let i = 0; i < 10; i++) {
    if (i === 0) {
      char += String.fromCharCode(getRandomInt(65, 91))
    } else {
      char += String.fromCharCode(getRandomInt(97, 123))
    }
  }

  return char;
}

export function debug() {
  const p = document.createElement('p');
  document.body.appendChild(p)

  return p;
}


export function lerp(a, b, t) {
  return a + (b - a) * t;
}


function projectPolygon(axis, vertices) {
  const projections = vertices.map(v => (v.x * axis.x + v.y * axis.y));
  return {
    min: Math.min(...projections),
    max: Math.max(...projections)
  };
}

function isSeparatingAxis(axis, vertices1, vertices2) {
  const proj1 = projectPolygon(axis, vertices1);
  const proj2 = projectPolygon(axis, vertices2);

  return proj1.max < proj2.min || proj2.max < proj1.min;
}

function getEdges(vertices) {
  let edges = [];
  for (let i = 0; i < vertices.length; i++) {
    const next = (i + 1) % vertices.length;
    edges.push({
      x: vertices[next].x - vertices[i].x,
      y: vertices[next].y - vertices[i].y
    });
  }
  return edges;
}


export function checkCollision(obj1, obj2, runCode = () => { }, key = 0) {
  const vertices1 = obj1.getVertices();
  const vertices2 = obj2.getVertices();

  const edges = [
    ...getEdges(vertices1),
    ...getEdges(vertices2)
  ];

  for (let edge of edges) {
    const axis = { x: -edge.y, y: edge.x };
    if (isSeparatingAxis(axis, vertices1, vertices2)) {
      return false;
    }
  }

  runCode(obj1, obj2, key);
  return true;
}


export function damageAnimation(player) {
  player.live--;
  player.weaponHit = true;
  const interVal = setInterval(() => {
    player.damage = !player.damage;
  }, 100);
  setTimeout(() => {
    player.weaponHit = false;
    player.damage = false;
    clearInterval(interVal);
  }, 300)
}


export function drawSpriteFrame(ctx, spriteSheet, frameX, frameY, canvasX, canvasY, width, height, scaleWidth, scaleHeight) {
  ctx.drawImage(
    spriteSheet,
    frameX * width,
    frameY * height,
    width,
    height,
    canvasX,
    canvasY,
    scaleWidth,
    scaleHeight
  );
}

// Example frame duration utility if needed
export function getFrameDuration(currentTime, lastUpdateTime, fps) {
  const frameInterval = 1000 / fps;
  if (currentTime - lastUpdateTime > frameInterval) {
    return currentTime;
  }
  return null;
}

export function getGameId() {
  const queryString = window.location.search;

  const urlParams = new URLSearchParams(queryString);

  const gameid = urlParams.get('gameid');

  return gameid ? gameid : null;
}

export function convertTitleToCamelCase(input) {
  if (!input) return "";

  return input
    .toLowerCase()
    .replace(/(?:\s+)([a-z])/g, (_, letter) => letter.toUpperCase())
    .replace(/^./, (match) => match.toLowerCase());
}

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
  });
}

export function loadAsset(spritesheet) {
  if (!asset.assetsLoaded) {
    setTimeout(() => {
      loadImage(spritesheet);
    }, 1000);
  } else {
    return asset[spritesheet];
  }
}

export function generateUniqueId() {
  return 'id-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

export function displayPauseScreen(toggle = true) {
  memory.updatePause(toggle);
  if (toggle) {
    pauseMenu.classList.remove('hidden');
    pauseMenu.classList.add('visible');
    return;
  }
  pauseMenu.classList.remove('visible');
  pauseMenu.classList.add('hidden');
  memory.updatePause(false);
}

export function displayGameOverScreen() {
  gameOverMenu.classList.remove('hidden');
  gameOverMenu.classList.add('visible');
  gameOverScore.innerText = `Score: ${memory.getScore()}`;
  gameOverHighScore.innerText = `High Score: ${memory.getHighScore()}`;
  memory.reset();
}

export function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
