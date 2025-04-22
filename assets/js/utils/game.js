export function drawLives(ctx, health, lives) {
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    const ratio = Math.ceil((health / lives) * 10);
    ctx.font = "10px Arial";
    for (let i = 0; i < ratio; i++) {     
        ctx.fillText("❤️", 5 + i * 20, 15);
    }
}
export function drawScore(ctx, score) {
    ctx.font = "16px monospace";
    ctx.fillStyle = "white";
    const text = `Score: ${score}`;
    const textWidth = ctx.measureText(text).width;
    ctx.fillText(text, ctx.canvas.width - textWidth - 10, 20);
}
export function drawLevel(ctx, level) {
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(`Level: ${level}`, 10, 10);
}
export function drawGameOver(ctx) {
    ctx.font = "50px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("Game Over", ctx.canvas.width / 2 - 150, ctx.canvas.height / 2);
}
export function drawPause(ctx) {
    ctx.font = "50px Arial";
    ctx.fillStyle = "yellow";
    ctx.fillText("Paused", ctx.canvas.width / 2 - 100, ctx.canvas.height / 2);
}
export function drawWin(ctx) {
    ctx.font = "50px Arial";
    ctx.fillStyle = "green";
    ctx.fillText("You Win!", ctx.canvas.width / 2 - 100, ctx.canvas.height / 2);
}