import * as THREE from 'three';
import { Asteroid } from '../models/Asteroid';
import { Planet } from '../models/Planet';
import { Texture, Mesh } from 'three';
import { Engine } from './Engine';

export class Environment implements Engine {
  public asteroids: Asteroid[];
  public planets: Planet[];
  private radius: number;
  private asteroidsCount: number;
  private planetsCount: number;
  private scene: THREE.Scene;
  private textures: Texture[];
  private pCamera: THREE.PerspectiveCamera;
  private readonly divisor = 20;
  private readonly planetsRadiusMultiplier = 3.5;

  constructor(
    scene: THREE.Scene,
    player: THREE.PerspectiveCamera,
    asteroids: number,
    planets: number,
    radius: number
  ) {
    this.scene = scene;
    this.pCamera = player;
    this.radius = radius;
    this.asteroidsCount = asteroids;
    this.planetsCount = planets;

    this.textures = [];
    this.loadTextures();
  }

  loadTextures(): void {
    let loader = new THREE.TextureLoader();
    let promises: any[] = [];
    let texturePaths: any[] = [
      'src/textures/earth.png',
      'src/textures/jupiter.JPG',
      'src/textures/mars.jpg',
      'src/textures/venus.jpg',
      'src/textures/mercury.jpg',
      'src/textures/asteroid1.jpg',
      'src/textures/asteroid2.png',
      'src/textures/asteroid3.jpg',
      'src/textures/asteroid4.jpg',
    ];
    texturePaths.forEach(texturePath => {
      promises.push(
        new Promise((resolve, reject) => {
          loader.load(
            texturePath,
            texture => {
              resolve(texture);
            },
            xhr => {
              console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
            },
            err => {
              console.log(`Error loading ${texturePath}`);
            }
          );
        })
      );
    });

    let self = this;
    Promise.all(promises).then(function(textures) {
      // sanity check as an array:
      for (var i = 0; i < textures.length; i++) {
        self.textures.push(textures[i]);
      }
      console.log({ textures });
      self.initAsteroids();
      self.initPlanets();
    });
  }

  initAsteroids(): void {
    this.asteroids = [];
    for (let i = 0; i < this.asteroidsCount; i++) {
      const textureIndex = Environment.randomIntFromInterval(5, 8);
      console.log({ textureIndex });
      let asteroid = new Asteroid(this.textures[textureIndex]);
      console.log(this.textures[textureIndex]);
      asteroid.geometry.scale(1, 1, 1);
      asteroid.position.set(
        this.getRandomNumber(this.radius),
        this.getRandomNumber(this.radius),
        this.getRandomNumber(this.radius)
      );
      this.asteroids[i] = asteroid;
      this.scene.add(asteroid);
    }

    console.log(
      `ASTEROID COUNT: ${this.asteroids.length}   ${this.asteroidsCount}`
    );
  }

  initPlanets(): any {
    this.planets = [];
    for (let i = 0; i < this.planetsCount; ++i) {
      let planet = new Planet(
        this.textures[Environment.randomIntFromInterval(0, 4)]
      );
      planet.geometry.scale(1, 1, 1);
      planet.position.set(
        this.getRandomNumber(this.radius * this.planetsRadiusMultiplier),
        this.getRandomNumber(this.radius * this.planetsRadiusMultiplier),
        this.getRandomNumber(this.radius * this.planetsRadiusMultiplier)
      );
      this.planets.push(planet);
      this.scene.add(this.planets[i]);
    }
  }

  update(delta: number): void {
    this.updateObjects(5);
  }

  updateObjects(count: number) {
    for (let i = 0; i < count; i++) {
      let obj = this.asteroids.pop();
      if (obj && obj.position) {
        let distance = obj.position.distanceTo(this.pCamera.position);
        const updatedObj = this.updateObject(obj);

        if (updatedObj) {
          this.asteroids.push(updatedObj);
          const updatedDistance = updatedObj.position.distanceTo(
            this.pCamera.position
          );
          console.log({ updatedObj, distance, updatedDistance });
        } else {
          this.asteroids.push(obj);
        }
      }
    }
    this.asteroidSort();
  }

  updateObject(obj: any): any {
    let distance = obj.position.distanceTo(this.pCamera.position);
    if (distance > this.radius) {
      let frustum = new THREE.Frustum();
      let cameraViewProjectionMatrix = new THREE.Matrix4();
      this.pCamera.matrixWorldInverse.getInverse(this.pCamera.matrixWorld);
      cameraViewProjectionMatrix.multiplyMatrices(
        this.pCamera.projectionMatrix,
        this.pCamera.matrixWorldInverse
      );
      frustum.setFromMatrix(cameraViewProjectionMatrix);

      if (!frustum.intersectsObject(obj)) {
        const updatedPos = this.geratePosition();
        obj.position.set(updatedPos.x, updatedPos.y, updatedPos.z);
        return obj;
      }
      return null;
    } else {
      return null;
    }
  }

  private geratePosition() {
    let updatedZ = this.radius * 0.8;
    let updatedPos = new THREE.Vector3(
      this.getRandomNumber(this.radius * 0.75),
      this.getRandomNumber(this.radius * 0.75),
      this.pCamera.position.z >= 0 ? updatedZ : -updatedZ
    );
    this.pCamera.matrixWorldInverse.getInverse(this.pCamera.matrixWorld);
    updatedPos.applyMatrix4(this.pCamera.matrixWorld);
    return updatedPos;
  }

  private getRandomNumber(max: number) {
    let num = Environment.randomIntFromInterval(0, max);
    return Math.random() > 0.5 ? num : -num;
  }

  private asteroidSort() {
    this.asteroids.sort((a: any, b: any) => {
      const distanceA = this.pCamera.position.distanceTo(a.position);
      const distanceB = this.pCamera.position.distanceTo(b.position);
      return distanceA - distanceB;
    });
  }

  public getEnviromentMeshList(): Mesh[] {
    return [...this.asteroids, ...this.planets];
  }

  static randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
