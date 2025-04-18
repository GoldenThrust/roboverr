import Player from "./characters/player.js";
import { ctxs, land } from "./setup.js";
import collider from "./physics/collider.js";
import asset from "./utils/assetLoader.js";

const scale = 0.3;

// Preload assets
await asset.preload(async (ast) => {
    await ast.loadImages({
        'robot-run': 'img/robot-run.png',
        'robot-jump': 'img/robot-jump.png',
        'robot-stand': 'img/robot-stand.png',
    });
});

// Create player instance with correct argument order
const player = new Player(
    innerWidth / 2,
    innerHeight / 10,
    {
        idle: "robot-stand",
        move: "robot-run",
        jump: "robot-jump",
    },
    1, 1, "rgb(191, 253, 255)", "Player"
);

// Add collider logic
collider.addCollider({
    obj1: player,
    obj2: land,
    runCode: (obj1, obj2) => {
        obj1.dy = 0;
        obj1.y = obj2.y - obj1.height;
        obj1.isOnGround = true;
    }
});

// Animation loop
function animate(t) {
    ['mgcs', 'fgcs', 'bgcs'].forEach((cs) => {
        const ctx = ctxs[cs];
        ctx.save(); // Save state before transformations
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.canvas.width = innerWidth;
        ctx.canvas.height = innerHeight;

        ctx.translate(innerWidth / 2, innerHeight / 2);
        ctx.scale(scale, scale);
        ctx.translate(-innerWidth / 2, -innerHeight / 2);
    });

    // Update game logic
    collider.checkCollisons();
    player.update(t);
    land.draw();

    // Restore canvas state
    ['mgcs', 'fgcs', 'bgcs'].forEach((cs) => ctxs[cs].restore());

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
