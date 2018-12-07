import * as THREE from 'three';
import { MeshBasicMaterial, Texture } from 'three';

export class Asteroid extends THREE.Mesh {
  constructor(texture: Texture) {
    super();
    this.geometry = new THREE.SphereGeometry(25, 5, 8);
    this.material = new THREE.MeshBasicMaterial({
      map: texture,
      overdraw: 0.1,
    });
  }
}
