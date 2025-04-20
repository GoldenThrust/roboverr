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

        for (const [name, image] of entries) {
            this[name] = image;
        }
    }

    async preload(callBack) {
        await callBack(this);
        this.assetsLoaded = true;

        const event = new CustomEvent("assetsloaded", {
            detail: { loaded: true, assets: this }
        });
        document.dispatchEvent(event);
    }
}

const asset = new Assets();
export default asset;
