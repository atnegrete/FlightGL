import {
  Math as THREEMATH,
  Vector3,
  Scene,
  PerspectiveCamera,
  Texture,
  Mesh,
  TextureLoader,
  PointsMaterial,
  Frustum,
  Matrix4,
  Geometry,
  Points,
} from 'three';
import { Asteroid } from '../models/Asteroid';
import { Planet } from '../models/Planet';
import { Engine } from './Engine';

export class Environment implements Engine {
  public asteroids: Asteroid[];
  public starClusters: Points[];
  public planets: Planet[];
  private radius: number;
  private asteroidsCount: number;
  private planetsCount: number;
  private scene: Scene;
  private textures: Texture[];
  private pCamera: PerspectiveCamera;
  private readonly planetsRadiusMultiplier = 3.5;

  constructor(
    scene: Scene,
    player: PerspectiveCamera,
    asteroids: number,
    planets: number,
    radius: number
  ) {
    this.scene = scene;
    this.pCamera = player;
    this.radius = radius;
    this.asteroidsCount = asteroids;
    this.planetsCount = planets;

    this.starClusters = [];
    this.textures = [];
    this.generateStars();
    this.loadTextures();
  }

  loadTextures(): void {
    let loader = new TextureLoader();
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
      for (var i = 0; i < textures.length; i++) {
        self.textures.push(textures[i]);
      }
      self.initAsteroids();
      self.initPlanets();
    });
  }

  private initAsteroids(): void {
    this.asteroids = [];
    for (let i = 0; i < this.asteroidsCount; i++) {
      const textureIndex = Environment.randomIntFromInterval(5, 8);
      let asteroid = new Asteroid(this.textures[textureIndex]);
      asteroid.geometry.scale(1, 1, 1);
      asteroid.position.set(
        this.getRandomPosNegNumber(this.radius),
        this.getRandomPosNegNumber(this.radius),
        this.getRandomPosNegNumber(this.radius)
      );
      this.asteroids[i] = asteroid;
      this.scene.add(asteroid);
    }

    console.log(
      `ASTEROID COUNT: ${this.asteroids.length}   ${this.asteroidsCount}`
    );
  }

  private initPlanets(): any {
    this.planets = [];
    for (let i = 0; i < this.planetsCount; ++i) {
      let planet = new Planet(
        this.textures[Environment.randomIntFromInterval(0, 4)]
      );
      planet.geometry.scale(1, 1, 1);
      planet.position.set(
        this.getRandomPosNegNumber(this.radius * this.planetsRadiusMultiplier),
        this.getRandomPosNegNumber(this.radius * this.planetsRadiusMultiplier),
        this.getRandomPosNegNumber(this.radius * this.planetsRadiusMultiplier)
      );
      this.planets.push(planet);
      this.scene.add(this.planets[i]);
    }
  }

  private generateStars() {
    var starsGeometry = new Geometry();
    for (let c = 0; c < 20; c++) {
      for (var i = 0; i < 500; i++) {
        var star = new Vector3();
        star.x = THREEMATH.randFloatSpread(40000);
        star.y = THREEMATH.randFloatSpread(40000);
        star.z = THREEMATH.randFloatSpread(40000);
        starsGeometry.vertices.push(star);
      }
      var starsMaterial = new PointsMaterial({ color: 0x888888 });
      var starField = new Points(starsGeometry, starsMaterial);
      starField.position.x = this.getRandomPosNegNumber(this.radius);
      starField.position.y = this.getRandomPosNegNumber(this.radius);
      starField.position.z = this.getRandomPosNegNumber(this.radius);
      this.starClusters[c] = starField;
      this.scene.add(this.starClusters[c]);
    }
  }

  public update(delta: number): void {
    this.checkAndUpdateAsteroids(5);
    this.checkAndUpdateStarClusters(5);
  }

  private checkAndUpdateAsteroids(count: number) {
    for (let i = 0; i < count; i++) {
      let obj = this.asteroids.pop();
      if (obj && obj.position) {
        let distance = obj.position.distanceTo(this.pCamera.position);
        const updatedObj = this.updateInstanceIfFar(obj);

        if (updatedObj) {
          this.asteroids.push(updatedObj);
          const updatedDistance = updatedObj.position.distanceTo(
            this.pCamera.position
          );
          // console.log({ updatedObj, distance, updatedDistance });
        } else {
          this.asteroids.push(obj);
        }
      }
    }
    this.asteroidSort();
  }

  private checkAndUpdateStarClusters(count: number) {
    for (let i = 0; i < count; i++) {
      let obj = this.starClusters.pop();
      if (obj && obj.position) {
        const updatedObj = this.updateInstanceIfFar(obj);
        if (updatedObj) {
          this.starClusters.push(updatedObj);
        } else {
          this.starClusters.push(obj);
        }
      }
    }
    this.starClusterSort();
  }

  private updateInstanceIfFar(obj: any): any {
    let distance = obj.position.distanceTo(this.pCamera.position);
    if (distance > this.radius) {
      let frustum = new Frustum();
      let cameraViewProjectionMatrix = new Matrix4();
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
    let updatedPos = new Vector3(
      this.getRandomPosNegNumber(this.radius * 0.75),
      this.getRandomPosNegNumber(this.radius * 0.75),
      this.pCamera.position.z >= 0 ? updatedZ : -updatedZ
    );
    this.pCamera.matrixWorldInverse.getInverse(this.pCamera.matrixWorld);
    updatedPos.applyMatrix4(this.pCamera.matrixWorld);
    return updatedPos;
  }

  private getRandomPosNegNumber(max: number) {
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

  private starClusterSort() {
    this.starClusters.sort((a: any, b: any) => {
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
