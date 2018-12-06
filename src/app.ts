import { createController } from './gamepad/Controller';
import { ControllerInterface } from './gamepad/ControllerInterface';
import {
  Math as THREEMATH,
  ObjectLoader,
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  DirectionalLight,
  Color,
  Object3D,
  Vector3,
  Geometry,
  PointsMaterial,
  Points,
} from 'three';
import { Environment } from './engine/Environment';
import { Physics } from './engine/Physics';

// flightGl constants - start
const DISTANCE = -250;
const DISTANCE_MULTIPLYIER = 100;
// flightGl constants - end

class App {
  // flightGL game loop vars start
  private lastFrameTimeMs: number = 0;
  private maxFPS: number = 60;
  private delta: number = 0;
  private timestep: number = 1000 / 60;
  private fps: number = 60;
  private framesThisSecond: number = 0;
  private lastFpsUpdate: number = 0;
  // flightGL game loop vars end

  // flightGL related weights - start
  private readonly YAW_FACTOR = 0.005;
  private readonly PITCH_FACTOR = 0.01;
  private readonly ROLL_FACTOR = 0.02;
  private readonly THRUSTER_FACTOR = 50;
  // flightGL related weights - end

  // flightGL colors - start
  private readonly BACKGROUND_COLOR: Color = new Color('rgb(0,0,0)');
  private readonly DIRECTIONAL_LIGHT_COLOR = 0xffffff;
  // flightGL colors - end

  // flightGL webGL - start
  private readonly scene = new Scene();
  private readonly light = new DirectionalLight(
    this.DIRECTIONAL_LIGHT_COLOR,
    1
  );
  private readonly renderer = new WebGLRenderer({
    antialias: true,
    canvas: <HTMLCanvasElement>document.getElementById('mainCanvas'),
  });
  private readonly camera = new PerspectiveCamera(
    60,
    innerWidth / innerHeight,
    0.1,
    100000
  );
  // flightGL webGL - end

  // flightGL gamepad - start
  private controller: ControllerInterface;
  // flightGL gamepad - end

  // flightGL objects - start
  private tieFighter: Object3D;
  private readonly modelMaxRotation = 15.0 / 360.0;

  // flightGL objects - end

  // engines start
  private environment: Environment;
  private physics: Physics;
  // engines end

  constructor() {
    this.controller = createController();
    if (!this.controller) {
      alert('Compatible Controller not found!');
      return;
    }

    this.generateStars();

    this.camera.position.set(0, 0, -250);
    this.scene.add(this.camera);

    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setClearColor(this.BACKGROUND_COLOR);
    this.light.position.set(0, 1, 1).normalize();
    this.scene.add(this.light);

    this.environment = new Environment(this.scene, this.camera, 1000, 6, 16000);
    this.physics = new Physics();

    const loader = new ObjectLoader();

    loader.load(
      'src/models/starwars-tie-fighter.json',

      obj => {
        this.tieFighter = obj;
        this.tieFighter.scale.set(10, 10, 10);
        this.tieFighter.position.set(0, 0, DISTANCE);
        this.camera.add(this.tieFighter);
        this.loop();
      },

      xhr => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },

      err => {
        throw new Error('Error loading Warthog');
      }
    );
  }

  private generateStars() {
    var starsGeometry = new Geometry();

    for (var i = 0; i < 500000; i++) {
      var star = new Vector3();
      star.x = THREEMATH.randFloatSpread(20000);
      star.y = THREEMATH.randFloatSpread(20000);
      star.z = THREEMATH.randFloatSpread(20000);

      starsGeometry.vertices.push(star);
    }

    var starsMaterial = new PointsMaterial({ color: 0x888888 });
    var starField = new Points(starsGeometry, starsMaterial);

    this.scene.add(starField);
  }

  private adjustCanvasSize() {
    this.renderer.setSize(innerWidth, innerHeight);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
  }

  private adjustCameraLocation() {
    const distance = this.controller.getZoomFactor() * DISTANCE_MULTIPLYIER;
    this.tieFighter.position.z = DISTANCE + distance;
  }

  private update(delta: number): void {
    this.controller.update();
    this.environment.update(delta);

    const yaw = this.controller.getYaw();
    const pitch = this.controller.getPitch();
    const roll = this.controller.getRoll();
    let thrust = 0;

    if (!this.controller.isVariableThruster()) {
      if (this.controller.isForwardPressed()) {
        thrust = 10;
      } else if (this.controller.isBackwardPressed()) {
        thrust = -10;
      }
    } else {
      thrust = this.controller.getThruster();
      console.log(thrust);
    }

    this.physics.thrust = thrust;
    this.physics.roll = roll;
    this.physics.pitch = pitch;
    this.physics.yaw = yaw;
    this.physics.update(delta);
  }

  private draw(inertia: number): void {
    this.renderer.render(this.scene, this.camera);

    this.adjustCanvasSize();
    this.adjustCameraLocation();

    if (!this.controller.isVariableThruster()) {
      if (this.controller.isForwardPressed()) {
        this.camera.translateZ(10);
      } else if (this.controller.isBackwardPressed()) {
        this.camera.translateZ(-10);
      }
    } else {
      this.camera.translateZ(this.physics.getVelocity())
    }

    this.camera.rotateY(-this.physics.getYawRad());
    this.camera.rotateX(this.physics.getPitchRad());
    this.camera.rotateZ(-this.physics.getRollRad());

    this.tieFighter.setRotationFromAxisAngle(new Vector3(0, 1, 0), 0);
    this.tieFighter.rotateOnAxis(new Vector3(0, 1, 0), this.physics.getYawOnAxis() * 15);
    this.tieFighter.rotateOnAxis(new Vector3(1, 0, 0), this.physics.getPitchOnAxis() * 30);
    this.tieFighter.rotateOnAxis(new Vector3(0, 0, 1), this.physics.getRollOnAxis() * 30);
  }

  private loop(): void {
    const timestamp = window.performance.now(); // get current timestamp

    if (timestamp < this.lastFrameTimeMs + 1000 / this.maxFPS) {
      requestAnimationFrame(() => {
        this.loop();
      });
      return;
    }
    this.delta += timestamp - this.lastFrameTimeMs;
    this.lastFrameTimeMs = timestamp;

    if (timestamp > this.lastFpsUpdate + 1000) {
      this.fps = 0.25 * this.framesThisSecond + 0.75 * this.fps;

      this.lastFpsUpdate = timestamp;
      this.framesThisSecond = 0;
    }

    this.framesThisSecond++;

    var numUpdateSteps = 0;
    while (this.delta >= this.timestep) {
      this.update(this.timestep / 1000);
      this.delta -= this.timestep;
      if (++numUpdateSteps >= 240) {
        this.delta = 0;
        break;
      }
    }

    this.draw(this.delta / this.timestep);

    requestAnimationFrame(() => {
      this.loop();
    });
  }
}

const app = new App();
