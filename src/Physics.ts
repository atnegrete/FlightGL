import { Vector2, Vector3, Quaternion } from 'three';

const DRAG = 0.8;
const DEGREE_TO_RADIANS = 0.0174533;

export class Physics {
  private rotationVector: Vector3 = new Vector3(0, 0, 0);
  private onAxisRotation: Vector3 = new Vector3(0, 0, 0);

  private velocity = -1;
  private readonly modelMaxRotation = 15.0 / 360.0;

  public update(
    dt: number,
    thrust: number,
    roll: number,
    pitch: number,
    yaw: number
  ): void {
    this.updateRotationMatrix(roll, pitch, yaw);
    this.updateVelocity(dt, thrust);
  }

  private clamp(val: number, lower: number, upper: number) {
    return Math.max(Math.min(val, upper), lower);
  }

  private updateVelocity(delta: number, thrust: number): void {
    if (thrust == 0) this.velocity += DRAG;
    else this.velocity += thrust;

    this.velocity = Math.min(this.velocity, -1);
    this.velocity = Math.max(this.velocity, -100);
  }

  private updateRotationMatrix(roll: number, pitch: number, yaw: number) {
    const rollQuaternion = new Quaternion();
    rollQuaternion.setFromAxisAngle(new Vector3(0, 0, 1), roll);

    const pitchQuaternion = new Quaternion();
    pitchQuaternion.setFromAxisAngle(new Vector3(1, 0, 0), pitch);

    const yawQuaternion = new Quaternion();
    yawQuaternion.setFromAxisAngle(new Vector3(0, 1, 0), yaw);

    const totalQuaternion = rollQuaternion
      .multiply(pitchQuaternion)
      .multiply(yawQuaternion);

    this.rotationVector.x = totalQuaternion.x;
    this.rotationVector.y = totalQuaternion.y;
    this.rotationVector.z = totalQuaternion.z;

    this.onAxisRotation.x = Math.min(
      pitch * DEGREE_TO_RADIANS,
      this.modelMaxRotation
    );
    this.onAxisRotation.y = Math.min(
      yaw * DEGREE_TO_RADIANS,
      this.modelMaxRotation
    );
    this.onAxisRotation.z = Math.min(
      roll * DEGREE_TO_RADIANS,
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
