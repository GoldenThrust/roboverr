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
            checkCollision(collider.obj1, collider.obj2, collider.runCode)
        })
    }
}

export default new Collider;