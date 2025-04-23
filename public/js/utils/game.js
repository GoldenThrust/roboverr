export function drawLives(ctx, health, lives) {
    ctx.font = "0.8rem Arial";
    ctx.fillStyle = "white";
  
    // Determine how many hearts to draw
    const ratio = Math.ceil((health / lives) * 10);
  
    // Positioning (adjust as needed)
    const spacing = 30;
    const startX = 20;
    const y = 30;
  
    ctx.save();
  
    // Apply landscape-style rotation if in portrait mode
    if (window.innerHeight > window.innerWidth) {
      ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.translate(-ctx.canvas.height / 2, -ctx.canvas.width / 2);
    }
  
    // Draw hearts in a row
    for (let i = 0; i < ratio; i++) {
      const x = startX + i * spacing;
      ctx.fillText("❤️", x, y);
    }
  
    ctx.restore();
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