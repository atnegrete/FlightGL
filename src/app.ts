import { Box } from './models/Box';
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

class App {
  // flightGL related weights - start
  private readonly SPEED_FACTOR = 0.03;
  private readonly THRUSTER_FACTOR = 10;
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
    10000
  );
  // flightGL webGL - end

  // flightGL gamepad - start
  private controller: ControllerInterface;
  // flightGL gamepad - end

  // flightGL objects - start
  private box: Box;
  private warthog: Object3D;
  private boxes: any[] = [];
  private view: VIEW = VIEW.NORMAL_VIEW;
  // flightGL objects - end

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

    const loader = new ObjectLoader();

    loader.load(
      'src/models/Warthog.json',

      obj => {
        console.log({ obj });
        this.warthog = obj;
        this.warthog.rotateY(90 * DEGREE_TO_RADIANS);
        this.warthog.rotateZ(15 * DEGREE_TO_RADIANS);
        this.warthog.scale.set(10, 10, 10);
        this.warthog.position.set(0, 0, -250);
        this.camera.add(this.warthog);
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

    for (var i = 0; i < 10000; i++) {
      var star = new Vector3();
      star.x = THREEMATH.randFloatSpread(2000);
      star.y = THREEMATH.randFloatSpread(2000);
      star.z = THREEMATH.randFloatSpread(2000);

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
    if (this.controller.isTopViewPressed()) {
      // if (this.view != VIEW.NORMAL_VIEW) return;
      // this.view = VIEW.TOP_VIEW;
      // this.controls.rotateUp(1);
      // console.log('TOP');
    } else if (this.controller.isBottomViewPressed()) {
      // if (this.view != VIEW.NORMAL_VIEW) return;
      // this.view = VIEW.BOTTOM_VIEW;
      // this.controls.rotateUp(-1);
      // console.log('BOTTOM');
    } else if (this.controller.isLeftViewPressed()) {
      if (this.view != VIEW.NORMAL_VIEW) return;
      this.view = VIEW.LEFT_VIEW;
      this.camera.lookAt(
        this.box.position.x - 50,
        this.box.position.y,
        this.box.position.z
      );
      this.box.position.x = 50;
    } else if (this.controller.isRightViewPressed()) {
      if (this.view != VIEW.NORMAL_VIEW) return;
      this.view = VIEW.RIGHT_VIEW;
      this.camera.lookAt(
        this.box.position.x + 50,
        this.box.position.y,
        this.box.position.z
      );
      this.box.position.x = -50;
    } else if (this.view != VIEW.NORMAL_VIEW) {
      console.log('NORMAL');
      this.view = VIEW.NORMAL_VIEW;
      this.warthog.position.x = 0;
      this.camera.lookAt(this.warthog.position);
    }
  }

  private render() {
    this.controller.update();

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
      var test = this.controller.getThruster();
      this.camera.translateZ(
        this.controller.getThruster() * this.THRUSTER_FACTOR
      );

      if (test < 0) {
        console.log(this.camera);
      }
    }
    this.camera.rotateY(-this.controller.getYaw() * this.SPEED_FACTOR);
    this.camera.rotateX(this.controller.getPitch() * this.SPEED_FACTOR);
    this.camera.rotateZ(-this.controller.getRoll() * this.SPEED_FACTOR);

    requestAnimationFrame(() => {
      this.render();
    });
  }
}

const app = new App();
