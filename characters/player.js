import keyBoard from "../controller/keyBoard.js";
import { ctxs } from "../setup.js";
import SpriteAnimation from "../utils/spriteAnimation.js";

class Player {
    constructor(x, y, spritesNames = { move: null, jump: null, idle: null, crouch: null }, scalew = 1, scaleh = 1, color = "blue", id = "Player") {
        if (!spritesNames['idle']) {
            throw new Error("Player: No idle sprite provided.");
        }

        this.id = id;
        this.x = x;
        this.y = y;
        this.flip = 1;
        this.dx = 0;
        this.dy = 0;
        this.gravity = 1;
        this.jumpStrength = 20;
        this.isOnGround = true;

        this.spritesNames = spritesNames;
        this.controller = keyBoard;
        this.width = 287;
        this.height = 290;

        // Animations
        this.running = new SpriteAnimation({
            ctx: ctxs['mgcs'],
            spritesheet: spritesNames['move'],
            x,
            y,
            cutWidth: this.width,
            cutHeight: this.height,
            scaleWidth: scalew,
            scaleHeight: scaleh,
            numberOfRows: 1,
            numberOfColumns: 10,
            fps: 20,
            maxIterations: 1,
            hide: true,
            color
        });
        
        this.standing = new SpriteAnimation({
            ctx: ctxs['mgcs'],
            spritesheet: spritesNames['idle'],
            x,
            y,
            cutWidth: this.width,
            cutHeight: this.height,
            scaleWidth: scalew,
            scaleHeight: scaleh,
            numberOfRows: 1,
            numberOfColumns: 2,
            fps: 2,
            maxIterations: 0, // loop forever
            hide: false,
            color
        });
        
        this.jumpAnim = new SpriteAnimation({
            ctx: ctxs['mgcs'],
            spritesheet: spritesNames['jump'],
            x,
            y,
            cutWidth: this.width,
            cutHeight: this.height,
            scaleWidth: scalew,
            scaleHeight: scaleh,
            numberOfRows: 1,
            numberOfColumns: 3,
            fps: 10,
            maxIterations: 1,
            hide: true,
            color
        });
    }

    update(t) {
        this.movement(t);

        this.dy += this.gravity;

        this.y += this.dy;


        // Update animation positions
        const newProps = { x: this.x, y: this.y };
        this.running.setProperties(newProps);
        this.jumpAnim.setProperties(newProps);
        this.standing.setProperties(newProps);
    }

    movement(t) {
        const keys = this.controller;

        // Jump
        if (keys['ArrowUp'] && this.isOnGround) {
            this.dy = -this.jumpStrength;
            this.isOnGround = false;
            this.jumpAnim.restart();
        }

        let moving = false;

        // Left and right
        if (keys['ArrowLeft']) {
            this.dx = -5;
            this.x += this.dx;
            this.flip = -1;
            moving = true;
        } else if (keys['ArrowRight']) {
            this.dx = 5;
            this.x += this.dx;
            this.flip = 1;
            moving = true;
        } else {
            this.dx = 0;
        }

        // Animate
        if (!this.isOnGround && this.jumpAnim.state === 'running') {
            this.jumpAnim.animate(t, this.flip);
        } else if (moving) {
            if (this.running.state === 'paused') this.running.restart();
            this.running.animate(t, this.flip);
        } else {
            if (this.standing.state === 'paused') this.standing.restart();
            this.standing.animate(t, this.flip);
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

export default Player;
