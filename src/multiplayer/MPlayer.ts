import * as Colyseus from 'colyseus.js';
import { Vector3, Object3D, Quaternion, Matrix4, Euler } from 'three';
import { Engine } from '../engine/Engine';
import { RoomAvailable } from 'colyseus.js/lib/Room';

export class MPlayer implements Engine {
  private isHost: boolean;
  private client: Colyseus.Client;
  private room: Colyseus.Room;
  private readonly ROOM_ID = 'state_handler';
  private tieFighter: Object3D;
  private enemyTieFighter: Object3D;
  private enemyPosition: Vector3;
  private enemyRotation: Vector3;
  private onRoomReadyCallback: any;

  constructor(
    onRoomReadyCallback: any,
    fighter: Object3D,
    enemyFighter: Object3D
  ) {
    this.tieFighter = fighter;
    this.enemyTieFighter = enemyFighter;
    this.enemyPosition = enemyFighter.position.clone();
    this.onRoomReadyCallback = onRoomReadyCallback;

    this.client = new Colyseus.Client('ws://192.168.1.9:2567');
    this.createOrJoinRoom();
  }

  private createOrJoinRoom() {
    this.client.getAvailableRooms(this.ROOM_ID, (rooms, err) => {
      if (err) console.error(err);
      const room = rooms.length > 0 ? rooms[0] : null;

      if (!room) {
        console.log('ROOM NOT FOUND, CREATING NEW');
        this.room = this.client.join(this.ROOM_ID, { create: true });
        this.isHost = true;
      } else {
        console.log('ROOM FOUND');
        this.room = this.client.join(this.ROOM_ID);
        this.isHost = false;
      }

      let self = this;
      this.room.onJoin.add(() => {
        this.onRoomJoin(self);
      });
      this.room.onLeave.add(() => {
        this.onRoomLeave(self);
      });

      this.room.listen('players/:id/:attr', (change: Colyseus.DataChange) => {
        if (self.room.sessionId != change.path.id) {
          console.log(self.room.sessionId, change.value);
          console.log({ change });
          if (change.path.attr == 'x') {
            self.updateEnemeyPos(change.value, null, null);
          } else if (change.path.attr == 'y') {
            self.updateEnemeyPos(null, change.value, null);
          } else if (change.path.attr == 'z') {
            self.updateEnemeyPos(null, null, change.value);
          } else if (change.path.attr == 'rx') {
            self.updateEnemeyRot(change.value, null, null);
          } else if (change.path.attr == 'ry') {
            self.updateEnemeyRot(null, change.value, null);
          } else if (change.path.attr == 'rz') {
            self.updateEnemeyRot(null, null, change.value);
          }
          let local = new Vector3(),
            other = new Vector3();
          this.tieFighter.getWorldPosition(local);
          this.enemyTieFighter.getWorldPosition(other);
          console.log(local, other);
        }
      });
    });
  }

  private onRoomJoin(self: MPlayer) {
    if (self.onRoomReadyCallback) self.onRoomReadyCallback();
    console.log('joined', self.room.sessionId);
  }

  private onRoomLeave(self: MPlayer) {
    console.log(self.room.id);
    console.log('left room');
  }

  private updateEnemeyPos(x?: number, y?: number, z?: number) {
    if (x) this.enemyPosition.x = x;
    if (y) this.enemyPosition.y = y;
    if (z) this.enemyPosition.z = z;
  }

  private updateEnemeyRot(x?: number, y?: number, z?: number) {
    if (x) this.enemyTieFighter.rotation.x = x;
    if (y) this.enemyTieFighter.rotation.y = y;
    if (z) this.enemyTieFighter.rotation.z = z;
  }

  update(delta: number): void {
    this.tieFighter.matrixAutoUpdate && this.tieFighter.updateMatrix();
    this.tieFighter.parent.updateMatrixWorld(false);
    let position = new Vector3();
    this.tieFighter.getWorldPosition(position);
    this.room.send({
      position,
    });

    // const rotMat = new Matrix4();
    // this.tieFighter.matrixWorld.extractRotation(rotMat);
    // const euler = new Euler();
    // euler.setFromRotationMatrix(rotMat);
    // this.room.send({
    //   rotation: {
    //     x: euler.x,
    //     y: euler.y,
    //     z: euler.z,
    //   },
    // });
    // let direction = new Vector3();
    // this.tieFighter.getWorldDirection(direction);
    // this.room.send({
    //   rotation: {
    //     x: direction.x,
    //     y: direction.y,
    //     z: direction.z,
    //   },
    // });

    // update enemy position
    console.log({ delta }, 'Lerping enemy position');
    // let lerped = this.enemyTieFighter.position.lerpVectors(
    //   this.enemyTieFighter.position,
    //   this.enemyPosition,
    //   delta * 7
    // );
    this.enemyTieFighter.position.set(
      this.enemyPosition.x,
      this.enemyPosition.y,
      this.enemyPosition.z
    );
  }
}
