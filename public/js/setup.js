import Camera from "./camera/camera.js";
import Platform from "./characters/platform.js";
import memory from "./utils/memory.js";
import { displayPauseScreen, isMobileDevice } from "./utils/utils.js";

const whiteBoard = document.querySelectorAll('canvas');
export const canvas = {}
export const ctxs = {};
export const scale = 0.2;
export const maxDistance = 50000;

addEventListener("click", () => {
    if (document.fullscreenElement === null)
        document.documentElement.requestFullscreen()
});


whiteBoard.forEach((cs) => {
    canvas[cs.id] = cs;
    cs.width = innerWidth;
    cs.height = innerHeight;
    ctxs[cs.id] = cs.getContext('2d');
})

addEventListener("resize", () => {
    whiteBoard.forEach((cs) => {
        canvas[cs.id] = cs;
        // if (window.innerHeight > window.innerWidth) {
        //     cs.width = innerHeight;
        //     cs.height = innerWidth;
        // } else {
            cs.width = innerWidth;
            cs.height = innerHeight;
        // }
    })
})

export const land = new Platform({
    x: -maxDistance / 2,
    y: ctxs['bgcs'].canvas.height,
    width: maxDistance,
    height: (ctxs['bgcs'].canvas.height * scale) * 100,
    cutWidth: 50,
    cutHeight: 50,
    id: 'land',
    img: 'terrain'
});

export const background = new Platform({
    x: -maxDistance / 2,
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
    scene.push(new Camera({
        scale,
        ctx
    }))
});


export const gameData = document.querySelector('#gameData');
export const timeElement = document.querySelector('#time');
export const scoreElement = gameData.querySelector('#score');
export const highScoreElement = gameData.querySelector('#highScore');
export const pauseButton = gameData.querySelector('#pauseButton');

export const pauseMenu = document.querySelector('#pauseMenu');
export const resumeButton = pauseMenu.querySelector('#resumeButton');

export const gameOverMenu = document.querySelector('#gameOverMenu');
export const gameOverScore = gameOverMenu.querySelector('#gameOverScore');
export const gameOverHighScore = gameOverMenu.querySelector('#gameOverHighScore');

const restartButton = document.querySelectorAll('.restartButton');
const menuButton = document.querySelectorAll('.menuButton');


pauseButton.addEventListener('click', () => {
    displayPauseScreen(true);
});

resumeButton.addEventListener('click', () => {
    displayPauseScreen(false);
});

restartButton.forEach((btn) => {
    btn.addEventListener('click', () => {
        memory.reset();
        location.reload();
        memory.reset();
    });
})

menuButton.forEach((btn) => {
    btn.addEventListener('click', () => {
        memory.reset();
        location.href = '/';
    });
})


window.addEventListener('beforeunload', (event) => {
    displayPauseScreen();
});

// document.addEventListener('visibilitychange', () => {
//     displayPauseScreen();
// });

window.addEventListener('blur', () => {
    displayPauseScreen();
});

window.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});

const gameController = document.querySelector('#gameController');

if (isMobileDevice()) {
    gameController.classList.remove('hidden');
} else {
    gameController.classList.add('hidden');
}