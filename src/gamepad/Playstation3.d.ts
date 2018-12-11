import { ControllerInterface } from './ControllerInterface';
import { Controller } from './Controller';
export declare class Playstation3 extends Controller implements ControllerInterface {
    getYaw(): number;
    getPitch(): number;
    getRoll(): number;
    isZoomIn(): boolean;
    isZoomOut(): boolean;
    isTopViewPressed(): boolean;
    isBottomViewPressed(): boolean;
    isLeftViewPressed(): boolean;
    isRightViewPressed(): boolean;
    isForwardPressed(): boolean;
    isBackwardPressed(): boolean;
    getZoomFactor(): number;
    getThruster(): number;
}
