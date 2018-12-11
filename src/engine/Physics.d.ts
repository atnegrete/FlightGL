import { Engine } from './Engine';
export declare class Physics implements Engine {
    private rotationVector;
    private onAxisRotation;
    private velocity;
    private readonly modelMaxRotation;
    private _thrust;
    thrust: number;
    private _roll;
    roll: number;
    private _pitch;
    pitch: number;
    private _yaw;
    yaw: number;
    update(dt: number): void;
    private clamp;
    private updateVelocity;
    private updateRotationMatrix;
    getVelocity(): number;
    getPitch(): number;
    getRoll(): number;
    getYaw(): number;
    getPitchRad(): number;
    getRollRad(): number;
    getYawRad(): number;
    getPitchOnAxis(): number;
    getRollOnAxis(): number;
    getYawOnAxis(): number;
}
