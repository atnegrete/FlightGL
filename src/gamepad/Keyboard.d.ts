import { ControllerInterface } from './ControllerInterface';
export declare class Keyboard implements ControllerInterface {
    protected activeKeys: Map<string, boolean>;
    private static rate;
    private yaw;
    private pitch;
    private roll;
    constructor();
    update(): void;
    setKey(keyCode: string, isActive: boolean): void;
    getPitch(): number;
    getRoll(): number;
    getYaw(): number;
    isZoomIn(): boolean;
    isZoomOut(): boolean;
    isTopViewPressed(): boolean;
    isBottomViewPressed(): boolean;
    isLeftViewPressed(): boolean;
    isRightViewPressed(): boolean;
    isVariableThruster(): boolean;
    isForwardPressed(): boolean;
    isBackwardPressed(): boolean;
    getZoomFactor(): number;
    getThruster(): number;
}
