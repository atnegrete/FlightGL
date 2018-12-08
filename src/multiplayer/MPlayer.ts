import * as Colyseus from 'colyseus.js';
import { Vector3, Object3D, Quaternion } from 'three';
import { Engine } from '../engine/Engine';
import { RoomAvailable } from 'colyseus.js/lib/Room';

export class MPlayer implements Engine {
  private isHost: boolean;
  private client: Colyseus.Client;
  private room: Colyseus.Room;
  private readonly ROOM_ID = 'state_handler';
  private tieFighter: Object3D;
  private enemyTieFighter: Object3D;
  private onRoomReadyCallback: any;

  constructor(
    onRoomReadyCallback: any,
    fighter: Object3D,
    enemyFighter: Object3D
  ) {
    this.tieFighter = fighter;
    this.enemyTieFighter = enemyFighter;
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
            self.updateEnemeyPos(change.value.x, null, null);
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
    if (x) this.enemyTieFighter.position.x = x;
    if (y) this.enemyTieFighter.position.y = y;
    if (z) this.enemyTieFighter.position.z = z;
  }

  private updateEnemeyRot(x?: number, y?: number, z?: number) {
    if (x) this.enemyTieFighter.rotation.x = x;
    if (y) this.enemyTieFighter.rotation.y = y;
    if (z) this.enemyTieFighter.rotation.z = z;
  }

  private onStateChange(self: MPlayer, data: any) {
    console.log('room id:', self.room.id);
    console.log('client id:', self.client.id);
    debugger;

    // update position of other tie fighter
    if (data.players) {
      Object.keys(data.players).forEach(key => {
        if (key != self.room.id) {
          const [x, y, z] = data.players[key];
          if (x && y && z) this.tieFighter.position.set(x, y, z);
          console.log('updated other:', x, y, z);
        }
      });
    }
    console.log('updates:', data, self.room.state);
  }

  private onDataChange(self: MPlayer, change: Colyseus.DataChange) {
    console.log('onDataChange:', { change });
    if (change.operation === 'add') {
      console.log('new player added to the state');
      console.log('player id:', change.path.id);
      console.log('player data:', change.value);
    } else if (change.operation === 'remove') {
      console.log('player has been removed from the state');
      console.log('player id:', change.path.id);
    }
  }

  private onOtherPlayerChange(self: MPlayer, change: Colyseus.DataChange) {
    console.log(change.operation); // => "add" | "remove" | "replace"
    console.log(change.path.attribute, 'has been changed');
    console.log(change.path.id);
    console.log(change.value);
    const path = change.path.attribute;
    if (path['position']) {
      const position = change.value;
    }
  }

  update(delta: number): void {
    let position = new Vector3();
    this.tieFighter.getWorldPosition(position);
    this.room.send({
      position,
    });

    let rotation = new Quaternion();
    this.tieFighter.getWorldQuaternion(rotation);

    rotation.x = this.tieFighter.rotation.x;
    rotation.y = this.tieFighter.rotation.y;
    rotation.z = this.tieFighter.rotation.z;

    this.room.send({
      rotation,
    });
  }
}
