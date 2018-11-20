import * as THREE from 'three';

import { Box } from './models/Box';
import { createController } from './gamepad/Controller';
import { OrbitControls } from './controller/OrbitControls';
import { ControllerInterface } from './gamepad/ControllerInterface';

enum VIEW {
  TOP_VIEW,
  BOTTOM_VIEW,
  RIGHT_VIEW,
  LEFT_VIEW,
  NORMAL_VIEW,
}

class App {
  private readonly SPEED_FACTOR = 0.03;

  private readonly renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: <HTMLCanvasElement>document.getElementById('mainCanvas'),
  });
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(
    60,
    innerWidth / innerHeight,
    0.1,
    10000
  );
  // private readonly controls = new OrbitControls(
  //   this.camera,
  //   this.renderer.domElement
  // );
  private readonly light = new THREE.DirectionalLight(0xffffff, 1);

  private box: Box;
  private boxes: any[];
  private view: VIEW;
  private controller: ControllerInterface;
  private currentPositionVector: THREE.Vector3 = <THREE.Vector3>{
    x: 200,
    y: 200,
    z: 200,
  };

  constructor() {
    this.controller = createController();

    if (!this.controller) {
      alert('Compatible Controller not found!');
      return;
    }

    this.boxes = [];
    this.generateBoxes();

    this.view = VIEW.NORMAL_VIEW;

    this.camera.position.set(200, 200, 200);
    this.scene.add(this.camera);

    this.box = new Box();
    this.box.position.set(0, 0, -250);
    this.camera.add(this.box);

    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setClearColor(new THREE.Color('rgb(0,0,0)'));
    this.light.position.set(0, 1, 1).normalize();
    this.scene.add(this.light);

    this.render();
  }

  private generateBoxes() {
    for (let i = 0; i < 10; ++i) {
      let box = new Box();
      box.geometry.scale(1, 1, 1);
      box.position.set(
        this.getRandomNumber(),
        this.getRandomNumber(),
        this.getRandomNumber()
      );
      this.boxes.push(box);
      this.scene.add(this.boxes[i]);
    }
  }

  private getRandomNumber() {
    let num = Math.random() * innerHeight * 0.75;
    return Math.random() > 5 ? num : -num;
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
      this.box.position.x = 0;
      this.camera.lookAt(this.box.position);
    }
  }

  private render() {
    this.controller.update();

    this.renderer.render(this.scene, this.camera);

    this.adjustCanvasSize();
    this.adjustCameraLocation();

    if (this.controller.isForwardPressed()) {
      this.camera.translateZ(10);
    } else if (this.controller.isBackwardPressed()) {
      this.camera.translateZ(-10);
    }

    this.camera.rotateY(this.controller.getYaw() * this.SPEED_FACTOR);
    this.camera.rotateX(this.controller.getPitch() * this.SPEED_FACTOR);
    this.camera.rotateZ(this.controller.getRoll() * this.SPEED_FACTOR);

    requestAnimationFrame(() => {
      this.render();
    });
  }
}

const app = new App();
