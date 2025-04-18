import { loadImage } from "./utils.js";

class Assets {
    constructor() {
        this.assetsLoaded = false;
    }
    async loadImages(images) {
        const entries = await Promise.all(
            Object.entries(images).map(async ([name, url]) => {
                const image = await loadImage(`./assets/${url}`);
                return [name, image];
            })
        );

        entries.map(([name, image]) => {
            this[name] = image;
        });
    }

    async preload(callBack) {
        await callBack(this);
        this.assetsLoaded = true;
        console.log("Assets preloaded successfully!");
    }
}

const asset = new Assets();
export default asset;