import Player from "./characters/player.js";
import { background, land, maxDistance, scale, scene } from "./setup.js";
import collider from "./physics/collider.js";
import asset from "./utils/assetLoader.js";
import { generateUniqueId, getRandomInt, randomColor } from "./utils/utils.js";
import { enemySpriteRows } from "./utils/constants.js";
import Enemy from "./characters/enemy.js";
import { drawLives, drawScore } from "./utils/game.js";
// 🎮 Create player
export const player = new Player(
  innerWidth / 2,
  innerHeight / 10,
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

let spawnNumber = 5;
let dxFactor = 1;
let fireRateFactor = 1;
let lastIncrementTime = 0;

export let enemies = [];


// 🧟‍♂️ Initiate enemies with shuffled names
function initiateEnemies(count = 1) {
  const enemyNames = Object.keys(enemySpriteRows);

  for (let i = 0; i < count; i++) {
    const name = enemyNames[Math.floor(Math.random() * enemyNames.length)];
    const x = [1, -1][Math.round(Math.random())] * getRandomInt(0, maxDistance / 3);
    const y = Math.round(Math.random() * 10) * -innerHeight * 10;
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
  if (!player.isAlive()) {
    window.location.href = '/gameover.html';
    return;
  }

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
    console.log("✅ 10s Passed: Stats incremented");
  }
  scene[0].attachToPlayer(player);
  scene[1].attachToPlayer(player);
  scene[2].attachToPlayer(player);

  scene[0]?.animate({
    animateInScene: () => {
      background.draw();
      land.draw();
    }
  })
  scene[1]?.animate({
    animateInScene: () => {
      enemies.forEach((e) => {
        e.draw(t);
        e.update(t, player);
      });
      player.update(t);
    }
  })

  scene[2]?.animate({
    animateOutScene:
      (ctx) => {
        drawLives(ctx, player.health, player.lives)
        drawScore(ctx, player.score);
      }
  })

  enemies = enemies.filter((e) => {
    if (!e.isAlive()) player.score += 1;
    return e.isAlive()
  });

  collider.checkCollisons();
  requestAnimationFrame(animate);
}

// Start after asset loading
(async () => {
  await asset.preload(async (ast) => {
    await ast.loadImages({
      "robot-run": "img/robot-run.png",
      "robot-jump": "img/robot-jump.png",
      "robot-stand": "img/robot-stand.png",
      "terrain": "img/terrain.png",
      "enemy": "img/enemy.png",
      "bg": "img/bg.png",
    });
  });
  requestAnimationFrame(animate);
})();

initiateEnemies(20)
