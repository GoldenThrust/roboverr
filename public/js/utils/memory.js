class Memory {
    constructor(memoryname, defaultData) {
        const gameMemory = localStorage.getItem(memoryname)
            ? JSON.parse(localStorage.getItem(memoryname))
            : defaultData;


        this.highScore = gameMemory.highScore;
        this.score = gameMemory.score;
        this.lives = gameMemory.lives;
        this.pause = gameMemory.pause;
        this.time = gameMemory.time;
        this.memory = memoryname;
        fetch('/api/scores/user').then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to fetch user scores');
            }
        }).then(data => {
            if (data && data.length > 0) {
                this.highScore = Math.max(this.highScore, ...data.map(score => score.score));
                const event = new CustomEvent("highscoreloaded", {
                    detail: { loaded: true, highscore: this.highScore }
                });
                document.dispatchEvent(event);
            }
        }).catch(error => {
            console.error('Error fetching user scores:', error);
        });
    }

    save() {
        localStorage.setItem(this.memory, JSON.stringify(this));
    }
    reset() {
        this.highScore = 0;
        this.score = 0;
        this.pause = false;
        this.time = 0;
        localStorage.removeItem(this.memory);
    }
    updateHighScore(score) {
        if (score > this.highScore) {
            this.highScore = score;
            this.save();
        }
    }
    updateScore(score) {
        this.score = score;
        this.save();
    }
    updateLives(lives) {
        this.lives = lives;
        this.save();
    }
    updatePause(pause) {
        this.pause = pause;
        this.save();
    }

    updateTime(time) {
        this.time = this.time ? this.time + time : time;
        this.save();
    }
    getHighScore() {
        return this.highScore;
    }
    getScore() {
        return this.score;
    }
    getLives() {
        return this.lives;
    }
    getPause() {
        return this.pause;
    }
    getGameMemory() {
        return this;
    }

    getTime() {
        return this.time;
    }

    setGameMemory(gameMemory) {
        this.highScore = gameMemory.highScore;
        this.score = gameMemory.score;
        this.lives = gameMemory.lives;
        this.pause = gameMemory.pause;
        this.save();
    }
    getGameMemoryFromLocalStorage() {
        return JSON.parse(localStorage.getItem(this.memory));
    }

    resetGameMemory() {
        localStorage.removeItem(this.memory);
    }
}

const highScore = localStorage.getItem('highscore') || 0;

const memory = new Memory('gameData', { highScore: Number(highScore), score: 0, lives: 1000, pause: false, time: 0 });
export default memory;
