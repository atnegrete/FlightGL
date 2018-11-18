import { ControllerInterface } from './ControllerInterface';

export abstract class Controller implements ControllerInterface {
  protected readonly navigator: Navigator;
  protected readonly controllerIndex: number;

  protected gamepad: Gamepad;

  constructor(controllerIndex: number, navigator: Navigator) {
    this.controllerIndex = controllerIndex;
    this.navigator = navigator;
  }

  abstract getYaw(): number;

  abstract getPitch(): number;

  abstract getRoll(): number;

  abstract isZoomIn(): boolean;

  abstract isZoomOut(): boolean;

  abstract isTopViewPressed(): boolean;

  abstract isBottomViewPressed(): boolean;

  abstract isLeftViewPressed(): boolean;

  abstract isRightViewPressed(): boolean;

  update(): void {
    this.gamepad = this.navigator.getGamepads()[this.controllerIndex];
  }
}

import { Playstation3 } from './Playstation3';

export function createController(): Controller {
  let gamepads: Gamepad[] = navigator.getGamepads();

  console.log(gamepads);

  for (let i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      if (gamepads[i].id.startsWith('PLAYSTATION')) {
        return new Playstation3(i, navigator);
      }
    }
  }

  return null;
}
