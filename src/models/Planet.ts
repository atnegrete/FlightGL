import * as THREE from 'three';

export class Planet extends THREE.Mesh {
  constructor(texture: THREE.Texture, scene: THREE.Scene) {
    super();
    this.generateBasicMaterial(texture, scene);
  }

  generateBasicMaterial(texture: THREE.Texture, scene: THREE.Scene) {
    this.geometry = new THREE.SphereGeometry(500, 25, 25);
    this.material = new THREE.MeshBasicMaterial({
      map: texture,
      overdraw: 0.5,
    });
  }
}
