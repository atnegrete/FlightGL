import { createController } from './gamepad/Controller';
import { ControllerInterface } from './gamepad/ControllerInterface';
import {
  Math as THREEMATH,
  ObjectLoader,
  Object3D,
  Vector3,
  Geometry,
  PointsMaterial,
  Points,
  AudioLoader,
  AudioListener,
  AudioBuffer,
} from 'three';
import { Environment } from './engine/Environment';
import { Physics } from './engine/Physics';
import { Collision } from './engine/Collision';
import { YAW_INTENSITY, PITCH_INTENSITY, ROLL_INTENSITY, YAW_ON_AXIS_INTENSITY, PITCH_ON_AXIS_INTENSITY, ROLL_ON_AXIS_INTENSITY, DISTANCE, DISTANCE_MULTIPLYIER, TIMESTAMP, MAX_FPS, LOOP_MULTIPLIER, MAX_STEPS } from './common/constants';
import { BACKGROUND_COLOR } from './common/colors';
import { SCENE, LIGHT, CAMERA, RENDERRER, HIT_BOX } from './common/webgl';

class App {
  // flightGL game loop vars start
  private lastFrameTimeMs: number = 0;
  private delta: number = 0;
  private fps: number = 60;
  private framesThisSecond: number = 0;
  private lastFpsUpdate: number = 0;
  // flightGL game loop vars end

  // flightGL gamepad - start
  private controller: ControllerInterface;
  // flightGL gamepad - end

  // flightGL objects - start
  private tieFighter: Object3D;
  // flightGL objects - end

  // engines start
  private environment: Environment;
  private physics: Physics;
  private collision: Collision;
  // engines end

  // sounds start
  private listener = new AudioListener();
  // sounds end

  constructor() {
    this.controller = createController();
    if (!this.controller) {
      alert('Compatible Controller not found!');
      return;
    }

    this.generateStars();

    CAMERA.position.set(0, 0, -250);
    SCENE.add(CAMERA);

    RENDERRER.setSize(innerWidth, innerHeight);
    RENDERRER.setClearColor(BACKGROUND_COLOR);
    LIGHT.position.set(0, 1, 1).normalize();
    SCENE.add(LIGHT);

    this.environment = new Environment(SCENE, CAMERA, 1000, 6, 16000);
    this.physics = new Physics();
    this.collision = new Collision(this.listener);

    const loader = new ObjectLoader();

    loader.load(
      'src/models/starwars-tie-fighter.json',

      obj => {
        // tie fighter loading
        this.tieFighter = obj;
        this.tieFighter.scale.set(10, 10, 10);
        this.tieFighter.position.set(0, 0, DISTANCE);
        HIT_BOX.position.set(0, 0, DISTANCE);

        // add to camera
        CAMERA.add(HIT_BOX);
        CAMERA.add(this.listener);
        CAMERA.add(this.tieFighter);

        // explosion audio loader
        const audioLoader = new AudioLoader();

        audioLoader.load(
          'src/sounds/explosion.ogg',
          (buffer: AudioBuffer) => {
            // create a global audio source
            this.collision.setHitBuffer(buffer);
            this.loop();
          },
          (xhr: any) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
          },
          (err: any) => {
            throw new Error('Error loading exploasion');
          }
        );
      },

      xhr => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },

      err => {
        throw new Error('Error loading Tiefighter');
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

    SCENE.add(starField);
  }

  private adjustCanvasSize() {
    RENDERRER.setSize(innerWidth, innerHeight);
    CAMERA.aspect = innerWidth / innerHeight;
    CAMERA.updateProjectionMatrix();
  }

  private adjustCameraLocation() {
    const distance = this.controller.getZoomFactor() * DISTANCE_MULTIPLYIER;
    this.tieFighter.position.z = DISTANCE + distance;
    HIT_BOX.position.z = DISTANCE + distance;
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
    }

    this.physics.thrust = thrust;
    this.physics.roll = roll;
    this.physics.pitch = pitch;
    this.physics.yaw = yaw;
    this.physics.update(delta);

    this.collision.setEnviromentMeshList(
      this.environment.getEnviromentMeshList()
    );
    this.collision.setMesh(HIT_BOX);
    this.collision.update(delta);
  }

  private draw(inertia: number): void {
    RENDERRER.render(SCENE, CAMERA);

    this.adjustCanvasSize();
    this.adjustCameraLocation();

    if (!this.controller.isVariableThruster()) {
      if (this.controller.isForwardPressed()) {
        CAMERA.translateZ(10);
      } else if (this.controller.isBackwardPressed()) {
        CAMERA
          .translateZ(-10);
      }
    } else {
      CAMERA.translateZ(this.physics.getVelocity());
    }

    CAMERA.rotateY(-this.physics.getYawRad() * YAW_INTENSITY);
    CAMERA.rotateX(this.physics.getPitchRad() * PITCH_INTENSITY);
    CAMERA.rotateZ(-this.physics.getRollRad() * ROLL_INTENSITY);

    this.tieFighter.setRotationFromAxisAngle(new Vector3(0, 1, 0), 0);
    this.tieFighter.rotateOnAxis(
      new Vector3(0, 1, 0),
      this.physics.getYawOnAxis() * YAW_ON_AXIS_INTENSITY
    );
    this.tieFighter.rotateOnAxis(
      new Vector3(1, 0, 0),
      this.physics.getPitchOnAxis() * PITCH_ON_AXIS_INTENSITY
    );
    this.tieFighter.rotateOnAxis(
      new Vector3(0, 0, 1),
      this.physics.getRollOnAxis() * ROLL_ON_AXIS_INTENSITY
    );
  }

  private loop(): void {
    const timestamp = window.performance.now(); // get current timestamp

    if (timestamp < this.lastFrameTimeMs + LOOP_MULTIPLIER / MAX_FPS) {
      requestAnimationFrame(() => {
        this.loop();
      });
      return;
    }
    this.delta += timestamp - this.lastFrameTimeMs;
    this.lastFrameTimeMs = timestamp;

    if (timestamp > this.lastFpsUpdate + LOOP_MULTIPLIER) {
      this.fps = 0.25 * this.framesThisSecond + 0.75 * this.fps;

      this.lastFpsUpdate = timestamp;
      this.framesThisSecond = 0;
    }

    this.framesThisSecond++;

    var numUpdateSteps = 0;
    while (this.delta >= TIMESTAMP) {
      this.update(TIMESTAMP / LOOP_MULTIPLIER);
      this.delta -= TIMESTAMP;
      if (++numUpdateSteps >= MAX_STEPS) {
        this.delta = 0;
        break;
      }
    }

    this.draw(this.delta / TIMESTAMP);

    requestAnimationFrame(() => {
      this.loop();
    });
  }
}

const app = new App();