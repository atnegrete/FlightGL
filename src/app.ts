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
  Mesh,
  CubeGeometry,
  MeshBasicMaterial,
  AudioLoader,
  AudioListener,
  Audio,
  AudioBuffer,
} from 'three';
import { Environment } from './engine/Environment';
import { Physics } from './engine/Physics';
import { Collision } from './engine/Collision';
import { MPlayer } from './multiplayer/MPlayer';

// flightGl constants - start
const DISTANCE = -250;
const DISTANCE_MULTIPLYIER = 100;
// flightGl constants - end

class App {
  // start multiplayer
  private localMPlayer: MPlayer;
  private otherMPlayer: MPlayer;
  // end multiplayer

  // flightGL game loop vars start
  private lastFrameTimeMs: number = 0;
  private maxFPS: number = 60;
  private delta: number = 0;
  private timestep: number = 1000 / 60;
  private fps: number = 60;
  private framesThisSecond: number = 0;
  private lastFpsUpdate: number = 0;
  // flightGL game loop vars end

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
  private tieFighterP1: Object3D;
  private tieFighterP2: Object3D;
  private readonly modelMaxRotation = 15.0 / 360.0;

  // flightGL objects - end

  // engines start
  private environment: Environment;
  private physics: Physics;
  private collision: Collision;
  // engines end

  // sounds start
  private listener = new AudioListener();
  // sounds end

  private hitBox = new Mesh(
    new CubeGeometry(100, 100, 100, 1, 1, 1),
    new MeshBasicMaterial({ color: 0xff0000, wireframe: true })
  );

  constructor() {
    this.controller = createController();
    if (!this.controller) {
      alert('Compatible Controller not found!');
      return;
    }

    this.camera.position.set(0, 0, 0);
    this.scene.add(this.camera);

    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setClearColor(this.BACKGROUND_COLOR);
    this.light.position.set(0, 1, 1).normalize();
    this.scene.add(this.light);

    this.environment = new Environment(this.scene, this.camera, 1000, 6, 16000);
    this.physics = new Physics();
    this.collision = new Collision(this.listener);

    const loader = new ObjectLoader();

    loader.load(
      'src/models/starwars-tie-fighter.json',

      obj => {
        // tie fighter loading
        this.tieFighterP1 = obj;
        this.tieFighterP1.scale.set(10, 10, 10);
        this.tieFighterP1.position.set(0, 0, DISTANCE);
        this.hitBox.position.set(0, 0, DISTANCE);

        // add to camera
        this.camera.add(this.hitBox);
        this.camera.add(this.listener);
        this.camera.add(this.tieFighterP1);

        this.tieFighterP2 = obj.clone();
        this.tieFighterP2.scale.set(10, 10, 10);
        this.tieFighterP2.position.set(0, 0, DISTANCE - 100);
        this.scene.add(this.tieFighterP2);

        // explosion audio loader
        const audioLoader = new AudioLoader();
        audioLoader.load(
          'src/sounds/explosion.ogg',
          (buffer: AudioBuffer) => {
            // create a global audio source
            this.collision.setHitBuffer(buffer);
            let self = this;
            this.localMPlayer = new MPlayer(
              () => {
                self.loop();
              },
              this.tieFighterP1,
              this.tieFighterP2
            );
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

  private adjustCanvasSize() {
    this.renderer.setSize(innerWidth, innerHeight);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
  }

  private adjustCameraLocation() {
    const distance = this.controller.getZoomFactor() * DISTANCE_MULTIPLYIER;
    this.tieFighterP1.position.z = DISTANCE + distance;
    this.hitBox.position.z = DISTANCE + distance;
  }

  private update(delta: number): void {
    this.controller.update();
    this.environment.update(delta);
    this.localMPlayer.update(delta);

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
    this.collision.setMesh(this.hitBox);
    this.collision.update(delta);
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
      this.camera.translateZ(this.physics.getVelocity());
    }

    this.camera.rotateY(-this.physics.getYawRad());
    this.camera.rotateX(this.physics.getPitchRad());
    this.camera.rotateZ(-this.physics.getRollRad());

    this.tieFighterP1.setRotationFromAxisAngle(new Vector3(0, 1, 0), 0);
    this.tieFighterP1.rotateOnAxis(
      new Vector3(0, 1, 0),
      this.physics.getYawOnAxis() * 15
    );
    this.tieFighterP1.rotateOnAxis(
      new Vector3(1, 0, 0),
      this.physics.getPitchOnAxis() * 30
    );
    this.tieFighterP1.rotateOnAxis(
      new Vector3(0, 0, 1),
      this.physics.getRollOnAxis() * 30
    );
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
