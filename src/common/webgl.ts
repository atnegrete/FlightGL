import { Scene, WebGLRenderer, DirectionalLight, PerspectiveCamera, Mesh, CubeGeometry, MeshBasicMaterial } from "three";
import { DIRECTIONAL_LIGHT_COLOR } from "./colors";

export const SCENE = new Scene();
export const LIGHT = new DirectionalLight(
    DIRECTIONAL_LIGHT_COLOR,
    1
);

export const RENDERRER = new WebGLRenderer({
    antialias: true,
    canvas: <HTMLCanvasElement>document.getElementById('mainCanvas'),
});
export const CAMERA = new PerspectiveCamera(
    60,
    innerWidth / innerHeight,
    0.1,
    100000
);

export const HIT_BOX = new Mesh(
    new CubeGeometry(100, 100, 100, 1, 1, 1),
    new MeshBasicMaterial({ color: 0xff0000, wireframe: true })
);