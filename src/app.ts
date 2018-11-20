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
  private readonly SPEED_FACTOR = 0.1;

  private readonly renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: <HTMLCanvasElement>document.getElementById('mainCanvas'),
  });
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(
    45,
    innerWidth / innerHeight,
    0.1,
    10000
  );
  private readonly controls = new OrbitControls(
    this.camera,
    this.renderer.domElement
  );
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

    this.box = new Box();
    this.view = VIEW.NORMAL_VIEW;
    this.scene.add(this.box);

    this.camera.position.set(200, 200, 200);
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setClearColor(new THREE.Color('rgb(0,0,0)'));
    this.light.position.set(0, 1, 1).normalize();
    this.scene.add(this.light);

    this.controls.dampingFactor = 1;
    this.controls.minDistance = 100;
    this.controls.maxDistance = 2000;
    this.controls.maxPolarAngle = Math.PI / 2;

    this.render();
  }

  private generateBoxes() {
    for (let i = 0; i < 10; ++i) {
      let box = new Box();
      box.geometry.scale(1, 1, 1);
      box.position.set(
        Math.random() * innerHeight,
        Math.random() * innerHeight,
        Math.random() * 200
      );
      this.boxes.push(box);
      this.scene.add(this.boxes[i]);
    }
  }

  private adjustCanvasSize() {
    this.renderer.setSize(innerWidth, innerHeight);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
  }

  private adjustCameraLocation() {
    if (this.controller.isTopViewPressed()) {
      if (this.view != VIEW.NORMAL_VIEW) return;
      this.view = VIEW.TOP_VIEW;
      this.controls.rotateUp(1);
      console.log('TOP');
    } else if (this.controller.isBottomViewPressed()) {
      if (this.view != VIEW.NORMAL_VIEW) return;
      this.view = VIEW.BOTTOM_VIEW;
      this.controls.rotateUp(-1);
      console.log('BOTTOM');
    } else if (this.controller.isLeftViewPressed()) {
      if (this.view != VIEW.NORMAL_VIEW) return;
      this.view = VIEW.LEFT_VIEW;
      this.controls.rotateLeft(1);
      console.log('LEFT');
    } else if (this.controller.isRightViewPressed()) {
      if (this.view != VIEW.NORMAL_VIEW) return;
      this.view = VIEW.RIGHT_VIEW;
      this.controls.rotateLeft(-1);
      console.log('RIGHT');
    } else if (this.view != VIEW.NORMAL_VIEW) {
      console.log('NORMAL');
      this.view = VIEW.NORMAL_VIEW;
      this.camera.position.set(
        this.currentPositionVector.x,
        this.currentPositionVector.y,
        this.currentPositionVector.z
      );
    }
  }

  private adjustCameraZoom() {
    if (this.controller.isZoomIn()) {
      console.log('ZOOM_IN');
      this.controls.dollyIn(this.controls.getZoomScale());
      this.currentPositionVector = this.camera.position;
      console.log(this.camera.position);
    } else if (this.controller.isZoomOut()) {
      console.log('ZOOM_OUT');
      this.controls.dollyOut(this.controls.getZoomScale());
      this.currentPositionVector = this.camera.position;
      console.log(this.camera.position);
    }
  }

  private render() {
    this.controller.update();

    this.box.position.set(
      this.camera.position.x - 100,
      this.camera.position.y - 100,
      this.camera.position.z - 100
    );

    this.renderer.render(this.scene, this.camera);

    this.adjustCanvasSize();
    this.adjustCameraLocation();
    this.adjustCameraZoom();

    if (this.controller.isForwardPressed()) {
      this.controls.pan(0, this.controls.getPanSpeed());
    } else if (this.controller.isBackwardPressed()) {
      this.controls.pan(0, -this.controls.getPanSpeed());
    }

    this.controls.update();
    
    this.box.rotateY(this.controller.getYaw() * this.SPEED_FACTOR);
    this.box.rotateX(this.controller.getPitch() * this.SPEED_FACTOR);
    this.box.rotateZ(this.controller.getRoll() * this.SPEED_FACTOR);

    requestAnimationFrame(() => {
      this.render();
    });
  }
}

const app = new App();
