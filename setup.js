import Camera from "./camera/camera.js";
import Platform from "./characters/platform.js";

const whiteBoard = document.querySelectorAll('canvas');
export const canvas = {}
export const ctxs = {};
export const scale = 0.2;
export const maxDistance = 50000;


whiteBoard.forEach((cs) => {
    canvas[cs.id] = cs;
    cs.width = innerWidth;
    cs.height = innerHeight;
    ctxs[cs.id] = cs.getContext('2d');
})

addEventListener('resize', () => {
    whiteBoard.forEach((cs) => {
        canvas[cs.id] = cs;
        cs.width = innerWidth;
        cs.height = innerHeight;
    })
})

export const land = new Platform({
    x: -maxDistance/2,
    y: innerHeight,
    width: maxDistance,
    height: (innerHeight * scale) * 100,
    cutWidth: 50,
    cutHeight: 50,
    id: 'land',
    img: 'terrain'
});

export const background = new Platform({
    x: -maxDistance/2,
    y: -10000,
    width: maxDistance,
    height: 100000,
    cutWidth: 60,
    cutHeight: 60,
    id: 'background',
    img: 'bg'
});


export const scene = [];
["bgcs", "mgcs", "fgcs"].forEach((cs) => {
    const ctx = ctxs[cs];
    // ctx.canvas.width = innerWidth;
    // ctx.save();
    // ctx.translate(innerWidth / 2, innerHeight / 2);
    // ctx.scale(scale, scale);
    // ctx.translate(-innerWidth / 2, -innerHeight / 2);
    scene.push(new Camera({
        scale,
        ctx
    }))
});