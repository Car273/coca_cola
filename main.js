import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// 1. Escena, Cámara y Renderizador
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);

// 2. Generar Entorno de Iluminación PBR (Solución para sombras negras/materiales oscuros)
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

// 3. Luces direccionales de apoyo
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
dirLight.position.set(5, 10, 7.5);
scene.add(dirLight);

// 4. Controles
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 5. Carga del Modelo GLB con Auto-Escala y Auto-Cámara
const loader = new GLTFLoader();

loader.load(
  './cocCoLatic.glb',
  (gltf) => {
    const model = gltf.scene;

    // Calcular el cuadro delimitador (Bounding Box) del modelo
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Reubicar el modelo en el origen (0,0,0)
    model.position.x += (model.position.x - center.x);
    model.position.y += (model.position.y - center.y);
    model.position.z += (model.position.z - center.z);

    scene.add(model);

    // Ajustar la cámara automáticamente al tamaño del objeto
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 2.5; // Distancia de resguardo

    camera.position.set(0, maxDim / 4, cameraZ);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    controls.update();

    console.log('Modelo cargado correctamente');
  },
  (xhr) => {
    console.log(`Cargando: ${((xhr.loaded / xhr.total) * 100).toFixed(1)}%`);
  },
  (error) => {
    console.error('Error al cargar el archivo GLB:', error);
  }
);

// 6. Redimensionamiento
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 7. Loop de Animación
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();