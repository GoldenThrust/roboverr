import asset from "./assetLoader.js";
import { drawSpriteFrame, getFrameDuration } from "./utils.js";
export default class SpriteAnimation {
    constructor({ ctx, spritesheet, x , y, cutWidth, cutHeight, scaleWidth = 1, scaleHeight = 1, numberOfRows = 1, numberOfColumns, fps = 30, maxIterations = 0, hide = false, color = "black", row = null }) {
        this.ctx = ctx;
        this.spritesheet = asset[spritesheet] ?? null;
        this.x = x ?? 0;
        this.y = y ?? this.ctx.canvas.height/2;
        this.cutWidth = cutWidth;
        this.cutHeight = cutHeight;
        this.scaleWidth = cutWidth * scaleWidth;
        this.scaleHeight = cutHeight * scaleHeight;
        this.numberOfColumns = numberOfColumns;
        this.numberOfRows = numberOfRows;
        this.totalFrames = numberOfRows * numberOfColumns;
        this.maxIterations = maxIterations;
        this.fps = fps;
        this.currentFrame = 0;
        this.lastUpdate = 0;
        this.numberOfIterations = 0;
        this.state = 'paused'; // Can be 'paused' or 'running'
        this.hide = hide;
        this.flip = 1;
        this.color = color;
        this.mask = document.createElement('canvas');
        this.mask.width = this.scaleWidth;
        this.mask.height = this.scaleHeight;
        this.mctx = this.mask.getContext('2d');
        this.row = row;
        document.addEventListener("assetsloaded", (e) => {
            const { assets } = e.detail;
            this.spritesheet = assets[spritesheet];
        });
    }

    animate(t, flip = 1) {
        this.flip = flip;

        if (!this.spritesheet) return;

        if (this.state === 'running') {
            if (getFrameDuration(t, this.lastUpdate, this.fps)) {
                this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
                this.lastUpdate = t;

                if (this.maxIterations !== 0 && this.currentFrame === this.totalFrames - 1) {
                    this.numberOfIterations++;
                }

                if (this.maxIterations !== 0 && this.numberOfIterations >= this.maxIterations) {
                    // this.state = 'paused';
                }
            }
        }
        
        const column = this.currentFrame % this.numberOfColumns;
        const row = this.row ?? Math.floor(this.currentFrame / this.numberOfColumns);
        
        if (this.state === 'running' || this.hide !== true) {
            this.mctx.fillStyle = this.color;
            this.mctx.fillRect(0, 0, this.mask.width, this.mask.height);
            
            this.mctx.globalCompositeOperation = 'destination-in';
            drawSpriteFrame(this.mctx, this.spritesheet, column, row, 0, 0, this.cutWidth, this.cutHeight, this.scaleWidth, this.scaleHeight);
            this.mctx.globalCompositeOperation = 'source-over';
            
            this.ctx.save();
            this.ctx.scale(this.flip, 1);
            const drawX = this.flip === -1 ? -(this.x + this.scaleWidth) : this.x;
            
            this.ctx.drawImage(this.mask, drawX, this.y);

            this.ctx.globalCompositeOperation = 'multiply';
            drawSpriteFrame(this.ctx, this.spritesheet, column, row, drawX, this.y, this.cutWidth, this.cutHeight, this.scaleWidth, this.scaleHeight);
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.restore();
        }
    }
    restart() {
        if (this.state === 'paused') {
            this.state = 'running';
            this.currentFrame = 0;
            this.numberOfIterations = 0;
            this.lastUpdate = performance.now();
        }
    }

    pause() {
        this.state = 'paused';
    }

    resume() {
        if (this.state !== 'running') {
            this.state = 'running';
            this.lastUpdate = performance.now();
        }
    }

    setProperties(properties = {}) {
        Object.entries(properties).forEach(([key, value]) => {
            this[key] = value;
        });
    }
}
