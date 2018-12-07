import * as THREE from 'three';
import { Asteroid } from '../models/Asteroid';
import { Planet } from '../models/Planet';
import { Texture, Mesh } from 'three';
import { Engine } from './Engine';

export class Environment implements Engine{
  public asteroids: Asteroid[][];
  public planets: Planet[];
  private radius: number;
  private asteroidsCount: number;
  private planetsCount: number;
  private scene: THREE.Scene;
  private planetTextures: Texture[];
  private asteroidTextures: Texture[];
  private player: THREE.PerspectiveCamera;
  private tick: number;
  private readonly divisor = 20;
  private readonly planetsRadiusMultiplier = 3.5;
  private enviromentMeshList: Mesh[] = [];

  constructor(
    scene: THREE.Scene,
    player: THREE.PerspectiveCamera,
    asteroids: number,
    planets: number,
    radius: number
  ) {
    this.scene = scene;
    this.player = player;
    this.radius = radius;
    this.asteroidsCount = asteroids;
    this.planetsCount = planets;
    this.tick = 0;

    this.planetTextures = [];
    this.asteroidTextures = [];
    this.loadTextures();
    this.initPlanets();
    this.initAsteroids();
  }

  loadTextures() {
    var loader = new THREE.TextureLoader();
    this.planetTextures.push(loader.load('src/textures/earth.png'));
    this.planetTextures.push(loader.load('src/textures/jupiter.JPG'));
    this.planetTextures.push(loader.load('src/textures/mars.jpg'));
    this.planetTextures.push(loader.load('src/textures/venus.jpg'));
    this.planetTextures.push(loader.load('src/textures/mercury.jpg'));
    this.asteroidTextures.push(loader.load('src/textures/asteroid1.jpg'));
    this.asteroidTextures.push(loader.load('src/textures/asteroid2.png'));
    this.asteroidTextures.push(loader.load('src/textures/asteroid3.jpg'));
    this.asteroidTextures.push(loader.load('src/textures/asteroid4.jpg'));
  }

  initAsteroids(): any {
    this.asteroids = [];
    for (let i = 0; i < this.divisor; ++i) {
      this.asteroids[i] = [];
      for (let j = 0; j < this.asteroidsCount / this.divisor; ++j) {
        let asteroid = new Asteroid(
          this.asteroidTextures[Environment.randomIntFromInterval(0, 3)]
        );
        asteroid.geometry.scale(1, 1, 1);
        asteroid.position.set(
          this.getRandomNumber(this.radius),
          this.getRandomNumber(this.radius),
          this.getRandomNumber(this.radius)
        );
        this.asteroids[i][j] = asteroid;
        this.scene.add(this.asteroids[i][j]);
      }
    }
  }

  initPlanets(): any {
    this.planets = [];
    for (let i = 0; i < this.planetsCount; ++i) {
      let planet = new Planet(
        this.planetTextures[Environment.randomIntFromInterval(0, 4)]
      );
      planet.geometry.scale(1, 1, 1);
      planet.position.set(
        this.getRandomNumber(this.radius * this.planetsRadiusMultiplier),
        this.getRandomNumber(this.radius * this.planetsRadiusMultiplier),
        this.getRandomNumber(this.radius * this.planetsRadiusMultiplier)
      );
      this.planets.push(planet);
      this.enviromentMeshList.push(planet);
      this.scene.add(this.planets[i]);
    }
  }

  update(delta: number): void {
    // this.updateObjects(this.asteroids[this.tick % 10], this.radius);
    // this.updateObject(
    //   this.planets[this.tick % this.planetsCount],
    //   this.radius * this.planetsRadiusMultiplier
    // );
    // this.tick++;
  }

  updateObjects(objects: any[], spawnDistance: number) {
    objects.forEach(obj => {
      this.updateObject(obj, spawnDistance);
    });
  }

  updateObject(obj: any, spawnDistance: number) {
    if (obj && obj.position) {
      let distance = obj.position.distanceTo(this.player.position);
      if (distance > spawnDistance * 0.55) {
        let frustum = new THREE.Frustum();
        let cameraViewProjectionMatrix = new THREE.Matrix4();
        this.player.matrixWorldInverse.getInverse(this.player.matrixWorld);
        cameraViewProjectionMatrix.multiplyMatrices(
          this.player.projectionMatrix,
          this.player.matrixWorldInverse
        );
        frustum.setFromMatrix(cameraViewProjectionMatrix);

        if (!frustum.intersectsObject(obj)) {
          const updatedPos = this.geratePosition(spawnDistance);
          obj.position.set(updatedPos.x, updatedPos.y, updatedPos.z);
        }
      }
    }
  }

  public getEnviromentMeshList(): Mesh[] {
    return this.enviromentMeshList;
  }

  private geratePosition(distance: number) {
    const x = this.player.position.x + this.getRandomNumber(distance);
    const y = this.player.position.y + this.getRandomNumber(distance);
    const z = this.player.position.z + this.getRandomNumber(distance);
    return new THREE.Vector3(x, y, z);
  }

  private getRandomNumber(max: number) {
    let num = Math.random() * max;
    return Math.random() > 0.5 ? num : -num;
  }

  static randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
