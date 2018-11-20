export interface ControllerInterface {
  getYaw(): number;

  getPitch(): number;

  getRoll(): number;

  isZoomIn(): boolean;

  isZoomOut(): boolean;

  isTopViewPressed(): boolean;

  isBottomViewPressed(): boolean;

  isLeftViewPressed(): boolean;

  isRightViewPressed(): boolean;

  update(): void;

  isForwardPressed(): boolean;

  isBackwardPressed(): boolean;
}
