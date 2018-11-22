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
import { Environment } from './models/Environment';

enum VIEW {
  TOP_VIEW,
  BOTTOM_VIEW,
  RIGHT_VIEW,
  LEFT_VIEW,
  NORMAL_VIEW,
}
// flightGL conversion factors - start
const DEGREE_TO_RADIANS = 0.0174533;
// flightGL conversion factors - start

// flightGl constants - start
const DRAG = 0.8;
const DISTANCE = -250;
const DISTANCE_MULTIPLYIER = 100;
// flightGl constants - end

class App {
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
  private environment: Environment;
  private view: VIEW = VIEW.NORMAL_VIEW;
  // flightGL objects - end

  private velocity = -1;

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

    const loader = new ObjectLoader();

    loader.load(
      'src/models/starwars-tie-fighter.json',

      obj => {
        console.log({ obj });
        this.tieFighter = obj;
        this.tieFighter.scale.set(10, 10, 10);
        this.tieFighter.position.set(0, 0, DISTANCE);
        this.camera.add(this.tieFighter);
        this.render();
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

    for (var i = 0; i < 5000000; i++) {
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

  private render() {
    this.controller.update();
    this.environment.update();

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
      const lightSpeed = this.controller.isForwardPressed() ? -500 : 0;
      const thrust = this.controller.getThruster();
      if (thrust == 0) this.velocity += DRAG;
      else this.velocity += thrust;
      this.velocity = Math.min(this.velocity, -1);
      this.velocity = Math.max(this.velocity, -100);
      this.camera.translateZ(this.velocity + lightSpeed);
    }
    this.camera.rotateY(-this.controller.getYaw() * this.YAW_FACTOR);
    this.camera.rotateX(this.controller.getPitch() * this.PITCH_FACTOR);
    this.camera.rotateZ(-this.controller.getRoll() * this.ROLL_FACTOR);

    const yaw = Math.min(
      this.controller.getYaw() * this.YAW_FACTOR,
      this.modelMaxRotation
    );
    const pitch = Math.min(
      this.controller.getPitch() * this.PITCH_FACTOR,
      this.modelMaxRotation
    );
    const roll = Math.min(
      this.controller.getRoll() * this.ROLL_FACTOR,
      this.modelMaxRotation
    );

    this.tieFighter.setRotationFromAxisAngle(new Vector3(0, 1, 0), 0);
    // this.warthog.rotateOnAxis(new Vector3(0, 0, 1), 0.35);

    this.tieFighter.rotateOnAxis(new Vector3(0, 1, 0), -(yaw * 30));
    this.tieFighter.rotateOnAxis(new Vector3(1, 0, 0), pitch * 30);
    this.tieFighter.rotateOnAxis(new Vector3(0, 0, 1), -roll * 30);

    // this.warthog.rotateX(pitch);
    // this.warthog.rotateZ(-roll);

    // this.warthog.rotateOnAxis(new Vector3(0, 0, 1), 0.35);

    requestAnimationFrame(() => {
      this.render();
    });
  }
}

const app = new App();
