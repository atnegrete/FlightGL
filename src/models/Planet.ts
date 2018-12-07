import * as THREE from 'three';

export class Planet extends THREE.Mesh {
  constructor(texture: THREE.Texture) {
    super();
    this.generateBasicMaterial(texture);
  }

  generateBasicMaterial(texture: THREE.Texture) {
    this.geometry = new THREE.SphereGeometry(3000, 25, 25);
    this.material = new THREE.MeshBasicMaterial({
      map: texture,
      overdraw: 0.5,
    });
  }
}
  