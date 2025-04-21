import { ctxs } from "../setup.js";

export default class Camera {
    constructor({
        x = 0,
        y = 0,
        width = window.innerWidth,
        height = window.innerHeight,
        scale = 1,
        ctx = ctxs['mgcs']
    }) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.scale = scale;
        this.ctx = ctx;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    setScale(scale) {
        this.scale = scale;
    }

    getScale() {
        return this.scale;
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }

    attachToPlayer(player) {
        this.x = player.x - this.width / 2;
        // this.y = player.y - this.height / 2;
    }

    animate({ animateInScene = () => { }, animateOutScene = () => { } }) {
        const { ctx, scale, x, y, width, height } = this;

        // Reset canvas size and clear previous transforms
        ctx.canvas.width = width;
        ctx.canvas.height = height;

        ctx.save();
        // ctx.clearRect(0, 0, width, height);

        // Move to center, apply scale and translate according to camera position
        ctx.translate(width / 2, height / 2);
        ctx.scale(scale, scale);
        ctx.translate(-x - width / 2, -y - height / 2);

        animateInScene(ctx);

        ctx.restore();
        animateOutScene(ctx);
    }
}
