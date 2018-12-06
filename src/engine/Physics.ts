import { Vector2, Vector3, Quaternion } from 'three';
import { Engine } from './Engine';

const DRAG = 0.8;
const DEGREE_TO_RADIANS = 0.0174533;

export class Physics implements Engine {
  private rotationVector: Vector3 = new Vector3(0, 0, 0);
  private onAxisRotation: Vector3 = new Vector3(0, 0, 0);

  private velocity = -1;
  private readonly modelMaxRotation = 15.0 / 360.0;

  private _thrust: number;
  public get thrust(): number {
    return this._thrust;
  }
  public set thrust(value: number) {
    this._thrust = value;
  }
  private _roll: number;
  public get roll(): number {
    return this._roll;
  }
  public set roll(value: number) {
    this._roll = value;
  }
  private _pitch: number;
  public get pitch(): number {
    return this._pitch;
  }
  public set pitch(value: number) {
    this._pitch = value;
  }
  private _yaw: number;
  public get yaw(): number {
    return this._yaw;
  }
  public set yaw(value: number) {
    this._yaw = value;
  }

  public update(
    dt: number,
  ): void {
    this.updateRotationMatrix();
    this.updateVelocity(dt);
  }

  private clamp(val: number, lower: number, upper: number) {
    return Math.max(Math.min(val, upper), lower);
  }

  private updateVelocity(delta: number): void {
    if (this.thrust == 0) this.velocity += DRAG;
    else this.velocity += this.thrust;

    this.velocity = Math.min(this.velocity, -1);
    this.velocity = Math.max(this.velocity, -100);
  }

  private updateRotationMatrix() {
    const rollQuaternion = new Quaternion();
    rollQuaternion.setFromAxisAngle(new Vector3(0, 0, 1), this.roll);

    const pitchQuaternion = new Quaternion();
    pitchQuaternion.setFromAxisAngle(new Vector3(1, 0, 0), this.pitch);

    const yawQuaternion = new Quaternion();
    yawQuaternion.setFromAxisAngle(new Vector3(0, 1, 0), this.yaw);

    const totalQuaternion = rollQuaternion
      .multiply(pitchQuaternion)
      .multiply(yawQuaternion);

    this.rotationVector.x = totalQuaternion.x;
    this.rotationVector.y = totalQuaternion.y;
    this.rotationVector.z = totalQuaternion.z;

    this.onAxisRotation.x = Math.min(
      this.pitch * DEGREE_TO_RADIANS,
      this.modelMaxRotation
    );
    this.onAxisRotation.y = Math.min(
      this.yaw * DEGREE_TO_RADIANS,
      this.modelMaxRotation
    );
    this.onAxisRotation.z = Math.min(
      this.roll * DEGREE_TO_RADIANS,
      this.modelMaxRotation
    );
  }

  public getVelocity(): number {
    return this.velocity;
  }

  public getPitch(): number {
    return this.rotationVector.x;
  }

  public getRoll(): number {
    return this.rotationVector.z;
  }

  public getYaw(): number {
    return this.rotationVector.y;
  }

  public getPitchRad(): number {
    return this.rotationVector.x * DEGREE_TO_RADIANS;
  }

  public getRollRad(): number {
    return this.rotationVector.z * DEGREE_TO_RADIANS;
  }

  public getYawRad(): number {
    return this.rotationVector.y * DEGREE_TO_RADIANS;
  }

  public getPitchOnAxis(): number {
    return this.onAxisRotation.x;
  }

  public getRollOnAxis(): number {
    return -this.onAxisRotation.z;
  }

  public getYawOnAxis(): number {
    return -this.onAxisRotation.y;
  }
}
