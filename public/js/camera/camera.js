import { ctxs } from "../setup.js";

export default class Camera {
    constructor({
        x = 0,
        y = 0,
        width,
        height,
        scale = 1,
        ctx = ctxs['mgcs']
    }) {
        this.x = x;
        this.y = y;
        this.scale = scale;
        this.ctx = ctx;
        this.width = width ?? ctx.canvas.width;
        this.height = height ?? ctx.canvas.height;

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

        ctx.canvas.width = ctx.canvas.width;
        ctx.canvas.height = ctx.canvas.height;

        ctx.save();
        // ctx.clearRect(0, 0, width, height);

        ctx.translate(width / 2, height / 2);
        ctx.scale(scale, scale);
        if (window.innerHeight > window.innerWidth) {
            ctx.rotate(Math.PI / 2);
        } else {
            ctx.rotate(0);
        }
        ctx.translate(-x - width / 2, -y - height / 2);

        animateInScene(ctx);
        ctx.restore();

        animateOutScene(ctx);
    }
}
