import asset from "./assetLoader.js";
import { drawSpriteFrame, getFrameDuration } from "./utils.js";

export default class SpriteAnimation {
    constructor({ ctx, spritesheet, x, y, cutWidth, cutHeight, scaleWidth, scaleHeight, numberOfRows, numberOfColumns, fps, maxIterations = 0, hide = false, color = "black" }) {
        this.ctx = ctx;
        this.spritesheet = null;
        this.x = x;
        this.y = y;
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
        this.#loadImage(spritesheet);
    }

    #loadImage(spritesheet) {
        if (!asset.assetsLoaded) {
            setTimeout(() => {
                this.#loadImage(spritesheet);
            }, 1000);
        } else {
            this.spritesheet = asset[spritesheet];
        }
    }

    setSpritesheet(spritesheet) {
        this.spritesheet = asset[spritesheet];
    }
    animate(t, flip) {
        this.flip = flip ?? this.flip;

        if (this.state === 'running') {
            const duration = getFrameDuration(t, this.lastUpdate, this.fps);

            if (duration) {
                this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
                this.lastUpdate = duration;
            }

            if (this.maxIterations !== 0 && ((this.currentFrame + 1) >= this.totalFrames)) {
                this.numberOfIterations++;
            }

            if (this.numberOfIterations >= this.maxIterations && this.maxIterations !== 0) {
                // this.state = 'paused';
            }
        }

        const column = this.currentFrame % this.numberOfColumns;
        const row = Math.floor(this.currentFrame / this.numberOfColumns);

        if (this.spritesheet && asset.assetsLoaded && (this.state === 'running' || this.hide !== true)) {
            this.mctx.clearRect(0, 0, this.mask.width, this.mask.height);

            // Fill the mask with a solid color
            this.mctx.fillStyle = this.color;
            this.mctx.fillRect(0, 0, this.mask.width, this.mask.height);

            // Cut the shape of the sprite from the color block
            this.mctx.globalCompositeOperation = 'destination-in';
            drawSpriteFrame(
                this.mctx,
                this.spritesheet,
                column,
                row,
                0, 0,
                this.cutWidth,
                this.cutHeight,
                this.scaleWidth,
                this.scaleHeight
            );

            // Reset mask context blend mode
            this.mctx.globalCompositeOperation = 'source-over';

            // Draw to main canvas
            this.ctx.save();
            this.ctx.scale(this.flip, 1);
            const drawX = this.flip === -1 ? -(this.x + this.scaleWidth) : this.x;

            this.ctx.drawImage(this.mask, drawX, this.y);
            this.ctx.globalCompositeOperation = 'multiply';
            drawSpriteFrame(this.ctx, this.spritesheet, column, row, drawX, this.y, this.cutWidth, this.cutHeight, this.scaleWidth, this.scaleHeight);
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
