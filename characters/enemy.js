import { player } from "../main.js";
import collider from "../physics/collider.js";
import { ctxs, generateUniqueId } from "../setup.js";
import { enemySpriteRows } from "../utils/constants.js";
import SpriteAnimation from "../utils/spriteAnimation.js";
import Gun from "../weapons/gun.js";

export default class Enemy {
    constructor({ name, health = 100, attackPower = null, x, y, cutWidth, cutHeight, numberOfColumns = 8, id = "enemy", flip = 1, scaleWidth = 11, scaleHeight = 10 }) {
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
        this.dx = row > 5 ? row / 5 : row;
        this.attackRange = Math.min(Math.max(row * 100, 300), 800);
        this.shootedWeapon = [];
        this.lastFire = 0;
        this.fireRate = this.attackRange;

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
            this.spritesheet.pause();
        }

        this.setFlip(this.x < player.x ? 1 : -1);
    }


    shootGun(t) {
        if (t - this.lastFire < this.fireRate) return;
        this.lastFire = t;
        this.fireWeapon(
            new Gun(10, 1000, this.x + this.width / 1.2, this.y + this.height / 2, this.flip * (5 + Math.abs(this.dx)))
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
                if (!w.active || !p.isAlive())
                    return;
                w.active = false;
                p.takeDamage(w.damage);
                collider.removeCollider(key);
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
