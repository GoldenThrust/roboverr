import { createAudioBuffer, initaudioCtx } from "./audio.js";
import { loadImage } from "./utils.js";

class Assets {
    constructor() {
        this.assetsLoaded = false;
        initaudioCtx();
    }

    async prefetch(assets, callBack) {
        const entries = await Promise.all(
            Object.entries(assets).map(async ([name, url]) => {
                const asset = await callBack(`./assets/${url}`);
                return [name, asset];
            })
        );

        for (const [name, asset] of entries) {
            this[name] = asset;
        }
    }

    async loadImages(images) {
        await this.prefetch(images, loadImage);
    }

    async loadAudio(audio) {
        await this.prefetch(audio, createAudioBuffer);
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
