import { ControllerInterface } from './ControllerInterface';

export abstract class Controller implements ControllerInterface {
  protected readonly navigator: Navigator;
  protected readonly controllerIndex: number;
  protected readonly variableThruster: boolean;

  protected gamepad: Gamepad;

<<<<<<< HEAD
  constructor(controllerIndex: number, navigator: Navigator, variableThruster: boolean) {
=======
  constructor(
    controllerIndex: number,
    navigator: Navigator,
    variableThruster: boolean
  ) {
>>>>>>> environment
    this.controllerIndex = controllerIndex;
    this.navigator = navigator;
    this.variableThruster = variableThruster;
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

  isVariableThruster(): boolean {
    return this.variableThruster;
  }

  abstract isForwardPressed(): boolean;

  abstract isBackwardPressed(): boolean;

  abstract getThruster(): number;
<<<<<<< HEAD
  
=======

>>>>>>> environment
  update(): void {
    this.gamepad = this.navigator.getGamepads()[this.controllerIndex];
  }
}

import { Playstation3, Keyboard, SaitekX52 } from './Controllers';

export function createController(): ControllerInterface {
  let gamepads: Gamepad[] = navigator.getGamepads();

  console.log(gamepads);

  for (let i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      if (gamepads[i].id.startsWith('PLAYSTATION')) {
        return new Playstation3(i, navigator, false);
      } else if (
        gamepads[i].id.startsWith('Saitek X52 Flight Control System')
      ) {
        return new SaitekX52(i, navigator, true);
      }
    }
  }

  return new Keyboard();
}
