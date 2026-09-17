import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

const MODEL_URL = './models/Happy Idle.fbx';
const CHARACTER_HEIGHT = 1.75;
const CAMERA_FOV = 30;
const CAMERA_MARGIN = 1.15;
const BASE_YAW = 0.35;
const COLOR_LIME = 0xd6e414;
const COLOR_TEAL = 0x07575b;
const COLOR_DEEP = 0x0a0530;
const COLOR_BONE = 0xe7e7d6;

const toStandardMaterial = (source) => new THREE.MeshStandardMaterial({
  // los materiales del FBX son teal oscuro y sin textura: se aclaran hacia el hueso del sitio
  color: source.color ? source.color.clone().lerp(new THREE.Color(COLOR_BONE), 0.72) : new THREE.Color(COLOR_BONE),
  map: source.map ?? null,
  roughness: 0.72,
  metalness: 0.08,
  emissive: new THREE.Color(COLOR_TEAL),
  emissiveIntensity: 0.45
});

export async function mountCharacterStage(host) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100);
  const distance = (CHARACTER_HEIGHT / 2) / Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2)) * CAMERA_MARGIN;
  camera.position.set(0, 0, distance);

  scene.add(new THREE.HemisphereLight(COLOR_TEAL, COLOR_DEEP, 2));

  const rimLight = new THREE.DirectionalLight(COLOR_LIME, 3);
  rimLight.position.set(-2, 1.5, -2.5);
  scene.add(rimLight);

  const keyLight = new THREE.DirectionalLight(COLOR_BONE, 1.6);
  keyLight.position.set(1.5, 1.2, 2.5);
  scene.add(keyLight);

  const resize = () => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  new ResizeObserver(resize).observe(host);
  resize();
  host.appendChild(renderer.domElement);

  const model = await new FBXLoader().loadAsync(encodeURI(MODEL_URL));

  model.traverse((child) => {
    if (!child.isMesh) return;
    // el bounding box del FBX no sigue al esqueleto, sin esto el mesh desaparece al animarse
    child.frustumCulled = false;
    child.material = Array.isArray(child.material)
      ? child.material.map(toStandardMaterial)
      : toStandardMaterial(child.material);
  });

  const mixer = new THREE.AnimationMixer(model);
  const clip = model.animations[0];
  const action = clip ? mixer.clipAction(clip) : null;
  if (action) {
    action.play();
    mixer.update(0);
  }

  // la caja del FBX corresponde al bind pose y no a la pose animada, que es mas baja:
  // se mide sobre los huesos ya posados por el clip
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3();
  const bonePosition = new THREE.Vector3();
  model.traverse((child) => {
    if (child.isBone) bounds.expandByPoint(child.getWorldPosition(bonePosition));
  });

  const scale = CHARACTER_HEIGHT / bounds.getSize(new THREE.Vector3()).y;
  const center = bounds.getCenter(new THREE.Vector3());
  model.scale.setScalar(scale);
  model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

  const pivot = new THREE.Group();
  pivot.add(model);
  pivot.rotation.y = BASE_YAW;
  scene.add(pivot);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clock = new THREE.Clock();
  let yaw = 0;
  let targetYaw = 0;

  if (reduceMotion) {
    // pose fija: adelanta el clip para no quedarse en la pose de bind
    mixer.setTime(0.4);
    renderer.render(scene, camera);
  } else {
    const screen = host.closest('.screen');
    screen.addEventListener('mousemove', (event) => {
      const rect = screen.getBoundingClientRect();
      targetYaw = ((event.clientX - rect.left) / rect.width - 0.5) * 0.8;
    });
    screen.addEventListener('mouseleave', () => {
      targetYaw = 0;
    });

    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();
      if (action) mixer.update(delta);
      yaw += (targetYaw - yaw) * Math.min(1, delta * 3.5);
      pivot.rotation.y = BASE_YAW + yaw;
      renderer.render(scene, camera);
    });
  }

  host.querySelector('.character-status')?.remove();

  return { clips: model.animations.map((item) => item.name) };
}
