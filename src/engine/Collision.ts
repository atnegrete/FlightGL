import { Mesh, Object3D, MeshPhongMaterial, Geometry, Raycaster, Vector3 } from 'three';
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
    let position = new Vector3();
    this.mesh.getWorldPosition(position);

    const meshGeometry = <Geometry> this.mesh.geometry;

    for (let i = 0; i < meshGeometry.vertices.length; i++) {
      const vertexLocal = meshGeometry.vertices[i].clone();
      const vertexGlobal = vertexLocal.applyMatrix4(this.mesh.matrixWorld);
      const directionVector = vertexGlobal.sub(position);

      const ray = new Raycaster(
        position,
        directionVector.clone().normalize()
      );
      const collision = ray.intersectObjects(this.enviromentMeshList);
      if (collision.length > 0 && collision[0].distance < 1000) {
        console.log("HIT");
      }
    }
  }
}
