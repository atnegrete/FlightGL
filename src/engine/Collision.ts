import { Mesh, Object3D, MeshPhongMaterial, Geometry, Raycaster } from 'three';
import { Engine } from './Engine';

export class Collision implements Engine {
  private enviromentMeshList: Mesh[];

  private mesh: Mesh;

  private collisionDetectionTimer = 0;

  private collisionDetectionThreshhold = 0.05;

  public setMesh(mesh: Mesh): void {
    this.mesh = mesh;
  }

  public setEnviromentMeshList(enviromentMeshList: Mesh[]): void {
    this.enviromentMeshList = enviromentMeshList;
  }

  update(delta: number): void {
    // if (this.collisionDetectionTimer < this.collisionDetectionThreshhold) {
    //   this.collisionDetectionTimer += delta;
    //   return;
    // }

    const meshPosition = this.mesh.position.clone();
    const meshGeometry = <Geometry> this.mesh.geometry;

    for (let i = 0; i < meshGeometry.vertices.length; i++) {
      const vertexLocal = meshGeometry.vertices[i].clone();
      const vertexGlobal = vertexLocal.applyMatrix4(this.mesh.matrix);
      const directionVector = vertexGlobal.sub(this.mesh.position);

      const ray = new Raycaster(
        meshPosition,
        directionVector.clone().normalize()
      );
      const collision = ray.intersectObjects(this.enviromentMeshList);
      if (collision.length > 0 && collision[0].distance < directionVector.length()) {
        console.log("hit");
      }

      this.collisionDetectionTimer = 0;
    }
  }
}
