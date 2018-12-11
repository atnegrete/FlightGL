import * as THREE from 'three';
export declare class Planet extends THREE.Mesh {
    constructor(texture: THREE.Texture);
    generateBasicMaterial(texture: THREE.Texture): void;
}
