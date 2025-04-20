import keyBoard from "../controller/keyBoard.js";
import { enemies } from "../main.js";
import collider from "../physics/collider.js";
import { ctxs, generateUniqueId } from "../setup.js";
import SpriteAnimation from "../utils/spriteAnimation.js";
import Gun from "../weapons/gun.js";

class Player {
    constructor(x, y, spritesNames = { move: null, jump: null, idle: null, crouch: null }, scalew = 1, scaleh = 1, color = "blue", id = "Player") {
        if (!spritesNames['idle']) {
            throw new Error("Player: No idle sprite provided.");
        }

        this.health = 1000;
        this.id = id;
        this.x = x;
        this.y = y;
        this.flip = 1;
        this.dx = 0;
        this.dy = 0;
        this.gravity = 1;
        this.jumpStrength = 30;
        this.isOnGround = true;

        this.spritesNames = spritesNames;
        this.controller = keyBoard;
        this.width = 207 * scalew;
        this.height = 290 * scaleh;
        this.shootedWeapon = [];
        this.lastUpdate = 0;
        this.lastFire = 0;
        this.fireRate = 100;

        const baseProps = {
            ctx: ctxs['mgcs'],
            x, y,
            cutWidth: this.width,
            cutHeight: this.height,
            color
        };

        this.running = new SpriteAnimation({
            ...baseProps,
            spritesheet: spritesNames['move'],
            numberOfColumns: 10,
            fps: 20,
            maxIterations: 1,
            hide: true
        });

        this.standing = new SpriteAnimation({
            ...baseProps,
            spritesheet: spritesNames['idle'],
            numberOfColumns: 2,
            fps: 2,
            hide: false
        });

        this.jumpAnim = new SpriteAnimation({
            ...baseProps,
            spritesheet: spritesNames['jump'],
            numberOfColumns: 3,
            fps: 10,
            maxIterations: 1,
            hide: true
        });
    }


    update(t) {
        this.shootedWeapon = this.shootedWeapon.filter((weapon) => {
            weapon.update();
            weapon.draw();
            return weapon.active;
        });

        this.movement(t);

        this.dy += this.gravity;
        this.y += this.dy;

        const newProps = { x: this.x, y: this.y };
        this.running.setProperties(newProps);
        this.jumpAnim.setProperties(newProps);
        this.standing.setProperties(newProps);
    }

    movement(t) {
        const keys = this.controller;

        if (keys['Enter']) {
            this.shootGun(t);
        }

        if (keys['ArrowUp'] && this.isOnGround) {
            this.dy = -this.jumpStrength;
            this.isOnGround = false;
            this.jumpAnim.restart();
        }

        let moving = false;

        if (keys['ArrowLeft']) {
            this.dx = -10;
            this.x += this.dx;
            this.flip = -1;
            moving = true;
        } else if (keys['ArrowRight']) {
            this.dx = 10;
            this.x += this.dx;
            this.flip = 1;
            moving = true;
        } else {
            this.dx = 0;
        }

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

    shootGun(t) {
        if (t - this.lastFire < this.fireRate) return;
        this.lastFire = t;
        this.fireWeapon(
            new Gun(10, 5000, this.x + this.width / 2, this.y + this.height / 2.5, this.flip * (20 + Math.abs(this.dx)))
        );
    }

    fireWeapon(weapon) {
        this.shootedWeapon.push(weapon);
        const colliderKey = generateUniqueId();

        enemies.forEach((e) => {
            collider.addCollider({
                obj1: weapon,
                obj2: e,
                key: colliderKey,
                runCode: (w, en, key) => {
                    if (!w.active || !en.isAlive())
                        return;
                    w.active = false;
                    en.takeDamage(w.damage);
                    collider.removeCollider(key);
                },
            });
        });
    }

    isAlive() {
        return this.health > 0;
    }
    
        
    takeDamage(damage) {
        this.health = Math.max(this.health - damage, 0);
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