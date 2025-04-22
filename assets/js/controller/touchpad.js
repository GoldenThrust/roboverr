class KeyBoard {
    constructor() {
      addEventListener('keydown', (e) => {
          this[e.key] = true;
      });
  
      addEventListener('keyup', (e) => {
          this[e.key] = false;
      });
    }
  
  
  }
  
  const keyBoard = new KeyBoard();
  export default keyBoard;
  