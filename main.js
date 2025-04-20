import Player from "./characters/player.js";
import { background, ctxs, generateUniqueId, land, scale } from "./setup.js";
import collider from "./physics/collider.js";
import asset from "./utils/assetLoader.js";
import { randomColor } from "./utils/utils.js";
import { enemySpriteRows } from "./utils/constants.js";
import Enemy from "./characters/enemy.js";
import { drawLives } from "./utils/game.js";
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


export let enemies = [];


// 🧟‍♂️ Initiate enemies with shuffled names
function initiateEnemies(count = 1) {
  const enemyNames = Object.keys(enemySpriteRows);
  for (let i = 0; i < count; i++) {
    const name = enemyNames[Math.floor(Math.random() * enemyNames.length)];
    const x = [1, -1][Math.round(Math.random())] * (innerWidth * scale) * 20;
    const y = innerHeight;

    enemies.push(
      new Enemy({
        name,
        x,
        y,
        numberOfColumns: 7,
        cutWidth: 24,
        cutHeight: 32,
      })
    );
  }
}

setInterval(() => {
  if (enemies.length > 5) return;
  initiateEnemies(5)
}, 1000);

initiateEnemies(2)


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
  if (!player.isAlive())  {

    return;
  }
  ["mgcs", "fgcs", "bgcs"].forEach((cs) => {
    const ctx = ctxs[cs];
    ctx.canvas.width = innerWidth;
    ctx.save();
    ctx.translate(innerWidth / 2, innerHeight / 2);
    ctx.scale(scale, scale);
    ctx.translate(-innerWidth / 2, -innerHeight / 2);
  });
  enemies = enemies.filter((e) => e.isAlive());

  collider.checkCollisons();
  background.draw();
  land.draw();
  player.update(t);

  enemies.forEach((e) => {
    e.draw(t);
    e.update(t, player);
  });

  ["mgcs", "fgcs", "bgcs"].forEach((cs) => {
    const ctx = ctxs[cs];
    ctx.restore();
  });

  drawLives(ctxs["mgcs"], player.health);
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
