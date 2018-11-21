import { Star } from './Star';

export class Environment {
  public stars: Star[];
  public planets: Star[];
  private radius: number;
  private starsCount: number;
  private planetsCount: number;
  private scene: THREE.Scene;

  constructor(
    scene: THREE.Scene,
    stars: number,
    planets: number,
    radius: number
  ) {
    this.scene = scene;
    this.radius = radius;
    this.starsCount = stars;
    this.planetsCount = planets;
    this.initPlanets();
    this.initStars();
  }

  initStars(): any {
    this.stars = [];
    for (let i = 0; i < this.starsCount; ++i) {
      let star = new Star();
      star.geometry.scale(1, 1, 1);
      star.position.set(
        this.getRandomNumber(),
        this.getRandomNumber(),
        this.getRandomNumber()
      );
      this.stars.push(star);
      this.scene.add(this.stars[i]);
    }
  }

  initPlanets(): any {
    this.planets = [];
    for (let i = 0; i < this.planetsCount; ++i) {
      let planet = new Star();
      planet.geometry.scale(1, 1, 1);
      planet.position.set(
        this.getRandomNumber(),
        this.getRandomNumber(),
        this.getRandomNumber()
      );
      this.planets.push(planet);
      this.scene.add(this.planets[i]);
    }
  }

  update(player: THREE.PerspectiveCamera): void {
    this.updateObjects(player, this.stars);
    this.updateObjects(player, this.planets);
  }

  updateObjects(player: THREE.PerspectiveCamera, objects: any[]) {
    objects.forEach(obj => {
      let distance = obj.position.distance(player.position);
    });
  }

  private getRandomNumber() {
    let num = Math.random() * this.radius;
    return Math.random() > 0.5 ? num : -num;
  }
}
