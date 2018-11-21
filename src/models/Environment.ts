import * as THREE from 'three';
import { Star } from './Star';
import { Planet } from './Planet';
import { Texture } from 'three';
import { generateKeyPair } from 'crypto';

export class Environment {
  public stars: Star[];
  public planets: Planet[];
  private radius: number;
  private starsCount: number;
  private planetsCount: number;
  private scene: THREE.Scene;
  private planetTextures: Texture[];
  private player: THREE.PerspectiveCamera;
  private tick: number;

  constructor(
    scene: THREE.Scene,
    player: THREE.PerspectiveCamera,
    stars: number,
    planets: number,
    radius: number
  ) {
    this.scene = scene;
    this.player = player;
    this.radius = radius;
    this.starsCount = stars;
    this.planetsCount = planets;
    this.tick = 0;
    this.initStars();

    this.planetTextures = [];
    this.loadTextures();
    this.initPlanets();
  }

  loadTextures() {
    var loader = new THREE.TextureLoader();
    this.planetTextures.push(loader.load('src/textures/earth.png'));
    this.planetTextures.push(loader.load('src/textures/jupiter.JPG'));
    this.planetTextures.push(loader.load('src/textures/mars.jpg'));
    this.planetTextures.push(loader.load('src/textures/venus.jpg'));
    this.planetTextures.push(loader.load('src/textures/mercury.jpg'));
  }

  initStars(): any {
    this.stars = [];
    for (let i = 0; i < this.starsCount; ++i) {
      let star = new Star();
      star.geometry.scale(1, 1, 1);
      star.position.set(
        this.getRandomNumber(this.radius / 4),
        this.getRandomNumber(this.radius / 4),
        this.getRandomNumber(this.radius / 4)
      );
      this.stars.push(star);
      this.scene.add(this.stars[i]);
    }
  }

  initPlanets(): any {
    this.planets = [];
    for (let i = 0; i < this.planetsCount; ++i) {
      let planet = new Planet(
        this.planetTextures[Math.floor(Math.random() * 6)],
        this.scene
      );
      planet.geometry.scale(1, 1, 1);
      planet.position.set(
        this.getRandomNumber(this.radius),
        this.getRandomNumber(this.radius),
        this.getRandomNumber(this.radius)
      );
      this.planets.push(planet);
      this.scene.add(this.planets[i]);
    }
  }

  update(): void {
    // this.updateObjects(this.stars[this.tick % this.starsCount]);
    // this.updateObjects(this.planets[this.tick % this.planetsCount]);
    this.tick++;
  }

  updateObjects(obj: any) {
    // objects.forEach(obj => {
    if (obj && obj.position) {
      let distance = obj.position.distanceTo(this.player.position);
      if (distance > this.radius * 0.7) {
        let frustum = new THREE.Frustum();
        let cameraViewProjectionMatrix = new THREE.Matrix4();
        this.player.matrixWorldInverse.getInverse(this.player.matrixWorld);
        cameraViewProjectionMatrix.multiplyMatrices(
          this.player.projectionMatrix,
          this.player.matrixWorldInverse
        );
        frustum.setFromMatrix(cameraViewProjectionMatrix);

        if (!frustum.intersectsObject(obj)) {
          console.log({ distance });
          console.log(obj.position);
          const updatedPos = this.geratePosition();
          obj.position.set(updatedPos.x, updatedPos.y, updatedPos.z);
          console.log(obj.position);
        }
      }
    }
    // });
  }
  private geratePosition() {
    const x = this.player.position.x + this.getRandomNumber(this.radius);
    const y = this.player.position.y + this.getRandomNumber(this.radius);
    const z = this.player.position.z + this.getRandomNumber(this.radius);
    return new THREE.Vector3(x, y, z);
  }

  private getRandomNumber(max: number) {
    let num = Math.random() * max;
    return Math.random() > 0.5 ? num : -num;
  }
}
