import { player } from "../main.js";
import collider from "../physics/collider.js";
import { ctxs } from "../setup.js";
import { enemySpriteRows } from "../utils/constants.js";
import SpriteAnimation from "../utils/spriteAnimation.js";
import { generateUniqueId } from "../utils/utils.js";
import Gun from "../weapons/gun.js";

export default class Enemy {
    constructor({ name, health = 100, attackPower = null, x, y, cutWidth, cutHeight, numberOfColumns = 8, id = "enemy", flip = 1, scaleWidth = 11, scaleHeight = 10, fireRateFactor = 1, dxFactor = 1 }) {
        this.name = name;
        this.health = health;
        this.attackPower = attackPower;
        this.x = x;
        this.cutWidth = cutWidth;
        this.cutHeight = cutHeight;
        this.width = cutWidth * scaleWidth;
        this.height = cutHeight * scaleHeight;
        this.color = "red";
        this.id = id;
        this.flip = flip;
        this.y = (y - this.height) + 15;
        this.lastUpdate = 0;
        const row = enemySpriteRows[name] ?? 0;
        this.dx = (row > 5 ? row / 5 : row) * dxFactor;
        this.attackRange = Math.min(Math.max(row * 100, 300), 800);
        this.shootedWeapon = [];
        this.lastFire = 0;
        this.fireRate = this.attackRange * fireRateFactor;
        this.gravity = 0.3;
        this.dy = 0;
        this.isOnGround = false;
        this.gunRange = this.attackRange * 10;

        this.spritesheet = new SpriteAnimation({
            ctx: ctxs["mgcs"],
            spritesheet: id,
            x: this.x,
            y: this.y,
            cutWidth,
            cutHeight,
            numberOfColumns,
            row,
            fps: 5,
            scaleWidth,
            scaleHeight,
            color: "white",
        });
    }

    update(t, player) {
        this.dy += this.gravity;
        this.y += this.dy;
        this.shootedWeapon = this.shootedWeapon.filter((weapon) => {
            weapon.update();
            weapon.draw();
            return weapon.active;
        });
        if (this.spritesheet.state === 'paused') this.spritesheet.restart();
        this.spritesheet.animate(t, this.flip);

        if (this.isAlive() && Math.abs(this.x - player.x) > this.attackRange) {
            if (this.x < player.x) this.move(this.dx, 0);
            else if (this.x > player.x) this.move(-this.dx, 0);
        } else {
            this.shootGun(t);
            // this.spritesheet.pause();
        }

        this.setFlip(this.x < player.x ? 1 : -1);
        this.spritesheet.setProperties({ x: this.x, y: this.y });
    }


    shootGun(t) {
        if (t - this.lastFire < this.fireRate) return;
        this.lastFire = t;
        this.fireWeapon(
            new Gun({ damage: 10, range: this.gunRange, x: this.x + this.width / 1.2, y: this.y + this.height / 2, speed: this.flip * (10 + Math.abs(this.dx)) })
        );
    }

    fireWeapon(weapon) {
        this.shootedWeapon.push(weapon);
        const colliderKey = generateUniqueId();

        collider.addCollider({
            obj1: weapon,
            obj2: player,
            key: colliderKey,
            runCode: (w, p, key) => {
                if (!w.active || !p.isAlive() || p.damage)
                    return;
                w.active = false;

                if (this && this?.isAlive())
                    p.takeDamage(w.damage);
                collider.removeCollider(key);
                if (Math.ceil((p.health / p.lives) * 10) < p.previousHealth) {
                    p.damage = true;
                    p.invisible = true;
                    p.previousHealth = Math.ceil((p.health / p.lives) * 10);

                    const intervalID = setInterval(() => {
                        p.invisible = !p.invisible;
                    }, 100);

                    setTimeout(() => {
                        clearInterval(intervalID);
                        p.damage = false;
                        p.invisible = false;
                    }, 2000);
                }
            },
        });
    }

    draw(t) {
        const ctx = ctxs["mgcs"];
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, this.width, 5);

        ctx.fillStyle = "lime";
        ctx.fillRect(this.x, this.y, (this.health / 100) * this.width, 5);
    }

    isAlive() {
        return this.health > 0;
    }

    takeDamage(damage) {
        this.health = Math.max(this.health - damage, 0);
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.spritesheet.setProperties({ x: this.x, y: this.y });
    }

    setFlip(dir = 1) {
        this.flip = dir;
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
