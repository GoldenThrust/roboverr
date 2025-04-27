class KeyBoard {
  constructor() {
    addEventListener('keydown', (e) => {
        this[e.code] = true;
    });

    addEventListener('keyup', (e) => {
        this[e.code] = false;
    });
  }


}

const keyBoard = new KeyBoard();
export default keyBoard;
