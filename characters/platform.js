import { ctxs } from "../setup.js";

class Platform {
    constructor(x, y, width, height, img = null, id = "Platform") {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = "blue";
        this.id = id;
        this.assets = img ? assets[img] : null;
    }
    draw() {
        if (this.assets) {
            ctxs['bgcs'].drawImage(this.assets, this.x, this.y, this.width, this.height);
        } else {
            ctxs['bgcs'].fillStyle = this.color;
            ctxs['bgcs'].fillRect(this.x, this.y, this.width, this.height);
        }
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