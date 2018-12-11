import { Mesh, AudioListener, AudioBuffer } from 'three';
import { Engine } from './Engine';
export declare class Collision implements Engine {
    private enviromentMeshList;
    private mesh;
    private buffer;
    private sound;
    constructor(listner: AudioListener);
    setHitBuffer(buffer: AudioBuffer): void;
    setMesh(mesh: Mesh): void;
    setEnviromentMeshList(enviromentMeshList: Mesh[]): void;
    update(delta: number): void;
}
