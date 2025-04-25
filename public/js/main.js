import Player from "./characters/player.js";
import { background, ctxs, land, maxDistance, scene, scoreElement, timeElement } from "./setup.js";
import collider from "./physics/collider.js";
import asset from "./utils/assetLoader.js";
import { displayPauseScreen, displayGameOverScreen, generateUniqueId, getRandomInt, randomColor } from "./utils/utils.js";
import { enemySpriteRows } from "./utils/constants.js";
import Enemy from "./characters/enemy.js";
import { drawLives } from "./utils/game.js";
import memory from "./utils/memory.js";
import config from "./utils/config.js";

// Initialize config with asset URL from window.APP_CONFIG
if (window.APP_CONFIG && window.APP_CONFIG.assetUrl) {
  config.init(window.APP_CONFIG);
}

const ctx = ctxs["mgcs"];
// 🎮 Create player
export const player = new Player(
  ctx.canvas.width / 2,
  ctx.canvas.height / 10,
  {
    idle: "robot-stand",
    move: "robot-run",
    jump: "robot-jump",
  },
  1,
  1,
  randomColor(),
  "Player"
);

player.health = memory.getLives();
player.score = memory.getScore();

let spawnNumber = 20;
let dxFactor = 1;
let fireRateFactor = 1;
let lastIncrementTime = 0;
let lastTime = 0;

export let enemies = [];

// 🧟‍♂️ Initiate enemies with shuffled names
function initiateEnemies(count = 1) {
  const enemyNames = Object.keys(enemySpriteRows);

  for (let i = 0; i < count; i++) {
    const name = enemyNames[Math.floor(Math.random() * enemyNames.length)];
    const x = [1, -1][Math.round(Math.random())] * getRandomInt(0, maxDistance / 2.1);
    const y = Math.round(Math.random() * 10) * -ctx.canvas.height * 10;
    const uniqueId = generateUniqueId();

    const enemy = new Enemy({
      name,
      x,
      y,
      numberOfColumns: 7,
      cutWidth: 24,
      cutHeight: 32,
      fireRateFactor,
      dxFactor,
    });

    enemies.push(enemy);

    collider.addCollider({
      obj1: enemy,
      obj2: land,
      key: uniqueId,
      runCode: (e, l, key) => {
        if (!e.isAlive()) {
          collider.removeCollider(key);
          return;
        }
        e.dy = 0;
        e.y = l.y - e.height;
        e.isOnGround = true;
      },
    });
  }
}

// 🕒 Spawn control
setInterval(() => {
  if (enemies.length >= spawnNumber) return;
  initiateEnemies(spawnNumber - enemies.length);
}, 1000);

// 💥 Add collision logic
collider.addCollider({
  obj1: player,
  obj2: land,
  runCode: (p, l) => {
    p.dy = 0;
    p.y = l.y - p.height;
    p.isOnGround = true;
  },
});

// 🔁 Game loop
function animate(t) {
  if (!memory.getPause()) {
    memory.updateTime(t - lastTime);

    const seconds = Math.floor(memory.getTime() / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    timeElement.innerText = `${hours % 24}hrs ${minutes % 60}mins ${seconds % 60}secs`;

    if (t - lastIncrementTime >= 10000) {
      spawnNumber++;
      fireRateFactor += 0.01;
      dxFactor += 0.01;

      enemies.forEach((e) => {
        e.fireRate = Math.max(100, e.fireRate - 10);
        e.attackRange = Math.max(1000, e.attackRange + 1);
        e.gunRange = Math.max(5000, e.gunRange + 1);
        e.dx += 0.5;
      });

      lastIncrementTime = t; // 🔄 Reset last time
    }
    scene[0].attachToPlayer(player);
    scene[1].attachToPlayer(player);
    scene[2].attachToPlayer(player);

    scene[0]?.animate({
      animateInScene: () => {
        background.draw();
        land.draw();
      },
    });
    scene[1]?.animate({
      animateInScene: () => {
        enemies.forEach((e) => {
          e.draw(t);
          e.update(t, player);
        });
        player.draw(t);
        player.update(t);
      },
    });

    scene[2]?.animate({
      animateOutScene: (ctx) => {
        drawLives(ctx, player.health, player.lives);
      },
    });

    enemies = enemies.filter((e) => {
      if (!e.isAlive()) {
        player.score += 1;
        memory.updateScore(player.score);
        scoreElement.innerText = `Score: ${player.score}`;
      }
      return e.isAlive();
    });

    collider.checkCollisons();
  } else {
    displayPauseScreen();
  }

  if (player.isAlive()) {
    requestAnimationFrame(animate);
  } else {
    memory.updateHighScore(player.score);
    displayPauseScreen(false);
    displayGameOverScreen();
  }
  lastTime = t;
}

// Start after asset loading
(async () => {
  await asset.preload(async (ast) => {
    await ast.loadImages({
      "robot-run": config.getAssetUrl("img/robot-run.png"),
      "robot-jump": config.getAssetUrl("img/robot-jump.png"),
      "robot-stand": config.getAssetUrl("img/robot-stand.png"),
      "terrain": config.getAssetUrl("img/terrain.png"),
      "enemy": config.getAssetUrl("img/enemy.png"),
      "bg": config.getAssetUrl("img/bg.png"),
    });

    await ast.loadAudio({
      "walk": config.getAssetUrl("audio/walk.m4a"),
      "shoot": config.getAssetUrl("audio/shoot.mp3"),
    });
  });

  requestAnimationFrame(animate);
})();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register(config.getAssetUrl("js/service-worker.js"))
    .then(() => console.log("Service Worker registered"));
}

initiateEnemies(20);