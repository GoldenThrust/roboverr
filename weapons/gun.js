// Gun.js
import { ctxs } from "../setup.js";

export default class Gun {
    constructor(damage, range, x, y, speed = 10) {
        this.damage = damage;
        this.range = range;
        this.x = x;
        this.startPoint = x;
        this.y = y;
        this.width = 10;
        this.height = 5;
        this.color = "red";
        this.speed = speed;
        this.active = true;
    }

    draw() {
        ctxs['mgcs'].fillStyle = this.color;
        ctxs['mgcs'].fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x += this.speed;
        if (Math.abs(this.x - this.startPoint) > this.range) {
            this.active = false;
        }
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