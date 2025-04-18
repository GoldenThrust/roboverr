import Platform from "./characters/platform.js";

const whiteBoard = document.querySelectorAll('canvas');
export const canvas = {}
export const ctxs = {};


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

export const land = new Platform(-50000, innerHeight, 100000, innerHeight * 2, null, "Land");
