import { Object3D } from 'three';
import { Engine } from '../engine/Engine';
export declare class MPlayer implements Engine {
    private client;
    private room;
    private readonly ROOM_ID;
    private tieFighter;
    private enemyTieFighter;
    private enemyPosition;
    private enemyRotation;
    private onRoomReadyCallback;
    constructor(onRoomReadyCallback: any, fighter: Object3D, enemyFighter: Object3D);
    private createOrJoinRoom;
    private onRoomJoin;
    private onRoomLeave;
    private updateEnemeyPos;
    private updateEnemeyRot;
    sendPlayerControls(yaw: number, pitch: number, roll: number): void;
    update(delta: number): void;
}
