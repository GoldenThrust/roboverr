const leftController = document.querySelector('#leftController');
const rightController = document.querySelector('#rightController');
const jumpController = document.querySelector('#jumpController');
const shootController = document.querySelector('#shootController');

class Touchpad {
  constructor() {
    this.leftController = leftController;
    this.rightController = rightController;
    this.jumpController = jumpController;
    this.shootController = shootController;
    this.isGoingLeft = false;
    this.isGoingRight = false;
    this.isJumping = false;
    this.isShooting = false;
    this.#eventListener();
  }

  #eventListener() {
    this.leftController.addEventListener('touchstart', () => {
      this.isGoingLeft = true;
    });
    this.leftController.addEventListener('touchend', () => {
      this.isGoingLeft = false;
    });
    this.rightController.addEventListener('touchstart', () => {
      this.isGoingRight = true;
    });
    this.rightController.addEventListener('touchend', () => {
      this.isGoingRight = false;
    });
    this.jumpController.addEventListener('touchstart', () => {
      this.isJumping = true;
    });
    this.jumpController.addEventListener('touchend', () => {
      this.isJumping = false;
    });
    this.shootController.addEventListener('touchstart', () => {
      this.isShooting = true;
    });
    this.shootController.addEventListener('touchend', () => {
      this.isShooting = false;
    });
  }
}

const touchpad = new Touchpad();
export default touchpad;