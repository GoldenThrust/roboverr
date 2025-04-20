import Platform from "./characters/platform.js";

const whiteBoard = document.querySelectorAll('canvas');
export const canvas = {}
export const ctxs = {};
export const scale = 0.2;


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
    x: -(innerWidth * scale) * 100,
    y: innerHeight,
    width: (innerWidth * scale) * 200,
    height: (innerHeight * scale) * 100,
    cutWidth: 50,
    cutHeight: 50,
    id: 'land',
    img: 'terrain'});

export const background = new Platform({
    x: -10000,
    y: -10000,
    width: 100000,
    height: 100000,
    cutWidth: 60,
    cutHeight: 60,
    id: 'background',
    img: 'bg'});

export function generateUniqueId() {
    return 'id-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}
