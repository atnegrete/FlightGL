import { ControllerInterface } from './ControllerInterface';
import { Controller } from './Controller';

export class Playstation3 extends Controller implements ControllerInterface {
  getYaw(): number {
    return Number.parseFloat(this.gamepad.axes[2].toFixed(1));
  }

  getPitch(): number {
    return Number.parseFloat(this.gamepad.axes[1].toFixed(1));
  }

  getRoll(): number {
    return Number.parseFloat(this.gamepad.axes[0].toFixed(1));
  }

  isZoomIn(): boolean {
    return this.gamepad.buttons[5].pressed;
  }

  isZoomOut(): boolean {
    return this.gamepad.buttons[4].pressed;
  }

  isTopViewPressed(): boolean {
    return this.gamepad.buttons[12].pressed;
  }

  isBottomViewPressed(): boolean {
    return this.gamepad.buttons[13].pressed;
  }

  isLeftViewPressed(): boolean {
    return this.gamepad.buttons[14].pressed;
  }

  isRightViewPressed(): boolean {
    return this.gamepad.buttons[15].pressed;
  }

  isForwardPressed(): boolean {
    return this.gamepad.buttons[6].pressed;
  }

  isBackwardPressed(): boolean {
    return this.gamepad.buttons[7].pressed;
  }

  getZoomFactor(): number {
    console.log("No zoom on PLaystation 3");
    return 0;
  }

  getThruster(): number {
    throw new Error('Method not implemented.');
  }
}
