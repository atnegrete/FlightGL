import * as THREE from 'three';
import { MeshBasicMaterial } from 'three';

export class Star extends THREE.Mesh {
  private cubeFaces: MeshBasicMaterial[];

  constructor() {
    super();
    this.generateBasicMaterial();
    this.geometry = new THREE.BoxGeometry(25, 25, 25);
    this.material = new THREE.MeshFaceMaterial(this.cubeFaces);
    // this.material = new THREE.MeshPhongMaterial({ color: 0x00ff00, specular: 0x222222, shininess: 50, vertexColors: THREE.FaceColors });
  }

  generateBasicMaterial() {
    this.cubeFaces = [
      new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      }),
      new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      }),
      new THREE.MeshBasicMaterial({
        color: 0x0000ff,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      }),
      new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      }),
      new THREE.MeshBasicMaterial({
        color: 0xff00ff,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      }),
      new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      }),
    ];
  }
}
