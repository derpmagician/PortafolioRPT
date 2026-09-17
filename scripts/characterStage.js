import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const MODEL_URL = './models/character.glb';
const CHARACTER_HEIGHT = 1.75;
const CAMERA_FOV = 30;
const CAMERA_MARGIN = 1.15;
const BASE_YAW = 0.35;
const GESTURE_FADE = 0.5;
const GESTURE_HOLD_MS = 3000;
const COLOR_LIME = 0xd6e414;
const COLOR_TEAL = 0x07575b;
const COLOR_DEEP = 0x0a0530;
const COLOR_BONE = 0xe7e7d6;

const toStandardMaterial = (source) => new THREE.MeshStandardMaterial({
  // el modelo viene sin textura y en teal oscuro: se aclara hacia el hueso del sitio
  color: source.color ? source.color.clone().lerp(new THREE.Color(COLOR_BONE), 0.72) : new THREE.Color(COLOR_BONE),
  map: source.map ?? null,
  roughness: 0.72,
  metalness: 0.08,
  emissive: new THREE.Color(COLOR_TEAL),
  emissiveIntensity: 0.45,
  // el modelo va espejado en X, lo que invierte el sentido de las caras
  side: THREE.DoubleSide
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

  const gltf = await new GLTFLoader().loadAsync(encodeURI(MODEL_URL));
  const model = gltf.scene;

  model.traverse((child) => {
    if (!child.isMesh) return;
    // el bounding box no sigue al esqueleto, sin esto el mesh desaparece al animarse
    child.frustumCulled = false;
    child.material = Array.isArray(child.material)
      ? child.material.map(toStandardMaterial)
      : toStandardMaterial(child.material);
  });

  const mixer = new THREE.AnimationMixer(model);
  const idleClip = gltf.animations.find((clip) => clip.name === 'idle') ?? null;
  const gestureClip = gltf.animations.find((clip) => clip.name === 'gesture') ?? null;

  const idleAction = idleClip ? mixer.clipAction(idleClip) : null;
  const gestureAction = gestureClip ? mixer.clipAction(gestureClip) : null;

  if (idleAction) {
    idleAction.play();
    mixer.update(0);
  }

  if (gestureAction) {
    gestureAction.setLoop(THREE.LoopOnce, 1);
    gestureAction.clampWhenFinished = true;
  }

  // la caja del archivo corresponde al bind pose y no a la pose animada, que es mas
  // baja. Se mide sobre la malla ya posada por el clip, y no sobre los huesos, porque
  // al exportar se pierden los huesos terminales y la caja encogeria
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3();
  model.traverse((child) => {
    if (!child.isSkinnedMesh) return;
    child.computeBoundingBox();
    bounds.union(child.boundingBox.clone().applyMatrix4(child.matrixWorld));
  });

  const scale = CHARACTER_HEIGHT / bounds.getSize(new THREE.Vector3()).y;
  const center = bounds.getCenter(new THREE.Vector3());
  model.scale.setScalar(scale);
  model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

  const pivot = new THREE.Group();
  pivot.add(model);
  // el clip de rodillas senala con el brazo derecho hacia la izquierda de pantalla;
  // espejar en X lo hace senalar hacia el cubo sin girarle la espalda al visitante
  pivot.scale.x = -1;
  pivot.rotation.y = BASE_YAW;
  scene.add(pivot);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clock = new THREE.Clock();
  let yaw = 0;
  let targetYaw = 0;
  let gesturing = false;

  const backToIdle = () => {
    if (!gesturing || !gestureAction) return;
    gesturing = false;

    if (reduceMotion) {
      gestureAction.setEffectiveWeight(0);
      idleAction.setEffectiveWeight(1);
      mixer.update(0);
      renderer.render(scene, camera);
    } else {
      // three.js deshabilita una accion cuando su fade-out termina en peso 0, y
      // fadeIn no la reactiva: sin esto el personaje se queda en la pose de bind
      idleAction.enabled = true;
      gestureAction.crossFadeTo(idleAction, GESTURE_FADE, false);
    }
  };

  const playGesture = () => {
    if (gesturing || !gestureAction || !idleAction) return;
    gesturing = true;

    gestureAction.reset().play();

    if (reduceMotion) {
      // sin bucle de render: se salta a la pose y se vuelve por temporizador
      gestureAction.time = gestureClip.duration * 0.8;
      gestureAction.setEffectiveWeight(1);
      idleAction.setEffectiveWeight(0);
      mixer.update(0);
      renderer.render(scene, camera);
      setTimeout(backToIdle, GESTURE_HOLD_MS);
    } else {
      idleAction.crossFadeTo(gestureAction, GESTURE_FADE, false);
    }
  };

  mixer.addEventListener('finished', (event) => {
    if (event.action === gestureAction) backToIdle();
  });

  host.addEventListener('click', playGesture);
  host.disabled = !gestureAction;

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
      mixer.update(delta);
      yaw += (targetYaw - yaw) * Math.min(1, delta * 3.5);
      pivot.rotation.y = BASE_YAW + yaw;
      renderer.render(scene, camera);
    });
  }

  host.querySelector('.character-status')?.remove();
}
