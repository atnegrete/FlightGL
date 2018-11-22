import { ControllerInterface } from './ControllerInterface';

export class Keyboard implements ControllerInterface {
  protected activeKeys: Map<string, boolean>;
  private static rate = 0.03;
  private yaw: number;
  private pitch: number;
  private roll: number;

  public constructor() {
    this.activeKeys = new Map<string, boolean>();
    EventHandler.RegisterKeyPress(this);
    this.yaw = 0.0;
    this.pitch = 0.0;
    this.roll = 0.0;
  }

  update(): void {}

  setKey(keyCode: string, isActive: boolean): void {
    if (keyCode == 'KeyW') {
      if (isActive) this.pitch = Math.min(1.0, this.pitch + Keyboard.rate);
    } else if (keyCode == 'KeyS') {
      if (isActive) this.pitch = Math.max(-1.0, this.pitch - Keyboard.rate);
    } else if (keyCode == 'KeyA') {
      if (isActive) this.roll = Math.min(1.0, this.roll + Keyboard.rate);
    } else if (keyCode == 'KeyD') {
      if (isActive) this.roll = Math.max(-1.0, this.roll - Keyboard.rate);
    } else if (keyCode == 'KeyQ') {
      if (isActive) this.yaw = Math.min(1.0, this.yaw + Keyboard.rate);
    } else if (keyCode == 'KeyE') {
      if (isActive) this.yaw = Math.max(-1.0, this.yaw - Keyboard.rate);
    } else {
      this.activeKeys.set(keyCode, isActive);
    }
    const keys = this.activeKeys;
    const pitch = this.pitch;
    const roll = this.roll;
    const yaw = this.yaw;
    // console.log({ keys, pitch, roll, yaw });
  }

  getPitch(): number {
    return this.pitch;
  }

  getRoll(): number {
    return this.roll;
  }

  getYaw(): number {
    return this.yaw;
  }

  isZoomIn(): boolean {
    return this.activeKeys.get('ArrowDown');
  }

  isZoomOut(): boolean {
    return this.activeKeys.get('ArrowUp');
  }

  isTopViewPressed(): boolean {
    return this.activeKeys.get('KeyT');
  }

  isBottomViewPressed(): boolean {
    return this.activeKeys.get('KeyB');
  }

  isLeftViewPressed(): boolean {
    return this.activeKeys.get('KeyL');
  }

  isRightViewPressed(): boolean {
    return this.activeKeys.get('KeyR');
  }

  isVariableThruster(): boolean {
    return false;
  }

  isForwardPressed(): boolean {
    return this.isZoomIn();
  }

  isBackwardPressed(): boolean {
    return this.isZoomOut();
  }

  getThruster(): number {
    throw new Error('Method not implemented.');
  }
}

class EventHandler {
  static RegisterKeyPress(keyboard: Keyboard) {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      keyboard.setKey(e.code, true);
    });

    document.addEventListener('keyup', (e: KeyboardEvent) => {
      keyboard.setKey(e.code, false);
    });
  }
}
