import { ctxs } from "../setup.js";
import { drawSpriteFrame } from "../utils/utils.js";

class Platform {
    constructor({ x, y, width, height, cutWidth, cutHeight, img = null, id = "Platform", column = 0, row = 0 }) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.cutWidth = cutWidth || width;
        this.cutHeight = cutHeight || height;
        this.color = "blue";
        this.id = id;
        this.spritesheet = null;

        // Create a mask canvas for pattern
        this.mask = document.createElement('canvas');
        this.mctx = this.mask.getContext('2d');

        document.addEventListener("assetsloaded", (e) => {
            const { assets } = e.detail;
            this.spritesheet = img ? assets[img] : null;

            if (this.spritesheet) {
                // Set canvas size to total sprite region
                const totalWidth = this.cutWidth * column;
                const totalHeight = this.cutHeight * row;

                this.mask.width = this.cutWidth;
                this.mask.height = this.cutHeight;

                const frameX = column * this.cutWidth;
                const frameY = row * this.cutHeight;
                
                this.mctx.drawImage(
                    this.spritesheet,
                    frameX, frameY,
                    this.cutWidth, this.cutHeight,
                    0, 0,
                    this.cutWidth, this.cutHeight
                );
                
            }
        });
    }

    draw() {
        const ctx = ctxs['bgcs'];
        if (!ctx) return;

        if (this.spritesheet) {
            const pattern = ctx.createPattern(this.mask, 'repeat');
            ctx.fillStyle = pattern;
        } else {
            ctx.fillStyle = this.color;
        }

        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update(t) {
        // Update platform logic if needed
    }

    getVertices() {
        return [
            { x: this.x, y: this.y },
            { x: this.x + this.width, y: this.y },
            { x: this.x + this.width, y: this.y + this.height },
            { x: this.x, y: this.y + this.height }
        ];
    }
}

export default Platform;
