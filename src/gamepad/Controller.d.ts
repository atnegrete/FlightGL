import { ControllerInterface } from './ControllerInterface';
export declare abstract class Controller implements ControllerInterface {
    protected readonly navigator: Navigator;
    protected readonly controllerIndex: number;
    protected readonly variableThruster: boolean;
    protected gamepad: Gamepad;
    constructor(controllerIndex: number, navigator: Navigator, variableThruster: boolean);
    abstract getYaw(): number;
    abstract getPitch(): number;
    abstract getRoll(): number;
    abstract isZoomIn(): boolean;
    abstract isZoomOut(): boolean;
    abstract isTopViewPressed(): boolean;
    abstract isBottomViewPressed(): boolean;
    abstract isLeftViewPressed(): boolean;
    abstract isRightViewPressed(): boolean;
    isVariableThruster(): boolean;
    abstract isForwardPressed(): boolean;
    abstract isBackwardPressed(): boolean;
    abstract getZoomFactor(): number;
    abstract getThruster(): number;
    update(): void;
}
export declare function createController(): ControllerInterface;
