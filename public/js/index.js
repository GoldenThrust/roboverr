import memory from "./utils/memory.js"

document.querySelectorAll('.playGame')?.forEach(element => {
    element.addEventListener('click', () => {
        memory.reset();
        location.href = '/game';
    })
});

document.querySelector('#googleSignIn')?.addEventListener('click', async () => {
    try {
        const response = await fetch('/auth/google/url');
        const data = await response.json();

        if (data.url) {
            window.location.href = data.url;
        } else {
            console.error('Failed to get authentication URL');
        }
    } catch (error) {
        console.error('Error during authentication:', error);
    }
});

document.getElementById('logoutBtn')?.addEventListener('click', async function (e) {
    e.preventDefault();
    try {
        await fetch('/api/auth/logout');
        window.location.reload();
    } catch (error) {
        console.error('Logout failed:', error);
    }
});

window.addEventListener('click', function (event) {
    if (event.target === document.getElementById('scoresModal')) {
        document.getElementById('scoresModal').style.display = 'none';
    }
});

document.querySelector('.close').addEventListener('click', function () {
    document.getElementById('scoresModal').style.display = 'none';
});

async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();

        if (data.authenticated) {
            console.log('User is already authenticated:', data.user);
        }
    } catch (error) {
        console.error('Error checking authentication status:', error);
    }
}

checkAuthStatus();

addEventListener("click", () => {
    if (document.fullscreenElement === null)
        document.documentElement.requestFullscreen()
});

addEventListener("contextmenu", (e) => {
    e.preventDefault();
});

function clearMemory() {
    memory.reset();
}