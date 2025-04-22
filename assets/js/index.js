import memory from "./utils/memory.js"

document.querySelector('#guestGame').addEventListener('click', () => {
    memory.reset();
    location.href = '/game.html?gameid=guest';
})