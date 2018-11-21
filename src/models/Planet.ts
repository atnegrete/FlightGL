import * as THREE from 'three';
import { Mesh } from 'three';

export class Planet extends THREE.Mesh {
  private mesh: Mesh[];
  private planetTextures: [];

  constructor(texture: string) {
    super();
    this.planetTextures = [];
    this.generateBasicMaterial(texture);
  }

  generateBasicMaterial(texture: string) {
    let geometry = new THREE.SphereGeometry(0.5, 32, 32);
    let material = new THREE.MeshPhongMaterial();
    let mesh = new THREE.Mesh(geometry, material);
    // material.map    = THREE.ImageUtils.loadTexture('images/earthmap1k.jpg')
    material.map = THREE.ImageUtils.loadTexture(texture);
  }
}
