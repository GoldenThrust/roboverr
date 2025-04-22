import { checkCollision } from "../utils/utils.js";

class Collider {
    constructor() {
        this.colliders = [];
    }

    addCollider(collider) {
        this.colliders.push(collider);
    }

    checkCollisons() {
        this.colliders.forEach((collider) => {
            checkCollision(collider.obj1, collider.obj2, collider.runCode, collider.key)
        })
    }

    removeCollider(key) {
        this.colliders = this.colliders.filter(c => c.key !== key);
    }

    multipleCheckCollisions(collider) {
        collider.obj1.forEach((o1) => {
            collider.obj2.forEach((o2) => {
                checkCollision(o1, o2, (o1, o2) => {
                    o1.runCode(o1, o2);
                })
            })
        })
    }
}

export default new Collider;